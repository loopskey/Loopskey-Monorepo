import { ProfessionalComplianceApiService } from "@professional/application/professional-compliance-api.service";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { PDUCompletionStatus, PDUStatus } from "@prisma/client";
import { CreditType, PDUCategory } from "@prisma/client";
import { type EvidenceStoragePort } from "@professional/storage/evidence-storage.port";
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

const storedFileRow = (overrides: Record<string, unknown> = {}) => ({
  id: "file-1",
  fileName: "proof.pdf",
  mimeType: "application/pdf",
  sizeBytes: 2048,
  storageKey: "abc.pdf",
  ...overrides,
});

const setup = ({
  rows = [activityRow()],
  settledCount = 1,
  fileRow = null,
  certificateRows = [],
  resolvePath = () => "/uploads/pdu/abc.pdf",
}: {
  rows?: ReturnType<typeof activityRow>[];
  settledCount?: number;
  fileRow?: Record<string, unknown> | null;
  certificateRows?: Record<string, unknown>[];
  resolvePath?: () => string;
} = {}) => {
  const findMany = jest.fn().mockResolvedValue(rows);
  const findFirst = jest.fn().mockResolvedValue(rows[0] ?? null);
  const updateMany = jest.fn().mockResolvedValue({ count: settledCount });
  const findUnique = jest.fn().mockResolvedValue({ userId: "user-1" });
  const append = jest.fn().mockResolvedValue({});
  const fileFindFirst = jest.fn().mockResolvedValue(fileRow);
  const certificateFileFindFirst = jest.fn().mockResolvedValue(fileRow);
  const certificateFindMany = jest.fn().mockResolvedValue(certificateRows);
  const resolve = jest.fn(resolvePath);

  const prisma = {
    pDUActivity: { findMany, findFirst, updateMany, findUnique },
    pDUActivityFile: { findFirst: fileFindFirst },
    certificateFile: { findFirst: certificateFileFindFirst },
    certificate: { findMany: certificateFindMany },
  };

  return {
    findMany,
    findFirst,
    updateMany,
    append,
    resolve,
    fileFindFirst,
    certificateFindMany,
    certificateFileFindFirst,
    service: new ProfessionalComplianceApiService(
      prisma as unknown as PrismaService,
      { append } as unknown as OutboxService,
      { resolve } as unknown as EvidenceStoragePort,
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

  describe("the file and certificate reads phase 06 added", () => {
    it("reads no file at all without an owner list", async () => {
      const { service, fileFindFirst, certificateFileFindFirst } = setup();

      await expect(service.evidenceFileForOwners("file-1", [])).resolves.toBe(
        null,
      );
      await expect(
        service.certificateFileForOwners("file-1", []),
      ).resolves.toBe(null);
      expect(fileFindFirst).not.toHaveBeenCalled();
      expect(certificateFileFindFirst).not.toHaveBeenCalled();
    });

    it("scopes an evidence file to the owner list and never returns its storage key", async () => {
      const { service, fileFindFirst } = setup({
        fileRow: storedFileRow({ activityId: "act-1" }),
      });

      const stored = await service.evidenceFileForOwners("file-1", ["user-1"]);

      expect(fileFindFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "file-1", userId: { in: ["user-1"] } },
        }),
      );
      expect(stored).toEqual({
        sourceId: "act-1",
        filePath: "/uploads/pdu/abc.pdf",
        file: {
          id: "file-1",
          fileName: "proof.pdf",
          mimeType: "application/pdf",
          sizeBytes: 2048,
        },
      });
      expect(JSON.stringify(stored)).not.toContain("storageKey");
    });

    it("names the certificate a certificate file came from", async () => {
      const { service } = setup({
        fileRow: storedFileRow({ certificateId: "cert-1" }),
        resolvePath: () => "/uploads/certificate/abc.pdf",
      });

      await expect(
        service.certificateFileForOwners("file-1", ["user-1"]),
      ).resolves.toEqual(
        expect.objectContaining({
          sourceId: "cert-1",
          filePath: "/uploads/certificate/abc.pdf",
        }),
      );
    });

    it("treats an unresolvable storage key as a missing file", async () => {
      const { service } = setup({
        fileRow: storedFileRow({ activityId: "act-1" }),
        resolvePath: () => {
          throw new Error("Invalid object storage key.");
        },
      });

      await expect(
        service.evidenceFileForOwners("file-1", ["user-1"]),
      ).resolves.toBe(null);
    });

    it("projects a certificate with its files and earned credits", async () => {
      const { service, certificateFindMany } = setup({
        certificateRows: [
          {
            id: "cert-1",
            userId: "user-1",
            title: "PMP",
            issuer: "PMI",
            status: "ACTIVE",
            issuedAt: new Date("2026-01-01T00:00:00.000Z"),
            validUntil: null,
            pduEarned: 35,
            evidenceFiles: [
              {
                id: "file-1",
                fileName: "pmp.pdf",
                mimeType: "application/pdf",
                sizeBytes: 10,
              },
            ],
          },
        ],
      });

      await expect(service.certificatesForOwners(["user-1"])).resolves.toEqual([
        expect.objectContaining({
          id: "cert-1",
          creditsEarned: 35,
          files: [expect.objectContaining({ id: "file-1" })],
        }),
      ]);
      expect(certificateFindMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: { in: ["user-1"] } } }),
      );
    });

    it("carries the evidence note, url and rejection reason onto the detail", async () => {
      const { service } = setup({
        rows: [
          activityRow({
            source: "COURSE",
            evidenceNote: "Attached the completion letter.",
            evidenceUrl: "https://example.test/proof",
            reviewNote: "The certificate does not name you.",
            evidenceFiles: [
              {
                id: "file-1",
                fileName: "proof.pdf",
                mimeType: "application/pdf",
                sizeBytes: 5,
              },
            ],
          }),
        ],
      });

      await expect(
        service.activityDetailsForOwners(["act-1"], ["user-1"]),
      ).resolves.toEqual([
        expect.objectContaining({
          source: "COURSE",
          hasEvidence: true,
          evidenceNote: "Attached the completion letter.",
          reviewNote: "The certificate does not name you.",
          files: [expect.objectContaining({ fileName: "proof.pdf" })],
        }),
      ]);
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
