import { NotFoundException } from "@nestjs/common";
import {
  AssociationAttributionState,
  AssociationAudienceKind,
  AssociationComplianceBand,
  AssociationEvidencePolicy,
  AssociationLearningContentStatus,
  ContentType,
  CreditType,
  PDUCategory,
} from "@prisma/client";

import type { CatalogEndorsementApi } from "@landing/public/catalog-endorsement-api";
import type { ProfessionalComplianceApi } from "@professional/public/professional-compliance-api";
import type { PrismaService } from "@prisma/prisma.service";

import { AssociationMyRequirementsService } from "./association-my-requirements.service";

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

const assignment = (
  id: string,
  requirementId: string,
  overrides: Record<string, unknown> = {},
) => ({
  id,
  cycleStart: day("2026-01-01"),
  cycleEnd: null,
  dueDate: day("2026-12-31"),
  percent: 40,
  band: AssociationComplianceBand.AT_RISK,
  completedCredits: 16,
  awaitingReviewCount: 1,
  isMissingEvidence: true,
  member: { id: "member-1", groupId: "group-1" },
  requirement: {
    id: requirementId,
    name: `Requirement ${requirementId}`,
    description: null,
    creditType: CreditType.CPD,
    evidencePolicy: AssociationEvidencePolicy.REQUIRED_NEEDS_REVIEW,
    totalRequiredCredits: 40,
    association: { id: "assoc-1", name: "Engineers Association" },
    categories: [
      {
        id: "cat-1",
        name: "Technical",
        requiredCredits: 20,
        mappedCategory: PDUCategory.TECHNICAL,
      },
      {
        id: "cat-2",
        name: "Ethics",
        requiredCredits: 0,
        mappedCategory: PDUCategory.ETHICS,
      },
    ],
  },
  ...overrides,
});

const createService = () => {
  const prisma = {
    associationRequirementAssignment: { findMany: jest.fn() },
    associationCreditAttribution: {
      groupBy: jest.fn().mockResolvedValue([]),
      findMany: jest.fn().mockResolvedValue([]),
    },
    associationLearningContent: { findMany: jest.fn().mockResolvedValue([]) },
    associationMember: { findMany: jest.fn().mockResolvedValue([]) },
  };
  const catalog = { resolveCatalogItems: jest.fn().mockResolvedValue([]) };
  const activities = {
    activityDetailsForOwners: jest.fn().mockResolvedValue([]),
    activitiesForMembers: jest.fn().mockResolvedValue([]),
  };
  const service = new AssociationMyRequirementsService(
    prisma as unknown as PrismaService,
    catalog as unknown as CatalogEndorsementApi,
    activities as unknown as ProfessionalComplianceApi,
  );
  return { service, prisma, catalog, activities };
};

describe("AssociationMyRequirementsService.list", () => {
  it("scopes to the caller's published, targeted, active assignments", async () => {
    const { service, prisma } = createService();
    prisma.associationRequirementAssignment.findMany.mockResolvedValue([]);

    await expect(service.list("user-1")).resolves.toEqual([]);

    const where =
      prisma.associationRequirementAssignment.findMany.mock.calls[0][0].where;
    expect(where.isTargeted).toBe(true);
    expect(where.member.userId).toBe("user-1");
    expect(where.member.status).toEqual({ not: "INACTIVE" });
    expect(where.requirement.status).toBe("PUBLISHED");
    expect(where.requirement.association).toEqual({ deletedAt: null });
  });

  it("keeps only the newest cycle of each requirement and orders by deadline", async () => {
    const { service, prisma } = createService();
    const later = assignment("a-late", "req-b", {
      cycleStart: day("2026-06-01"),
      dueDate: day("2026-06-30"),
    });
    const earlier = assignment("a-old", "req-b", {
      cycleStart: day("2025-06-01"),
    });
    const other = assignment("a-other", "req-a", {
      dueDate: day("2027-03-01"),
    });
    prisma.associationRequirementAssignment.findMany.mockResolvedValue([
      other,
      later,
      earlier,
    ]);

    const rows = await service.list("user-1");

    expect(rows.map((row) => row.assignmentId)).toEqual(["a-late", "a-other"]);
    expect(rows[0]).toMatchObject({
      associationName: "Engineers Association",
      requiredCredits: 40,
      completedCredits: 16,
      remainingCredits: 24,
      band: AssociationComplianceBand.AT_RISK,
    });
  });

  it("puts a requirement with no deadline after those with one", async () => {
    const { service, prisma } = createService();
    prisma.associationRequirementAssignment.findMany.mockResolvedValue([
      assignment("a-open", "req-a", { dueDate: null }),
      assignment("a-dated", "req-b"),
    ]);

    const rows = await service.list("user-1");

    expect(rows.map((row) => row.assignmentId)).toEqual(["a-dated", "a-open"]);
  });
});

