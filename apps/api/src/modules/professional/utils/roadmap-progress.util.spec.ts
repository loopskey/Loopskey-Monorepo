import { RoadmapStepProgressStatus } from "@prisma/client";

import {
  deriveRoadmapProgress,
  earnedCredits,
  type StepProgressRecord,
} from "./roadmap-progress.util";

const phase = (id: string, stepIds: string[]) => ({
  id,
  steps: stepIds.map((stepId) => ({ id: stepId })),
});

const completed = (stepId: string): StepProgressRecord => ({
  stepId,
  status: RoadmapStepProgressStatus.COMPLETED,
  completedAt: new Date("2026-08-01"),
});

const inProgress = (stepId: string): StepProgressRecord => ({
  stepId,
  status: RoadmapStepProgressStatus.IN_PROGRESS,
  completedAt: null,
});

describe("deriveRoadmapProgress", () => {
  it("derives the overall percentage from completed steps", () => {
    const result = deriveRoadmapProgress({
      storedProgress: 0,
      phases: [phase("p1", ["s1", "s2"]), phase("p2", ["s3", "s4"])],
      records: [completed("s1")],
    });

    expect(result.progress).toBe(25);
    expect(result.completedSteps).toBe(1);
    expect(result.totalSteps).toBe(4);
    expect(result.derived).toBe(true);
  });

  it("gives each phase the progress its own steps earned", () => {
    // The old implementation sliced the overall percentage across phases, so
    // finishing all of phase one showed both phases as part-done.
    const result = deriveRoadmapProgress({
      storedProgress: 0,
      phases: [phase("p1", ["s1", "s2"]), phase("p2", ["s3", "s4"])],
      records: [completed("s1"), completed("s2")],
    });

    expect(result.phases[0]).toMatchObject({ progress: 100, completed: true });
    expect(result.phases[1]).toMatchObject({ progress: 0, completed: false });
  });

  it("does not count a step that is only in progress", () => {
    const result = deriveRoadmapProgress({
      storedProgress: 0,
      phases: [phase("p1", ["s1", "s2"])],
      records: [inProgress("s1")],
    });

    expect(result.progress).toBe(0);
    expect(result.completedSteps).toBe(0);
  });

  it("exposes each step's status and completion time", () => {
    const result = deriveRoadmapProgress({
      storedProgress: 0,
      phases: [phase("p1", ["s1", "s2", "s3"])],
      records: [completed("s1"), inProgress("s2")],
    });

    expect(result.steps.get("s1")).toMatchObject({
      status: RoadmapStepProgressStatus.COMPLETED,
      completedAt: new Date("2026-08-01"),
    });
    expect(result.steps.get("s2")?.status).toBe(
      RoadmapStepProgressStatus.IN_PROGRESS,
    );
    expect(result.steps.get("s3")?.status).toBeNull();
  });

  it("keeps the stored percentage for an enrollment with no records", () => {
    // These predate step progress; recomputing would move a professional's
    // number backwards for a reason they cannot see.
    const result = deriveRoadmapProgress({
      storedProgress: 60,
      phases: [phase("p1", ["s1", "s2"]), phase("p2", ["s3", "s4"])],
      records: [],
    });

    expect(result.derived).toBe(false);
    expect(result.progress).toBe(60);
    expect(result.phases[0]?.progress).toBe(100);
    expect(result.phases[1]?.progress).toBe(20);
  });

  it("reports a fully completed roadmap as one hundred percent", () => {
    const result = deriveRoadmapProgress({
      storedProgress: 0,
      phases: [phase("p1", ["s1"]), phase("p2", ["s2"])],
      records: [completed("s1"), completed("s2")],
    });

    expect(result.progress).toBe(100);
    expect(result.phases.every((item) => item.completed)).toBe(true);
  });

  it("does not call an empty phase complete", () => {
    const result = deriveRoadmapProgress({
      storedProgress: 0,
      phases: [phase("p1", ["s1"]), phase("empty", [])],
      records: [completed("s1")],
    });

    expect(result.phases[1]).toMatchObject({
      progress: 0,
      completed: false,
      stepsCount: 0,
    });
  });

  it("handles a roadmap with no steps at all", () => {
    const result = deriveRoadmapProgress({
      storedProgress: 0,
      phases: [],
      records: [],
    });

    expect(result.progress).toBe(0);
    expect(result.totalSteps).toBe(0);
  });

  it("keeps the stored value when the roadmap has no steps to derive from", () => {
    const result = deriveRoadmapProgress({
      storedProgress: 40,
      phases: [],
      records: [completed("s1")],
    });

    expect(result.derived).toBe(false);
    expect(result.progress).toBe(40);
  });

  it("clamps a stored value that is out of range", () => {
    const high = deriveRoadmapProgress({
      storedProgress: 140,
      phases: [phase("p1", ["s1"])],
      records: [],
    });
    const low = deriveRoadmapProgress({
      storedProgress: -5,
      phases: [phase("p1", ["s1"])],
      records: [],
    });

    expect(high.progress).toBe(100);
    expect(low.progress).toBe(0);
  });

  it("ignores a record for a step that is not in this roadmap", () => {
    const result = deriveRoadmapProgress({
      storedProgress: 0,
      phases: [phase("p1", ["s1", "s2"])],
      records: [completed("s1"), completed("from-another-roadmap")],
    });

    expect(result.progress).toBe(50);
    expect(result.completedSteps).toBe(1);
  });
});

describe("earnedCredits", () => {
  const progressOf = (statuses: Record<string, RoadmapStepProgressStatus>) =>
    new Map(
      Object.entries(statuses).map(([id, status]) => [
        id,
        { id, status, completedAt: null },
      ]),
    );

  it("counts only completed credit-bearing steps", () => {
    const total = earnedCredits({
      steps: [
        { id: "s1", contentId: "event-1" },
        { id: "s2", contentId: "event-2" },
      ],
      progress: progressOf({
        s1: RoadmapStepProgressStatus.COMPLETED,
        s2: RoadmapStepProgressStatus.IN_PROGRESS,
      }),
      creditsByContentId: { "event-1": 3, "event-2": 5 },
    });

    expect(total).toBe(3);
  });

  it("adds up several completed credit-bearing steps exactly", () => {
    const total = earnedCredits({
      steps: [
        { id: "s1", contentId: "event-1" },
        { id: "s2", contentId: "event-2" },
      ],
      progress: progressOf({
        s1: RoadmapStepProgressStatus.COMPLETED,
        s2: RoadmapStepProgressStatus.COMPLETED,
      }),
      creditsByContentId: { "event-1": 1.5, "event-2": 2.25 },
    });

    expect(total).toBe(3.75);
  });

  it("earns nothing from content that carries no credits", () => {
    const total = earnedCredits({
      steps: [{ id: "s1", contentId: "course-1" }],
      progress: progressOf({ s1: RoadmapStepProgressStatus.COMPLETED }),
      creditsByContentId: {},
    });

    expect(total).toBe(0);
  });

  it("ignores a completed step that has no content", () => {
    const total = earnedCredits({
      steps: [{ id: "s1", contentId: null }],
      progress: progressOf({ s1: RoadmapStepProgressStatus.COMPLETED }),
      creditsByContentId: { "event-1": 3 },
    });

    expect(total).toBe(0);
  });
});
