import { AssociationLearningContentStatus, Prisma } from "@prisma/client";
import { AssociationNotificationService } from "@association/services/association-notification.service";
import { AssociationAudienceKind } from "@prisma/client";
import { AssociationMemberStatus } from "@prisma/client";
import { occurrenceKeys } from "@association/enums/association-notification.enum";
import { AssociationMessageType } from "@prisma/client";
import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";

import { type AnnouncementScope } from "@association/services/association-requirement-assignment.service";

const BATCH_SIZE = 200;

export const LEARNING_CONTENT_AUDIENCE_CHANGED_EVENT =
  "association.learning-content.audience-changed.v1";

type LearningContentScope = Omit<AnnouncementScope, "requirementId"> & {
  learningContentId?: string;
};

type ClaimedRecipient = {
  id: string;
  learningContentId: string;
  memberId: string;
  userId: string;
  associationId: string;
};

type ContentAudience = {
  id: string;
  associationId: string;
  audienceKind: AssociationAudienceKind;
  targets: { groupId: string | null; memberId: string | null }[];
};

export type RecipientSyncOutcome = {
  targeted: number;
  untargeted: number;
  announced: number;
};

@Injectable()
export class AssociationLearningContentRecipientService {
  private readonly logger = new Logger(
    AssociationLearningContentRecipientService.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: AssociationNotificationService,
  ) {}

  async syncContent(
    learningContentId: string,
    onBatch?: () => Promise<void>,
  ): Promise<RecipientSyncOutcome> {
    const outcome: RecipientSyncOutcome = {
      targeted: 0,
      untargeted: 0,
      announced: 0,
    };

    const content = await this.prisma.associationLearningContent.findUnique({
      where: { id: learningContentId },
      select: {
        id: true,
        status: true,
        associationId: true,
        audienceKind: true,
        targets: { select: { groupId: true, memberId: true } },
      },
    });

    if (content?.status !== AssociationLearningContentStatus.PUBLISHED)
      return outcome;

    const covered = await this.audienceMemberIds(content);
    const coveredSet = new Set(covered);

    for (let index = 0; index < covered.length; index += BATCH_SIZE) {
      const batch = covered.slice(index, index + BATCH_SIZE);
      outcome.announced += await this.prisma.$transaction(async (tx) => {
        await this.target(tx, content.id, batch);
        return this.announce(tx, {
          learningContentId: content.id,
          memberIds: batch,
        });
      });
      outcome.targeted += batch.length;
      await onBatch?.();
    }

    const stale =
      await this.prisma.associationLearningContentRecipient.findMany({
        where: { learningContentId: content.id, isTargeted: true },
        select: { id: true, memberId: true },
      });

    const orphaned = stale
      .filter((recipient) => !coveredSet.has(recipient.memberId))
      .map((recipient) => recipient.id);

    for (let index = 0; index < orphaned.length; index += BATCH_SIZE) {
      const untargeted =
        await this.prisma.associationLearningContentRecipient.updateMany({
          where: { id: { in: orphaned.slice(index, index + BATCH_SIZE) } },
          data: { isTargeted: false, announcedAt: null },
        });
      outcome.untargeted += untargeted.count;
    }

    this.logger.log("Association learning content recipients synchronised", {
      learningContentId: content.id,
      audienceKind: content.audienceKind,
      ...outcome,
    });

    return outcome;
  }

  async syncMember(memberId: string) {
    const member = await this.prisma.associationMember.findUnique({
      where: { id: memberId },
      select: { id: true, associationId: true, groupId: true, status: true },
    });
    if (!member) return 0;

    const contents = await this.prisma.associationLearningContent.findMany({
      where: {
        associationId: member.associationId,
        status: AssociationLearningContentStatus.PUBLISHED,
      },
      select: {
        id: true,
        audienceKind: true,
        targets: { select: { groupId: true, memberId: true } },
      },
    });

    const isEligible = member.status !== AssociationMemberStatus.INACTIVE;
    const coveredIds = contents
      .filter(
        (content) =>
          isEligible &&
          this.covers(content.audienceKind, content.targets, member),
      )
      .map((content) => content.id);

    return this.prisma.$transaction(async (tx) => {
      for (const learningContentId of coveredIds)
        await this.target(tx, learningContentId, [member.id]);

      await tx.associationLearningContentRecipient.updateMany({
        where: {
          memberId: member.id,
          isTargeted: true,
          learningContentId: { notIn: coveredIds },
        },
        data: { isTargeted: false, announcedAt: null },
      });

      return this.announce(tx, { memberIds: [member.id] });
    });
  }

