"use client";

import { REPORT_WINDOWS, intakeTotal } from "@/utils/search-health";
import { useSearchHealthReportQuery } from "@lib/rtk/endpoints/telemetry.api";
import { TelemetryRegistrationRole } from "@/lib/graphql/base";
import { SearchHealthVitalStatus } from "@/lib/graphql/base";
import { METRIC_ORDER, vitalsOf } from "@/utils/search-health";
import { TelemetryIntakeOutcome } from "@/lib/graphql/base";
import { TelemetryContentKind } from "@/lib/graphql/base";
import { Gauge, LoaderCircle } from "lucide-react";
import { formatMetricValue } from "@/utils/search-health";
import { DataTable } from "@elements/data-table/data-table";
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
            <DataTable
              rows={segments}
              caption={t(`searchHealth.metric.${metric}`)}
              empty={{ icon: Gauge, title: t("searchHealth.noVitals") }}
              rowKey={(segment) =>
                `${segment.template}-${segment.device}-${segment.locale}`
              }
              columns={[
                {
                  id: "template",
                  mobile: "title",
                  header: t("searchHealth.column.template"),
                  cell: (segment) =>
                    t(`searchHealth.template.${segment.template}`),
                },
                {
                  id: "status",
                  mobile: "badge",
                  header: t("searchHealth.column.status"),
                  cell: (segment) => (
                    <Badge variant={STATUS_BADGE[segment.status]}>
                      {t(`searchHealth.status.${segment.status}`)}
                    </Badge>
                  ),
                },
                {
                  id: "device",
                  header: t("searchHealth.column.device"),
                  cell: (segment) => t(`searchHealth.device.${segment.device}`),
                },
                {
                  id: "locale",
                  header: t("searchHealth.column.locale"),
                  cell: (segment) => t(`searchHealth.locale.${segment.locale}`),
                },
                {
                  id: "samples",
                  align: "end",
                  header: t("searchHealth.column.samples"),
                  cell: (segment) => segment.samples,
                },
                {
                  id: "p75",
                  align: "end",
                  header: t("searchHealth.column.p75"),
                  cell: (segment) =>
                    segment.status === SearchHealthVitalStatus.InsufficientData
                      ? NO_DETAIL
                      : formatMetricValue(metric, segment.p75),
                },
              ]}
            />
          </section>
        );
      })}

      <section className="space-y-3">
        <h2 className="text-xl font-medium">
          {t("searchHealth.conversionsHeading")}
        </h2>
        <DataTable
          rows={report.conversions}
          caption={t("searchHealth.conversionsHeading")}
          empty={{ icon: Gauge, title: t("searchHealth.noConversions") }}
          rowKey={(row) =>
            `${row.event}-${row.contentKind}-${row.role}-${row.attribution}`
          }
          columns={[
            {
              id: "event",
              mobile: "title",
              header: t("searchHealth.column.event"),
              cell: (row) => t(`searchHealth.event.${row.event}`),
            },
            {
              id: "detail",
              header: t("searchHealth.column.detail"),
              cell: detailOf,
            },
            {
              id: "source",
              header: t("searchHealth.column.source"),
              cell: (row) => t(`searchHealth.attribution.${row.attribution}`),
            },
            {
              id: "count",
              align: "end",
              header: t("searchHealth.column.count"),
              cell: (row) => row.count,
            },
          ]}
        />
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
