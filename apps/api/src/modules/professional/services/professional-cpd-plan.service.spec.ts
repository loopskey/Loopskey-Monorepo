import { ProfessionalCpdPlanService } from "./professional-cpd-plan.service";
import type { PrismaService } from "@prisma/prisma.service";
import type { CertificationSearchService } from "./certification-search.service";
import type { ProfessionalIdentityApi } from "@user/public/professional-identity-api";
import { NotFoundException } from "@nestjs/common";
import {
  CPDEvidenceType,
  CPDPlanStatus,
  CPDReportRecipientType,
  CreditType,
  Role,
} from "@prisma/client";

const professional = { id: "user-1", role: Role.PROFESSIONAL };

const basePlan = {
  id: "plan-1",
  userId: "user-1",
  status: CPDPlanStatus.ACTIVE,
  certificationId: null,
  certificationName: "Cert",
  organization: "Org",
  reportingStart: new Date("2026-01-01T00:00:00Z"),
  reportingEnd: new Date("2026-12-31T23:59:59Z"),
  creditType: CreditType.PDU,
  totalRequiredCredits: 40,
  initialCompletedCredits: 22,
  timeAvailable: null,
  preferredFormats: [],
  evidenceTypes: [] as CPDEvidenceType[],
  evidenceOtherNote: null,
  reportRecipientType: CPDReportRecipientType.SELF,
  reportRecipientLabel: null,
  remindersEnabled: false,
  reminderTiming: null,
  categories: [],
};

const createPrismaMock = () => ({
  cPDPlan: {
    findFirst: jest.fn().mockResolvedValue(basePlan),
    create: jest.fn().mockResolvedValue(basePlan),
    update: jest.fn().mockResolvedValue(basePlan),
  },
  pDUActivity: {
    aggregate: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
    findMany: jest.fn().mockResolvedValue([]),
  },
});

const createService = (
  prisma = createPrismaMock(),
  certificationSearchService: Partial<CertificationSearchService> = {},
) => {
  const service = new ProfessionalCpdPlanService(
    prisma as unknown as PrismaService,
    certificationSearchService as CertificationSearchService,
    {} as ProfessionalIdentityApi,
  );
  return { service, prisma };
};

