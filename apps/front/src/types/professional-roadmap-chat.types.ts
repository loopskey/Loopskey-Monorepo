import { PatchRoadmapCpdSetupInput } from "@/lib/graphql/base";
import { RoadmapStepProgressStatus } from "@/lib/graphql/base";
import { PatchRoadmapDraftInput } from "@/lib/graphql/base";
import { RoadmapDraftStatus } from "@/lib/graphql/base";
import { StepPending } from "@/hooks/useRoadmapStepProgress";

import type { ChangeEvent, ReactNode, Ref, RefObject } from "react";
import type { RoadmapGenerationRecoveryAction } from "@/lib/graphql/base";
import type { RoadmapGenerationFailureCode } from "@/lib/graphql/base";
import type { TProfessionalExploreRoadmap } from "@/types/professional-dashboard.types";
import type { RoadmapDraftFieldKey } from "@/lib/graphql/base";
import type { TProfessionalRoadmap } from "@/types/professional-dashboard.types";
import type { RoadmapChatStage } from "@/utils/roadmap-chat-step.util";

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
  durationMinutes?: number | null;
};

export type Patch = Omit<PatchRoadmapDraftInput, "draftId">;
export type CpdSetupPatch = Omit<PatchRoadmapCpdSetupInput, "draftId">;

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
  idPrefix: string;
  row: Row;
  isAsking: boolean;
  isRequired: boolean;
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
  onAnswer: (value: string, label?: string) => void;
};

export type TRoadmapSuggestionOption = TRoadmapWidgetOption;

export type TRoadmapSuggestionExpansion = {
  draftId: string;
  field: TRoadmapWidget["field"];
  disabled?: boolean;
  onPick: (option: TRoadmapSuggestionOption) => void;
};

export type RoadmapSection = "path" | "recommended" | "explore";

export type TRoadmapActionHandlers = {
  onEdit: (roadmapId: string) => void;
  onContinue: (roadmapId: string) => void;
  editingRoadmapId?: string | null;
};

export type TRoadmapActionButtonsProps = TRoadmapActionHandlers & {
  className?: string;
  size?: "default" | "sm";
  roadmap: TProfessionalRoadmap;
};

export type TRoadmapSwitcherProps = TRoadmapActionHandlers & {
  search: string;
  showSearch: boolean;
  isFetching: boolean;
  activeRoadmapId?: string;
  roadmaps: TProfessionalRoadmap[];
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

export type TRoadmapWorkspaceHeaderProps = TRoadmapActionHandlers & {
  isUnenrolling: boolean;
  roadmap: TProfessionalRoadmap;
  onUnenroll: (enrollmentId: string) => void;
  headingRef: RefObject<HTMLHeadingElement | null>;
};

export type TRoadmapFocusCardProps = {
  onExplore: () => void;
  focusRef: Ref<HTMLElement>;
  pending: StepPending | null;
  failedStepId: string | null;
  roadmap: TProfessionalRoadmap;
  onStart: (enrollmentId: string, stepId: string) => void;
  onComplete: (enrollmentId: string, stepId: string) => void;
};

export type RoadmapSummaryRailProps = {
  roadmap: TProfessionalRoadmap;
};

export type RoadmapStepMetaProps = {
  children?: ReactNode;
  credits?: number | null;
  contentType?: string | null;
  estimatedMinutes?: number | null;
};

export type RoadmapRecommendationsListProps = {
  recommendations: Recommendation[];
};

export type RoadmapExploreListProps = {
  page: number;
  search: string;
  isError: boolean;
  onNext: () => void;
  isLoading: boolean;
  isFetching: boolean;
  totalCount?: number;
  onRetry: () => void;
  hasNextPage: boolean;
  onPrevious: () => void;
  roadmaps: TProfessionalExploreRoadmap[];
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
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
