"use client";

import { TOnboardingStepperProps } from "@/types/professional-onboarding.types";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const OnboardingStepper = ({
  steps,
  label,
  activeIndex,
}: TOnboardingStepperProps) => (
  <ol
    aria-label={label}
    className="grid grid-cols-2 gap-3 sm:flex sm:flex-nowrap sm:items-center sm:gap-2"
  >
    {steps.map((step, position) => {
      const isActive = step.index === activeIndex;
      const isDone = step.index < activeIndex;
      const Icon = step.icon;

      return (
        <li
          key={step.step}
          className="flex min-w-0 items-center gap-2 sm:flex-1"
        >
          <div
            aria-current={isActive ? "step" : undefined}
            className={cn(
              "flex min-w-0 flex-1 items-center gap-3 rounded-lg border p-4",
              isActive
                ? "border-primary bg-primary/10"
                : "border-border bg-muted",
              !isActive && !isDone && "opacity-60",
            )}
          >
            <span
              aria-hidden
              className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sm font-medium",
                isActive || isDone
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {isDone ? (
                <Check className="h-4 w-4" />
              ) : (
                <Icon className="h-4 w-4" />
              )}
            </span>
            <span
              className={cn(
                "min-w-0 truncate text-sm",
                isActive ? "font-medium" : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </div>

          {position < steps.length - 1 && (
            <span
              aria-hidden
              className={cn(
                "hidden h-0.5 w-4 shrink-0 rounded-full sm:block",
                isDone ? "bg-primary" : "bg-border",
              )}
            />
          )}
        </li>
      );
    })}
  </ol>
);
