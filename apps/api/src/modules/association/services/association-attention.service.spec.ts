import { AssociationComplianceReadService } from "@association/services/association-compliance-read.service";
import { AssociationAttentionSection } from "@association/enums/association-attention.enum";
import { AssociationAttentionService } from "@association/services/association-attention.service";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationReportService } from "@association/services/association-report.service";
import { type ProfessionalComplianceApi } from "@professional/public/professional-compliance-api";
import { AssociationReportPeriod } from "@association/utils/association-report-period.util";
import { AssociationAttributionState, Role } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";

const owner = { id: "owner-1", role: Role.ASSOCIATION };

const AT_RISK_THRESHOLD = 40;

const THIS_YEAR = { period: AssociationReportPeriod.THIS_YEAR };

const member = (index: number, ethics: number, leadership = 0) => ({
  id: `member-${index}`,
  userId: `user-${index}`,
  status: "ACTIVE",
  memberNumber: `M-${index}`,
  groupId: "group-1",
  group: { title: "Fellows" },
  user: {
    email: `member-${index}@example.test`,
    fullName: `Member ${index}`,
  },
  ethics,
  leadership,
});

const CATEGORIES = [
  {
    id: "cat-ethics",
    name: "Ethics",
    requiredCredits: 4,
    order: 1,
    mappedCategory: "TECHNICAL",
  },
  {
    id: "cat-leadership",
    name: "Leadership",
    requiredCredits: 6,
    order: 2,
    mappedCategory: "LEADERSHIP",
  },
];

const setup = ({
  members,
  certificates = [],
  joiners = [],
}: {
  members: ReturnType<typeof member>[];
  certificates?: {
    id: string;
    userId: string;
    title: string;
    validUntil: Date | null;
  }[];
  joiners?: Record<string, unknown>[];
}) => {
  const prisma = {
    associationMember: {
      findMany: jest.fn().mockImplementation(({ where }) => {
        if (where?.messageDeliveries) return Promise.resolve(joiners);
        return Promise.resolve(members);
      }),
    },
    associationRequirementAssignment: {
      findMany: jest.fn().mockResolvedValue(
        members.map((row) => ({
          id: `assign-${row.id}`,
          memberId: row.id,
          dueDate: new Date("2026-12-31T00:00:00.000Z"),
          computedAt: new Date("2026-06-01T00:00:00.000Z"),
          requirement: {
            id: "req-1",
            name: "Annual CPD",
            totalRequiredCredits: 10,
            categories: CATEGORIES,
          },
        })),
      ),
    },
    associationCreditAttribution: {
      groupBy: jest.fn().mockResolvedValue(
        members.flatMap((row) => [
          {
            assignmentId: `assign-${row.id}`,
            categoryId: "cat-ethics",
            state: AssociationAttributionState.COUNTED,
            _sum: { creditedAmount: row.ethics },
            _count: { _all: 1 },
          },
          {
            assignmentId: `assign-${row.id}`,
            categoryId: "cat-leadership",
            state: AssociationAttributionState.COUNTED,
            _sum: { creditedAmount: row.leadership },
            _count: { _all: 1 },
          },
        ]),
      ),
    },
    associationSettings: {
      findUnique: jest
        .fn()
        .mockResolvedValue({ atRiskThreshold: AT_RISK_THRESHOLD }),
    },
    associationGeneratedReport: { count: jest.fn().mockResolvedValue(2) },
    associationGroup: { findFirst: jest.fn() },
    associationRequirement: { findFirst: jest.fn() },
  };

  const access = {
    requireReadable: jest
      .fn()
      .mockResolvedValue({ id: "assoc-1", name: "Institute" }),
  };

  const compliance = { onTrackThreshold: jest.fn().mockResolvedValue(70) };

  const professional = {
    certificatesForOwners: jest.fn().mockResolvedValue(certificates),
  };

  const reports = new AssociationReportService(
    prisma as unknown as PrismaService,
    access as unknown as AssociationAccessService,
    compliance as unknown as AssociationComplianceReadService,
  );

  return {
    reports,
    professional,
    service: new AssociationAttentionService(
      prisma as unknown as PrismaService,
      access as unknown as AssociationAccessService,
      reports,
      professional as unknown as ProfessionalComplianceApi,
    ),
  };
};

