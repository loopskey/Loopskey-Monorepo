import { ProfessionalComplianceApiService } from "@professional/application/professional-compliance-api.service";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { PDUCompletionStatus, PDUStatus } from "@prisma/client";
import { CreditType, PDUCategory } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";

const activityRow = (overrides: Record<string, unknown> = {}) => ({
  id: "act-1",
  userId: "user-1",
  title: "A course",
  category: PDUCategory.TECHNICAL,
  creditType: CreditType.CPD,
  pdus: 10,
  date: new Date("2026-06-01T00:00:00.000Z"),
  status: PDUStatus.PENDING,
  evidenceUrl: null,
  _count: { evidenceFiles: 0 },
  ...overrides,
});

const setup = ({
  rows = [activityRow()],
  settledCount = 1,
}: { rows?: ReturnType<typeof activityRow>[]; settledCount?: number } = {}) => {
  const findMany = jest.fn().mockResolvedValue(rows);
  const findFirst = jest.fn().mockResolvedValue(rows[0] ?? null);
  const updateMany = jest.fn().mockResolvedValue({ count: settledCount });
  const findUnique = jest.fn().mockResolvedValue({ userId: "user-1" });
  const append = jest.fn().mockResolvedValue({});

  const prisma = {
    pDUActivity: { findMany, findFirst, updateMany, findUnique },
  };

  return {
    findMany,
    findFirst,
    updateMany,
    append,
    service: new ProfessionalComplianceApiService(
      prisma as unknown as PrismaService,
      { append } as unknown as OutboxService,
    ),
  };
};

describe("ProfessionalComplianceApiService", () => {
  describe("the ownership boundary", () => {
    it("returns nothing for an empty membership rather than reading everyone", async () => {
      const { service, findMany } = setup();

      await expect(
        service.activitiesForMembers({ userIds: [] }),
      ).resolves.toEqual([]);
      expect(findMany).not.toHaveBeenCalled();
    });

    it("filters every read to the user ids the caller proved it owns", async () => {
      const { service, findMany } = setup();

      await service.activitiesForMembers({ userIds: ["user-1", "user-2"] });

      expect(findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: { in: ["user-1", "user-2"] },
            completionStatus: PDUCompletionStatus.COMPLETED,
          }),
        }),
      );
    });

    it("cannot reach a single activity outside the owner list", async () => {
      const { service, findFirst } = setup();

      await service.activityForOwners("act-1", ["user-1"]);

      expect(findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "act-1", userId: { in: ["user-1"] } },
        }),
      );
    });

    it("refuses to settle a review with no owner list", async () => {
      const { service, updateMany } = setup();

      await expect(
        service.settleReview({
          activityId: "act-1",
          ownerUserIds: [],
          approve: true,
        }),
      ).resolves.toBe(false);
      expect(updateMany).not.toHaveBeenCalled();
    });
  });

  describe("settleReview", () => {
    it("is a conditional write naming PENDING and the owner list", async () => {
      const { service, updateMany } = setup();

      await service.settleReview({
        activityId: "act-1",
        ownerUserIds: ["user-1"],
        approve: true,
      });

      expect(updateMany).toHaveBeenCalledWith({
        where: {
          id: "act-1",
          userId: { in: ["user-1"] },
          status: PDUStatus.PENDING,
        },
        data: { status: PDUStatus.APPROVED, reviewNote: null },
      });
    });

    it("reports false, and announces nothing, when the row had already moved", async () => {
      const { service, append } = setup({ settledCount: 0 });

      await expect(
        service.settleReview({
          activityId: "act-1",
          ownerUserIds: ["user-1"],
          approve: true,
        }),
      ).resolves.toBe(false);
      expect(append).not.toHaveBeenCalled();
    });

    it("stores a rejection reason for the member to read", async () => {
      const { service, updateMany } = setup();

      await service.settleReview({
        activityId: "act-1",
        ownerUserIds: ["user-1"],
        approve: false,
        reviewNote: "  The certificate does not name you.  ",
      });

      expect(updateMany.mock.calls[0][0].data).toEqual({
        status: PDUStatus.REJECTED,
        reviewNote: "The certificate does not name you.",
      });
    });

    it("announces the change so the association projection recomputes", async () => {
      const { service, append } = setup();

      await service.settleReview({
        activityId: "act-1",
        ownerUserIds: ["user-1"],
        approve: true,
      });

      expect(append).toHaveBeenCalledWith(
        expect.objectContaining({
          aggregateId: "act-1",
          payload: { activityId: "act-1", userId: "user-1" },
        }),
      );
    });
  });

  it("treats an evidence file as evidence, and an empty url as none", async () => {
    const { service } = setup({
      rows: [
        activityRow({ id: "a", evidenceUrl: "   " }),
        activityRow({ id: "b", _count: { evidenceFiles: 2 } }),
        activityRow({ id: "c", evidenceUrl: "https://example.test/proof" }),
      ],
    });

    const activities = await service.activitiesForMembers({
      userIds: ["user-1"],
    });

    expect(activities.map((entry) => entry.hasEvidence)).toEqual([
      false,
      true,
      true,
    ]);
  });
});
