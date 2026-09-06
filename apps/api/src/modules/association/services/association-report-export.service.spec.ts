import { AssociationGeneratedReportState, Prisma } from "@prisma/client";
import { AssociationReportFormat, AssociationReportType } from "@prisma/client";
import { AssociationReportExportService } from "@association/services/association-report-export.service";
import { AssociationReportService } from "@association/services/association-report.service";
import { AssociationAccessService } from "@association/services/association-access.service";
import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { type ObjectStoragePort } from "@infrastructure/storage/object-storage.port";
import { AssociationReportPeriod } from "@association/utils/association-report-period.util";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { PrismaService } from "@prisma/prisma.service";
import { Role } from "@prisma/client";

const owner = { id: "owner-1", role: Role.ASSOCIATION };

const stranger = { id: "owner-2", role: Role.ASSOCIATION };

const REQUEST = {
  reportType: AssociationReportType.MEMBER_PROGRESS,
  format: AssociationReportFormat.PDF,
  filter: { period: AssociationReportPeriod.THIS_YEAR },
};

const record = (overrides: Record<string, unknown> = {}) => ({
  id: "export-1",
  associationId: "assoc-1",
  requestedById: owner.id,
  reportType: AssociationReportType.MEMBER_PROGRESS,
  format: AssociationReportFormat.PDF,
  filter: { period: "THIS_YEAR", includeInactive: false },
  filterHash: "hash",
  locale: "en",
  state: AssociationGeneratedReportState.READY,
  storageKey: "key.pdf",
  fileName: "member-progress-2026-09-05.pdf",
  mimeType: "application/pdf",
  sizeBytes: 2048,
  rowCount: 12,
  failureReason: null,
  readyAt: new Date("2026-09-05T00:00:00.000Z"),
  expiresAt: new Date("2026-09-12T00:00:00.000Z"),
  createdAt: new Date("2026-09-05T00:00:00.000Z"),
  updatedAt: new Date("2026-09-05T00:00:00.000Z"),
  ...overrides,
});

const uniqueViolation = () =>
  new Prisma.PrismaClientKnownRequestError("duplicate", {
    code: "P2002",
    clientVersion: "6.11.1",
  });

const refusal = async (act: Promise<unknown>) => {
  try {
    await act;
    return null;
  } catch (error) {
    return {
      status: (error as { getStatus: () => number }).getStatus(),
      code: (error as { getResponse: () => { code: string } }).getResponse()
        .code,
    };
  }
};

const setup = ({
  found = record(),
  exists = true,
  create,
  transaction,
}: {
  found?: ReturnType<typeof record> | null;
  exists?: boolean;
  create?: jest.Mock;
  transaction?: jest.Mock;
} = {}) => {
  const updateMany = jest.fn().mockResolvedValue({ count: 1 });
  const createFn = create ?? jest.fn().mockResolvedValue(record());
  const findFirst = jest.fn().mockResolvedValue(found);

  const client = {
    associationGeneratedReport: {
      findFirst,
      updateMany,
      create: createFn,
      count: jest.fn().mockResolvedValue(1),
      findMany: jest.fn().mockResolvedValue([]),
    },
  };

  const prisma = {
    ...client,
    $transaction:
      transaction ??
      jest
        .fn()
        .mockImplementation((run: (tx: unknown) => unknown) =>
          Promise.resolve(run(client)),
        ),
  };

  const access = {
    requireOwned: jest.fn().mockImplementation((user: { id: string }) => {
      if (user.id !== owner.id)
        return Promise.resolve({ id: "assoc-2", name: "Other" });
      return Promise.resolve({ id: "assoc-1", name: "Institute" });
    }),
    requireReadable: jest
      .fn()
      .mockResolvedValue({ id: "assoc-1", name: "Institute" }),
  };

  const reports = { assertFilterUsable: jest.fn().mockResolvedValue({}) };

  const outbox = { append: jest.fn().mockResolvedValue({ id: "event-1" }) };

  const storage = {
    store: jest.fn(),
    remove: jest.fn(),
    exists: jest.fn().mockResolvedValue(exists),
    resolve: jest.fn().mockReturnValue("/uploads/reports/key.pdf"),
  };

  return {
    outbox,
    storage,
    findFirst,
    updateMany,
    create: createFn,
    transaction: prisma.$transaction as jest.Mock,
    service: new AssociationReportExportService(
      prisma as unknown as PrismaService,
      access as unknown as AssociationAccessService,
      reports as unknown as AssociationReportService,
      outbox as unknown as OutboxService,
      storage as unknown as ObjectStoragePort,
    ),
  };
};

