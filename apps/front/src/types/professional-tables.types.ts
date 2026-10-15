import type { TCpdPlan, TCpdPlanProgress } from "@/types/cpd-plan.types";
import type { I18nContextValue } from "@/types/providers.types";
import type { useProfessionalCpdPduTracker } from "@/hooks/useProfessionalCpdPduTracker";
import type { useProfessionalCertificates } from "@/hooks/useProfessionalCertificate";

export type ActivitiesTableProps = {
  hook: ReturnType<typeof useProfessionalCpdPduTracker>;
};

export type CertificatesTableProps = {
  hook: ReturnType<typeof useProfessionalCertificates>;
};

export type CycleProgressCardProps = {
  t: I18nContextValue["t"];
  plan: TCpdPlan;
  isLoading: boolean;
  progress: TCpdPlanProgress | undefined;
};
