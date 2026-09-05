"use client";

import { TAssociationReportsCharts } from "@/types/association-dashboard.types";
import { useChartPalette } from "@hooks/useChartPalette";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";

import dynamic from "next/dynamic";

import * as L from "lucide-react";

import type { TAssociationReportKey } from "@utils/association-reports";
import type { ReactNode } from "react";

const chartSkeleton = () => <Skeleton className="h-72 w-full rounded-2xl" />;

const GroupComplianceChart = dynamic(
  () =>
    import(
      "@modules/AssociationDashboard/parts/association-report-charts"
    ).then((module) => module.GroupComplianceChart),
  { ssr: false, loading: chartSkeleton },
);

const CategoryProgressChart = dynamic(
  () =>
    import(
      "@modules/AssociationDashboard/parts/association-report-charts"
    ).then((module) => module.CategoryProgressChart),
  { ssr: false, loading: chartSkeleton },
);

const MemberDistributionChart = dynamic(
  () =>
    import(
      "@modules/AssociationDashboard/parts/association-report-charts"
    ).then((module) => module.MemberDistributionChart),
  { ssr: false, loading: chartSkeleton },
);

const ComplianceTrendChart = dynamic(
  () =>
    import(
      "@modules/AssociationDashboard/parts/association-report-charts"
    ).then((module) => module.ComplianceTrendChart),
  { ssr: false, loading: chartSkeleton },
);

export const AssociationReportsCharts = ({
  hook,
}: TAssociationReportsCharts) => {
  const palette = useChartPalette();

  const {
    t,
    trend,
    filter,
    locale,
    isLoading,
    openReport,
    distribution,
    groupCompliance,
    categoryProgress,
    onTrackThreshold,
  } = hook;

  const label = (key: string, vars?: Record<string, string | number>) =>
    t(`associationDashboard.reports.${key}`, vars);

  const frame = { locale, palette, label };

  const byWidestGap = [...categoryProgress].sort(
    (left, right) =>
      right.requiredCredits -
      right.averageCompletedCredits -
      (left.requiredCredits - left.averageCompletedCredits),
  );

  const card = (
    id: string,
    report: TAssociationReportKey,
    isEmpty: boolean,
    chart: ReactNode,
  ) => (
    <GlassCard>
      <div className="relative z-10">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-medium">
              {label(`charts.${id}.title`)}
            </h3>

            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              {label(`charts.${id}.description`)}
            </p>
          </div>

          <Button
            size="sm"
            radius="xl"
            type="button"
            variant="glass"
            onClick={() => openReport(report)}
          >
            <L.ArrowUpRight className="h-4 w-4" />
            {label("charts.viewReport")}
          </Button>
        </div>

        <div className="mt-5">
          {isLoading ? (
            chartSkeleton()
          ) : isEmpty ? (
            <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-glass-border text-sm text-muted-foreground">
              {label("charts.empty")}
            </div>
          ) : (
            chart
          )}
        </div>
      </div>
    </GlassCard>
  );

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      {card(
        "group",
        "group-progress",
        groupCompliance.length === 0,
        <GroupComplianceChart
          {...frame}
          rows={groupCompliance}
          threshold={onTrackThreshold}
          ungroupedLabel={t("associationDashboard.members.chart.ungrouped")}
          onSelectGroup={(groupId) =>
            openReport("group-progress", {
              filter: { ...filter, groupId: groupId ?? filter.groupId },
            })
          }
        />,
      )}

      {card(
        "category",
        "category-completion",
        byWidestGap.length === 0,
        <CategoryProgressChart {...frame} rows={byWidestGap} />,
      )}

      {card(
        "distribution",
        "member-progress",
        !distribution || distribution.totalMembers === 0,
        distribution ? (
          <MemberDistributionChart
            {...frame}
            distribution={distribution}
            onSelectBand={(band) => openReport("member-progress", { band })}
          />
        ) : null,
      )}

      {card(
        "trend",
        "overview-summary",
        trend.length === 0,
        <ComplianceTrendChart {...frame} rows={trend} />,
      )}
    </div>
  );
};
