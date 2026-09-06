import { AssociationComplianceReadService } from "@association/services/association-compliance-read.service";
import { type ProfessionalComplianceApi } from "@professional/public/professional-compliance-api";
import { AssociationMemberProfileService } from "@association/services/association-member-profile.service";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { AssociationAttributionState } from "@prisma/client";
import { AssociationComplianceBand } from "@prisma/client";
import { AssociationEvidencePolicy } from "@prisma/client";
import { CreditType, PDUCategory, Role } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";

const owner = { id: "owner-1", role: Role.ASSOCIATION };

const memberRow = {
  id: "member-1",
  userId: "user-1",
  memberNumber: "M-1",
  status: "ACTIVE",
  invitedAt: new Date("2026-01-01T00:00:00.000Z"),
  activatedAt: new Date("2026-01-02T00:00:00.000Z"),
  deactivatedAt: null,
  group: { id: "group-1", title: "Fellows", isActive: true },
  user: {
    email: "member@example.test",
    fullName: "A Member",
    avatarUrl: null,
  },
};

const assignmentRow = (overrides: Record<string, unknown> = {}) => ({
  id: "assign-1",
  cycleStart: new Date("2026-01-01T00:00:00.000Z"),
  cycleEnd: null,
  requirementId: "req-1",
  requirementName: "Annual CPD",
  creditType: CreditType.CPD,
  evidencePolicy: AssociationEvidencePolicy.REQUIRED_NEEDS_REVIEW,
  requiredCredits: 40,
  completedCredits: 10,
  percent: 25,
  band: AssociationComplianceBand.AT_RISK,
  dueDate: new Date("2026-12-31T00:00:00.000Z"),
  daysRemaining: 100,
  awaitingReviewCount: 1,
  isMissingEvidence: true,
  computedAt: new Date("2026-06-01T00:00:00.000Z"),
  categories: [],
  ...overrides,
});

const attributionRow = (overrides: Record<string, unknown> = {}) => ({
  activityId: "act-1",
  activityDate: new Date("2026-05-01T00:00:00.000Z"),
  state: AssociationAttributionState.COUNTED,
  isLate: false,
  creditedAmount: 10,
  assignment: {
    requirement: {
      id: "req-1",
      name: "Annual CPD",
      evidencePolicy: AssociationEvidencePolicy.REQUIRED_NEEDS_REVIEW,
    },
  },
  ...overrides,
});

const detailRow = (overrides: Record<string, unknown> = {}) => ({
  id: "act-1",
  userId: "user-1",
  title: "A course",
  source: "COURSE",
  category: PDUCategory.TECHNICAL,
  creditType: CreditType.CPD,
  credits: 10,
  date: new Date("2026-05-01T00:00:00.000Z"),
  status: "APPROVED",
  hasEvidence: true,
  evidenceNote: null,
  evidenceUrl: null,
  reviewNote: null,
  files: [],
  ...overrides,
});

const setup = ({
  member = memberRow,
  assignments = [assignmentRow()],
  attributions = [attributionRow()],
  details = [detailRow()],
  certificates = [],
  cumulative = [],
}: {
  member?: typeof memberRow | null;
  assignments?: ReturnType<typeof assignmentRow>[];
  attributions?: ReturnType<typeof attributionRow>[];
  details?: ReturnType<typeof detailRow>[];
  certificates?: Record<string, unknown>[];
  cumulative?: { activityDate: Date; creditedAmount: number }[];
} = {}) => {
  const attributionFindMany = jest
    .fn()
    .mockImplementation(({ select }: { select: Record<string, unknown> }) =>
      "creditedAmount" in select && !("state" in select)
        ? cumulative
        : attributions,
    );

  const prisma = {
    associationMember: { findFirst: jest.fn().mockResolvedValue(member) },
    associationCreditAttribution: { findMany: attributionFindMany },
  };

  const access = {
    requireReadable: jest.fn().mockResolvedValue({ id: "assoc-1", name: "A" }),
  };

  const compliance = {
    memberCompliance: jest.fn().mockResolvedValue({
      memberId: "member-1",
      isMissingEvidence: assignments.some((row) => row.isMissingEvidence),
      assignments,
    }),
    onTrackThreshold: jest.fn().mockResolvedValue(70),
  };

  const port = {
    certificatesForOwners: jest.fn().mockResolvedValue(certificates),
    activityDetailsForOwners: jest.fn().mockResolvedValue(details),
  };

  return {
    port,
    prisma,
    access,
    compliance,
    attributionFindMany,
    service: new AssociationMemberProfileService(
      prisma as unknown as PrismaService,
      access as unknown as AssociationAccessService,
      compliance as unknown as AssociationComplianceReadService,
      port as unknown as ProfessionalComplianceApi,
    ),
  };
};

