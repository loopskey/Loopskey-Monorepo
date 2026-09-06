"use client";

import { TAssociationMemberProgressReport } from "@/types/association-dashboard.types";
import { TAssociationMemberProgressRow } from "@/types/association-dashboard.types";
import { AssociationReportSummaryStrip } from "@modules/AssociationDashboard/parts/association-report-summary-strip";
import { ASSOCIATION_BAND_VARIANTS } from "@utils/association-compliance-bands";
import { ASSOCIATION_BAND_ORDER } from "@utils/association-compliance-bands";
import { AssociationReportTable } from "@modules/AssociationDashboard/parts/association-report-table";
import { ALL_FILTER_VALUE } from "@utils/association-reports";
import { useChartPalette } from "@hooks/useChartPalette";
import { Skeleton } from "@ui/skeleton";
import { Badge } from "@ui/badge";

import dynamic from "next/dynamic";

import * as REPORTS from "@utils/association-reports";
import * as S from "@ui/select";

const MemberExtremesChart = dynamic(
  () =>
    import(
      "@modules/AssociationDashboard/parts/association-report-drilldown-charts"
    ).then((module) => module.MemberExtremesChart),
  {
    ssr: false,
    loading: () => <Skeleton className="h-72 w-full rounded-2xl" />,
  },
);

export const AssociationMemberProgressReport = ({
  hook,
}: TAssociationMemberProgressReport) => {
  const palette = useChartPalette();

  const {
    t,
    band,
    page,
    sort,
    locale,
    setBand,
    setPage,
    direction,
    toggleSort,
    openMember,
    distribution,
    orderAndPage,
    memberProgress,
    isReportLoading,
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
        <p className="rounded-2xl border border-glass-border bg-background/50 p-4 text-sm text-muted-foreground">
          {label("view.truncated", {
            shown: (memberProgress?.items.length ?? 0).toLocaleString(locale),
            total: (memberProgress?.totalCount ?? 0).toLocaleString(locale),
          })}
        </p>
      )}

      <div className="max-w-xs">
        <label
          htmlFor="association-report-band"
          className="text-xs uppercase text-muted-foreground"
        >
          {label("view.band")}
        </label>

        <S.Select value={band} onValueChange={setBand}>
          <S.SelectTrigger
            id="association-report-band"
            className="mt-1 rounded-2xl"
          >
            <S.SelectValue />
          </S.SelectTrigger>

          <S.SelectContent className="z-[9999] rounded-2xl">
            <S.SelectItem value={ALL_FILTER_VALUE}>
              {label("view.allBands")}
            </S.SelectItem>

            {ASSOCIATION_BAND_ORDER.map((value) => (
              <S.SelectItem key={value} value={value}>
                {label(`bands.${value}`)}
              </S.SelectItem>
            ))}
          </S.SelectContent>
        </S.Select>
      </div>

      <MemberExtremesChart
        label={label}
        locale={locale}
        palette={palette}
        leaders={extremes.leaders}
        laggards={extremes.laggards}
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
        caption={label("names.member-progress")}
        emptyLabel={label("table.empty")}
        rowKey={(row) => row.memberId}
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
