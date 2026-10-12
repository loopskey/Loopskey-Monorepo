"use client";

import { REPORT_WINDOWS, intakeTotal } from "@/utils/search-health";
import { useSearchHealthReportQuery } from "@lib/rtk/endpoints/telemetry.api";
import { TelemetryRegistrationRole } from "@/lib/graphql/base";
import { SearchHealthVitalStatus } from "@/lib/graphql/base";
import { METRIC_ORDER, vitalsOf } from "@/utils/search-health";
import { TelemetryIntakeOutcome } from "@/lib/graphql/base";
import { TelemetryContentKind } from "@/lib/graphql/base";
import { formatMetricValue } from "@/utils/search-health";
import { LoaderCircle } from "lucide-react";
import { GlassCard } from "@elements/glass-card";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import type { SearchHealthReport } from "@/lib/rtk/endpoints/telemetry.api";

const STATUS_BADGE: Record<
  SearchHealthVitalStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  [SearchHealthVitalStatus.Good]: "default",
  [SearchHealthVitalStatus.NeedsImprovement]: "secondary",
  [SearchHealthVitalStatus.Poor]: "destructive",
  [SearchHealthVitalStatus.InsufficientData]: "outline",
};

const NO_DETAIL = "—";

const SearchHealthReportView = ({ report }: { report: SearchHealthReport }) => {
  const { t } = useI18n();
  const received = intakeTotal(report);
  const accepted = intakeTotal(report, TelemetryIntakeOutcome.Accepted);

  const detailOf = (row: SearchHealthReport["conversions"][number]) => {
    if (row.contentKind !== TelemetryContentKind.None)
      return t(`searchHealth.kind.${row.contentKind}`);
    if (row.role !== TelemetryRegistrationRole.None)
      return t(`searchHealth.role.${row.role}`);
    return NO_DETAIL;
  };

  return (
    <div className="space-y-6">
      {report.isCollecting ? null : (
        <div role="status" className="rounded-lg border border-dashed p-4">
          <p className="font-medium">{t("searchHealth.collectionOff")}</p>
          <p className="text-sm text-muted-foreground">
            {t("searchHealth.collectionOffHint")}
          </p>
        </div>
      )}

      <GlassCard className="space-y-1 p-4">
        <p className="text-sm">
          {t("searchHealth.coverage", {
            withData: report.daysWithData,
            days: report.days,
          })}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("searchHealth.accepted", { accepted, received })}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("searchHealth.sampleFloor", { count: report.minimumSamples })}
        </p>
        <p className="text-sm text-muted-foreground">
          {t("searchHealth.resolution")}
        </p>
      </GlassCard>

      {METRIC_ORDER.map((metric) => {
        const segments = vitalsOf(report, metric);
        return (
          <section key={metric} className="space-y-3">
            <h2 className="text-xl font-medium">
              {t(`searchHealth.metric.${metric}`)}
            </h2>
            {segments.length === 0 ? (
              <p className="rounded-lg border border-dashed p-4 text-muted-foreground">
                {t("searchHealth.noVitals")}
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full min-w-[40rem] text-left text-sm">
                  <caption className="sr-only">
                    {t(`searchHealth.metric.${metric}`)}
                  </caption>
                  <thead className="bg-muted/50">
                    <tr>
                      <th scope="col" className="p-3">
                        {t("searchHealth.column.template")}
                      </th>
                      <th scope="col" className="p-3">
                        {t("searchHealth.column.device")}
                      </th>
                      <th scope="col" className="p-3">
                        {t("searchHealth.column.locale")}
                      </th>
                      <th scope="col" className="p-3 text-right">
                        {t("searchHealth.column.samples")}
                      </th>
                      <th scope="col" className="p-3 text-right">
                        {t("searchHealth.column.p75")}
                      </th>
                      <th scope="col" className="p-3">
                        {t("searchHealth.column.status")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {segments.map((segment) => (
                      <tr
                        key={`${segment.template}-${segment.device}-${segment.locale}`}
                        className="border-t"
                      >
                        <th scope="row" className="p-3 font-normal">
                          {t(`searchHealth.template.${segment.template}`)}
                        </th>
                        <td className="p-3">
                          {t(`searchHealth.device.${segment.device}`)}
                        </td>
                        <td className="p-3">
                          {t(`searchHealth.locale.${segment.locale}`)}
                        </td>
                        <td className="p-3 text-right tabular-nums">
                          {segment.samples}
                        </td>
                        <td className="p-3 text-right tabular-nums">
                          {segment.status ===
                          SearchHealthVitalStatus.InsufficientData
                            ? NO_DETAIL
                            : formatMetricValue(metric, segment.p75)}
                        </td>
                        <td className="p-3">
                          <Badge variant={STATUS_BADGE[segment.status]}>
                            {t(`searchHealth.status.${segment.status}`)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}

      <section className="space-y-3">
        <h2 className="text-xl font-medium">
          {t("searchHealth.conversionsHeading")}
        </h2>
        {report.conversions.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-muted-foreground">
            {t("searchHealth.noConversions")}
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <caption className="sr-only">
                {t("searchHealth.conversionsHeading")}
              </caption>
              <thead className="bg-muted/50">
                <tr>
                  <th scope="col" className="p-3">
                    {t("searchHealth.column.event")}
                  </th>
                  <th scope="col" className="p-3">
                    {t("searchHealth.column.detail")}
                  </th>
                  <th scope="col" className="p-3">
                    {t("searchHealth.column.source")}
                  </th>
                  <th scope="col" className="p-3 text-right">
                    {t("searchHealth.column.count")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {report.conversions.map((row) => (
                  <tr
                    key={`${row.event}-${row.contentKind}-${row.role}-${row.attribution}`}
                    className="border-t"
                  >
                    <th scope="row" className="p-3 font-normal">
                      {t(`searchHealth.event.${row.event}`)}
                    </th>
                    <td className="p-3">{detailOf(row)}</td>
                    <td className="p-3">
                      {t(`searchHealth.attribution.${row.attribution}`)}
                    </td>
                    <td className="p-3 text-right tabular-nums">{row.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-medium">
          {t("searchHealth.intakeHeading")}
        </h2>
        {report.intake.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-muted-foreground">
            {t("searchHealth.noIntake")}
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2">
            {report.intake.map((row) => (
              <li
                key={`${row.kind}-${row.outcome}`}
                className="flex items-center justify-between rounded-lg border p-3 text-sm"
              >
                <span>
                  {t(`searchHealth.intakeKind.${row.kind}`)} ·{" "}
                  {t(`searchHealth.outcome.${row.outcome}`)}
                </span>
                <span className="tabular-nums">{row.count}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

const AdminSearchHealthTab = () => {
  const { t } = useI18n();
  const [days, setDays] = useState<number>(REPORT_WINDOWS[0]);
  const query = useSearchHealthReportQuery(days);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
          {t("searchHealth.title")}
        </h1>
        <p className="max-w-3xl text-muted-foreground">
          {t("searchHealth.description")}
        </p>
        <div
          role="group"
          aria-label={t("searchHealth.window")}
          className="flex flex-wrap gap-2 pt-2"
        >
          {REPORT_WINDOWS.map((option) => (
            <Button
              size="sm"
              radius="xl"
              key={option}
              type="button"
              aria-pressed={days === option}
              onClick={() => setDays(option)}
              variant={days === option ? "default" : "outline"}
            >
              {t("searchHealth.lastDays", { count: option })}
            </Button>
          ))}
        </div>
      </section>

      {query.isError ? (
        <div role="alert" className="space-y-3">
          <p>{t("searchHealth.loadFailed")}</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => query.refetch()}
          >
            {t("searchHealth.retry")}
          </Button>
        </div>
      ) : query.isLoading || !query.data ? (
        <p role="status" className="text-muted-foreground">
          <LoaderCircle
            className="mr-2 inline size-4 animate-spin"
            aria-hidden
          />
          <span className="sr-only">{t("searchHealth.loading")}</span>
        </p>
      ) : (
        <SearchHealthReportView report={query.data} />
      )}
    </div>
  );
};

export default AdminSearchHealthTab;
