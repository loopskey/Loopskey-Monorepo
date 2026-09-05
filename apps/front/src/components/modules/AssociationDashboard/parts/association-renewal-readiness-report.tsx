"use client";

import { TAssociationRenewalReadinessReport } from "@/types/association-dashboard.types";
import { TAssociationRenewalReadinessRow } from "@/types/association-dashboard.types";
import { AssociationReportSummaryStrip } from "@modules/AssociationDashboard/parts/association-report-summary-strip";
import { ASSOCIATION_BAND_VARIANTS } from "@utils/association-compliance-bands";
import { ASSOCIATION_BAND_ORDER } from "@utils/association-compliance-bands";
import { AssociationReportTable } from "@modules/AssociationDashboard/parts/association-report-table";
import { useChartPalette } from "@hooks/useChartPalette";
import { bandChartColor } from "@utils/association-compliance-bands";
import { Skeleton } from "@ui/skeleton";
import { Badge } from "@ui/badge";

import dynamic from "next/dynamic";

import * as REPORTS from "@utils/association-reports";

const RenewalReadinessChart = dynamic(
  () =>
    import(
      "@modules/AssociationDashboard/parts/association-report-drilldown-charts"
    ).then((module) => module.RenewalReadinessChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-40 w-full rounded-2xl" />,
  },
);

export const AssociationRenewalReadinessReport = ({
  hook,
}: TAssociationRenewalReadinessReport) => {
  const palette = useChartPalette();

  const {
    t,
    page,
    sort,
    locale,
    setPage,
    summary,
    direction,
    toggleSort,
    openMember,
    distribution,
    orderAndPage,
    isReportLoading,
    renewalReadiness,
  } = hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.reports.${key}`, vars);

  const items = renewalReadiness?.items ?? [];

  const {
    rows: pageRows,
    pages,
    total,
  } = orderAndPage(items, {
    fullName: (row: TAssociationRenewalReadinessRow) => row.fullName ?? "",
    groupTitle: (row: TAssociationRenewalReadinessRow) => row.groupTitle ?? "",
    percent: (row: TAssociationRenewalReadinessRow) => row.percent,
    completedCredits: (row: TAssociationRenewalReadinessRow) =>
      row.completedCredits,
    awaitingReviewCount: (row: TAssociationRenewalReadinessRow) =>
      row.awaitingReviewCount,
  });

  const counts = {
    RENEWAL_READY: distribution?.renewalReady ?? 0,
    ON_TRACK: distribution?.onTrack ?? 0,
    AT_RISK: distribution?.atRisk ?? 0,
    NOT_STARTED: distribution?.notStarted ?? 0,
  };

  const shares = {
    RENEWAL_READY: distribution?.renewalReadyShare ?? 0,
    ON_TRACK: distribution?.onTrackShare ?? 0,
    AT_RISK: distribution?.atRiskShare ?? 0,
    NOT_STARTED: distribution?.notStartedShare ?? 0,
  };

  const segments = ASSOCIATION_BAND_ORDER.map((band) => ({
    id: band,
    count: counts[band],
    share: shares[band],
    label: label(`bands.${band}`),
    color: bandChartColor(palette, band),
  }));

  const isTruncated =
    (renewalReadiness?.totalCount ?? 0) > (renewalReadiness?.items.length ?? 0);

  return (
    <div className="space-y-6">
      <AssociationReportSummaryStrip
        items={[
          {
            id: "rows",
            label: label("view.rowCount"),
            value: total.toLocaleString(locale),
          },
          {
            id: "ready",
            label: label("table.ready"),
            value: (summary?.renewalReady ?? 0).toLocaleString(locale),
          },
          {
            id: "share",
            label: label("chartTable.share"),
            value: REPORTS.formatReportPercent(
              summary?.renewalReadyShare ?? 0,
              locale,
            ),
          },
          {
            id: "average",
            label: label("summaryReport.average"),
            value: REPORTS.formatReportPercent(
              summary?.averageCompletion ?? 0,
              locale,
            ),
          },
        ]}
      />

      {isTruncated && (
        <p className="rounded-2xl border border-glass-border bg-background/50 p-4 text-sm text-muted-foreground">
          {label("view.truncated", {
            shown: (renewalReadiness?.items.length ?? 0).toLocaleString(locale),
            total: (renewalReadiness?.totalCount ?? 0).toLocaleString(locale),
          })}
        </p>
      )}

      <RenewalReadinessChart
        label={label}
        locale={locale}
        palette={palette}
        segments={segments}
      />

      <AssociationReportTable
        page={page}
        sort={sort}
        pages={pages}
        total={total}
        rows={pageRows}
        onPage={setPage}
        onSort={toggleSort}
        direction={direction}
        rowKey={(row) => row.id}
        isLoading={isReportLoading}
        emptyLabel={label("table.empty")}
        caption={label("names.renewal-readiness")}
        onOpenRow={(row) => openMember(row.memberId)}
        sortLabel={(header) => label("table.sort", { column: header })}
        openLabel={(row) =>
          label("table.openMember", {
            name: row.fullName ?? row.email ?? row.memberId,
          })
        }
        columns={[
          {
            id: "fullName",
            isSortable: true,
            header: label("table.member"),
            cell: (row) => (
              <span className="block">
                <span className="block font-medium">
                  {row.fullName ?? label("table.none")}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {row.email ?? row.memberNumber ?? label("table.none")}
                </span>
              </span>
            ),
          },
          {
            id: "groupTitle",
            isSortable: true,
            header: label("table.group"),
            cell: (row) => row.groupTitle ?? label("table.none"),
          },
          {
            id: "readiness",
            header: label("table.readiness"),
            cell: (row) => (
              <Badge
                variant={
                  row.isRenewalReady
                    ? ASSOCIATION_BAND_VARIANTS.RENEWAL_READY
                    : "secondary"
                }
              >
                {label(row.isRenewalReady ? "table.ready" : "table.notReady")}
              </Badge>
            ),
          },
          {
            id: "band",
            header: label("table.band"),
            cell: (row) => label(`bands.${row.band}`),
          },
          {
            id: "percent",
            isSortable: true,
            header: label("table.completion"),
            cell: (row) => REPORTS.formatReportPercent(row.percent, locale),
          },
          {
            id: "completedCredits",
            isSortable: true,
            header: label("table.credits"),
            cell: (row) =>
              label("table.creditLine", {
                completed: row.completedCredits.toLocaleString(locale),
                required: row.requiredCredits.toLocaleString(locale),
              }),
          },
          {
            id: "awaitingReviewCount",
            isSortable: true,
            header: label("table.awaiting"),
            cell: (row) => row.awaitingReviewCount.toLocaleString(locale),
          },
          {
            id: "earliestUnmetDeadline",
            header: label("table.deadline"),
            cell: (row) =>
              REPORTS.formatReportDate(
                row.earliestUnmetDeadline,
                locale,
                label("table.none"),
              ),
          },
        ]}
      />
    </div>
  );
};

export default AssociationRenewalReadinessReport;
