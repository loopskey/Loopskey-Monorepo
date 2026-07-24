import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { NotFoundException } from "@nestjs/common";
import { CertificateStatus, Role } from "@prisma/client";

import {
  CertificateSort,
  CertificateStatusFilter,
} from "../enums/certificate.enum";

import type { PrismaService } from "@prisma/prisma.service";

import { ProfessionalCertificatesService } from "./professional-certificate.service";

const professional = { id: "user-1", role: Role.PROFESSIONAL };

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const isoDaysFromNow = (days: number) =>
  new Date(Date.now() + days * MS_PER_DAY).toISOString();

const buildRow = (overrides: Record<string, unknown> = {}) => ({
  id: "cert-1",
  userId: "user-1",
  title: "AWS Solutions Architect",
  issuer: "Amazon",
  certificateNumber: null,
  certificateUrl: null,
  verificationCode: "USR-abc",
  contentType: null,
  contentId: null,
  cpdPlanId: null,
  pduEarned: 0,
  issuedAt: new Date("2026-01-01T00:00:00.000Z"),
  validUntil: new Date(isoDaysFromNow(365)),
  status: CertificateStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
  evidenceFiles: [],
  cpdPlan: null,
  ...overrides,
});

const createPrismaMock = () => ({
  certificate: {
    findFirst: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
    aggregate: jest.fn().mockResolvedValue({ _sum: { pduEarned: 0 } }),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn().mockResolvedValue({ id: "cert-1" }),
  },
  certificateFile: {
    findMany: jest.fn().mockResolvedValue([]),
  },
  cPDPlan: {
    findFirst: jest.fn(),
  },
});

const createService = (prisma = createPrismaMock()) => {
  const service = new ProfessionalCertificatesService(
    prisma as unknown as PrismaService,
  );
  return { service, prisma };
};

