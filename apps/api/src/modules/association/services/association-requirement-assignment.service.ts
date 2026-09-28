import { type ProfessionalRequirementDirectoryApi } from "@professional/public/professional-requirement-directory-api";
import { PROFESSIONAL_REQUIREMENT_DIRECTORY_API } from "@professional/public/professional-requirement-directory-api";
import { AssociationMessageType } from "@prisma/client";
import { AssociationRequirementStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { AssociationNotificationService } from "@association/services/association-notification.service";
import { occurrenceKeys } from "@association/enums/association-notification.enum";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { AssociationAudienceKind } from "@prisma/client";
import { AssociationMemberStatus } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";

const BATCH_SIZE = 200;

export type AnnouncementScope = {
  requirementId?: string;
  memberIds?: string[];
};

type ClaimedAssignment = {
  id: string;
  requirementId: string;
  memberId: string;
  userId: string;
  associationId: string;
};

type RequirementForMaterialisation = {
  id: string;
  associationId: string;
  audienceKind: AssociationAudienceKind;
  deadline: Date | null;
  reportingStart: Date | null;
  status: AssociationRequirementStatus;
  targets: {
    kind: AssociationAudienceKind;
    groupId: string | null;
    memberId: string | null;
  }[];
};

export type MaterialisationOutcome = {
  created: number;
  retained: number;
  removed: number;
  retargeted: number;
  announced: number;
};

const EMPTY: MaterialisationOutcome = {
  created: 0,
  retained: 0,
  removed: 0,
  retargeted: 0,
  announced: 0,
};

@Injectable()
export class AssociationRequirementAssignmentService {
  private readonly logger = new Logger(
    AssociationRequirementAssignmentService.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    @Inject(PROFESSIONAL_REQUIREMENT_DIRECTORY_API)
    private readonly requirementDirectory: ProfessionalRequirementDirectoryApi,
    private readonly notifications: AssociationNotificationService,
  ) {}

  async announce(
    tx: Prisma.TransactionClient,
    scope: AnnouncementScope,
    now = new Date(),
  ) {
    if (scope.memberIds && !scope.memberIds.length) return 0;

    const conditions = [
      Prisma.sql`assignment."isTargeted" = true`,
      Prisma.sql`assignment."announcedAt" IS NULL`,
      Prisma.sql`requirement."status" = ${AssociationRequirementStatus.PUBLISHED}::"AssociationRequirementStatus"`,
      Prisma.sql`member."status" = ${AssociationMemberStatus.ACTIVE}::"AssociationMemberStatus"`,
      Prisma.sql`requirement."associationId" = member."associationId"`,
    ];
    if (scope.requirementId)
      conditions.push(
        Prisma.sql`assignment."requirementId" = ${scope.requirementId}`,
      );
    if (scope.memberIds)
      conditions.push(
        Prisma.sql`assignment."memberId" IN (${Prisma.join(scope.memberIds)})`,
      );

    const claimed = await tx.$queryRaw<ClaimedAssignment[]>`
      WITH candidate AS (
        SELECT assignment."id", member."userId", member."associationId"
        FROM "AssociationRequirementAssignment" AS assignment
        JOIN "AssociationRequirement" AS requirement
          ON requirement."id" = assignment."requirementId"
        JOIN "AssociationMember" AS member
          ON member."id" = assignment."memberId"
        WHERE ${Prisma.join(conditions, " AND ")}
        ORDER BY assignment."id"
        FOR UPDATE OF assignment
      )
      UPDATE "AssociationRequirementAssignment" AS assignment
      SET "announcedAt" = ${now}, "updatedAt" = ${now}
      FROM candidate
      WHERE assignment."id" = candidate."id"
        AND assignment."announcedAt" IS NULL
      RETURNING assignment."id", assignment."requirementId", assignment."memberId",
        candidate."userId", candidate."associationId"`;

    return this.notifications.record(
      tx,
      claimed.map((assignment) => ({
        associationId: assignment.associationId,
        memberId: assignment.memberId,
        recipientUserId: assignment.userId,
        messageType: AssociationMessageType.REQUIREMENT_ASSIGNED,
        occurrenceKey: occurrenceKeys.requirementAssigned(assignment.id, now),
        subject: {
          requirementId: assignment.requirementId,
          assignmentId: assignment.id,
        },
      })),
      now,
    );
  }

  private async syncDirectoryForMembers(memberIds: string[]): Promise<void> {
    const uniqueIds = [...new Set(memberIds)];
    if (!uniqueIds.length) return;

    const members = await this.prisma.associationMember.findMany({
      where: { id: { in: uniqueIds } },
      select: { id: true, userId: true },
    });
    if (!members.length) return;

    const assignments =
      await this.prisma.associationRequirementAssignment.findMany({
        where: {
          isTargeted: true,
          memberId: { in: uniqueIds },
          requirement: { status: AssociationRequirementStatus.PUBLISHED },
        },
        select: { requirementId: true, memberId: true },
      });

    const requirementIdsByMember = new Map<string, string[]>();
    for (const assignment of assignments) {
      const list = requirementIdsByMember.get(assignment.memberId) ?? [];
      list.push(assignment.requirementId);
      requirementIdsByMember.set(assignment.memberId, list);
    }

    await Promise.all(
      members.map((member) =>
        this.requirementDirectory.syncAssignedRequirements(
          member.userId,
          requirementIdsByMember.get(member.id) ?? [],
        ),
      ),
    );
  }

  cycleStartFor(requirement: {
    reportingStart: Date | null;
    createdAt?: Date;
  }): Date {
    const start =
      requirement.reportingStart ?? requirement.createdAt ?? new Date();
    return new Date(
      Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
    );
  }

  async audienceMemberIds(
    requirement: RequirementForMaterialisation,
  ): Promise<string[]> {
    const base = {
      associationId: requirement.associationId,
      status: { not: AssociationMemberStatus.INACTIVE },
    } satisfies Prisma.AssociationMemberWhereInput;

    if (requirement.audienceKind === AssociationAudienceKind.ALL_MEMBERS) {
      const members = await this.prisma.associationMember.findMany({
        where: base,
        select: { id: true },
        orderBy: { id: "asc" },
      });
      return members.map((member) => member.id);
    }

    if (requirement.audienceKind === AssociationAudienceKind.GROUP) {
      const groupIds = requirement.targets
        .map((target) => target.groupId)
        .filter((id): id is string => Boolean(id));
      if (!groupIds.length) return [];
      const members = await this.prisma.associationMember.findMany({
        where: { ...base, groupId: { in: groupIds } },
        select: { id: true },
        orderBy: { id: "asc" },
      });
      return members.map((member) => member.id);
    }

    const memberIds = requirement.targets
      .map((target) => target.memberId)
      .filter((id): id is string => Boolean(id));
    if (!memberIds.length) return [];

    const members = await this.prisma.associationMember.findMany({
      where: { ...base, id: { in: memberIds } },
      select: { id: true },
      orderBy: { id: "asc" },
    });
    return members.map((member) => member.id);
  }

  async materialise(requirementId: string): Promise<MaterialisationOutcome> {
    const requirement = await this.prisma.associationRequirement.findUnique({
      where: { id: requirementId },
      select: {
        id: true,
        associationId: true,
        audienceKind: true,
        deadline: true,
        reportingStart: true,
        createdAt: true,
        status: true,
        targets: { select: { kind: true, groupId: true, memberId: true } },
      },
    });

    if (!requirement) return EMPTY;
    if (requirement.status === AssociationRequirementStatus.ARCHIVED)
      return EMPTY;

    const cycleStart = this.cycleStartFor(requirement);
    const covered = await this.audienceMemberIds(requirement);
    const coveredSet = new Set(covered);

    const outcome = { ...EMPTY };

    for (let index = 0; index < covered.length; index += BATCH_SIZE) {
      const batch = covered.slice(index, index + BATCH_SIZE);
      await this.prisma.$transaction(async (tx) => {
        for (const memberId of batch) {
          await tx.associationRequirementAssignment.upsert({
            where: {
              requirementId_memberId_cycleStart: {
                requirementId: requirement.id,
                memberId,
                cycleStart,
              },
            },
            create: {
              requirementId: requirement.id,
              memberId,
              cycleStart,
              dueDate: requirement.deadline,
              isTargeted: true,
            },
            update: { isTargeted: true, dueDate: requirement.deadline },
          });
        }
        if (requirement.status === AssociationRequirementStatus.PUBLISHED)
          outcome.announced += await this.announce(tx, {
            requirementId: requirement.id,
            memberIds: batch,
          });
      });
      outcome.created += batch.length;
    }

    const existing =
      await this.prisma.associationRequirementAssignment.findMany({
        where: { requirementId: requirement.id, cycleStart },
        select: { id: true, memberId: true, recordedCredits: true },
      });

    const orphaned = existing.filter(
      (assignment) => !coveredSet.has(assignment.memberId),
    );

    const disposable = orphaned
      .filter((assignment) => assignment.recordedCredits <= 0)
      .map((assignment) => assignment.id);

    const historic = orphaned
      .filter((assignment) => assignment.recordedCredits > 0)
      .map((assignment) => assignment.id);

    if (disposable.length) {
      const removed =
        await this.prisma.associationRequirementAssignment.deleteMany({
          where: { id: { in: disposable }, recordedCredits: { lte: 0 } },
        });
      outcome.removed = removed.count;
    }

    if (historic.length) {
      const retained =
        await this.prisma.associationRequirementAssignment.updateMany({
          where: { id: { in: historic } },
          data: { isTargeted: false, announcedAt: null },
        });
      outcome.retained = retained.count;
      outcome.retargeted = retained.count;
    }

    this.logger.log("Association requirement assignments materialised", {
      requirementId: requirement.id,
      audienceKind: requirement.audienceKind,
      created: outcome.created,
      retained: outcome.retained,
      removed: outcome.removed,
      announced: outcome.announced,
    });

    await this.syncDirectoryForMembers([
      ...covered,
      ...orphaned.map((assignment) => assignment.memberId),
    ]);

    return outcome;
  }

  async materialiseForMember(memberId: string): Promise<void> {
    const member = await this.prisma.associationMember.findUnique({
      where: { id: memberId },
      select: { id: true, associationId: true, groupId: true, status: true },
    });
    if (!member) return;

    const requirements = await this.prisma.associationRequirement.findMany({
      where: {
        associationId: member.associationId,
        status: AssociationRequirementStatus.PUBLISHED,
      },
      select: {
        id: true,
        audienceKind: true,
        deadline: true,
        reportingStart: true,
        createdAt: true,
        targets: { select: { groupId: true, memberId: true } },
      },
    });

    const isActive = member.status !== AssociationMemberStatus.INACTIVE;

    for (const requirement of requirements) {
      const covered =
        isActive &&
        this.covers(requirement.audienceKind, requirement.targets, member);
      const cycleStart = this.cycleStartFor(requirement);
      const key = {
        requirementId_memberId_cycleStart: {
          requirementId: requirement.id,
          memberId: member.id,
          cycleStart,
        },
      };

      if (covered) {
        await this.prisma.associationRequirementAssignment.upsert({
          where: key,
          create: {
            requirementId: requirement.id,
            memberId: member.id,
            cycleStart,
            dueDate: requirement.deadline,
            isTargeted: true,
          },
          update: { isTargeted: true, dueDate: requirement.deadline },
        });
        continue;
      }

      const removed =
        await this.prisma.associationRequirementAssignment.deleteMany({
          where: {
            requirementId: requirement.id,
            memberId: member.id,
            cycleStart,
            recordedCredits: { lte: 0 },
          },
        });

      if (removed.count === 0)
        await this.prisma.associationRequirementAssignment.updateMany({
          where: {
            requirementId: requirement.id,
            memberId: member.id,
            cycleStart,
            isTargeted: true,
          },
          data: { isTargeted: false, announcedAt: null },
        });
    }

    if (isActive)
      await this.prisma.$transaction((tx) =>
        this.announce(tx, { memberIds: [member.id] }),
      );

    await this.syncDirectoryForMembers([member.id]);
  }

  private covers(
    audienceKind: AssociationAudienceKind,
    targets: { groupId: string | null; memberId: string | null }[],
    member: { id: string; groupId: string | null },
  ): boolean {
    if (audienceKind === AssociationAudienceKind.ALL_MEMBERS) return true;
    if (audienceKind === AssociationAudienceKind.GROUP)
      return Boolean(
        member.groupId &&
          targets.some((target) => target.groupId === member.groupId),
      );
    return targets.some((target) => target.memberId === member.id);
  }

  async materialiseForAssociation(associationId: string): Promise<void> {
    const requirements = await this.prisma.associationRequirement.findMany({
      where: {
        associationId,
        status: AssociationRequirementStatus.PUBLISHED,
      },
      select: { id: true },
    });

    for (const requirement of requirements)
      await this.materialise(requirement.id);
  }

  hasRecordedActivity(
    tx: Prisma.TransactionClient,
    requirementId: string,
  ): Promise<boolean> {
    return this.requirementDirectory.hasRecordedActivity(requirementId, tx);
  }

  async retire(
    tx: Prisma.TransactionClient,
    requirementId: string,
  ): Promise<void> {
    await tx.associationRequirementAssignment.updateMany({
      where: { requirementId, isTargeted: true },
      data: { isTargeted: false, announcedAt: null },
    });
    await this.requirementDirectory.removeRequirementLinks(requirementId, tx);
  }

  async membersCovered(associationId: string): Promise<number> {
    const rows = await this.prisma.associationRequirementAssignment.findMany({
      where: {
        isTargeted: true,
        requirement: {
          associationId,
          status: AssociationRequirementStatus.PUBLISHED,
        },
      },
      select: { memberId: true },
      distinct: ["memberId"],
    });
    return rows.length;
  }
}
