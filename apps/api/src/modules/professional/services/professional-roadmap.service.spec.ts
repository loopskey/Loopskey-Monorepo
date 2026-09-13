import { Role } from "@prisma/client";

import type { ProfessionalCatalogApi } from "@course/public/professional-catalog-api";
import type { ProfessionalEngagementApi } from "@contentAction/public/professional-engagement-api";

import { ProfessionalRoadmapService } from "./professional-roadmap.service";

const professional = { id: "user-1", role: Role.PROFESSIONAL };

const phase = (id: string, stepCount: number) => ({
  id,
  order: 0,
  title: `phase ${id}`,
  description: null,
  steps: Array.from({ length: stepCount }, (_step, index) => ({
    id: `${id}-step-${index}`,
  })),
});

const roadmap = {
  id: "roadmap-1",
  slug: "roadmap-1",
  title: "Roadmap",
  description: "Description",
  imageUrl: null,
  category: null,
  level: "ALL_LEVELS",
  status: "PUBLISHED",
  phases: [phase("a", 2), phase("b", 2)],
};

const createEngagementMock = () =>
  ({
    roadmapEnrollments: jest.fn(),
    enrolledRoadmapIds: jest.fn(),
    roadmapStepCompletionCounts: jest.fn().mockResolvedValue({}),
    roadmapStepProgress: jest.fn().mockResolvedValue([]),
    startRoadmapStep: jest.fn(),
    completeRoadmapStep: jest.fn(),
    courseEnrollments: jest.fn(),
    courseCounts: jest.fn(),
    payments: jest.fn(),
  }) as unknown as jest.Mocked<ProfessionalEngagementApi>;

const createCatalogMock = () =>
  ({
    roadmaps: jest.fn().mockResolvedValue([roadmap]),
    searchRoadmapIds: jest.fn(),
    exploreRoadmaps: jest.fn(),
    searchCourseIds: jest.fn(),
    courses: jest.fn(),
    calendarRegistrations: jest.fn(),
    upcomingRegistrationCount: jest.fn(),
  }) as unknown as jest.Mocked<ProfessionalCatalogApi>;

const createEventsMock = () =>
  ({ eventCredits: jest.fn().mockResolvedValue({}) }) as never;

const createService = () => {
  const engagement = createEngagementMock();
  const catalog = createCatalogMock();
  const events = createEventsMock();
  const service = new ProfessionalRoadmapService(engagement, catalog, events);
  return { service, engagement, catalog, events };
};

describe("ProfessionalRoadmapService.myRoadmaps", () => {
  const enrollment = {
    id: "enrollment-1",
    userId: "user-1",
    roadmapId: "roadmap-1",
    progress: 50,
    status: "ACTIVE",
    enrolledAt: new Date(),
    completedAt: null,
    updatedAt: new Date(),
  };

  const completedRecord = (stepId: string) => ({
    stepId,
    enrollmentId: "enrollment-1",
    status: "COMPLETED",
    completedAt: new Date(),
  });

  it("reports the stored progress for an enrollment that predates step tracking", async () => {
    const { service, engagement } = createService();
    engagement.roadmapEnrollments.mockResolvedValue({
      rows: [enrollment],
      totalCount: 1,
    });

    const result = await service.myRoadmaps(professional);

    expect(engagement.roadmapStepProgress).toHaveBeenCalledWith({
      userId: "user-1",
      enrollmentIds: ["enrollment-1"],
    });
    expect(result.items[0].progress).toBe(50);
  });

  it("reports derived progress once step progress exists", async () => {
    const { service, engagement } = createService();
    engagement.roadmapEnrollments.mockResolvedValue({
      rows: [enrollment],
      totalCount: 1,
    });
    engagement.roadmapStepProgress.mockResolvedValue([
      completedRecord("a-step-0"),
      completedRecord("a-step-1"),
      completedRecord("b-step-0"),
    ]);

    const result = await service.myRoadmaps(professional);

    // Three of four recorded steps, not the stored 50.
    expect(result.items[0].progress).toBe(75);
    expect(result.items[0].completedSteps).toBe(3);
  });

  it("gives each phase the progress its own steps earned", async () => {
    const { service, engagement } = createService();
    engagement.roadmapEnrollments.mockResolvedValue({
      rows: [enrollment],
      totalCount: 1,
    });
    engagement.roadmapStepProgress.mockResolvedValue([
      completedRecord("a-step-0"),
      completedRecord("a-step-1"),
    ]);

    const result = await service.myRoadmaps(professional);

    // The first phase is finished and the second untouched; the old slicing
    // reported both as part-done.
    expect(result.items[0].phases[0]).toMatchObject({
      progress: 100,
      completed: true,
    });
    expect(result.items[0].phases[1]).toMatchObject({
      progress: 0,
      completed: false,
    });
  });

  it("exposes each step's recorded status", async () => {
    const { service, engagement } = createService();
    engagement.roadmapEnrollments.mockResolvedValue({
      rows: [enrollment],
      totalCount: 1,
    });
    engagement.roadmapStepProgress.mockResolvedValue([
      completedRecord("a-step-0"),
    ]);

    const result = await service.myRoadmaps(professional);
    const steps = result.items[0].phases[0].steps;

    expect(steps[0]).toMatchObject({ status: "COMPLETED" });
    expect(steps[1]).toMatchObject({ status: null });
  });
});

