"use client";

import { ChartColumn, RotateCcw, Sheet, TriangleAlert } from "lucide-react";
import { ChartLegend } from "./chart-legend";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import type { ChartFrameProps } from "@/types/chart.types";

export const ChartFrame = ({
  title,
  table,
  error,
  legend,
  action,
  isEmpty,
  children,
  isLoading,
  className,
  emptyLabel,
  description,
  skeletonClassName,
  headingLevel = "h3",
}: ChartFrameProps) => {
  const { t } = useI18n();
  const [isTableView, setIsTableView] = useState(false);
  const Heading = headingLevel;
  const canToggle = Boolean(table) && !isLoading && !isEmpty && !error;
  const showTable = canToggle && isTableView;

  const body = () => {
    if (error)
      return (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed p-5">
          <p
            role="alert"
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <TriangleAlert
              aria-hidden
              className="size-4 shrink-0 text-destructive"
            />
            {error.message}
          </p>
          <Button
            size="sm"
            radius="lg"
            type="button"
            variant="outline"
            onClick={error.onRetry}
          >
            <RotateCcw aria-hidden />
            {error.retryLabel}
          </Button>
        </div>
      );

    if (isLoading)
      return (
        <Skeleton
          aria-busy="true"
          className={cn("h-64 w-full rounded-lg", skeletonClassName)}
        />
      );

    if (isEmpty)
      return (
        <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-lg border border-dashed px-6 py-8 text-center text-sm text-muted-foreground">
          <ChartColumn aria-hidden className="size-6" />
          {emptyLabel ?? t("chart.empty")}
        </div>
      );

    if (showTable && table)
      return (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full border-separate border-spacing-0 text-left text-sm">
            <caption className="sr-only">{table.caption}</caption>
            <thead>
              <tr>
                {table.columns.map((column, index) => (
                  <th
                    key={column}
                    scope="col"
                    className={cn(
                      "h-10 whitespace-nowrap border-b bg-muted px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground first:pl-4",
                      index > 0 && "text-right",
                    )}
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row) => (
                <tr key={row.id} className="[&:last-child>*]:border-b-0">
                  {row.cells.map((cell, index) =>
                    index === 0 ? (
                      <th
                        key={index}
                        scope="row"
                        className="border-b px-3 py-2 font-medium text-foreground first:pl-4"
                      >
                        {cell}
                      </th>
                    ) : (
                      <td
                        key={index}
                        className="whitespace-nowrap border-b px-3 py-2 text-right tabular-nums"
                      >
                        {cell}
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    return children;
  };

  return (
    <section
      aria-label={title}
      className={cn("@container grid min-w-0 gap-4", className)}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Heading className="text-base font-medium text-foreground">
            {title}
          </Heading>
          {description ? (
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canToggle ? (
            <Button
              size="sm"
              radius="lg"
              type="button"
              variant="outline"
              aria-pressed={isTableView}
              onClick={() => setIsTableView((current) => !current)}
              className="text-muted-foreground aria-pressed:border-primary aria-pressed:text-primary"
            >
              {isTableView ? (
                <ChartColumn aria-hidden />
              ) : (
                <Sheet aria-hidden />
              )}
              {isTableView ? t("chart.showChart") : t("chart.showTable")}
            </Button>
          ) : null}
          {!error ? action : null}
        </div>
      </div>

      {legend &&
      legend.length > 0 &&
      !showTable &&
      !isLoading &&
      !isEmpty &&
      !error ? (
        <ChartLegend items={legend} />
      ) : null}

      <div className="min-w-0">{body()}</div>
    </section>
  );
};

export const ChartCard = ({ className, ...props }: ChartFrameProps) => (
  <GlassCard className={className}>
    <ChartFrame {...props} />
  </GlassCard>
);
