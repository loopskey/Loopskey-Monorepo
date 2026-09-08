"use client";

import { TAssociationOverviewCharts } from "@/types/association-dashboard.types";
import { AssociationOverviewPanel } from "@modules/AssociationDashboard/parts/association-overview-panel";
import { useChartPalette } from "@hooks/useChartPalette";
import { useRouter } from "next/navigation";
import { Button } from "@ui/button";

import Link from "next/link";

import * as C from "@modules/AssociationDashboard/parts/association-report-chart-loaders";
import * as O from "@utils/association-overview";
import * as L from "lucide-react";

import type { TAssociationReportKey } from "@utils/association-reports";
import type { ReactNode } from "react";

export const AssociationOverviewCharts = ({
  hook,
}: TAssociationOverviewCharts) => {
  const palette = useChartPalette();
  const router = useRouter();

  const {
    t,
    trend,
    filter,
    locale,
    chartsPanel,
    groupCompliance,
    categoryProgress,
    onTrackThreshold,
  } = hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.overview.${key}`, vars);

  const reportLabel = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.reports.${key}`, vars);

  const frame = { locale, palette, label: reportLabel };

  const byWidestGap = [...categoryProgress].sort(
    (left, right) =>
      right.requiredCredits -
      right.averageCompletedCredits -
      (left.requiredCredits - left.averageCompletedCredits),
  );

  const panel = (
    id: string,
    report: TAssociationReportKey,
    isEmpty: boolean,
    chart: ReactNode,
  ) => (
    <AssociationOverviewPanel
      isError={chartsPanel.isError}
      isLoading={chartsPanel.isLoading}
      retry={chartsPanel.retry}
      retryLabel={label("retry")}
      errorMessage={label("charts.error")}
      skeleton={C.chartSkeleton()}
      title={reportLabel(`charts.${id}.title`)}
      description={reportLabel(`charts.${id}.description`)}
      action={
        <Button size="sm" radius="xl" variant="glass" asChild>
          <Link href={O.overviewReportHref(report, filter)}>
            <L.ArrowUpRight className="h-4 w-4" />
            {reportLabel("charts.viewReport")}
          </Link>
        </Button>
      }
    >
      {isEmpty ? (
        <div className="flex h-72 items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground">
          {reportLabel("charts.empty")}
        </div>
      ) : (
        chart
      )}
    </AssociationOverviewPanel>
  );

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {panel(
        "group",
        "group-progress",
        groupCompliance.length === 0,
        <C.GroupComplianceChart
          {...frame}
          rows={groupCompliance}
          threshold={onTrackThreshold}
          onSelectGroup={(groupId) =>
            router.push(
              O.overviewReportHref("group-progress", {
                ...filter,
                groupId: groupId ?? filter.groupId,
              }),
            )
          }
          ungroupedLabel={t("associationDashboard.members.chart.ungrouped")}
        />,
      )}

      {panel(
        "category",
        "category-completion",
        byWidestGap.length === 0,
        <C.CategoryProgressChart {...frame} rows={byWidestGap} />,
      )}

      <div className="xl:col-span-2">
        {panel(
          "trend",
          "overview-summary",
          trend.length === 0,
          <C.ComplianceTrendChart {...frame} rows={trend} />,
        )}
      </div>
    </div>
  );
};
