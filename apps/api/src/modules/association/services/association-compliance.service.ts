import { AssociationRequirementStatus, Prisma } from "@prisma/client";
import { type ProfessionalComplianceApi } from "@professional/public/professional-compliance-api";
import { PROFESSIONAL_COMPLIANCE_API } from "@professional/public/professional-compliance-api";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { type ComplianceActivity } from "@professional/public/professional-compliance-api";
import { PrismaService } from "@prisma/prisma.service";

import {
  TAssignmentForCompute,
  TAssignmentSnapshot,
  TAssignmentPreview,
  TRecomputeOutcome,
} from "@association/types/association-attention.types";

import * as C from "@association/utils/compliance-attribution.util";

const DEFAULT_ON_TRACK_THRESHOLD = 70;

const ASSIGNMENT_INCLUDE = {
  member: { select: { id: true, userId: true } },
  requirement: {
    select: {
      id: true,
      deadline: true,
      creditType: true,
      reportingEnd: true,
      associationId: true,
      evidencePolicy: true,
      reportingStart: true,
      gracePeriodDays: true,
      lateSubmissionPolicy: true,
      totalRequiredCredits: true,
      categories: { select: { id: true, mappedCategory: true } },
    },
  },
} satisfies Prisma.AssociationRequirementAssignmentInclude;

const EMPTY: TRecomputeOutcome = {
  discarded: 0,
  assignments: 0,
  attributionsWritten: 0,
  attributionsRemoved: 0,
};

const snapshotsDiffer = (a: TAssignmentSnapshot, b: TAssignmentSnapshot) =>
  Math.round(a.percent * 100) !== Math.round(b.percent * 100) ||
  a.band !== b.band ||
  Math.round(a.completedCredits * 100) !==
    Math.round(b.completedCredits * 100) ||
  a.awaitingReviewCount !== b.awaitingReviewCount ||
  a.isMissingEvidence !== b.isMissingEvidence;

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

  private async computeTotals(
    assignment: TAssignmentForCompute,
    activitiesForUser?: ComplianceActivity[],
  ) {
    const userId = assignment.member.userId;
    const activityList =
      activitiesForUser ??
      (await this.activities.activitiesForMembers({ userIds: [userId] }));

    const thresholds = await this.onTrackThreshold(
      assignment.requirement.associationId,
    );

    const attributed = activityList
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

    return { attributed, totals, band };
  }

  async previewAssignment(
    assignmentId: string,
  ): Promise<TAssignmentPreview | null> {
    const assignment =
      await this.prisma.associationRequirementAssignment.findUnique({
        where: { id: assignmentId },
        include: ASSIGNMENT_INCLUDE,
      });

    if (!assignment) return null;

    const current: TAssignmentSnapshot = {
      percent: assignment.percent,
      band: assignment.band,
      completedCredits: assignment.completedCredits,
      awaitingReviewCount: assignment.awaitingReviewCount,
      isMissingEvidence: assignment.isMissingEvidence,
    };

    const { totals, band } = await this.computeTotals(assignment);
    const computed: TAssignmentSnapshot = {
      percent: totals.percent,
      band,
      completedCredits: totals.completedCredits,
      awaitingReviewCount: totals.awaitingReviewCount,
      isMissingEvidence: totals.isMissingEvidence,
    };

    return {
      current,
      computed,
      wouldChange: snapshotsDiffer(current, computed),
    };
  }

  private async recomputeAssignments(
    assignments: TAssignmentForCompute[],
    startedAt: Date,
  ): Promise<TRecomputeOutcome> {
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

      const { attributed, totals, band } = await this.computeTotals(
        assignment,
        byUser.get(userId),
      );

      const keep = attributed.map((attribution) => attribution.activityId);

      const written = await this.prisma.$transaction(async (tx) => {
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

        if (applied.count === 0)
          return { attributions: 0, removed: 0, applied: 0 };

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
