"use client";

import { WizardStepListProps } from "@/types/wizard-stepper.types";
import { WIZARD_STEP_FOCUS } from "@elements/wizard-step-node";
import { WIZARD_STEP_TITLE } from "@elements/wizard-step-node";
import { WizardStepNode } from "@elements/wizard-step-node";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

export const WizardStepperCondensed = <TKey extends string | number>({
  steps,
  onSelect,
}: WizardStepListProps<TKey>) => {
  const { t } = useI18n();

  return (
    <ol className="flex min-w-0 flex-1 items-center gap-3">
      {steps.map((step) => {
        const isLocked = step.status === "locked";

        return (
          <li
            key={step.key}
            className={cn(
              "flex min-w-0 items-center gap-3",
              !step.isLast && "flex-1",
            )}
          >
            <button
              type="button"
              aria-disabled={isLocked || undefined}
              title={isLocked ? step.hint : undefined}
              aria-current={step.isActive ? "step" : undefined}
              onClick={() => !isLocked && onSelect(step.key)}
              className={cn(
                "flex min-h-11 min-w-0 items-center gap-2 rounded-lg px-1",
                WIZARD_STEP_FOCUS,
                isLocked ? "cursor-not-allowed" : "hover:bg-muted/60",
              )}
            >
              <WizardStepNode
                size="xs"
                number={step.number}
                status={step.status}
              />

              <span
                className={cn(
                  "truncate text-sm",
                  WIZARD_STEP_TITLE[step.status],
                )}
              >
                {step.title}
              </span>

              <span className="sr-only">
                {t(`common.wizardStepper.status.${step.status}`)}
              </span>
            </button>

            {!step.isLast && (
              <span
                aria-hidden
                className={cn(
                  "h-0.5 min-w-4 flex-1 rounded-full transition-colors",
                  step.isConnected ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
};
