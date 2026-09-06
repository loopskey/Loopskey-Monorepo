import { AssociationComplianceReadService } from "@association/services/association-compliance-read.service";
import { type ProfessionalComplianceApi } from "@professional/public/professional-compliance-api";
import { AssociationAccessService } from "@association/services/association-access.service";
import { RECENT_ACTIVITY_DEFAULT } from "@association/services/association-compliance-read.service";
import { RECENT_ACTIVITY_MAX } from "@association/services/association-compliance-read.service";
import { AssociationAttributionState } from "@prisma/client";
import { AssociationRequirementStatus } from "@prisma/client";
import { AssociationComplianceBand } from "@prisma/client";
import { PDUCategory } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { Role } from "@prisma/client";

const owner = { id: "owner-1", role: Role.ASSOCIATION };

const rosterRow = (overrides: Record<string, unknown> = {}) => ({
  memberId: "member-1",
  percent: 25,
  band: AssociationComplianceBand.AT_RISK,
  awaitingReviewCount: 0,
  isMissingEvidence: false,
  completedCredits: 10,
  computedAt: new Date("2026-06-01T00:00:00.000Z"),
  requirement: { totalRequiredCredits: 40 },
  ...overrides,
});

const setup = ({
  rows = [rosterRow()],
  onTrackThreshold = 70,
}: {
  rows?: ReturnType<typeof rosterRow>[];
  onTrackThreshold?: number;
} = {}) => {
  const prisma = {
    associationRequirementAssignment: {
      findMany: jest.fn().mockResolvedValue(rows),
    },
    associationSettings: {
      findUnique: jest.fn().mockResolvedValue({ onTrackThreshold }),
    },
  };

  const access = {
    requireReadable: jest.fn().mockResolvedValue({ id: "assoc-1", name: "A" }),
  };

  return {
    service: new AssociationComplianceReadService(
      prisma as unknown as PrismaService,
      access as unknown as AssociationAccessService,
      {} as unknown as ProfessionalComplianceApi,
    ),
  };
};

describe("AssociationComplianceReadService roster figures", () => {
  it("weights a large requirement above a small one rather than averaging", async () => {
    const { service } = setup({
      rows: [
        rosterRow({
          requirement: { totalRequiredCredits: 10 },
          completedCredits: 10,
        }),
        rosterRow({
          requirement: { totalRequiredCredits: 90 },
          completedCredits: 0,
        }),
      ],
    });

    const [row] = await service.memberComplianceList(owner);

    expect(row.percent).toBe(10);
  });

  it("gives the roster the same figure the member header shows", async () => {
    const { service } = setup({
      rows: [
        rosterRow({
          requirement: { totalRequiredCredits: 40 },
          completedCredits: 10,
        }),
        rosterRow({
          requirement: { totalRequiredCredits: 20 },
          completedCredits: 15,
        }),
      ],
    });

    const [row] = await service.memberComplianceList(owner);

    expect(row.percent).toBe(41.67);
  });

  it("bands a member from the weighted figure, not from an averaged one", async () => {
    const { service } = setup({
      rows: [
        rosterRow({
          requirement: { totalRequiredCredits: 10 },
          completedCredits: 10,
          band: AssociationComplianceBand.RENEWAL_READY,
        }),
        rosterRow({
          requirement: { totalRequiredCredits: 90 },
          completedCredits: 0,
        }),
      ],
    });

    const [row] = await service.memberComplianceList(owner);

    expect(row.band).toBe(AssociationComplianceBand.AT_RISK);
  });

  it("keeps a member with nothing recorded at not started", async () => {
    const { service } = setup({
      rows: [
        rosterRow({
          requirement: { totalRequiredCredits: 40 },
          completedCredits: 0,
          percent: 0,
        }),
      ],
    });

    const [row] = await service.memberComplianceList(owner);

    expect(row.percent).toBe(0);
    expect(row.band).toBe(AssociationComplianceBand.NOT_STARTED);
  });

  it("holds a fully complete member back while a review is unsettled", async () => {
    const { service } = setup({
      rows: [
        rosterRow({
          requirement: { totalRequiredCredits: 10 },
          completedCredits: 10,
          awaitingReviewCount: 1,
        }),
      ],
    });

    const [row] = await service.memberComplianceList(owner);

    expect(row.percent).toBe(100);
    expect(row.band).toBe(AssociationComplianceBand.ON_TRACK);
    expect(row.awaitingReviewCount).toBe(1);
  });

  it("reads every assignment of one member into a single row", async () => {
    const { service } = setup({
      rows: [rosterRow(), rosterRow(), rosterRow({ memberId: "member-2" })],
    });

    const rows = await service.memberComplianceList(owner);

    expect(rows).toHaveLength(2);
  });
});

