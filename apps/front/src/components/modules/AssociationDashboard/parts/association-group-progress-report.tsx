"use client";

import { TAssociationGroupProgressReport } from "@/types/association-dashboard.types";
import { AssociationReportSummaryStrip } from "@modules/AssociationDashboard/parts/association-report-summary-strip";
import { TAssociationGroupProgressRow } from "@/types/association-dashboard.types";
import { AssociationReportHeatmap } from "@modules/AssociationDashboard/parts/association-report-heatmap";
import { HEATMAP_GROUP_LIMIT } from "@utils/association-reports";
import { DataTable } from "@elements/data-table/data-table";

import * as C from "@modules/AssociationDashboard/parts/association-report-charts";
import * as L from "lucide-react";
import * as REPORTS from "@utils/association-reports";

export const AssociationGroupProgressReport = ({
  hook,
}: TAssociationGroupProgressReport) => {
  const {
    t,
    locale,
    summary,
    reportTable,
    filterInput,
    orderAndPage,
    distribution,
    groupProgress,
    categoryProgress,
  } = hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.reports.${key}`, vars);

  const ungroupedLabel = t("associationDashboard.members.chart.ungrouped");

  const {
    rows: pageRows,
    pages,
    total,
  } = orderAndPage(groupProgress, {
    averageCompletion: (row: TAssociationGroupProgressRow) =>
      row.averageCompletion,
    groupTitle: (row: TAssociationGroupProgressRow) =>
      row.groupTitle ?? ungroupedLabel,
    memberCount: (row: TAssociationGroupProgressRow) => row.memberCount,
    missingEvidenceCount: (row: TAssociationGroupProgressRow) =>
      row.missingEvidenceCount,
    atRisk: (row: TAssociationGroupProgressRow) => row.atRisk,
  });

  const heatmapGroups = REPORTS.compareBy(
    groupProgress,
    (row) => row.memberCount,
    "desc",
  ).slice(0, HEATMAP_GROUP_LIMIT);

  const categoryColumns = categoryProgress
    .map((row) => ({ id: row.categoryId, name: row.categoryName }))
    .filter(
      (column, index, all) =>
        all.findIndex((other) => other.id === column.id) === index,
    );

  return (
    <div className="space-y-6">
      <AssociationReportSummaryStrip
        items={[
          {
            id: "groups",
            label: label("chartTable.group"),
            value: total.toLocaleString(locale),
          },
          {
            id: "members",
            label: label("chartTable.members"),
            value: (summary?.totalMembers ?? 0).toLocaleString(locale),
          },
          {
            id: "missingEvidence",
            label: label("table.missingEvidence"),
            value: (summary?.missingEvidence ?? 0).toLocaleString(locale),
          },
          {
            id: "notStarted",
            label: label("table.notStarted"),
            value: (distribution?.notStarted ?? 0).toLocaleString(locale),
          },
        ]}
      />

      <C.GroupBandsChart
        label={label}
        locale={locale}
        rows={groupProgress}
        ungroupedLabel={ungroupedLabel}
        chrome={{
          title: label("groupChart.title"),
          description: label("groupChart.description"),
          headingLevel: "h2",
        }}
      />

      <DataTable
        {...reportTable(total, pages)}
        rows={pageRows}
        caption={label("names.group-progress")}
        rowKey={(row) => row.groupId ?? "ungrouped"}
        empty={{ icon: L.TableProperties, title: label("table.empty") }}
        columns={[
          {
            id: "groupTitle",
            isSortable: true,
            header: label("chartTable.group"),
            cell: (row) => row.groupTitle ?? ungroupedLabel,
          },
          {
            id: "memberCount",
            isSortable: true,
            header: label("chartTable.members"),
            cell: (row) => row.memberCount.toLocaleString(locale),
          },
          {
            id: "averageCompletion",
            isSortable: true,
            header: label("chartTable.completion"),
            cell: (row) =>
              REPORTS.formatReportPercent(row.averageCompletion, locale),
          },
          {
            id: "renewalReady",
            header: label("bands.RENEWAL_READY"),
            cell: (row) => row.renewalReady.toLocaleString(locale),
          },
          {
            id: "onTrack",
            header: label("bands.ON_TRACK"),
            cell: (row) => row.onTrack.toLocaleString(locale),
          },
          {
            id: "atRisk",
            isSortable: true,
            header: label("bands.AT_RISK"),
            cell: (row) => row.atRisk.toLocaleString(locale),
          },
          {
            id: "missingEvidenceCount",
            isSortable: true,
            header: label("table.missingEvidence"),
            cell: (row) => row.missingEvidenceCount.toLocaleString(locale),
          },
        ]}
      />

      <AssociationReportHeatmap
        label={label}
        locale={locale}
        filter={filterInput}
        groups={heatmapGroups}
        columns={categoryColumns}
      />
    </div>
  );
};

export default AssociationGroupProgressReport;
