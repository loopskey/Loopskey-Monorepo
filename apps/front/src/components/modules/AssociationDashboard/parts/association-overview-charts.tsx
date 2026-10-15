"use client";

import { TAssociationOverviewCharts } from "@/types/association-dashboard.types";
import { GlassCard } from "@elements/glass-card";
import { useRouter } from "next/navigation";
import { Button } from "@ui/button";

import Link from "next/link";

import * as C from "@modules/AssociationDashboard/parts/association-report-charts";
import * as O from "@utils/association-overview";
import * as L from "lucide-react";

import type { TAssociationReportKey } from "@utils/association-reports";
import type { ChartChrome } from "@/types/chart.types";

export const AssociationOverviewCharts = ({
  hook,
}: TAssociationOverviewCharts) => {
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

  const byWidestGap = [...categoryProgress].sort(
    (left, right) =>
      right.requiredCredits -
      right.averageCompletedCredits -
      (left.requiredCredits - left.averageCompletedCredits),
  );

  const chrome = (
    id: string,
    report: TAssociationReportKey,
    isEmpty: boolean,
  ): ChartChrome => ({
    isEmpty,
    headingLevel: "h2",
    isLoading: chartsPanel.isLoading,
    title: reportLabel(`charts.${id}.title`),
    emptyLabel: reportLabel("charts.empty"),
    description: reportLabel(`charts.${id}.description`),
    error: chartsPanel.isError
      ? {
          message: label("charts.error"),
          retryLabel: label("retry"),
          onRetry: chartsPanel.retry,
        }
      : null,
    action: (
      <Button size="sm" radius="lg" variant="outline" asChild>
        <Link href={O.overviewReportHref(report, filter)}>
          <L.ArrowUpRight aria-hidden />
          {reportLabel("charts.viewReport")}
        </Link>
      </Button>
    ),
  });

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <GlassCard>
        <C.GroupComplianceChart
          locale={locale}
          label={reportLabel}
          rows={groupCompliance}
          threshold={onTrackThreshold}
          chrome={chrome(
            "group",
            "group-progress",
            groupCompliance.length === 0,
          )}
          ungroupedLabel={t("associationDashboard.members.chart.ungrouped")}
          onSelectGroup={(groupId) =>
            router.push(
              O.overviewReportHref("group-progress", {
                ...filter,
                groupId: groupId ?? filter.groupId,
              }),
            )
          }
        />
      </GlassCard>

      <GlassCard>
        <C.CategoryProgressChart
          locale={locale}
          rows={byWidestGap}
          label={reportLabel}
          chrome={chrome(
            "category",
            "category-completion",
            byWidestGap.length === 0,
          )}
        />
      </GlassCard>

      <GlassCard className="xl:col-span-2">
        <C.ComplianceTrendChart
          rows={trend}
          locale={locale}
          label={reportLabel}
          chrome={chrome("trend", "overview-summary", trend.length === 0)}
        />
      </GlassCard>
    </div>
  );
};
