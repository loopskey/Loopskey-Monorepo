import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { AssociationLearningContentStatus } from "@prisma/client";
import { AssociationRequirementStatus } from "@prisma/client";
import { PROFESSIONAL_COMPLIANCE_API } from "@professional/public/professional-compliance-api";
import { AssociationAttributionState } from "@prisma/client";
import { AssociationMemberStatus } from "@prisma/client";
import { AssociationAudienceKind } from "@prisma/client";
import { CATALOG_ENDORSEMENT_API } from "@landing/public/catalog-endorsement-api";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { ContentType, Prisma } from "@prisma/client";
import { daysRemaining } from "@association/utils/compliance-attribution.util";
import { PrismaService } from "@prisma/prisma.service";
import { round2 } from "@association/utils/compliance-attribution.util";

import { type ProfessionalComplianceApi } from "@professional/public/professional-compliance-api";
import { type CatalogEndorsementApi } from "@landing/public/catalog-endorsement-api";
import { type CatalogItemProjection } from "@landing/public/catalog-endorsement-api";

const ACTIVITY_LIMIT = 100;
const LEARNING_CONTENT_LIMIT = 100;

const ASSIGNMENT_SELECT = {
  id: true,
  cycleStart: true,
  cycleEnd: true,
  dueDate: true,
  percent: true,
  band: true,
  completedCredits: true,
  awaitingReviewCount: true,
  isMissingEvidence: true,
  member: { select: { id: true, groupId: true } },
  requirement: {
    select: {
      id: true,
      name: true,
      description: true,
      creditType: true,
      evidencePolicy: true,
      totalRequiredCredits: true,
      association: { select: { id: true, name: true } },
      categories: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          requiredCredits: true,
          mappedCategory: true,
        },
      },
    },
  },
} satisfies Prisma.AssociationRequirementAssignmentSelect;

type AssignmentRow = Prisma.AssociationRequirementAssignmentGetPayload<{
  select: typeof ASSIGNMENT_SELECT;
}>;

const CONTENT_SELECT = {
  id: true,
  contentType: true,
  contentId: true,
  externalTitle: true,
  externalProvider: true,
  externalUrl: true,
  description: true,
  category: true,
  indicativeCredits: true,
  requirementId: true,
} satisfies Prisma.AssociationLearningContentSelect;

type ContentRow = Prisma.AssociationLearningContentGetPayload<{
  select: typeof CONTENT_SELECT;
}>;

type CatalogRef = { contentType: ContentType; contentId: string };

const catalogRefOf = (row: ContentRow): CatalogRef | null =>
  row.contentType && row.contentId
    ? { contentType: row.contentType, contentId: row.contentId }
    : null;

const catalogKey = (reference: { contentType: string; contentId: string }) =>
  `${reference.contentType}:${reference.contentId}`;

const percentOf = (completed: number, required: number) => {
  if (required > 0) return (completed / required) * 100;
  return completed > 0 ? 100 : 0;
};

const project = (row: AssignmentRow, now: Date) => ({
  assignmentId: row.id,
  requirementId: row.requirement.id,
  name: row.requirement.name,
  description: row.requirement.description,
  associationId: row.requirement.association.id,
  associationName: row.requirement.association.name,
  creditType: row.requirement.creditType,
  evidencePolicy: row.requirement.evidencePolicy,
  requiredCredits: row.requirement.totalRequiredCredits,
  completedCredits: row.completedCredits,
  remainingCredits: round2(
    Math.max(row.requirement.totalRequiredCredits - row.completedCredits, 0),
  ),
  percent: row.percent,
  band: row.band,
  dueDate: row.dueDate,
  daysRemaining: daysRemaining(row.dueDate, now),
  awaitingReviewCount: row.awaitingReviewCount,
  isMissingEvidence: row.isMissingEvidence,
  cycleStart: row.cycleStart,
  cycleEnd: row.cycleEnd,
});

const byDeadline = (
  left: { dueDate: Date | null; name: string },
  right: { dueDate: Date | null; name: string },
) => {
  if (left.dueDate && right.dueDate)
    return left.dueDate.getTime() - right.dueDate.getTime();
  if (left.dueDate) return -1;
  if (right.dueDate) return 1;
  return left.name.localeCompare(right.name);
};