describe("AssociationAttentionService", () => {
  describe("members needing attention", () => {
    it("lists exactly the members the reports tab shows below the threshold", async () => {
      const { service, reports } = setup({
        members: [member(1, 10), member(2, 3), member(3, 1)],
      });

      const onScreen = await reports.memberProgressReport(owner, THIS_YEAR);
      const behind = onScreen.items.filter((row) =>
        row.assignments.some(
          (assignment) => assignment.percent < AT_RISK_THRESHOLD,
        ),
      );

      const rows = await service.rowsFor(
        owner,
        AssociationAttentionSection.BELOW_THRESHOLD,
      );

      expect(rows.map((row) => row.memberId)).toEqual(
        behind.map((row) => row.memberId),
      );
      expect(rows).toHaveLength(2);
    });

    it("carries the percent and deadline the reports tab carries", async () => {
      const { service, reports } = setup({ members: [member(1, 2)] });

      const onScreen = await reports.memberProgressReport(owner, THIS_YEAR);
      const rows = await service.rowsFor(
        owner,
        AssociationAttentionSection.BELOW_THRESHOLD,
      );

      expect(rows[0].percent).toBe(onScreen.items[0].percent);
      expect(rows[0].deadline).toEqual(onScreen.items[0].earliestUnmetDeadline);
      expect(rows[0].groupTitle).toBe("Fellows");
    });

    it("counts the same figure the section lists", async () => {
      const { service } = setup({
        members: [member(1, 10), member(2, 3), member(3, 1)],
      });

      const { counts } = await service.lists(owner);
      const rows = await service.rowsFor(
        owner,
        AssociationAttentionSection.BELOW_THRESHOLD,
      );

      expect(counts.belowThreshold).toBe(rows.length);
    });
  });

  describe("categories behind", () => {
    it("names the single weakest category a member is short in", async () => {
      const { service } = setup({ members: [member(1, 1)] });

      const rows = await service.rowsFor(
        owner,
        AssociationAttentionSection.CATEGORY_BEHIND,
      );

      expect(rows).toHaveLength(1);
      expect(rows[0].detail).toBe("Leadership");
      expect(rows[0].percent).toBe(0);
    });

    it("leaves out a member who is short in nothing", async () => {
      const { service } = setup({ members: [member(1, 8, 12)] });

      const rows = await service.rowsFor(
        owner,
        AssociationAttentionSection.CATEGORY_BEHIND,
      );

      expect(rows).toEqual([]);
    });
  });

  describe("expiring certificates", () => {
    it("lists a member whose certificate expires inside the window", async () => {
      const soon = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      const { service } = setup({
        members: [member(1, 10)],
        certificates: [
          {
            id: "cert-1",
            userId: "user-1",
            title: "First Aid",
            validUntil: soon,
          },
        ],
      });

      const rows = await service.rowsFor(
        owner,
        AssociationAttentionSection.EXPIRING_CERTIFICATES,
      );

      expect(rows).toHaveLength(1);
      expect(rows[0].detail).toBe("First Aid");
      expect(rows[0].detailDate).toEqual(soon);
    });

    it("ignores a certificate that expires beyond the window", async () => {
      const later = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

      const { service } = setup({
        members: [member(1, 10)],
        certificates: [
          {
            id: "cert-1",
            userId: "user-1",
            title: "First Aid",
            validUntil: later,
          },
        ],
      });

      expect(
        await service.rowsFor(
          owner,
          AssociationAttentionSection.EXPIRING_CERTIFICATES,
        ),
      ).toEqual([]);
    });

    it("keeps the soonest of a member's certificates", async () => {
      const soon = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
      const sooner = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);

      const { service } = setup({
        members: [member(1, 10)],
        certificates: [
          { id: "cert-1", userId: "user-1", title: "Later", validUntil: soon },
          {
            id: "cert-2",
            userId: "user-1",
            title: "Sooner",
            validUntil: sooner,
          },
        ],
      });

      const rows = await service.rowsFor(
        owner,
        AssociationAttentionSection.EXPIRING_CERTIFICATES,
      );

      expect(rows[0].detail).toBe("Sooner");
    });

    it("ignores a certificate with no expiry at all", async () => {
      const { service } = setup({
        members: [member(1, 10)],
        certificates: [
          {
            id: "cert-1",
            userId: "user-1",
            title: "Lifetime",
            validUntil: null,
          },
        ],
      });

      expect(
        await service.rowsFor(
          owner,
          AssociationAttentionSection.EXPIRING_CERTIFICATES,
        ),
      ).toEqual([]);
    });
  });

  describe("new joiners", () => {
    it("asks only for activated members who have never been welcomed", async () => {
      const { service } = setup({ members: [member(1, 10)], joiners: [] });

      await service.rowsFor(owner, AssociationAttentionSection.NEW_JOINERS);

      const prisma = (
        service as unknown as {
          prisma: { associationMember: { findMany: jest.Mock } };
        }
      ).prisma;

      const query = prisma.associationMember.findMany.mock.calls.at(-1)?.[0];

      expect(query.where.messageDeliveries.none.messageType).toBe("WELCOME");
      expect(query.where.activatedAt.gte).toBeInstanceOf(Date);
      expect(query.where.status).toBe("ACTIVE");
    });
  });

  describe("the ready reports section", () => {
    it("counts the exports that are ready to download", async () => {
      const { service } = setup({ members: [member(1, 10)] });

      const { counts } = await service.lists(owner);

      expect(counts.readyReports).toBe(2);
    });

    it("has no member rows of its own", async () => {
      const { service } = setup({ members: [member(1, 10)] });

      expect(
        await service.rowsFor(owner, AssociationAttentionSection.READY_REPORTS),
      ).toEqual([]);
    });
  });
});
