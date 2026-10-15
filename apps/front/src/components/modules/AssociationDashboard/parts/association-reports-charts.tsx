"use client";

import { TAssociationReportsCharts } from "@/types/association-dashboard.types";
import { ChartFrame } from "@elements/charts/chart-frame";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

import * as C from "@modules/AssociationDashboard/parts/association-report-charts";
import * as L from "lucide-react";

import type { TAssociationReportKey } from "@utils/association-reports";
import type { ChartChrome } from "@/types/chart.types";

export const AssociationReportsCharts = ({
  hook,
}: TAssociationReportsCharts) => {
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
    isLoading,
    headingLevel: "h3",
    title: label(`charts.${id}.title`),
    emptyLabel: label("charts.empty"),
    description: label(`charts.${id}.description`),
    action: (
      <Button
        size="sm"
        radius="lg"
        type="button"
        variant="outline"
        onClick={() => openReport(report)}
      >
        <L.ArrowUpRight aria-hidden />
        {label("charts.viewReport")}
      </Button>
    ),
  });

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <GlassCard>
        <C.GroupComplianceChart
          label={label}
          locale={locale}
          rows={groupCompliance}
          threshold={onTrackThreshold}
          chrome={chrome(
            "group",
            "group-progress",
            groupCompliance.length === 0,
          )}
          ungroupedLabel={t("associationDashboard.members.chart.ungrouped")}
          onSelectGroup={(groupId) =>
            openReport("group-progress", {
              filter: { ...filter, groupId: groupId ?? filter.groupId },
            })
          }
        />
      </GlassCard>

      <GlassCard>
        <C.CategoryProgressChart
          label={label}
          locale={locale}
          rows={byWidestGap}
          chrome={chrome(
            "category",
            "category-completion",
            byWidestGap.length === 0,
          )}
        />
      </GlassCard>

      <GlassCard>
        {distribution ? (
          <C.MemberDistributionChart
            label={label}
            locale={locale}
            distribution={distribution}
            chrome={chrome(
              "distribution",
              "member-progress",
              distribution.totalMembers === 0,
            )}
            onSelectBand={(band) => openReport("member-progress", { band })}
          />
        ) : (
          <ChartFrame
            {...chrome("distribution", "member-progress", !isLoading)}
          >
            {null}
          </ChartFrame>
        )}
      </GlassCard>

      <GlassCard>
        <C.ComplianceTrendChart
          rows={trend}
          label={label}
          locale={locale}
          chrome={chrome("trend", "overview-summary", trend.length === 0)}
        />
      </GlassCard>
    </div>
  );
};
