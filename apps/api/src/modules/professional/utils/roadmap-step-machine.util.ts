import { RoadmapDraftStep } from "@prisma/client";

import type {
  AnsweredFields,
  RoadmapDraftFields,
} from "@professional/types/professional-roadmap-chat.types";

export const STEP_ORDER: readonly RoadmapDraftStep[] = [
  RoadmapDraftStep.GOAL,
  RoadmapDraftStep.GOAL_REASON,
  RoadmapDraftStep.CONTEXT,
  RoadmapDraftStep.TARGET_DATE,
  RoadmapDraftStep.PREFERENCES,
  RoadmapDraftStep.CPD_TRACKING,
  RoadmapDraftStep.CERTIFICATION,
  RoadmapDraftStep.CPD_REQUIREMENTS,
  RoadmapDraftStep.REVIEW,
] as const;

/**
 * Steps that only exist once the professional opted into certification
 * tracking. Declining removes them from the sequence entirely rather than
 * marking them satisfied, so a later change of mind puts them back.
 */
const CPD_BRANCH_STEPS: readonly RoadmapDraftStep[] = [
  RoadmapDraftStep.CERTIFICATION,
  RoadmapDraftStep.CPD_REQUIREMENTS,
] as const;

const filled = (value: string | null | undefined) =>
  typeof value === "string" && value.trim().length > 0;

export const stepIndex = (step: RoadmapDraftStep) => STEP_ORDER.indexOf(step);

export const applicableSteps = (
  draft: Pick<RoadmapDraftFields, "cpdEnabled">,
): readonly RoadmapDraftStep[] =>
  draft.cpdEnabled
    ? STEP_ORDER
    : STEP_ORDER.filter((step) => !CPD_BRANCH_STEPS.includes(step));

export type StepContext = {
  draft: RoadmapDraftFields;
  currentStep: RoadmapDraftStep;
  /**
   * Fields the provider extracted or retracted on this turn. It is what lets a
   * step whose answer is legitimately empty — declining CPD, skipping the
   * context prose — count as answered rather than asked forever.
   */
  answered?: AnsweredFields;
};

const wasAnswered = (context: StepContext, step: RoadmapDraftStep) =>
  stepIndex(context.currentStep) > stepIndex(step);

export const isStepSatisfied = (
  context: StepContext,
  step: RoadmapDraftStep,
): boolean => {
  const { draft, answered } = context;
  switch (step) {
    case RoadmapDraftStep.GOAL:
      return filled(draft.goal);
    case RoadmapDraftStep.GOAL_REASON:
      return (
        filled(draft.goalReason) ||
        answered?.has("goalReason") === true ||
        wasAnswered(context, step)
      );
    case RoadmapDraftStep.CONTEXT:
      return (
        filled(draft.context) ||
        answered?.has("context") === true ||
        wasAnswered(context, step)
      );
    case RoadmapDraftStep.TARGET_DATE:
      return draft.targetDate !== null;
    case RoadmapDraftStep.PREFERENCES:
      return (
        draft.skillLevel !== null &&
        draft.timeCommitment !== null &&
        draft.budgetPreference !== null &&
        draft.subjects.length > 0
      );
    case RoadmapDraftStep.CPD_TRACKING:
      return (
        draft.cpdEnabled ||
        answered?.has("cpdEnabled") === true ||
        wasAnswered(context, step)
      );
    case RoadmapDraftStep.CERTIFICATION:
      return draft.certificationId !== null || filled(draft.certificationName);
    case RoadmapDraftStep.CPD_REQUIREMENTS:
      return draft.requiredCredits !== null;
    case RoadmapDraftStep.REVIEW:
      return true;
  }
};

/**
 * The next question to ask. Scanning from the start rather than from the
 * current step is what makes a turn that answered several questions at once
 * skip every step it satisfied, and what sends the wizard back to a step whose
 * answer the professional has since retracted.
 */
export const nextStep = (context: StepContext): RoadmapDraftStep => {
  for (const step of applicableSteps(context.draft))
    if (!isStepSatisfied(context, step)) return step;
  return RoadmapDraftStep.REVIEW;
};

/**
 * Completeness is derived from the draft's own fields rather than taken from
 * the provider's flag, which is computed against a coarser field set than this
 * wizard collects. GOAL_REASON and CONTEXT are absent on purpose: they colour
 * the plan without gating it.
 */
export const isDraftComplete = (draft: RoadmapDraftFields): boolean => {
  const base =
    filled(draft.goal) &&
    draft.targetDate !== null &&
    draft.skillLevel !== null &&
    draft.timeCommitment !== null &&
    draft.budgetPreference !== null &&
    draft.subjects.length > 0;
  if (!base) return false;
  if (!draft.cpdEnabled) return true;
  return (
    (draft.certificationId !== null || filled(draft.certificationName)) &&
    draft.requiredCredits !== null
  );
};
