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

const createService = () => {
  const engagement = createEngagementMock();
  const catalog = createCatalogMock();
  const service = new ProfessionalRoadmapService(engagement, catalog);
  return { service, engagement, catalog };
};

describe("ProfessionalRoadmapService.deriveProgress", () => {
  it("falls back to the stored value when the enrollment has no step progress rows", () => {
    const { service } = createService();

    expect(service.deriveProgress({ storedProgress: 62, totalSteps: 8 })).toBe(
      62,
    );
  });

  it("still falls back when nothing has been completed but rows exist for other steps", () => {
    const { service } = createService();

    // Zero completed is a real derived answer, not a missing one.
    expect(
      service.deriveProgress({
        storedProgress: 62,
        totalSteps: 8,
        completedSteps: 0,
      }),
    ).toBe(0);
  });

  it("derives from recorded steps once the enrollment has them", () => {
    const { service } = createService();

    expect(
      service.deriveProgress({
        storedProgress: 0,
        totalSteps: 8,
        completedSteps: 2,
      }),
    ).toBe(25);
  });

  it("keeps the stored value when the roadmap has no steps to derive from", () => {
    const { service } = createService();

    expect(
      service.deriveProgress({
        storedProgress: 40,
        totalSteps: 0,
        completedSteps: 0,
      }),
    ).toBe(40);
  });

  it("clamps a stored value that is out of range", () => {
    const { service } = createService();

    expect(service.deriveProgress({ storedProgress: 140, totalSteps: 4 })).toBe(
      100,
    );
    expect(service.deriveProgress({ storedProgress: -5, totalSteps: 4 })).toBe(
      0,
    );
  });
});

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

  it("reports the stored progress for an enrollment that predates step tracking", async () => {
    const { service, engagement } = createService();
    engagement.roadmapEnrollments.mockResolvedValue({
      rows: [enrollment],
      totalCount: 1,
    });

    const result = await service.myRoadmaps(professional);

    expect(engagement.roadmapStepCompletionCounts).toHaveBeenCalledWith({
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
    engagement.roadmapStepCompletionCounts.mockResolvedValue({
      "enrollment-1": 3,
    });

    const result = await service.myRoadmaps(professional);

    // Three of four recorded steps, not the stored 50.
    expect(result.items[0].progress).toBe(75);
    expect(result.items[0].completedSteps).toBe(3);
  });
});
