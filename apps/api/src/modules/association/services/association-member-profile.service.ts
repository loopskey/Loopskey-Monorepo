import { AssociationLearningContentStatus, PDUSource } from "@prisma/client";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { AssociationAudienceKind, ContentType } from "@prisma/client";
import { AssociationAttributionState, Prisma } from "@prisma/client";
import { AssociationComplianceReadService } from "@association/services/association-compliance-read.service";
import { AssociationMessageDeliveryState } from "@prisma/client";
import { AssociationRequirementStatus } from "@prisma/client";
import { PROFESSIONAL_COMPLIANCE_API } from "@professional/public/professional-compliance-api";
import { AssociationPaginationInput } from "@association/dtos/association-pagination.input";
import { AssociationEvidencePolicy } from "@prisma/client";
import { AssociationAccessService } from "@association/services/association-access.service";
import { CATALOG_ENDORSEMENT_API } from "@landing/public/catalog-endorsement-api";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { MemberActivityFilter } from "@association/types/association-member-profile.types";
import { PROFILE_MEMBER_SELECT } from "@association/types/association-member-profile.types";
import { MemberActivityScope } from "@association/types/association-member-profile.types";
import { ProfileMemberRecord } from "@association/types/association-member-profile.types";
import { TAssociationUser } from "@association/types/association-service.types";
import { daysRemaining } from "@association/utils/compliance-attribution.util";
import { PrismaService } from "@prisma/prisma.service";
import { overallFor } from "@association/utils/compliance-attribution.util";
import { paceFor } from "@association/utils/compliance-attribution.util";

import { type ProfessionalComplianceApi } from "@professional/public/professional-compliance-api";
import { type CatalogEndorsementApi } from "@landing/public/catalog-endorsement-api";
import { type CatalogItemProjection } from "@landing/public/catalog-endorsement-api";

const ATTRIBUTION_SCAN_LIMIT = 2000;
const CONTENT_LIMIT = 50;

const MEMBER_CONTENT_SELECT = {
  id: true,
  contentType: true,
  contentId: true,
  externalTitle: true,
  externalProvider: true,
  indicativeCredits: true,
} satisfies Prisma.AssociationLearningContentSelect;

type MemberContentRow = Prisma.AssociationLearningContentGetPayload<{
  select: typeof MEMBER_CONTENT_SELECT;
}>;

type CatalogRef = { contentType: ContentType; contentId: string };

const catalogRefOf = (row: MemberContentRow): CatalogRef | null =>
  row.contentType && row.contentId
    ? { contentType: row.contentType, contentId: row.contentId }
    : null;

const catalogKey = (reference: { contentType: string; contentId: string }) =>
  `${reference.contentType}:${reference.contentId}`;

const STATE_PRECEDENCE = [
  AssociationAttributionState.AWAITING_REVIEW,
  AssociationAttributionState.REJECTED,
  AssociationAttributionState.COUNTED,
] as const;

const projectMember = ({ user, ...member }: ProfileMemberRecord) => ({
  ...member,
  email: user.email,
  fullName: user.fullName,
  avatarUrl: user.avatarUrl,
  lastLoginAt: user.lastLoginAt,
  requirementNames: [] as string[],
  complianceSummary: null,
});