describe("ProfessionalRoadmapService.roadmapStats", () => {
  const enrollment = (id: string, roadmapId: string, progress: number) => ({
    id,
    userId: "user-1",
    roadmapId,
    progress,
    status: "ACTIVE",
    enrolledAt: new Date(),
    completedAt: null,
    updatedAt: new Date(),
  });

  it("returns zero counts and a null next milestone with no enrollments", async () => {
    const { service, engagement } = createService();
    engagement.roadmapEnrollments.mockResolvedValue({
      rows: [],
      totalCount: 0,
    });

    const stats = await service.roadmapStats(professional);

    expect(stats).toEqual({
      enrolledCount: 0,
      averageProgress: 0,
      completedPhaseCount: 0,
      totalPhaseCount: 0,
      nextMilestone: null,
    });
  });

  it("averages stored progress and sums phase counts across every enrollment", async () => {
    const { service, engagement, catalog } = createService();
    catalog.roadmaps.mockResolvedValue([
      { ...roadmap, id: "roadmap-1" },
      { ...roadmap, id: "roadmap-2" },
    ]);
    engagement.roadmapEnrollments.mockResolvedValue({
      rows: [
        enrollment("enrollment-1", "roadmap-1", 20),
        enrollment("enrollment-2", "roadmap-2", 60),
      ],
      totalCount: 2,
    });

    const stats = await service.roadmapStats(professional);

    expect(stats.enrolledCount).toBe(2);
    // No step-progress records, so each enrollment falls back to its stored
    // progress: (20 + 60) / 2 = 40.
    expect(stats.averageProgress).toBe(40);
    expect(stats.totalPhaseCount).toBe(4);
    expect(stats.nextMilestone).toBe(50);
  });

  it("pages through every enrollment when there is more than one page's worth", async () => {
    const { service, engagement } = createService();
    const firstPageRows = Array.from({ length: 201 }, (_, index) =>
      enrollment(`enrollment-${index}`, "roadmap-1", 0),
    );
    const secondPageRows = [enrollment("enrollment-200", "roadmap-1", 0)];
    engagement.roadmapEnrollments
      .mockResolvedValueOnce({ rows: firstPageRows, totalCount: 201 })
      .mockResolvedValueOnce({ rows: secondPageRows, totalCount: 201 });

    const stats = await service.roadmapStats(professional);

    expect(engagement.roadmapEnrollments).toHaveBeenCalledTimes(2);
    expect(stats.enrolledCount).toBe(201);
  });
});
