import {
  PDUCompletionStatus,
  PDUSource,
  PDUStatus,
  Role,
} from "@prisma/client";
import { ForbiddenException, NotFoundException } from "@nestjs/common";

import type { PrismaService } from "@prisma/prisma.service";

import { ProfessionalPduService } from "./professional-pdu.service";

const professional = { id: "user-1", role: Role.PROFESSIONAL };

const createPrismaMock = () => ({
  pDUActivity: {
    count: jest.fn(),
    findMany: jest.fn().mockResolvedValue([]),
    findFirst: jest.fn(),
  },
  pDUActivityFile: {
    count: jest.fn(),
  },
});

const createService = (prisma = createPrismaMock()) => {
  const service = new ProfessionalPduService(
    prisma as unknown as PrismaService,
  );
  return { service, prisma };
};

describe("ProfessionalPduService.pduActivitySummary", () => {
  it("counts completed, evidenced activities and evidence files, scoped to the user and excluding rejected", async () => {
    const { service, prisma } = createService();
    prisma.pDUActivity.count
      .mockResolvedValueOnce(7) // completedActivities
      .mockResolvedValueOnce(4); // activitiesWithEvidence
    prisma.pDUActivityFile.count.mockResolvedValueOnce(9);

    const summary = await service.pduActivitySummary(professional);

    expect(summary).toEqual({
      completedActivities: 7,
      activitiesWithEvidence: 4,
      evidenceFilesCount: 9,
    });

    const completedWhere = prisma.pDUActivity.count.mock.calls[0][0].where;
    expect(completedWhere.userId).toBe("user-1");
    expect(completedWhere.status).toEqual({ not: PDUStatus.REJECTED });
    expect(completedWhere.completionStatus).toBe(PDUCompletionStatus.COMPLETED);

    const evidenceWhere = prisma.pDUActivity.count.mock.calls[1][0].where;
    expect(evidenceWhere.evidenceFiles).toEqual({ some: {} });

    const fileWhere = prisma.pDUActivityFile.count.mock.calls[0][0].where;
    expect(fileWhere.activity).toEqual({
      userId: "user-1",
      status: { not: PDUStatus.REJECTED },
    });
  });

  it("rejects non-professional callers", async () => {
    const { service } = createService();
    await expect(
      service.pduActivitySummary({ id: "x", role: Role.PROVIDER }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

describe("ProfessionalPduService.pduActivity", () => {
  it("returns the activity scoped to the authenticated user and its evidence files", async () => {
    const { service, prisma } = createService();
    const activity = { id: "activity-1", userId: "user-1", evidenceFiles: [] };
    prisma.pDUActivity.findFirst.mockResolvedValue(activity);

    const result = await service.pduActivity(professional, "activity-1");

    expect(result).toBe(activity);
    const args = prisma.pDUActivity.findFirst.mock.calls[0][0];
    expect(args.where).toEqual({ id: "activity-1", userId: "user-1" });
    // The owner's evidence files come back with the record for the detail view.
    expect(args.include.evidenceFiles).toBeDefined();
  });

  it("throws NotFound when the activity is missing, deleted, or owned by someone else", async () => {
    const { service, prisma } = createService();
    prisma.pDUActivity.findFirst.mockResolvedValue(null);

    await expect(
      service.pduActivity(professional, "foreign-activity"),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("rejects non-professional callers before any lookup", async () => {
    const { service, prisma } = createService();

    await expect(
      service.pduActivity({ id: "x", role: Role.PROVIDER }, "activity-1"),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(prisma.pDUActivity.findFirst).not.toHaveBeenCalled();
  });
});

describe("ProfessionalPduService.pduActivities filters", () => {
  it("maps year, type, and certificate filters into a user-scoped where clause", async () => {
    const { service, prisma } = createService();
    prisma.pDUActivity.count.mockResolvedValue(0);

    await service.pduActivities(professional, {
      reportingYear: 2025,
      activityType: PDUSource.WEBINAR,
      hasCertificate: true,
    });

    const where = prisma.pDUActivity.findMany.mock.calls[0][0].where;
    expect(where.userId).toBe("user-1");
    expect(where.reportingYear).toBe(2025);
    expect(where.source).toBe(PDUSource.WEBINAR);
    expect(where.evidenceFiles).toEqual({ some: {} });
  });

  it("excludes evidenced activities when hasCertificate is false", async () => {
    const { service, prisma } = createService();
    prisma.pDUActivity.count.mockResolvedValue(0);

    await service.pduActivities(professional, { hasCertificate: false });

    const where = prisma.pDUActivity.findMany.mock.calls[0][0].where;
    expect(where.evidenceFiles).toEqual({ none: {} });
  });
});
