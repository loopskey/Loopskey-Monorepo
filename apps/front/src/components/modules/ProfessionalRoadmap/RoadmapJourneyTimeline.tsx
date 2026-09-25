"use client";

import { TRoadmapJourneyTimelineProps } from "@/types/professional-roadmap-chat.types";
import { GlassCard } from "@elements/glass-card";
import { cn } from "@/lib/utils";

import * as L from "lucide-react";

const KEY = "professionalDashboard.roadmap";

const HORIZONTAL_MAX_PHASES = 5;

export const RoadmapJourneyTimeline = ({
  t,
  phases,
  currentPhaseId,
}: TRoadmapJourneyTimelineProps) => {
  const horizontal = phases.length <= HORIZONTAL_MAX_PHASES;

  return (
    <GlassCard className="p-5">
      <h3 className="text-sm font-medium text-muted-foreground">
        {t(`${KEY}.journeyTimeline`)}
      </h3>

      <ol
        className={cn(
          "mt-4 flex flex-col gap-6",
          horizontal && "md:flex-row md:gap-3",
        )}
      >
        {phases.map((phase, index) => {
          const isCurrent = phase.id === currentPhaseId;
          const isLast = index === phases.length - 1;

          return (
            <li
              key={phase.id}
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "flex gap-3",
                horizontal && "md:flex-1 md:flex-col md:items-center",
              )}
            >
              <div
                className={cn(
                  "flex flex-col items-center",
                  horizontal && "md:w-full md:flex-row",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium",
                    phase.completed
                      ? "border-primary bg-primary text-primary-foreground"
                      : isCurrent
                        ? "border-primary text-primary"
                        : "border-muted-foreground/30 text-muted-foreground",
                  )}
                >
                  {phase.completed ? (
                    <L.Check className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>

                {!isLast ? (
                  <div
                    aria-hidden="true"
                    className={cn(
                      "bg-border",
                      horizontal
                        ? "mt-2 h-6 w-px md:mt-0 md:ml-2 md:h-px md:w-full md:flex-1"
                        : "mt-2 h-6 w-px",
                    )}
                  />
                ) : null}
              </div>

              <div
                className={cn(
                  "min-w-0",
                  horizontal && "md:mt-2 md:text-center",
                )}
              >
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCurrent && "text-primary",
                  )}
                >
                  {phase.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {phase.completedSteps}/{phase.stepsCount}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </GlassCard>
  );
};
