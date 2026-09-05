"use client";

import { getAssociationErrorTranslationKey } from "@utils/association-error";
import { TAssociationReportExports } from "@/types/association-dashboard.types";
import { AssociationGeneratedReportState } from "@/lib/graphql/base";
import { AssociationReportPeriod } from "@/lib/graphql/base";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as X from "@utils/association-report-exports";
import * as REPORTS from "@utils/association-reports";
import * as L from "lucide-react";

const STATE_VARIANTS = {
  [AssociationGeneratedReportState.Pending]: "secondary",
  [AssociationGeneratedReportState.Ready]: "default",
  [AssociationGeneratedReportState.Failed]: "destructive",
  [AssociationGeneratedReportState.Expired]: "outline",
} as const;

export const AssociationReportExports = ({
  hook,
}: TAssociationReportExports) => {
  const {
    t,
    locale,
    groupOptions,
    downloadExport,
    generatedReports,
    regenerateExport,
    requirementOptions,
    isExportsError,
    isExportsLoading,
    downloadingExportId,
    isRequestingExport,
  } = hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.reports.exports.${key}`, vars);

  const none = t("associationDashboard.reports.table.none");

  const named = (
    value: string | null | undefined,
    options: { value: string; label: string }[],
    fallback: string,
  ) =>
    value
      ? (options.find((option) => option.value === value)?.label ?? value)
      : fallback;

  const filterSummary = (filter: {
    period: AssociationReportPeriod;
    startDate?: string | null;
    endDate?: string | null;
    groupId?: string | null;
    requirementId?: string | null;
    includeInactive: boolean;
  }) =>
    [
      filter.period === AssociationReportPeriod.Custom
        ? t("associationDashboard.reports.customRange", {
            start: REPORTS.formatReportDate(filter.startDate, locale, none),
            end: REPORTS.formatReportDate(filter.endDate, locale, none),
          })
        : t(`associationDashboard.reports.periods.${filter.period}`),
      named(
        filter.groupId,
        groupOptions,
        t("associationDashboard.reports.filters.allGroups"),
      ),
      named(
        filter.requirementId,
        requirementOptions,
        t("associationDashboard.reports.filters.allRequirements"),
      ),
    ].join(" · ");

  const body = () => {
    if (isExportsLoading)
      return (
        <ul className="mt-6 space-y-3">
          {[0, 1, 2].map((row) => (
            <li key={row}>
              <Skeleton className="h-20 w-full rounded-3xl" />
            </li>
          ))}
        </ul>
      );

    if (isExportsError)
      return (
        <p className="mt-6 text-sm text-muted-foreground">{label("error")}</p>
      );

    if (generatedReports.length === 0)
      return (
        <div className="mt-6 rounded-3xl border border-glass-border bg-background/50 p-8 text-center">
          <L.FileDown className="mx-auto h-7 w-7 text-muted-foreground" />

          <p className="mt-3 font-medium">{label("empty.title")}</p>

          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            {label("empty.body")}
          </p>
        </div>
      );

    return (
      <ul className="mt-6 space-y-3">
        {generatedReports.map((record) => (
          <li
            key={record.id}
            className="flex flex-col gap-4 rounded-3xl border border-glass-border bg-background/50 p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium">
                  {t(
                    `associationDashboard.reports.names.${X.REPORT_KEY_OF[record.reportType]}`,
                  )}
                </h3>

                <Badge variant="outline">
                  {label(`formats.${record.format}`)}
                </Badge>

                <Badge variant={STATE_VARIANTS[record.state]}>
                  {label(`states.${record.state}`)}
                </Badge>
              </div>

              <p className="mt-1 truncate text-sm text-muted-foreground">
                {filterSummary(record.filter)}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                {label("meta", {
                  created: REPORTS.formatReportDate(
                    record.createdAt,
                    locale,
                    none,
                  ),
                  size: X.formatExportSize(record.sizeBytes, locale, none),
                  rows:
                    record.rowCount === null || record.rowCount === undefined
                      ? none
                      : record.rowCount.toLocaleString(locale),
                })}
              </p>

              {record.state === AssociationGeneratedReportState.Failed && (
                <p className="mt-1 text-xs text-destructive">
                  {label("failureReason", {
                    reason: t(
                      getAssociationErrorTranslationKey(
                        record.failureReason,
                        "associationDashboard.reports.exports.reasons.unknown",
                      ),
                    ),
                  })}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {X.isExportPending(record.state) && (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <L.Loader2 className="h-4 w-4 animate-spin" />
                  {label("states.PENDING")}
                </span>
              )}

              {X.isExportReady(record.state) && (
                <Button
                  size="sm"
                  radius="xl"
                  type="button"
                  variant="glass"
                  disabled={downloadingExportId === record.id}
                  onClick={() =>
                    void downloadExport({
                      id: record.id,
                      fileName: record.fileName,
                    })
                  }
                >
                  {downloadingExportId === record.id ? (
                    <L.Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <L.Download className="h-4 w-4" />
                  )}
                  {label("download")}
                </Button>
              )}

              {X.isExportRetryable(record.state) && (
                <Button
                  size="sm"
                  radius="xl"
                  type="button"
                  variant="glass"
                  disabled={isRequestingExport}
                  onClick={() => void regenerateExport(record.id)}
                >
                  <L.RotateCcw className="h-4 w-4" />
                  {label("regenerate")}
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <GlassCard>
      <div className="relative z-10">
        <h2 className="text-xl font-medium">{label("title")}</h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {label("description")}
        </p>

        {body()}
      </div>
    </GlassCard>
  );
};
