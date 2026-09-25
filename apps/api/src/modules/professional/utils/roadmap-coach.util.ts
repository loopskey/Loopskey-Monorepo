import { RoadmapDraftStep } from "@prisma/client";

import type { CertificationOption } from "@professional/utils/roadmap-widget-validation.util";
import type { RoadmapWidgetField } from "@infrastructure/service-ai/service-ai.port";
import type { RoadmapWidget } from "@infrastructure/service-ai/service-ai.port";
import type { RankableTerm } from "@professional/utils/roadmap-relevance.util";

export const COACH_INTRO_CODE = "ROADMAP_COACH_INTRO";
export const COACH_QUESTION_CODE = "ROADMAP_COACH_QUESTION";

export const isCoachMessage = (content: string) =>
  content === COACH_INTRO_CODE || content === COACH_QUESTION_CODE;

export type CoachWidgetContext = {
  rankedSubjects: readonly RankableTerm[];
  rankedCertifications: readonly CertificationOption[];
};

const EMPTY_CONTEXT: CoachWidgetContext = {
  rankedSubjects: [],
  rankedCertifications: [],
};

const DEFAULT_SUBJECT_MAX_SELECTIONS = 3;

export const defaultWidgetFor = (
  field: RoadmapWidgetField,
  context: CoachWidgetContext = EMPTY_CONTEXT,
): RoadmapWidget | null => {
  switch (field) {
    case "targetDate":
      return { type: "DATE", options: [], maxSelections: null, field };
    case "cpdEnabled":
      return { type: "YES_NO", options: [], maxSelections: null, field };
    case "certificationName":
      return {
        type: "SINGLE_SELECT",
        options: [...context.rankedCertifications],
        maxSelections: null,
        field,
      };
    case "skillLevel":
    case "timeCommitment":
    case "budgetPreference":
      return { type: "SINGLE_SELECT", options: [], maxSelections: null, field };
    case "subjects":
      return {
        type: "MULTI_SELECT",
        maxSelections: DEFAULT_SUBJECT_MAX_SELECTIONS,
        field,
        options: context.rankedSubjects.map((term) => ({
          value: term.id,
          label: term.label,
          groupLabel: term.groupLabel,
        })),
      };
    case "preferredFormats":
    case "preferredDeliveryFormats":
      return { type: "MULTI_SELECT", options: [], maxSelections: null, field };
    default:
      return null;
  }
};

const STEP_FIELD: Partial<Record<RoadmapDraftStep, RoadmapWidgetField>> = {
  [RoadmapDraftStep.TARGET_DATE]: "targetDate",
  [RoadmapDraftStep.CPD_TRACKING]: "cpdEnabled",
  [RoadmapDraftStep.CERTIFICATION]: "certificationName",
};

export const fieldForStep = (
  step: RoadmapDraftStep,
): RoadmapWidgetField | null => STEP_FIELD[step] ?? null;

export const coachWidgetFor = (
  step: RoadmapDraftStep,
  context: CoachWidgetContext = EMPTY_CONTEXT,
): RoadmapWidget | null => {
  const field = STEP_FIELD[step];
  return field ? defaultWidgetFor(field, context) : null;
};

export const hadValue = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.length > 0;
  return (
    value !== null && value !== undefined && value !== false && value !== ""
  );
};
