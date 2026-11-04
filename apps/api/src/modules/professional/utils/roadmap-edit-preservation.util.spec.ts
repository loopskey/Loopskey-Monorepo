import { RoadmapGenerationViolation } from "./roadmap-generation-verify.util";
import { toEditableRoadmap } from "./roadmap-edit-shape.util";
import {
  FULL_PRESERVATION,
  preservedContent,
  protectedStepsOf,
  unaffectedPhaseIds,
  unidentifiableProtectedSteps,
  verifyPreservation,
} from "./roadmap-edit-preservation.util";

import type { RoadmapChangeOperation } from "@infrastructure/service-ai/service-ai.port";

const roadmap = toEditableRoadmap({
  id: "roadmap-1",
  title: "Python",
  phases: [
    {
      id: "p1",
      order: 1,
      title: "A",
      steps: [
        {
          id: "s1",
          order: 1,
          title: "one",
          contentId: "c-1",
          contentType: "COURSE",
        },
        {
          id: "s2",
          order: 2,
          title: "two",
          contentId: "c-2",
          contentType: "COURSE",
        },
        { id: "s3", order: 3, title: "practice" },
      ],
    },
    {
      id: "p2",
      order: 2,
      title: "B",
      steps: [
        {
          id: "s4",
          order: 1,
          title: "four",
          contentId: "y-1",
          contentType: "YOUTUBE",
        },
      ],
    },
    {
      id: "p3",
      order: 3,
      title: "C",
      steps: [
        {
          id: "s5",
          order: 1,
          title: "five",
          contentId: "e-1",
          contentType: "EVENT",
        },
      ],
    },
  ],
});

const progress = new Map<string, "COMPLETED" | "IN_PROGRESS">([
  ["s1", "COMPLETED"],
  ["s2", "IN_PROGRESS"],
]);

const op = (
  operation: RoadmapChangeOperation["operation"],
  targetId: string | null,
): RoadmapChangeOperation => ({ operation, targetId, instruction: "Do it." });

describe("protectedStepsOf", () => {
  it("protects completed and in-progress steps and leaves untouched ones alone", () => {
    expect(
      protectedStepsOf(roadmap, progress).map((step) => step.stepId),
    ).toEqual(["s1", "s2"]);
  });

  it("describes a protected step by its catalog identity", () => {
    expect(protectedStepsOf(roadmap, progress)[0]).toMatchObject({
      stepId: "s1",
      key: "COURSE:c-1",
      contentId: "c-1",
      contentType: "COURSE",
    });
  });

  it("honours a policy that does not protect in-progress steps", () => {
    const policy = { ...FULL_PRESERVATION, inProgressSteps: false };

    expect(
      protectedStepsOf(roadmap, progress, policy).map((step) => step.stepId),
    ).toEqual(["s1"]);
  });

  it("honours a policy that does not protect completed steps", () => {
    const policy = { ...FULL_PRESERVATION, completedSteps: false };

    expect(
      protectedStepsOf(roadmap, progress, policy).map((step) => step.stepId),
    ).toEqual(["s2"]);
  });

  it("protects nothing for a learner who has not started", () => {
    expect(protectedStepsOf(roadmap, new Map())).toEqual([]);
  });
});

describe("unidentifiableProtectedSteps", () => {
  it("finds protected steps that have no catalog identity to match on", () => {
    const withPractice = new Map(progress).set("s3", "COMPLETED");

    expect(
      unidentifiableProtectedSteps(protectedStepsOf(roadmap, withPractice)).map(
        (step) => step.stepId,
      ),
    ).toEqual(["s3"]);
  });

  it("finds none when every protected step has content", () => {
    expect(
      unidentifiableProtectedSteps(protectedStepsOf(roadmap, progress)),
    ).toEqual([]);
  });
});