  async syncAssociation(associationId: string) {
    const contents = await this.prisma.associationLearningContent.findMany({
      where: {
        associationId,
        status: AssociationLearningContentStatus.PUBLISHED,
      },
      select: { id: true },
    });

    for (const content of contents) await this.syncContent(content.id);
  }

  async announce(
    tx: Prisma.TransactionClient,
    scope: LearningContentScope,
    now = new Date(),
  ) {
    if (scope.memberIds && !scope.memberIds.length) return 0;

    const conditions = [
      Prisma.sql`recipient."isTargeted" = true`,
      Prisma.sql`recipient."announcedAt" IS NULL`,
      Prisma.sql`content."status" = ${AssociationLearningContentStatus.PUBLISHED}::"AssociationLearningContentStatus"`,
      Prisma.sql`member."status" = ${AssociationMemberStatus.ACTIVE}::"AssociationMemberStatus"`,
      Prisma.sql`content."associationId" = member."associationId"`,
    ];
    if (scope.learningContentId)
      conditions.push(
        Prisma.sql`recipient."learningContentId" = ${scope.learningContentId}`,
      );
    if (scope.memberIds)
      conditions.push(
        Prisma.sql`recipient."memberId" IN (${Prisma.join(scope.memberIds)})`,
      );

    const claimed = await tx.$queryRaw<ClaimedRecipient[]>`
      WITH candidate AS (
        SELECT recipient."id", member."userId", member."associationId"
        FROM "AssociationLearningContentRecipient" AS recipient
        JOIN "AssociationLearningContent" AS content
          ON content."id" = recipient."learningContentId"
        JOIN "AssociationMember" AS member
          ON member."id" = recipient."memberId"
        WHERE ${Prisma.join(conditions, " AND ")}
        ORDER BY recipient."id"
        FOR UPDATE OF recipient
      )
      UPDATE "AssociationLearningContentRecipient" AS recipient
      SET "announcedAt" = ${now}, "updatedAt" = ${now}
      FROM candidate
      WHERE recipient."id" = candidate."id"
        AND recipient."announcedAt" IS NULL
      RETURNING recipient."id", recipient."learningContentId", recipient."memberId",
        candidate."userId", candidate."associationId"`;

    return this.notifications.record(
      tx,
      claimed.map((recipient) => ({
        associationId: recipient.associationId,
        memberId: recipient.memberId,
        recipientUserId: recipient.userId,
        messageType: AssociationMessageType.LEARNING_CONTENT_ASSIGNED,
        occurrenceKey: occurrenceKeys.learningContentAssigned(
          recipient.id,
          now,
        ),
        subject: {
          learningContentId: recipient.learningContentId,
          recipientId: recipient.id,
        },
      })),
      now,
    );
  }

  private async target(
    tx: Prisma.TransactionClient,
    learningContentId: string,
    memberIds: string[],
  ) {
    await tx.associationLearningContentRecipient.createMany({
      data: memberIds.map((memberId) => ({ learningContentId, memberId })),
      skipDuplicates: true,
    });

    await tx.associationLearningContentRecipient.updateMany({
      where: {
        learningContentId,
        memberId: { in: memberIds },
        isTargeted: false,
      },
      data: { isTargeted: true, announcedAt: null },
    });
  }

  private async audienceMemberIds(content: ContentAudience) {
    const base = {
      associationId: content.associationId,
      status: { not: AssociationMemberStatus.INACTIVE },
    } satisfies Prisma.AssociationMemberWhereInput;

    if (content.audienceKind === AssociationAudienceKind.ALL_MEMBERS)
      return this.memberIds(base);

    if (content.audienceKind === AssociationAudienceKind.GROUP) {
      const groupIds = content.targets
        .map((target) => target.groupId)
        .filter((id): id is string => Boolean(id));
      if (!groupIds.length) return [];
      return this.memberIds({ ...base, groupId: { in: groupIds } });
    }

    const memberIds = content.targets
      .map((target) => target.memberId)
      .filter((id): id is string => Boolean(id));
    if (!memberIds.length) return [];
    return this.memberIds({ ...base, id: { in: memberIds } });
  }

  private async memberIds(where: Prisma.AssociationMemberWhereInput) {
    const members = await this.prisma.associationMember.findMany({
      where,
      select: { id: true },
      orderBy: { id: "asc" },
    });
    return members.map((member) => member.id);
  }

  private covers(
    audienceKind: AssociationAudienceKind,
    targets: { groupId: string | null; memberId: string | null }[],
    member: { id: string; groupId: string | null },
  ) {
    if (audienceKind === AssociationAudienceKind.ALL_MEMBERS) return true;
    if (audienceKind === AssociationAudienceKind.GROUP)
      return Boolean(
        member.groupId &&
          targets.some((target) => target.groupId === member.groupId),
      );
    return targets.some((target) => target.memberId === member.id);
  }
}
