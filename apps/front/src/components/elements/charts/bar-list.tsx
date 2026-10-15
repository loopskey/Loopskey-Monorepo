"use client";

import { CHART_COLOR, clampShare } from "@/utils/chart.util";
import { ChartMarkTooltip } from "./chart-tooltip";
import { cn } from "@/lib/utils";

import type { BarListProps, BarListRow } from "@/types/chart.types";

const LABEL_WIDTHS = {
  sm: "@md:grid-cols-[6rem_minmax(0,1fr)_auto]",
  md: "@md:grid-cols-[8rem_minmax(0,1fr)_auto]",
  lg: "@md:grid-cols-[11rem_minmax(0,1fr)_auto]",
} as const;

export const BarList = ({
  max,
  rows,
  label,
  onSelect,
  threshold,
  className,
  valueName,
  targetName,
  formatValue,
  labelWidth = "md",
}: BarListProps) => {
  const top =
    max ??
    Math.max(1, ...rows.map((row) => Math.max(row.value, row.target ?? 0)));

  const tooltipRows = (row: BarListRow) => [
    {
      id: "value",
      label: valueName,
      value: formatValue(row.value),
      color: row.color ?? CHART_COLOR.series1,
    },
    ...(row.target !== undefined
      ? [
          {
            id: "target",
            label: targetName ?? "",
            value: formatValue(row.target),
          },
        ]
      : []),
    ...(threshold
      ? [
          {
            id: "threshold",
            label: threshold.label,
            value: formatValue(threshold.value),
          },
        ]
      : []),
    ...(row.tooltip ?? []),
  ];

  return (
    <ul aria-label={label} className={cn("@container grid gap-2", className)}>
      {rows.map((row) => {
        const content = (
          <>
            <span className="col-start-1 row-start-1 min-w-0 text-sm text-foreground">
              <span className="block truncate">{row.label}</span>
              {row.description ? (
                <span className="block truncate text-xs text-muted-foreground">
                  {row.description}
                </span>
              ) : null}
            </span>

            <span className="relative col-span-2 row-start-2 h-4 @md:col-span-1 @md:col-start-2 @md:row-start-1">
              <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-chart-grid" />
              <span
                className="absolute inset-y-0.5 left-0 rounded-r-[4px] motion-safe:transition-[width] motion-safe:duration-500"
                style={{
                  width: `${clampShare(row.value, top) * 100}%`,
                  background: row.color ?? CHART_COLOR.series1,
                }}
              />
              {row.target !== undefined ? (
                <span
                  aria-hidden
                  className="absolute -inset-y-0.5 w-0.5 -translate-x-1/2 rounded-full bg-foreground"
                  style={{ left: `${clampShare(row.target, top) * 100}%` }}
                />
              ) : null}
              {threshold ? (
                <span
                  aria-hidden
                  className="absolute -inset-y-1.5 border-l-2 border-dashed border-muted-foreground"
                  style={{ left: `${clampShare(threshold.value, top) * 100}%` }}
                />
              ) : null}
            </span>

            <span className="col-start-2 row-start-1 justify-self-end whitespace-nowrap text-sm tabular-nums text-foreground @md:col-start-3">
              {row.valueLabel ?? formatValue(row.value)}
            </span>
          </>
        );

        const rowClassName = cn(
          "-mx-1.5 grid w-[calc(100%+0.75rem)] grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-md px-1.5 py-1 text-left outline-none",
          "hover:bg-muted/60 focus-visible:ring-[3px] focus-visible:ring-ring/35",
          LABEL_WIDTHS[labelWidth],
        );

        return (
          <li key={row.id}>
            <ChartMarkTooltip title={row.label} rows={tooltipRows(row)}>
              {onSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(row)}
                  className={cn(rowClassName, "cursor-pointer")}
                >
                  {content}
                </button>
              ) : (
                <div tabIndex={0} className={rowClassName}>
                  {content}
                </div>
              )}
            </ChartMarkTooltip>
          </li>
        );
      })}
    </ul>
  );
};
