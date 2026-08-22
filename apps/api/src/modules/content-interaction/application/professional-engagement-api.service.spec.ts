import { RoadmapStepProgressStatus } from "@prisma/client";

import type { PrismaService } from "@prisma/prisma.service";

import { ProfessionalEngagementApiService } from "./professional-engagement-api.service";

const createPrismaMock = () => ({
  roadmapEnrollment: {
    findFirst: jest.fn().mockResolvedValue({ id: "enrollment-1" }),
  },
  roadmapStepProgress: {
    upsert: jest.fn(),
    findUnique: jest.fn().mockResolvedValue(null),
    groupBy: jest.fn().mockResolvedValue([]),
  },
});

const createService = (prisma = createPrismaMock()) => ({
  prisma,
  service: new ProfessionalEngagementApiService(
    prisma as unknown as PrismaService,
  ),
});

const step = { userId: "user-1", enrollmentId: "enrollment-1", stepId: "s-1" };

describe("ProfessionalEngagementApiService step progress", () => {
  it("writes through the unique key so repeating a completion cannot create a second row", async () => {
    const { service, prisma } = createService();
    prisma.roadmapStepProgress.upsert.mockResolvedValue({ id: "p-1" });

    await service.completeRoadmapStep(step);

    const call = prisma.roadmapStepProgress.upsert.mock.calls[0][0];
    expect(call.where).toEqual({
      enrollmentId_stepId: { enrollmentId: "enrollment-1", stepId: "s-1" },
    });
    expect(call.create.status).toBe(RoadmapStepProgressStatus.COMPLETED);
  });

  it("leaves an already completed step untouched, so its completion time never moves", async () => {
    const { service, prisma } = createService();
    const completedAt = new Date("2026-01-01T00:00:00.000Z");
    prisma.roadmapStepProgress.findUnique.mockResolvedValue({
      id: "p-1",
      completedAt,
      status: RoadmapStepProgressStatus.COMPLETED,
    });

    const result = await service.completeRoadmapStep(step);

    expect(prisma.roadmapStepProgress.upsert).not.toHaveBeenCalled();
    expect(result).toMatchObject({ completedAt });
  });

  it("promotes an in-progress step to completed", async () => {
    const { service, prisma } = createService();
    prisma.roadmapStepProgress.findUnique.mockResolvedValue({
      id: "p-1",
      status: RoadmapStepProgressStatus.IN_PROGRESS,
    });
    prisma.roadmapStepProgress.upsert.mockResolvedValue({ id: "p-1" });

    await service.completeRoadmapStep(step);

    const call = prisma.roadmapStepProgress.upsert.mock.calls[0][0];
    expect(call.update.status).toBe(RoadmapStepProgressStatus.COMPLETED);
  });

  it("does not reopen a step that starting is repeated on", async () => {
    const { service, prisma } = createService();
    prisma.roadmapStepProgress.upsert.mockResolvedValue({ id: "p-1" });

    await service.startRoadmapStep(step);

    expect(prisma.roadmapStepProgress.upsert.mock.calls[0][0].update).toEqual(
      {},
    );
  });

  it("refuses to write against an enrollment the user does not own", async () => {
    const { service, prisma } = createService();
    prisma.roadmapEnrollment.findFirst.mockResolvedValue(null);

    expect(await service.completeRoadmapStep(step)).toBeNull();
    expect(await service.startRoadmapStep(step)).toBeNull();
    expect(prisma.roadmapStepProgress.upsert).not.toHaveBeenCalled();
  });

  it("scopes the ownership lookup to the user, not just the enrollment", async () => {
    const { service, prisma } = createService();
    prisma.roadmapStepProgress.upsert.mockResolvedValue({ id: "p-1" });

    await service.startRoadmapStep(step);

    expect(prisma.roadmapEnrollment.findFirst.mock.calls[0][0].where).toEqual({
      id: "enrollment-1",
      userId: "user-1",
    });
  });
});

describe("ProfessionalEngagementApiService.roadmapStepCompletionCounts", () => {
  it("omits enrollments with no rows so the caller can fall back to stored progress", async () => {
    const { service } = createService();

    expect(
      await service.roadmapStepCompletionCounts({
        userId: "user-1",
        enrollmentIds: ["enrollment-1"],
      }),
    ).toEqual({});
  });

  it("reports zero for an enrollment that has rows but none completed", async () => {
    const { service, prisma } = createService();
    prisma.roadmapStepProgress.groupBy.mockResolvedValue([
      {
        enrollmentId: "enrollment-1",
        status: RoadmapStepProgressStatus.IN_PROGRESS,
        _count: { _all: 2 },
      },
    ]);

    expect(
      await service.roadmapStepCompletionCounts({
        userId: "user-1",
        enrollmentIds: ["enrollment-1"],
      }),
    ).toEqual({ "enrollment-1": 0 });
  });

  it("counts only completed rows", async () => {
    const { service, prisma } = createService();
    prisma.roadmapStepProgress.groupBy.mockResolvedValue([
      {
        enrollmentId: "enrollment-1",
        status: RoadmapStepProgressStatus.IN_PROGRESS,
        _count: { _all: 1 },
      },
      {
        enrollmentId: "enrollment-1",
        status: RoadmapStepProgressStatus.COMPLETED,
        _count: { _all: 3 },
      },
    ]);

    expect(
      await service.roadmapStepCompletionCounts({
        userId: "user-1",
        enrollmentIds: ["enrollment-1"],
      }),
    ).toEqual({ "enrollment-1": 3 });
  });

  it("filters the query by the owning user", async () => {
    const { service, prisma } = createService();

    await service.roadmapStepCompletionCounts({
      userId: "user-1",
      enrollmentIds: ["enrollment-1"],
    });

    expect(prisma.roadmapStepProgress.groupBy.mock.calls[0][0].where).toEqual({
      enrollmentId: { in: ["enrollment-1"] },
      enrollment: { userId: "user-1" },
    });
  });

  it("does not query at all for an empty enrollment list", async () => {
    const { service, prisma } = createService();

    expect(
      await service.roadmapStepCompletionCounts({
        userId: "user-1",
        enrollmentIds: [],
      }),
    ).toEqual({});
    expect(prisma.roadmapStepProgress.groupBy).not.toHaveBeenCalled();
  });
});