describe("ProfessionalCertificatesService.create", () => {
  it("creates a certificate, generating a verification code and defaulting status to ACTIVE", async () => {
    const { service, prisma } = createService();
    prisma.certificate.create.mockResolvedValue(buildRow());

    const result = await service.create(professional, {
      title: "AWS Solutions Architect",
      issuer: "Amazon",
      issueDate: "2026-01-01",
      validUntil: isoDaysFromNow(365),
    });

    const data = prisma.certificate.create.mock.calls[0][0].data;
    expect(data.userId).toBe("user-1");
    expect(data.verificationCode).toMatch(/^USR-/);
    expect(data.status).toBe(CertificateStatus.ACTIVE);
    expect(data.cpdPlanId).toBeNull();
    expect(result.status).toBe(CertificateStatus.ACTIVE);
  });

  it("rejects an expiry date before the issue date", async () => {
    const { service, prisma } = createService();
    await expect(
      service.create(professional, {
        title: "X",
        issuer: "Y",
        issueDate: "2026-06-01",
        validUntil: "2026-01-01",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.certificate.create).not.toHaveBeenCalled();
  });

  it("rejects a CPD plan owned by another user", async () => {
    const { service, prisma } = createService();
    prisma.cPDPlan.findFirst.mockResolvedValue(null);
    await expect(
      service.create(professional, {
        title: "X",
        issuer: "Y",
        issueDate: "2026-01-01",
        validUntil: isoDaysFromNow(365),
        cpdPlanId: "plan-of-someone-else",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.cPDPlan.findFirst).toHaveBeenCalledWith({
      where: { id: "plan-of-someone-else", userId: "user-1" },
      select: { id: true },
    });
    expect(prisma.certificate.create).not.toHaveBeenCalled();
  });

  it("links an owned CPD plan", async () => {
    const { service, prisma } = createService();
    prisma.cPDPlan.findFirst.mockResolvedValue({ id: "plan-1" });
    prisma.certificate.create.mockResolvedValue(
      buildRow({ cpdPlanId: "plan-1", cpdPlan: { id: "plan-1", certificationName: "PMP" } }),
    );

    const result = await service.create(professional, {
      title: "X",
      issuer: "Y",
      issueDate: "2026-01-01",
      validUntil: isoDaysFromNow(365),
      cpdPlanId: "plan-1",
    });
    expect(prisma.certificate.create.mock.calls[0][0].data.cpdPlanId).toBe(
      "plan-1",
    );
    expect(result.cpdPlanName).toBe("PMP");
  });

  it("rejects non-professional callers before any write", async () => {
    const { service, prisma } = createService();
    await expect(
      service.create(
        { id: "p", role: Role.PROVIDER },
        {
          title: "X",
          issuer: "Y",
          issueDate: "2026-01-01",
          validUntil: isoDaysFromNow(365),
        },
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.certificate.create).not.toHaveBeenCalled();
  });
});

describe("ProfessionalCertificatesService derived status", () => {
  it("reports EXPIRED for a past expiry and EXPIRING_SOON within the window", async () => {
    const { service, prisma } = createService();
    prisma.certificate.findFirst.mockResolvedValueOnce(
      buildRow({ validUntil: new Date(isoDaysFromNow(-2)) }),
    );
    const expired = await service.certificate(professional, "cert-1");
    expect(expired.status).toBe(CertificateStatus.EXPIRED);

    prisma.certificate.findFirst.mockResolvedValueOnce(
      buildRow({ validUntil: new Date(isoDaysFromNow(10)) }),
    );
    const soon = await service.certificate(professional, "cert-1");
    expect(soon.status).toBe(CertificateStatus.EXPIRING_SOON);
  });
});

describe("ProfessionalCertificatesService ownership", () => {
  it("returns not-found when the certificate belongs to another user", async () => {
    const { service, prisma } = createService();
    prisma.certificate.findFirst.mockResolvedValue(null);
    await expect(
      service.certificate(professional, "cert-x"),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.certificate.findFirst).toHaveBeenCalledWith({
      where: { id: "cert-x", userId: "user-1" },
      include: expect.any(Object),
    });
  });

  it("updates only the certificate's own fields, never the plan link", async () => {
    const { service, prisma } = createService();
    prisma.certificate.findFirst.mockResolvedValue(buildRow());
    prisma.certificate.update.mockResolvedValue(buildRow({ title: "Renamed" }));

    await service.update(professional, {
      id: "cert-1",
      title: "Renamed",
      issuer: "Amazon",
      issueDate: "2026-01-01",
      validUntil: isoDaysFromNow(365),
    });

    const data = prisma.certificate.update.mock.calls[0][0].data;
    expect(Object.keys(data).sort()).toEqual([
      "certificateNumber",
      "issuedAt",
      "issuer",
      "title",
      "validUntil",
    ]);
    expect(data).not.toHaveProperty("cpdPlanId");
    expect(data).not.toHaveProperty("userId");
  });

  it("scopes update to the owner and refuses plan linking through update", async () => {
    const { service, prisma } = createService();
    prisma.certificate.findFirst.mockResolvedValue(null);
    await expect(
      service.update(professional, {
        id: "cert-x",
        title: "X",
        issuer: "Y",
        issueDate: "2026-01-01",
        validUntil: isoDaysFromNow(365),
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.certificate.update).not.toHaveBeenCalled();
  });
});

describe("ProfessionalCertificatesService.setCpdPlan", () => {
  it("unlinks when cpdPlanId is null without checking plan ownership", async () => {
    const { service, prisma } = createService();
    prisma.certificate.findFirst.mockResolvedValue(buildRow());
    prisma.certificate.update.mockResolvedValue(buildRow({ cpdPlanId: null }));

    await service.setCpdPlan(professional, {
      certificateId: "cert-1",
      cpdPlanId: null,
    });
    expect(prisma.cPDPlan.findFirst).not.toHaveBeenCalled();
    expect(prisma.certificate.update.mock.calls[0][0].data).toEqual({
      cpdPlanId: null,
    });
  });

  it("verifies plan ownership before linking", async () => {
    const { service, prisma } = createService();
    prisma.certificate.findFirst.mockResolvedValue(buildRow());
    prisma.cPDPlan.findFirst.mockResolvedValue(null);
    await expect(
      service.setCpdPlan(professional, {
        certificateId: "cert-1",
        cpdPlanId: "foreign-plan",
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.certificate.update).not.toHaveBeenCalled();
  });
});

describe("ProfessionalCertificatesService.delete", () => {
  it("removes evidence blobs for the owned certificate", async () => {
    const { service, prisma } = createService();
    prisma.certificate.findFirst.mockResolvedValue(buildRow());
    prisma.certificateFile.findMany.mockResolvedValue([
      { storageKey: "a.pdf" },
    ]);
    const spy = jest
      .spyOn(service, "removeCertificateBlobs")
      .mockResolvedValue(undefined);

    const result = await service.delete(professional, "cert-1");
    expect(result).toEqual({ id: "cert-1" });
    expect(prisma.certificate.delete).toHaveBeenCalledWith({
      where: { id: "cert-1" },
    });
    expect(spy).toHaveBeenCalledWith(["a.pdf"]);
  });
});

describe("ProfessionalCertificatesService.summary", () => {
  it("counts total and each derived status scoped to the user", async () => {
    const { service, prisma } = createService();
    prisma.certificate.count
      .mockResolvedValueOnce(10) // total
      .mockResolvedValueOnce(6) // active
      .mockResolvedValueOnce(3) // expiringSoon
      .mockResolvedValueOnce(1); // expired

    const summary = await service.summary(professional);
    expect(summary).toEqual({
      total: 10,
      active: 6,
      expiringSoon: 3,
      expired: 1,
    });
    for (const call of prisma.certificate.count.mock.calls)
      expect(call[0].where.userId).toBe("user-1");
  });
});

describe("ProfessionalCertificatesService.certificates", () => {
  it("applies search and status filters and sorts by name", async () => {
    const { service, prisma } = createService();
    prisma.certificate.findMany.mockResolvedValue([buildRow()]);

    await service.certificates(professional, {
      search: "aws",
      status: CertificateStatusFilter.EXPIRED,
      sort: CertificateSort.NAME,
    });

    const args = prisma.certificate.findMany.mock.calls[0][0];
    expect(args.where.userId).toBe("user-1");
    expect(args.where.AND).toHaveLength(2);
    expect(args.where.AND[0].OR).toEqual([
      { title: { contains: "aws", mode: "insensitive" } },
      { issuer: { contains: "aws", mode: "insensitive" } },
      { certificateNumber: { contains: "aws", mode: "insensitive" } },
    ]);
    expect(args.where.AND[1].validUntil).toMatchObject({ not: null });
    expect(args.orderBy).toEqual({ title: "asc" });
  });
});
