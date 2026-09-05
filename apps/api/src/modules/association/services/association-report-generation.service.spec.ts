import { AssociationGeneratedReportState } from "@prisma/client";
import { AssociationReportFormat, AssociationReportType } from "@prisma/client";
import { AssociationReportGenerationService } from "@association/services/association-report-generation.service";
import { AssociationReportDatasetService } from "@association/services/association-report-dataset.service";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { type ObjectStoragePort } from "@infrastructure/storage/object-storage.port";
import { NotFoundException } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";

const dataset = {
  title: "Member progress",
  answer: "Who is ahead and who is behind, member by member.",
  columns: [
    { key: "member", label: "Member", kind: "text" as const, weight: 4 },
    {
      key: "completion",
      label: "Completion",
      kind: "percent" as const,
      weight: 2,
    },
  ],
  rows: [{ member: "Member 1", completion: 100 }],
  summary: [{ label: "Members", value: "1" }],
  filterLines: [{ label: "Period", value: "This year" }],
  totalRows: 1,
  isTruncated: false,
};

const record = (overrides: Record<string, unknown> = {}) => ({
  id: "export-1",
  associationId: "assoc-1",
  requestedById: "owner-1",
  reportType: AssociationReportType.MEMBER_PROGRESS,
  format: AssociationReportFormat.EXCEL,
  filter: { period: "THIS_YEAR" },
  locale: "en",
  state: AssociationGeneratedReportState.PENDING,
  storageKey: "key.xlsx",
  association: { name: "Institute", logoUrl: null },
  ...overrides,
});

const setup = ({
  found = record(),
  moved = 1,
  build,
}: {
  found?: Record<string, unknown> | null;
  moved?: number;
  build?: jest.Mock;
} = {}) => {
  const updateMany = jest.fn().mockResolvedValue({ count: moved });
  const findUnique = jest
    .fn()
    .mockResolvedValueOnce(found)
    .mockResolvedValue({ storageKey: "key.xlsx" });

  const prisma = {
    associationGeneratedReport: { findUnique, updateMany },
  };

  const datasets = { build: build ?? jest.fn().mockResolvedValue(dataset) };

  const storage = {
    store: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
    exists: jest.fn().mockResolvedValue(true),
    resolve: jest.fn(),
  };

  return {
    storage,
    updateMany,
    datasets,
    service: new AssociationReportGenerationService(
      prisma as unknown as PrismaService,
      datasets as unknown as AssociationReportDatasetService,
      storage as unknown as ObjectStoragePort,
    ),
  };
};

describe("AssociationReportGenerationService", () => {
  it("writes the file before the record claims to be ready", async () => {
    const order: string[] = [];
    const { service, storage, updateMany } = setup();

    storage.store.mockImplementation(() => {
      order.push("store");
      return Promise.resolve();
    });
    updateMany.mockImplementation(() => {
      order.push("update");
      return Promise.resolve({ count: 1 });
    });

    await service.run("export-1");

    expect(order).toEqual(["store", "update"]);
  });

  it("moves to ready with a conditional write that names pending", async () => {
    const { service, updateMany } = setup();

    await service.run("export-1");

    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "export-1",
          state: AssociationGeneratedReportState.PENDING,
        },
        data: expect.objectContaining({
          state: AssociationGeneratedReportState.READY,
        }),
      }),
    );
  });

  it("does nothing when a redelivery finds the export already ready", async () => {
    const { service, storage, updateMany, datasets } = setup({
      found: record({ state: AssociationGeneratedReportState.READY }),
    });

    await service.run("export-1");

    expect(datasets.build).not.toHaveBeenCalled();
    expect(storage.store).not.toHaveBeenCalled();
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("leaves the winner's file alone when its own conditional write loses", async () => {
    const { service, storage } = setup({ moved: 0 });

    await service.run("export-1");

    expect(storage.store).toHaveBeenCalledTimes(1);
    expect(storage.remove).not.toHaveBeenCalled();
  });

  it("marks a domain refusal as failed and asks for no retry", async () => {
    const { service, updateMany, storage } = setup({
      build: jest.fn().mockRejectedValue(
        new NotFoundException({
          code: AssociationMessageCode.GROUP_NOT_FOUND,
          message: "gone",
        }),
      ),
    });

    await expect(service.run("export-1")).resolves.toBeUndefined();

    expect(updateMany).toHaveBeenCalledWith({
      where: { id: "export-1", state: AssociationGeneratedReportState.PENDING },
      data: {
        failureReason: AssociationMessageCode.GROUP_NOT_FOUND,
        state: AssociationGeneratedReportState.FAILED,
      },
    });
    expect(storage.remove).toHaveBeenCalledWith("report", "key.xlsx");
  });

  it("re-throws an unexpected failure so the outbox retries it", async () => {
    const { service, updateMany } = setup({
      build: jest.fn().mockRejectedValue(new Error("socket hang up")),
    });

    await expect(service.run("export-1")).rejects.toThrow("socket hang up");
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("does not remove a file when the failing write finds no pending record", async () => {
    const { service, storage } = setup({ moved: 0 });

    await service.fail("export-1", AssociationMessageCode.EXPORT_FAILED);

    expect(storage.remove).not.toHaveBeenCalled();
  });

  it("ignores an export that no longer exists", async () => {
    const { service, storage } = setup({ found: null });

    await expect(service.run("export-1")).resolves.toBeUndefined();
    expect(storage.store).not.toHaveBeenCalled();
  });
});