@Injectable()
export class AssociationMemberProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly access: AssociationAccessService,
    private readonly compliance: AssociationComplianceReadService,
    @Inject(PROFESSIONAL_COMPLIANCE_API)
    private readonly professional: ProfessionalComplianceApi,
    @Inject(CATALOG_ENDORSEMENT_API)
    private readonly catalog: CatalogEndorsementApi,
  ) {}

  async requireMember(
    user: TAssociationUser,
    memberId: string,
    associationId?: string,
  ) {
    const association = await this.access.requireReadable(user, associationId);

    const member = await this.prisma.associationMember.findFirst({
      where: { id: memberId, associationId: association.id },
      select: PROFILE_MEMBER_SELECT,
    });

    if (!member)
      throw new NotFoundException({
        code: AssociationMessageCode.MEMBER_NOT_FOUND,
        message: "Member not found.",
      });

    return { association, member };
  }

  async profile(
    user: TAssociationUser,
    memberId: string,
    associationId?: string,
  ) {
    const { association, member } = await this.requireMember(
      user,
      memberId,
      associationId,
    );

    const compliance = await this.compliance.memberCompliance(
      user,
      memberId,
      associationId,
    );

    const onTrackThreshold = await this.compliance.onTrackThreshold(
      association.id,
    );

    const overall = overallFor({
      assignments: compliance.assignments,
      onTrackThreshold,
    });

    const now = new Date();
    const deadline = this.nearestDeadline(compliance.assignments);

    const certificates = await this.professional.certificatesForOwners([
      member.userId,
    ]);

    const unlinkedLearningContent = await this.contentCompletionsFor(
      association,
      member,
      { requirementId: null },
    );

    const lastNotification =
      await this.prisma.associationMessageDelivery.findFirst({
        where: { memberId, state: AssociationMessageDeliveryState.SENT },
        orderBy: { sentAt: "desc" },
        select: { sentAt: true },
      });

    return {
      member: projectMember(member),
      assignments: compliance.assignments,
      isMissingEvidence: compliance.isMissingEvidence,
      lastNotifiedAt: lastNotification?.sentAt ?? null,
      summary: {
        percent: overall.percent,
        band: overall.band,
        awaitingReviewCount: overall.awaitingReviewCount,
        creditsRequired: overall.requiredCredits,
        creditsCompleted: overall.completedCredits,
        creditsRemaining: this.sum(
          compliance.assignments.map((row) =>
            Math.max(0, row.requiredCredits - row.completedCredits),
          ),
        ),
        nearestDueDate: deadline?.dueDate ?? null,
        nearestDueDays: daysRemaining(deadline?.dueDate ?? null, now),
        nearestRequirementId: deadline?.requirementId ?? null,
        nearestRequirementName: deadline?.requirementName ?? null,
        pacePercent: paceFor(
          deadline?.cycleStart ?? null,
          deadline?.dueDate ?? null,
          now,
        ),
      },
      cumulative: deadline
        ? await this.cumulative(deadline.id, deadline.requiredCredits)
        : [],
      certificates: certificates.map((certificate) => ({
        ...certificate,
        memberId: member.id,
      })),
      unlinkedLearningContent,
    };
  }

  private sum(values: number[]) {
    return values.reduce((total, value) => total + value, 0);
  }

  private nearestDeadline(
    assignments: {
      id: string;
      dueDate: Date | null;
      cycleStart: Date;
      requirementId: string;
      requirementName: string;
      requiredCredits: number;
    }[],
  ) {
    const dated = assignments
      .filter((assignment) => assignment.dueDate)
      .sort(
        (left, right) =>
          (left.dueDate?.getTime() ?? 0) - (right.dueDate?.getTime() ?? 0),
      );

    return dated.at(0) ?? assignments.at(0) ?? null;
  }

  private async cumulative(assignmentId: string, requiredCredits: number) {
    const attributions =
      await this.prisma.associationCreditAttribution.findMany({
        where: {
          assignmentId,
          state: AssociationAttributionState.COUNTED,
        },
        select: { activityDate: true, creditedAmount: true },
        orderBy: { activityDate: "asc" },
      });

    let running = 0;

    return attributions.map((attribution) => {
      running += attribution.creditedAmount;
      return {
        date: attribution.activityDate,
        credits: running,
        requiredCredits,
      };
    });
  }

  async activities(
    user: TAssociationUser,
    memberId: string,
    filter: MemberActivityFilter = {},
    pagination?: AssociationPaginationInput,
    associationId?: string,
  ) {
    const { association, member } = await this.requireMember(
      user,
      memberId,
      associationId,
    );

    return this.activitiesFor(association, member, filter, pagination);
  }

  async requirementEvidence(
    user: TAssociationUser,
    memberId: string,
    requirementId: string,
    pagination?: AssociationPaginationInput,
    associationId?: string,
  ) {
    const { association, member } = await this.requireMember(
      user,
      memberId,
      associationId,
    );

    const requirement = await this.prisma.associationRequirement.findFirst({
      where: { id: requirementId, associationId: association.id },
      select: { id: true },
    });

    if (!requirement)
      throw new NotFoundException({
        code: AssociationMessageCode.REQUIREMENT_NOT_FOUND,
        message: "That requirement does not belong to this association.",
      });

    const [activitiesPage, contentCompletions] = await Promise.all([
      this.activitiesFor(association, member, { requirementId }, pagination),
      this.contentCompletionsFor(association, member, { requirementId }),
    ]);

    const certificateEvidence = activitiesPage.items.filter(
      (item) =>
        item.hasEvidence || item.source === PDUSource.CERTIFICATION_PROGRAM,
    );

    return {
      requirementId,
      activities: activitiesPage,
      contentCompletions,
      certificateEvidence,
    };
  }

  private async activitiesFor(
    association: { id: string },
    member: { id: string; userId: string },
    filter: MemberActivityFilter = {},
    pagination?: AssociationPaginationInput,
  ) {
    const scope = await this.scopedActivities(association.id, member.id);

    const matching = scope.filter(
      (activity) =>
        (!filter.state || activity.state === filter.state) &&
        (!filter.requirementId ||
          activity.requirements.some(
            (requirement) => requirement.id === filter.requirementId,
          )),
    );

    const take = pagination?.take ?? 20;
    const cursorIndex = pagination?.cursor
      ? matching.findIndex(
          (activity) => activity.activityId === pagination.cursor,
        )
      : -1;
    const start = cursorIndex < 0 ? 0 : cursorIndex + 1;
    const page = matching.slice(start, start + take);

    const details = await this.professional.activityDetailsForOwners(
      page.map((activity) => activity.activityId),
      [member.userId],
    );

    const byId = new Map(details.map((detail) => [detail.id, detail]));

    const items = page.flatMap((activity) => {
      const detail = byId.get(activity.activityId);
      if (!detail) return [];

      return [
        {
          id: activity.activityId,
          memberId: member.id,
          title: detail.title,
          source: detail.source,
          provider: detail.provider,
          category: detail.category,
          creditType: detail.creditType,
          credits: detail.credits,
          date: detail.date,
          state: activity.state,
          isLate: activity.isLate,
          hasEvidence: detail.hasEvidence,
          evidenceNote: detail.evidenceNote,
          evidenceUrl: detail.evidenceUrl,
          reviewNote: detail.reviewNote,
          files: detail.files,
          canReview:
            activity.state === AssociationAttributionState.AWAITING_REVIEW &&
            activity.requirements.some((requirement) => requirement.canReview),
          requirements: activity.requirements,
        },
      ];
    });

    return {
      items,
      totalCount: matching.length,
      counts: {
        counted: this.countState(scope, AssociationAttributionState.COUNTED),
        rejected: this.countState(scope, AssociationAttributionState.REJECTED),
        awaitingReview: this.countState(
          scope,
          AssociationAttributionState.AWAITING_REVIEW,
        ),
      },
      pageInfo: {
        hasNextPage: start + take < matching.length,
        nextCursor:
          start + take < matching.length
            ? (page.at(-1)?.activityId ?? null)
            : null,
      },
    };
  }

  private countState(
    scope: MemberActivityScope[],
    state: AssociationAttributionState,
  ) {
    return scope.filter((activity) => activity.state === state).length;
  }

  private async scopedActivities(
    associationId: string,
    memberId: string,
  ): Promise<MemberActivityScope[]> {
    const attributions =
      await this.prisma.associationCreditAttribution.findMany({
        where: this.attributionScope(associationId, memberId),
        select: {
          activityId: true,
          activityDate: true,
          state: true,
          isLate: true,
          creditedAmount: true,
          assignment: {
            select: {
              requirement: {
                select: { id: true, name: true, evidencePolicy: true },
              },
            },
          },
        },
        orderBy: [{ activityDate: "desc" }, { activityId: "desc" }],
        take: ATTRIBUTION_SCAN_LIMIT,
      });

    const byActivity = new Map<string, MemberActivityScope>();

    for (const attribution of attributions) {
      const { requirement } = attribution.assignment;
      const current = byActivity.get(attribution.activityId) ?? {
        activityId: attribution.activityId,
        activityDate: attribution.activityDate,
        state: attribution.state,
        isLate: attribution.isLate,
        requirements: [],
      };

      current.state = this.dominantState(current.state, attribution.state);
      current.isLate ||= attribution.isLate;
      current.requirements.push({
        id: requirement.id,
        name: requirement.name,
        creditedAmount: attribution.creditedAmount,
        canReview:
          requirement.evidencePolicy ===
          AssociationEvidencePolicy.REQUIRED_NEEDS_REVIEW,
      });

      byActivity.set(attribution.activityId, current);
    }

    return [...byActivity.values()];
  }

  private attributionScope(
    associationId: string,
    memberId: string,
  ): Prisma.AssociationCreditAttributionWhereInput {
    return {
      assignment: {
        memberId,
        member: { associationId },
        requirement: {
          associationId,
          status: AssociationRequirementStatus.PUBLISHED,
        },
      },
    };
  }

  private dominantState(
    left: AssociationAttributionState,
    right: AssociationAttributionState,
  ) {
    return STATE_PRECEDENCE.indexOf(left) <= STATE_PRECEDENCE.indexOf(right)
      ? left
      : right;
  }

  private async contentCompletionsFor(
    association: { id: string },
    member: { id: string; userId: string; group: { id: string } | null },
    filter: { requirementId: string | null },
  ) {
    const rows = await this.prisma.associationLearningContent.findMany({
      where: {
        associationId: association.id,
        requirementId: filter.requirementId,
        status: AssociationLearningContentStatus.PUBLISHED,
        OR: [
          { audienceKind: AssociationAudienceKind.ALL_MEMBERS },
          ...(member.group
            ? [
                {
                  audienceKind: AssociationAudienceKind.GROUP,
                  targets: { some: { groupId: member.group.id } },
                },
              ]
            : []),
          {
            audienceKind: AssociationAudienceKind.SPECIFIC_MEMBERS,
            targets: { some: { memberId: member.id } },
          },
        ],
      },
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      take: CONTENT_LIMIT,
      select: MEMBER_CONTENT_SELECT,
    });

    if (!rows.length) return [];

    const [resolved, logged] = await Promise.all([
      this.resolveCatalog(rows),
      this.professional.activitiesForMembers({ userIds: [member.userId] }),
    ]);

    return rows.flatMap((row) => {
      const reference = catalogRefOf(row);
      const match = logged.find(
        (activity) =>
          activity.associationLearningContentId === row.id ||
          (reference !== null &&
            activity.contentType === reference.contentType &&
            activity.contentId === reference.contentId),
      );
      if (!match) return [];

      const catalog = reference
        ? (resolved?.get(catalogKey(reference)) ?? null)
        : null;

      return [
        {
          id: row.id,
          title: catalog?.title ?? row.externalTitle ?? "",
          isExternal: reference === null,
          provider: catalog?.provider ?? row.externalProvider,
          contentType: row.contentType,
          activityId: match.id,
          activityDate: match.date,
          credits: match.credits,
          indicativeCredits: row.indicativeCredits,
        },
      ];
    });
  }

  private async resolveCatalog(rows: MemberContentRow[]) {
    const references = rows
      .map(catalogRefOf)
      .filter((reference): reference is CatalogRef => reference !== null);

    if (!references.length) return new Map<string, CatalogItemProjection>();

    try {
      const items = await this.catalog.resolveCatalogItems(references);
      return new Map(items.map((item) => [catalogKey(item), item]));
    } catch {
      return null;
    }
  }
}
