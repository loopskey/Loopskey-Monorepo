"use client";

import { TAssociationMembersStats } from "@/types/association-dashboard.types";
import { useChartPalette } from "@hooks/useChartPalette";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";

import dynamic from "next/dynamic";

import * as L from "lucide-react";

const CHART_HEIGHT = "h-80";

const CompositionChart = dynamic(
  () =>
    import(
      "@modules/AssociationDashboard/parts/association-roster-composition-chart"
    ),
  {
    ssr: false,
    loading: () => (
      <Skeleton className={`${CHART_HEIGHT} w-full rounded-2xl`} />
    ),
  },
);

export const AssociationRosterCompositionCard = ({
  hook,
}: TAssociationMembersStats) => {
  const palette = useChartPalette();

  const {
    t,
    isLoading,
    compositionRows,
    compositionTotal,
    compositionSampled,
    isCompositionPartial,
    applyCompositionSegment,
  } = hook;

  const statusLabel = (key: string) =>
    t(
      key === "caption" ||
        key === "groupHeader" ||
        key === "chartLabel" ||
        key === "chartDescription"
        ? `associationDashboard.members.chart.${key}`
        : `associationDashboard.members.status.${key}`,
    );

  return (
    <GlassCard>
      <div className="relative z-10">
        <h2 className="text-xl font-medium">
          {t("associationDashboard.members.chart.title")}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {t("associationDashboard.members.chart.description")}
        </p>

        {isLoading ? (
          <Skeleton className={`mt-6 ${CHART_HEIGHT} w-full rounded-2xl`} />
        ) : compositionRows.length === 0 ? (
          <div
            className={`mt-6 flex ${CHART_HEIGHT} flex-col items-center justify-center rounded-2xl border border-dashed border-glass-border text-center`}
          >
            <L.ChartNoAxesColumn className="h-8 w-8 text-muted-foreground" />

            <p className="mt-3 font-medium">
              {t("associationDashboard.members.chart.emptyTitle")}
            </p>

            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {t("associationDashboard.members.chart.emptyBody")}
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <CompositionChart
              palette={palette}
              rows={compositionRows}
              statusLabel={statusLabel}
              onSegmentClick={applyCompositionSegment}
            />

            {isCompositionPartial && (
              <p className="mt-3 text-xs text-muted-foreground">
                {t("associationDashboard.members.chart.partial", {
                  shown: compositionSampled,
                  total: compositionTotal,
                })}
              </p>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
};
