import { useProfessionalAvatar } from "@/hooks/useProfessionalAvatar";
import { UseFormReturn } from "react-hook-form";
import { LucideIcon } from "lucide-react";

import * as GQL from "@/lib/graphql/generated";
import * as V from "@/lib/validations/professional-profile.schema";

export type TProfessionalProfileTab =
  | "basic"
  | "details"
  | "skills"
  | "certifications"
  | "preferences";

export type TProfessionalProfile =
  GQL.ProfessionalDashboardProfileQuery["professionalDashboardProfile"];

export type TProfileCompletion = TProfessionalProfile["completion"];
export type TProfileCompletionSection = TProfileCompletion["sections"][number];
export type TProfileCredential = TProfessionalProfile["credentials"][number];
export type TProfileTaxonomyTerm =
  TProfessionalProfile["mainSkillAreas"][number];

export type TProfileTaxonomyGroup =
  GQL.ProfessionalProfileTaxonomyQuery["professionalProfileTaxonomy"][number];

export type TProfileCpdPlan =
  GQL.ProfessionalCpdPlansQuery["professionalCpdPlans"][number];

export type TMultiSelectOption = {
  value: string;
  label: string;
  groupLabel: string;
};

export type TLearningFormatCard = {
  value: GQL.LearningFormat;
  label: string;
  icon: LucideIcon;
};

// ============== Panel props ==============
type TPanelBase = {
  icon: LucideIcon;
  isDisabled: boolean;
};

export type TBasicProfilePanelProps = TPanelBase & {
  hook: ReturnType<
    typeof import("@/hooks/useProfessionalBasicProfileForm").useProfessionalBasicProfileForm
  >;
  avatar: ReturnType<
    typeof import("@/hooks/useProfessionalAvatar").useProfessionalAvatar
  >;
  profile?: TProfessionalProfile;
};

export type TDetailsPanelProps = TPanelBase & {
  hook: ReturnType<
    typeof import("@/hooks/useProfessionalDetailsForm").useProfessionalDetailsForm
  >;
};

export type TSkillsPanelProps = TPanelBase & {
  hook: ReturnType<
    typeof import("@/hooks/useProfessionalSkillsForm").useProfessionalSkillsForm
  >;
};

export type TPreferencesPanelProps = TPanelBase & {
  hook: ReturnType<
    typeof import("@/hooks/useProfessionalPreferencesForm").useProfessionalPreferencesForm
  >;
};

export type TCredentialsPanelProps = TPanelBase & {
  hook: ReturnType<
    typeof import("@/hooks/useProfessionalCredentials").useProfessionalCredentials
  >;
};

export type TCredentialRhf = UseFormReturn<
  V.TCredentialFormInput,
  unknown,
  V.TCredentialFormValues
>;

export type TProfileAvatarUploaderProps = {
  isDisabled: boolean;
  profile?: TProfessionalProfile;
  avatar: ReturnType<typeof useProfessionalAvatar>;
};
