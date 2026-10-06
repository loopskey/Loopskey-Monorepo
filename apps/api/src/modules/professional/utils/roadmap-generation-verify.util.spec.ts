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

const verify = (
  input: Omit<Parameters<typeof verifyGeneratedRoadmap>[0], "maxPhases"> & {
    maxPhases?: number;
  },
) => verifyGeneratedRoadmap({ maxPhases: 4, ...input });

const reference = (contentId: string | null, contentType: string | null) =>
  step({
    contentId,
    contentType:
      contentType as GenerateData["phases"][number]["steps"][number]["contentType"],
  });

const rejection = (violation: RoadmapGenerationViolation) =>
  expect.objectContaining({ ok: false, violation });

describe("verifyGeneratedRoadmap", () => {
  it("accepts a plan whose content all came from the candidate set", () => {
    const result = verify({
      freeOnly: false,
      candidates: [known("course-1")],
      data: data({
        phases: [phase({ steps: [reference("course-1", "COURSE")] })],
      }),
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.phases[0]?.steps[0]).toMatchObject({
      contentId: "course-1",
      contentType: "COURSE",
    });
  });

  it("preserves a step the provider deliberately returned without content", () => {
    const result = verify({
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
      contentType: null,
    });
  });

  it("accepts several steps that carry no content", () => {
    const result = verify({
      freeOnly: false,
      candidates: [],
      data: data({
        phases: [
          phase({
            steps: [
              step({ order: 1, title: "Practise" }),
              step({ order: 2, title: "Build a project" }),
              step({ order: 3, title: "Reflect" }),
            ],
          }),
        ],
      }),
    });

    expect(result.ok).toBe(true);
  });

  it("rejects an identifier no candidate offered instead of turning it into a no-content step", () => {
    const result = verify({
      freeOnly: false,
      candidates: [known("course-1")],
      data: data({
        phases: [phase({ steps: [reference("fake-99", "COURSE")] })],
      }),
    });

    expect(result).toEqual({
      ok: false,
      violation: RoadmapGenerationViolation.UNKNOWN_CONTENT,
      offending: "COURSE:fake-99",
    });
  });

  it("rejects an identifier without a content type", () => {
    const result = verify({
      freeOnly: false,
      candidates: [known("course-1")],
      data: data({ phases: [phase({ steps: [reference("course-1", null)] })] }),
    });

    expect(result).toEqual(
      rejection(RoadmapGenerationViolation.PARTIAL_CONTENT_REFERENCE),
    );
  });

  it("rejects a content type without an identifier", () => {
    const result = verify({
      freeOnly: false,
      candidates: [known("course-1")],
      data: data({ phases: [phase({ steps: [reference(null, "COURSE")] })] }),
    });

    expect(result).toEqual(
      rejection(RoadmapGenerationViolation.PARTIAL_CONTENT_REFERENCE),
    );
  });

  it("rejects a known identifier offered under a different content type", () => {
    const result = verify({
      freeOnly: false,
      candidates: [known("c1", { contentType: "COURSE" })],
      data: data({ phases: [phase({ steps: [reference("c1", "EVENT")] })] }),
    });

    expect(result).toEqual(
      rejection(RoadmapGenerationViolation.UNKNOWN_CONTENT),
    );
  });

  it("separates identifiers that collide across content types", () => {
    const result = verify({
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

  it("rejects the same item in two phases", () => {
    const result = verify({
      freeOnly: false,
      candidates: [known("course-1")],
      data: data({
        estimatedWeeks: 8,
        phases: [
          phase({ order: 1, steps: [reference("course-1", "COURSE")] }),
          phase({ order: 2, steps: [reference("course-1", "COURSE")] }),
        ],
      }),
    });

    expect(result).toEqual(
      rejection(RoadmapGenerationViolation.DUPLICATE_CONTENT),
    );
  });

  it("rejects the same item twice inside one phase", () => {
    const result = verify({
      freeOnly: false,
      candidates: [known("course-1")],
      data: data({
        phases: [
          phase({
            steps: [
              step({ order: 1, contentId: "course-1", contentType: "COURSE" }),
              step({ order: 2, contentId: "course-1", contentType: "COURSE" }),
            ],
          }),
        ],
      }),
    });

    expect(result).toEqual(
      rejection(RoadmapGenerationViolation.DUPLICATE_CONTENT),
    );
  });

  it("rejects a paid item under a free-only preference", () => {
    const result = verify({
      freeOnly: true,
      candidates: [known("course-1", { isFree: false })],
      data: data({
        phases: [phase({ steps: [reference("course-1", "COURSE")] })],
      }),
    });

    expect(result).toEqual(
      rejection(RoadmapGenerationViolation.PAID_UNDER_FREE_ONLY),
    );
  });

  it("allows a free item under a free-only preference", () => {
    const result = verify({
      freeOnly: true,
      candidates: [known("course-1", { isFree: true })],
      data: data({
        phases: [phase({ steps: [reference("course-1", "COURSE")] })],
      }),
    });

    expect(result.ok).toBe(true);
  });

  it("allows a paid item when the professional did not ask for free only", () => {
    const result = verify({
      freeOnly: false,
      candidates: [known("course-1", { isFree: false })],
      data: data({
        phases: [phase({ steps: [reference("course-1", "COURSE")] })],
      }),
    });

    expect(result.ok).toBe(true);
  });

  it("rejects phase durations that do not sum to the stated total", () => {
    const result = verify({
      freeOnly: false,
      candidates: [],
      data: data({
        estimatedWeeks: 10,
        phases: [
          phase({ order: 1, estimatedWeeks: 3 }),
          phase({ order: 2, estimatedWeeks: 3 }),
        ],
      }),
    });

    expect(result).toEqual(
      rejection(RoadmapGenerationViolation.PHASE_DURATION_MISMATCH),
    );
  });

  it("rejects a plan with no phases at all", () => {
    const result = verify({
      freeOnly: false,
      candidates: [],
      data: data({ estimatedWeeks: 0, phases: [] }),
    });

    expect(result).toEqual(rejection(RoadmapGenerationViolation.EMPTY_PLAN));
  });

  it("rejects more phases than were requested", () => {
    const phases = Array.from({ length: 5 }, (_value, index) =>
      phase({ order: index + 1, estimatedWeeks: 1 }),
    );

    const result = verify({
      freeOnly: false,
      maxPhases: 4,
      candidates: [],
      data: data({ estimatedWeeks: 5, phases }),
    });

    expect(result).toEqual(
      rejection(RoadmapGenerationViolation.TOO_MANY_PHASES),
    );
  });

  it("accepts exactly the requested number of phases", () => {
    const phases = Array.from({ length: 4 }, (_value, index) =>
      phase({ order: index + 1, estimatedWeeks: 1 }),
    );

    const result = verify({
      freeOnly: false,
      maxPhases: 4,
      candidates: [],
      data: data({ estimatedWeeks: 4, phases }),
    });

    expect(result.ok).toBe(true);
  });

  it("rejects two phases sharing an order before anything is written", () => {
    const result = verify({
      freeOnly: false,
      candidates: [],
      data: data({
        estimatedWeeks: 8,
        phases: [phase({ order: 1 }), phase({ order: 1 })],
      }),
    });

    expect(result).toEqual(
      rejection(RoadmapGenerationViolation.DUPLICATE_PHASE_ORDER),
    );
  });

  it("rejects two steps sharing an order inside a phase", () => {
    const result = verify({
      freeOnly: false,
      candidates: [],
      data: data({
        phases: [
          phase({
            steps: [step({ order: 2, title: "A" }), step({ order: 2 })],
          }),
        ],
      }),
    });

    expect(result).toEqual(
      rejection(RoadmapGenerationViolation.DUPLICATE_STEP_ORDER),
    );
  });

  it.each([
    ["roadmap title", { title: "  " }],
    ["roadmap description", { description: "\n" }],
  ])("rejects a whitespace-only %s", (_name, overrides) => {
    const result = verify({
      freeOnly: false,
      candidates: [],
      data: data(overrides),
    });

    expect(result).toEqual(rejection(RoadmapGenerationViolation.BLANK_TEXT));
  });

  it("rejects a whitespace-only phase title", () => {
    const result = verify({
      freeOnly: false,
      candidates: [],
      data: data({ phases: [phase({ title: " " })] }),
    });

    expect(result).toEqual(rejection(RoadmapGenerationViolation.BLANK_TEXT));
  });

  it("rejects a whitespace-only step title or description", () => {
    for (const overrides of [{ title: "  " }, { description: "\t" }])
      expect(
        verify({
          freeOnly: false,
          candidates: [],
          data: data({ phases: [phase({ steps: [step(overrides)] })] }),
        }),
      ).toEqual(rejection(RoadmapGenerationViolation.BLANK_TEXT));
  });

  it("lets two phases reuse the same step order", () => {
    const result = verify({
      freeOnly: false,
      candidates: [],
      data: data({
        estimatedWeeks: 8,
        phases: [phase({ order: 1 }), phase({ order: 2 })],
      }),
    });

    expect(result.ok).toBe(true);
  });
});
