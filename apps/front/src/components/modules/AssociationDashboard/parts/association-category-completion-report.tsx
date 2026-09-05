"use client";

import { TAssociationCategoryCompletionReport } from "@/types/association-dashboard.types";
import { TAssociationCategoryReportRow } from "@/types/association-dashboard.types";
import { AssociationReportSummaryStrip } from "@modules/AssociationDashboard/parts/association-report-summary-strip";
import { AssociationReportTable } from "@modules/AssociationDashboard/parts/association-report-table";
import { useChartPalette } from "@hooks/useChartPalette";
import { Skeleton } from "@ui/skeleton";

import dynamic from "next/dynamic";

import * as REPORTS from "@utils/association-reports";

const CategoryCompletionChart = dynamic(
  () =>
    import(
      "@modules/AssociationDashboard/parts/association-report-drilldown-charts"
    ).then((module) => module.CategoryCompletionChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-72 w-full rounded-2xl" />,
  },
);

export const AssociationCategoryCompletionReport = ({
  hook,
}: TAssociationCategoryCompletionReport) => {
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
    orderAndPage,
    isReportLoading,
    categoryCompletion,
  } = hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.reports.${key}`, vars);

  const {
    rows: pageRows,
    pages,
    total,
  } = orderAndPage(categoryCompletion, {
    categoryName: (row: TAssociationCategoryReportRow) => row.categoryName,
    averagePercent: (row: TAssociationCategoryReportRow) => row.averagePercent,
    requiredCredits: (row: TAssociationCategoryReportRow) =>
      row.requiredCredits,
    belowHalfCount: (row: TAssociationCategoryReportRow) => row.belowHalfCount,
    memberCount: (row: TAssociationCategoryReportRow) => row.memberCount,
  });

  return (
    <div className="space-y-6">
      <AssociationReportSummaryStrip
        items={[
          {
            id: "categories",
            label: label("chartTable.category"),
            value: total.toLocaleString(locale),
          },
          {
            id: "members",
            label: label("chartTable.members"),
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
        ]}
      />

      <CategoryCompletionChart
        label={label}
        locale={locale}
        palette={palette}
        rows={categoryCompletion}
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
        caption={label("names.category-completion")}
        sortLabel={(header) => label("table.sort", { column: header })}
        rowKey={(row) => `${row.requirementId}:${row.categoryId}`}
        columns={[
          {
            id: "categoryName",
            isSortable: true,
            header: label("table.category"),
            cell: (row) => row.categoryName,
          },
          {
            id: "requirementName",
            header: label("table.requirement"),
            cell: (row) => row.requirementName,
          },
          {
            id: "requiredCredits",
            isSortable: true,
            header: label("table.required"),
            cell: (row) => row.requiredCredits.toLocaleString(locale),
          },
          {
            id: "averageCompletedCredits",
            header: label("table.earned"),
            cell: (row) => row.averageCompletedCredits.toLocaleString(locale),
          },
          {
            id: "averagePercent",
            isSortable: true,
            header: label("table.completion"),
            cell: (row) =>
              REPORTS.formatReportPercent(row.averagePercent, locale),
          },
          {
            id: "memberCount",
            isSortable: true,
            header: label("table.members"),
            cell: (row) => row.memberCount.toLocaleString(locale),
          },
          {
            id: "belowHalfCount",
            isSortable: true,
            header: label("table.belowHalf"),
            cell: (row) => row.belowHalfCount.toLocaleString(locale),
          },
        ]}
      />
    </div>
  );
};

export default AssociationCategoryCompletionReport;
