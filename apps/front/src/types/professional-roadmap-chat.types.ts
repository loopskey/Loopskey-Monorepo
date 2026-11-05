import { PatchRoadmapCpdSetupInput } from "@/lib/graphql/base";
import { RoadmapStepProgressStatus } from "@/lib/graphql/base";
import { PatchRoadmapDraftInput } from "@/lib/graphql/base";
import { RoadmapDraftStatus } from "@/lib/graphql/base";
import { StepPending } from "@/hooks/useRoadmapStepProgress";

import type { RoadmapGenerationRecoveryAction } from "@/lib/graphql/base";
import type { RoadmapGenerationFailureCode } from "@/lib/graphql/base";
import type { TProfessionalExploreRoadmap } from "@/types/professional-dashboard.types";
import type { RoadmapDraftFieldKey } from "@/lib/graphql/base";
import type { TProfessionalRoadmap } from "@/types/professional-dashboard.types";
import type { useRoadmapLibrary } from "@/hooks/useRoadmapLibrary";
import type { RoadmapChatStage } from "@/utils/roadmap-chat-step.util";
import type { ReactNode } from "react";

import type * as G from "@/lib/graphql/operations/roadmap-chat";

export type TRoadmapDraft = G.ProfessionalRoadmapDraftFieldsFragment;
export type TRoadmapChatMessage = G.RoadmapChatMessageFieldsFragment;
export type TRoadmapWidget = G.RoadmapWidgetFieldsFragment;
export type TRoadmapWidgetOption = TRoadmapWidget["options"][number];
export type TRoadmapSubjectOption = TRoadmapDraft["subjectOptions"][number];

export type TWidgetChoice = {
  answerValue: string;
  answerField: RoadmapDraftFieldKey;
};

export type TPendingMessage = {
  content: string;
  failed: boolean;
  choice?: TWidgetChoice;
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
  isEdit?: boolean;
  onRetry: () => void;
  isRetrying: boolean;
  goal?: string | null;
  updatedAt?: string | null;
  status: RoadmapDraftStatus;
  failure?: TRoadmapGenerationFailure | null;
  t: (key: string, values?: Record<string, string | number>) => string;
};

type Step = {
  id: string;
  order: number;
  title: string;
  isCloseMatch?: boolean;
  credits?: number | null;
  description?: string | null;
  contentType?: string | null;
  contentSlug?: string | null;
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
  nextStepId?: string | null;
  pending: StepPending | null;
  failedStepId: string | null;
  onStart: (enrollmentId: string, stepId: string) => void;
  onComplete: (enrollmentId: string, stepId: string) => void;
};

export type Recommendation = {
  title: string;
  isFree: boolean;
  contentId: string;
  contentType: string;
  summary?: string | null;
  credits?: number | null;
  contentSlug?: string | null;
  durationMinutes?: number | null;
};

export type Patch = Omit<PatchRoadmapDraftInput, "draftId">;
export type CpdSetupPatch = Omit<PatchRoadmapCpdSetupInput, "draftId">;

export type TRoadmapEditReviewProps = {
  draft: TRoadmapDraft;
};

export type RoadmapBriefProps = {
  isPatching: boolean;
  draft: TRoadmapDraft;
  isGenerating?: boolean;
  onGenerate?: () => void;
  isPatchingCpdSetup?: boolean;
  focusStage?: RoadmapChatStage;
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
  idPrefix: string;
  isAsking: boolean;
  isEditing: boolean;
  onEdit: () => void;
  isRequired: boolean;
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
  onAnswer: (value: string, label?: string) => void;
};

export type TRoadmapSuggestionOption = TRoadmapWidgetOption;

export type TRoadmapSuggestionExpansion = {
  draftId: string;
  disabled?: boolean;
  field: TRoadmapWidget["field"];
  onPick: (option: TRoadmapSuggestionOption) => void;
};

export type TRoadmapEditHandlers = {
  editingRoadmapId?: string | null;
  onEdit: (roadmapId: string) => void;
};

export type TRoadmapUnenrollHandlers = {
  unenrollingId: string | null;
  onUnenroll: (enrollmentId: string) => void;
};

export type TRoadmapActionsMenuProps = TRoadmapUnenrollHandlers &
  Partial<TRoadmapEditHandlers> & {
    className?: string;
    roadmap: TProfessionalRoadmap;
  };

export type TRoadmapProgressCardProps = {
  roadmap: TProfessionalRoadmap;
};

export type TStat = {
  key: string;
  label: string;
  value: string;
  isLate?: boolean;
  note?: string | null;
};

export type TRoadmapFocusCardProps = {
  pending: StepPending | null;
  failedStepId: string | null;
  roadmap: TProfessionalRoadmap;
  onStart: (enrollmentId: string, stepId: string) => void;
  onComplete: (enrollmentId: string, stepId: string) => void;
};

export type RoadmapStepMetaProps = {
  children?: ReactNode;
  credits?: number | null;
  contentType?: string | null;
  estimatedMinutes?: number | null;
};

export type TRoadmapRecommendationsCardProps = {
  recommendations: Recommendation[];
};

export type TRoadmapListPaging = {
  page: number;
  hasNextPage: boolean;
  totalCount?: number;
  goNext: () => void;
  goPrevious: () => void;
};

export type TRoadmapCatalogProps = TRoadmapListPaging & {
  search: string;
  isError: boolean;
  isLoading: boolean;
  isFetching: boolean;
  onRetry: () => void;
  roadmaps: TProfessionalExploreRoadmap[];
  onSearchChange: (value: string) => void;
};

export type TRoadmapDetailsProps = TRoadmapEditHandlers & {
  pending: StepPending | null;
  failedStepId: string | null;
  roadmap: TProfessionalRoadmap;
  recommendations: Recommendation[];
  onStart: (enrollmentId: string, stepId: string) => void;
  onComplete: (enrollmentId: string, stepId: string) => void;
};

export type TRoadmapTableRowProps = TRoadmapEditHandlers &
  TRoadmapUnenrollHandlers & {
    isOpen: boolean;
    details?: ReactNode;
    roadmap: TProfessionalRoadmap;
    onToggle: (roadmapId: string) => void;
    onContinue: (roadmapId: string) => void;
  };

export type TRoadmapTableProps = TRoadmapEditHandlers &
  TRoadmapUnenrollHandlers & {
    library: ReturnType<typeof useRoadmapLibrary>;
    openRoadmapId: string | null;
    onToggle: (roadmapId: string) => void;
    onContinue: (roadmapId: string) => void;
    renderDetails: (roadmap: TProfessionalRoadmap) => ReactNode;
  };

export type RoadmapBriefRingProps = {
  completed: number;
  required: number;
  className?: string;
  showLabel?: boolean;
};

export type RoadmapChatStagesProps = {
  draft: TRoadmapDraft;
};

export type RoadmapChatTranscriptProps = {
  draftId: string;
  isSending: boolean;
  isLoading: boolean;
  retryAfter: number;
  onRetry: () => void;
  messages: TRoadmapChatMessage[];
  historyMessages: TRoadmapChatMessage[];
  widget: TRoadmapWidget | null;
  pending: TPendingMessage | null;
  onAnswer: (value: string, label?: string) => void;
};

export type TRoadmapChatComposer = {
  canSend: boolean;
  isSending: boolean;
  retryAfter: number;
  onSend: () => void;
  questionKey: string;
  composer: TComposerState;
  onChange: (value: string) => void;
};
