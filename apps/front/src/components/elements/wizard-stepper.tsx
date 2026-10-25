"use client";

import { WizardStepperCondensed } from "@elements/wizard-stepper-condensed";
import { WizardStepperCompact } from "@elements/wizard-stepper-compact";
import { buildWizardStepViews } from "@utils/wizard-stepper.util";
import { TWizardStepperProps } from "@/types/wizard-stepper.types";
import { WIZARD_STEP_EYEBROW } from "@elements/wizard-step-node";
import { WizardStepperRow } from "@elements/wizard-stepper-row";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

export const WizardStepper = <TKey extends string | number>({
  label,
  steps,
  onSelect,
  activeKey,
  isSticky = false,
}: TWizardStepperProps<TKey>) => {
  const { t } = useI18n();

  const views = buildWizardStepViews({
    steps,
    activeKey,
    needsAttentionText: t("common.wizardStepper.status.problem"),
  });

  const stepOfText = t("common.wizardStepper.stepOf", {
    current:
      Math.max(
        views.findIndex((view) => view.isActive),
        0,
      ) + 1,
    total: views.length,
  });

  return (
    <nav
      aria-label={label}
      className={cn(isSticky && "sticky top-16 z-30 bg-background/80 py-2")}
    >
      <WizardStepperCompact
        steps={views}
        onSelect={onSelect}
        stepOfText={stepOfText}
      />

      {isSticky ? (
        <div className="hidden items-center gap-4 rounded-lg border bg-card px-4 shadow-sm sm:flex">
          <p aria-live="polite" className={cn(WIZARD_STEP_EYEBROW, "shrink-0")}>
            {stepOfText}
          </p>

          <span aria-hidden className="h-6 w-px shrink-0 bg-border" />

          <WizardStepperCondensed steps={views} onSelect={onSelect} />
        </div>
      ) : (
        <div className="hidden rounded-lg border bg-card px-6 pb-5 pt-4 shadow-sm sm:block">
          <p aria-live="polite" className={cn(WIZARD_STEP_EYEBROW, "mb-3.5")}>
            {stepOfText}
          </p>

          <WizardStepperRow steps={views} onSelect={onSelect} />
        </div>
      )}
    </nav>
  );
};
