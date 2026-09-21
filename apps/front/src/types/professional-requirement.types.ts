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
  isDeleting: boolean;
  t: I18nContextValue["t"];
  selectedKey: string | null;
  onEdit: (planId: string) => void;
  onDelete: (planId: string) => void;
  onSelect: (key: string) => void;
  options: TRequirementOption[];
  onLogActivity: () => void;
};

export type TAssociationRequirementViewProps = {
  isLoading: boolean;
  t: I18nContextValue["t"];
  onLogActivity: () => void;
  summary: TAssociationRequirement;
  detail: TAssociationRequirementDetail | undefined;
  onMarkComplete: (content: TAssociationRequirementContent) => void;
};

export type TRequirementActivitiesTableProps = {
  t: I18nContextValue["t"];
  isLoading: boolean;
  rows: TRequirementActivityRow[];
};

export type TRequirementLearningContentProps = {
  isLoading: boolean;
  t: I18nContextValue["t"];
  contents: TAssociationRequirementContent[];
  onMarkComplete: (content: TAssociationRequirementContent) => void;
};

export type TRequirementSwitcherProps = {
  t: I18nContextValue["t"];
  selectedKey: string | null;
  options: TRequirementOption[];
  onSelect: (key: string) => void;
};

export type TRequirementCategoryProgressProps = {
  isLoading: boolean;
  creditLabel: string;
  t: I18nContextValue["t"];
  categories: TAssociationRequirementDetail["categories"];
};
