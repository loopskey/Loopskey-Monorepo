import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { NotFoundException } from "@nestjs/common";
import { Prisma, Role } from "@prisma/client";
import { LearningActivityChangeKind } from "@professional/public/professional-compliance-api.events";
import { ProfessionalPduFileService } from "./professional-pdu-file.service";
import type { PrismaService } from "@prisma/prisma.service";
import type { ProfessionalPduService } from "./professional-pdu.service";

const professional = { id: "user-1", role: Role.PROFESSIONAL };

const buildFile = (
  overrides: Partial<Express.Multer.File> = {},
): Express.Multer.File =>
  ({
    fieldname: "files",
    originalname: "evidence.pdf",
    mimetype: "application/pdf",
    size: 1024,
    buffer: Buffer.from("fake-pdf-bytes"),
    ...overrides,
  }) as Express.Multer.File;

const uniqueViolation = () => {
  const error = new Prisma.PrismaClientKnownRequestError("duplicate", {
    code: "P2002",
    clientVersion: "test",
  });
  return error;
};

const createPrismaMock = () => {
  const prisma: Record<string, unknown> = {
    pDUActivity: {
      findFirst: jest
        .fn()
        .mockResolvedValue({ id: "activity-1", _count: { evidenceFiles: 0 } }),
    },
    pDUActivityFile: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest.fn(),
      findFirst: jest.fn(),
      findFirstOrThrow: jest.fn(),
      delete: jest.fn(),
    },
  };
  prisma.$transaction = jest.fn(async (run: (tx: unknown) => unknown) =>
    run(prisma),
  );
  return prisma as unknown as {
    pDUActivity: { findFirst: jest.Mock };
    pDUActivityFile: {
      findMany: jest.Mock;
      create: jest.Mock;
      findFirst: jest.Mock;
      findFirstOrThrow: jest.Mock;
      delete: jest.Mock;
    };
    $transaction: jest.Mock;
  };
};

const createService = (prisma = createPrismaMock()) => {
  const pduService = {
    announceEvidenceChange: jest.fn().mockResolvedValue(undefined),
    removeEvidenceBlobs: jest.fn().mockResolvedValue(undefined),
  };
  const storage = {
    store: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
    resolve: jest.fn(),
    exists: jest.fn(),
    read: jest.fn(),
  };
  const service = new ProfessionalPduFileService(
    prisma as unknown as PrismaService,
    pduService as unknown as ProfessionalPduService,
    storage,
  );
  return { service, prisma, pduService, storage };
};

describe("ProfessionalPduFileService.uploadEvidence", () => {
  it("rejects a non-professional, non-admin caller", async () => {
    const { service } = createService();
    await expect(
      service.uploadEvidence({ id: "u", role: Role.PROVIDER }, "activity-1", [
        buildFile(),
      ]),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it("rejects an activity the caller does not own", async () => {
    const { service, prisma } = createService();
    prisma.pDUActivity.findFirst.mockResolvedValueOnce(null);
    await expect(
      service.uploadEvidence(professional, "activity-1", [buildFile()]),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("creates one row per new file and announces the evidence change", async () => {
    const { service, prisma, pduService } = createService();
    prisma.pDUActivityFile.create
      .mockResolvedValueOnce({ id: "file-1" })
      .mockResolvedValueOnce({ id: "file-2" });

    const result = await service.uploadEvidence(
      professional,
      "activity-1",
      [buildFile(), buildFile({ originalname: "second.pdf" })],
      ["key-1", "key-2"],
    );

    expect(result).toEqual({ activityId: "activity-1", uploaded: 2 });
    expect(prisma.pDUActivityFile.create).toHaveBeenCalledTimes(2);
    expect(pduService.announceEvidenceChange).toHaveBeenCalledWith(
      prisma,
      "activity-1",
      "user-1",
      LearningActivityChangeKind.EVIDENCE_ADDED,
    );
  });

  it("does not create a duplicate row when the same upload key was already stored", async () => {
    const { service, prisma } = createService();
    prisma.pDUActivityFile.findMany.mockResolvedValueOnce([
      { id: "existing-file", uploadKey: "retry-key" },
    ]);

    const result = await service.uploadEvidence(
      professional,
      "activity-1",
      [buildFile()],
      ["retry-key"],
    );

    expect(result).toEqual({ activityId: "activity-1", uploaded: 1 });
    expect(prisma.pDUActivityFile.create).not.toHaveBeenCalled();
  });

  it("recovers a concurrent duplicate insert by reading the winning row", async () => {
    const { service, prisma, storage } = createService();
    prisma.pDUActivityFile.create.mockRejectedValueOnce(uniqueViolation());
    prisma.pDUActivityFile.findFirstOrThrow.mockResolvedValueOnce({
      id: "winner-file",
    });

    const result = await service.uploadEvidence(
      professional,
      "activity-1",
      [buildFile()],
      ["race-key"],
    );

    expect(result).toEqual({ activityId: "activity-1", uploaded: 1 });
    expect(storage.remove).toHaveBeenCalledWith(
      "pdu",
      expect.stringContaining(".pdf"),
    );
  });

  it("rejects an unsupported evidence file type", async () => {
    const { service } = createService();
    await expect(
      service.uploadEvidence(professional, "activity-1", [
        buildFile({
          mimetype: "application/x-msdownload",
          originalname: "x.exe",
        }),
      ]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("counts only genuinely new files against the evidence limit", async () => {
    const prisma = createPrismaMock();
    prisma.pDUActivity.findFirst.mockResolvedValue({
      id: "activity-1",
      _count: { evidenceFiles: 4 },
    });
    prisma.pDUActivityFile.findMany.mockResolvedValueOnce([
      { id: "existing-file", uploadKey: "already-uploaded" },
    ]);
    prisma.pDUActivityFile.create.mockResolvedValueOnce({ id: "new-file" });
    const { service } = createService(prisma);

    await expect(
      service.uploadEvidence(
        professional,
        "activity-1",
        [buildFile(), buildFile({ originalname: "second.pdf" })],
        ["already-uploaded", "brand-new"],
      ),
    ).resolves.toEqual({ activityId: "activity-1", uploaded: 2 });
  });
});

describe("ProfessionalPduFileService.deleteEvidence", () => {
  it("removes the blob and announces the evidence change", async () => {
    const { service, prisma, pduService } = createService();
    prisma.pDUActivityFile.findFirst.mockResolvedValueOnce({
      id: "file-1",
      userId: "user-1",
      activityId: "activity-1",
      storageKey: "key.pdf",
    });

    const result = await service.deleteEvidence(professional, "file-1");

    expect(result).toEqual({ id: "file-1" });
    expect(pduService.removeEvidenceBlobs).toHaveBeenCalledWith(["key.pdf"]);
    expect(pduService.announceEvidenceChange).toHaveBeenCalledWith(
      prisma,
      "activity-1",
      "user-1",
      LearningActivityChangeKind.EVIDENCE_REMOVED,
    );
  });

  it("rejects a file the caller does not own", async () => {
    const { service, prisma } = createService();
    prisma.pDUActivityFile.findFirst.mockResolvedValueOnce(null);
    await expect(
      service.deleteEvidence(professional, "someone-elses-file"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
