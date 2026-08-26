import { LearningFormat, LearningTimeCommitment } from "@prisma/client";
import { ContentType, Prisma, SkillLevel } from "@prisma/client";
import { LearningBudgetPreference } from "@prisma/client";
import { RoadmapDraftStep } from "@prisma/client";

import type { PlatformContentType } from "@infrastructure/service-ai/service-ai.port";
import type { RoadmapDraftField } from "@infrastructure/service-ai/service-ai.port";
import type { RoadmapWidget } from "@infrastructure/service-ai/service-ai.port";

export type RoadmapDraftFields = {
  subjects: string[];
  goal: string | null;
  cpdEnabled: boolean;
  context: string | null;
  targetDate: Date | null;
  targetRole: string | null;
  goalReason: string | null;
  skillLevel: SkillLevel | null;
  certificationId: string | null;
  requiredCredits: number | null;
  completedCredits: number | null;
  certificationName: string | null;
  preferredFormats: LearningFormat[];
  preferredContentTypes: ContentType[];
  timeCommitment: LearningTimeCommitment | null;
  budgetPreference: LearningBudgetPreference | null;
};

export type RoadmapSubjectOption = { id: string; label: string };

export type RoadmapDraftView = RoadmapDraftFields & {
  id: string;
  wasRefused: boolean;
  isComplete: boolean;
  needsClarification: boolean;
  widget: RoadmapWidget | null;
  currentStep: RoadmapDraftStep;
};

export type AnsweredFields = ReadonlySet<RoadmapDraftField>;

export type CandidateBuildInput = {
  cap: number;
  subjects: string[];
  creditsNeeded: boolean;
  skillLevel: SkillLevel | null;
  preferredContentTypes: PlatformContentType[];
  budgetPreference: LearningBudgetPreference | null;
};

export type DraftRow = Prisma.RoadmapDraftGetPayload<{
  include: { cpdPlan: true; certification: true };
}>;

export type RoadmapShape = {
  id: string;
  phases: { id: string; steps: { id: string }[] }[];
};
