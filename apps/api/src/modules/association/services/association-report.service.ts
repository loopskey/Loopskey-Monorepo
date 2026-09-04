import { AssociationAttributionState, PDUCategory } from "@prisma/client";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { AssociationComplianceReadService } from "@association/services/association-compliance-read.service";
import { AssociationRequirementStatus } from "@prisma/client";
import { AssociationComplianceBand } from "@prisma/client";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationMemberStatus } from "@prisma/client";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { REPORT_MEMBER_SELECT } from "@association/types/association-report.types";
import { ReportAssignmentRow } from "@association/types/association-report.types";
import { Injectable, Logger } from "@nestjs/common";
import { ReportMemberRecord } from "@association/types/association-report.types";
import { ReportCategoryRow } from "@association/types/association-report.types";
import { ReportProjection } from "@association/types/association-report.types";
import { TAssociationUser } from "@association/types/association-service.types";
import { ReportMemberRow } from "@association/types/association-report.types";
import { PrismaService } from "@prisma/prisma.service";
import { BandCounts } from "@association/types/association-report.types";

import * as P from "@association/utils/association-report-period.util";
import * as U from "@association/utils/compliance-attribution.util";

const SLOW_REPORT_MS = 2000;

const HALF_PERCENT = 50;

export type ReportFilter = {
  period?: P.AssociationReportPeriod | null;
  startDate?: string | null;
  endDate?: string | null;
  groupId?: string | null;
  requirementId?: string | null;
  includeInactive?: boolean | null;
};

export type ReportPage = { take?: number | null; cursor?: string | null };

const UNGROUPED = "UNGROUPED";

@Injectable()
export class AssociationReportService {
  private readonly logger = new Logger(AssociationReportService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AssociationAccessService,
    private readonly compliance: AssociationComplianceReadService,
  ) {}

  async summary(
    user: TAssociationUser,
    filter: ReportFilter = {},
    associationId?: string,
  ) {
    const {
      window,
      projection,
      associationId: id,
    } = await this.resolve(user, filter, associationId);

    const previous = await this.projectAt(id, filter, window.previousStart);

    const total = projection.members.length;
    const counts = this.bandCounts(projection.members);
    const previousCounts = this.bandCounts(previous.members);
    const missingEvidence = projection.members.filter(
      (member) => member.isMissingEvidence,
    ).length;
    const previousMissing = previous.members.filter(
      (member) => member.isMissingEvidence,
    ).length;

    return {
      totalMembers: total,
      totalMembersChange: total - previous.members.length,
      renewalReady: counts.renewalReady,
      renewalReadyShare: P.shareOf(counts.renewalReady, total),
      renewalReadyChange: counts.renewalReady - previousCounts.renewalReady,
      onTrack: counts.onTrack,
      onTrackShare: P.shareOf(counts.onTrack, total),
      onTrackChange: counts.onTrack - previousCounts.onTrack,
      atRisk: counts.atRisk,
      atRiskShare: P.shareOf(counts.atRisk, total),
      atRiskChange: counts.atRisk - previousCounts.atRisk,
      missingEvidence,
      missingEvidenceShare: P.shareOf(missingEvidence, total),
      missingEvidenceChange: missingEvidence - previousMissing,
      averageCompletion: this.averageCompletion(projection.members),
      periodStart: window.start,
      periodEnd: window.end,
      computedAt: projection.computedAt,
    };
  }

  async complianceByGroup(
    user: TAssociationUser,
    filter: ReportFilter = {},
    associationId?: string,
  ) {
    const { projection } = await this.resolve(user, filter, associationId);

    return this.byGroup(projection).map((group) => ({
      groupId: group.groupId,
      groupTitle: group.groupTitle,
      memberCount: group.members.length,
      averageCompletion: this.averageCompletion(group.members),
      ...this.bandCounts(group.members),
    }));
  }

  async progressByCategory(
    user: TAssociationUser,
    filter: ReportFilter = {},
    associationId?: string,
  ) {
    const { projection } = await this.resolve(user, filter, associationId);
    return projection.categories;
  }

  async memberDistribution(
    user: TAssociationUser,
    filter: ReportFilter = {},
    associationId?: string,
  ) {
    const { projection } = await this.resolve(user, filter, associationId);

    const total = projection.members.length;
    const counts = this.bandCounts(projection.members);

    return {
      totalMembers: total,
      ...counts,
      renewalReadyShare: P.shareOf(counts.renewalReady, total),
      onTrackShare: P.shareOf(counts.onTrack, total),
      atRiskShare: P.shareOf(counts.atRisk, total),
      notStartedShare: P.shareOf(counts.notStarted, total),
    };
  }

