import { OutboxService } from "@infrastructure/outbox/outbox.service";
import {
  PDUCompletionStatus,
  PDUSource,
  PDUStatus,
  Role,
} from "@prisma/client";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { LearningActivityChangeKind } from "@professional/public/professional-compliance-api.events";
import { CreditType, PDUCategory } from "@prisma/client";

import type { PrismaService } from "@prisma/prisma.service";

import { ProfessionalPduService } from "./professional-pdu.service";

const professional = { id: "user-1", role: Role.PROFESSIONAL };

const createPrismaMock = () => {
  const prisma: Record<string, unknown> = {
    pDUActivity: {
      count: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    pDUActivityFile: {
      count: jest.fn(),
    },
    cPDPlan: {
      findFirst: jest.fn(),
    },
  };
  prisma.$transaction = jest.fn(async (run: (tx: unknown) => unknown) =>
    run(prisma),
  );
  return prisma as unknown as {
    pDUActivity: {
      count: jest.Mock;
      findMany: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
    pDUActivityFile: { count: jest.Mock };
    cPDPlan: { findFirst: jest.Mock };
    $transaction: jest.Mock;
  };
};

const createService = (
  prisma = createPrismaMock(),
  requirementDirectoryOverrides: { isAssigned?: jest.Mock } = {},
) => {
  const append = jest.fn().mockResolvedValue(undefined);
  const requirementDirectory = {
    isAssigned:
      requirementDirectoryOverrides.isAssigned ??
      jest.fn().mockResolvedValue(true),
    syncAssignedRequirements: jest.fn().mockResolvedValue(undefined),
  };
  const service = new ProfessionalPduService(
    prisma as unknown as PrismaService,
    { append } as unknown as OutboxService,
    requirementDirectory as never,
    {
      store: jest.fn(),
      remove: jest.fn().mockResolvedValue(undefined),
      resolve: jest.fn(),
      exists: jest.fn(),
      read: jest.fn(),
    },
  );
  return { service, prisma, append, requirementDirectory };
};

const createInput = (overrides: Record<string, unknown> = {}) => ({
  title: "A course",
  date: "2026-06-01",
  pdus: 5,
  source: PDUSource.WEBINAR,
  category: PDUCategory.TECHNICAL,
  creditType: CreditType.CPD,
  reportingYear: 2026,
  providerOrganizer: "Acme",
  ...overrides,
});

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

describe("ProfessionalPduService cpdPlanId linking", () => {
  it("links a created activity to an owned plan", async () => {
    const { service, prisma } = createService();
    prisma.cPDPlan.findFirst.mockResolvedValue({ id: "plan-1" });
    prisma.pDUActivity.create.mockResolvedValue({
      id: "activity-1",
      userId: "user-1",
    });

    await service.createPduActivity(
      professional,
      createInput({ cpdPlanId: "plan-1" }),
    );

    expect(prisma.cPDPlan.findFirst).toHaveBeenCalledWith({
      where: { id: "plan-1", userId: "user-1" },
      select: { id: true },
    });
    const data = prisma.pDUActivity.create.mock.calls[0][0].data;
    expect(data.cpdPlanId).toBe("plan-1");
  });

  it("refuses to link a created activity to a plan owned by someone else", async () => {
    const { service, prisma } = createService();
    prisma.cPDPlan.findFirst.mockResolvedValue(null);

    await expect(
      service.createPduActivity(
        professional,
        createInput({ cpdPlanId: "foreign-plan" }),
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.pDUActivity.create).not.toHaveBeenCalled();
  });

  it("refuses to relink an existing activity to a plan owned by someone else", async () => {
    const { service, prisma } = createService();
    prisma.pDUActivity.findFirst.mockResolvedValue({
      id: "activity-1",
      userId: "user-1",
      evidenceFiles: [],
    });
    prisma.cPDPlan.findFirst.mockResolvedValue(null);

    await expect(
      service.updatePduActivity(professional, {
        activityId: "activity-1",
        cpdPlanId: "foreign-plan",
      } as never),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(prisma.pDUActivity.update).not.toHaveBeenCalled();
  });

  it("unlinks an activity from its plan without an ownership lookup", async () => {
    const { service, prisma } = createService();
    prisma.pDUActivity.findFirst.mockResolvedValue({
      id: "activity-1",
      userId: "user-1",
      evidenceFiles: [],
    });
    prisma.pDUActivity.update.mockResolvedValue({
      id: "activity-1",
      userId: "user-1",
    });

    await service.updatePduActivity(professional, {
      activityId: "activity-1",
      cpdPlanId: null,
    } as never);

    expect(prisma.cPDPlan.findFirst).not.toHaveBeenCalled();
    const data = prisma.pDUActivity.update.mock.calls[0][0].data;
    expect(data.cpdPlanId).toBeNull();
  });
});

describe("ProfessionalPduService write-then-announce atomicity", () => {
  it("creates the activity and appends the outbox event in the same transaction", async () => {
    const { service, prisma, append } = createService();
    const created = {
      id: "activity-1",
      userId: "user-1",
      updatedAt: new Date("2026-06-01T00:00:00.000Z"),
    };
    prisma.pDUActivity.create.mockResolvedValue(created);

    await service.createPduActivity(professional, createInput());

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(append).toHaveBeenCalledWith(
      expect.objectContaining({
        aggregateId: "activity-1",
        payload: expect.objectContaining({
          userId: "user-1",
          changeKind: LearningActivityChangeKind.CREATED,
        }),
      }),
      prisma,
    );
  });

  it("does not append an event when the create transaction throws", async () => {
    const { service, prisma, append } = createService();
    prisma.pDUActivity.create.mockRejectedValue(new Error("db down"));

    await expect(
      service.createPduActivity(professional, createInput()),
    ).rejects.toThrow("db down");
    expect(append).not.toHaveBeenCalled();
  });

  it("updates the activity and appends the outbox event in the same transaction", async () => {
    const { service, prisma, append } = createService();
    prisma.pDUActivity.findFirst.mockResolvedValue({
      id: "activity-1",
      userId: "user-1",
      evidenceFiles: [],
    });
    prisma.pDUActivity.update.mockResolvedValue({
      id: "activity-1",
      userId: "user-1",
      updatedAt: new Date("2026-07-01T00:00:00.000Z"),
    });

    await service.updatePduActivity(professional, {
      activityId: "activity-1",
      pdus: 8,
    } as never);

    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(append).toHaveBeenCalledWith(
      expect.objectContaining({
        aggregateId: "activity-1",
        payload: expect.objectContaining({
          changeKind: LearningActivityChangeKind.UPDATED,
        }),
      }),
      prisma,
    );
  });

  it("deletes the activity and appends the outbox event in the same transaction, before blob cleanup", async () => {
    const { service, prisma, append } = createService();
    prisma.pDUActivity.findFirst.mockResolvedValue({
      id: "activity-1",
      userId: "user-1",
      evidenceFiles: [{ storageKey: "key.pdf" }],
    });

    const result = await service.deletePduActivity(professional, "activity-1");

    expect(result).toEqual({ id: "activity-1" });
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(prisma.pDUActivity.delete).toHaveBeenCalledWith({
      where: { id: "activity-1" },
    });
    expect(append).toHaveBeenCalledWith(
      expect.objectContaining({
        aggregateId: "activity-1",
        payload: expect.objectContaining({
          changeKind: LearningActivityChangeKind.DELETED,
        }),
      }),
      prisma,
    );
  });
});

describe("ProfessionalPduService association requirement linking", () => {
  it("links a created activity to an association requirement and clears any plan link", async () => {
    const { service, prisma } = createService();
    prisma.pDUActivity.create.mockResolvedValue({
      id: "activity-1",
      userId: "user-1",
    });

    await service.createPduActivity(
      professional,
      createInput({
        associationRequirementId: "req-1",
        associationLearningContentId: "content-1",
      }),
    );

    const data = prisma.pDUActivity.create.mock.calls[0][0].data;
    expect(data.associationRequirementId).toBe("req-1");
    expect(data.associationLearningContentId).toBe("content-1");
    expect(data.cpdPlanId).toBeNull();
    expect(prisma.cPDPlan.findFirst).not.toHaveBeenCalled();
  });

  it("rejects a created activity linked to a requirement not assigned to the caller", async () => {
    const isAssigned = jest.fn().mockResolvedValue(false);
    const { service, prisma } = createService(createPrismaMock(), {
      isAssigned,
    });

    await expect(
      service.createPduActivity(
        professional,
        createInput({ associationRequirementId: "req-not-mine" }),
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(isAssigned).toHaveBeenCalledWith("user-1", "req-not-mine");
    expect(prisma.pDUActivity.create).not.toHaveBeenCalled();
  });

  it("rejects an updated activity linked to a requirement not assigned to the caller", async () => {
    const isAssigned = jest.fn().mockResolvedValue(false);
    const { service, prisma } = createService(createPrismaMock(), {
      isAssigned,
    });
    prisma.pDUActivity.findFirst.mockResolvedValue({
      id: "activity-1",
      userId: "user-1",
      evidenceFiles: [],
    });

    await expect(
      service.updatePduActivity(professional, {
        activityId: "activity-1",
        associationRequirementId: "req-not-mine",
      } as never),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(isAssigned).toHaveBeenCalledWith("user-1", "req-not-mine");
    expect(prisma.pDUActivity.update).not.toHaveBeenCalled();
  });

  it("refuses an activity linked to both a plan and an association requirement", async () => {
    const { service, prisma } = createService();
    prisma.cPDPlan.findFirst.mockResolvedValue({ id: "plan-1" });

    await expect(
      service.createPduActivity(
        professional,
        createInput({ cpdPlanId: "plan-1", associationRequirementId: "req-1" }),
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(prisma.pDUActivity.create).not.toHaveBeenCalled();
  });

  it("switches an existing activity from a requirement to a plan", async () => {
    const { service, prisma } = createService();
    prisma.pDUActivity.findFirst.mockResolvedValue({
      id: "activity-1",
      userId: "user-1",
      evidenceFiles: [],
    });
    prisma.cPDPlan.findFirst.mockResolvedValue({ id: "plan-1" });
    prisma.pDUActivity.update.mockResolvedValue({
      id: "activity-1",
      userId: "user-1",
    });

    await service.updatePduActivity(professional, {
      activityId: "activity-1",
      cpdPlanId: "plan-1",
    } as never);

    const data = prisma.pDUActivity.update.mock.calls[0][0].data;
    expect(data.cpdPlanId).toBe("plan-1");
    expect(data.associationRequirementId).toBeNull();
  });

  it("clears the requirement link when the professional unlinks it", async () => {
    const { service, prisma } = createService();
    prisma.pDUActivity.findFirst.mockResolvedValue({
      id: "activity-1",
      userId: "user-1",
      evidenceFiles: [],
    });
    prisma.pDUActivity.update.mockResolvedValue({
      id: "activity-1",
      userId: "user-1",
    });

    await service.updatePduActivity(professional, {
      activityId: "activity-1",
      associationRequirementId: null,
    } as never);

    const data = prisma.pDUActivity.update.mock.calls[0][0].data;
    expect(data.associationRequirementId).toBeNull();
  });
});
