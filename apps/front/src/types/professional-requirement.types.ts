import type { I18nContextValue } from "@/types/providers.types";

import type * as API from "@/lib/graphql/operations/cpd-plan";

export type TAssociationRequirement =
  API.AssociationMyRequirementFieldsFragment;
export type TAssociationRequirementDetail =
  API.AssociationMyRequirementDetailFieldsFragment;
export type TAssociationRequirementContent =
  TAssociationRequirementDetail["learningContents"][number];
export type TAssociationLearningContentItem =
  API.AssociationMyLearningContentFieldsFragment;
export type TAssociationRequirementActivity =
  TAssociationRequirementDetail["activities"][number];
export type TExcludedRequirementActivity =
  TAssociationRequirementDetail["excludedActivities"][number];
export type TPlanActivity = API.CpdPlanActivityFieldsFragment;

export type TRequirementSource = "ASSOCIATION" | "PLAN";

export type TRequirementOption = {
  id: string;
  key: string;
  label: string;
  source: TRequirementSource;
};

export type TRequirementTone =
  | "success"
  | "info"
  | "warning"
  | "danger"
  | "neutral";

export type TRequirementActivityRow = {
  id: string;
  title: string;
  date: string;
  credits: number;
  isLate: boolean;
  category: string;
  statusLabel: string;
  note: string | null;
  tone: TRequirementTone;
};

export type TRequirementSelectorProps = {
  t: I18nContextValue["t"];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  options: TRequirementOption[];
  onLogActivity: () => void;
};

export type TRequirementActivitiesTableProps = {
  t: I18nContextValue["t"];
  isLoading: boolean;
  rows: TRequirementActivityRow[];
};

export type TRequirementExcludedActivitiesProps = {
  t: I18nContextValue["t"];
  activities: TExcludedRequirementActivity[];
};

export type TRequirementLearningContentProps = {
  isLoading: boolean;
  t: I18nContextValue["t"];
  requirementKeyValue: string;
  associationName: string | null;
  contents: TAssociationRequirementContent[];
};

export type TContentRow = {
  t: I18nContextValue["t"];
  requirementKeyValue: string;
  associationName: string | null;
  content: TAssociationRequirementContent;
  onMarkComplete: (content: TAssociationRequirementContent) => void;
  onViewExternal: (content: TAssociationRequirementContent) => void;
};

export type TContentCompletionStatusProps = {
  content: Pick<
    TAssociationLearningContentItem,
    | "isLate"
    | "isCompleted"
    | "completedAt"
    | "submittedAt"
    | "creditedAmount"
    | "completionState"
  >;
};

export type TAssociationContentSectionProps = {
  isLoading: boolean;
  t: I18nContextValue["t"];
  contents: TAssociationLearningContentItem[];
};

export type TRequirementSwitcherProps = {
  t: I18nContextValue["t"];
  selectedKey: string | null;
  options: TRequirementOption[];
  onSelect: (key: string) => void;
};

export type TRequirementViewModel = {
  key: string;
  title: string;
  creditType: string;
  earnedCredits: number;
  dueDate: string | null;
  requiredCredits: number;
  remainingCredits: number;
  source: TRequirementSource;
  statusTone: TRequirementTone;
  statusLabelKey: string;
  daysRemaining: number | null;
  associationName: string | null;
  percent: number;
  acceptsFrom: string | null;
  acceptsUntil: string | null;
  evidence: {
    labelKey: string;
    awaitingReviewCount: number;
    isMissingEvidence: boolean;
  } | null;
};

export type TRequirementSummaryStripProps = {
  t: I18nContextValue["t"];
  model: TRequirementViewModel;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
};

export type TRequirementDetailViewProps = {
  t: I18nContextValue["t"];
  isLoading: boolean;
  model: TRequirementViewModel;
  requirementKeyValue: string;
  content: TAssociationRequirementContent[];
  activities: TRequirementActivityRow[];
  excludedActivities?: TExcludedRequirementActivity[];
  isDetailLoading: boolean;
  isActivitiesLoading: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
};
