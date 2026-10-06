import { RoadmapSource } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";

import { ProfessionalCatalogApiService } from "./professional-catalog-api.service";

import type { GeneratedRoadmapInput } from "@course/public/professional-catalog-api";

const input = (
  overrides: Partial<GeneratedRoadmapInput> = {},
): GeneratedRoadmapInput => ({
  slug: "platform-engineering-abc12345",
  title: "Platform engineering",
  ownerId: "user-1",
  description: "A generated plan.",
  level: "INTERMEDIATE",
  estimatedWeeks: 4,
  coverageNote: "Limited catalogue.",
  matchTier: "EXACT",
  phases: [
    {
      order: 1,
      title: "Foundations",
      description: "Start here.",
      estimatedWeeks: 4,
      steps: [
        {
          order: 1,
          title: "Learn the basics",
          description: "Work through it.",
          isCloseMatch: false,
          credits: null,
          contentId: "course-1",
          estimatedMinutes: 60,
          contentType: "COURSE",
        },
        {
          order: 2,
          title: "Build a project",
          description: "Apply it.",
          isCloseMatch: false,
          credits: null,
          contentId: null,
          estimatedMinutes: 120,
          contentType: null,
        },
      ],
    },
  ],
  ...overrides,
});

const setup = () => {
  const create = jest.fn().mockResolvedValue({ id: "roadmap-1" });
  const service = new ProfessionalCatalogApiService({} as PrismaService);
  const tx = { roadmap: { create } };
  return { service, tx, create };
};

describe("ProfessionalCatalogApiService.createGeneratedRoadmap", () => {
  it.each(["BEGINNER", "INTERMEDIATE", "ADVANCED"] as const)(
    "stores the generated roadmap's %s level instead of the ALL_LEVELS default",
    async (level) => {
      const { service, tx, create } = setup();

      await service.createGeneratedRoadmap(input({ level }), tx);

      expect(create.mock.calls[0][0].data.level).toBe(level);
    },
  );

  it("marks the roadmap as generated and owned by the professional", async () => {
    const { service, tx, create } = setup();

    await service.createGeneratedRoadmap(input(), tx);

    expect(create.mock.calls[0][0].data).toMatchObject({
      ownerId: "user-1",
      source: RoadmapSource.GENERATED,
      coverageNote: "Limited catalogue.",
    });
  });

  it("writes the roadmap, its phases and its steps in a single create", async () => {
    const { service, tx, create } = setup();

    await service.createGeneratedRoadmap(input(), tx);

    expect(create).toHaveBeenCalledTimes(1);
    const phases = create.mock.calls[0][0].data.phases.create;
    expect(phases).toHaveLength(1);
    expect(phases[0].steps.create).toEqual([
      expect.objectContaining({ order: 1, contentId: "course-1" }),
      expect.objectContaining({ order: 2, contentId: null, contentType: null }),
    ]);
  });
});
