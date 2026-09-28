"use client";

import { TOnboardingStepProps } from "@/types/professional-onboarding.types";
import { RoleSelector } from "@modules/ProfessionalTaxonomy/role-selector";

export const OnboardingRoleStep = ({
  hook,
  headingRef,
}: TOnboardingStepProps) => {
  const { t, roleChoice, setRoleChoice } = hook;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2
          tabIndex={-1}
          ref={headingRef}
          className="text-2xl font-medium tracking-tight outline-none"
        >
          {t("professionalOnboarding.role.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("professionalOnboarding.role.description")}
        </p>
      </div>

      <RoleSelector
        t={t}
        idPrefix="onboarding-role"
        value={roleChoice}
        onChange={setRoleChoice}
      />
    </div>
  );
};
