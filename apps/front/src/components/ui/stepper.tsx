"use client";

import { cn } from "@/lib/utils";

const steps = ["Profile", "Notifications", "Review"];

export const Stepper = ({ step }: { step: number }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      {steps.map((label, i) => {
        const active = step === i;
        const completed = step > i;

        return (
          <div key={i} className="flex items-center gap-2">
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium border",
                active && "bg-primary text-white border-primary",
                completed && "bg-green-600 text-white border-green-600",
                !active && !completed && "bg-muted text-muted-foreground"
              )}
            >
              {i + 1}
            </div>
            <span
              className={cn(
                "text-sm",
                active ? "font-semibold" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
