"use client";

import { TAssociationMemberProgressReport } from "@/types/association-dashboard.types";
import { TAssociationMemberProgressRow } from "@/types/association-dashboard.types";
import { AssociationReportSummaryStrip } from "@modules/AssociationDashboard/parts/association-report-summary-strip";
import { ASSOCIATION_BAND_VARIANTS } from "@utils/association-compliance-bands";
import { ASSOCIATION_BAND_ORDER } from "@utils/association-compliance-bands";
import { ALL_FILTER_VALUE } from "@utils/association-reports";
import { DataTableFilters } from "@elements/data-table/data-table-filters";
import { DataTable } from "@elements/data-table/data-table";
import { Badge } from "@ui/badge";

import * as REPORTS from "@utils/association-reports";
import * as C from "@modules/AssociationDashboard/parts/association-report-charts";
import * as L from "lucide-react";

export const AssociationMemberProgressReport = ({
  hook,
}: TAssociationMemberProgressReport) => {
  const {
    t,
    band,
    locale,
    setBand,
    openMember,
    reportTable,
    distribution,
    orderAndPage,
    memberProgress,
  } = hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.reports.${key}`, vars);

  const all = memberProgress?.items ?? [];

  const rows =
    band === ALL_FILTER_VALUE ? all : all.filter((row) => row.band === band);

  const {
    rows: pageRows,
    pages,
    total,
  } = orderAndPage(rows, {
    percent: (row: TAssociationMemberProgressRow) => row.percent,
    fullName: (row: TAssociationMemberProgressRow) => row.fullName ?? "",
    groupTitle: (row: TAssociationMemberProgressRow) => row.groupTitle ?? "",
    completedCredits: (row: TAssociationMemberProgressRow) =>
      row.completedCredits,
    awaitingReviewCount: (row: TAssociationMemberProgressRow) =>
      row.awaitingReviewCount,
  });

  const extremes = REPORTS.extremesOf(rows, (row) => row.percent);

  const isTruncated =
    (memberProgress?.totalCount ?? 0) > (memberProgress?.items.length ?? 0);

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
            id: "renewalReady",
            label: label("bands.RENEWAL_READY"),
            value: (distribution?.renewalReady ?? 0).toLocaleString(locale),
          },
          {
            id: "onTrack",
            label: label("bands.ON_TRACK"),
            value: (distribution?.onTrack ?? 0).toLocaleString(locale),
          },
          {
            id: "atRisk",
            label: label("bands.AT_RISK"),
            value: (distribution?.atRisk ?? 0).toLocaleString(locale),
          },
        ]}
      />

      {isTruncated && (
        <p className="rounded-md border p-4 text-sm text-muted-foreground">
          {label("view.truncated", {
            shown: (memberProgress?.items.length ?? 0).toLocaleString(locale),
            total: (memberProgress?.totalCount ?? 0).toLocaleString(locale),
          })}
        </p>
      )}

      <DataTableFilters
        onReset={() => setBand(ALL_FILTER_VALUE)}
        filters={[
          {
            type: "select",
            id: "band",
            value: band,
            onChange: setBand,
            label: label("view.band"),
            defaultValue: ALL_FILTER_VALUE,
            options: [
              { value: ALL_FILTER_VALUE, label: label("view.allBands") },
              ...ASSOCIATION_BAND_ORDER.map((value) => ({
                value,
                label: label(`bands.${value}`),
              })),
            ],
          },
        ]}
      />

      <C.MemberExtremesChart
        label={label}
        locale={locale}
        chrome={{
          title: label("extremes.title"),
          description: label("extremes.description"),
          headingLevel: "h2",
        }}
        leaders={extremes.leaders}
        laggards={extremes.laggards}
      />

      <DataTable
        {...reportTable(total, pages)}
        isFiltered={band !== ALL_FILTER_VALUE}
        rows={pageRows}
        caption={label("names.member-progress")}
        rowKey={(row) => row.memberId}
        empty={{ icon: L.TableProperties, title: label("table.empty") }}
        rowActions={(row) => [
          {
            id: "open",
            icon: L.UserSearch,
            label: label("table.openMember", {
              name: row.fullName ?? row.email ?? row.memberId,
            }),
            onSelect: () => openMember(row.memberId),
          },
        ]}
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
            id: "band",
            header: label("table.band"),
            cell: (row) => (
              <Badge variant={ASSOCIATION_BAND_VARIANTS[row.band]}>
                {label(`bands.${row.band}`)}
              </Badge>
            ),
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

export default AssociationMemberProgressReport;
