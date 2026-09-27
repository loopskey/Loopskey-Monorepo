import { AssociationMessageDeliveryState, Prisma } from "@prisma/client";
import { AssociationMessageSkipReason } from "@association/enums/association-attention.enum";
import { AssociationMessageType } from "@prisma/client";
import { Injectable, Logger } from "@nestjs/common";
import { LIFECYCLE_EVENT_BY_TYPE } from "@association/enums/association-notification.enum";
import { LIFECYCLE_TEMPLATE_VERSION } from "@association/enums/association-notification.enum";
import { AUTOMATIC_AUDIENCE } from "@association/enums/association-notification.enum";
import { occurrenceKeys } from "@association/enums/association-notification.enum";
import { cooldownBucketFor } from "@association/services/association-message.service";
import { requestContext } from "@infrastructure/observability/request-context";
import { OutboxService } from "@infrastructure/outbox/outbox.service";

import { type AutomaticMessageType } from "@association/enums/association-notification.enum";
import { type TSendEmailInput } from "@mail/mail-service.type";

export const LIFECYCLE_DELIVERY_AGGREGATE = "AssociationMessageDelivery";

export type LifecycleSubject = {
  groupId?: string;
  requirementId?: string;
  assignmentId?: string;
  learningContentId?: string;
  recipientId?: string;
};

export type LifecycleNotification = {
  associationId: string;
  memberId: string;
  recipientUserId: string;
  messageType: AutomaticMessageType;
  occurrenceKey: string;
  subject: LifecycleSubject;
};

export type InvitationNotification = {
  associationId: string;
  memberId: string;
  recipientUserId: string;
  tokenId: string;
  mail: TSendEmailInput;
};

type DeliverySettings = { suppressAllEmail: boolean; welcomeMessages: boolean };

const DEFAULT_SETTINGS: DeliverySettings = {
  suppressAllEmail: false,
  welcomeMessages: true,
};

const isSuppressed = (
  settings: DeliverySettings,
  messageType: AutomaticMessageType,
) =>
  settings.suppressAllEmail ||
  (messageType === AssociationMessageType.WELCOME && !settings.welcomeMessages);

@Injectable()
export class AssociationNotificationService {
  private readonly logger = new Logger(AssociationNotificationService.name);

  constructor(private readonly outbox: OutboxService) {}

  async record(
    tx: Prisma.TransactionClient,
    notifications: LifecycleNotification[],
    now = new Date(),
  ) {
    if (!notifications.length) return 0;

    const settings = await this.settingsFor(tx, notifications);
    const bucket = cooldownBucketFor(now);

    const rows = await tx.associationMessageDelivery.createManyAndReturn({
      data: notifications.map((notification) => {
        const suppressed = isSuppressed(
          settings.get(notification.associationId) ?? DEFAULT_SETTINGS,
          notification.messageType,
        );

        return {
          associationId: notification.associationId,
          memberId: notification.memberId,
          recipientUserId: notification.recipientUserId,
          messageType: notification.messageType,
          occurrenceKey: notification.occurrenceKey,
          cooldownBucket:
            notification.messageType === AssociationMessageType.WELCOME
              ? bucket
              : null,
          templateVersion: LIFECYCLE_TEMPLATE_VERSION,
          audience: AUTOMATIC_AUDIENCE,
          context: notification.subject,
          state: suppressed
            ? AssociationMessageDeliveryState.SKIPPED
            : AssociationMessageDeliveryState.QUEUED,
          skipReason: suppressed
            ? AssociationMessageSkipReason.EMAIL_SUPPRESSED
            : null,
        };
      }),
      skipDuplicates: true,
      select: { id: true, state: true, occurrenceKey: true },
    });

    const byKey = new Map(
      notifications.map((notification) => [
        notification.occurrenceKey,
        notification,
      ]),
    );
    const correlationId = requestContext.correlationId() ?? undefined;
    let queued = 0;

    for (const row of rows) {
      const notification = row.occurrenceKey
        ? byKey.get(row.occurrenceKey)
        : undefined;
      if (!notification) continue;
      if (row.state !== AssociationMessageDeliveryState.QUEUED) continue;

      await this.outbox.append(
        {
          correlationId,
          eventName: LIFECYCLE_EVENT_BY_TYPE[notification.messageType],
          aggregateType: LIFECYCLE_DELIVERY_AGGREGATE,
          aggregateId: row.id,
          payload: {
            deliveryId: row.id,
            memberId: notification.memberId,
            occurrenceKey: notification.occurrenceKey,
            ...notification.subject,
          },
        },
        tx,
      );
      queued += 1;
    }

    if (rows.length)
      this.logger.log("Association lifecycle notifications recorded", {
        recorded: rows.length,
        queued,
        suppressed: rows.length - queued,
        duplicates: notifications.length - rows.length,
      });

    return rows.length;
  }

  async recordInvitation(
    tx: Prisma.TransactionClient,
    invitation: InvitationNotification,
  ) {
    const [row] = await tx.associationMessageDelivery.createManyAndReturn({
      data: [
        {
          associationId: invitation.associationId,
          memberId: invitation.memberId,
          recipientUserId: invitation.recipientUserId,
          messageType: AssociationMessageType.INVITATION,
          occurrenceKey: occurrenceKeys.invitation(invitation.tokenId),
          cooldownBucket: null,
          templateVersion: LIFECYCLE_TEMPLATE_VERSION,
          audience: AUTOMATIC_AUDIENCE,
          context: {},
        },
      ],
      skipDuplicates: true,
      select: { id: true },
    });

    if (!row) return null;

    await this.outbox.append(
      {
        correlationId: requestContext.correlationId() ?? undefined,
        eventName: LIFECYCLE_EVENT_BY_TYPE[AssociationMessageType.INVITATION],
        aggregateType: LIFECYCLE_DELIVERY_AGGREGATE,
        aggregateId: row.id,
        payload: {
          deliveryId: row.id,
          memberId: invitation.memberId,
          mail: invitation.mail,
        },
      },
      tx,
    );

    return row.id;
  }

  private async settingsFor(
    tx: Prisma.TransactionClient,
    notifications: LifecycleNotification[],
  ) {
    const associationIds = [
      ...new Set(notifications.map((one) => one.associationId)),
    ];

    const rows = await tx.associationSettings.findMany({
      where: { associationId: { in: associationIds } },
      select: {
        associationId: true,
        suppressAllEmail: true,
        welcomeMessages: true,
      },
    });

    return new Map(rows.map((row) => [row.associationId, row]));
  }
}
