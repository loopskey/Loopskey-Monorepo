import { AssociationComplianceReadService } from "@association/services/association-compliance-read.service";
import { AssociationAttentionSection } from "@association/enums/association-attention.enum";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { AssociationAttentionService } from "@association/services/association-attention.service";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationReportService } from "@association/services/association-report.service";
import { type ProfessionalComplianceApi } from "@professional/public/professional-compliance-api";
import { AssociationAttributionState, Role } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";

const owner = { id: "owner-1", role: Role.ASSOCIATION };

const AT_RISK_THRESHOLD = 40;

const NOW = new Date("2026-01-01T00:00:00.000Z");

const DAY_MS = 24 * 60 * 60 * 1000;

const daysFromNow = (days: number) => new Date(NOW.getTime() + days * DAY_MS);

const member = (
  index: number,
  ethics: number,
  leadership = 0,
  dueDate: Date = daysFromNow(365),
) => ({
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
  dueDate,
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
          dueDate: row.dueDate,
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
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("members needing attention", () => {
    it("includes a member whose incomplete assignment is due in exactly 30 days", async () => {
      const { service } = setup({
        members: [member(1, 2, 0, daysFromNow(30))],
      });

      const rows = await service.rowsFor(
        owner,
        AssociationAttentionSection.BELOW_THRESHOLD,
      );

      expect(rows).toHaveLength(1);
      expect(rows[0].deadline).toEqual(daysFromNow(30));
    });

    it("excludes a member whose incomplete assignment is due in 31 days", async () => {
      const { service } = setup({
        members: [member(1, 2, 0, daysFromNow(31))],
      });

      expect(
        await service.rowsFor(
          owner,
          AssociationAttentionSection.BELOW_THRESHOLD,
        ),
      ).toEqual([]);
    });

    it("excludes a member whose assignment is already complete, even if due soon", async () => {
      const { service } = setup({
        members: [member(1, 10, 0, daysFromNow(5))],
      });

      expect(
        await service.rowsFor(
          owner,
          AssociationAttentionSection.BELOW_THRESHOLD,
        ),
      ).toEqual([]);
    });

    it("excludes an incomplete assignment due before today", async () => {
      const { service } = setup({
        members: [member(1, 2, 0, daysFromNow(-1))],
      });

      expect(
        await service.rowsFor(
          owner,
          AssociationAttentionSection.BELOW_THRESHOLD,
        ),
      ).toEqual([]);
    });

    it("counts the same figure the section lists", async () => {
      const { service } = setup({
        members: [
          member(1, 2, 0, daysFromNow(10)),
          member(2, 3, 0, daysFromNow(20)),
          member(3, 10, 0, daysFromNow(15)),
        ],
      });

      const { counts } = await service.lists(owner);
      const rows = await service.rowsFor(
        owner,
        AssociationAttentionSection.BELOW_THRESHOLD,
      );

      expect(counts.belowThreshold).toBe(rows.length);
      expect(rows).toHaveLength(2);
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

  describe("category attention groups", () => {
    it("groups affected members under their requirement and category", async () => {
      const { service } = setup({
        members: [member(1, 1, 0), member(2, 0, 1)],
      });

      const { items, totalCount } =
        await service.categoryAttentionGroups(owner);

      expect(totalCount).toBe(2);
      expect(items.map((group) => group.categoryName).sort()).toEqual([
        "Ethics",
        "Leadership",
      ]);

      const ethics = items.find((group) => group.categoryName === "Ethics")!;
      expect(ethics.requirementName).toBe("Annual CPD");
      expect(ethics.affectedCount).toBe(2);
      expect(ethics.members.map((row) => row.memberId).sort()).toEqual([
        "member-1",
        "member-2",
      ]);
    });

    it("keeps its own totalCount consistent across pages", async () => {
      const { service } = setup({
        members: [member(1, 1, 0), member(2, 0, 1)],
      });

      const first = await service.categoryAttentionGroups(owner, { take: 1 });
      expect(first.items).toHaveLength(1);
      expect(first.totalCount).toBe(2);
      expect(first.pageInfo.hasNextPage).toBe(true);

      const second = await service.categoryAttentionGroups(owner, {
        take: 1,
        cursor: first.pageInfo.nextCursor,
      });
      expect(second.items).toHaveLength(1);
      expect(second.pageInfo.hasNextPage).toBe(false);
    });

    it("still counts the flat member list on the summary card", async () => {
      const { service } = setup({ members: [member(1, 1, 0)] });

      const { counts } = await service.lists(owner);
      const rows = await service.rowsFor(
        owner,
        AssociationAttentionSection.CATEGORY_BEHIND,
      );

      expect(counts.categoryBehind).toBe(rows.length);
    });

    it("excludes a member who is short in nothing", async () => {
      const { service } = setup({ members: [member(1, 8, 12)] });

      const { items, totalCount } =
        await service.categoryAttentionGroups(owner);

      expect(items).toEqual([]);
      expect(totalCount).toBe(0);
    });
  });

  describe("expiring certificates", () => {
    it("lists a member whose certificate expires in exactly 30 days", async () => {
      const soon = daysFromNow(30);

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

    it("ignores a certificate that expires in 31 days", async () => {
      const later = daysFromNow(31);

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

    it("lists a certificate that already expired", async () => {
      const past = daysFromNow(-5);

      const { service } = setup({
        members: [member(1, 10)],
        certificates: [
          {
            id: "cert-1",
            userId: "user-1",
            title: "First Aid",
            validUntil: past,
          },
        ],
      });

      const rows = await service.rowsFor(
        owner,
        AssociationAttentionSection.EXPIRING_CERTIFICATES,
      );

      expect(rows).toHaveLength(1);
      expect(rows[0].detailDate).toEqual(past);
    });

    it("keeps the soonest of a member's certificates", async () => {
      const soon = daysFromNow(10);
      const sooner = daysFromNow(2);

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

    it("wraps a professional-module failure as a source-data-unavailable error", async () => {
      const { service, professional } = setup({ members: [member(1, 10)] });

      professional.certificatesForOwners.mockRejectedValueOnce(
        new Error("boom"),
      );

      await expect(
        service.rowsFor(
          owner,
          AssociationAttentionSection.EXPIRING_CERTIFICATES,
        ),
      ).rejects.toMatchObject({
        response: { code: AssociationMessageCode.SOURCE_DATA_UNAVAILABLE },
      });
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
