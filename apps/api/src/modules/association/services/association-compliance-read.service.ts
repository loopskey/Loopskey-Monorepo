import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AssociationAttributionState, Prisma } from "@prisma/client";
import { type ProfessionalComplianceApi } from "@professional/public/professional-compliance-api";
import { AssociationRequirementStatus } from "@prisma/client";
import { PROFESSIONAL_COMPLIANCE_API } from "@professional/public/professional-compliance-api";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { TAssociationUser } from "@association/types/association-service.types";
import { daysRemaining } from "@association/utils/compliance-attribution.util";
import { PrismaService } from "@prisma/prisma.service";
import { bandFor } from "@association/utils/compliance-attribution.util";

const PENDING_REVIEW_LIMIT = 200;

export type ComplianceFilter = {
  groupId?: string;
  requirementId?: string;
  memberIds?: string[];
};

@Injectable()
export class AssociationComplianceReadService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AssociationAccessService,
    @Inject(PROFESSIONAL_COMPLIANCE_API)
    private readonly activities: ProfessionalComplianceApi,
  ) {}

  private async scope(user: TAssociationUser, associationId?: string) {
    return this.access.requireReadable(user, associationId);
  }

  async memberCompliance(
    user: TAssociationUser,
    memberId: string,
    associationId?: string,
  ) {
    const association = await this.scope(user, associationId);

    const member = await this.prisma.associationMember.findFirst({
      where: { id: memberId, associationId: association.id },
      select: { id: true, userId: true },
    });

    if (!member)
      throw new NotFoundException({
        code: AssociationMessageCode.MEMBER_NOT_FOUND,
        message: "Member not found.",
      });

    const assignments =
      await this.prisma.associationRequirementAssignment.findMany({
        where: {
          memberId: member.id,
          requirement: { associationId: association.id },
        },
        include: {
          requirement: {
            select: {
              id: true,
              name: true,
              creditType: true,
              totalRequiredCredits: true,
              status: true,
              categories: {
                select: {
                  id: true,
                  name: true,
                  requiredCredits: true,
                  order: true,
                },
                orderBy: { order: "asc" },
              },
            },
          },
        },
        orderBy: { dueDate: "asc" },
      });

    const creditsByCategory = await this.creditsByCategory(
      assignments.map((assignment) => assignment.id),
    );

    const now = new Date();

    return {
      memberId: member.id,
      isMissingEvidence: assignments.some(
        (assignment) => assignment.isMissingEvidence,
      ),
      assignments: assignments.map((assignment) => ({
        id: assignment.id,
        requirementId: assignment.requirement.id,
        requirementName: assignment.requirement.name,
        creditType: assignment.requirement.creditType,
        requiredCredits: assignment.requirement.totalRequiredCredits,
        completedCredits: assignment.completedCredits,
        percent: assignment.percent,
        band: assignment.band,
        dueDate: assignment.dueDate,
        daysRemaining: daysRemaining(assignment.dueDate, now),
        awaitingReviewCount: assignment.awaitingReviewCount,
        isMissingEvidence: assignment.isMissingEvidence,
        computedAt: assignment.computedAt,
        categories: assignment.requirement.categories.map((category) => {
          const completed =
            creditsByCategory.get(`${assignment.id}:${category.id}`) ?? 0;
          return {
            id: category.id,
            name: category.name,
            requiredCredits: category.requiredCredits,
            completedCredits: completed,
            percent:
              category.requiredCredits > 0
                ? (completed / category.requiredCredits) * 100
                : completed > 0
                  ? 100
                  : 0,
          };
        }),
      })),
    };
  }

  private async creditsByCategory(assignmentIds: string[]) {
    if (!assignmentIds.length) return new Map<string, number>();

    const rows = await this.prisma.associationCreditAttribution.groupBy({
      by: ["assignmentId", "categoryId"],
      where: {
        assignmentId: { in: assignmentIds },
        state: AssociationAttributionState.COUNTED,
        categoryId: { not: null },
      },
      _sum: { creditedAmount: true },
    });

    return new Map(
      rows.map((row) => [
        `${row.assignmentId}:${row.categoryId}`,
        row._sum.creditedAmount ?? 0,
      ]),
    );
  }

  async memberComplianceList(
    user: TAssociationUser,
    filter: ComplianceFilter = {},
    associationId?: string,
  ) {
    const association = await this.scope(user, associationId);

    const where: Prisma.AssociationRequirementAssignmentWhereInput = {
      requirement: {
        associationId: association.id,
        status: AssociationRequirementStatus.PUBLISHED,
        ...(filter.requirementId ? { id: filter.requirementId } : {}),
      },
      member: {
        associationId: association.id,
        ...(filter.groupId ? { groupId: filter.groupId } : {}),
        ...(filter.memberIds?.length ? { id: { in: filter.memberIds } } : {}),
      },
    };

    const assignments =
      await this.prisma.associationRequirementAssignment.findMany({
        where,
        select: {
          memberId: true,
          percent: true,
          band: true,
          awaitingReviewCount: true,
          isMissingEvidence: true,
          completedCredits: true,
          computedAt: true,
        },
      });

    const byMember = new Map<
      string,
      {
        memberId: string;
        percentSum: number;
        assignments: number;
        awaitingReviewCount: number;
        isMissingEvidence: boolean;
        computedAt: Date | null;
      }
    >();

    for (const assignment of assignments) {
      const current = byMember.get(assignment.memberId) ?? {
        memberId: assignment.memberId,
        percentSum: 0,
        assignments: 0,
        awaitingReviewCount: 0,
        isMissingEvidence: false,
        computedAt: null as Date | null,
      };

      current.percentSum += Math.min(assignment.percent, 100);
      current.assignments += 1;
      current.awaitingReviewCount += assignment.awaitingReviewCount;
      current.isMissingEvidence ||= assignment.isMissingEvidence;
      current.computedAt =
        !current.computedAt ||
        (assignment.computedAt &&
          assignment.computedAt.getTime() < current.computedAt.getTime())
          ? (assignment.computedAt ?? current.computedAt)
          : current.computedAt;

      byMember.set(assignment.memberId, current);
    }

    const thresholds = await this.prisma.associationSettings.findUnique({
      where: { associationId: association.id },
      select: { onTrackThreshold: true },
    });

    const onTrackThreshold = thresholds?.onTrackThreshold ?? 70;

    return [...byMember.values()].map((row) => {
      const percent = row.assignments ? row.percentSum / row.assignments : 0;
      return {
        memberId: row.memberId,
        percent,
        awaitingReviewCount: row.awaitingReviewCount,
        isMissingEvidence: row.isMissingEvidence,
        computedAt: row.computedAt,
        band: bandFor({
          percent,
          onTrackThreshold,
          awaitingReviewCount: row.awaitingReviewCount,
        }),
      };
    });
  }

  async pendingReviews(
    user: TAssociationUser,
    filter: ComplianceFilter = {},
    associationId?: string,
  ) {
    const association = await this.scope(user, associationId);

    const awaiting = await this.prisma.associationCreditAttribution.findMany({
      where: {
        state: AssociationAttributionState.AWAITING_REVIEW,
        assignment: {
          requirement: {
            associationId: association.id,
            status: AssociationRequirementStatus.PUBLISHED,
            ...(filter.requirementId ? { id: filter.requirementId } : {}),
          },
          member: {
            associationId: association.id,
            ...(filter.groupId ? { groupId: filter.groupId } : {}),
          },
        },
      },
      select: {
        id: true,
        activityId: true,
        activityDate: true,
        assignment: {
          select: {
            id: true,
            member: {
              select: {
                id: true,
                userId: true,
                user: { select: { fullName: true } },
              },
            },
            requirement: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { activityDate: "asc" },
      take: PENDING_REVIEW_LIMIT,
    });

    if (!awaiting.length) return [];

    const ownerUserIds = [
      ...new Set(awaiting.map((row) => row.assignment.member.userId)),
    ];

    const activities = await this.activities.activitiesForMembers({
      userIds: ownerUserIds,
    });

    const byId = new Map(activities.map((activity) => [activity.id, activity]));

    return awaiting.flatMap((row) => {
      const activity = byId.get(row.activityId);
      if (!activity) return [];

      return [
        {
          id: row.id,
          activityId: row.activityId,
          activityTitle: activity.title,
          activityDate: row.activityDate,
          credits: activity.credits,
          category: activity.category,
          memberId: row.assignment.member.id,
          memberName: row.assignment.member.user.fullName,
          requirementId: row.assignment.requirement.id,
          requirementName: row.assignment.requirement.name,
        },
      ];
    });
  }
}
