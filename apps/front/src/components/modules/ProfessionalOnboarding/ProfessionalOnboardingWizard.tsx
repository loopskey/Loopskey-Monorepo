"use client";

import { OnboardingCertificationStep } from "@modules/ProfessionalOnboarding/parts/onboarding-certification-step";
import { useProfessionalOnboarding } from "@/hooks/useProfessionalOnboarding";
import { OnboardingSkillsStep } from "@modules/ProfessionalOnboarding/parts/onboarding-skills-step";
import { OnboardingRoleStep } from "@modules/ProfessionalOnboarding/parts/onboarding-role-step";
import { OnboardingGoalStep } from "@modules/ProfessionalOnboarding/parts/onboarding-goal-step";
import { OnboardingStepper } from "@modules/ProfessionalOnboarding/parts/onboarding-stepper";
import { useEffect, useRef } from "react";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import * as D from "@ui/alert-dialog";
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
    confirmSkip,
    isSkipping,
    isStepValid,
    currentStep,
    openSkipConfirm,
    closeSkipConfirm,
    stepDescriptors,
    isSkipConfirmOpen,
  } = hook;

  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    stepHeadingRef.current?.focus();
  }, [currentStep]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 py-6">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
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
        </div>

        <Button
          radius="xl"
          type="button"
          variant="ghost"
          className="shrink-0"
          onClick={openSkipConfirm}
        >
          {t("professionalOnboarding.actions.skip")}
        </Button>
      </header>

      <OnboardingStepper
        steps={stepDescriptors}
        activeIndex={stepIndex}
        label={t("professionalOnboarding.stepsNav")}
      />

      <GlassCard>
        {currentStep === "goal" && (
          <OnboardingGoalStep hook={hook} headingRef={stepHeadingRef} />
        )}
        {currentStep === "role" && (
          <OnboardingRoleStep hook={hook} headingRef={stepHeadingRef} />
        )}
        {currentStep === "skills" && (
          <OnboardingSkillsStep hook={hook} headingRef={stepHeadingRef} />
        )}
        {currentStep === "certification" && (
          <OnboardingCertificationStep
            hook={hook}
            headingRef={stepHeadingRef}
          />
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          <Button
            radius="xl"
            type="button"
            variant="outline"
            onClick={goBack}
            disabled={stepIndex === 0 || isSaving}
          >
            <L.ArrowLeft aria-hidden className="h-4 w-4" />
            {t("professionalOnboarding.actions.back")}
          </Button>

          <Button
            radius="xl"
            type="button"
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

      <D.AlertDialog
        open={isSkipConfirmOpen}
        onOpenChange={(open) => !open && closeSkipConfirm()}
      >
        <D.AlertDialogContent>
          <D.AlertDialogHeader>
            <D.AlertDialogTitle>
              {t("professionalOnboarding.skip.title")}
            </D.AlertDialogTitle>
            <D.AlertDialogDescription>
              {t("professionalOnboarding.skip.description")}
            </D.AlertDialogDescription>
          </D.AlertDialogHeader>
          <D.AlertDialogFooter>
            <D.AlertDialogCancel disabled={isSkipping}>
              {t("professionalOnboarding.skip.cancel")}
            </D.AlertDialogCancel>
            <D.AlertDialogAction
              disabled={isSkipping}
              onClick={(event) => {
                event.preventDefault();
                void confirmSkip();
              }}
            >
              {isSkipping
                ? t("professionalOnboarding.skip.skipping")
                : t("professionalOnboarding.skip.confirm")}
            </D.AlertDialogAction>
          </D.AlertDialogFooter>
        </D.AlertDialogContent>
      </D.AlertDialog>
    </div>
  );
};

export default ProfessionalOnboardingWizard;
