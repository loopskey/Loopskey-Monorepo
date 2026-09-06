import { AssociationComplianceService } from "@association/services/association-compliance.service";
import { type ProfessionalComplianceApi } from "@professional/public/professional-compliance-api";
import { AssociationEvidencePolicy, PDUStatus } from "@prisma/client";
import { AssociationComplianceBand } from "@prisma/client";
import { CreditType, PDUCategory } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";

const day = (iso: string) => new Date(`${iso}T00:00:00.000Z`);

const assignmentRow = (overrides: Record<string, unknown> = {}) => ({
  id: "assign-1",
  cycleStart: day("2026-01-01"),
  cycleEnd: null,
  member: { id: "member-1", userId: "user-1" },
  requirement: {
    id: "req-1",
    associationId: "assoc-1",
    creditType: CreditType.CPD,
    evidencePolicy: AssociationEvidencePolicy.NOT_REQUIRED,
    reportingStart: day("2026-01-01"),
    reportingEnd: day("2026-12-31"),
    deadline: day("2026-12-31"),
    gracePeriodDays: 0,
    allowLateSubmission: false,
    totalRequiredCredits: 20,
    categories: [],
  },
  ...overrides,
});

const activity = (overrides: Record<string, unknown> = {}) => ({
  id: "act-1",
  userId: "user-1",
  title: "A course",
  category: PDUCategory.TECHNICAL,
  creditType: CreditType.CPD,
  credits: 10,
  date: day("2026-06-01"),
  status: PDUStatus.APPROVED,
  hasEvidence: true,
  ...overrides,
});

const setup = ({
  assignments = [assignmentRow()],
  activities = [activity()],
  applied = 1,
}: {
  assignments?: ReturnType<typeof assignmentRow>[];
  activities?: ReturnType<typeof activity>[];
  applied?: number;
} = {}) => {
  const upsert = jest.fn().mockResolvedValue({});
  const deleteMany = jest.fn().mockResolvedValue({ count: 0 });
  const updateMany = jest.fn().mockResolvedValue({ count: applied });

  const tx = {
    associationCreditAttribution: { upsert, deleteMany },
    associationRequirementAssignment: { updateMany },
  };

  const prisma = {
    associationRequirementAssignment: {
      findUnique: jest.fn().mockResolvedValue(assignments[0] ?? null),
      findMany: jest.fn().mockResolvedValue(assignments),
    },
    associationSettings: {
      findUnique: jest.fn().mockResolvedValue({ onTrackThreshold: 70 }),
    },
    $transaction: jest.fn(
      async (run: (client: typeof tx) => Promise<unknown>) => run(tx),
    ),
  };

  const port = {
    activitiesForMembers: jest.fn().mockResolvedValue(activities),
    activityForOwners: jest.fn(),
    settleReview: jest.fn(),
  };

  return {
    tx,
    upsert,
    deleteMany,
    updateMany,
    prisma,
    port,
    service: new AssociationComplianceService(
      prisma as unknown as PrismaService,
      port as unknown as ProfessionalComplianceApi,
    ),
  };
};

describe("AssociationComplianceService", () => {
  it("writes one attribution per qualifying activity and caches the totals", async () => {
    const { service, upsert, updateMany } = setup();

    await service.recomputeAssignment("assign-1");

    expect(upsert).toHaveBeenCalledTimes(1);
    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          completedCredits: 10,
          percent: 50,
          band: AssociationComplianceBand.AT_RISK,
          awaitingReviewCount: 0,
          isMissingEvidence: false,
        }),
      }),
    );
  });

  it("is idempotent: a second run upserts the same rows and changes no total", async () => {
    const first = setup();
    await first.service.recomputeAssignment("assign-1");
    const firstWrite = first.updateMany.mock.calls[0][0].data;

    const second = setup();
    await second.service.recomputeAssignment("assign-1");
    const secondWrite = second.updateMany.mock.calls[0][0].data;

    expect(second.upsert).toHaveBeenCalledTimes(1);
    expect(secondWrite.completedCredits).toBe(firstWrite.completedCredits);
    expect(secondWrite.percent).toBe(firstWrite.percent);
    expect(secondWrite.band).toBe(firstWrite.band);
  });

  it("guards the cached aggregate on computedAt so a stale pass cannot overwrite a newer one", async () => {
    const { service, updateMany } = setup();

    await service.recomputeAssignment("assign-1");

    const where = updateMany.mock.calls[0][0].where;
    expect(where.OR).toEqual([
      { computedAt: null },
      { computedAt: { lte: expect.any(Date) } },
    ]);
    expect(updateMany.mock.calls[0][0].data.computedAt).toEqual(
      where.OR[1].computedAt.lte,
    );
  });

  it("reports a discarded result when the guard matches nothing", async () => {
    const { service } = setup({ applied: 0 });

    const outcome = await service.recomputeAssignment("assign-1");

    expect(outcome.discarded).toBe(1);
  });

  it("removes an attribution whose activity no longer qualifies", async () => {
    const { service, deleteMany } = setup({ activities: [] });

    await service.recomputeAssignment("assign-1");

    expect(deleteMany).toHaveBeenCalledWith({
      where: { assignmentId: "assign-1" },
    });
  });

  it("counts one activity in full for each of two requirements", async () => {
    const { service, updateMany } = setup({
      assignments: [
        assignmentRow(),
        assignmentRow({
          id: "assign-2",
          requirement: {
            ...assignmentRow().requirement,
            id: "req-2",
            totalRequiredCredits: 10,
          },
        }),
      ],
    });

    await service.recomputeForMember("member-1");

    const totals = updateMany.mock.calls.map((call) => call[0].data);
    expect(totals[0].completedCredits).toBe(10);
    expect(totals[1].completedCredits).toBe(10);
    expect(totals[1].band).toBe(AssociationComplianceBand.RENEWAL_READY);
  });

  it("holds credits back and raises the flag while a review is outstanding", async () => {
    const { service, updateMany } = setup({
      assignments: [
        assignmentRow({
          requirement: {
            ...assignmentRow().requirement,
            evidencePolicy: AssociationEvidencePolicy.REQUIRED_NEEDS_REVIEW,
          },
        }),
      ],
      activities: [activity({ status: PDUStatus.PENDING })],
    });

    await service.recomputeAssignment("assign-1");

    expect(updateMany.mock.calls[0][0].data).toMatchObject({
      completedCredits: 0,
      awaitingReviewCount: 1,
      isMissingEvidence: true,
      band: AssociationComplianceBand.NOT_STARTED,
    });
  });

  it("reads a member's activities once and replays them across every assignment", async () => {
    const { service, port } = setup({
      assignments: [assignmentRow(), assignmentRow({ id: "assign-2" })],
    });

    await service.recomputeForMember("member-1");

    expect(port.activitiesForMembers).toHaveBeenCalledTimes(1);
    expect(port.activitiesForMembers).toHaveBeenCalledWith({
      userIds: ["user-1"],
    });
  });
});
