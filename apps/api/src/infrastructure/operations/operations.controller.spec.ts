import { OperationsController } from "./operations.controller";
import type { PrismaService } from "@prisma/prisma.service";

describe("OperationsController", () => {
  it("reports process liveness without checking dependencies", () => {
    const prisma = { $queryRaw: jest.fn() };
    expect(
      new OperationsController(prisma as unknown as PrismaService).health(),
    ).toEqual({ status: "ok" });
    expect(prisma.$queryRaw).not.toHaveBeenCalled();
  });

  it("reports readiness only after the database responds", async () => {
    const prisma = { $queryRaw: jest.fn().mockResolvedValue([{ ok: 1 }]) };
    await expect(
      new OperationsController(prisma as unknown as PrismaService).readiness(),
    ).resolves.toEqual({ status: "ready", checks: { database: "up" } });
    expect(prisma.$queryRaw).toHaveBeenCalledTimes(1);
  });
});
