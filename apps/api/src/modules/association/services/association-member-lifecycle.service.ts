import { AssociationLearningContentRecipientService } from "@association/services/association-learning-content-recipient.service";
import { AssociationRequirementAssignmentService } from "@association/services/association-requirement-assignment.service";
import { AssociationNotificationService } from "@association/services/association-notification.service";
import { AssociationMemberStatus } from "@prisma/client";
import { AssociationMessageType } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { GROUP_ADDED_ON_ACTIVATION } from "@association/enums/association-notification.enum";
import { occurrenceKeys } from "@association/enums/association-notification.enum";
import { Injectable } from "@nestjs/common";

import { type LifecycleNotification } from "@association/services/association-notification.service";

export type LifecycleMember = {
  id: string;
  associationId: string;
  userId: string;
  groupId: string | null;
};

@Injectable()
export class AssociationMemberLifecycleService {
  constructor(
    private readonly notifications: AssociationNotificationService,
    private readonly assignments: AssociationRequirementAssignmentService,
    private readonly learningRecipients: AssociationLearningContentRecipientService,
  ) {}

  async announceActivation(
    tx: Prisma.TransactionClient,
    member: LifecycleMember,
    now = new Date(),
  ) {
    const welcome: LifecycleNotification = {
      associationId: member.associationId,
      memberId: member.id,
      recipientUserId: member.userId,
      messageType: AssociationMessageType.WELCOME,
      occurrenceKey: occurrenceKeys.welcome(member.id),
      subject: {},
    };

    const group = await this.groupAdded(
      tx,
      member,
      member.groupId,
      GROUP_ADDED_ON_ACTIVATION,
    );

    await this.notifications.record(
      tx,
      group ? [welcome, group] : [welcome],
      now,
    );
    await this.assignments.announce(tx, { memberIds: [member.id] }, now);
    await this.learningRecipients.announce(tx, { memberIds: [member.id] }, now);
  }

  async moveToGroup(
    tx: Prisma.TransactionClient,
    member: { id: string; associationId: string },
    groupId: string,
    now = new Date(),
  ) {
    const moved = await tx.associationMember.updateMany({
      where: {
        id: member.id,
        associationId: member.associationId,
        OR: [{ groupId: null }, { groupId: { not: groupId } }],
      },
      data: { groupId },
    });

    if (moved.count !== 1) return false;

    const current = await tx.associationMember.findUniqueOrThrow({
      where: { id: member.id },
      select: { id: true, associationId: true, userId: true, status: true },
    });

    if (current.status !== AssociationMemberStatus.ACTIVE) return true;

    const notification = await this.groupAdded(
      tx,
      { ...current, groupId },
      groupId,
      String(now.getTime()),
    );
    if (notification) await this.notifications.record(tx, [notification], now);

    return true;
  }

  private async groupAdded(
    tx: Prisma.TransactionClient,
    member: LifecycleMember,
    groupId: string | null,
    occurrence: string,
  ): Promise<LifecycleNotification | null> {
    if (!groupId) return null;

    const group = await tx.associationGroup.findFirst({
      where: {
        id: groupId,
        associationId: member.associationId,
        isActive: true,
      },
      select: { id: true },
    });
    if (!group) return null;

    return {
      associationId: member.associationId,
      memberId: member.id,
      recipientUserId: member.userId,
      messageType: AssociationMessageType.GROUP_ADDED,
      occurrenceKey: occurrenceKeys.groupAdded(member.id, groupId, occurrence),
      subject: { groupId },
    };
  }
}
