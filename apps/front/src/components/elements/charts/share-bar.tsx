"use client";

import { ChartMarkTooltip } from "./chart-tooltip";
import { useElementWidth } from "@/hooks/useElementWidth";
import { sharePercent } from "@/utils/chart.util";
import { cn } from "@/lib/utils";

import type { ShareBarProps, ShareLegendProps } from "@/types/chart.types";

const MIN_LABEL_WIDTH = 44;

export const ShareBar = ({
  label,
  segments,
  onSelect,
  unitName,
  shareName,
  className,
  formatShare,
  formatValue,
  size = "md",
}: ShareBarProps) => {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const visible = segments.filter((segment) => segment.value > 0);
  const total = visible.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <div
      ref={ref}
      role="group"
      aria-label={label}
      className={cn("flex gap-0.5", size === "md" ? "h-7" : "h-3.5", className)}
    >
      {total === 0 ? (
        <span className="h-full w-full rounded-md bg-chart-track" />
      ) : null}

      {visible.map((segment) => {
        const percent = sharePercent(segment.value, total);
        const showLabel =
          size === "md" && (percent / 100) * width >= MIN_LABEL_WIDTH;
        const segmentClassName = cn(
          "grid h-full min-w-1 place-items-center overflow-hidden text-xs font-semibold outline-none first:rounded-l-md last:rounded-r-md",
          "focus-visible:ring-[3px] focus-visible:ring-ring/35 hover:brightness-110",
          segment.isLightFill ? "text-foreground" : "text-white",
        );
        const style = {
          flex: `${segment.value} 1 0`,
          background: segment.color,
        };
        const text = showLabel ? formatShare(percent) : null;

        return (
          <ChartMarkTooltip
            key={segment.id}
            title={segment.label}
            rows={[
              {
                id: "value",
                label: unitName,
                value: formatValue(segment.value),
                color: segment.color,
              },
              { id: "share", label: shareName, value: formatShare(percent) },
            ]}
          >
            {onSelect ? (
              <button
                type="button"
                style={style}
                aria-label={`${segment.label}: ${formatValue(segment.value)}`}
                onClick={() => onSelect(segment)}
                className={cn(segmentClassName, "cursor-pointer")}
              >
                {text}
              </button>
            ) : (
              <span
                tabIndex={0}
                style={style}
                aria-label={`${segment.label}: ${formatValue(segment.value)}`}
                className={segmentClassName}
              >
                {text}
              </span>
            )}
          </ChartMarkTooltip>
        );
      })}
    </div>
  );
};

export const ShareLegend = ({
  segments,
  onSelect,
  className,
  formatShare,
  formatValue,
}: ShareLegendProps) => {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  return (
    <ul
      className={cn(
        "@container grid gap-x-6 gap-y-0.5 @md:grid-cols-2",
        className,
      )}
    >
      {segments.map((segment) => {
        const content = (
          <>
            <span
              aria-hidden
              className="size-2.5 rounded-[3px]"
              style={{ background: segment.color }}
            />
            <span className="truncate font-medium text-foreground">
              {segment.label}
            </span>
            <span className="whitespace-nowrap text-xs tabular-nums text-muted-foreground">
              {formatValue(segment.value)} ·{" "}
              {formatShare(sharePercent(segment.value, total))}
            </span>
          </>
        );
        const itemClassName =
          "-mx-1.5 grid w-[calc(100%+0.75rem)] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md px-1.5 py-1.5 text-left text-sm";

        return (
          <li key={segment.id}>
            {onSelect ? (
              <button
                type="button"
                onClick={() => onSelect(segment)}
                className={cn(
                  itemClassName,
                  "cursor-pointer outline-none hover:bg-muted/60 focus-visible:ring-[3px] focus-visible:ring-ring/35",
                )}
              >
                {content}
              </button>
            ) : (
              <div className={itemClassName}>{content}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
};
