import { AssociationComplianceReadService } from "@association/services/association-compliance-read.service";
import { AssociationReportService } from "@association/services/association-report.service";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { AssociationReportPeriod } from "@association/utils/association-report-period.util";
import { AssociationAttributionState } from "@prisma/client";
import { AssociationComplianceBand } from "@prisma/client";
import { PDUCategory, Role } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";

const owner = { id: "owner-1", role: Role.ASSOCIATION };

const THIS_YEAR = { period: AssociationReportPeriod.THIS_YEAR };

const member = (overrides: Record<string, unknown> = {}) => ({
  id: "member-1",
  userId: "user-1",
  status: "ACTIVE",
  memberNumber: "M-1",
  groupId: "group-1",
  group: { title: "Fellows" },
  user: { email: "one@example.test", fullName: "Member One" },
  ...overrides,
});

const assignment = (overrides: Record<string, unknown> = {}) => ({
  id: "assign-1",
  memberId: "member-1",
  dueDate: new Date("2026-12-31T00:00:00.000Z"),
  computedAt: new Date("2026-06-01T00:00:00.000Z"),
  requirement: {
    id: "req-1",
    name: "Annual CPD",
    totalRequiredCredits: 10,
    categories: [],
  },
  ...overrides,
});

const attribution = (overrides: Record<string, unknown> = {}) => ({
  assignmentId: "assign-1",
  categoryId: null,
  state: AssociationAttributionState.COUNTED,
  activityDate: new Date("2026-02-01T00:00:00.000Z"),
  creditedAmount: 10,
  count: 1,
  ...overrides,
});

type Attribution = ReturnType<typeof attribution>;

const setup = ({
  members = [member()],
  assignments = [assignment()],
  attributions = [attribution()],
  group = { id: "group-1" },
  requirement = { id: "req-1" },
  onTrackThreshold = 70,
}: {
  members?: Record<string, unknown>[];
  assignments?: Record<string, unknown>[];
  attributions?: Attribution[];
  group?: { id: string } | null;
  requirement?: { id: string } | null;
  onTrackThreshold?: number;
} = {}) => {
  const memberFindMany = jest.fn().mockResolvedValue(members);
  const assignmentFindMany = jest.fn().mockResolvedValue(assignments);

  const groupBy = jest.fn().mockImplementation(({ where }) => {
    const at = where?.activityDate?.lte as Date | undefined;

    return attributions
      .filter((row) => !at || row.activityDate.getTime() <= at.getTime())
      .map((row) => ({
        assignmentId: row.assignmentId,
        categoryId: row.categoryId,
        state: row.state,
        _sum: { creditedAmount: row.creditedAmount },
        _count: { _all: row.count },
      }));
  });

  const prisma = {
    associationMember: { findMany: memberFindMany },
    associationRequirementAssignment: { findMany: assignmentFindMany },
    associationCreditAttribution: { groupBy },
    associationGroup: { findFirst: jest.fn().mockResolvedValue(group) },
    associationRequirement: {
      findFirst: jest.fn().mockResolvedValue(requirement),
    },
  };

  const access = {
    requireReadable: jest.fn().mockResolvedValue({ id: "assoc-1", name: "A" }),
  };

  const compliance = {
    onTrackThreshold: jest.fn().mockResolvedValue(onTrackThreshold),
  };

  return {
    groupBy,
    access,
    compliance,
    memberFindMany,
    assignmentFindMany,
    service: new AssociationReportService(
      prisma as unknown as PrismaService,
      access as unknown as AssociationAccessService,
      compliance as unknown as AssociationComplianceReadService,
    ),
  };
};

