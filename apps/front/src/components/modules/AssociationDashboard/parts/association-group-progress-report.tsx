"use client";

import { TAssociationGroupProgressReport } from "@/types/association-dashboard.types";
import { TAssociationGroupProgressRow } from "@/types/association-dashboard.types";
import { AssociationReportSummaryStrip } from "@modules/AssociationDashboard/parts/association-report-summary-strip";
import { AssociationReportHeatmap } from "@modules/AssociationDashboard/parts/association-report-heatmap";
import { AssociationReportTable } from "@modules/AssociationDashboard/parts/association-report-table";
import { HEATMAP_GROUP_LIMIT } from "@utils/association-reports";
import { useChartPalette } from "@hooks/useChartPalette";
import { Skeleton } from "@ui/skeleton";

import dynamic from "next/dynamic";

import * as REPORTS from "@utils/association-reports";

const GroupBandsChart = dynamic(
  () =>
    import(
      "@modules/AssociationDashboard/parts/association-report-drilldown-charts"
    ).then((module) => module.GroupBandsChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-72 w-full rounded-2xl" />,
  },
);

export const AssociationGroupProgressReport = ({
  hook,
}: TAssociationGroupProgressReport) => {
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
    filterInput,
    orderAndPage,
    distribution,
    groupProgress,
    categoryProgress,
    isReportLoading,
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

      <GroupBandsChart
        label={label}
        locale={locale}
        palette={palette}
        rows={groupProgress}
        ungroupedLabel={ungroupedLabel}
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
        isLoading={isReportLoading}
        emptyLabel={label("table.empty")}
        caption={label("names.group-progress")}
        rowKey={(row) => row.groupId ?? "ungrouped"}
        sortLabel={(header) => label("table.sort", { column: header })}
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

      <section>
        <h3 className="text-lg font-medium">{label("heatmap.title")}</h3>

        <div className="mt-3">
          <AssociationReportHeatmap
            label={label}
            locale={locale}
            palette={palette}
            filter={filterInput}
            groups={heatmapGroups}
            columns={categoryColumns}
          />
        </div>
      </section>
    </div>
  );
};

export default AssociationGroupProgressReport;
