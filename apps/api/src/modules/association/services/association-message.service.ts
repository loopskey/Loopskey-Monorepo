import { AppLanguage, AssociationMessageDeliveryState } from "@prisma/client";
import { AssociationMessageType, Prisma } from "@prisma/client";
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import { type ProfessionalComplianceApi } from "@professional/public/professional-compliance-api";
import { PROFESSIONAL_COMPLIANCE_API } from "@professional/public/professional-compliance-api";
import { AssociationAttentionService } from "@association/services/association-attention.service";
import { SECTION_BY_MESSAGE_TYPE } from "@association/enums/association-attention.enum";
import { AssociationMessageSkipReason } from "@association/enums/association-attention.enum";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { buildAssociationMessageEmail } from "@mail/association-message.template";
import { messageContextOf } from "@association/utils/association-message-context.util";
import { messageTemplateInput } from "@association/utils/association-message-context.util";
import { readMessageContext } from "@association/utils/association-message-context.util";
import { ASSOCIATION_MESSAGE_TEMPLATE_VERSION } from "@mail/association-message.template";
import { type IdentityProfileApi } from "@user/public/identity-profile-api";
import { IDENTITY_PROFILE_API } from "@user/public/identity-profile-api";
import { type TAssociationMessageInput } from "@mail/mail-service.type";
import { type TAssociationUser } from "@association/types/association-service.types";
import { type AttentionRow } from "@association/types/association-attention.types";
import { type MessageAudience } from "@association/types/association-attention.types";
import { type MessageSkip } from "@association/types/association-attention.types";
import { requestContext } from "@infrastructure/observability/request-context";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@prisma/prisma.service";

export const ASSOCIATION_MESSAGE_EVENT = "association.message.requested.v1";

export const ASSOCIATION_MESSAGE_AGGREGATE = "AssociationMessageDelivery";

export const MESSAGE_COOLDOWN_DAYS = 7;

export const MESSAGE_BATCH_MAX = 500;

const MESSAGE_CHUNK_SIZE = 50;

const DAY_MS = 24 * 60 * 60 * 1000;

const HISTORY_TAKE_DEFAULT = 25;

const HISTORY_TAKE_MAX = 100;

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";

export const cooldownBucketFor = (at: Date, days = MESSAGE_COOLDOWN_DAYS) =>
  Math.floor(at.getTime() / (days * DAY_MS));

type Recipient = {
  row: AttentionRow;
  language: AppLanguage;
};

@Injectable()
export class AssociationMessageService {
  private readonly logger = new Logger(AssociationMessageService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly outbox: OutboxService,
    private readonly access: AssociationAccessService,
    private readonly attention: AssociationAttentionService,
    @Inject(IDENTITY_PROFILE_API)
    private readonly identity: IdentityProfileApi,
    @Inject(PROFESSIONAL_COMPLIANCE_API)
    private readonly professional: ProfessionalComplianceApi,
  ) {}

  async preview(
    user: TAssociationUser,
    messageType: AssociationMessageType,
    audience: MessageAudience,
  ) {
    const association = await this.access.requireOwned(user);
    const resolved = await this.resolve(user, messageType, audience);

    const representative = resolved.eligible.at(0);

    const rendered = representative
      ? buildAssociationMessageEmail(
          this.templateInput(association.name, representative, messageType),
        )
      : null;

    return {
      messageType,
      subject: rendered?.subject ?? null,
      body: rendered?.text ?? null,
      language: representative?.language ?? null,
      recipientName: representative?.row.fullName ?? null,
      recipientCount: resolved.eligible.length,
      skippedCount: resolved.skipped.length,
      skipped: resolved.skipped,
    };
  }

