import { AssociationComplianceReadService } from "@association/services/association-compliance-read.service";
import { type ProfessionalComplianceApi } from "@professional/public/professional-compliance-api";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationComplianceBand } from "@prisma/client";
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
