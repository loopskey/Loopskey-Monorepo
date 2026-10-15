"use client";

import { CHART_COLOR, clampShare } from "@/utils/chart.util";
import { ChartMarkTooltip } from "./chart-tooltip";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

import type { ProgressMeterProps } from "@/types/chart.types";

const MARKER_EDGE = 0.12;

export const ProgressMeter = ({
  max,
  value,
  label,
  marker,
  className,
  size = "md",
  showScale = true,
  color = CHART_COLOR.series1,
  formatValue = (amount) => amount.toLocaleString(),
}: ProgressMeterProps) => {
  const { t } = useI18n();
  const share = clampShare(value, max);
  const markerShare = marker ? clampShare(marker.value, max) : null;
  const markerAlign =
    markerShare === null
      ? ""
      : markerShare < MARKER_EDGE
        ? "left-0"
        : markerShare > 1 - MARKER_EDGE
          ? "right-0"
          : "left-1/2 -translate-x-1/2";

  return (
    <div className={cn("grid gap-1.5", marker && "pt-5", className)}>
      <ChartMarkTooltip
        title={label}
        rows={[
          {
            id: "value",
            label: t("chart.value"),
            value: formatValue(value),
            color,
          },
          ...(marker
            ? [
                {
                  id: "marker",
                  label: marker.label,
                  value: formatValue(marker.value),
                },
              ]
            : []),
          { id: "max", label: t("chart.total"), value: formatValue(max) },
        ]}
      >
        <div
          tabIndex={0}
          role="meter"
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={Math.min(value, max)}
          aria-valuetext={`${formatValue(value)} / ${formatValue(max)}`}
          className={cn(
            "relative rounded-full bg-chart-track outline-none focus-visible:ring-[3px] focus-visible:ring-ring/35",
            size === "md" ? "h-2.5" : "h-1.5",
          )}
        >
          <span
            className="absolute inset-y-0 left-0 rounded-full motion-safe:transition-[width] motion-safe:duration-500"
            style={{ width: `${share * 100}%`, background: color }}
          />
          {markerShare !== null && marker ? (
            <span
              aria-hidden
              className="absolute -inset-y-1 w-0.5 -translate-x-1/2 rounded-full bg-foreground"
              style={{ left: `${markerShare * 100}%` }}
            >
              <span
                className={cn(
                  "absolute bottom-[calc(100%+0.25rem)] whitespace-nowrap text-[11px] text-muted-foreground",
                  markerAlign,
                )}
              >
                {marker.label}
              </span>
            </span>
          ) : null}
        </div>
      </ChartMarkTooltip>

      {showScale ? (
        <div className="flex justify-between text-[11px] tabular-nums text-muted-foreground">
          <span>{formatValue(0)}</span>
          <span>{formatValue(max)}</span>
        </div>
      ) : null}
    </div>
  );
};
