import { AssociationComplianceReadService } from "@association/services/association-compliance-read.service";
import { AssociationReportDatasetService } from "@association/services/association-report-dataset.service";
import { AssociationReportService } from "@association/services/association-report.service";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationReportPeriod } from "@association/utils/association-report-period.util";
import {
  AssociationAttributionState,
  AssociationReportType,
} from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { Role } from "@prisma/client";

const owner = { id: "owner-1", role: Role.ASSOCIATION };

const THIS_YEAR = { period: AssociationReportPeriod.THIS_YEAR };

const member = (index: number, credited: number) => ({
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
  credited,
});

const setup = (members: ReturnType<typeof member>[]) => {
  const prisma = {
    associationMember: {
      findMany: jest.fn().mockResolvedValue(members),
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
            categories: [],
          },
        })),
      ),
    },
    associationCreditAttribution: {
      groupBy: jest.fn().mockResolvedValue(
        members.map((row) => ({
          assignmentId: `assign-${row.id}`,
          categoryId: null,
          state: AssociationAttributionState.COUNTED,
          _sum: { creditedAmount: row.credited },
          _count: { _all: 1 },
        })),
      ),
    },
    associationGroup: { findFirst: jest.fn(), findUnique: jest.fn() },
    associationRequirement: { findFirst: jest.fn(), findUnique: jest.fn() },
  };

  const access = {
    requireReadable: jest
      .fn()
      .mockResolvedValue({ id: "assoc-1", name: "Institute" }),
  };

  const compliance = { onTrackThreshold: jest.fn().mockResolvedValue(70) };

  const reports = new AssociationReportService(
    prisma as unknown as PrismaService,
    access as unknown as AssociationAccessService,
    compliance as unknown as AssociationComplianceReadService,
  );

  return {
    reports,
    datasets: new AssociationReportDatasetService(
      prisma as unknown as PrismaService,
      reports,
    ),
  };
};

describe("AssociationReportDatasetService", () => {
  it("exports the rows the screen reads, from the same report query", async () => {
    const { reports, datasets } = setup([member(1, 10), member(2, 4)]);

    const onScreen = await reports.memberProgressReport(owner, THIS_YEAR);
    const dataset = await datasets.build(
      owner,
      AssociationReportType.MEMBER_PROGRESS,
      THIS_YEAR,
      "en",
    );

    expect(dataset.totalRows).toBe(onScreen.totalCount);
    expect(dataset.rows).toHaveLength(onScreen.items.length);

    onScreen.items.forEach((row, index) => {
      expect(dataset.rows[index].member).toBe(row.fullName);
      expect(dataset.rows[index].email).toBe(row.email);
      expect(dataset.rows[index].memberNumber).toBe(row.memberNumber);
      expect(dataset.rows[index].group).toBe(row.groupTitle);
      expect(dataset.rows[index].completion).toBe(row.percent);
      expect(dataset.rows[index].requiredCredits).toBe(row.requiredCredits);
      expect(dataset.rows[index].completedCredits).toBe(row.completedCredits);
    });
  });

  it("carries the same summary figures the cards show", async () => {
    const { reports, datasets } = setup([member(1, 10), member(2, 4)]);

    const summary = await reports.summary(owner, THIS_YEAR);
    const dataset = await datasets.build(
      owner,
      AssociationReportType.MEMBER_PROGRESS,
      THIS_YEAR,
      "en",
    );

    expect(dataset.summary).toContainEqual({
      label: "Members",
      value: String(summary.totalMembers),
    });
    expect(dataset.summary).toContainEqual({
      label: "Average completion",
      value: `${summary.averageCompletion.toLocaleString("en-GB")}%`,
    });
  });

  it("renders French labels, dates and numbers for a French request", async () => {
    const { datasets } = setup([member(1, 10)]);

    const dataset = await datasets.build(
      owner,
      AssociationReportType.MEMBER_PROGRESS,
      THIS_YEAR,
      "fr",
    );

    expect(dataset.title).toBe("Progression des membres");
    expect(dataset.columns.map((column) => column.label)).toContain("Membre");
    expect(dataset.filterLines[0].label).toBe("Période");
    expect(dataset.filterLines[0].value).toContain("Cette année");
  });

  it("names the band distribution rows the overview summary shows", async () => {
    const { reports, datasets } = setup([member(1, 10), member(2, 1)]);

    const distribution = await reports.memberDistribution(owner, THIS_YEAR);
    const dataset = await datasets.build(
      owner,
      AssociationReportType.OVERVIEW_SUMMARY,
      THIS_YEAR,
      "en",
    );

    expect(dataset.rows.map((row) => row.band)).toEqual([
      "Renewal ready",
      "On track",
      "At risk",
      "Not started",
    ]);
    expect(dataset.rows[0].members).toBe(distribution.renewalReady);
    expect(dataset.rows[0].share).toBe(distribution.renewalReadyShare);
  });
});
