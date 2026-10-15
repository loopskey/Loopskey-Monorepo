"use client";

import { heatmapBin, isLightHeatmapBin } from "@/utils/chart.util";
import { CHART_SEQUENCE, HEATMAP_BINS } from "@/utils/chart.util";
import { ChartMarkTooltip } from "./chart-tooltip";
import { Skeleton } from "@ui/skeleton";
import { cn } from "@/lib/utils";

import type { HeatmapProps, HeatmapRowProps } from "@/types/chart.types";

const MIN_COLUMN_REM = 5.5;

export const Heatmap = ({
  label,
  columns,
  children,
  rowHeader,
  className,
  scaleLabel,
}: HeatmapProps) => (
  <div className={cn("grid gap-3", className)}>
    <div className="overflow-x-auto">
      <table
        className="w-full table-fixed border-separate border-spacing-0.5 text-sm"
        style={{ minWidth: `${8 + columns.length * MIN_COLUMN_REM}rem` }}
      >
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="w-32 px-1 pb-1 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
            >
              {rowHeader}
            </th>
            {columns.map((column) => (
              <th
                key={column.id}
                scope="col"
                title={column.label}
                className="truncate px-1 pb-1 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>

    <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
      <span>{scaleLabel}</span>
      <span className="flex gap-0.5" aria-hidden>
        {CHART_SEQUENCE.map((color, index) => (
          <span
            key={color}
            className="h-2.5 w-6 first:rounded-l-sm last:rounded-r-sm"
            style={{ background: color }}
            title={`${HEATMAP_BINS[index]}%+`}
          />
        ))}
      </span>
      <span className="tabular-nums">
        {HEATMAP_BINS[0]}% → {HEATMAP_BINS.at(-1)}%+
      </span>
    </div>
  </div>
);

export const HeatmapRow = ({
  label,
  values,
  columns,
  isLoading,
  valueName,
  emptyLabel,
  formatValue,
}: HeatmapRowProps) => (
  <tr>
    <th
      scope="row"
      title={label}
      className="truncate pr-2 text-left font-medium text-foreground"
    >
      {label}
    </th>
    {columns.map((column, index) => {
      const value = values[index] ?? null;

      if (isLoading)
        return (
          <td key={column.id}>
            <Skeleton className="h-9 w-full rounded-sm" />
          </td>
        );

      if (value === null)
        return (
          <td
            key={column.id}
            className="h-9 rounded-sm bg-muted text-center text-xs text-muted-foreground"
          >
            {emptyLabel}
          </td>
        );

      const bin = heatmapBin(value);

      return (
        <td key={column.id} className="p-0">
          <ChartMarkTooltip
            title={`${label} · ${column.label}`}
            rows={[
              {
                id: "value",
                label: valueName,
                value: formatValue(value),
                color: CHART_SEQUENCE[bin],
              },
            ]}
          >
            <span
              tabIndex={0}
              className={cn(
                "grid h-9 place-items-center rounded-sm text-xs font-semibold tabular-nums outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35",
                isLightHeatmapBin(bin) ? "text-foreground" : "text-white",
              )}
              style={{ background: CHART_SEQUENCE[bin] }}
            >
              {formatValue(value)}
            </span>
          </ChartMarkTooltip>
        </td>
      );
    })}
  </tr>
);
