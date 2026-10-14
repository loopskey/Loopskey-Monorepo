"use client";

import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

import type { RoadmapBriefRingProps } from "@/types/professional-roadmap-chat.types";

const RADIUS = 18;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const RoadmapBriefRing = ({
  required,
  completed,
  className,
  showLabel = false,
}: RoadmapBriefRingProps) => {
  const { t } = useI18n();
  const ratio = required > 0 ? Math.min(completed / required, 1) : 1;
  const isComplete = ratio >= 1;

  return (
    <span
      role="img"
      className={cn("relative grid shrink-0 place-items-center", className)}
      aria-label={t("professionalRoadmapChat.review.briefProgressValue", {
        completed,
        required,
      })}
    >
      <svg
        viewBox="0 0 44 44"
        className="absolute inset-0 size-full -rotate-90"
      >
        <circle
          cx="22"
          cy="22"
          r={RADIUS}
          fill="none"
          strokeWidth="5"
          className="stroke-muted"
        />
        <circle
          cx="22"
          cy="22"
          r={RADIUS}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - ratio)}
          className={cn(
            "transition-[stroke-dashoffset] duration-500 motion-reduce:transition-none",
            isComplete ? "stroke-success" : "stroke-primary",
          )}
        />
      </svg>
      {showLabel ? (
        <span className="relative text-xs font-semibold tabular-nums">
          {completed}/{required}
        </span>
      ) : null}
    </span>
  );
};
