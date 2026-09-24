import type { Control, UseFormReturn } from "react-hook-form";
import type { UseFieldArrayReturn } from "react-hook-form";
import type { CpdPlanFormValues } from "@/lib/validations/cpd-plan.schema";
import type { CpdPlanFormInput } from "@/lib/validations/cpd-plan.schema";

import type * as API from "@/lib/graphql/operations/cpd-plan";

export type TCpdPlan = API.CpdPlanFieldsFragment;
export type TCpdPlanProgress = API.CpdPlanProgressFieldsFragment;
export type TCertification = API.CertificationFieldsFragment;
export type TCpdRecipientOption = API.CpdReportRecipientOptionFieldsFragment;

export type CpdSetupMode = "manual" | "editSuggestion" | "edit";

export type CpdSetupState = {
  mode: CpdSetupMode;
  planId?: string;
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

export type CpdCertificationResultCardProps = {
  t: (key: string) => string;
  certification: TCertification;
  onSelect: (certification: TCertification) => void;
};

export type CpdEmptyStateProps = {
  t: (key: string) => string;
  onCreate: () => void;
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
