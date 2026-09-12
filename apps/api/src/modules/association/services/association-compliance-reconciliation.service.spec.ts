import { AssociationComplianceReconciliationService } from "@association/services/association-compliance-reconciliation.service";
import { AssociationComplianceService } from "@association/services/association-compliance.service";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@prisma/prisma.service";

const row = (id: string) => ({ id });

const setup = ({
  pages = [[row("a-1"), row("a-2")]],
  previews = new Map<string, boolean>([
    ["a-1", true],
    ["a-2", false],
  ]),
}: {
  pages?: { id: string }[][];
  previews?: Map<string, boolean>;
} = {}) => {
  const findMany = jest.fn();
  for (const page of pages) findMany.mockResolvedValueOnce(page);
  findMany.mockResolvedValue(pages.at(-1) ?? []);

  const previewAssignment = jest.fn(async (id: string) => ({
    current: {
      percent: 0,
      band: "NOT_STARTED",
      completedCredits: 0,
      awaitingReviewCount: 0,
      isMissingEvidence: false,
    },
    computed: {
      percent: 0,
      band: "NOT_STARTED",
      completedCredits: 0,
      awaitingReviewCount: 0,
      isMissingEvidence: false,
    },
    wouldChange: previews.get(id) ?? false,
  }));
  const recomputeAssignment = jest.fn().mockResolvedValue({
    assignments: 1,
    attributionsWritten: 0,
    attributionsRemoved: 0,
    discarded: 0,
  });

  const prisma = {
    associationRequirementAssignment: { findMany },
  };

  const compliance = { previewAssignment, recomputeAssignment };
  const config = { get: jest.fn((_key: string, fallback: string) => fallback) };

  return {
    findMany,
    previewAssignment,
    recomputeAssignment,
    service: new AssociationComplianceReconciliationService(
      prisma as unknown as PrismaService,
      config as unknown as ConfigService,
      compliance as unknown as AssociationComplianceService,
    ),
  };
};

describe("AssociationComplianceReconciliationService", () => {
  it("scopes the scan to published requirements and active, targeted members", async () => {
    const { service, findMany } = setup();

    await service.reconcile({ batchSize: 50 });

    const args = findMany.mock.calls[0][0];
    expect(args.where).toEqual({
      isTargeted: true,
      requirement: { status: "PUBLISHED" },
      member: { status: { not: "INACTIVE" } },
    });
    expect(args.take).toBe(50);
  });

  it("dry-run reports what would change without recomputing anything", async () => {
    const { service, recomputeAssignment } = setup();

    const outcome = await service.reconcile({ dryRun: true });

    expect(outcome).toEqual({ scanned: 2, repaired: 1, nextCursor: null });
    expect(recomputeAssignment).not.toHaveBeenCalled();
  });

  it("apply mode recomputes only the assignments that would actually change", async () => {
    const { service, recomputeAssignment } = setup();

    const outcome = await service.reconcile({ dryRun: false });

    expect(outcome.repaired).toBe(1);
    expect(recomputeAssignment).toHaveBeenCalledTimes(1);
    expect(recomputeAssignment).toHaveBeenCalledWith("a-1");
  });

  it("pages with a keyset cursor until the population is exhausted", async () => {
    const { service, findMany } = setup({
      pages: [[row("a-1")], []],
      previews: new Map(),
    });

    const outcome = await service.reconcileAll({ batchSize: 1 });

    expect(findMany).toHaveBeenCalledTimes(2);
    expect(findMany.mock.calls[1][0]).toEqual(
      expect.objectContaining({ cursor: { id: "a-1" }, skip: 1 }),
    );
    expect(outcome).toEqual({ scanned: 1, repaired: 0, nextCursor: null });
  });

  it("running it twice is safe: a second pass reports nothing left to repair", async () => {
    const { service } = setup({
      previews: new Map([
        ["a-1", false],
        ["a-2", false],
      ]),
    });

    const first = await service.reconcile();
    const second = await service.reconcile();

    expect(first.repaired).toBe(0);
    expect(second.repaired).toBe(0);
  });
});
