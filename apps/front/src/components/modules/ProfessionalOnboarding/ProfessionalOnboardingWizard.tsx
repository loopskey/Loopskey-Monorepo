"use client";

import { OnboardingCertificationStep } from "@modules/ProfessionalOnboarding/parts/onboarding-certification-step";
import { useProfessionalOnboarding } from "@/hooks/useProfessionalOnboarding";
import { OnboardingSkillsStep } from "@modules/ProfessionalOnboarding/parts/onboarding-skills-step";
import { OnboardingStepper } from "@modules/ProfessionalOnboarding/parts/onboarding-stepper";
import { OnboardingRoleStep } from "@modules/ProfessionalOnboarding/parts/onboarding-role-step";
import { OnboardingGoalStep } from "@modules/ProfessionalOnboarding/parts/onboarding-goal-step";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import * as L from "lucide-react";

const ProfessionalOnboardingWizard = () => {
  const hook = useProfessionalOnboarding();
  const {
    t,
    steps,
    goNext,
    goBack,
    isSaving,
    stepIndex,
    isLastStep,
    isStepValid,
    currentStep,
    stepDescriptors,
  } = hook;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 py-6">
      <header className="space-y-2">
        <p className="text-sm font-medium text-primary">
          {t("professionalOnboarding.eyebrow")}
        </p>
        <h1 className="text-3xl font-medium tracking-tight">
          {t("professionalOnboarding.title")}
        </h1>
        <p aria-live="polite" className="text-sm text-muted-foreground">
          {t("professionalOnboarding.stepLabel", {
            current: stepIndex + 1,
            total: steps.length,
          })}
        </p>
      </header>

      <OnboardingStepper
        steps={stepDescriptors}
        activeIndex={stepIndex}
        label={t("professionalOnboarding.stepsNav")}
      />

      <GlassCard>
        {currentStep === "goal" && <OnboardingGoalStep hook={hook} />}
        {currentStep === "role" && <OnboardingRoleStep hook={hook} />}
        {currentStep === "skills" && <OnboardingSkillsStep hook={hook} />}
        {currentStep === "certification" && (
          <OnboardingCertificationStep hook={hook} />
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            radius="xl"
            type="button"
            variant="glass"
            onClick={goBack}
            disabled={stepIndex === 0 || isSaving}
          >
            <L.ArrowLeft aria-hidden className="h-4 w-4" />
            {t("professionalOnboarding.actions.back")}
          </Button>

          <Button
            radius="xl"
            type="button"
            variant="brand"
            onClick={goNext}
            disabled={!isStepValid || isSaving}
          >
            {isSaving && (
              <L.Loader2 aria-hidden className="h-4 w-4 animate-spin" />
            )}
            {isSaving
              ? t("professionalOnboarding.actions.saving")
              : isLastStep
                ? t("professionalOnboarding.actions.finish")
                : t("professionalOnboarding.actions.next")}
            {!isSaving && !isLastStep && (
              <L.ArrowRight aria-hidden className="h-4 w-4" />
            )}
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};

export default ProfessionalOnboardingWizard;
