"use client";

import { TProviderEventStepper } from "@/types/provider-dashboard.types";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export const ProviderEventStepper = ({
  steps,
  onChange,
  activeStep,
}: TProviderEventStepper) => {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {steps.map((step, index) => {
        const isActive = activeStep === step.value;
        const isDone = activeStep > step.value;

        return (
          <button
            key={step.value}
            type="button"
            onClick={() => onChange(step.value)}
            className={cn(
              "relative flex items-center gap-3 rounded-3xl border p-4 text-left transition-all",
              isActive
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                : "border-glass-border bg-background/45 hover:border-primary/40",
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-medium",
                isActive || isDone
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {isDone ? <Check className="h-4 w-4" /> : step.value}
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground">
                Step {step.value}
              </p>
              <p className="truncate font-medium">{step.title}</p>
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                {step.description}
              </p>
            </div>

            {index < steps.length - 1 && (
              <span className="pointer-events-none absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 rotate-45 border-r border-t border-glass-border bg-background md:block" />
            )}
          </button>
        );
      })}
    </div>
  );
};
