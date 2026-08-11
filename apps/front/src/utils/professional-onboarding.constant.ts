import { TOnboardingStep } from "@/types/professional-onboarding.types";

import * as GQL from "@/lib/graphql/generated";

export const ONBOARDING_MAX_SKILLS = 3;

export const CERTIFICATION_MIN_QUERY_LENGTH = 2;

export const ONBOARDING_GOALS = [
  GQL.ProfessionalGoal.MaintainCertification,
  GQL.ProfessionalGoal.GrowInCurrentRole,
  GQL.ProfessionalGoal.PrepareForNextRole,
  GQL.ProfessionalGoal.ExploreProfessionalPath,
] as const;

const BASE_STEPS: TOnboardingStep[] = ["goal", "role", "skills"];

export const stepsForGoal = (
  goal: GQL.ProfessionalGoal | null,
): TOnboardingStep[] =>
  goal === GQL.ProfessionalGoal.MaintainCertification
    ? [...BASE_STEPS, "certification"]
    : BASE_STEPS;

export const ONBOARDING_STEP_I18N_KEY: Record<TOnboardingStep, string> = {
  goal: "professionalOnboarding.steps.goal",
  role: "professionalOnboarding.steps.role",
  skills: "professionalOnboarding.steps.skills",
  certification: "professionalOnboarding.steps.certification",
};

export const goalI18nKey = (goal: GQL.ProfessionalGoal, field: string) =>
  `professionalOnboarding.goal.options.${goal}.${field}`;

export const PROFILE_TAB_HREF = "/dashboard/professional?tab=profile";
export const ONBOARDING_HREF = "/dashboard/professional/onboarding";
