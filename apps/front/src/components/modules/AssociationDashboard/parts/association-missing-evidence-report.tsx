"use client";

import { TAssociationMissingEvidenceReport } from "@/types/association-dashboard.types";
import { TAssociationMissingEvidenceRow } from "@/types/association-dashboard.types";
import { AssociationReportSummaryStrip } from "@modules/AssociationDashboard/parts/association-report-summary-strip";
import { AssociationReportTable } from "@modules/AssociationDashboard/parts/association-report-table";

import * as REPORTS from "@utils/association-reports";

export const AssociationMissingEvidenceReport = ({
  hook,
}: TAssociationMissingEvidenceReport) => {
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
    orderAndPage,
    missingEvidence,
    isReportLoading,
  } = hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.reports.${key}`, vars);

  const items = missingEvidence?.items ?? [];

  const {
    rows: pageRows,
    pages,
    total,
  } = orderAndPage(items, {
    fullName: (row: TAssociationMissingEvidenceRow) => row.fullName ?? "",
    groupTitle: (row: TAssociationMissingEvidenceRow) => row.groupTitle ?? "",
    requirementName: (row: TAssociationMissingEvidenceRow) =>
      row.requirementName,
    percent: (row: TAssociationMissingEvidenceRow) => row.percent,
    awaitingReviewCount: (row: TAssociationMissingEvidenceRow) =>
      row.awaitingReviewCount,
    daysRemaining: (row: TAssociationMissingEvidenceRow) =>
      row.daysRemaining ?? Number.MAX_SAFE_INTEGER,
  });

  const isTruncated =
    (missingEvidence?.totalCount ?? 0) > (missingEvidence?.items.length ?? 0);

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
            id: "members",
            label: label("cards.missingEvidence"),
            value: (summary?.missingEvidence ?? 0).toLocaleString(locale),
          },
          {
            id: "share",
            label: label("chartTable.share"),
            value: REPORTS.formatReportPercent(
              summary?.missingEvidenceShare ?? 0,
              locale,
            ),
          },
        ]}
      />

      {isTruncated && (
        <p className="rounded-2xl border border-glass-border bg-background/50 p-4 text-sm text-muted-foreground">
          {label("view.truncated", {
            shown: (missingEvidence?.items.length ?? 0).toLocaleString(locale),
            total: (missingEvidence?.totalCount ?? 0).toLocaleString(locale),
          })}
        </p>
      )}

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
        caption={label("names.missing-evidence")}
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
            id: "requirementName",
            isSortable: true,
            header: label("table.requirement"),
            cell: (row) => row.requirementName,
          },
          {
            id: "percent",
            isSortable: true,
            header: label("table.completion"),
            cell: (row) => REPORTS.formatReportPercent(row.percent, locale),
          },
          {
            id: "awaitingReviewCount",
            isSortable: true,
            header: label("table.awaiting"),
            cell: (row) => row.awaitingReviewCount.toLocaleString(locale),
          },
          {
            id: "dueDate",
            header: label("table.dueDate"),
            cell: (row) =>
              REPORTS.formatReportDate(
                row.dueDate,
                locale,
                label("table.none"),
              ),
          },
          {
            id: "daysRemaining",
            isSortable: true,
            header: label("table.daysRemaining"),
            cell: (row) =>
              row.daysRemaining === null || row.daysRemaining === undefined
                ? label("table.none")
                : label("table.days", {
                    days: row.daysRemaining.toLocaleString(locale),
                  }),
          },
        ]}
      />
    </div>
  );
};

export default AssociationMissingEvidenceReport;
