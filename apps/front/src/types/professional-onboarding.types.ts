import type { ProfessionalGoal } from "@/lib/graphql/base";

export type TOnboardingStep = "goal" | "role" | "skills" | "certification";

export type TOnboardingStepDescriptor = {
  label: string;
  index: number;
  step: TOnboardingStep;
};

export type TOnboardingGoalOption = {
  title: string;
  description: string;
  value: ProfessionalGoal;
};

export type TOnboardingRoleOption = {
  id: string;
  label: string;
};

export type TOnboardingSkillOption = {
  id: string;
  label: string;
  groupLabel: string;
};

export type TOnboardingCertificationOption = {
  id: string;
  name: string;
  abbreviation: string;
  organization: string;
};

export type TOnboardingCertificationChoice =
  | { kind: "none" }
  | { kind: "catalogue"; option: TOnboardingCertificationOption }
  | { kind: "manual"; name: string; issuer: string };

export type TOnboardingHook = ReturnType<
  typeof import("@/hooks/useProfessionalOnboarding").useProfessionalOnboarding
>;

export type TOnboardingStepProps = {
  hook: TOnboardingHook;
};
