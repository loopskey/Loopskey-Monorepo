import { CHART_COLOR } from "@/utils/chart.util";
import { cn } from "@/lib/utils";

import type { ProgressRingProps } from "@/types/chart.types";

const DEFAULT_SIZE = 128;
const DEFAULT_THICKNESS = 11;

export const ProgressRing = ({
  label,
  value,
  caption,
  percent,
  className,
  size = DEFAULT_SIZE,
  color = CHART_COLOR.series1,
  thickness = DEFAULT_THICKNESS,
}: ProgressRingProps) => {
  const clamped = Math.min(Math.max(percent, 0), 100);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div
      role="img"
      aria-label={label}
      className={cn("relative shrink-0", className)}
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
          stroke={CHART_COLOR.track}
          strokeWidth={thickness}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={thickness}
          strokeLinecap={clamped > 0 ? "round" : "butt"}
          strokeDasharray={`${(circumference * clamped) / 100} ${circumference}`}
          className="motion-safe:transition-[stroke-dasharray] motion-safe:duration-500"
        />
      </svg>
      <div
        aria-hidden
        className="absolute inset-0 flex flex-col items-center justify-center text-center"
      >
        <span
          className={cn(
            "font-semibold leading-none text-foreground",
            size >= 112 ? "text-2xl" : "text-base",
          )}
        >
          {value}
        </span>
        {caption ? (
          <span className="mt-1 max-w-[80%] truncate text-[11px] text-muted-foreground">
            {caption}
          </span>
        ) : null}
      </div>
    </div>
  );
};
