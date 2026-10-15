"use client";

import { TAssociationOverviewSummaryReport } from "@/types/association-dashboard.types";
import { AssociationReportSummaryStrip } from "@modules/AssociationDashboard/parts/association-report-summary-strip";
import { ASSOCIATION_BAND_ORDER } from "@utils/association-compliance-bands";
import { DataTable } from "@elements/data-table/data-table";
import { TBandRow } from "@/types/association-dashboard.types";

import * as REPORTS from "@utils/association-reports";
import * as C from "@modules/AssociationDashboard/parts/association-report-charts";
import * as L from "lucide-react";

export const AssociationOverviewSummaryReport = ({
  hook,
}: TAssociationOverviewSummaryReport) => {
  const { t, trend, locale, summary, reportTable, distribution, orderAndPage } =
    hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.reports.${key}`, vars);

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

  const changes: Record<string, number | null> = {
    RENEWAL_READY: summary?.renewalReadyChange ?? null,
    ON_TRACK: summary?.onTrackChange ?? null,
    AT_RISK: summary?.atRiskChange ?? null,
    NOT_STARTED: null,
  };

  const bandRows: TBandRow[] = ASSOCIATION_BAND_ORDER.map((band) => ({
    id: band,
    count: counts[band],
    share: shares[band],
    change: changes[band],
    name: label(`bands.${band}`),
  }));

  const {
    rows: pageRows,
    pages,
    total,
  } = orderAndPage(bandRows, {
    name: (row: TBandRow) => row.name,
    count: (row: TBandRow) => row.count,
    share: (row: TBandRow) => row.share,
  });

  return (
    <div className="space-y-6">
      <AssociationReportSummaryStrip
        items={[
          {
            id: "members",
            label: label("cards.totalMembers"),
            value: (summary?.totalMembers ?? 0).toLocaleString(locale),
          },
          {
            id: "average",
            label: label("summaryReport.average"),
            value: REPORTS.formatReportPercent(
              summary?.averageCompletion ?? 0,
              locale,
            ),
          },
          {
            id: "missingEvidence",
            label: label("cards.missingEvidence"),
            value: (summary?.missingEvidence ?? 0).toLocaleString(locale),
          },
          {
            id: "period",
            label: label("summaryReport.period"),
            value: label("customRange", {
              start: REPORTS.formatReportDate(
                summary?.periodStart,
                locale,
                label("table.none"),
              ),
              end: REPORTS.formatReportDate(
                summary?.periodEnd,
                locale,
                label("table.none"),
              ),
            }),
          },
        ]}
      />

      <C.ComplianceTrendChart
        rows={trend}
        label={label}
        locale={locale}
        chrome={{
          title: label("charts.trend.title"),
          description: label("charts.trend.description"),
          headingLevel: "h2",
        }}
      />

      <DataTable
        {...reportTable(total, pages)}
        rows={pageRows}
        caption={label("summaryReport.caption")}
        rowKey={(row) => row.id}
        empty={{ icon: L.TableProperties, title: label("table.empty") }}
        columns={[
          {
            id: "name",
            isSortable: true,
            header: label("chartTable.band"),
            cell: (row) => row.name,
          },
          {
            id: "count",
            isSortable: true,
            header: label("chartTable.members"),
            cell: (row) => row.count.toLocaleString(locale),
          },
          {
            id: "share",
            isSortable: true,
            header: label("chartTable.share"),
            cell: (row) => REPORTS.formatReportPercent(row.share, locale),
          },
          {
            id: "change",
            header: label("summaryReport.change"),
            cell: (row) =>
              row.change === null
                ? label("table.none")
                : row.change.toLocaleString(locale),
          },
        ]}
      />
    </div>
  );
};

export default AssociationOverviewSummaryReport;
