import {
  LearningBudgetPreference,
  LearningFormat,
  SkillLevel,
} from "@prisma/client";

import { changedDraftFields } from "./roadmap-draft-diff.util";

import type { RoadmapDraftFields } from "@professional/types/professional-roadmap-chat.types";

const base: RoadmapDraftFields = {
  goal: "Learn Python",
  targetRole: null,
  goalReason: null,
  context: null,
  targetDate: new Date("2027-01-01T00:00:00.000Z"),
  skillLevel: SkillLevel.BEGINNER,
  timeCommitment: null,
  budgetPreference: LearningBudgetPreference.FREE_ONLY,
  subjects: ["a", "b"],
  preferredFormats: [LearningFormat.COURSE, LearningFormat.VIDEO],
  preferredContentTypes: [],
  preferredDeliveryFormats: [],
  cpdEnabled: false,
  cpdAnswered: true,
  certificationId: null,
  certificationName: null,
  requiredCredits: null,
  completedCredits: null,
};

describe("changedDraftFields", () => {
  it("reports nothing for identical drafts", () => {
    expect(changedDraftFields(base, { ...base })).toEqual([]);
  });

  it("names each field that differs, in a fixed order", () => {
    expect(
      changedDraftFields(base, {
        ...base,
        budgetPreference: LearningBudgetPreference.UNDER_100,
        goal: "Learn Go",
        cpdEnabled: true,
      }),
    ).toEqual(["goal", "cpdEnabled", "budgetPreference"]);
  });

  it("ignores the order of a list", () => {
    expect(
      changedDraftFields(base, {
        ...base,
        subjects: ["b", "a"],
        preferredFormats: [LearningFormat.VIDEO, LearningFormat.COURSE],
      }),
    ).toEqual([]);
  });

  it("sees a list that gained or lost a member", () => {
    expect(changedDraftFields(base, { ...base, subjects: ["a"] })).toEqual([
      "subjects",
    ]);
    expect(
      changedDraftFields(base, { ...base, subjects: ["a", "b", "c"] }),
    ).toEqual(["subjects"]);
  });

  it("compares dates by moment", () => {
    expect(
      changedDraftFields(base, {
        ...base,
        targetDate: new Date("2027-01-01T00:00:00.000Z"),
      }),
    ).toEqual([]);
    expect(
      changedDraftFields(base, {
        ...base,
        targetDate: new Date("2027-02-01T00:00:00.000Z"),
      }),
    ).toEqual(["targetDate"]);
    expect(changedDraftFields(base, { ...base, targetDate: null })).toEqual([
      "targetDate",
    ]);
  });

  it("treats an empty string and a missing value alike, and ignores surrounding space", () => {
    expect(
      changedDraftFields(
        { ...base, goalReason: "" },
        { ...base, goalReason: null },
      ),
    ).toEqual([]);
    expect(
      changedDraftFields(
        { ...base, goal: "Learn Python" },
        { ...base, goal: " Learn Python " },
      ),
    ).toEqual([]);
  });

  it("ignores fields that do not shape the roadmap", () => {
    expect(
      changedDraftFields(base, {
        ...base,
        cpdAnswered: false,
        certificationId: "c",
        requiredCredits: 10,
        completedCredits: 2,
        preferredDeliveryFormats: [],
      }),
    ).toEqual([]);
  });
});
