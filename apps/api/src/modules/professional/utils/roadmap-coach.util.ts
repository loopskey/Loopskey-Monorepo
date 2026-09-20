import { RoadmapDraftStep } from "@prisma/client";

import type { RoadmapWidget } from "@infrastructure/service-ai/service-ai.port";

/**
 * The coach's own lines are stored as stable codes, never prose, for the same
 * reason SYSTEM messages are: the browser owns the wording and its
 * translation, and the server only says which line was spoken and at which
 * step. Everything the provider writes is stored verbatim instead.
 */
export const COACH_INTRO_CODE = "ROADMAP_COACH_INTRO";
export const COACH_QUESTION_CODE = "ROADMAP_COACH_QUESTION";

export const isCoachMessage = (content: string) =>
  content === COACH_INTRO_CODE || content === COACH_QUESTION_CODE;

/**
 * Only the field and the control are decided here. The option labels are copy,
 * so the browser supplies them from the field.
 */
const COACH_WIDGETS: Partial<Record<RoadmapDraftStep, RoadmapWidget>> = {
  [RoadmapDraftStep.TARGET_DATE]: {
    type: "DATE",
    options: [],
    maxSelections: null,
    field: "targetDate",
  },
  [RoadmapDraftStep.CPD_TRACKING]: {
    type: "YES_NO",
    options: [],
    maxSelections: null,
    field: "cpdEnabled",
  },
  [RoadmapDraftStep.CERTIFICATION]: {
    options: [],
    maxSelections: null,
    type: "SINGLE_SELECT",
    field: "certificationName",
  },
};

export const coachWidgetFor = (step: RoadmapDraftStep): RoadmapWidget | null =>
  COACH_WIDGETS[step] ?? null;

/** A value the draft already held, so a turn that changes it is a correction. */
export const hadValue = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.length > 0;
  return (
    value !== null && value !== undefined && value !== false && value !== ""
  );
};
