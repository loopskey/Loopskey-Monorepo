import { PatchRoadmapCpdSetupInput } from "@/lib/graphql/base";
import { RoadmapStepProgressStatus } from "@/lib/graphql/base";
import { PatchRoadmapDraftInput } from "@/lib/graphql/base";
import { RoadmapDraftStatus } from "@/lib/graphql/base";
import { StepPending } from "@/hooks/useRoadmapStepProgress";
import { RefObject } from "react";

import type { RoadmapGenerationRecoveryAction } from "@/lib/graphql/base";
import type { RoadmapGenerationFailureCode } from "@/lib/graphql/base";
import type { RoadmapChatStage } from "@/utils/roadmap-chat-step.util";

import type * as G from "@/lib/graphql/operations/roadmap-chat";

export type TRoadmapDraft = G.ProfessionalRoadmapDraftFieldsFragment;
export type TRoadmapChatMessage = G.RoadmapChatMessageFieldsFragment;
export type TRoadmapWidget = G.RoadmapWidgetFieldsFragment;
export type TRoadmapWidgetOption = TRoadmapWidget["options"][number];
export type TRoadmapSubjectOption = TRoadmapDraft["subjectOptions"][number];

export type TPendingMessage = {
  content: string;
  failed: boolean;
};

export type TComposerState = {
  value: string;
  remaining: number;
  isOverLimit: boolean;
  showCounter: boolean;
};

export type TRoadmapChatError = {
  code: string;
  retryAfterSeconds: number | null;
};

export type TRoadmapGenerationFailure = {
  code: RoadmapGenerationFailureCode;
  recoveryActions: RoadmapGenerationRecoveryAction[];
};

export type TRoadmapStatusProps = {
  draftId: string;
  status: RoadmapDraftStatus;
  goal?: string | null;
  failure?: TRoadmapGenerationFailure | null;
  onRetry: () => void;
  isRetrying: boolean;
  t: (key: string, values?: Record<string, string | number>) => string;
};

export type TBriefFieldStatus =
  | "confirmed"
  | "suggested"
  | "needsAnswer"
  | "notNeeded";

type Step = {
  id: string;
  order: number;
  title: string;
  description?: string | null;
  contentType?: string | null;
  estimatedMinutes?: number | null;
  credits?: number | null;
  status?: RoadmapStepProgressStatus | null;
  isCloseMatch?: boolean;
};

type Phase = {
  id: string;
  steps: Step[];
  order: number;
  title: string;
  progress: number;
  completed: boolean;
  stepsCount: number;
  completedSteps: number;
  description?: string | null;
  estimatedWeeks?: number | null;
};

export type TRoadmapPhaseProps = {
  phases: Phase[];
  enrollmentId: string;
  pending: StepPending | null;
  failedStepId: string | null;
  onStart: (enrollmentId: string, stepId: string) => void;
  onComplete: (enrollmentId: string, stepId: string) => void;
  t: (key: string, values?: Record<string, string | number>) => string;
};

export type Recommendation = {
  title: string;
  isFree: boolean;
  contentId: string;
  contentType: string;
  summary?: string | null;
  credits?: number | null;
  durationMinutes?: number | null;
};

export type Patch = Omit<PatchRoadmapDraftInput, "draftId">;
export type CpdSetupPatch = Omit<PatchRoadmapCpdSetupInput, "draftId">;

export type TRoadmapReviewSummary = {
  isPatching: boolean;
  draft: TRoadmapDraft;
  isGenerating?: boolean;
  focusStage?: RoadmapChatStage;
  isPatchingCpdSetup?: boolean;
  onGenerate?: () => void;
  onPatch: (changes: Patch) => Promise<boolean>;
  onPatchCpdSetup?: (changes: CpdSetupPatch) => void;
};

type EditorKind =
  | { kind: "text"; multiline: boolean }
  | { kind: "date" }
  | { kind: "number" }
  | { kind: "single"; values: readonly string[]; labelNs: string }
  | { kind: "multi"; values: readonly string[]; labelNs: string }
  | { kind: "subjects" }
  | { kind: "boolean" };

export type Row = {
  field: keyof Patch;
  editor: EditorKind;
  value: string | string[] | number | boolean | null | undefined;
};

export type TRowProps = {
  row: Row;
  isEditing: boolean;
  onEdit: () => void;
  isPatching: boolean;
  onCancel: () => void;
  draft: TRoadmapDraft;
  onCommit: (field: keyof Patch, value: Patch[keyof Patch]) => void;
};

export type TEditorProps = {
  row: Row;
  onCancel: () => void;
  draft: TRoadmapDraft;
  onCommit: (field: keyof Patch, value: Patch[keyof Patch]) => void;
};

export type TRoadmapWidgetControl = {
  draftId: string;
  disabled: boolean;
  widget: TRoadmapWidget;
  onAnswer: (value: string) => void;
};

export type TRoadmapSuggestionOption = TRoadmapWidgetOption;

export type TRoadmapSuggestionExpansion = {
  draftId: string;
  field: TRoadmapWidget["field"];
  disabled?: boolean;
  onPick: (option: TRoadmapSuggestionOption) => void;
};

export type TRoadmapHeroProps = {
  title: string;
  locale: string;
  progress: number;
  description: string;
  totalSteps: number;
  phasesCount: number;
  continueHref: string;
  viewFullHref: string;
  completedSteps: number;
  newRoadmapHref: string;
  targetDate?: string | null;
  nextStepTitle?: string | null;
  estimatedWeeks?: number | null;
  headingRef: RefObject<HTMLHeadingElement | null>;
  t: (key: string, values?: Record<string, string | number>) => string;
};

type TTimelinePhase = {
  id: string;
  title: string;
  completed: boolean;
  stepsCount: number;
  completedSteps: number;
};

export type TRoadmapJourneyTimelineProps = {
  phases: TTimelinePhase[];
  currentPhaseId: string | null;
  t: (key: string, values?: Record<string, string | number>) => string;
};