  async complianceTrend(
    user: TAssociationUser,
    filter: ReportFilter = {},
    associationId?: string,
  ) {
    const { window, associationId: id } = await this.resolve(
      user,
      filter,
      associationId,
    );

    const points = [];

    for (const at of P.monthEndsWithin(window)) {
      const projection = await this.projectAt(id, filter, at);
      const total = projection.members.length;
      const counts = this.bandCounts(projection.members);

      points.push({
        at,
        totalMembers: total,
        ...counts,
        renewalReadyShare: P.shareOf(counts.renewalReady, total),
        onTrackShare: P.shareOf(counts.onTrack, total),
        atRiskShare: P.shareOf(counts.atRisk, total),
        notStartedShare: P.shareOf(counts.notStarted, total),
        averageCompletion: this.averageCompletion(projection.members),
      });
    }

    return points;
  }

  async memberProgressReport(
    user: TAssociationUser,
    filter: ReportFilter = {},
    page?: ReportPage,
    associationId?: string,
  ) {
    const { projection } = await this.resolve(user, filter, associationId);

    const sorted = [...projection.members].sort(
      (left, right) => left.percent - right.percent,
    );

    return this.paginate(sorted, page, (member) => member.memberId);
  }

  async groupProgressReport(
    user: TAssociationUser,
    filter: ReportFilter = {},
    associationId?: string,
  ) {
    const { projection } = await this.resolve(user, filter, associationId);

    return this.byGroup(projection).map((group) => ({
      groupId: group.groupId,
      groupTitle: group.groupTitle,
      memberCount: group.members.length,
      averageCompletion: this.averageCompletion(group.members),
      missingEvidenceCount: group.members.filter(
        (member) => member.isMissingEvidence,
      ).length,
      notStartedCount: group.members.filter((member) => !member.hasStarted)
        .length,
      ...this.bandCounts(group.members),
    }));
  }

  async categoryCompletionReport(
    user: TAssociationUser,
    filter: ReportFilter = {},
    associationId?: string,
  ) {
    const { projection } = await this.resolve(user, filter, associationId);
    return projection.categories;
  }

  async missingEvidenceReport(
    user: TAssociationUser,
    filter: ReportFilter = {},
    page?: ReportPage,
    associationId?: string,
  ) {
    const { projection } = await this.resolve(user, filter, associationId);

    const rows = projection.members.flatMap((member) =>
      member.assignments
        .filter((assignment) => assignment.isMissingEvidence)
        .map((assignment) => ({
          id: `${member.memberId}:${assignment.assignmentId}`,
          memberId: member.memberId,
          fullName: member.fullName,
          email: member.email,
          memberNumber: member.memberNumber,
          groupTitle: member.groupTitle,
          requirementId: assignment.requirementId,
          requirementName: assignment.requirementName,
          awaitingReviewCount: assignment.awaitingReviewCount,
          requiredCredits: assignment.requiredCredits,
          completedCredits: assignment.completedCredits,
          percent: assignment.percent,
          dueDate: assignment.dueDate,
          daysRemaining: assignment.daysRemaining,
        })),
    );

    return this.paginate(rows, page, (row) => row.id);
  }

  async renewalReadinessReport(
    user: TAssociationUser,
    filter: ReportFilter = {},
    page?: ReportPage,
    associationId?: string,
  ) {
    const { projection } = await this.resolve(user, filter, associationId);

    const rows = projection.members.map((member) => ({
      id: member.memberId,
      memberId: member.memberId,
      fullName: member.fullName,
      email: member.email,
      memberNumber: member.memberNumber,
      groupTitle: member.groupTitle,
      requiredCredits: member.requiredCredits,
      completedCredits: member.completedCredits,
      percent: member.percent,
      band: member.band,
      isRenewalReady: member.band === AssociationComplianceBand.RENEWAL_READY,
      awaitingReviewCount: member.awaitingReviewCount,
      earliestUnmetDeadline: member.earliestUnmetDeadline,
    }));

    return this.paginate(rows, page, (row) => row.id);
  }

  private paginate<TRow>(
    rows: TRow[],
    page: ReportPage | undefined,
    idOf: (row: TRow) => string,
  ) {
    const take = page?.take ?? 50;
    const cursorIndex = page?.cursor
      ? rows.findIndex((row) => idOf(row) === page.cursor)
      : -1;
    const start = cursorIndex < 0 ? 0 : cursorIndex + 1;
    const items = rows.slice(start, start + take);
    const hasNextPage = start + take < rows.length;
    const last = items.at(-1);

    return {
      items,
      totalCount: rows.length,
      pageInfo: {
        hasNextPage,
        nextCursor: hasNextPage && last ? idOf(last) : null,
      },
    };
  }

