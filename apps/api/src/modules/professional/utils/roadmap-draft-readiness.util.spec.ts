import { RoadmapDraftStep, SkillLevel } from "@prisma/client";
import { LearningTimeCommitment } from "@prisma/client";

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
  cpdEnabled: false,
  certificationName: null,
};

describe("getRoadmapDraftContractReadiness", () => {
  it("accepts a draft holding the four contract fields", () => {
    expect(getRoadmapDraftContractReadiness(complete)).toMatchObject({
      isValid: true,
      missingFields: [],
      requiredFieldCount: 4,
      completedFieldCount: 4,
    });
  });

  it("lists every missing field in a fixed order", () => {
    const readiness = getRoadmapDraftContractReadiness({
      ...complete,
      goal: "   ",
      skillLevel: null,
      timeCommitment: null,
      subjects: [],
    });

    expect(readiness.missingFields).toEqual([
      "goal",
      "skillLevel",
      "timeCommitment",
      "subjects",
    ]);
    expect(readiness.isValid).toBe(false);
  });

  it("requires the certification name only while CPD tracking is on", () => {
    expect(
      getRoadmapDraftContractReadiness({ ...complete, cpdEnabled: false })
        .isValid,
    ).toBe(true);
    expect(
      getRoadmapDraftContractReadiness({ ...complete, cpdEnabled: true }),
    ).toMatchObject({
      isValid: false,
      missingFields: ["certificationName"],
      requiredFieldCount: 5,
    });
    expect(
      getRoadmapDraftContractReadiness({
        ...complete,
        cpdEnabled: true,
        certificationName: "PMP",
      }).isValid,
    ).toBe(true);
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
      completedFieldCount: 3,
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
      requiredFieldCount: 4,
      completedFieldCount: 2,
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
    expect(stepOfFirstMissingField([])).toBeNull();
  });
});