describe("unaffectedPhaseIds", () => {
  it("leaves every phase the changes do not name", () => {
    expect(
      unaffectedPhaseIds(roadmap, [op("MODIFY_PHASE", "p1")], false),
    ).toEqual(["p2", "p3"]);
  });

  it("counts the phase that holds a changed step as affected", () => {
    expect(
      unaffectedPhaseIds(
        roadmap,
        [op("MODIFY_STEP", "s4"), op("REMOVE_STEP", "s5")],
        false,
      ),
    ).toEqual(["p1"]);
  });

  it("counts the phase an added step is anchored to as affected", () => {
    expect(unaffectedPhaseIds(roadmap, [op("ADD_STEP", "p3")], false)).toEqual([
      "p1",
      "p2",
    ]);
  });

  it.each(["MODIFY_ROADMAP", "REBUILD_ROADMAP", "UPDATE_DRAFT"] as const)(
    "holds no phase unaffected when the change is %s",
    (kind) => {
      expect(
        unaffectedPhaseIds(
          roadmap,
          [op("MODIFY_PHASE", "p1"), op(kind, null)],
          false,
        ),
      ).toEqual([]);
    },
  );

  it("holds no phase unaffected when a preference was edited in the sidebar", () => {
    expect(
      unaffectedPhaseIds(roadmap, [op("MODIFY_PHASE", "p1")], true),
    ).toEqual([]);
  });

  it("leaves every phase when only an anchor-less addition is requested", () => {
    expect(unaffectedPhaseIds(roadmap, [op("ADD_PHASE", null)], false)).toEqual(
      ["p1", "p2", "p3"],
    );
  });
});

describe("preservedContent", () => {
  const keys = (content: { contentType: string; contentId: string }[]) =>
    content.map((entry) => `${entry.contentType}:${entry.contentId}`).sort();

  it("keeps protected content and the content of phases nobody touched", () => {
    const content = preservedContent(
      roadmap,
      protectedStepsOf(roadmap, progress),
      ["p3"],
      false,
    );

    expect(keys(content)).toEqual(["COURSE:c-1", "COURSE:c-2", "EVENT:e-1"]);
  });

  it("keeps all of the learner's current content when told to retain everything", () => {
    const content = preservedContent(roadmap, [], [], true);

    expect(keys(content)).toEqual([
      "COURSE:c-1",
      "COURSE:c-2",
      "EVENT:e-1",
      "YOUTUBE:y-1",
    ]);
  });

  it("keeps nothing for a learner with no progress and no untouched phase", () => {
    expect(preservedContent(roadmap, [], [], false)).toEqual([]);
  });

  it("never lists a step that has no catalog identity", () => {
    expect(keys(preservedContent(roadmap, [], ["p1"], false))).toEqual([
      "COURSE:c-1",
      "COURSE:c-2",
    ]);
  });
});

describe("verifyPreservation", () => {
  const generated = (...ids: [string, string][]) => [
    {
      steps: ids.map(([contentType, contentId]) => ({
        contentType,
        contentId,
      })),
    },
  ];
  const run = (
    produced: {
      steps: { contentType: string | null; contentId: string | null }[];
    }[],
    unaffected: string[] = [],
  ) =>
    verifyPreservation({
      roadmap,
      protectedSteps: protectedStepsOf(roadmap, progress),
      unaffected,
      generated: produced,
    });

  it("passes when every protected item is still there, in any position", () => {
    expect(
      run(generated(["COURSE", "c-9"], ["COURSE", "c-2"], ["COURSE", "c-1"])),
    ).toEqual({ ok: true });
  });

  it.each([
    [generated(["COURSE", "c-2"]), "COURSE:c-1"],
    [generated(["COURSE", "c-1"]), "COURSE:c-2"],
    [generated(["COURSE", "c-9"]), "COURSE:c-1"],
  ])("fails when a protected item is dropped", (produced, offending) => {
    expect(run(produced)).toEqual({
      ok: false,
      violation: RoadmapGenerationViolation.PROTECTED_CONTENT_DROPPED,
      offending,
    });
  });

  it("matches on type as well as identifier", () => {
    expect(run(generated(["EVENT", "c-1"], ["COURSE", "c-2"]))).toMatchObject({
      ok: false,
      offending: "COURSE:c-1",
    });
  });

  it("fails when a phase nobody touched loses content", () => {
    expect(
      run(generated(["COURSE", "c-1"], ["COURSE", "c-2"]), ["p2"]),
    ).toEqual({
      ok: false,
      violation: RoadmapGenerationViolation.UNAFFECTED_PHASE_CHANGED,
      offending: "YOUTUBE:y-1",
    });
  });

  it("passes when the untouched phase keeps its content", () => {
    expect(
      run(generated(["COURSE", "c-1"], ["COURSE", "c-2"], ["YOUTUBE", "y-1"]), [
        "p2",
      ]),
    ).toEqual({ ok: true });
  });

  it("ignores generated steps that have no content", () => {
    const produced = [
      {
        steps: [
          { contentType: null, contentId: null },
          { contentType: "COURSE", contentId: "c-1" },
          { contentType: "COURSE", contentId: "c-2" },
        ],
      },
    ];

    expect(run(produced)).toEqual({ ok: true });
  });
});