describe("AssociationMyRequirementsService.one", () => {
  it("refuses a requirement that is not assigned to the caller", async () => {
    const { service, prisma } = createService();
    prisma.associationRequirementAssignment.findMany.mockResolvedValue([]);

    await expect(service.one("user-1", "req-x")).rejects.toBeInstanceOf(
      NotFoundException,
    );
    const where =
      prisma.associationRequirementAssignment.findMany.mock.calls[0][0].where;
    expect(where.requirement.id).toBe("req-x");
    expect(where.member.userId).toBe("user-1");
  });

  it("reports category progress from counted credits only", async () => {
    const { service, prisma } = createService();
    prisma.associationRequirementAssignment.findMany.mockResolvedValue([
      assignment("a-1", "req-1"),
    ]);
    prisma.associationCreditAttribution.groupBy.mockResolvedValue([
      { categoryId: "cat-1", _sum: { creditedAmount: 10 } },
    ]);

    const detail = await service.one("user-1", "req-1");

    const where =
      prisma.associationCreditAttribution.groupBy.mock.calls[0][0].where;
    expect(where.state).toBe(AssociationAttributionState.COUNTED);
    expect(detail.categories).toEqual([
      {
        id: "cat-1",
        name: "Technical",
        requiredCredits: 20,
        completedCredits: 10,
        mappedCategory: PDUCategory.TECHNICAL,
        percent: 50,
      },
      {
        id: "cat-2",
        name: "Ethics",
        requiredCredits: 0,
        completedCredits: 0,
        mappedCategory: PDUCategory.ETHICS,
        percent: 0,
      },
    ]);
  });

  it("joins each attribution to its activity and drops one the professional deleted", async () => {
    const { service, prisma, activities } = createService();
    prisma.associationRequirementAssignment.findMany.mockResolvedValue([
      assignment("a-1", "req-1"),
    ]);
    prisma.associationCreditAttribution.findMany.mockResolvedValue([
      {
        activityId: "act-1",
        creditedAmount: 0,
        isLate: false,
        state: AssociationAttributionState.AWAITING_REVIEW,
        category: { name: "Technical" },
      },
      {
        activityId: "act-gone",
        creditedAmount: 2,
        isLate: false,
        state: AssociationAttributionState.COUNTED,
        category: null,
      },
    ]);
    activities.activityDetailsForOwners.mockResolvedValue([
      {
        id: "act-1",
        title: "Bridge design course",
        date: day("2026-03-01"),
        category: "TECHNICAL",
        credits: 4,
        hasEvidence: true,
        reviewNote: null,
      },
    ]);

    const detail = await service.one("user-1", "req-1");

    expect(activities.activityDetailsForOwners).toHaveBeenCalledWith(
      ["act-1", "act-gone"],
      ["user-1"],
    );
    expect(detail.activities).toEqual([
      {
        activityId: "act-1",
        title: "Bridge design course",
        date: day("2026-03-01"),
        category: "TECHNICAL",
        credits: 4,
        creditedAmount: 0,
        state: AssociationAttributionState.AWAITING_REVIEW,
        isLate: false,
        hasEvidence: true,
        categoryName: "Technical",
        reviewNote: null,
      },
    ]);
  });

  it("limits learning content to published items whose audience covers the member", async () => {
    const { service, prisma } = createService();
    prisma.associationRequirementAssignment.findMany.mockResolvedValue([
      assignment("a-1", "req-1"),
    ]);

    await service.one("user-1", "req-1");

    const where =
      prisma.associationLearningContent.findMany.mock.calls[0][0].where;
    expect(where.associationId).toBe("assoc-1");
    expect(where.status).toBe("PUBLISHED");
    expect(where.AND[0].OR).toEqual([
      { requirementId: "req-1" },
      { requirementId: null },
    ]);
    expect(where.AND[1].OR).toEqual([
      { audienceKind: AssociationAudienceKind.ALL_MEMBERS },
      {
        audienceKind: AssociationAudienceKind.GROUP,
        targets: { some: { groupId: "group-1" } },
      },
      {
        audienceKind: AssociationAudienceKind.SPECIFIC_MEMBERS,
        targets: { some: { memberId: "member-1" } },
      },
    ]);
  });

  it("skips the group audience for a member with no group", async () => {
    const { service, prisma } = createService();
    prisma.associationRequirementAssignment.findMany.mockResolvedValue([
      assignment("a-1", "req-1", { member: { id: "member-1", groupId: null } }),
    ]);

    await service.one("user-1", "req-1");

    const where =
      prisma.associationLearningContent.findMany.mock.calls[0][0].where;
    const audienceOR = where.AND[1].OR;
    expect(audienceOR).toHaveLength(2);
    expect(
      audienceOR.some(
        (branch: { audienceKind: string }) => branch.audienceKind === "GROUP",
      ),
    ).toBe(false);
  });

  it("marks content complete from a linked activity or a catalogue completion", async () => {
    const { service, prisma, catalog, activities } = createService();
    prisma.associationRequirementAssignment.findMany.mockResolvedValue([
      assignment("a-1", "req-1"),
    ]);
    prisma.associationLearningContent.findMany.mockResolvedValue([
      {
        id: "content-ext",
        contentType: null,
        contentId: null,
        externalTitle: "Vendor webinar",
        externalProvider: "Vendor",
        externalUrl: "https://example.com/webinar",
        description: null,
        category: "TECHNICAL",
        indicativeCredits: 2,
      },
      {
        id: "content-cat",
        contentType: ContentType.COURSE,
        contentId: "course-1",
        externalTitle: null,
        externalProvider: null,
        externalUrl: null,
        description: null,
        category: null,
        indicativeCredits: null,
      },
      {
        id: "content-todo",
        contentType: null,
        contentId: null,
        externalTitle: "Open item",
        externalProvider: null,
        externalUrl: "https://example.com/open",
        description: null,
        category: null,
        indicativeCredits: null,
      },
    ]);
    catalog.resolveCatalogItems.mockResolvedValue([
      {
        contentType: "COURSE",
        contentId: "course-1",
        title: "Structural Basics",
        slug: "structural-basics",
        provider: "Loopskey",
        imageUrl: null,
        isAvailable: true,
      },
    ]);
    activities.activitiesForMembers.mockResolvedValue([
      {
        associationLearningContentId: "content-ext",
        contentType: null,
        contentId: null,
      },
      {
        associationLearningContentId: null,
        contentType: "COURSE",
        contentId: "course-1",
      },
    ]);

    const { learningContents } = await service.one("user-1", "req-1");

    expect(
      learningContents.map((item) => [item.id, item.isCompleted, item.title]),
    ).toEqual([
      ["content-ext", true, "Vendor webinar"],
      ["content-cat", true, "Structural Basics"],
      ["content-todo", false, "Open item"],
    ]);
    expect(learningContents[0].isExternal).toBe(true);
    expect(learningContents[0].slug).toBeNull();
    expect(learningContents[1].isExternal).toBe(false);
    expect(learningContents[1].slug).toBe("structural-basics");
  });

  it("keeps catalogue items visible when the catalogue cannot be resolved", async () => {
    const { service, prisma, catalog } = createService();
    prisma.associationRequirementAssignment.findMany.mockResolvedValue([
      assignment("a-1", "req-1"),
    ]);
    prisma.associationLearningContent.findMany.mockResolvedValue([
      {
        id: "content-cat",
        contentType: ContentType.COURSE,
        contentId: "course-1",
        externalTitle: null,
        externalProvider: null,
        externalUrl: null,
        description: null,
        category: null,
        indicativeCredits: null,
      },
    ]);
    catalog.resolveCatalogItems.mockRejectedValue(new Error("catalogue down"));

    const { learningContents } = await service.one("user-1", "req-1");

    expect(learningContents).toHaveLength(1);
    expect(learningContents[0].isAvailable).toBe(true);
  });
});

