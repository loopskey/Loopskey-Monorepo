import { ContentType, LearningFormat, SkillLevel } from "@prisma/client";

import type { RoadmapDraftFields } from "@professional/types/professional-roadmap-chat.types";

import { mergeExtractedFields } from "./roadmap-draft-merge.util";

const SUBJECT_OPTIONS = [
  { id: "term-leadership", label: "Leadership" },
  { id: "term-data", label: "Data Analysis" },
];

const draft = (
  overrides: Partial<RoadmapDraftFields> = {},
): RoadmapDraftFields => ({
  goal: null,
  targetRole: null,
  goalReason: null,
  context: null,
  targetDate: null,
  skillLevel: null,
  timeCommitment: null,
  budgetPreference: null,
  subjects: [],
  preferredFormats: [],
  preferredContentTypes: [],
  cpdEnabled: false,
  certificationId: null,
  certificationName: null,
  requiredCredits: null,
  completedCredits: null,
  ...overrides,
});

const merge = (
  current: RoadmapDraftFields,
  extracted: Parameters<typeof mergeExtractedFields>[0]["extracted"],
  cleared: Parameters<typeof mergeExtractedFields>[0]["cleared"] = [],
) =>
  mergeExtractedFields({
    current,
    extracted,
    cleared,
    subjectOptions: SUBJECT_OPTIONS,
  });

describe("roadmap draft merge rules", () => {
  it("replaces a held value with the one the turn extracted", () => {
    const { changes } = merge(draft({ goal: "become a lead" }), {
      goal: "become a principal",
    });

    expect(changes.goal).toBe("become a principal");
  });

  it("keeps the stored value when the turn returns the field as null", () => {
    const { changes, answered } = merge(draft({ goal: "become a lead" }), {
      goal: null,
    });

    expect(changes).not.toHaveProperty("goal");
    expect(answered.has("goal")).toBe(false);
  });

  it("keeps the stored value when the turn omits the field entirely", () => {
    const { changes } = merge(draft({ goal: "become a lead" }), {});

    expect(changes).not.toHaveProperty("goal");
  });

  it("never reads null as a clear, even for a field with a falsy empty form", () => {
    const { changes } = merge(draft({ subjects: ["term-data"] }), {
      subjects: null,
    });

    expect(changes).not.toHaveProperty("subjects");
  });

  it("removes a field the turn named as retracted", () => {
    const target = new Date("2027-01-01T00:00:00.000Z");
    const { changes, answered } = merge(draft({ targetDate: target }), {}, [
      "targetDate",
    ]);

    expect(changes.targetDate).toBeNull();
    expect(answered.has("targetDate")).toBe(true);
  });

  it("empties rather than nulls an array column that was retracted", () => {
    const { changes } = merge(
      draft({ preferredFormats: [LearningFormat.COURSE] }),
      {},
      ["preferredFormats"],
    );

    expect(changes.preferredFormats).toEqual([]);
  });

  it("treats an absent cleared list as clearing nothing", () => {
    const { changes } = merge(draft({ goal: "become a lead" }), {}, []);

    expect(changes).toEqual({});
  });

  it("lets a retraction win over an extraction of the same field", () => {
    const { changes } = merge(draft({ goal: "become a lead" }), { goal: "x" }, [
      "goal",
    ]);

    expect(changes.goal).toBeNull();
  });

  it("takes the catalogue link and its credits down with a retracted name", () => {
    const { changes } = merge(
      draft({
        certificationName: "PMP",
        certificationId: "cert-1",
        requiredCredits: 60,
        completedCredits: 12,
      }),
      {},
      ["certificationName"],
    );

    expect(changes).toMatchObject({
      certificationName: null,
      certificationId: null,
      requiredCredits: null,
      completedCredits: null,
    });
  });

  it("stores a subject named by its displayed label as its identifier", () => {
    const { changes } = merge(draft(), { subjects: ["Leadership"] });

    expect(changes.subjects).toEqual(["term-leadership"]);
  });

  it("matches a label without regard to case or surrounding space", () => {
    const { changes } = merge(draft(), { subjects: ["  data analysis  "] });

    expect(changes.subjects).toEqual(["term-data"]);
  });

  it("passes an identifier through untouched", () => {
    const { changes } = merge(draft(), { subjects: ["term-data"] });

    expect(changes.subjects).toEqual(["term-data"]);
  });

  it("keeps a subject it cannot resolve rather than dropping the answer", () => {
    const { changes } = merge(draft(), { subjects: ["Underwater Basketry"] });

    expect(changes.subjects).toEqual(["Underwater Basketry"]);
  });

  it("merges several fields from a single turn", () => {
    const { changes, answered } = merge(draft(), {
      goal: "become a lead",
      skillLevel: SkillLevel.INTERMEDIATE,
      preferredContentTypes: [ContentType.COURSE],
    });

    expect(changes).toEqual({
      goal: "become a lead",
      skillLevel: SkillLevel.INTERMEDIATE,
      preferredContentTypes: [ContentType.COURSE],
    });
    expect([...answered].sort()).toEqual([
      "goal",
      "preferredContentTypes",
      "skillLevel",
    ]);
  });

  it("reports a field the turn spoke about even when the value is unchanged", () => {
    const { changes, answered } = merge(draft({ cpdEnabled: false }), {
      cpdEnabled: false,
    });

    expect(changes).toEqual({});
    expect(answered.has("cpdEnabled")).toBe(true);
  });

  it("does not restate a date that already matches", () => {
    const target = new Date("2027-01-01T00:00:00.000Z");
    const { changes } = merge(draft({ targetDate: target }), {
      targetDate: new Date("2027-01-01T00:00:00.000Z"),
    });

    expect(changes).toEqual({});
  });

  it("does not restate an array whose contents already match", () => {
    const { changes } = merge(draft({ subjects: ["term-data"] }), {
      subjects: ["term-data"],
    });

    expect(changes).toEqual({});
  });
});