describe("AssociationReportExportService", () => {
  describe("requesting", () => {
    it("creates a pending record and its outbox event in one transaction", async () => {
      const pending = record({
        state: AssociationGeneratedReportState.PENDING,
      });
      const { service, outbox, create } = setup({
        create: jest.fn().mockResolvedValue(pending),
      });

      const result = await service.request(owner, REQUEST);

      expect(create).toHaveBeenCalledTimes(1);
      expect(outbox.append).toHaveBeenCalledTimes(1);
      expect(result.state).toBe(AssociationGeneratedReportState.PENDING);
    });

    it("joins the pending record when the partial unique index refuses a twin", async () => {
      const pending = record({
        id: "export-winner",
        state: AssociationGeneratedReportState.PENDING,
      });

      const { service, outbox } = setup({
        found: pending,
        transaction: jest.fn().mockRejectedValue(uniqueViolation()),
      });

      const result = await service.request(owner, REQUEST);

      expect(result.id).toBe("export-winner");
      expect(outbox.append).not.toHaveBeenCalled();
    });

    it("re-throws a violation it cannot recover into a pending record", async () => {
      const { service } = setup({
        found: null,
        transaction: jest.fn().mockRejectedValue(uniqueViolation()),
      });

      await expect(service.request(owner, REQUEST)).rejects.toBeInstanceOf(
        Prisma.PrismaClientKnownRequestError,
      );
    });
  });

  describe("retrying", () => {
    it("moves a failed export back to pending with a conditional write", async () => {
      const { service, updateMany, outbox } = setup({
        found: record({ state: AssociationGeneratedReportState.FAILED }),
      });

      await service.retry(owner, "export-1");

      expect(updateMany).toHaveBeenCalledWith({
        where: {
          id: "export-1",
          state: AssociationGeneratedReportState.FAILED,
        },
        data: {
          failureReason: null,
          state: AssociationGeneratedReportState.PENDING,
        },
      });
      expect(outbox.append).toHaveBeenCalledTimes(1);
    });

    it("does nothing to an export that is already ready", async () => {
      const { service, updateMany, outbox } = setup();

      const result = await service.retry(owner, "export-1");

      expect(result.state).toBe(AssociationGeneratedReportState.READY);
      expect(updateMany).not.toHaveBeenCalled();
      expect(outbox.append).not.toHaveBeenCalled();
    });

    it("requests a fresh export when the old one expired", async () => {
      const { service, create, outbox } = setup({
        found: record({ state: AssociationGeneratedReportState.EXPIRED }),
        create: jest
          .fn()
          .mockResolvedValue(
            record({ state: AssociationGeneratedReportState.PENDING }),
          ),
      });

      const result = await service.retry(owner, "export-1");

      expect(create).toHaveBeenCalledTimes(1);
      expect(outbox.append).toHaveBeenCalledTimes(1);
      expect(result.state).toBe(AssociationGeneratedReportState.PENDING);
    });
  });

  describe("downloading", () => {
    it("hands back the stored file for the association that owns it", async () => {
      const { service } = setup();

      const file = await service.downloadable(owner, "export-1");

      expect(file.fileName).toBe("member-progress-2026-09-05.pdf");
      expect(file.mimeType).toBe("application/pdf");
      expect(file.filePath).toBe("/uploads/reports/key.pdf");
    });

    it("answers another association's export exactly as it answers a missing one", async () => {
      const missing = setup({ found: null });
      const foreign = setup({ found: null });

      const onMissing = await refusal(
        missing.service.downloadable(owner, "export-1"),
      );
      const onForeign = await refusal(
        foreign.service.downloadable(stranger, "export-1"),
      );

      expect(onMissing).toEqual({
        status: 404,
        code: AssociationMessageCode.EXPORT_NOT_FOUND,
      });
      expect(onForeign).toEqual(onMissing);
    });

    it("refuses a pending export as not ready", async () => {
      const { service } = setup({
        found: record({ state: AssociationGeneratedReportState.PENDING }),
      });

      expect(await refusal(service.downloadable(owner, "export-1"))).toEqual({
        status: 409,
        code: AssociationMessageCode.EXPORT_NOT_READY,
      });
    });

    it("refuses a failed export with its own code", async () => {
      const { service } = setup({
        found: record({ state: AssociationGeneratedReportState.FAILED }),
      });

      expect(await refusal(service.downloadable(owner, "export-1"))).toEqual({
        status: 409,
        code: AssociationMessageCode.EXPORT_FAILED,
      });
    });

    it("refuses an expired export", async () => {
      const { service } = setup({
        found: record({ state: AssociationGeneratedReportState.EXPIRED }),
      });

      expect(await refusal(service.downloadable(owner, "export-1"))).toEqual({
        status: 410,
        code: AssociationMessageCode.EXPORT_EXPIRED,
      });
    });

    it("treats a ready record whose object is gone as expired", async () => {
      const { service } = setup({ exists: false });

      expect(await refusal(service.downloadable(owner, "export-1"))).toEqual({
        status: 410,
        code: AssociationMessageCode.EXPORT_EXPIRED,
      });
    });

    it("never returns the storage key to a caller", async () => {
      const { service } = setup();

      const listed = await service.findOne(owner, "export-1");

      expect(listed).not.toHaveProperty("storageKey");
      expect(listed).not.toHaveProperty("filterHash");
    });
  });
});
