import { LearningBudgetPreference, LearningFormat } from "@prisma/client";
import { LearningTimeCommitment, SkillLevel } from "@prisma/client";
import { DeliveryFormat } from "@prisma/client";

import type { RoadmapDraftFields } from "@professional/types/professional-roadmap-chat.types";

import {
  firstMissingPreferenceField,
  isPreferenceFieldAnswered,
  PREFERENCE_FIELD_ORDER,
} from "./roadmap-preference-fields.util";

const emptyFields: RoadmapDraftFields = {
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
  preferredDeliveryFormats: [],
  cpdEnabled: false,
  certificationId: null,
  certificationName: null,
  requiredCredits: null,
  completedCredits: null,
};

describe("firstMissingPreferenceField", () => {
  it("starts with skill level, matching the old wizard's own order", () => {
    expect(firstMissingPreferenceField(emptyFields)).toBe("skillLevel");
  });

  it("moves to the next field once the current one is answered", () => {
    expect(
      firstMissingPreferenceField({
        ...emptyFields,
        skillLevel: SkillLevel.INTERMEDIATE,
      }),
    ).toBe("subjects");
    expect(
      firstMissingPreferenceField({
        ...emptyFields,
        skillLevel: SkillLevel.INTERMEDIATE,
        subjects: ["term-1"],
      }),
    ).toBe("preferredFormats");
  });

  it("returns null once every preference sub-field is answered", () => {
    const complete: RoadmapDraftFields = {
      ...emptyFields,
      skillLevel: SkillLevel.INTERMEDIATE,
      subjects: ["term-1"],
      preferredFormats: [LearningFormat.COURSE],
      timeCommitment: LearningTimeCommitment.THREE_TO_FIVE_HOURS,
      preferredDeliveryFormats: [DeliveryFormat.ONLINE],
      budgetPreference: LearningBudgetPreference.UNDER_100,
    };
    expect(firstMissingPreferenceField(complete)).toBeNull();
  });

  it("covers every field in PREFERENCE_FIELD_ORDER, in order", () => {
    let draft = emptyFields;
    for (const field of PREFERENCE_FIELD_ORDER) {
      expect(firstMissingPreferenceField(draft)).toBe(field);
      expect(isPreferenceFieldAnswered(draft, field)).toBe(false);
      draft = {
        ...draft,
        skillLevel:
          field === "skillLevel" ? SkillLevel.BEGINNER : draft.skillLevel,
        subjects: field === "subjects" ? ["term-1"] : draft.subjects,
        preferredFormats:
          field === "preferredFormats"
            ? [LearningFormat.COURSE]
            : draft.preferredFormats,
        timeCommitment:
          field === "timeCommitment"
            ? LearningTimeCommitment.ONE_TO_TWO_HOURS
            : draft.timeCommitment,
        preferredDeliveryFormats:
          field === "preferredDeliveryFormats"
            ? [DeliveryFormat.ONLINE]
            : draft.preferredDeliveryFormats,
        budgetPreference:
          field === "budgetPreference"
            ? LearningBudgetPreference.FREE_ONLY
            : draft.budgetPreference,
      };
      expect(isPreferenceFieldAnswered(draft, field)).toBe(true);
    }
    expect(firstMissingPreferenceField(draft)).toBeNull();
  });
});
