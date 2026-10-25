"use client";

import { ChevronDown, TriangleAlert } from "lucide-react";
import { WizardStepCompactProps } from "@/types/wizard-stepper.types";
import { WIZARD_STEP_EYEBROW } from "@elements/wizard-step-node";
import { WIZARD_STEP_FOCUS } from "@elements/wizard-step-node";
import { WIZARD_STEP_TITLE } from "@elements/wizard-step-node";
import { useId, useState } from "react";
import { WizardStepNode } from "@elements/wizard-step-node";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

export const WizardStepperCompact = <TKey extends string | number>({
  steps,
  onSelect,
  stepOfText,
}: WizardStepCompactProps<TKey>) => {
  const { t } = useI18n();
  const listId = useId();
  const [isOpen, setIsOpen] = useState(false);

  const activeIndex = Math.max(
    steps.findIndex((step) => step.isActive),
    0,
  );
  const active = steps[activeIndex];
  const next = steps[activeIndex + 1];
  const problem = steps.find((step) => step.status === "problem");

  const select = (key: TKey) => {
    onSelect(key);
    setIsOpen(false);
  };

  return (
    <div className="rounded-lg border bg-card px-4 pb-3.5 pt-3 shadow-sm sm:hidden">
      <div className="flex items-center justify-between gap-3">
        <p aria-live="polite" className={WIZARD_STEP_EYEBROW}>
          {stepOfText}
        </p>

        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listId : undefined}
          onClick={() => setIsOpen((current) => !current)}
          className={cn(
            "-my-2 -mr-2 flex min-h-11 items-center gap-1 rounded-lg px-2 text-sm font-medium text-primary",
            WIZARD_STEP_FOCUS,
          )}
        >
          {t("common.wizardStepper.allSteps")}

          <ChevronDown
            aria-hidden
            className={cn(
              "size-4 transition-transform motion-reduce:transition-none",
              isOpen && "rotate-180",
            )}
          />
        </button>
      </div>

      <p className="mt-1 text-base font-semibold text-primary">
        {active.title}
      </p>

      <div aria-hidden className="mt-2.5 grid auto-cols-fr grid-flow-col gap-1">
        {steps.map((step, index) => (
          <span
            key={step.key}
            className={cn(
              "h-1 rounded-full transition-colors",
              index <= activeIndex ? "bg-primary" : "bg-border",
            )}
          />
        ))}
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {next
          ? t("common.wizardStepper.nextStep", { title: next.title })
          : t("common.wizardStepper.lastStep")}
      </p>

      {problem && !problem.isActive && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-destructive">
          <TriangleAlert aria-hidden className="size-3.5 shrink-0" />

          {problem.title}
        </p>
      )}

      {isOpen && (
        <ol id={listId} className="mt-3 border-t pt-2">
          {steps.map((step) => {
            const isLocked = step.status === "locked";

            return (
              <li key={step.key} className="relative">
                {!step.isLast && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -bottom-1.5 left-3.25 top-9 w-0.5 rounded-full",
                      step.isConnected ? "bg-primary" : "bg-border",
                    )}
                  />
                )}

                <button
                  type="button"
                  aria-disabled={isLocked || undefined}
                  aria-current={step.isActive ? "step" : undefined}
                  onClick={() => !isLocked && select(step.key)}
                  className={cn(
                    "relative flex min-h-11 w-full items-start gap-3 rounded-lg py-1.5 text-left",
                    WIZARD_STEP_FOCUS,
                    isLocked ? "cursor-not-allowed" : "hover:bg-muted/60",
                  )}
                >
                  <WizardStepNode
                    size="sm"
                    number={step.number}
                    status={step.status}
                  />

                  <span className="min-w-0 pt-0.5">
                    <span
                      className={cn(
                        "block text-sm leading-5",
                        WIZARD_STEP_TITLE[step.status],
                      )}
                    >
                      {step.title}
                    </span>

                    {step.hint && (
                      <span
                        className={cn(
                          "block text-xs leading-4",
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
      )}
    </div>
  );
};