describe("AssociationReportService", () => {
  describe("the weighted completion rule", () => {
    it("weights a ninety-credit requirement above a ten-credit one", async () => {
      const { service } = setup({
        assignments: [
          assignment({
            id: "assign-small",
            requirement: {
              id: "req-small",
              name: "Ethics",
              totalRequiredCredits: 10,
              categories: [],
            },
          }),
          assignment({
            id: "assign-large",
            requirement: {
              id: "req-large",
              name: "Annual CPD",
              totalRequiredCredits: 90,
              categories: [],
            },
          }),
        ],
        attributions: [
          attribution({ assignmentId: "assign-small", creditedAmount: 10 }),
        ],
      });

      const page = await service.memberProgressReport(owner, THIS_YEAR);

      expect(page.items[0].percent).toBe(10);
      expect(page.items[0].requiredCredits).toBe(100);
      expect(page.items[0].completedCredits).toBe(10);
    });

    it("still reports each requirement's own percent alongside the total", async () => {
      const { service } = setup({
        assignments: [
          assignment({
            id: "assign-small",
            requirement: {
              id: "req-small",
              name: "Ethics",
              totalRequiredCredits: 10,
              categories: [],
            },
          }),
          assignment({
            id: "assign-large",
            requirement: {
              id: "req-large",
              name: "Annual CPD",
              totalRequiredCredits: 90,
              categories: [],
            },
          }),
        ],
        attributions: [
          attribution({ assignmentId: "assign-small", creditedAmount: 10 }),
        ],
      });

      const page = await service.memberProgressReport(owner, THIS_YEAR);

      expect(
        page.items[0].assignments.map((row) => [
          row.requirementName,
          row.percent,
        ]),
      ).toEqual([
        ["Ethics", 100],
        ["Annual CPD", 0],
      ]);
    });
  });

  describe("grouping", () => {
    it("keeps members with no group under an ungrouped row", async () => {
      const { service } = setup({
        members: [
          member(),
          member({
            id: "member-2",
            userId: "user-2",
            groupId: null,
            group: null,
          }),
        ],
        assignments: [
          assignment(),
          assignment({ id: "assign-2", memberId: "member-2" }),
        ],
      });

      const groups = await service.complianceByGroup(owner, THIS_YEAR);

      expect(groups).toHaveLength(2);
      expect(groups.some((group) => group.groupId === null)).toBe(true);
      expect(
        groups.reduce((total, group) => total + group.memberCount, 0),
      ).toBe(2);
    });
  });

  describe("agreement across reports", () => {
    it("gives the same totals to the summary, the distribution and both row reports", async () => {
      const fixture = {
        members: [
          member(),
          member({
            id: "member-2",
            userId: "user-2",
            groupId: null,
            group: null,
          }),
          member({ id: "member-3", userId: "user-3" }),
        ],
        assignments: [
          assignment(),
          assignment({ id: "assign-2", memberId: "member-2" }),
          assignment({ id: "assign-3", memberId: "member-3" }),
        ],
        attributions: [attribution({ assignmentId: "assign-1" })],
      };

      const summary = await setup(fixture).service.summary(owner, THIS_YEAR);
      const distribution = await setup(fixture).service.memberDistribution(
        owner,
        THIS_YEAR,
      );
      const groups = await setup(fixture).service.groupProgressReport(
        owner,
        THIS_YEAR,
      );
      const memberRows = await setup(fixture).service.memberProgressReport(
        owner,
        THIS_YEAR,
      );

      expect(summary.totalMembers).toBe(3);
      expect(distribution.totalMembers).toBe(3);
      expect(memberRows.totalCount).toBe(3);
      expect(groups.reduce((total, row) => total + row.memberCount, 0)).toBe(3);

      expect(distribution.renewalReady).toBe(summary.renewalReady);
      expect(distribution.onTrack).toBe(summary.onTrack);
      expect(distribution.atRisk).toBe(summary.atRisk);
      expect(groups.reduce((total, row) => total + row.renewalReady, 0)).toBe(
        summary.renewalReady,
      );
    });

    it("bands every member into exactly one band", async () => {
      const { service } = setup({
        members: [
          member(),
          member({ id: "member-2", userId: "user-2" }),
          member({ id: "member-3", userId: "user-3" }),
        ],
        assignments: [
          assignment(),
          assignment({ id: "assign-2", memberId: "member-2" }),
          assignment({ id: "assign-3", memberId: "member-3" }),
        ],
        attributions: [
          attribution({ assignmentId: "assign-1", creditedAmount: 10 }),
          attribution({ assignmentId: "assign-2", creditedAmount: 8 }),
        ],
      });

      const distribution = await service.memberDistribution(owner, THIS_YEAR);

      expect(
        distribution.renewalReady +
          distribution.onTrack +
          distribution.atRisk +
          distribution.notStarted,
      ).toBe(distribution.totalMembers);
    });
  });

  describe("an association with nothing set up", () => {
    it("returns zeroed figures rather than an error", async () => {
      const { service } = setup({ members: [], assignments: [] });

      const summary = await service.summary(owner, THIS_YEAR);
      const distribution = await service.memberDistribution(owner, THIS_YEAR);

      expect(summary.totalMembers).toBe(0);
      expect(summary.averageCompletion).toBe(0);
      expect(summary.renewalReadyShare).toBe(0);
      expect(distribution.notStartedShare).toBe(0);
    });

    it("returns empty datasets for every row report", async () => {
      const { service } = setup({ members: [], assignments: [] });

      await expect(
        service.memberProgressReport(owner, THIS_YEAR),
      ).resolves.toEqual(expect.objectContaining({ items: [], totalCount: 0 }));
      await expect(
        service.missingEvidenceReport(owner, THIS_YEAR),
      ).resolves.toEqual(expect.objectContaining({ items: [], totalCount: 0 }));
      await expect(
        service.renewalReadinessReport(owner, THIS_YEAR),
      ).resolves.toEqual(expect.objectContaining({ items: [], totalCount: 0 }));
      await expect(
        service.progressByCategory(owner, THIS_YEAR),
      ).resolves.toEqual([]);
    });

    it("reads no attribution at all when there is no member", async () => {
      const { service, groupBy, assignmentFindMany } = setup({
        members: [],
        assignments: [],
      });

      await service.summary(owner, THIS_YEAR);

      expect(assignmentFindMany).not.toHaveBeenCalled();
      expect(groupBy).not.toHaveBeenCalled();
    });

    it("counts a member with no assignment as not started", async () => {
      const { service } = setup({ assignments: [] });

      const distribution = await service.memberDistribution(owner, THIS_YEAR);

      expect(distribution.notStarted).toBe(1);
      expect(distribution.notStartedShare).toBe(100);
    });
  });

  describe("the association boundary", () => {
    it("bounds the member read by the resolved association", async () => {
      const { service, memberFindMany } = setup();

      await service.summary(owner, THIS_YEAR);

      expect(memberFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ associationId: "assoc-1" }),
        }),
      );
    });

    it("bounds the assignment read by the association and published status", async () => {
      const { service, assignmentFindMany } = setup();

      await service.summary(owner, THIS_YEAR);

      expect(assignmentFindMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            requirement: expect.objectContaining({ associationId: "assoc-1" }),
          }),
        }),
      );
    });

    it("never takes the association from an argument for an owner", async () => {
      const { service, access } = setup();

      await service.summary(owner, THIS_YEAR);

      expect(access.requireReadable).toHaveBeenCalledWith(owner, undefined);
    });

    it("refuses a group that is not this association's", async () => {
      const { service } = setup({ group: null });

      await expect(
        service.summary(owner, { ...THIS_YEAR, groupId: "group-9" }),
      ).rejects.toMatchObject({
        response: { code: AssociationMessageCode.GROUP_NOT_FOUND },
      });
    });

    it("refuses a requirement that is not this association's", async () => {
      const { service } = setup({ requirement: null });

      await expect(
        service.summary(owner, { ...THIS_YEAR, requirementId: "req-9" }),
      ).rejects.toMatchObject({
        response: { code: AssociationMessageCode.REQUIREMENT_NOT_FOUND },
      });
    });
  });

  describe("deactivated members", () => {
    it("excludes them unless the filter asks", async () => {
      const { service, memberFindMany } = setup();

      await service.summary(owner, THIS_YEAR);

      expect(memberFindMany.mock.calls[0][0].where.status).toEqual({
        not: "INACTIVE",
      });
    });

    it("includes them when the filter asks", async () => {
      const { service, memberFindMany } = setup();

      await service.summary(owner, { ...THIS_YEAR, includeInactive: true });

      expect(memberFindMany.mock.calls[0][0].where.status).toBeUndefined();
    });
  });

  describe("the period", () => {
    it("refuses an end before its start", async () => {
      const { service } = setup();

      await expect(
        service.summary(owner, {
          period: AssociationReportPeriod.CUSTOM,
          startDate: "2026-06-01",
          endDate: "2026-05-01",
        }),
      ).rejects.toMatchObject({
        response: { code: AssociationMessageCode.REPORT_PERIOD_INVALID },
      });
    });

    it("refuses a period longer than the cap", async () => {
      const { service } = setup();

      await expect(
        service.summary(owner, {
          period: AssociationReportPeriod.CUSTOM,
          startDate: "2019-01-01",
          endDate: "2026-01-01",
        }),
      ).rejects.toMatchObject({
        response: { code: AssociationMessageCode.REPORT_PERIOD_TOO_LONG },
      });
    });
  });

  describe("the trend", () => {
    it("reflects the state at each month's end rather than back-dating today", async () => {
      const { service } = setup({
        assignments: [
          assignment({
            requirement: {
              id: "req-1",
              name: "Annual CPD",
              totalRequiredCredits: 10,
              categories: [],
            },
          }),
        ],
        attributions: [
          attribution({
            activityDate: new Date("2026-03-15T00:00:00.000Z"),
            creditedAmount: 10,
          }),
        ],
      });

      const points = await service.complianceTrend(owner, {
        period: AssociationReportPeriod.CUSTOM,
        startDate: "2026-01-01",
        endDate: "2026-04-30",
      });

      expect(points.map((point) => point.averageCompletion)).toEqual([
        0, 0, 100, 100,
      ]);
    });

    it("asks the database for each month rather than filtering one read", async () => {
      const { service, groupBy } = setup();

      await service.complianceTrend(owner, {
        period: AssociationReportPeriod.CUSTOM,
        startDate: "2026-01-01",
        endDate: "2026-03-31",
      });

      const asOfDates = groupBy.mock.calls.map(
        (call) => call[0].where.activityDate.lte,
      );

      expect(asOfDates.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe("missing evidence", () => {
    it("names one row per member per requirement awaiting a decision", async () => {
      const { service } = setup({
        attributions: [
          attribution({
            state: AssociationAttributionState.AWAITING_REVIEW,
            creditedAmount: 0,
            count: 2,
          }),
        ],
      });

      const page = await service.missingEvidenceReport(owner, THIS_YEAR);

      expect(page.items).toHaveLength(1);
      expect(page.items[0]).toEqual(
        expect.objectContaining({
          memberId: "member-1",
          requirementName: "Annual CPD",
          awaitingReviewCount: 2,
        }),
      );
    });

    it("says nothing about a member whose evidence is settled", async () => {
      const { service } = setup();

      await expect(
        service.missingEvidenceReport(owner, THIS_YEAR),
      ).resolves.toEqual(expect.objectContaining({ totalCount: 0 }));
    });
  });

  describe("renewal readiness", () => {
    it("names the earliest deadline a member has not met", async () => {
      const { service } = setup({
        assignments: [
          assignment({
            id: "assign-late",
            dueDate: new Date("2026-08-31T00:00:00.000Z"),
            requirement: {
              id: "req-late",
              name: "Ethics",
              totalRequiredCredits: 10,
              categories: [],
            },
          }),
          assignment({
            id: "assign-met",
            dueDate: new Date("2026-07-01T00:00:00.000Z"),
            requirement: {
              id: "req-met",
              name: "Annual CPD",
              totalRequiredCredits: 10,
              categories: [],
            },
          }),
        ],
        attributions: [
          attribution({ assignmentId: "assign-met", creditedAmount: 10 }),
        ],
      });

      const page = await service.renewalReadinessReport(owner, THIS_YEAR);

      expect(page.items[0].earliestUnmetDeadline?.toISOString()).toBe(
        "2026-08-31T00:00:00.000Z",
      );
      expect(page.items[0].isRenewalReady).toBe(false);
    });

    it("marks a member with everything done and nothing pending as ready", async () => {
      const { service } = setup({
        attributions: [attribution({ creditedAmount: 10 })],
      });

      const page = await service.renewalReadinessReport(owner, THIS_YEAR);

      expect(page.items[0].band).toBe(AssociationComplianceBand.RENEWAL_READY);
      expect(page.items[0].isRenewalReady).toBe(true);
      expect(page.items[0].earliestUnmetDeadline).toBe(null);
    });
  });

  describe("categories", () => {
    it("averages a category across the members it applies to", async () => {
      const categories = [
        {
          id: "cat-1",
          name: "Technical",
          mappedCategory: PDUCategory.TECHNICAL,
          requiredCredits: 10,
          order: 0,
        },
      ];

      const { service } = setup({
        members: [member(), member({ id: "member-2", userId: "user-2" })],
        assignments: [
          assignment({
            requirement: {
              id: "req-1",
              name: "Annual CPD",
              totalRequiredCredits: 10,
              categories,
            },
          }),
          assignment({
            id: "assign-2",
            memberId: "member-2",
            requirement: {
              id: "req-1",
              name: "Annual CPD",
              totalRequiredCredits: 10,
              categories,
            },
          }),
        ],
        attributions: [
          attribution({ categoryId: "cat-1", creditedAmount: 10 }),
        ],
      });

      const [row] = await service.progressByCategory(owner, THIS_YEAR);

      expect(row).toEqual(
        expect.objectContaining({
          categoryName: "Technical",
          requiredCredits: 10,
          memberCount: 2,
          averageCompletedCredits: 5,
          averagePercent: 50,
          belowHalfCount: 1,
        }),
      );
    });

    it("shows a category no one has touched at zero rather than omitting it", async () => {
      const { service } = setup({
        assignments: [
          assignment({
            requirement: {
              id: "req-1",
              name: "Annual CPD",
              totalRequiredCredits: 10,
              categories: [
                {
                  id: "cat-untouched",
                  name: "Leadership",
                  mappedCategory: PDUCategory.LEADERSHIP,
                  requiredCredits: 5,
                  order: 0,
                },
              ],
            },
          }),
        ],
        attributions: [],
      });

      const [row] = await service.progressByCategory(owner, THIS_YEAR);

      expect(row).toEqual(
        expect.objectContaining({
          categoryName: "Leadership",
          averageCompletedCredits: 0,
          averagePercent: 0,
          belowHalfCount: 1,
        }),
      );
    });
  });

  describe("pagination", () => {
    it("pages the member report and hands back a cursor", async () => {
      const members = Array.from({ length: 3 }, (_, index) =>
        member({ id: `member-${index}`, userId: `user-${index}` }),
      );

      const { service } = setup({
        members,
        assignments: members.map((row, index) =>
          assignment({ id: `assign-${index}`, memberId: row.id as string }),
        ),
        attributions: [],
      });

      const first = await service.memberProgressReport(owner, THIS_YEAR, {
        take: 2,
      });

      expect(first.items).toHaveLength(2);
      expect(first.totalCount).toBe(3);
      expect(first.pageInfo.hasNextPage).toBe(true);

      const second = await service.memberProgressReport(owner, THIS_YEAR, {
        take: 2,
        cursor: first.pageInfo.nextCursor,
      });

      expect(second.items).toHaveLength(1);
      expect(second.pageInfo.hasNextPage).toBe(false);
      expect(second.pageInfo.nextCursor).toBe(null);
    });
  });
});