describe("AssociationComplianceReadService recent activity", () => {
  const attribution = (overrides: Record<string, unknown> = {}) => ({
    id: "attr-1",
    state: AssociationAttributionState.COUNTED,
    activityId: "activity-1",
    activityDate: new Date("2026-02-01T00:00:00.000Z"),
    createdAt: new Date("2026-02-02T00:00:00.000Z"),
    creditedAmount: 4,
    assignment: {
      member: {
        id: "member-1",
        userId: "user-1",
        user: { fullName: "Member One" },
      },
      requirement: { id: "req-1", name: "Annual CPD" },
    },
    ...overrides,
  });

  const recentSetup = ({
    rows = [attribution()],
    activities = [
      {
        id: "activity-1",
        title: "Ethics workshop",
        credits: 6,
        category: PDUCategory.TECHNICAL,
        date: new Date("2026-02-01T00:00:00.000Z"),
        status: "APPROVED",
        userId: "user-1",
        creditType: "PDU",
        hasEvidence: true,
      },
    ],
  }: {
    rows?: ReturnType<typeof attribution>[];
    activities?: Record<string, unknown>[];
  } = {}) => {
    const findMany = jest.fn().mockResolvedValue(rows);
    const activitiesForMembers = jest.fn().mockResolvedValue(activities);

    const prisma = {
      associationCreditAttribution: { findMany },
      associationSettings: { findUnique: jest.fn().mockResolvedValue(null) },
    };

    const access = {
      requireReadable: jest
        .fn()
        .mockResolvedValue({ id: "assoc-1", name: "A" }),
    };

    return {
      findMany,
      activitiesForMembers,
      service: new AssociationComplianceReadService(
        prisma as unknown as PrismaService,
        access as unknown as AssociationAccessService,
        { activitiesForMembers } as unknown as ProfessionalComplianceApi,
      ),
    };
  };

  it("reads the newest first and bounds what it takes", async () => {
    const { service, findMany } = recentSetup();

    await service.recentActivity(owner);

    const [args] = findMany.mock.calls[0];

    expect(args.orderBy).toEqual({ createdAt: "desc" });
    expect(args.take).toBe(RECENT_ACTIVITY_DEFAULT);
  });

  it("refuses to be asked for more than the cap or for nothing", async () => {
    const large = recentSetup();
    await large.service.recentActivity(owner, 5000);
    expect(large.findMany.mock.calls[0][0].take).toBe(RECENT_ACTIVITY_MAX);

    const small = recentSetup();
    await small.service.recentActivity(owner, 0);
    expect(small.findMany.mock.calls[0][0].take).toBe(1);
  });

  it("scopes the read to this association's published requirements", async () => {
    const { service, findMany } = recentSetup();

    await service.recentActivity(owner);

    const [args] = findMany.mock.calls[0];

    expect(args.where.assignment.requirement).toEqual({
      associationId: "assoc-1",
      status: AssociationRequirementStatus.PUBLISHED,
    });
    expect(args.where.assignment.member).toEqual({ associationId: "assoc-1" });
  });

  it("carries the review state and the member the activity belongs to", async () => {
    const { service } = recentSetup({
      rows: [
        attribution({
          state: AssociationAttributionState.AWAITING_REVIEW,
          creditedAmount: 0,
        }),
      ],
    });

    const [row] = await service.recentActivity(owner);

    expect(row.state).toBe(AssociationAttributionState.AWAITING_REVIEW);
    expect(row.memberId).toBe("member-1");
    expect(row.memberName).toBe("Member One");
    expect(row.requirementName).toBe("Annual CPD");
    expect(row.activityTitle).toBe("Ethics workshop");
    expect(row.credits).toBe(6);
    expect(row.creditedAmount).toBe(0);
  });

  it("drops a row the professional context no longer returns", async () => {
    const { service } = recentSetup({ activities: [] });

    expect(await service.recentActivity(owner)).toEqual([]);
  });

  it("asks the professional context once for every member it saw", async () => {
    const { service, activitiesForMembers } = recentSetup({
      rows: [
        attribution({ id: "attr-1" }),
        attribution({ id: "attr-2" }),
        attribution({
          id: "attr-3",
          assignment: {
            member: {
              id: "member-2",
              userId: "user-2",
              user: { fullName: "Member Two" },
            },
            requirement: { id: "req-1", name: "Annual CPD" },
          },
        }),
      ],
    });

    await service.recentActivity(owner);

    expect(activitiesForMembers).toHaveBeenCalledTimes(1);
    expect(activitiesForMembers).toHaveBeenCalledWith({
      userIds: ["user-1", "user-2"],
    });
  });
});