describe("AssociationMyRequirementsService.contentEndorsement", () => {
  const membership = (overrides: Record<string, unknown> = {}) => ({
    id: "member-1",
    groupId: null,
    associationId: "assoc-1",
    ...overrides,
  });

  const content = (overrides: Record<string, unknown> = {}) => ({
    id: "content-1",
    associationId: "assoc-1",
    requirementId: "req-1",
    audienceKind: AssociationAudienceKind.ALL_MEMBERS,
    association: { name: "Engineers Association" },
    targets: [],
    ...overrides,
  });

  it("returns null when the caller has no active association membership", async () => {
    const { service, prisma } = createService();
    prisma.associationMember.findMany.mockResolvedValue([]);

    const result = await service.contentEndorsement(
      "user-1",
      ContentType.COURSE,
      "course-1",
    );

    expect(result).toBeNull();
    expect(prisma.associationLearningContent.findMany).not.toHaveBeenCalled();
  });

  it("preselects the requirement the endorsed content is linked to", async () => {
    const { service, prisma } = createService();
    prisma.associationMember.findMany.mockResolvedValue([membership()]);
    prisma.associationLearningContent.findMany.mockResolvedValue([content()]);
    prisma.associationRequirementAssignment.findMany.mockResolvedValue([
      assignment("a-1", "req-1"),
    ]);

    const result = await service.contentEndorsement(
      "user-1",
      ContentType.COURSE,
      "course-1",
    );

    expect(result).toEqual({
      requirementId: "req-1",
      associationName: "Engineers Association",
      learningContentId: "content-1",
      isDefaultRequirement: false,
    });

    const contentWhere =
      prisma.associationLearningContent.findMany.mock.calls[0][0].where;
    expect(contentWhere.status).toBe(
      AssociationLearningContentStatus.PUBLISHED,
    );
    expect(contentWhere.associationId).toEqual({ in: ["assoc-1"] });
  });

  it("falls back to the association's first assigned requirement when the content has none", async () => {
    const { service, prisma } = createService();
    prisma.associationMember.findMany.mockResolvedValue([membership()]);
    prisma.associationLearningContent.findMany.mockResolvedValue([
      content({ requirementId: null }),
    ]);
    prisma.associationRequirementAssignment.findMany.mockResolvedValue([
      assignment("a-1", "req-fallback"),
    ]);

    const result = await service.contentEndorsement(
      "user-1",
      ContentType.COURSE,
      "course-1",
    );

    expect(result).toEqual({
      requirementId: "req-fallback",
      associationName: "Engineers Association",
      learningContentId: "content-1",
      isDefaultRequirement: true,
    });
  });

  it("falls back when the content's own requirement is not assigned to the caller", async () => {
    const { service, prisma } = createService();
    prisma.associationMember.findMany.mockResolvedValue([membership()]);
    prisma.associationLearningContent.findMany.mockResolvedValue([content()]);
    prisma.associationRequirementAssignment.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([assignment("a-2", "req-other")]);

    const result = await service.contentEndorsement(
      "user-1",
      ContentType.COURSE,
      "course-1",
    );

    expect(result).toMatchObject({
      requirementId: "req-other",
      isDefaultRequirement: true,
    });
  });

  it("returns null when the content's audience does not cover the member", async () => {
    const { service, prisma } = createService();
    prisma.associationMember.findMany.mockResolvedValue([membership()]);
    prisma.associationLearningContent.findMany.mockResolvedValue([
      content({ audienceKind: AssociationAudienceKind.SPECIFIC_MEMBERS }),
    ]);

    const result = await service.contentEndorsement(
      "user-1",
      ContentType.COURSE,
      "course-1",
    );

    expect(result).toBeNull();
    expect(
      prisma.associationRequirementAssignment.findMany,
    ).not.toHaveBeenCalled();
  });

  it("returns null when no assigned requirement exists to fall back to", async () => {
    const { service, prisma } = createService();
    prisma.associationMember.findMany.mockResolvedValue([membership()]);
    prisma.associationLearningContent.findMany.mockResolvedValue([
      content({ requirementId: null }),
    ]);
    prisma.associationRequirementAssignment.findMany.mockResolvedValue([]);

    const result = await service.contentEndorsement(
      "user-1",
      ContentType.COURSE,
      "course-1",
    );

    expect(result).toBeNull();
  });
});

