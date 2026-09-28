import {
  DeliveryFormat,
  LearningBudgetPreference,
  LearningFormat,
  LearningTimeCommitment,
  RoadmapDraftStep,
  SkillLevel,
} from "@prisma/client";

import type { RoadmapDraftField } from "@infrastructure/service-ai/service-ai.port";
import type { RoadmapDraftFields } from "@professional/types/professional-roadmap-chat.types";

import {
  STEP_ORDER,
  applicableSteps,
  draftCompletionSummary,
  isDraftReady,
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
  preferredDeliveryFormats: [],
  cpdEnabled: false,
  certificationId: null,
  certificationName: null,
  requiredCredits: null,
  completedCredits: null,
  ...overrides,
});

const PREFERENCES_ANSWERED = {
  skillLevel: SkillLevel.INTERMEDIATE,
  timeCommitment: LearningTimeCommitment.THREE_TO_FIVE_HOURS,
  budgetPreference: LearningBudgetPreference.UNDER_100,
  subjects: ["term-data"],
  preferredFormats: [LearningFormat.COURSE],
  preferredDeliveryFormats: [DeliveryFormat.ONLINE],
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

  it("holds the preferences step until a content format is chosen", () => {
    expect(
      step(
        { ...READY_TO_REVIEW, preferredFormats: [] },
        RoadmapDraftStep.PREFERENCES,
      ),
    ).toBe(RoadmapDraftStep.PREFERENCES);
  });

  it("holds the preferences step until a delivery format is chosen", () => {
    expect(
      step(
        { ...READY_TO_REVIEW, preferredDeliveryFormats: [] },
        RoadmapDraftStep.PREFERENCES,
      ),
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

describe("roadmap draft readiness", () => {
  const ready = (
    fields: Partial<RoadmapDraftFields>,
    currentStep: RoadmapDraftStep,
  ) => isDraftReady({ draft: draft(fields), currentStep });

  it("is not ready on a fresh draft even before any question has been asked", () => {
    expect(ready({}, RoadmapDraftStep.GOAL)).toBe(false);
  });

  it("is not ready on a profile-seeded draft whose base fields are already filled, until the interview itself reaches review", () => {
    expect(ready(READY_TO_REVIEW, RoadmapDraftStep.GOAL)).toBe(false);
    expect(ready(READY_TO_REVIEW, RoadmapDraftStep.PREFERENCES)).toBe(false);
  });

  it("does not treat the persisted default cpdEnabled: false as an explicit answer before CPD tracking has been reached", () => {
    expect(ready(READY_TO_REVIEW, RoadmapDraftStep.CPD_TRACKING)).toBe(false);
  });

  it("is ready once an explicit CPD No has advanced the interview past CPD tracking to review", () => {
    expect(ready(READY_TO_REVIEW, RoadmapDraftStep.REVIEW)).toBe(true);
  });

  it("needs certification and credit collection before readiness once CPD tracking is explicitly on", () => {
    expect(
      ready({ ...READY_TO_REVIEW, cpdEnabled: true }, RoadmapDraftStep.REVIEW),
    ).toBe(false);
    expect(
      ready(
        {
          ...READY_TO_REVIEW,
          cpdEnabled: true,
          certificationName: "PMP",
          requiredCredits: 60,
        },
        RoadmapDraftStep.REVIEW,
      ),
    ).toBe(true);
  });

  it("is ready without the prose steps, which colour the plan rather than gate it, once they have been passed", () => {
    expect(
      ready(
        { ...READY_TO_REVIEW, goalReason: null, context: null },
        RoadmapDraftStep.REVIEW,
      ),
    ).toBe(true);
  });

  it("regresses a stale review status when a required answer is cleared or invalidated afterward", () => {
    expect(
      ready({ ...READY_TO_REVIEW, goal: null }, RoadmapDraftStep.REVIEW),
    ).toBe(false);
    expect(
      ready({ ...READY_TO_REVIEW, subjects: [] }, RoadmapDraftStep.REVIEW),
    ).toBe(false);
    expect(
      ready(
        { ...READY_TO_REVIEW, cpdEnabled: true, certificationName: null },
        RoadmapDraftStep.REVIEW,
      ),
    ).toBe(false);
  });

  it("treats a legacy draft whose stored status predates this policy as not ready when its requirements are unmet", () => {
    expect(
      ready(
        { ...READY_TO_REVIEW, preferredDeliveryFormats: [] },
        RoadmapDraftStep.REVIEW,
      ),
    ).toBe(false);
  });
});

describe("draftCompletionSummary", () => {
  it("counts every applicable field as remaining on a brand-new draft", () => {
    const summary = draftCompletionSummary({
      draft: draft({}),
      currentStep: RoadmapDraftStep.GOAL,
    });
    expect(summary.requiredFieldCount).toBe(6);
    expect(summary.completedFieldCount).toBe(0);
    expect(summary.remainingFields).toHaveLength(6);
    expect(summary.remainingFields).not.toContain(RoadmapDraftStep.REVIEW);
  });

  it("counts every field complete once the wizard reaches review", () => {
    const summary = draftCompletionSummary({
      draft: draft(READY_TO_REVIEW),
      currentStep: RoadmapDraftStep.REVIEW,
    });
    expect(summary.requiredFieldCount).toBe(6);
    expect(summary.completedFieldCount).toBe(6);
    expect(summary.remainingFields).toHaveLength(0);
  });

  it("includes the certification branch in the required count once CPD tracking is on", () => {
    const summary = draftCompletionSummary({
      draft: draft({
        ...READY_TO_REVIEW,
        cpdEnabled: true,
        certificationName: "PMP",
        requiredCredits: 60,
      }),
      currentStep: RoadmapDraftStep.REVIEW,
    });
    expect(summary.requiredFieldCount).toBe(8);
    expect(summary.completedFieldCount).toBe(8);
    expect(summary.remainingFields).toHaveLength(0);
  });
});
