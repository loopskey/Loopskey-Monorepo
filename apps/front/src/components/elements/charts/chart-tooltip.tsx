"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@ui/tooltip";

import type { ChartTooltipContentProps } from "@/types/chart.types";
import type { ReactElement } from "react";

export const CHART_TOOLTIP_CLASS_NAME =
  "min-w-36 max-w-64 rounded-lg border bg-popover px-3 py-2 text-popover-foreground shadow-lg [&>svg]:bg-popover [&>svg]:fill-popover";

export const ChartTooltipContent = ({
  title,
  rows,
}: ChartTooltipContentProps) => (
  <div className="grid gap-1 text-xs">
    <p className="text-muted-foreground">{title}</p>
    {rows.map((row) => (
      <p
        key={row.id}
        className="grid grid-cols-[0.875rem_minmax(0,1fr)_auto] items-center gap-2"
      >
        <span
          aria-hidden
          className="h-0.5 w-3.5 rounded-full"
          style={{ background: row.color ?? "transparent" }}
        />
        <span className="truncate">{row.label}</span>
        <span className="font-semibold tabular-nums text-foreground">
          {row.value}
        </span>
      </p>
    ))}
  </div>
);

export const ChartMarkTooltip = ({
  title,
  rows,
  children,
}: ChartTooltipContentProps & { children: ReactElement }) => (
  <Tooltip>
    <TooltipTrigger asChild>{children}</TooltipTrigger>
    <TooltipContent className={CHART_TOOLTIP_CLASS_NAME} sideOffset={6}>
      <ChartTooltipContent title={title} rows={rows} />
    </TooltipContent>
  </Tooltip>
);
