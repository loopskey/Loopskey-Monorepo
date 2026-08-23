import {
  LearningBudgetPreference,
  LearningTimeCommitment,
  RoadmapDraftStep,
  SkillLevel,
} from "@prisma/client";

import type { RoadmapDraftField } from "@infrastructure/service-ai/service-ai.port";
import type { RoadmapDraftFields } from "@professional/types/professional-roadmap-chat.types";

import {
  STEP_ORDER,
  applicableSteps,
  isDraftComplete,
  nextStep,
} from "./roadmap-step-machine.util";

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

const PREFERENCES_ANSWERED = {
  skillLevel: SkillLevel.INTERMEDIATE,
  timeCommitment: LearningTimeCommitment.FOUR_TO_SIX_HOURS,
  budgetPreference: LearningBudgetPreference.MIXED_FREE_AND_PAID,
  subjects: ["term-data"],
};

const READY_TO_REVIEW = {
  goal: "become a data lead",
  goalReason: "promotion",
  context: "eight years in analytics",
  targetDate: new Date("2027-06-01T00:00:00.000Z"),
  ...PREFERENCES_ANSWERED,
};

const step = (
  fields: Partial<RoadmapDraftFields>,
  currentStep: RoadmapDraftStep = RoadmapDraftStep.GOAL,
  answered: RoadmapDraftField[] = [],
) =>
  nextStep({
    currentStep,
    draft: draft(fields),
    answered: new Set(answered),
  });

describe("roadmap step machine", () => {
  it("opens on the goal", () => {
    expect(step({})).toBe(RoadmapDraftStep.GOAL);
  });

  it("walks the linear path one answer at a time", () => {
    expect(step({ goal: "become a data lead" })).toBe(
      RoadmapDraftStep.GOAL_REASON,
    );
    expect(
      step(
        { goal: "become a data lead", goalReason: "promotion" },
        RoadmapDraftStep.GOAL_REASON,
      ),
    ).toBe(RoadmapDraftStep.CONTEXT);
    expect(
      step(
        {
          goal: "become a data lead",
          goalReason: "promotion",
          context: "eight years in analytics",
        },
        RoadmapDraftStep.CONTEXT,
      ),
    ).toBe(RoadmapDraftStep.TARGET_DATE);
  });

  it("skips every step a single turn satisfied", () => {
    expect(
      step(
        {
          goal: "become a data lead",
          goalReason: "promotion",
          context: "eight years in analytics",
          targetDate: new Date("2027-06-01T00:00:00.000Z"),
          ...PREFERENCES_ANSWERED,
        },
        RoadmapDraftStep.GOAL,
      ),
    ).toBe(RoadmapDraftStep.CPD_TRACKING);
  });

  it("lets a step whose answer is legitimately empty pass once it is answered", () => {
    expect(
      step({ goal: "become a data lead" }, RoadmapDraftStep.GOAL_REASON, [
        "goalReason",
      ]),
    ).toBe(RoadmapDraftStep.CONTEXT);
  });

  it("does not ask an optional step again once the wizard has moved past it", () => {
    expect(
      step({ goal: "become a data lead" }, RoadmapDraftStep.TARGET_DATE),
    ).toBe(RoadmapDraftStep.TARGET_DATE);
  });

  it("holds the preferences step until every preference is present", () => {
    expect(
      step(
        {
          ...READY_TO_REVIEW,
          budgetPreference: null,
        },
        RoadmapDraftStep.PREFERENCES,
      ),
    ).toBe(RoadmapDraftStep.PREFERENCES);
  });

  it("holds the preferences step while no subject has been chosen", () => {
    expect(
      step({ ...READY_TO_REVIEW, subjects: [] }, RoadmapDraftStep.PREFERENCES),
    ).toBe(RoadmapDraftStep.PREFERENCES);
  });

  it("goes straight to review when certification tracking is declined", () => {
    expect(
      step(READY_TO_REVIEW, RoadmapDraftStep.CPD_TRACKING, ["cpdEnabled"]),
    ).toBe(RoadmapDraftStep.REVIEW);
  });

  it("adds the certification steps when tracking is accepted", () => {
    expect(
      step(
        { ...READY_TO_REVIEW, cpdEnabled: true },
        RoadmapDraftStep.CPD_TRACKING,
      ),
    ).toBe(RoadmapDraftStep.CERTIFICATION);
  });

  it("asks for the requirements once a certification is named", () => {
    expect(
      step(
        {
          ...READY_TO_REVIEW,
          cpdEnabled: true,
          certificationName: "PMP",
        },
        RoadmapDraftStep.CERTIFICATION,
      ),
    ).toBe(RoadmapDraftStep.CPD_REQUIREMENTS);
  });

  it("reaches review once the certification requirements are known", () => {
    expect(
      step(
        {
          ...READY_TO_REVIEW,
          cpdEnabled: true,
          certificationName: "PMP",
          requiredCredits: 60,
        },
        RoadmapDraftStep.CPD_REQUIREMENTS,
      ),
    ).toBe(RoadmapDraftStep.REVIEW);
  });

  it("returns to a step whose answer the professional has since retracted", () => {
    expect(
      step({ ...READY_TO_REVIEW, goal: null }, RoadmapDraftStep.REVIEW),
    ).toBe(RoadmapDraftStep.GOAL);
  });

  it("puts the certification branch back when tracking is re-enabled", () => {
    expect(applicableSteps(draft({ cpdEnabled: false }))).not.toContain(
      RoadmapDraftStep.CERTIFICATION,
    );
    expect(applicableSteps(draft({ cpdEnabled: true }))).toEqual(STEP_ORDER);
  });
});

describe("roadmap draft completeness", () => {
  it("is incomplete while a generation field is missing", () => {
    expect(isDraftComplete(draft({ ...READY_TO_REVIEW, goal: null }))).toBe(
      false,
    );
    expect(
      isDraftComplete(draft({ ...READY_TO_REVIEW, targetDate: null })),
    ).toBe(false);
    expect(isDraftComplete(draft({ ...READY_TO_REVIEW, subjects: [] }))).toBe(
      false,
    );
  });

  it("is complete without the prose steps, which colour the plan rather than gate it", () => {
    expect(
      isDraftComplete(
        draft({ ...READY_TO_REVIEW, goalReason: null, context: null }),
      ),
    ).toBe(true);
  });

  it("needs the certification requirements only when tracking is on", () => {
    expect(isDraftComplete(draft(READY_TO_REVIEW))).toBe(true);
    expect(
      isDraftComplete(draft({ ...READY_TO_REVIEW, cpdEnabled: true })),
    ).toBe(false);
    expect(
      isDraftComplete(
        draft({
          ...READY_TO_REVIEW,
          cpdEnabled: true,
          certificationName: "PMP",
          requiredCredits: 60,
        }),
      ),
    ).toBe(true);
  });
});
