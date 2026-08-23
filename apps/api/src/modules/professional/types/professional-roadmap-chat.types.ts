import {
  ContentType,
  LearningBudgetPreference,
  LearningFormat,
  LearningTimeCommitment,
  RoadmapDraftStep,
  SkillLevel,
} from "@prisma/client";

import type {
  RoadmapDraftField,
  RoadmapWidget,
} from "@infrastructure/service-ai/service-ai.port";

/**
 * The subset of the draft row the wizard collects. Status, ownership and
 * bookkeeping columns stay out so the pure helpers cannot reach them.
 */
export type RoadmapDraftFields = {
  goal: string | null;
  targetRole: string | null;
  goalReason: string | null;
  context: string | null;
  targetDate: Date | null;
  skillLevel: SkillLevel | null;
  timeCommitment: LearningTimeCommitment | null;
  budgetPreference: LearningBudgetPreference | null;
  subjects: string[];
  preferredFormats: LearningFormat[];
  preferredContentTypes: ContentType[];
  cpdEnabled: boolean;
  certificationId: string | null;
  certificationName: string | null;
  requiredCredits: number | null;
  completedCredits: number | null;
};

export type RoadmapSubjectOption = { id: string; label: string };

export type RoadmapDraftView = RoadmapDraftFields & {
  id: string;
  currentStep: RoadmapDraftStep;
  needsClarification: boolean;
  wasRefused: boolean;
  isComplete: boolean;
  widget: RoadmapWidget | null;
};

export type AnsweredFields = ReadonlySet<RoadmapDraftField>;
