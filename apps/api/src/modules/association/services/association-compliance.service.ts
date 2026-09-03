import { AssociationRequirementStatus, Prisma } from "@prisma/client";
import { type ProfessionalComplianceApi } from "@professional/public/professional-compliance-api";
import { PROFESSIONAL_COMPLIANCE_API } from "@professional/public/professional-compliance-api";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { type ComplianceActivity } from "@professional/public/professional-compliance-api";
import { PrismaService } from "@prisma/prisma.service";
import { PDUCategory } from "@prisma/client";

import * as C from "@association/utils/compliance-attribution.util";

const DEFAULT_ON_TRACK_THRESHOLD = 70;

type AssignmentForCompute = {
  id: string;
  cycleStart: Date;
  cycleEnd: Date | null;
  member: { id: string; userId: string };
  requirement: {
    id: string;
    associationId: string;
    creditType: C.AttributionRequirement["creditType"];
    evidencePolicy: C.AttributionRequirement["evidencePolicy"];
    reportingStart: Date | null;
    reportingEnd: Date | null;
    deadline: Date | null;
    gracePeriodDays: number;
    allowLateSubmission: boolean;
    totalRequiredCredits: number;
    categories: { id: string; mappedCategory: PDUCategory }[];
  };
};

const ASSIGNMENT_INCLUDE = {
  member: { select: { id: true, userId: true } },
  requirement: {
    select: {
      id: true,
      associationId: true,
      creditType: true,
      evidencePolicy: true,
      reportingStart: true,
      reportingEnd: true,
      deadline: true,
      gracePeriodDays: true,
      allowLateSubmission: true,
      totalRequiredCredits: true,
      categories: { select: { id: true, mappedCategory: true } },
    },
  },
} satisfies Prisma.AssociationRequirementAssignmentInclude;

export type RecomputeOutcome = {
  assignments: number;
  attributionsWritten: number;
  attributionsRemoved: number;
  discarded: number;
};

const EMPTY: RecomputeOutcome = {
  assignments: 0,
  attributionsWritten: 0,
  attributionsRemoved: 0,
  discarded: 0,
};

@Injectable()
export class AssociationComplianceService {
  private readonly logger = new Logger(AssociationComplianceService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(PROFESSIONAL_COMPLIANCE_API)
    private readonly activities: ProfessionalComplianceApi,
  ) {}

  private async onTrackThreshold(associationId: string) {
    const settings = await this.prisma.associationSettings.findUnique({
      where: { associationId },
      select: { onTrackThreshold: true },
    });
    return settings?.onTrackThreshold ?? DEFAULT_ON_TRACK_THRESHOLD;
  }

  private async recomputeAssignments(
    assignments: AssignmentForCompute[],
    startedAt: Date,
  ): Promise<RecomputeOutcome> {
    if (!assignments.length) return EMPTY;

    const outcome = { ...EMPTY };
    const byUser = new Map<string, ComplianceActivity[]>();

    for (const assignment of assignments) {
      const userId = assignment.member.userId;
      if (!byUser.has(userId))
        byUser.set(
          userId,
          await this.activities.activitiesForMembers({ userIds: [userId] }),
        );

      const thresholds = await this.onTrackThreshold(
        assignment.requirement.associationId,
      );

      const attributed = (byUser.get(userId) ?? [])
        .map((activity) =>
          C.attributionFor(activity, assignment.requirement, assignment),
        )
        .filter((attribution): attribution is C.Attribution =>
          Boolean(attribution),
        );

      const totals = C.totalsFor(
        attributed,
        assignment.requirement.totalRequiredCredits,
      );

      const band = C.bandFor({
        percent: totals.percent,
        awaitingReviewCount: totals.awaitingReviewCount,
        onTrackThreshold: thresholds,
      });

      const keep = attributed.map((attribution) => attribution.activityId);

      const written = await this.prisma.$transaction(async (tx) => {
        for (const attribution of attributed)
          await tx.associationCreditAttribution.upsert({
            where: {
              assignmentId_activityId: {
                assignmentId: assignment.id,
                activityId: attribution.activityId,
              },
            },
            create: { assignmentId: assignment.id, ...attribution },
            update: {
              categoryId: attribution.categoryId,
              creditedAmount: attribution.creditedAmount,
              activityDate: attribution.activityDate,
              isLate: attribution.isLate,
              state: attribution.state,
            },
          });

        const removed = await tx.associationCreditAttribution.deleteMany({
          where: {
            assignmentId: assignment.id,
            ...(keep.length ? { activityId: { notIn: keep } } : {}),
          },
        });

        const applied = await tx.associationRequirementAssignment.updateMany({
          where: {
            id: assignment.id,
            OR: [{ computedAt: null }, { computedAt: { lte: startedAt } }],
          },
          data: {
            completedCredits: totals.completedCredits,
            recordedCredits: totals.completedCredits,
            percent: totals.percent,
            band,
            awaitingReviewCount: totals.awaitingReviewCount,
            isMissingEvidence: totals.isMissingEvidence,
            computedAt: startedAt,
          },
        });

        return {
          attributions: attributed.length,
          removed: removed.count,
          applied: applied.count,
        };
      });

      outcome.assignments += 1;
      outcome.attributionsWritten += written.attributions;
      outcome.attributionsRemoved += written.removed;
      if (written.applied === 0) outcome.discarded += 1;
    }

    this.logger.log("Association compliance recomputed", {
      assignments: outcome.assignments,
      attributionsWritten: outcome.attributionsWritten,
      attributionsRemoved: outcome.attributionsRemoved,
      discarded: outcome.discarded,
      durationMs: Date.now() - startedAt.getTime(),
    });

    return outcome;
  }

  async recomputeAssignment(assignmentId: string) {
    const assignment =
      await this.prisma.associationRequirementAssignment.findUnique({
        where: { id: assignmentId },
        include: ASSIGNMENT_INCLUDE,
      });

    if (!assignment) return EMPTY;
    return this.recomputeAssignments([assignment], new Date());
  }

  async recomputeForMember(memberId: string) {
    const assignments =
      await this.prisma.associationRequirementAssignment.findMany({
        where: {
          memberId,
          requirement: { status: AssociationRequirementStatus.PUBLISHED },
        },
        include: ASSIGNMENT_INCLUDE,
      });

    return this.recomputeAssignments(assignments, new Date());
  }

  async recomputeForUser(userId: string) {
    const assignments =
      await this.prisma.associationRequirementAssignment.findMany({
        where: {
          member: { userId },
          requirement: { status: AssociationRequirementStatus.PUBLISHED },
        },
        include: ASSIGNMENT_INCLUDE,
      });
    return this.recomputeAssignments(assignments, new Date());
  }

  async recomputeRequirement(requirementId: string) {
    const assignments =
      await this.prisma.associationRequirementAssignment.findMany({
        where: { requirementId },
        include: ASSIGNMENT_INCLUDE,
      });

    return this.recomputeAssignments(assignments, new Date());
  }

  async recomputeAssociation(associationId: string) {
    const assignments =
      await this.prisma.associationRequirementAssignment.findMany({
        where: {
          requirement: {
            associationId,
            status: AssociationRequirementStatus.PUBLISHED,
          },
        },
        include: ASSIGNMENT_INCLUDE,
      });

    return this.recomputeAssignments(assignments, new Date());
  }
}
