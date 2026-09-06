import { AssociationReportRetentionService } from "@association/services/association-report-retention.service";
import { AssociationGeneratedReportState } from "@prisma/client";
import { type ObjectStoragePort } from "@infrastructure/storage/object-storage.port";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "@prisma/prisma.service";

const setup = (
  due: { id: string; storageKey: string }[],
  moved = 1,
  order: string[] = [],
) => {
  const findMany = jest.fn().mockResolvedValue(due);
  const updateMany = jest.fn().mockImplementation(() => {
    order.push("mark");
    return Promise.resolve({ count: moved });
  });

  const prisma = { associationGeneratedReport: { findMany, updateMany } };

  const storage = {
    store: jest.fn(),
    resolve: jest.fn(),
    exists: jest.fn(),
    remove: jest.fn().mockImplementation(() => {
      order.push("remove");
      return Promise.resolve();
    }),
  };

  const config = { get: jest.fn().mockReturnValue("3600000") };

  return {
    order,
    storage,
    findMany,
    updateMany,
    service: new AssociationReportRetentionService(
      prisma as unknown as PrismaService,
      config as unknown as ConfigService,
      storage as unknown as ObjectStoragePort,
    ),
  };
};

describe("AssociationReportRetentionService", () => {
  it("deletes the object before it marks the record expired", async () => {
    const { service, order } = setup([{ id: "export-1", storageKey: "a.pdf" }]);

    await service.sweep(new Date("2026-09-05T00:00:00.000Z"));

    expect(order).toEqual(["remove", "mark"]);
  });

  it("only considers ready exports whose retention has run out", async () => {
    const now = new Date("2026-09-05T00:00:00.000Z");
    const { service, findMany } = setup([]);

    await service.sweep(now);

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          state: AssociationGeneratedReportState.READY,
          expiresAt: { lte: now },
        },
      }),
    );
  });

  it("marks with a conditional write, so a second sweep changes nothing", async () => {
    const { service, updateMany } = setup(
      [{ id: "export-1", storageKey: "a.pdf" }],
      0,
    );

    const expired = await service.sweep(new Date());

    expect(expired).toBe(0);
    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "export-1", state: AssociationGeneratedReportState.READY },
      data: { state: AssociationGeneratedReportState.EXPIRED },
    });
  });
});
