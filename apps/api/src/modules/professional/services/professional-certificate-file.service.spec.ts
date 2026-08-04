import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { NotFoundException } from "@nestjs/common";
import { Role } from "@prisma/client";

import type { PrismaService } from "@prisma/prisma.service";
import type { ProfessionalCertificatesService } from "./professional-certificate.service";

import { ProfessionalCertificateFileService } from "./professional-certificate-file.service";

jest.mock("fs", () => ({
  ...jest.requireActual("fs"),
  mkdirSync: jest.fn(),
}));
jest.mock("fs/promises", () => ({
  ...jest.requireActual("fs/promises"),
  writeFile: jest.fn().mockResolvedValue(undefined),
}));

const professional = { id: "user-1", role: Role.PROFESSIONAL };

const pdf = (overrides: Partial<Express.Multer.File> = {}) =>
  ({
    originalname: "cert.pdf",
    mimetype: "application/pdf",
    size: 1024,
    buffer: Buffer.from("data"),
    ...overrides,
  }) as Express.Multer.File;

const createPrismaMock = () => ({
  certificate: {
    findFirst: jest
      .fn()
      .mockResolvedValue({ id: "cert-1", _count: { evidenceFiles: 0 } }),
  },
  certificateFile: {
    create: jest.fn().mockResolvedValue({ id: "file-1" }),
    findFirst: jest.fn(),
    delete: jest.fn().mockResolvedValue({ id: "file-1" }),
  },
});

const createService = (prisma = createPrismaMock()) => {
  const certificatesService = {
    removeCertificateBlobs: jest.fn().mockResolvedValue(undefined),
  } as unknown as ProfessionalCertificatesService;
  const storage = {
    store: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
    resolve: jest.fn((_namespace: string, storageKey: string) => {
      if (storageKey.includes("..")) throw new Error("invalid key");
      return `certificate/${storageKey}`;
    }),
    exists: jest.fn().mockResolvedValue(true),
  };
  const service = new ProfessionalCertificateFileService(
    prisma as unknown as PrismaService,
    certificatesService,
    storage,
  );
  return { service, prisma, certificatesService, storage };
};