  private bandCounts(members: ReportMemberRow[]): BandCounts {
    const of = (band: AssociationComplianceBand) =>
      members.filter((member) => member.band === band).length;

    return {
      renewalReady: of(AssociationComplianceBand.RENEWAL_READY),
      onTrack: of(AssociationComplianceBand.ON_TRACK),
      atRisk: of(AssociationComplianceBand.AT_RISK),
      notStarted: of(AssociationComplianceBand.NOT_STARTED),
    };
  }

  private averageCompletion(members: ReportMemberRow[]) {
    const required = members.reduce(
      (total, member) => total + member.requiredCredits,
      0,
    );
    const completed = members.reduce(
      (total, member) => total + member.completedCredits,
      0,
    );

    return P.weightedCompletionFor(required, completed);
  }

  private byGroup(projection: ReportProjection) {
    const groups = new Map<
      string,
      {
        groupId: string | null;
        groupTitle: string | null;
        members: ReportMemberRow[];
      }
    >();

    for (const member of projection.members) {
      const key = member.groupId ?? UNGROUPED;
      const current = groups.get(key) ?? {
        groupId: member.groupId,
        groupTitle: member.groupTitle,
        members: [],
      };
      current.members.push(member);
      groups.set(key, current);
    }

    return [...groups.values()].sort((left, right) =>
      (left.groupTitle ?? "").localeCompare(right.groupTitle ?? ""),
    );
  }

  private async resolve(
    user: TAssociationUser,
    filter: ReportFilter,
    associationId?: string,
  ) {
    const started = Date.now();
    const association = await this.access.requireReadable(user, associationId);
    const window = this.window(filter);

    await this.assertFilterTargets(association.id, filter);

    const projection = await this.projectAt(association.id, filter, window.end);

    const duration = Date.now() - started;
    const context = {
      associationId: association.id,
      period: filter.period ?? "CUSTOM",
      groupId: filter.groupId ?? null,
      requirementId: filter.requirementId ?? null,
      members: projection.members.length,
      durationMs: duration,
    };

    if (duration > SLOW_REPORT_MS)
      this.logger.warn("An association report was slow", context);
    else this.logger.log("An association report was read", context);

    return { window, projection, associationId: association.id };
  }

  private window(filter: ReportFilter) {
    const outcome = P.resolvePeriod(filter, new Date());

    if (outcome.problem === "PERIOD_TOO_LONG")
      throw new BadRequestException({
        code: AssociationMessageCode.REPORT_PERIOD_TOO_LONG,
        message: `A report covers at most ${P.REPORT_PERIOD_MAX_MONTHS} months.`,
      });

    if (!outcome.window)
      throw new BadRequestException({
        code: AssociationMessageCode.REPORT_PERIOD_INVALID,
        message: "That period is not a range this report can cover.",
      });

    return outcome.window;
  }

  private async assertFilterTargets(
    associationId: string,
    filter: ReportFilter,
  ) {
    if (filter.groupId) {
      const group = await this.prisma.associationGroup.findFirst({
        where: { id: filter.groupId, associationId },
        select: { id: true },
      });

      if (!group)
        throw new NotFoundException({
          code: AssociationMessageCode.GROUP_NOT_FOUND,
          message: "That group does not belong to this association.",
        });
    }

    if (filter.requirementId) {
      const requirement = await this.prisma.associationRequirement.findFirst({
        where: { id: filter.requirementId, associationId },
        select: { id: true },
      });

      if (!requirement)
        throw new NotFoundException({
          code: AssociationMessageCode.REQUIREMENT_NOT_FOUND,
          message: "That requirement does not belong to this association.",
        });
    }
  }