describe("ProfessionalCpdPlanService.progress", () => {
  it("with no qualifying activities, reports zero earned/counted, full remaining, 0% donut, and starting credits separately", async () => {
    const { service, prisma } = createService();
    prisma.pDUActivity.aggregate.mockResolvedValue({
      _sum: { pdus: 0 },
      _count: 0,
    });

    const progress = await service.progress(professional, "plan-1");

    expect(progress.earnedCredits).toBe(0);
    expect(progress.remainingCredits).toBe(40);
    expect(progress.activitiesCounted).toBe(0);
    expect(progress.progressPercent).toBe(0);
    expect(progress.startingCredits).toBe(22);
  });

  it("scopes the aggregate to non-rejected activities either linked to the plan or matching its credit type and reporting window", async () => {
    const { service, prisma } = createService();
    prisma.pDUActivity.aggregate.mockResolvedValue({
      _sum: { pdus: 12 },
      _count: 3,
    });

    await service.progress(professional, "plan-1");

    const where = prisma.pDUActivity.aggregate.mock.calls[0][0].where;
    expect(where.userId).toBe("user-1");
    expect(where.status).toEqual({ not: "REJECTED" });
    expect(where.OR).toEqual([
      { cpdPlanId: "plan-1" },
      {
        cpdPlanId: null,
        associationRequirementId: null,
        creditType: CreditType.PDU,
        date: {
          gte: basePlan.reportingStart,
          lte: basePlan.reportingEnd,
        },
      },
    ]);
  });

  it("leaves activities assigned to an association requirement out of the plan's auto-match", async () => {
    const { service, prisma } = createService();
    prisma.pDUActivity.aggregate.mockResolvedValue({
      _sum: { pdus: 0 },
      _count: 0,
    });

    await service.progress(professional, "plan-1");

    const [, autoMatch] =
      prisma.pDUActivity.aggregate.mock.calls[0][0].where.OR;
    expect(autoMatch.associationRequirementId).toBeNull();
  });

  it("does not let starting credits inflate earned, remaining, or the donut", async () => {
    const { service, prisma } = createService();
    prisma.pDUActivity.aggregate.mockResolvedValue({
      _sum: { pdus: 8 },
      _count: 2,
    });

    const progress = await service.progress(professional, "plan-1");

    expect(progress.earnedCredits).toBe(8);
    expect(progress.remainingCredits).toBe(32);
    expect(progress.progressPercent).toBe(20);
    expect(progress.startingCredits).toBe(22);
  });

  it("clamps progress to 100% and remaining to 0 when activities exceed the requirement", async () => {
    const { service, prisma } = createService();
    prisma.pDUActivity.aggregate.mockResolvedValue({
      _sum: { pdus: 55 },
      _count: 5,
    });

    const progress = await service.progress(professional, "plan-1");

    expect(progress.earnedCredits).toBe(55);
    expect(progress.remainingCredits).toBe(0);
    expect(progress.progressPercent).toBe(100);
  });

  it("returns 0% progress for a plan with no required credits", async () => {
    const zeroTotalPlan = { ...basePlan, totalRequiredCredits: 0 };
    const prisma = createPrismaMock();
    prisma.cPDPlan.findFirst.mockResolvedValue(zeroTotalPlan);
    prisma.pDUActivity.aggregate.mockResolvedValue({
      _sum: { pdus: 5 },
      _count: 1,
    });
    const { service } = createService(prisma);

    const progress = await service.progress(professional, "plan-1");

    expect(progress.progressPercent).toBe(0);
    expect(progress.remainingCredits).toBe(0);
  });

  it("rounds fractional activity credits", async () => {
    const { service, prisma } = createService();
    prisma.pDUActivity.aggregate.mockResolvedValue({
      _sum: { pdus: 3.333 },
      _count: 1,
    });

    const progress = await service.progress(professional, "plan-1");

    expect(progress.earnedCredits).toBe(3.33);
  });
});

const cert = {
  id: "cert-1",
  name: "Project Management Professional",
  abbreviation: "PMP",
  organization: "Project Management Institute",
  association: "Project Management Institute (PMI)",
  creditType: CreditType.PDU,
  totalRequiredCredits: 60,
  renewalCycleMonths: 36,
  categories: [],
};

