import {
  allSteps,
  contentKey,
  toCurrentRoadmap,
  toEditableRoadmap,
} from "./roadmap-edit-shape.util";

const row = {
  id: "roadmap-1",
  ownerId: "user-1",
  source: "GENERATED",
  title: "Python Basics",
  description: "Learn Python.",
  phases: [
    {
      id: "p2",
      order: 2,
      title: "Data",
      description: null,
      estimatedWeeks: null,
      steps: [
        {
          id: "s4",
          order: 1,
          title: "Pandas",
          contentId: "yt-1",
          contentType: "YOUTUBE",
        },
      ],
    },
    {
      id: "p1",
      order: 1,
      title: "Basics",
      description: "Start.",
      estimatedWeeks: 3,
      steps: [
        {
          id: "s2",
          order: 2,
          title: "Loops",
          description: "",
          contentId: null,
          contentType: null,
        },
        {
          id: "s1",
          order: 1,
          title: "Intro",
          description: "Hi",
          contentId: "c-1",
          contentType: "COURSE",
          estimatedMinutes: 90,
          credits: 1.5,
        },
      ],
    },
  ],
};

describe("toEditableRoadmap", () => {
  it("orders phases and steps by their position, whatever order the catalog returned", () => {
    const roadmap = toEditableRoadmap(row);

    expect(roadmap.phases.map((phase) => phase.id)).toEqual(["p1", "p2"]);
    expect(roadmap.phases[0].steps.map((step) => step.id)).toEqual([
      "s1",
      "s2",
    ]);
  });

  it("keeps who owns the roadmap and where it came from", () => {
    expect(toEditableRoadmap(row)).toMatchObject({
      id: "roadmap-1",
      ownerId: "user-1",
      source: "GENERATED",
    });
  });

  it("reads blanks and missing values as null", () => {
    const [intro, loops] = toEditableRoadmap(row).phases[0].steps;

    expect(loops).toMatchObject({
      description: null,
      contentId: null,
      contentType: null,
      estimatedMinutes: null,
      credits: null,
    });
    expect(intro).toMatchObject({ estimatedMinutes: 90, credits: 1.5 });
  });

  it("copes with a roadmap that has no phases", () => {
    expect(toEditableRoadmap({ id: "r", title: "T" }).phases).toEqual([]);
  });
});

describe("toCurrentRoadmap", () => {
  const roadmap = toEditableRoadmap(row);

  it("carries each step's progress and leaves unstarted steps null", () => {
    const current = toCurrentRoadmap(
      roadmap,
      new Map([["s1", "COMPLETED" as const]]),
    );

    expect(
      current.phases[0].steps.map((step) => [step.stepId, step.progress]),
    ).toEqual([
      ["s1", "COMPLETED"],
      ["s2", null],
    ]);
  });

  it("sends the real identifiers", () => {
    const current = toCurrentRoadmap(roadmap, new Map());

    expect(current.phases.map((phase) => phase.phaseId)).toEqual(["p1", "p2"]);
  });

  it("gives a phase with no duration one week, which the provider requires", () => {
    expect(toCurrentRoadmap(roadmap, new Map()).phases[1].estimatedWeeks).toBe(
      1,
    );
  });
});

describe("contentKey and allSteps", () => {
  it("builds one key from a type and an identifier, and none from half of one", () => {
    expect(contentKey("COURSE", "c-1")).toBe("COURSE:c-1");
    expect(contentKey("COURSE", null)).toBeNull();
    expect(contentKey(null, "c-1")).toBeNull();
  });

  it("lists every step across phases", () => {
    expect(allSteps(toEditableRoadmap(row)).map((step) => step.id)).toEqual([
      "s1",
      "s2",
      "s4",
    ]);
  });
});
