import type { I18nContextValue } from "@/types/providers.types";

import type * as API from "@/lib/graphql/operations/cpd-plan";

export type TAssociationRequirement =
  API.AssociationMyRequirementFieldsFragment;
export type TAssociationRequirementDetail =
  API.AssociationMyRequirementDetailFieldsFragment;
export type TAssociationRequirementContent =
  TAssociationRequirementDetail["learningContents"][number];
export type TAssociationRequirementActivity =
  TAssociationRequirementDetail["activities"][number];
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

export type TRequirementLearningContentProps = {
  isLoading: boolean;
  t: I18nContextValue["t"];
  requirementKeyValue: string;
  contents: TAssociationRequirementContent[];
  onMarkComplete: (content: TAssociationRequirementContent) => void;
};

export type TRequirementSwitcherProps = {
  t: I18nContextValue["t"];
  selectedKey: string | null;
  options: TRequirementOption[];
  onSelect: (key: string) => void;
};

export type TRequirementCategoryRow = {
  id: string;
  name: string;
  completed: number;
  required: number;
  percent: number;
};

export type TRequirementCategoryProgressProps = {
  isLoading: boolean;
  creditLabel: string;
  t: I18nContextValue["t"];
  categories: TRequirementCategoryRow[];
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
  evidence: {
    labelKey: string;
    awaitingReviewCount: number;
    isMissingEvidence: boolean;
  } | null;
};

export type TRequirementProgressRingProps = {
  percent: number;
  ariaLabel: string;
  size?: number;
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
  categories: TRequirementCategoryRow[];
  content: TAssociationRequirementContent[];
  activities: TRequirementActivityRow[];
  isDetailLoading: boolean;
  isActivitiesLoading: boolean;
  onMarkComplete?: (content: TAssociationRequirementContent) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isDeleting?: boolean;
};
