"use client";

import { TWizardStepperProps } from "@/types/wizard-stepper.types";
import { Check, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * One stepper for every multi-step flow in the dashboards.
 *
 * The three wizards that need one key their steps differently — numbers in Log
 * activity, string keys in the requirement and learning-content editors — so
 * the key is generic and each caller decides which steps are complete,
 * reachable or carrying a problem. This component only draws that state.
 */
export const WizardStepper = <TKey extends string | number>({
  label,
  steps,
  activeKey,
  onSelect,
  isSticky = false,
}: TWizardStepperProps<TKey>) => (
  <nav
    aria-label={label}
    className={cn(isSticky && "sticky top-16 z-30 bg-background/80 py-2")}
  >
    <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, index) => {
        const isActive = step.key === activeKey;
        const isDone = Boolean(step.isComplete) && !isActive;
        const isReachable = step.isReachable ?? true;
        const hasProblem = Boolean(step.hasProblem);

        return (
          <li key={step.key} className="min-w-0">
            <button
              type="button"
              disabled={!isReachable}
              aria-current={isActive ? "step" : undefined}
              onClick={() => onSelect(step.key)}
              className={cn(
                "relative flex min-h-16 w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isActive
                  ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                  : "border-border bg-muted",
                isReachable && !isActive && "hover:border-primary/40",
                !isReachable && "cursor-not-allowed opacity-60",
                hasProblem && "border-destructive",
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-sm font-medium tabular-nums",
                  hasProblem
                    ? "bg-destructive text-destructive-foreground"
                    : isActive || isDone
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground",
                )}
              >
                {hasProblem ? (
                  <TriangleAlert className="h-4 w-4" aria-hidden />
                ) : isDone ? (
                  <Check className="h-4 w-4" aria-hidden />
                ) : (
                  index + 1
                )}
              </span>

              <span className="min-w-0">
                <span className="block truncate font-medium leading-snug">
                  {step.title}
                </span>

                {step.description && (
                  <span className="mt-1 line-clamp-2 block text-xs text-muted-foreground">
                    {step.description}
                  </span>
                )}
              </span>

              {index < steps.length - 1 && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 rotate-45 border-r border-t border-border bg-background lg:block"
                />
              )}
            </button>
          </li>
        );
      })}
    </ol>
  </nav>
);