describe("AssociationMemberProfileService", () => {
  describe("the profile header", () => {
    it("takes its total, its credits and its band from the projection", async () => {
      const { service } = setup({
        assignments: [
          assignmentRow(),
          assignmentRow({
            id: "assign-2",
            requirementId: "req-2",
            percent: 75,
            requiredCredits: 20,
            completedCredits: 15,
            awaitingReviewCount: 0,
            isMissingEvidence: false,
          }),
        ],
      });

      const profile = await service.profile(owner, "member-1");

      expect(profile.summary).toEqual(
        expect.objectContaining({
          percent: 41.67,
          creditsRequired: 60,
          creditsCompleted: 25,
          creditsRemaining: 35,
          awaitingReviewCount: 1,
          band: AssociationComplianceBand.AT_RISK,
        }),
      );
    });

    it("names the requirement the nearest deadline belongs to", async () => {
      const { service } = setup({
        assignments: [
          assignmentRow({
            id: "assign-2",
            requirementId: "req-2",
            requirementName: "Ethics",
            dueDate: new Date("2026-07-01T00:00:00.000Z"),
          }),
          assignmentRow(),
        ],
      });

      const profile = await service.profile(owner, "member-1");

      expect(profile.summary.nearestRequirementName).toBe("Ethics");
      expect(profile.summary.nearestRequirementId).toBe("req-2");
    });

    it("weights a large requirement above a small one rather than averaging", async () => {
      const { service } = setup({
        assignments: [
          assignmentRow({
            requiredCredits: 10,
            completedCredits: 10,
            awaitingReviewCount: 0,
          }),
          assignmentRow({
            id: "assign-2",
            requirementId: "req-2",
            requiredCredits: 90,
            completedCredits: 0,
            awaitingReviewCount: 0,
          }),
        ],
      });

      const profile = await service.profile(owner, "member-1");

      expect(profile.summary.percent).toBe(10);
    });

    it("agrees with the reports rather than averaging the two percents", async () => {
      const { service } = setup({
        assignments: [
          assignmentRow({
            requiredCredits: 40,
            completedCredits: 10,
            awaitingReviewCount: 0,
          }),
          assignmentRow({
            id: "assign-2",
            requirementId: "req-2",
            requiredCredits: 20,
            completedCredits: 15,
            awaitingReviewCount: 0,
          }),
        ],
      });

      const profile = await service.profile(owner, "member-1");

      expect(profile.summary.percent).toBe(41.67);
    });

    it("refuses a member of another association", async () => {
      const { service } = setup({ member: null });

      await expect(service.profile(owner, "member-9")).rejects.toMatchObject({
        response: { code: AssociationMessageCode.MEMBER_NOT_FOUND },
      });
    });

    it("builds the cumulative series from counted credits alone", async () => {
      const { service } = setup({
        cumulative: [
          {
            activityDate: new Date("2026-02-01T00:00:00.000Z"),
            creditedAmount: 4,
          },
          {
            activityDate: new Date("2026-03-01T00:00:00.000Z"),
            creditedAmount: 6,
          },
        ],
      });

      const profile = await service.profile(owner, "member-1");

      expect(profile.cumulative.map((point) => point.credits)).toEqual([4, 10]);
      expect(profile.cumulative[0].requiredCredits).toBe(40);
    });

    it("has no series and no pace when nothing is assigned", async () => {
      const { service } = setup({ assignments: [] });

      const profile = await service.profile(owner, "member-1");

      expect(profile.cumulative).toEqual([]);
      expect(profile.summary.pacePercent).toBe(null);
      expect(profile.summary.percent).toBe(0);
    });
  });

  describe("the activity list", () => {
    it("offers a decision only while a reviewed requirement is waiting", async () => {
      const { service } = setup({
        attributions: [
          attributionRow({
            state: AssociationAttributionState.AWAITING_REVIEW,
          }),
        ],
      });

      const page = await service.activities(owner, "member-1");

      expect(page.items[0].canReview).toBe(true);
    });

    it("offers no decision under a policy that does not ask for review", async () => {
      const { service } = setup({
        attributions: [
          attributionRow({
            state: AssociationAttributionState.AWAITING_REVIEW,
            assignment: {
              requirement: {
                id: "req-1",
                name: "Annual CPD",
                evidencePolicy: AssociationEvidencePolicy.REQUIRED_NO_REVIEW,
              },
            },
          }),
        ],
      });

      const page = await service.activities(owner, "member-1");

      expect(page.items[0].canReview).toBe(false);
      expect(page.items[0].requirements[0].canReview).toBe(false);
    });

    it("shows one row for an activity that counts toward two requirements", async () => {
      const { service } = setup({
        attributions: [
          attributionRow(),
          attributionRow({
            assignment: {
              requirement: {
                id: "req-2",
                name: "Ethics",
                evidencePolicy: AssociationEvidencePolicy.NOT_REQUIRED,
              },
            },
          }),
        ],
      });

      const page = await service.activities(owner, "member-1");

      expect(page.items).toHaveLength(1);
      expect(page.items[0].requirements.map((row) => row.name)).toEqual([
        "Annual CPD",
        "Ethics",
      ]);
    });

    it("lets an unsettled review win over a counted one on the same activity", async () => {
      const { service } = setup({
        attributions: [
          attributionRow(),
          attributionRow({
            state: AssociationAttributionState.AWAITING_REVIEW,
            assignment: {
              requirement: {
                id: "req-2",
                name: "Ethics",
                evidencePolicy: AssociationEvidencePolicy.REQUIRED_NEEDS_REVIEW,
              },
            },
          }),
        ],
      });

      const page = await service.activities(owner, "member-1");

      expect(page.items[0].state).toBe(
        AssociationAttributionState.AWAITING_REVIEW,
      );
    });

    it("filters to one review state and still counts every state", async () => {
      const { service } = setup({
        attributions: [
          attributionRow(),
          attributionRow({
            activityId: "act-2",
            state: AssociationAttributionState.REJECTED,
          }),
        ],
        details: [detailRow(), detailRow({ id: "act-2" })],
      });

      const page = await service.activities(owner, "member-1", {
        state: AssociationAttributionState.REJECTED,
      });

      expect(page.totalCount).toBe(1);
      expect(page.items.map((item) => item.id)).toEqual(["act-2"]);
      expect(page.counts).toEqual({
        counted: 1,
        rejected: 1,
        awaitingReview: 0,
      });
    });

    it("reads no activity outside the requirements of this association", async () => {
      const { service, attributionFindMany } = setup();

      await service.activities(owner, "member-1");

      expect(attributionFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            assignment: expect.objectContaining({
              memberId: "member-1",
              member: { associationId: "assoc-1" },
            }),
          }),
        }),
      );
    });

    it("asks the professional module only for the page it is showing", async () => {
      const { service, port } = setup({
        attributions: [
          attributionRow(),
          attributionRow({ activityId: "act-2" }),
          attributionRow({ activityId: "act-3" }),
        ],
        details: [detailRow(), detailRow({ id: "act-2" })],
      });

      const page = await service.activities(owner, "member-1", {}, { take: 2 });

      expect(port.activityDetailsForOwners).toHaveBeenCalledWith(
        ["act-1", "act-2"],
        ["user-1"],
      );
      expect(page.pageInfo).toEqual({
        hasNextPage: true,
        nextCursor: "act-2",
      });
    });

    it("continues after the cursor it was given", async () => {
      const { service, port } = setup({
        attributions: [
          attributionRow(),
          attributionRow({ activityId: "act-2" }),
          attributionRow({ activityId: "act-3" }),
        ],
        details: [detailRow({ id: "act-3" })],
      });

      const page = await service.activities(
        owner,
        "member-1",
        {},
        { take: 2, cursor: "act-2" },
      );

      expect(port.activityDetailsForOwners).toHaveBeenCalledWith(
        ["act-3"],
        ["user-1"],
      );
      expect(page.pageInfo.hasNextPage).toBe(false);
    });
  });
});
