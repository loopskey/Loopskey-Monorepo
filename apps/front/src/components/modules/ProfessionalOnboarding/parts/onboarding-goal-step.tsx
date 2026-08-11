"use client";

import { TOnboardingStepProps } from "@/types/professional-onboarding.types";
import { cn } from "@/lib/utils";

import * as L from "lucide-react";

export const OnboardingGoalStep = ({ hook }: TOnboardingStepProps) => {
  const { t, goal, goalOptions, chooseGoal } = hook;

  return (
    <fieldset className="space-y-6">
      <legend className="space-y-2">
        <h2 className="text-2xl font-medium tracking-tight">
          {t("professionalOnboarding.goal.title")}
        </h2>
        <p className="text-muted-foreground">
          {t("professionalOnboarding.goal.description")}
        </p>
      </legend>

      <div
        role="radiogroup"
        aria-label={t("professionalOnboarding.goal.title")}
        className="grid gap-4 md:grid-cols-2"
      >
        {goalOptions.map((option) => {
          const isSelected = goal === option.value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => chooseGoal(option.value)}
              className={cn(
                "flex items-start gap-3 rounded-3xl border p-5 text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-glass-border bg-background/45 hover:border-primary/40",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/50",
                )}
              >
                {isSelected && <L.Check className="h-3 w-3" />}
              </span>

              <span className="min-w-0">
                <span className="block font-medium">{option.title}</span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {option.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};
