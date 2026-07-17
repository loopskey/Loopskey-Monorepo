import { Control, UseFieldArrayReturn, UseFormReturn } from "react-hook-form";
import { CpdPlanFormValues } from "@/lib/validations/cpd-plan.schema";
import { CpdPlanFormInput } from "@/lib/validations/cpd-plan.schema";

import * as G from "@/lib/graphql/generated";

export type TCpdPlan = G.CpdPlanFieldsFragment;
export type TCpdPlanProgress = G.CpdPlanProgressFieldsFragment;
export type TCertification = G.CertificationFieldsFragment;
export type TCpdRecipientOption = G.CpdReportRecipientOptionFieldsFragment;

export type CpdSetupMode = "manual" | "editSuggestion";

export type CpdSetupState = {
  mode: CpdSetupMode;
  certificationId?: string;
  initial: CpdPlanFormInput;
};

export type CpdSearchView = "search" | "suggested";

export type TCpdStepProps = {
  control: Control<CpdPlanFormInput>;
  form: UseFormReturn<CpdPlanFormInput, unknown, CpdPlanFormValues>;
  t: (key: string, params?: Record<string, string | number>) => string;
};

export type TCpdSetupStep = {
  value: number;
  title: string;
  description: string;
};

export type CpdCategoryCompletionProps = {
  t: (key: string) => string;
  plan: TCpdPlan;
  progress: TCpdPlanProgress;
};

export type CpdCertificationResultCardProps = {
  t: (key: string) => string;
  certification: TCertification;
  onSelect: (certification: TCertification) => void;
};

export type CpdEmptyStateProps = {
  t: (key: string) => string;
  onCreate: () => void;
};

export type CpdMissingRequirementsProps = {
  onEditPlan: () => void;
  onAddActivity: () => void;
  progress: TCpdPlanProgress;
  t: (key: string, params?: Record<string, string | number>) => string;
};

export type CpdPlanSelectorProps = {
  plans: TCpdPlan[];
  isDeleting: boolean;
  t: (key: string) => string;
  selectedPlanId: string | null;
  onSelect: (planId: string) => void;
  onDelete: (planId: string) => void;
};

export type CpdProgressOverviewProps = {
  plan: TCpdPlan;
  progress: TCpdPlanProgress;
  t: (key: string, params?: Record<string, string | number>) => string;
};

export type CpdSearchModalProps = {
  open: boolean;
  onClose: () => void;
  isSubmitting: boolean;
  t: (key: string) => string;
  onAddManually: (query: string) => void;
  onUseSuggested: (certification: TCertification) => void;
  onEditManually: (certification: TCertification) => void;
};

export type CpdSetupFlowProps = {
  onCancel: () => void;
  setup: CpdSetupState;
  isSubmitting: boolean;
  t: (key: string) => string;
  onSubmit: (values: CpdPlanFormValues) => void | Promise<void>;
};

export type CpdStepCategoriesProps = TCpdStepProps & {
  targetTotal: number;
  addCategory: () => void;
  removeCategory: (index: number) => void;
  creditType: CpdPlanFormValues["creditType"];
  categories: UseFieldArrayReturn<CpdPlanFormInput, "categories">;
};

export type CpdSuggestedRequirementProps = {
  onBack: () => void;
  isSubmitting: boolean;
  t: (key: string) => string;
  certification: TCertification;
  onEditManually: (certification: TCertification) => void;
  onUseSuggested: (certification: TCertification) => void;
};
