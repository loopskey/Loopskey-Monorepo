"use client";

import { TOnboardingStepDescriptor } from "@/types/professional-onboarding.types";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type TOnboardingStepperProps = {
  label: string;
  activeIndex: number;
  steps: TOnboardingStepDescriptor[];
};

export const OnboardingStepper = ({
  steps,
  label,
  activeIndex,
}: TOnboardingStepperProps) => (
  <ol
    aria-label={label}
    className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
  >
    {steps.map((step) => {
      const isActive = step.index === activeIndex;
      const isDone = step.index < activeIndex;

      return (
        <li
          key={step.step}
          aria-current={isActive ? "step" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-3xl border p-4",
            isActive
              ? "border-primary bg-primary/10"
              : "border-glass-border bg-background/45",
            !isActive && !isDone && "opacity-60",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-sm font-medium",
              isActive || isDone
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground",
            )}
          >
            {isDone ? <Check className="h-4 w-4" /> : step.index + 1}
          </span>
          <span
            className={cn(
              "min-w-0 truncate text-sm",
              isActive ? "font-medium" : "text-muted-foreground",
            )}
          >
            {step.label}
          </span>
        </li>
      );
    })}
  </ol>
);
