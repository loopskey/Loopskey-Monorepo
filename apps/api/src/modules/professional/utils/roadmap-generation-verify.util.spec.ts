import type { GenerateData } from "@infrastructure/service-ai/service-ai.port";

import {
  RoadmapGenerationViolation,
  verifyGeneratedRoadmap,
  type CandidateKey,
} from "./roadmap-generation-verify.util";

const step = (
  overrides: Partial<GenerateData["phases"][number]["steps"][number]> = {},
) => ({
  order: 1,
  title: "Step",
  description: "Do the thing.",
  contentId: null,
  contentType: null,
  estimatedMinutes: null,
  ...overrides,
});

const phase = (overrides: Partial<GenerateData["phases"][number]> = {}) => ({
  order: 1,
  title: "Phase",
  description: "The first phase.",
  estimatedWeeks: 4,
  steps: [step()],
  ...overrides,
});

const data = (overrides: Partial<GenerateData> = {}): GenerateData => ({
  title: "A roadmap",
  description: "Generated.",
  estimatedWeeks: 4,
  level: "BEGINNER",
  coverageNote: null,
  phases: [phase()],
  ...overrides,
});

const known = (
  contentId: string,
  overrides: Partial<CandidateKey> = {},
): CandidateKey => ({
  contentId,
  contentType: "COURSE",
  isFree: true,
  ...overrides,
});

describe("verifyGeneratedRoadmap", () => {
  it("accepts a plan whose content all came from the candidate set", () => {
    const result = verifyGeneratedRoadmap({
      freeOnly: false,
      candidates: [known("course-1")],
      data: data({
        phases: [
          phase({
            steps: [step({ contentId: "course-1", contentType: "COURSE" })],
          }),
        ],
      }),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.droppedContentIds).toEqual([]);
    expect(result.phases[0]?.steps[0]?.contentId).toBe("course-1");
  });

  it("drops an identifier no candidate offered and keeps the step", () => {
    const result = verifyGeneratedRoadmap({
      freeOnly: false,
      candidates: [known("course-1")],
      data: data({
        phases: [
          phase({
            steps: [
              step({
                title: "Read about deployment",
                contentId: "invented",
                contentType: "COURSE",
              }),
            ],
          }),
        ],
      }),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.droppedContentIds).toEqual(["invented"]);
    expect(result.phases[0]?.steps).toHaveLength(1);
    expect(result.phases[0]?.steps[0]).toMatchObject({
      title: "Read about deployment",
      contentId: null,
      contentType: null,
    });
  });

  it("treats the same identifier in two phases as a failure", () => {
    const result = verifyGeneratedRoadmap({
      freeOnly: false,
      candidates: [known("course-1")],
      data: data({
        estimatedWeeks: 8,
        phases: [
          phase({
            order: 1,
            steps: [step({ contentId: "course-1", contentType: "COURSE" })],
          }),
          phase({
            order: 2,
            steps: [step({ contentId: "course-1", contentType: "COURSE" })],
          }),
        ],
      }),
    });

    expect(result).toEqual({
      ok: false,
      violation: RoadmapGenerationViolation.DUPLICATE_CONTENT,
    });
  });

  it("treats a paid item under a free-only preference as a failure", () => {
    const result = verifyGeneratedRoadmap({
      freeOnly: true,
      candidates: [known("course-1", { isFree: false })],
      data: data({
        phases: [
          phase({
            steps: [step({ contentId: "course-1", contentType: "COURSE" })],
          }),
        ],
      }),
    });

    expect(result).toEqual({
      ok: false,
      violation: RoadmapGenerationViolation.PAID_UNDER_FREE_ONLY,
    });
  });

  it("allows the same paid item when the professional did not ask for free only", () => {
    const result = verifyGeneratedRoadmap({
      freeOnly: false,
      candidates: [known("course-1", { isFree: false })],
      data: data({
        phases: [
          phase({
            steps: [step({ contentId: "course-1", contentType: "COURSE" })],
          }),
        ],
      }),
    });

    expect(result.ok).toBe(true);
  });

  it("treats phase durations that do not sum to the stated total as a failure", () => {
    const result = verifyGeneratedRoadmap({
      freeOnly: false,
      candidates: [],
      data: data({
        estimatedWeeks: 10,
        phases: [
          phase({ estimatedWeeks: 4 }),
          phase({ order: 2, estimatedWeeks: 4 }),
        ],
      }),
    });

    expect(result).toEqual({
      ok: false,
      violation: RoadmapGenerationViolation.PHASE_DURATION_MISMATCH,
    });
  });

  it("rejects a plan with no phases at all", () => {
    const result = verifyGeneratedRoadmap({
      freeOnly: false,
      candidates: [],
      data: data({ estimatedWeeks: 0, phases: [] }),
    });

    expect(result).toEqual({
      ok: false,
      violation: RoadmapGenerationViolation.EMPTY_PLAN,
    });
  });

  it("preserves a step the provider deliberately returned without content", () => {
    const result = verifyGeneratedRoadmap({
      freeOnly: false,
      candidates: [known("course-1")],
      data: data({
        phases: [
          phase({
            steps: [
              step({ order: 1, title: "Build a small project" }),
              step({ order: 2, contentId: "course-1", contentType: "COURSE" }),
            ],
          }),
        ],
      }),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.phases[0]?.steps).toHaveLength(2);
    expect(result.phases[0]?.steps[0]).toMatchObject({
      title: "Build a small project",
      contentId: null,
    });
    expect(result.droppedContentIds).toEqual([]);
  });

  it("separates identifiers that collide across content types", () => {
    // The same identifier under two types is two different items, not a repeat.
    const result = verifyGeneratedRoadmap({
      freeOnly: false,
      candidates: [
        known("shared", { contentType: "COURSE" }),
        known("shared", { contentType: "PODCAST" }),
      ],
      data: data({
        phases: [
          phase({
            steps: [
              step({ order: 1, contentId: "shared", contentType: "COURSE" }),
              step({ order: 2, contentId: "shared", contentType: "PODCAST" }),
            ],
          }),
        ],
      }),
    });

    expect(result.ok).toBe(true);
  });
});
