import { RoadmapStepProgressStatus } from "@/lib/graphql/base";
import { PatchRoadmapDraftInput } from "@/lib/graphql/base";
import { RoadmapDraftStatus } from "@/lib/graphql/base";
import { StepPending } from "@/hooks/useRoadmapStepProgress";

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

export type TRoadmapStatusProps = {
  status: RoadmapDraftStatus;
  failureReason?: string | null;
  t: (key: string, values?: Record<string, string | number>) => string;
};

type Step = {
  id: string;
  order: number;
  title: string;
  description?: string | null;
  contentType?: string | null;
  estimatedMinutes?: number | null;
  status?: RoadmapStepProgressStatus | null;
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

type Recommendation = {
  title: string;
  isFree: boolean;
  contentId: string;
  contentType: string;
  summary?: string | null;
  credits?: number | null;
  durationMinutes?: number | null;
};

export type TRoadmapSummaryProps = {
  locale: string;
  progress: number;
  totalSteps: number;
  earnedCredits: number;
  completedSteps: number;
  targetDate?: string | null;
  requiredCredits?: number | null;
  recommendations: Recommendation[];
  t: (key: string, values?: Record<string, string | number>) => string;
};

export type Patch = Omit<PatchRoadmapDraftInput, "draftId">;

export type TRoadmapReviewSummary = {
  isPatching: boolean;
  draft: TRoadmapDraft;
  isGenerating?: boolean;
  onGenerate?: () => void;
  onPatch: (changes: Patch) => void;
};

type EditorKind =
  | { kind: "text"; multiline: boolean }
  | { kind: "date" }
  | { kind: "number" }
  | { kind: "single"; values: string[]; labelNs: string }
  | { kind: "multi"; values: string[]; labelNs: string }
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
  disabled: boolean;
  widget: TRoadmapWidget;
  onAnswer: (value: string) => void;
};
