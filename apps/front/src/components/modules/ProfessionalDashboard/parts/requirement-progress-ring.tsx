"use client";

import { useChartSemantics } from "@hooks/useChartPalette";

import type { TRequirementProgressRingProps } from "@/types/professional-requirement.types";

const STROKE = 8;
const DEFAULT_SIZE = 88;

export const RequirementProgressRing = ({
  size = DEFAULT_SIZE,
  percent,
  ariaLabel,
}: TRequirementProgressRingProps) => {
  const semantics = useChartSemantics();
  const clamped = Math.min(Math.max(percent, 0), 100);
  const radius = (size - STROKE) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className="relative shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={semantics.track}
          strokeWidth={STROKE}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeLinecap="round"
          stroke={semantics.onTrack}
          strokeWidth={STROKE}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 300ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-base font-medium tabular-nums text-primary">
        {Math.round(clamped)}%
      </div>
    </div>
  );
};

export default RequirementProgressRing;
