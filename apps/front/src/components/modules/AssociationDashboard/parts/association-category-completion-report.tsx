"use client";

import { TAssociationCategoryCompletionReport } from "@/types/association-dashboard.types";
import { TAssociationCategoryReportRow } from "@/types/association-dashboard.types";
import { AssociationReportSummaryStrip } from "@modules/AssociationDashboard/parts/association-report-summary-strip";
import { DataTable } from "@elements/data-table/data-table";

import * as REPORTS from "@utils/association-reports";
import * as C from "@modules/AssociationDashboard/parts/association-report-charts";
import * as L from "lucide-react";

export const AssociationCategoryCompletionReport = ({
  hook,
}: TAssociationCategoryCompletionReport) => {
  const { t, locale, summary, reportTable, orderAndPage, categoryCompletion } =
    hook;

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

      <C.CategoryCompletionChart
        label={label}
        locale={locale}
        rows={categoryCompletion}
        chrome={{
          title: label("categoryChart.title"),
          description: label("categoryChart.description"),
          headingLevel: "h2",
        }}
      />

      <DataTable
        {...reportTable(total, pages)}
        rows={pageRows}
        caption={label("names.category-completion")}
        rowKey={(row) => `${row.requirementId}:${row.categoryId}`}
        empty={{ icon: L.TableProperties, title: label("table.empty") }}
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
