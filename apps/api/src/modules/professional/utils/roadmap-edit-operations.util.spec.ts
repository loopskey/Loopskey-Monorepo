import { SERVICE_AI_LIMITS } from "@infrastructure/service-ai/service-ai.port";

import {
  parseStoredOperations,
  validateChangeOperations,
} from "./roadmap-edit-operations.util";
import { toEditableRoadmap } from "./roadmap-edit-shape.util";

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
        { id: "s1", order: 1, title: "x" },
        { id: "s2", order: 2, title: "y" },
      ],
    },
    {
      id: "p2",
      order: 2,
      title: "B",
      steps: [{ id: "s3", order: 1, title: "z" }],
    },
  ],
});

const op = (
  operation: RoadmapChangeOperation["operation"],
  targetId: string | null,
  instruction = "Change it.",
): RoadmapChangeOperation => ({ operation, targetId, instruction });

const validate = (
  operations: RoadmapChangeOperation[],
  progress: [string, "COMPLETED" | "IN_PROGRESS"][] = [],
) => validateChangeOperations(operations, roadmap, new Map(progress));

describe("validateChangeOperations", () => {
  it.each([
    op("MODIFY_ROADMAP", null),
    op("MODIFY_ROADMAP", "roadmap-1"),
    op("REBUILD_ROADMAP", null),
    op("ADD_PHASE", null),
    op("ADD_PHASE", "p1"),
    op("MODIFY_PHASE", "p2"),
    op("REMOVE_PHASE", "p2"),
    op("ADD_STEP", null),
    op("ADD_STEP", "p1"),
    op("ADD_STEP", "s1"),
    op("MODIFY_STEP", "s3"),
    op("REMOVE_STEP", "s3"),
    op("UPDATE_DRAFT", null),
    op("UPDATE_DRAFT", "available_time"),
    op("UPDATE_DRAFT", "cpd_enabled"),
  ])("accepts $operation aimed at $targetId", (operation) => {
    expect(validate([operation])).toEqual({
      accepted: [operation],
      rejected: [],
    });
  });

  it.each([
    [op("MODIFY_PHASE", null), "TARGET_REQUIRED"],
    [op("REMOVE_PHASE", null), "TARGET_REQUIRED"],
    [op("MODIFY_STEP", null), "TARGET_REQUIRED"],
    [op("REMOVE_STEP", null), "TARGET_REQUIRED"],
    [op("MODIFY_PHASE", "nope"), "UNKNOWN_TARGET"],
    [op("MODIFY_PHASE", "s1"), "UNKNOWN_TARGET"],
    [op("MODIFY_STEP", "p1"), "UNKNOWN_TARGET"],
    [op("ADD_PHASE", "s1"), "UNKNOWN_TARGET"],
    [op("ADD_STEP", "nope"), "UNKNOWN_TARGET"],
    [op("MODIFY_ROADMAP", "roadmap-2"), "UNKNOWN_TARGET"],
    [op("UPDATE_DRAFT", "password"), "UNKNOWN_TARGET"],
    [
      op(
        "MODIFY_PHASE",
        "x".repeat(SERVICE_AI_LIMITS.changeTargetIdMaxLength + 1),
      ),
      "UNKNOWN_TARGET",
    ],
    [op("MODIFY_PHASE", "p1", ""), "BLANK_INSTRUCTION"],
    [op("MODIFY_PHASE", "p1", "  \n "), "BLANK_INSTRUCTION"],
    [
      op(
        "MODIFY_PHASE",
        "p1",
        "x".repeat(SERVICE_AI_LIMITS.changeInstructionMaxLength + 1),
      ),
      "INSTRUCTION_TOO_LONG",
    ],
  ])("rejects %j as %s", (operation, reason) => {
    expect(validate([operation])).toEqual({
      accepted: [],
      rejected: [{ operation, reason }],
    });
  });

  it("protects steps and phases that hold progress", () => {
    const progress: [string, "COMPLETED" | "IN_PROGRESS"][] = [
      ["s1", "COMPLETED"],
      ["s3", "IN_PROGRESS"],
    ];

    expect(
      validate([op("REMOVE_STEP", "s1")], progress).rejected[0].reason,
    ).toBe("PROTECTED_STEP");
    expect(
      validate([op("MODIFY_STEP", "s3")], progress).rejected[0].reason,
    ).toBe("PROTECTED_STEP");
    expect(
      validate([op("REMOVE_PHASE", "p1")], progress).rejected[0].reason,
    ).toBe("PROTECTED_STEP");
    expect(
      validate([op("MODIFY_PHASE", "p1")], progress).accepted,
    ).toHaveLength(1);
    expect(validate([op("REMOVE_STEP", "s2")], progress).accepted).toHaveLength(
      1,
    );
    expect(validate([op("ADD_STEP", "s1")], progress).accepted).toHaveLength(1);
  });

  it("drops an exact repeat but keeps two different instructions for one target", () => {
    const result = validate([
      op("MODIFY_PHASE", "p1", "Make it practical."),
      op("MODIFY_PHASE", "p1", "  Make it practical.  "),
      op("MODIFY_PHASE", "p1", "Make it shorter."),
    ]);

    expect(result.accepted.map((entry) => entry.instruction)).toEqual([
      "Make it practical.",
      "Make it shorter.",
    ]);
    expect(result.rejected).toEqual([]);
  });

  it("trims the instruction it keeps", () => {
    expect(
      validate([op("MODIFY_PHASE", "p1", "  tidy  ")]).accepted[0].instruction,
    ).toBe("tidy");
  });

  it("keeps no more than the provider's limit", () => {
    const many = Array.from(
      { length: SERVICE_AI_LIMITS.changeOperationsMaxItems + 2 },
      (_, index) => op("MODIFY_PHASE", "p1", `Change ${index}.`),
    );

    const result = validate(many);

    expect(result.accepted).toHaveLength(
      SERVICE_AI_LIMITS.changeOperationsMaxItems,
    );
    expect(result.rejected.map((entry) => entry.reason)).toEqual([
      "OVER_LIMIT",
      "OVER_LIMIT",
    ]);
  });

  it("judges each operation on its own", () => {
    const good = op("MODIFY_PHASE", "p1");

    const result = validate([op("MODIFY_PHASE", "nope"), good]);

    expect(result.accepted).toEqual([good]);
    expect(result.rejected).toHaveLength(1);
  });

  it("returns nothing for nothing", () => {
    expect(validate([])).toEqual({ accepted: [], rejected: [] });
  });
});

describe("parseStoredOperations", () => {
  it("reads back what was stored", () => {
    const stored = [op("MODIFY_PHASE", "p1"), op("MODIFY_ROADMAP", null)];

    expect(parseStoredOperations(JSON.parse(JSON.stringify(stored)))).toEqual(
      stored,
    );
  });

  it.each([
    null,
    undefined,
    "x",
    3,
    {},
    [null],
    [1],
    [{}],
    [{ operation: "A" }],
    [{ instruction: "x" }],
  ])("treats %j as no changes", (value) => {
    expect(parseStoredOperations(value)).toEqual([]);
  });

  it("reads a missing target as none", () => {
    expect(
      parseStoredOperations([
        { operation: "MODIFY_ROADMAP", instruction: "x" },
      ]),
    ).toEqual([
      { operation: "MODIFY_ROADMAP", targetId: null, instruction: "x" },
    ]);
  });
});
