import { RoadmapDraftFieldKey } from "@professional/enums/roadmap-draft.enum";

import { resolveWidgetAnswer } from "./roadmap-widget-answer.util";

describe("resolveWidgetAnswer", () => {
  it("returns nothing when no structured answer was sent", () => {
    expect(resolveWidgetAnswer({})).toBeNull();
    expect(
      resolveWidgetAnswer({ answerField: null, answerValue: null }),
    ).toBeNull();
  });

  it.each([
    [RoadmapDraftFieldKey.SKILL_LEVEL, "ADVANCED", { skillLevel: "ADVANCED" }],
    [
      RoadmapDraftFieldKey.TIME_COMMITMENT,
      "MORE_THAN_FIVE_HOURS",
      { timeCommitment: "MORE_THAN_FIVE_HOURS" },
    ],
    [
      RoadmapDraftFieldKey.BUDGET_PREFERENCE,
      "HUNDRED_TO_500",
      { budgetPreference: "HUNDRED_TO_500" },
    ],
  ])("keeps the platform value chosen for %s", (field, value, expected) => {
    expect(
      resolveWidgetAnswer({ answerField: field, answerValue: value }),
    ).toEqual(expected);
  });

  it('reads the CPD "true" and "false" options as booleans', () => {
    expect(
      resolveWidgetAnswer({
        answerField: RoadmapDraftFieldKey.CPD_ENABLED,
        answerValue: "true",
      }),
    ).toEqual({ cpdEnabled: true, cpdAnswered: true });
    expect(
      resolveWidgetAnswer({
        answerField: RoadmapDraftFieldKey.CPD_ENABLED,
        answerValue: "false",
      }),
    ).toEqual({ cpdEnabled: false, cpdAnswered: true });
  });

  it.each([
    [RoadmapDraftFieldKey.TIME_COMMITMENT, "FOUR_TO_SIX_HOURS"],
    [RoadmapDraftFieldKey.BUDGET_PREFERENCE, "PREMIUM"],
    [RoadmapDraftFieldKey.SKILL_LEVEL, "guru"],
    [RoadmapDraftFieldKey.CPD_ENABLED, "yes"],
    [RoadmapDraftFieldKey.GOAL, "anything"],
  ])("rejects %s with the value %s", (field, value) => {
    expect(
      resolveWidgetAnswer({ answerField: field, answerValue: value }),
    ).toBe("invalid");
  });

  it("rejects a field without a value and a value without a field", () => {
    expect(
      resolveWidgetAnswer({ answerField: RoadmapDraftFieldKey.SKILL_LEVEL }),
    ).toBe("invalid");
    expect(resolveWidgetAnswer({ answerValue: "ADVANCED" })).toBe("invalid");
  });
});