describe("ProfessionalCertificateFileService.uploadEvidence", () => {
  it("stores an accepted file and records its metadata", async () => {
    const { service, prisma } = createService();
    const result = await service.uploadEvidence(professional, "cert-1", [
      pdf(),
    ]);
    expect(result).toEqual({ certificateId: "cert-1", uploaded: 1 });
    const data = prisma.certificateFile.create.mock.calls[0][0].data;
    expect(data).toMatchObject({
      certificateId: "cert-1",
      userId: "user-1",
      fileName: "cert.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1024,
    });
    expect(data.storageKey).toMatch(/\.pdf$/);
  });

  it("removes the stored blob when metadata persistence fails", async () => {
    const { service, prisma, storage } = createService();
    prisma.certificateFile.create.mockRejectedValue(new Error("database"));

    await expect(
      service.uploadEvidence(professional, "cert-1", [pdf()]),
    ).rejects.toThrow("database");

    expect(storage.store).toHaveBeenCalledTimes(1);
    expect(storage.remove).toHaveBeenCalledWith(
      "certificate",
      expect.any(String),
    );
  });

  it("rejects an empty upload", async () => {
    const { service } = createService();
    await expect(
      service.uploadEvidence(professional, "cert-1", []),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects a zero-byte file", async () => {
    const { service } = createService();
    await expect(
      service.uploadEvidence(professional, "cert-1", [
        pdf({ size: 0, buffer: Buffer.alloc(0) }),
      ]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects a disallowed file type", async () => {
    const { service } = createService();
    await expect(
      service.uploadEvidence(professional, "cert-1", [
        pdf({ originalname: "x.exe", mimetype: "application/x-msdownload" }),
      ]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects uploads that exceed the per-certificate file limit", async () => {
    const prisma = createPrismaMock();
    prisma.certificate.findFirst.mockResolvedValue({
      id: "cert-1",
      _count: { evidenceFiles: 5 },
    });
    const { service } = createService(prisma);
    await expect(
      service.uploadEvidence(professional, "cert-1", [pdf()]),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it("rejects uploads to a certificate the user does not own", async () => {
    const prisma = createPrismaMock();
    prisma.certificate.findFirst.mockResolvedValue(null);
    const { service } = createService(prisma);
    await expect(
      service.uploadEvidence(professional, "cert-x", [pdf()]),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects non-professional callers", async () => {
    const { service } = createService();
    await expect(
      service.uploadEvidence({ id: "p", role: Role.PROVIDER }, "cert-1", [
        pdf(),
      ]),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

describe("ProfessionalCertificateFileService download and delete", () => {
  it("returns the file and a resolved path for an owned file", async () => {
    const prisma = createPrismaMock();
    prisma.certificateFile.findFirst.mockResolvedValue({
      id: "file-1",
      userId: "user-1",
      storageKey: "abc.pdf",
      fileName: "cert.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1024,
    });
    const { service } = createService(prisma);
    const { file, filePath } = await service.getEvidenceForDownload(
      professional,
      "file-1",
    );
    expect(file.fileName).toBe("cert.pdf");
    expect(filePath).toMatch(/abc\.pdf$/);
  });

  it("refuses a path-traversal storage key", async () => {
    const prisma = createPrismaMock();
    prisma.certificateFile.findFirst.mockResolvedValue({
      id: "file-1",
      userId: "user-1",
      storageKey: "../../secret.pdf",
      fileName: "x",
      mimeType: "application/pdf",
      sizeBytes: 1,
    });
    const { service } = createService(prisma);
    await expect(
      service.getEvidenceForDownload(professional, "file-1"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("returns not-found downloading a file owned by another user", async () => {
    const prisma = createPrismaMock();
    prisma.certificateFile.findFirst.mockResolvedValue(null);
    const { service } = createService(prisma);
    await expect(
      service.getEvidenceForDownload(professional, "file-x"),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.certificateFile.findFirst).toHaveBeenCalledWith({
      where: { id: "file-x", userId: "user-1" },
    });
  });

  it("supports replacing evidence: delete frees a slot, then upload succeeds", async () => {
    const prisma = createPrismaMock();
    // At the limit, a further upload is refused.
    prisma.certificate.findFirst.mockResolvedValue({
      id: "cert-1",
      _count: { evidenceFiles: 5 },
    });
    const { service, certificatesService } = createService(prisma);
    await expect(
      service.uploadEvidence(professional, "cert-1", [pdf()]),
    ).rejects.toBeInstanceOf(BadRequestException);

    // Removing the old file cleans its blob and frees the slot.
    prisma.certificateFile.findFirst.mockResolvedValue({
      id: "old-file",
      userId: "user-1",
      storageKey: "old.pdf",
    });
    await service.deleteEvidence(professional, "old-file");
    expect(certificatesService.removeCertificateBlobs).toHaveBeenCalledWith([
      "old.pdf",
    ]);

    // The replacement now uploads.
    prisma.certificate.findFirst.mockResolvedValue({
      id: "cert-1",
      _count: { evidenceFiles: 4 },
    });
    await expect(
      service.uploadEvidence(professional, "cert-1", [
        pdf({ originalname: "new.pdf" }),
      ]),
    ).resolves.toEqual({ certificateId: "cert-1", uploaded: 1 });
  });

  it("deletes an owned file and cleans up its blob", async () => {
    const prisma = createPrismaMock();
    prisma.certificateFile.findFirst.mockResolvedValue({
      id: "file-1",
      userId: "user-1",
      storageKey: "abc.pdf",
    });
    const { service, certificatesService } = createService(prisma);
    const result = await service.deleteEvidence(professional, "file-1");
    expect(result).toEqual({ id: "file-1" });
    expect(certificatesService.removeCertificateBlobs).toHaveBeenCalledWith([
      "abc.pdf",
    ]);
  });
});