  async send(
    user: TAssociationUser,
    messageType: AssociationMessageType,
    audience: MessageAudience,
  ) {
    const association = await this.access.requireOwned(user);
    const resolved = await this.resolve(user, messageType, audience);

    if (resolved.eligible.length === 0 && resolved.skipped.length === 0)
      throw new BadRequestException({
        code: AssociationMessageCode.MESSAGE_NO_RECIPIENTS,
        message: "No member in this list can be messaged.",
      });

    const now = new Date();
    const bucket = cooldownBucketFor(now);
    const audienceJson = {
      section: audience.section,
      groupId: audience.groupId ?? null,
      memberIds: audience.memberIds ?? null,
    } as unknown as Prisma.InputJsonValue;

    const skipped = [...resolved.skipped];
    let acceptedCount = 0;

    for (const chunk of this.chunked(resolved.eligible)) {
      try {
        acceptedCount += await this.writeBatch({
          chunk,
          bucket,
          messageType,
          audienceJson,
          associationId: association.id,
          associationName: association.name,
        });
      } catch (error) {
        if (!isUniqueViolation(error)) throw error;

        for (const recipient of chunk) {
          try {
            acceptedCount += await this.writeBatch({
              bucket,
              messageType,
              audienceJson,
              chunk: [recipient],
              associationId: association.id,
              associationName: association.name,
            });
          } catch (inner) {
            if (!isUniqueViolation(inner)) throw inner;

            skipped.push({
              memberId: recipient.row.memberId,
              fullName: recipient.row.fullName,
              reason: AssociationMessageSkipReason.COOLDOWN,
            });
          }
        }
      }
    }

    this.logger.log("Association message batch accepted", {
      messageType,
      acceptedCount,
      associationId: association.id,
      skippedCount: skipped.length,
    });

    return {
      messageType,
      acceptedCount,
      skipped,
      skippedCount: skipped.length,
    };
  }

  async history(
    user: TAssociationUser,
    page?: { take?: number | null; cursor?: string | null },
    associationId?: string,
  ) {
    const association = await this.access.requireReadable(user, associationId);
    const take = Math.min(page?.take ?? HISTORY_TAKE_DEFAULT, HISTORY_TAKE_MAX);
    const where = { associationId: association.id };

    const [rows, totalCount] = await Promise.all([
      this.prisma.associationMessageDelivery.findMany({
        where,
        take: take + 1,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        ...(page?.cursor ? { cursor: { id: page.cursor }, skip: 1 } : {}),
        select: {
          id: true,
          state: true,
          sentAt: true,
          language: true,
          createdAt: true,
          skipReason: true,
          messageType: true,
          failureReason: true,
          templateVersion: true,
          member: {
            select: {
              id: true,
              memberNumber: true,
              user: { select: { fullName: true, email: true } },
            },
          },
        },
      }),
      this.prisma.associationMessageDelivery.count({ where }),
    ]);

    const hasNextPage = rows.length > take;
    const items = hasNextPage ? rows.slice(0, take) : rows;

    return {
      totalCount,
      items: items.map((row) => ({
        id: row.id,
        state: row.state,
        sentAt: row.sentAt,
        language: row.language,
        createdAt: row.createdAt,
        skipReason: row.skipReason,
        messageType: row.messageType,
        failureReason: row.failureReason,
        templateVersion: row.templateVersion,
        memberId: row.member.id,
        memberNumber: row.member.memberNumber,
        fullName: row.member.user.fullName,
        email: row.member.user.email,
      })),
      pageInfo: {
        hasNextPage,
        nextCursor: hasNextPage ? (items.at(-1)?.id ?? null) : null,
      },
    };
  }

  templateInput(
    associationName: string,
    recipient: Recipient,
    messageType: AssociationMessageType,
  ): TAssociationMessageInput {
    return messageTemplateInput({
      messageType,
      associationName,
      language: recipient.language,
      dashboardUrl: this.dashboardUrl(),
      memberName: recipient.row.fullName ?? recipient.row.email ?? "member",
      appName: this.config.get<string>("APP_NAME", "LoopsKey"),
      supportEmail: this.config.get<string>(
        "SUPPORT_EMAIL",
        "support@loopskey.com",
      ),
      context: readMessageContext(messageContextOf(recipient.row)),
    });
  }

