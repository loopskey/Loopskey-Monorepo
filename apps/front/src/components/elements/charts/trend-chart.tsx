"use client";

import { CHART_TOOLTIP_CLASS_NAME, ChartTooltipContent } from "./chart-tooltip";
import { useElementWidth } from "@/hooks/useElementWidth";
import { niceTicks } from "@/utils/chart.util";
import { cn } from "@/lib/utils";

import type { TrendChartProps, TrendDatum } from "@/types/chart.types";
import type { TooltipContentProps } from "recharts";

import * as R from "recharts";

const DEFAULT_HEIGHT = 260;
const NARROW_WIDTH = 480;
const END_LABEL_SPACE = 92;
const END_LABEL_GAP = 30;
const MARGIN = { top: 12, bottom: 4, left: 0 };
const Y_AXIS_WIDTH = 44;
const X_AXIS_HEIGHT = 28;
const DOMAIN_TICKS = 4;
const AXIS_TICK = { fontSize: 11.5, fill: "var(--chart-axis)" } as const;

const numberAt = (row: TrendDatum | undefined, key: string) => {
  const value = row?.[key];
  return typeof value === "number" ? value : null;
};

export const TrendChart = ({
  data,
  xKey,
  label,
  series,
  formatX,
  yDomain,
  isStacked,
  className,
  formatTick,
  formatValue,
  formatTooltipX,
  showEndLabels = true,
  height = DEFAULT_HEIGHT,
}: TrendChartProps) => {
  const { ref, width } = useElementWidth<HTMLDivElement>();
  const isNarrow = width > 0 && width < NARROW_WIDTH;
  const hasEndLabels = showEndLabels && !isStacked && !isNarrow && width > 0;
  const right = hasEndLabels ? END_LABEL_SPACE : 12;

  const maxValue = isStacked
    ? Math.max(
        0,
        ...data.map((row) =>
          series.reduce((sum, item) => sum + (numberAt(row, item.key) ?? 0), 0),
        ),
      )
    : Math.max(
        0,
        ...data.flatMap((row) =>
          series.map((item) => numberAt(row, item.key) ?? 0),
        ),
      );

  const ticks = yDomain
    ? Array.from(
        { length: DOMAIN_TICKS + 1 },
        (_, index) =>
          yDomain[0] + ((yDomain[1] - yDomain[0]) / DOMAIN_TICKS) * index,
      )
    : niceTicks(maxValue);
  const domain: [number, number] = [ticks[0], ticks.at(-1) ?? 1];

  const plotTop = MARGIN.top;
  const plotBottom = height - MARGIN.bottom - X_AXIS_HEIGHT;
  const yOf = (value: number) =>
    plotTop +
    (1 - (value - domain[0]) / (domain[1] - domain[0] || 1)) *
      (plotBottom - plotTop);

  const last = data.at(-1);
  const endLabels = hasEndLabels
    ? series
        .map((item) => ({ item, value: numberAt(last, item.key) }))
        .filter(
          (entry): entry is { item: (typeof series)[number]; value: number } =>
            entry.value !== null,
        )
        .map((entry) => ({ ...entry, y: yOf(entry.value) }))
        .sort((left, right) => left.y - right.y)
        .reduce<{ item: (typeof series)[number]; value: number; y: number }[]>(
          (placed, entry) => {
            const previous = placed.at(-1);
            const y =
              previous && entry.y - previous.y < END_LABEL_GAP
                ? previous.y + END_LABEL_GAP
                : entry.y;
            return [...placed, { ...entry, y }];
          },
          [],
        )
    : [];

  const curveOf = (curve: (typeof series)[number]["curve"]) =>
    curve === "step" ? "stepAfter" : curve === "linear" ? "linear" : "monotone";

  const renderTooltip = ({
    active,
    payload,
    label: x,
  }: TooltipContentProps<number, string>) => {
    if (!active || !payload?.length) return null;
    const title =
      typeof x === "string"
        ? (formatTooltipX ?? formatX ?? String)(x)
        : String(x ?? "");

    return (
      <div className={CHART_TOOLTIP_CLASS_NAME}>
        <ChartTooltipContent
          title={title}
          rows={series.map((item) => {
            const entry = payload.find((point) => point.dataKey === item.key);
            const value = typeof entry?.value === "number" ? entry.value : null;
            return {
              id: item.key,
              label: item.label,
              color: item.color,
              value: value === null ? "—" : formatValue(value),
            };
          })}
        />
      </div>
    );
  };

  return (
    <div
      ref={ref}
      role="img"
      aria-label={label}
      className={cn("relative min-w-0", className)}
      style={{ height }}
    >
      <R.ResponsiveContainer width="100%" height="100%">
        <R.ComposedChart data={data} margin={{ ...MARGIN, right }}>
          <R.CartesianGrid vertical={false} stroke="var(--chart-grid)" />
          <R.XAxis
            dataKey={xKey}
            tick={AXIS_TICK}
            tickLine={false}
            height={X_AXIS_HEIGHT}
            minTickGap={isNarrow ? 16 : 28}
            interval="preserveStartEnd"
            axisLine={{ stroke: "var(--border)" }}
            tickFormatter={
              formatX ? (value: string) => formatX(String(value)) : undefined
            }
          />
          <R.YAxis
            ticks={ticks}
            domain={domain}
            tickLine={false}
            axisLine={false}
            tick={AXIS_TICK}
            width={Y_AXIS_WIDTH}
            allowDataOverflow
            tickFormatter={formatTick ?? formatValue}
          />
          <R.Tooltip
            content={renderTooltip}
            cursor={{ stroke: "var(--chart-axis)", strokeWidth: 1 }}
          />

          {series.map((item) => {
            const isDashed = item.variant === "dashed";
            const activeDot = isDashed
              ? false
              : {
                  r: 4,
                  strokeWidth: 2,
                  stroke: "var(--card)",
                  fill: item.color,
                };

            if (item.variant === "area" || isStacked)
              return (
                <R.Area
                  key={item.key}
                  type={curveOf(item.curve)}
                  dataKey={item.key}
                  name={item.label}
                  stroke={item.color}
                  strokeWidth={2}
                  fill={item.color}
                  fillOpacity={isStacked ? 0.35 : 0.1}
                  stackId={isStacked ? "stack" : undefined}
                  activeDot={activeDot}
                  isAnimationActive={false}
                />
              );

            return (
              <R.Line
                key={item.key}
                type={curveOf(item.curve)}
                dataKey={item.key}
                name={item.label}
                stroke={item.color}
                strokeWidth={2}
                strokeDasharray={isDashed ? "5 5" : undefined}
                dot={false}
                activeDot={activeDot}
                connectNulls={false}
                isAnimationActive={false}
              />
            );
          })}
        </R.ComposedChart>
      </R.ResponsiveContainer>

      {endLabels.map(({ item, value, y }) => (
        <span
          key={item.key}
          aria-hidden
          className="pointer-events-none absolute grid leading-tight"
          style={{ top: y - 8, left: width - END_LABEL_SPACE + 10 }}
        >
          <span className="text-xs font-semibold tabular-nums text-foreground">
            {formatValue(value)}
          </span>
          <span
            className="truncate text-[11px] text-muted-foreground"
            style={{ maxWidth: END_LABEL_SPACE - 14 }}
          >
            {item.shortLabel ?? item.label}
          </span>
        </span>
      ))}

      {hasEndLabels
        ? series
            .filter((item) => item.variant !== "dashed" && !isStacked)
            .map((item) => {
              const value = numberAt(last, item.key);
              if (value === null) return null;
              return (
                <span
                  key={item.key}
                  aria-hidden
                  className="pointer-events-none absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-card"
                  style={{
                    top: yOf(value),
                    left: width - END_LABEL_SPACE,
                    background: item.color,
                  }}
                />
              );
            })
        : null}
    </div>
  );
};

export default TrendChart;
