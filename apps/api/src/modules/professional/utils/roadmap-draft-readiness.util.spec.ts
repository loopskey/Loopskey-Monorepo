import { RoadmapDraftStep, SkillLevel } from "@prisma/client";
import {
  LearningBudgetPreference,
  LearningTimeCommitment,
} from "@prisma/client";

import {
  getRoadmapDraftContractReadiness,
  roadmapContractProgress,
  stepOfFirstMissingField,
} from "./roadmap-draft-readiness.util";

const complete = {
  goal: "become a data lead",
  skillLevel: SkillLevel.BEGINNER,
  timeCommitment: LearningTimeCommitment.THREE_TO_FIVE_HOURS,
  subjects: ["term-data"],
  budgetPreference: LearningBudgetPreference.FREE_ONLY,
  cpdEnabled: false,
  cpdAnswered: true,
  certificationName: null,
};

describe("getRoadmapDraftContractReadiness", () => {
  it("accepts a draft with every mandatory field and CPD answered no", () => {
    expect(getRoadmapDraftContractReadiness(complete)).toMatchObject({
      isValid: true,
      missingFields: [],
      requiredFieldCount: 6,
      completedFieldCount: 6,
    });
  });

  it("lists every missing field in a fixed order", () => {
    const readiness = getRoadmapDraftContractReadiness({
      ...complete,
      goal: "   ",
      skillLevel: null,
      timeCommitment: null,
      subjects: [],
      budgetPreference: null,
      cpdAnswered: false,
    });

    expect(readiness.missingFields).toEqual([
      "goal",
      "skillLevel",
      "timeCommitment",
      "subjects",
      "budgetPreference",
      "cpdAnswered",
    ]);
    expect(readiness.isValid).toBe(false);
    expect(readiness.completedFieldCount).toBe(0);
  });

  it("is invalid without a budget preference", () => {
    expect(
      getRoadmapDraftContractReadiness({ ...complete, budgetPreference: null }),
    ).toMatchObject({
      isValid: false,
      missingFields: ["budgetPreference"],
      completedFieldCount: 5,
    });
  });

  it("is invalid while the CPD question is unanswered", () => {
    expect(
      getRoadmapDraftContractReadiness({ ...complete, cpdAnswered: false }),
    ).toMatchObject({
      isValid: false,
      missingFields: ["cpdAnswered"],
      requiredFieldCount: 6,
    });
  });

  it("treats an explicit CPD no as a valid answer", () => {
    expect(
      getRoadmapDraftContractReadiness({
        ...complete,
        cpdEnabled: false,
        cpdAnswered: true,
      }).isValid,
    ).toBe(true);
  });

  it("requires the certification name only after CPD tracking is answered yes", () => {
    expect(
      getRoadmapDraftContractReadiness({
        ...complete,
        cpdEnabled: true,
        cpdAnswered: true,
      }),
    ).toMatchObject({
      isValid: false,
      missingFields: ["certificationName"],
      requiredFieldCount: 7,
      completedFieldCount: 6,
    });
    expect(
      getRoadmapDraftContractReadiness({
        ...complete,
        cpdEnabled: true,
        certificationName: "PMP",
      }),
    ).toMatchObject({
      isValid: true,
      requiredFieldCount: 7,
      completedFieldCount: 7,
    });
  });

  it("treats a blank certification name as missing", () => {
    expect(
      getRoadmapDraftContractReadiness({
        ...complete,
        cpdEnabled: true,
        certificationName: "  ",
      }).missingFields,
    ).toEqual(["certificationName"]);
  });

  it("treats empty subjects as a missing subject", () => {
    expect(
      getRoadmapDraftContractReadiness({ ...complete, subjects: [] }),
    ).toMatchObject({ isValid: false, missingFields: ["subjects"] });
  });

  it("accepts one or more subjects", () => {
    expect(
      getRoadmapDraftContractReadiness({
        ...complete,
        subjects: ["term-data", "term-tax"],
      }).isValid,
    ).toBe(true);
  });

  it("counts four of six with a missing budget and an unanswered CPD question", () => {
    expect(
      getRoadmapDraftContractReadiness({
        ...complete,
        budgetPreference: null,
        cpdAnswered: false,
      }),
    ).toMatchObject({
      isValid: false,
      completedFieldCount: 4,
      requiredFieldCount: 6,
      missingFields: ["budgetPreference", "cpdAnswered"],
    });
  });

  it("counts five of six with a missing subject", () => {
    expect(
      getRoadmapDraftContractReadiness({ ...complete, subjects: [] }),
    ).toMatchObject({ completedFieldCount: 5, requiredFieldCount: 6 });
  });
});

describe("subjects checked against the taxonomy", () => {
  const known = new Set(["term-data"]);

  it("counts only the stored subjects the taxonomy knows", () => {
    expect(
      getRoadmapDraftContractReadiness(
        { ...complete, subjects: ["term-data", "stale"] },
        known,
      ).isValid,
    ).toBe(true);
  });

  it("treats a draft whose subjects are all unknown as missing its subjects", () => {
    expect(
      getRoadmapDraftContractReadiness(
        { ...complete, subjects: ["raw text from an old draft"] },
        known,
      ),
    ).toMatchObject({ isValid: false, missingFields: ["subjects"] });
  });

  it("trusts the stored subjects when no taxonomy is supplied", () => {
    expect(
      getRoadmapDraftContractReadiness({ ...complete, subjects: ["stale"] })
        .isValid,
    ).toBe(true);
  });

  it("carries the check into the progress counts", () => {
    expect(
      roadmapContractProgress({ ...complete, subjects: ["stale"] }, known),
    ).toMatchObject({
      completedFieldCount: 5,
      remainingFields: [RoadmapDraftStep.PREFERENCES],
    });
  });
});

describe("roadmapContractProgress", () => {
  it("collapses the preference fields into one remaining step", () => {
    expect(
      roadmapContractProgress({
        ...complete,
        skillLevel: null,
        subjects: [],
      }),
    ).toEqual({
      missingFields: ["skillLevel", "subjects"],
      requiredFieldCount: 6,
      completedFieldCount: 4,
      remainingFields: [RoadmapDraftStep.PREFERENCES],
    });
  });
});

describe("stepOfFirstMissingField", () => {
  it("maps the first missing field to its stage and none to null", () => {
    expect(stepOfFirstMissingField(["goal", "subjects"])).toBe(
      RoadmapDraftStep.GOAL,
    );
    expect(stepOfFirstMissingField(["certificationName"])).toBe(
      RoadmapDraftStep.CERTIFICATION,
    );
    expect(stepOfFirstMissingField(["budgetPreference"])).toBe(
      RoadmapDraftStep.PREFERENCES,
    );
    expect(stepOfFirstMissingField(["cpdAnswered"])).toBe(
      RoadmapDraftStep.CPD_TRACKING,
    );
    expect(stepOfFirstMissingField([])).toBeNull();
  });
});
