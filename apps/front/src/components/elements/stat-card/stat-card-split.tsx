"use client";

import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

import type { StatCardSplitProps } from "@/types/stat-card.types";

export const StatCardSplit = ({
  label,
  segments,
  className,
}: StatCardSplitProps) => {
  const { language } = useI18n();
  const visible = segments.filter((segment) => segment.value > 0);

  return (
    <div className={cn("grid gap-2.5", className)}>
      <div
        role="img"
        aria-label={`${label}: ${segments
          .map((segment) => `${segment.label} ${segment.value}`)
          .join(", ")}`}
        className="flex h-2 gap-0.5"
      >
        {visible.length === 0 ? (
          <span className="h-full w-full rounded-full bg-chart-track" />
        ) : (
          visible.map((segment) => (
            <span
              key={segment.id}
              style={{
                flex: `${segment.value} 1 0`,
                background: segment.color,
              }}
              className="h-full min-w-1 first:rounded-l-full last:rounded-r-full"
            />
          ))
        )}
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
        {segments.map((segment) => (
          <li key={segment.id} className="inline-flex items-center gap-1.5">
            <span
              aria-hidden
              className="size-2.5 rounded-[3px]"
              style={{ background: segment.color }}
            />
            <span>{segment.label}</span>
            <span className="font-semibold tabular-nums text-foreground">
              {segment.value.toLocaleString(language)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