  private async resolve(
    user: TAssociationUser,
    messageType: AssociationMessageType,
    audience: MessageAudience,
  ) {
    const section = SECTION_BY_MESSAGE_TYPE[messageType];

    if (!section || section !== audience.section)
      throw new BadRequestException({
        code: AssociationMessageCode.MESSAGE_TYPE_UNKNOWN,
        message: "That message does not belong to this list.",
      });

    const association = await this.access.requireOwned(user);
    const rows = await this.attention.rowsFor(user, section);

    const inSection = new Map(rows.map((row) => [row.memberId, row]));

    const selected = audience.memberIds?.length
      ? audience.memberIds
      : rows
          .filter(
            (row) => !audience.groupId || row.groupId === audience.groupId,
          )
          .map((row) => row.memberId);

    if (selected.length > MESSAGE_BATCH_MAX)
      throw new BadRequestException({
        code: AssociationMessageCode.MESSAGE_BATCH_TOO_LARGE,
        message: `A single send covers at most ${MESSAGE_BATCH_MAX} members.`,
      });

    const skipped: MessageSkip[] = [];
    const candidates: AttentionRow[] = [];

    for (const memberId of selected) {
      const row = inSection.get(memberId);

      if (!row) {
        skipped.push({
          memberId,
          fullName: null,
          reason: AssociationMessageSkipReason.NOT_IN_LIST,
        });
        continue;
      }

      candidates.push(row);
    }

    const [recipients, languages, recent] = await Promise.all([
      this.identity.recipients(candidates.map((row) => row.userId)),
      this.professional.languagesForOwners(candidates.map((row) => row.userId)),
      this.prisma.associationMessageDelivery.findMany({
        where: {
          messageType,
          associationId: association.id,
          memberId: { in: candidates.map((row) => row.memberId) },
          state: { not: AssociationMessageDeliveryState.SKIPPED },
          createdAt: {
            gte: new Date(Date.now() - MESSAGE_COOLDOWN_DAYS * DAY_MS),
          },
        },
        select: { memberId: true },
      }),
    ]);

    const addressable = new Map(recipients.map((one) => [one.id, one]));
    const spoken = new Map(
      languages.map((one) => [one.userId, one.language ?? null]),
    );
    const cooling = new Set(recent.map((one) => one.memberId));

    const eligible: Recipient[] = [];

    for (const row of candidates) {
      const identity = addressable.get(row.userId);

      if (!identity?.isActive) {
        skipped.push({
          memberId: row.memberId,
          fullName: row.fullName,
          reason: AssociationMessageSkipReason.INACTIVE_ACCOUNT,
        });
        continue;
      }

      if (!identity.email || !identity.emailVerifiedAt) {
        skipped.push({
          memberId: row.memberId,
          fullName: row.fullName,
          reason: AssociationMessageSkipReason.NO_VERIFIED_EMAIL,
        });
        continue;
      }

      if (cooling.has(row.memberId)) {
        skipped.push({
          memberId: row.memberId,
          fullName: row.fullName,
          reason: AssociationMessageSkipReason.COOLDOWN,
        });
        continue;
      }

      eligible.push({
        row: { ...row, email: identity.email, fullName: identity.fullName },
        language:
          spoken.get(row.userId) === AppLanguage.FR
            ? AppLanguage.FR
            : AppLanguage.EN,
      });
    }

    return { eligible, skipped };
  }

  private async writeBatch({
    chunk,
    bucket,
    messageType,
    audienceJson,
    associationId,
  }: {
    chunk: Recipient[];
    bucket: number;
    messageType: AssociationMessageType;
    audienceJson: Prisma.InputJsonValue;
    associationId: string;
    associationName: string;
  }) {
    if (!chunk.length) return 0;

    const correlationId = requestContext.correlationId() ?? undefined;

    return this.prisma.$transaction(async (tx) => {
      for (const recipient of chunk) {
        const delivery = await tx.associationMessageDelivery.create({
          data: {
            associationId,
            messageType,
            cooldownBucket: bucket,
            audience: audienceJson,
            language: recipient.language,
            memberId: recipient.row.memberId,
            context: messageContextOf(
              recipient.row,
            ) as unknown as Prisma.InputJsonValue,
            recipientUserId: recipient.row.userId,
            templateVersion: ASSOCIATION_MESSAGE_TEMPLATE_VERSION,
          },
          select: { id: true },
        });

        await this.outbox.append(
          {
            correlationId,
            eventName: ASSOCIATION_MESSAGE_EVENT,
            aggregateId: delivery.id,
            aggregateType: ASSOCIATION_MESSAGE_AGGREGATE,
            payload: { deliveryId: delivery.id },
          },
          tx,
        );
      }

      return chunk.length;
    });
  }

  private *chunked(recipients: Recipient[]) {
    for (let index = 0; index < recipients.length; index += MESSAGE_CHUNK_SIZE)
      yield recipients.slice(index, index + MESSAGE_CHUNK_SIZE);
  }

  private dashboardUrl() {
    const origin = this.config
      .get<string>("FRONTEND_URL", "http://localhost:3000")
      .replace(/\/+$/, "");

    return `${origin}/dashboard/professional`;
  }
}
