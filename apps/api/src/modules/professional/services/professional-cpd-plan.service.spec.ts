import { ProfessionalCpdPlanService } from "./professional-cpd-plan.service";
import type { PrismaService } from "@prisma/prisma.service";
import type { CertificationSearchService } from "./certification-search.service";
import type { ProfessionalIdentityApi } from "@user/public/professional-identity-api";
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
  },
  pDUActivity: {
    aggregate: jest.fn(),
    count: jest.fn().mockResolvedValue(0),
  },
});

const createService = (prisma = createPrismaMock()) => {
  const service = new ProfessionalCpdPlanService(
    prisma as unknown as PrismaService,
    {} as CertificationSearchService,
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

  it("scopes the aggregate to non-rejected activities in the plan's credit type and reporting window", async () => {
    const { service, prisma } = createService();
    prisma.pDUActivity.aggregate.mockResolvedValue({
      _sum: { pdus: 12 },
      _count: 3,
    });

    await service.progress(professional, "plan-1");

    const where = prisma.pDUActivity.aggregate.mock.calls[0][0].where;
    expect(where.userId).toBe("user-1");
    expect(where.creditType).toBe(CreditType.PDU);
    expect(where.status).toEqual({ not: "REJECTED" });
    expect(where.date).toEqual({
      gte: basePlan.reportingStart,
      lte: basePlan.reportingEnd,
    });
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
