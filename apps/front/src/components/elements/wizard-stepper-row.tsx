"use client";

import { WizardStepListProps } from "@/types/wizard-stepper.types";
import { WIZARD_STEP_FOCUS } from "@elements/wizard-step-node";
import { WIZARD_STEP_TITLE } from "@elements/wizard-step-node";
import { WizardStepNode } from "@elements/wizard-step-node";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

export const WizardStepperRow = <TKey extends string | number>({
  steps,
  onSelect,
}: WizardStepListProps<TKey>) => {
  const { t } = useI18n();

  return (
    <ol className="grid auto-cols-fr grid-flow-col gap-3">
      {steps.map((step) => {
        const isLocked = step.status === "locked";

        return (
          <li key={step.key} className="min-w-0">
            <button
              type="button"
              aria-disabled={isLocked || undefined}
              aria-current={step.isActive ? "step" : undefined}
              onClick={() => !isLocked && onSelect(step.key)}
              className={cn(
                "-m-1 flex min-h-11 w-[calc(100%+0.5rem)] flex-col gap-2.5 rounded-lg p-1 text-left",
                WIZARD_STEP_FOCUS,
                isLocked ? "cursor-not-allowed" : "hover:bg-muted/60",
              )}
            >
              <span aria-hidden className="flex w-full items-center gap-2.5">
                <WizardStepNode number={step.number} status={step.status} />

                {!step.isLast && (
                  <span
                    className={cn(
                      "h-0.5 flex-1 rounded-full transition-colors",
                      step.isConnected ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </span>

              <span className="block min-w-0">
                <span
                  className={cn(
                    "block truncate text-sm leading-5",
                    WIZARD_STEP_TITLE[step.status],
                  )}
                >
                  {step.title}
                </span>

                {step.hint && (
                  <span
                    className={cn(
                      "mt-0.5 line-clamp-2 block text-xs leading-4",
                      step.status === "problem"
                        ? "text-destructive"
                        : "text-muted-foreground",
                    )}
                  >
                    {step.hint}
                  </span>
                )}
              </span>

              <span className="sr-only">
                {t(`common.wizardStepper.status.${step.status}`)}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
};