describe("ProfessionalCpdPlanService.createPlanFromSuggestion", () => {
  it("derives the end date from the plan's own start plus the renewal cycle, never a catalogue-fixed date", async () => {
    const prisma = createPrismaMock();
    prisma.cPDPlan.findFirst.mockResolvedValue(null);
    const { service } = createService(prisma, {
      findById: jest.fn().mockResolvedValue(cert),
    });

    await service.createPlanFromSuggestion(professional, {
      certificationId: "cert-1",
      reportingStart: "2026-02-01T00:00:00.000Z",
    });

    const data = prisma.cPDPlan.create.mock.calls[0][0].data;
    expect(data.reportingStart).toEqual(new Date("2026-02-01T00:00:00.000Z"));
    expect(data.reportingEnd).toEqual(new Date(Date.UTC(2029, 1, 1)));
  });

  it("falls back to a 12-month cycle when the certification has no renewalCycleMonths", async () => {
    const prisma = createPrismaMock();
    prisma.cPDPlan.findFirst.mockResolvedValue(null);
    const { service } = createService(prisma, {
      findById: jest
        .fn()
        .mockResolvedValue({ ...cert, renewalCycleMonths: null }),
    });

    await service.createPlanFromSuggestion(professional, {
      certificationId: "cert-1",
      reportingStart: "2026-02-01T00:00:00.000Z",
    });

    const data = prisma.cPDPlan.create.mock.calls[0][0].data;
    expect(data.reportingEnd).toEqual(new Date(Date.UTC(2027, 1, 1)));
  });

  it("rejects an unknown certification id", async () => {
    const { service } = createService(createPrismaMock(), {
      findById: jest.fn().mockResolvedValue(null),
    });

    await expect(
      service.createPlanFromSuggestion(professional, {
        certificationId: "missing",
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});

describe("ProfessionalCpdPlanService.upsertDraftPlan", () => {
  it("creates a fresh plan with safe defaults when nothing is known yet", async () => {
    const prisma = createPrismaMock();
    const { service } = createService(prisma);

    await service.upsertDraftPlan(professional, { planId: null });

    const data = prisma.cPDPlan.create.mock.calls[0][0].data;
    expect(data).toMatchObject({
      userId: "user-1",
      certificationId: null,
      certificationName: "",
      organization: "",
      totalRequiredCredits: 0,
      evidenceTypes: [],
      reportRecipientType: CPDReportRecipientType.SELF,
    });
  });

  it("autofills organization, credits, and categories from the certification catalogue", async () => {
    const prisma = createPrismaMock();
    const { service } = createService(prisma, {
      findById: jest.fn().mockResolvedValue({
        ...cert,
        categories: [{ name: "Technical", requiredCredits: 35 }],
      }),
    });

    await service.upsertDraftPlan(professional, {
      planId: null,
      certificationId: "cert-1",
    });

    const data = prisma.cPDPlan.create.mock.calls[0][0].data;
    expect(data).toMatchObject({
      certificationId: "cert-1",
      certificationName: "PMP (Project Management Professional)",
      organization: "Project Management Institute (PMI)",
      totalRequiredCredits: 60,
    });
    expect(data.categories.create).toEqual([
      { name: "Technical", targetCredits: 35, completedCredits: 0, order: 0 },
    ]);
  });

  it("rejects an unknown certification id", async () => {
    const { service } = createService(createPrismaMock(), {
      findById: jest.fn().mockResolvedValue(null),
    });

    await expect(
      service.upsertDraftPlan(professional, {
        planId: null,
        certificationId: "missing",
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it("patches only the given field on an existing plan, leaving the rest untouched", async () => {
    const prisma = createPrismaMock();
    prisma.cPDPlan.findFirst.mockResolvedValue(basePlan);
    const { service } = createService(prisma);

    await service.upsertDraftPlan(professional, {
      planId: "plan-1",
      organization: "New employer",
    });

    const data = prisma.cPDPlan.update.mock.calls[0][0].data;
    expect(data.organization).toBe("New employer");
    expect(data.totalRequiredCredits).toBe(basePlan.totalRequiredCredits);
    expect(data.certificationName).toBe(basePlan.certificationName);
    expect(data.categories).toBeUndefined();
  });

  it("replaces categories wholesale only when the patch supplies them", async () => {
    const prisma = createPrismaMock();
    prisma.cPDPlan.findFirst.mockResolvedValue(basePlan);
    const { service } = createService(prisma);

    await service.upsertDraftPlan(professional, {
      planId: "plan-1",
      categories: [{ name: "Ethics", target: 6 }],
    });

    const data = prisma.cPDPlan.update.mock.calls[0][0].data;
    expect(data.categories).toEqual({
      deleteMany: {},
      create: [
        { name: "Ethics", targetCredits: 6, completedCredits: 0, order: 0 },
      ],
    });
  });
});

describe("ProfessionalCpdPlanService.planActivities", () => {
  it("lists linked and auto-matched activities, rejected ones included, scoped to the owner", async () => {
    const { service, prisma } = createService();
    prisma.pDUActivity.findMany.mockResolvedValue([{ id: "activity-1" }]);

    const activities = await service.planActivities(professional, "plan-1");

    expect(activities).toEqual([{ id: "activity-1" }]);
    const args = prisma.pDUActivity.findMany.mock.calls[0][0];
    expect(args.where.userId).toBe("user-1");
    expect(args.where.status).toBeUndefined();
    expect(args.where.OR).toHaveLength(2);
    expect(args.orderBy).toEqual({ date: "desc" });
  });

  it("refuses a plan owned by someone else", async () => {
    const { service, prisma } = createService();
    prisma.cPDPlan.findFirst.mockResolvedValue(null);

    await expect(
      service.planActivities(professional, "foreign-plan"),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.pDUActivity.findMany).not.toHaveBeenCalled();
  });
});
