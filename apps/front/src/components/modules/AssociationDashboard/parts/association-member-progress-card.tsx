"use client";

import { TAssociationMemberDetail } from "@/types/association-dashboard.types";
import { LazyTrendChart } from "@elements/charts/lazy-trend-chart";
import { ChartFrame } from "@elements/charts/chart-frame";
import { GlassCard } from "@elements/glass-card";
import { CHART_COLOR } from "@/utils/chart.util";

export const AssociationMemberProgressCard = ({
  hook,
}: TAssociationMemberDetail) => {
  const { t, locale, cumulativeRows, cycleAssignment } = hook;

  const label = (key: string) =>
    t(`associationDashboard.memberDetail.chart.${key}`);

  const credits = (value: number) =>
    value.toLocaleString(locale, { maximumFractionDigits: 1 });
  const shortDate = (value: string) =>
    new Date(value).toLocaleDateString(locale, {
      day: "numeric",
      month: "short",
    });
  const fullDate = (value: string) =>
    new Date(value).toLocaleDateString(locale);

  return (
    <GlassCard>
      <ChartFrame
        headingLevel="h2"
        title={t("associationDashboard.memberDetail.progress.title")}
        description={
          cycleAssignment
            ? t("associationDashboard.memberDetail.progress.description", {
                requirement: cycleAssignment.requirementName,
              })
            : t("associationDashboard.memberDetail.progress.noCycle")
        }
        isEmpty={cumulativeRows.length === 0}
        emptyLabel={t("associationDashboard.memberDetail.progress.emptyBody")}
        legend={[
          {
            id: "credits",
            kind: "line",
            label: label("cumulativeEarned"),
            color: CHART_COLOR.series1,
          },
          { id: "pace", kind: "dash", label: label("cumulativePace") },
        ]}
        table={{
          caption: label("cumulativeChartLabel"),
          columns: [
            label("cumulativeDate"),
            label("cumulativeEarned"),
            label("cumulativePace"),
          ],
          rows: cumulativeRows.map((row) => ({
            id: row.date,
            cells: [
              fullDate(row.date),
              row.credits === null ? "—" : credits(row.credits),
              credits(row.pace),
            ],
          })),
        }}
      >
        <LazyTrendChart
          xKey="date"
          height={300}
          data={cumulativeRows}
          label={label("cumulativeChartLabel")}
          formatValue={credits}
          formatX={shortDate}
          formatTooltipX={fullDate}
          series={[
            {
              key: "pace",
              curve: "linear",
              variant: "dashed",
              color: CHART_COLOR.neutral,
              label: label("cumulativePace"),
            },
            {
              key: "credits",
              curve: "step",
              color: CHART_COLOR.series1,
              label: label("cumulativeEarned"),
            },
          ]}
        />
      </ChartFrame>
    </GlassCard>
  );
};