  private async projectAt(
    associationId: string,
    filter: ReportFilter,
    at: Date,
  ): Promise<ReportProjection> {
    const onTrackThreshold =
      await this.compliance.onTrackThreshold(associationId);

    const members = await this.prisma.associationMember.findMany({
      where: {
        associationId,
        ...(filter.groupId ? { groupId: filter.groupId } : {}),
        ...(filter.includeInactive
          ? {}
          : { status: { not: AssociationMemberStatus.INACTIVE } }),
      },
      select: REPORT_MEMBER_SELECT,
      orderBy: { invitedAt: "asc" },
    });

    if (!members.length)
      return {
        at,
        members: [],
        categories: [],
        computedAt: null,
        onTrackThreshold,
      };

    const assignments =
      await this.prisma.associationRequirementAssignment.findMany({
        where: {
          memberId: { in: members.map((member) => member.id) },
          requirement: {
            associationId,
            status: AssociationRequirementStatus.PUBLISHED,
            ...(filter.requirementId ? { id: filter.requirementId } : {}),
          },
        },
        select: {
          id: true,
          memberId: true,
          dueDate: true,
          computedAt: true,
          requirement: {
            select: {
              id: true,
              name: true,
              totalRequiredCredits: true,
              categories: {
                select: {
                  id: true,
                  name: true,
                  mappedCategory: true,
                  requiredCredits: true,
                  order: true,
                },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });

    const credits = await this.creditsAsOf(
      assignments.map((assignment) => assignment.id),
      at,
    );

    return this.assemble({
      at,
      members,
      assignments,
      credits,
      onTrackThreshold,
    });
  }

  private async creditsAsOf(assignmentIds: string[], at: Date) {
    if (!assignmentIds.length)
      return {
        counted: new Map<string, number>(),
        awaiting: new Map<string, number>(),
        byCategory: new Map<string, number>(),
      };

    const rows = await this.prisma.associationCreditAttribution.groupBy({
      by: ["assignmentId", "categoryId", "state"],
      where: {
        assignmentId: { in: assignmentIds },
        activityDate: { lte: at },
        state: {
          in: [
            AssociationAttributionState.COUNTED,
            AssociationAttributionState.AWAITING_REVIEW,
          ],
        },
      },
      _sum: { creditedAmount: true },
      _count: { _all: true },
    });

    const counted = new Map<string, number>();
    const awaiting = new Map<string, number>();
    const byCategory = new Map<string, number>();

    for (const row of rows) {
      if (row.state === AssociationAttributionState.AWAITING_REVIEW) {
        awaiting.set(
          row.assignmentId,
          (awaiting.get(row.assignmentId) ?? 0) + row._count._all,
        );
        continue;
      }

      const amount = row._sum.creditedAmount ?? 0;
      counted.set(
        row.assignmentId,
        (counted.get(row.assignmentId) ?? 0) + amount,
      );

      if (row.categoryId)
        byCategory.set(
          `${row.assignmentId}:${row.categoryId}`,
          (byCategory.get(`${row.assignmentId}:${row.categoryId}`) ?? 0) +
            amount,
        );
    }

    return { counted, awaiting, byCategory };
  }

  private assemble({
    at,
    members,
    assignments,
    credits,
    onTrackThreshold,
  }: {
    at: Date;
    members: ReportMemberRecord[];
    assignments: AssignmentRecord[];
    credits: CreditMaps;
    onTrackThreshold: number;
  }): ReportProjection {
    const byMember = new Map<string, AssignmentRecord[]>();
    for (const assignment of assignments) {
      byMember.set(assignment.memberId, [
        ...(byMember.get(assignment.memberId) ?? []),
        assignment,
      ]);
    }

    let computedAt: Date | null = null;
    for (const assignment of assignments) {
      if (!assignment.computedAt) continue;
      if (!computedAt || assignment.computedAt < computedAt)
        computedAt = assignment.computedAt;
    }

    const rows = members.map((member) =>
      this.memberRow({
        at,
        member,
        onTrackThreshold,
        credits,
        assignments: byMember.get(member.id) ?? [],
      }),
    );

    return {
      at,
      computedAt,
      onTrackThreshold,
      members: rows,
      categories: this.categoryRows({
        rows,
        assignments,
        credits,
        onTrackThreshold,
      }),
    };
  }

  private memberRow({
    at,
    member,
    assignments,
    credits,
    onTrackThreshold,
  }: {
    at: Date;
    member: ReportMemberRecord;
    assignments: AssignmentRecord[];
    credits: CreditMaps;
    onTrackThreshold: number;
  }): ReportMemberRow {
    const rows: ReportAssignmentRow[] = assignments.map((assignment) => {
      const completedCredits = credits.counted.get(assignment.id) ?? 0;
      const awaitingReviewCount = credits.awaiting.get(assignment.id) ?? 0;
      const requiredCredits = assignment.requirement.totalRequiredCredits;
      const percent = P.weightedCompletionFor(
        requiredCredits,
        completedCredits,
      );

      return {
        assignmentId: assignment.id,
        requirementId: assignment.requirement.id,
        requirementName: assignment.requirement.name,
        requiredCredits,
        completedCredits,
        percent,
        awaitingReviewCount,
        isMissingEvidence: awaitingReviewCount > 0,
        dueDate: assignment.dueDate,
        daysRemaining: U.daysRemaining(assignment.dueDate, at),
        band: U.bandFor({ percent, awaitingReviewCount, onTrackThreshold }),
      };
    });

    const requiredCredits = rows.reduce(
      (total, row) => total + row.requiredCredits,
      0,
    );
    const completedCredits = rows.reduce(
      (total, row) => total + row.completedCredits,
      0,
    );
    const awaitingReviewCount = rows.reduce(
      (total, row) => total + row.awaitingReviewCount,
      0,
    );
    const percent = P.weightedCompletionFor(requiredCredits, completedCredits);

    const unmet = rows
      .filter((row) => row.dueDate && row.percent < 100)
      .map((row) => row.dueDate)
      .filter((dueDate): dueDate is Date => dueDate !== null)
      .sort((left, right) => left.getTime() - right.getTime());

    return {
      memberId: member.id,
      userId: member.userId,
      fullName: member.user.fullName,
      email: member.user.email,
      memberNumber: member.memberNumber,
      groupId: member.groupId,
      groupTitle: member.group?.title ?? null,
      requiredCredits,
      completedCredits,
      percent,
      awaitingReviewCount,
      isMissingEvidence: awaitingReviewCount > 0,
      hasStarted: completedCredits > 0 || awaitingReviewCount > 0,
      earliestUnmetDeadline: unmet.at(0) ?? null,
      assignments: rows,
      band: rows.length
        ? U.bandFor({ percent, awaitingReviewCount, onTrackThreshold })
        : AssociationComplianceBand.NOT_STARTED,
    };
  }

  private categoryRows({
    rows,
    assignments,
    credits,
    onTrackThreshold,
  }: {
    rows: ReportMemberRow[];
    assignments: AssignmentRecord[];
    credits: CreditMaps;
    onTrackThreshold: number;
  }): ReportCategoryRow[] {
    const assigned = new Set(
      rows.flatMap((row) => row.assignments.map((one) => one.assignmentId)),
    );

    const buckets = new Map<
      string,
      {
        row: Omit<
          ReportCategoryRow,
          | "averageCompletedCredits"
          | "averagePercent"
          | "memberCount"
          | "belowHalfCount"
          | "behindCount"
          | "onTrackCount"
          | "atRiskCount"
        >;
        completed: number[];
      }
    >();

    for (const assignment of assignments) {
      if (!assigned.has(assignment.id)) continue;

      for (const category of assignment.requirement.categories) {
        const bucket = buckets.get(category.id) ?? {
          row: {
            categoryId: category.id,
            categoryName: category.name,
            mappedCategory: category.mappedCategory,
            requirementId: assignment.requirement.id,
            requirementName: assignment.requirement.name,
            requiredCredits: category.requiredCredits,
          },
          completed: [],
        };

        bucket.completed.push(
          credits.byCategory.get(`${assignment.id}:${category.id}`) ?? 0,
        );

        buckets.set(category.id, bucket);
      }
    }

    return [...buckets.values()].map(({ row, completed }) => {
      const memberCount = completed.length;
      const total = completed.reduce((sum, value) => sum + value, 0);
      const percents = completed.map((value) =>
        P.weightedCompletionFor(row.requiredCredits, value),
      );

      return {
        ...row,
        memberCount,
        averageCompletedCredits: memberCount
          ? P.round2(total / memberCount)
          : 0,
        averagePercent: P.weightedCompletionFor(
          row.requiredCredits * memberCount,
          total,
        ),
        belowHalfCount: percents.filter((percent) => percent < HALF_PERCENT)
          .length,
        behindCount: percents.filter((percent) => percent <= 0).length,
        onTrackCount: percents.filter((percent) => percent >= onTrackThreshold)
          .length,
        atRiskCount: percents.filter(
          (percent) => percent > 0 && percent < onTrackThreshold,
        ).length,
      };
    });
  }
}

type AssignmentRecord = {
  id: string;
  memberId: string;
  dueDate: Date | null;
  computedAt: Date | null;
  requirement: {
    id: string;
    name: string;
    totalRequiredCredits: number;
    categories: {
      id: string;
      name: string;
      mappedCategory: PDUCategory;
      requiredCredits: number;
      order: number;
    }[];
  };
};

type CreditMaps = {
  counted: Map<string, number>;
  awaiting: Map<string, number>;
  byCategory: Map<string, number>;
};
