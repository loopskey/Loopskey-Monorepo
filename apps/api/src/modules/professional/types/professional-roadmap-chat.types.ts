import { LearningFormat, LearningTimeCommitment } from "@prisma/client";
import { ContentType, Prisma, SkillLevel } from "@prisma/client";
import { LearningBudgetPreference } from "@prisma/client";
import { OperationValidation } from "@professional/utils/roadmap-edit-operations.util";
import { StepProgressByStep } from "@professional/utils/roadmap-edit-shape.util";
import { RoadmapDraftStep } from "@prisma/client";
import { EditableRoadmap } from "@professional/utils/roadmap-edit-shape.util";
import { DeliveryFormat } from "@prisma/client";
import { ProtectedStep } from "@professional/utils/roadmap-edit-preservation.util";

import type { RoadmapChangeOperation } from "@infrastructure/service-ai/service-ai.port";
import type { PlatformContentType } from "@infrastructure/service-ai/service-ai.port";
import type { RoadmapWidget } from "@infrastructure/service-ai/service-ai.port";

export type RoadmapDraftFields = {
  subjects: string[];
  goal: string | null;
  cpdEnabled: boolean;
  cpdAnswered: boolean;
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
  preferredDeliveryFormats: DeliveryFormat[];
  timeCommitment: LearningTimeCommitment | null;
  budgetPreference: LearningBudgetPreference | null;
};

export type RoadmapSubjectOption = { id: string; label: string };

export type RoadmapDraftView = RoadmapDraftFields & {
  id: string;
  wasRefused: boolean;
  isComplete: boolean;
  needsClarification: boolean;
  failureReason: string | null;
  widget: RoadmapWidget | null;
  currentStep: RoadmapDraftStep;
};

export type CandidateBuildInput = {
  cap: number;
  subjects: string[];
  keywords: string[];
  groupKeys: string[];
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

export type ResetInPlaceResult =
  | { outcome: "reset"; draft: Prisma.RoadmapDraftGetPayload<object> }
  | { outcome: "not_found" }
  | { outcome: "edit" }
  | { outcome: "closed" }
  | { outcome: "locked" };

export type TranscriptPage = {
  items: Prisma.RoadmapChatMessageGetPayload<object>[];
  totalCount: number;
  pageInfo: { hasNextPage: boolean; nextCursor: string | null };
};

export type DraftBase = Prisma.RoadmapDraftGetPayload<object>;

export type EditContext = {
  roadmap: EditableRoadmap;
  enrollmentId: string | null;
  progress: StepProgressByStep;
};

export type EditState = {
  hasChanges: boolean;
  changedFields: string[];
  context: EditContext | null;
  validation: OperationValidation;
  protectedSteps: ProtectedStep[];
  unidentifiable: ProtectedStep[];
  pending: RoadmapChangeOperation[];
};

export type EditBlockReason =
  | "NO_CHANGES"
  | "NOT_EDITABLE"
  | "STALE_CHANGES"
  | "CHANGES_NOT_CONFIRMED"
  | "AWAITING_CLARIFICATION"
  | "PRESERVATION_UNSUPPORTED";