@Injectable()
export class AssociationMyRequirementsService {
  private readonly logger = new Logger(AssociationMyRequirementsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CATALOG_ENDORSEMENT_API)
    private readonly catalog: CatalogEndorsementApi,
    @Inject(PROFESSIONAL_COMPLIANCE_API)
    private readonly activities: ProfessionalComplianceApi,
  ) {}

  async list(userId: string) {
    const assignments = await this.currentAssignments(userId);
    const now = new Date();

    return assignments.map((row) => project(row, now)).sort(byDeadline);
  }

  async one(userId: string, requirementId: string) {
    const [assignment] = await this.currentAssignments(userId, {
      requirementId,
    });

    if (!assignment)
      throw new NotFoundException({
        code: AssociationMessageCode.REQUIREMENT_NOT_FOUND,
        message: "That requirement is not assigned to you.",
      });

    const [categories, activities, learningContents] = await Promise.all([
      this.categories(assignment),
      this.loggedActivities(userId, assignment.id),
      this.learningContents(userId, assignment),
    ]);

    return {
      ...project(assignment, new Date()),
      categories,
      activities,
      learningContents,
    };
  }

  async contentEndorsement(
    userId: string,
    contentType: ContentType,
    contentId: string,
  ) {
    const memberships = await this.prisma.associationMember.findMany({
      where: { userId, status: { not: AssociationMemberStatus.INACTIVE } },
      select: { id: true, groupId: true, associationId: true },
    });
    if (!memberships.length) return null;

    const contents = await this.prisma.associationLearningContent.findMany({
      where: {
        contentType,
        contentId,
        status: AssociationLearningContentStatus.PUBLISHED,
        associationId: {
          in: memberships.map((member) => member.associationId),
        },
      },
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      select: {
        id: true,
        associationId: true,
        requirementId: true,
        audienceKind: true,
        association: { select: { name: true } },
        targets: { select: { groupId: true, memberId: true } },
      },
    });

    for (const content of contents) {
      const member = memberships.find(
        (candidate) => candidate.associationId === content.associationId,
      );
      if (!member || !this.isTargetedContent(content, member)) continue;

      const resolved = await this.resolveEndorsedRequirement(
        userId,
        member,
        content,
      );
      if (resolved) return resolved;
    }

    return null;
  }

  private isTargetedContent(
    content: {
      audienceKind: AssociationAudienceKind;
      targets: { groupId: string | null; memberId: string | null }[];
    },
    member: { id: string; groupId: string | null },
  ) {
    switch (content.audienceKind) {
      case AssociationAudienceKind.ALL_MEMBERS:
        return true;
      case AssociationAudienceKind.GROUP:
        return (
          member.groupId !== null &&
          content.targets.some((target) => target.groupId === member.groupId)
        );
      case AssociationAudienceKind.SPECIFIC_MEMBERS:
        return content.targets.some((target) => target.memberId === member.id);
      default:
        return false;
    }
  }

  private async resolveEndorsedRequirement(
    userId: string,
    member: { id: string; associationId: string },
    content: {
      id: string;
      requirementId: string | null;
      association: { name: string };
    },
  ) {
    if (content.requirementId) {
      const [direct] = await this.currentAssignments(userId, {
        requirementId: content.requirementId,
      });
      if (direct)
        return {
          requirementId: content.requirementId,
          associationName: content.association.name,
          learningContentId: content.id,
          isDefaultRequirement: false,
        };
    }

    const [fallback] = await this.currentAssignments(userId, {
      associationId: member.associationId,
    });
    if (!fallback) return null;

    return {
      requirementId: fallback.requirement.id,
      associationName: content.association.name,
      learningContentId: content.id,
      isDefaultRequirement: true,
    };
  }

  private async currentAssignments(
    userId: string,
    filter?: { requirementId?: string; associationId?: string },
  ) {
    const rows = await this.prisma.associationRequirementAssignment.findMany({
      where: {
        isTargeted: true,
        member: {
          userId,
          status: { not: AssociationMemberStatus.INACTIVE },
        },
        requirement: {
          status: AssociationRequirementStatus.PUBLISHED,
          association: { deletedAt: null },
          ...(filter?.requirementId ? { id: filter.requirementId } : {}),
          ...(filter?.associationId
            ? { associationId: filter.associationId }
            : {}),
        },
      },
      orderBy: [{ cycleStart: "desc" }, { id: "asc" }],
      select: ASSIGNMENT_SELECT,
    });

    const latest = new Map<string, AssignmentRow>();
    for (const row of rows)
      if (!latest.has(row.requirement.id)) latest.set(row.requirement.id, row);

    return [...latest.values()];
  }

  private async categories(assignment: AssignmentRow) {
    const credits = await this.prisma.associationCreditAttribution.groupBy({
      by: ["categoryId"],
      where: {
        assignmentId: assignment.id,
        state: AssociationAttributionState.COUNTED,
        categoryId: { not: null },
      },
      _sum: { creditedAmount: true },
    });

    const completedBy = new Map(
      credits.map((row) => [row.categoryId, row._sum.creditedAmount ?? 0]),
    );

    return assignment.requirement.categories.map((category) => {
      const completedCredits = completedBy.get(category.id) ?? 0;

      return {
        id: category.id,
        name: category.name,
        requiredCredits: category.requiredCredits,
        completedCredits,
        mappedCategory: category.mappedCategory,
        percent: percentOf(completedCredits, category.requiredCredits),
      };
    });
  }

  private async loggedActivities(userId: string, assignmentId: string) {
    const attributions =
      await this.prisma.associationCreditAttribution.findMany({
        where: { assignmentId },
        orderBy: [{ activityDate: "desc" }, { id: "desc" }],
        take: ACTIVITY_LIMIT,
        select: {
          activityId: true,
          creditedAmount: true,
          isLate: true,
          state: true,
          category: { select: { name: true } },
        },
      });

    const details = await this.activities.activityDetailsForOwners(
      attributions.map((attribution) => attribution.activityId),
      [userId],
    );
    const detailById = new Map(details.map((detail) => [detail.id, detail]));

    return attributions.flatMap((attribution) => {
      const detail = detailById.get(attribution.activityId);
      if (!detail) return [];

      return [
        {
          activityId: detail.id,
          title: detail.title,
          date: detail.date,
          category: detail.category,
          credits: detail.credits,
          creditedAmount: attribution.creditedAmount,
          state: attribution.state,
          isLate: attribution.isLate,
          hasEvidence: detail.hasEvidence,
          categoryName: attribution.category?.name ?? null,
          reviewNote: detail.reviewNote,
        },
      ];
    });
  }

  private async learningContents(userId: string, assignment: AssignmentRow) {
    const { member } = assignment;

    const rows = await this.prisma.associationLearningContent.findMany({
      where: {
        associationId: assignment.requirement.association.id,
        status: AssociationLearningContentStatus.PUBLISHED,
        AND: [
          {
            OR: [
              { requirementId: assignment.requirement.id },
              { requirementId: null },
            ],
          },
          { OR: this.audienceMatch(member) },
        ],
      },
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      take: LEARNING_CONTENT_LIMIT,
      select: CONTENT_SELECT,
    });

    return this.projectContent(userId, rows, {
      requirementId: assignment.requirement.id,
      associationId: assignment.requirement.association.id,
      associationName: assignment.requirement.association.name,
    });
  }

  async myLearningContent(userId: string) {
    const memberships = await this.prisma.associationMember.findMany({
      where: { userId, status: { not: AssociationMemberStatus.INACTIVE } },
      select: {
        id: true,
        groupId: true,
        associationId: true,
        association: { select: { name: true } },
      },
    });
    if (!memberships.length) return [];

    const perAssociation = await Promise.all(
      memberships.map((member) =>
        this.prisma.associationLearningContent.findMany({
          where: {
            associationId: member.associationId,
            requirementId: null,
            status: AssociationLearningContentStatus.PUBLISHED,
            OR: this.audienceMatch(member),
          },
          orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
          take: LEARNING_CONTENT_LIMIT,
          select: CONTENT_SELECT,
        }),
      ),
    );

    const projected = await Promise.all(
      memberships.map((member, index) =>
        this.projectContent(userId, perAssociation[index], {
          requirementId: null,
          associationId: member.associationId,
          associationName: member.association.name,
        }),
      ),
    );

    return projected.flat().slice(0, LEARNING_CONTENT_LIMIT);
  }

  private audienceMatch(member: { id: string; groupId: string | null }) {
    return [
      { audienceKind: AssociationAudienceKind.ALL_MEMBERS },
      ...(member.groupId
        ? [
            {
              audienceKind: AssociationAudienceKind.GROUP,
              targets: { some: { groupId: member.groupId } },
            },
          ]
        : []),
      {
        audienceKind: AssociationAudienceKind.SPECIFIC_MEMBERS,
        targets: { some: { memberId: member.id } },
      },
    ];
  }

  private async projectContent(
    userId: string,
    rows: ContentRow[],
    context: {
      requirementId: string | null;
      associationId: string;
      associationName: string;
    },
  ) {
    if (!rows.length) return [];

    const [resolved, logged] = await Promise.all([
      this.resolveCatalog(rows),
      this.activities.activitiesForMembers({ userIds: [userId] }),
    ]);

    return rows.map((row) => {
      const reference = catalogRefOf(row);
      const catalog = reference
        ? (resolved?.get(catalogKey(reference)) ?? null)
        : null;

      const isCompleted = logged.some(
        (activity) =>
          activity.associationLearningContentId === row.id ||
          (reference !== null &&
            activity.contentType === reference.contentType &&
            activity.contentId === reference.contentId),
      );

      return {
        id: row.id,
        isExternal: reference === null,
        isCompleted,
        title: catalog?.title ?? row.externalTitle ?? "",
        provider: catalog?.provider ?? row.externalProvider,
        slug: catalog?.slug ?? null,
        imageUrl: catalog?.imageUrl ?? null,
        isAvailable: reference
          ? (catalog?.isAvailable ?? resolved === null)
          : true,
        contentType: row.contentType,
        contentId: row.contentId,
        externalUrl: row.externalUrl,
        description: row.description,
        category: row.category,
        indicativeCredits: row.indicativeCredits,
        isLinkedToRequirement:
          row.requirementId !== null &&
          row.requirementId === context.requirementId,
        associationId: context.associationId,
        associationName: context.associationName,
      };
    });
  }

  private async resolveCatalog(rows: ContentRow[]) {
    const references = rows
      .map(catalogRefOf)
      .filter((reference): reference is CatalogRef => reference !== null);

    if (!references.length) return new Map<string, CatalogItemProjection>();

    try {
      const items = await this.catalog.resolveCatalogItems(references);
      return new Map(items.map((item) => [catalogKey(item), item]));
    } catch (error) {
      this.logger.warn("The learning catalogue could not be resolved", {
        references: references.length,
        reason: error instanceof Error ? error.message : "unknown",
      });
      return null;
    }
  }
}