describe("AssociationMyRequirementsService.myLearningContent", () => {
  const membership = (overrides: Record<string, unknown> = {}) => ({
    id: "member-1",
    groupId: null,
    associationId: "assoc-1",
    association: { name: "Engineers Association" },
    ...overrides,
  });

  const unlinkedContent = (overrides: Record<string, unknown> = {}) => ({
    id: "content-1",
    contentType: null,
    contentId: null,
    externalTitle: "Free Webinar",
    externalProvider: "Provider Co",
    externalUrl: "https://example.com/webinar",
    description: null,
    category: null,
    indicativeCredits: null,
    requirementId: null,
    ...overrides,
  });

  it("returns nothing for a caller with no active membership", async () => {
    const { service, prisma } = createService();
    prisma.associationMember.findMany.mockResolvedValue([]);

    await expect(service.myLearningContent("user-1")).resolves.toEqual([]);
    expect(prisma.associationLearningContent.findMany).not.toHaveBeenCalled();
  });

  it("only queries content that has no requirement link", async () => {
    const { service, prisma } = createService();
    prisma.associationMember.findMany.mockResolvedValue([membership()]);

    await service.myLearningContent("user-1");

    const where =
      prisma.associationLearningContent.findMany.mock.calls[0][0].where;
    expect(where.requirementId).toBeNull();
    expect(where.associationId).toBe("assoc-1");
    expect(where.status).toBe("PUBLISHED");
  });

  it("marks each item as recommended by its own association", async () => {
    const { service, prisma } = createService();
    prisma.associationMember.findMany.mockResolvedValue([membership()]);
    prisma.associationLearningContent.findMany.mockResolvedValue([
      unlinkedContent(),
    ]);

    const rows = await service.myLearningContent("user-1");

    expect(rows).toEqual([
      expect.objectContaining({
        id: "content-1",
        isLinkedToRequirement: false,
        associationId: "assoc-1",
        associationName: "Engineers Association",
      }),
    ]);
  });
});
