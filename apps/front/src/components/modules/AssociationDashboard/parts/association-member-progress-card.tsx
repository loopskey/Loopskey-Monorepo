"use client";

import { TAssociationMemberDetail } from "@/types/association-dashboard.types";
import { useChartPalette } from "@hooks/useChartPalette";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";

import dynamic from "next/dynamic";

import * as L from "lucide-react";

const CHART_HEIGHT = "h-80";

const CumulativeChart = dynamic(
  () =>
    import("@modules/AssociationDashboard/parts/association-cumulative-chart"),
  {
    ssr: false,
    loading: () => (
      <Skeleton className={`${CHART_HEIGHT} w-full rounded-2xl`} />
    ),
  },
);

export const AssociationMemberProgressCard = ({
  hook,
}: TAssociationMemberDetail) => {
  const palette = useChartPalette();

  const { t, locale, cumulativeRows, cycleAssignment } = hook;

  const label = (key: string) =>
    t(`associationDashboard.memberDetail.chart.${key}`);

  return (
    <GlassCard>
      <div className="relative z-10">
        <h2 className="text-xl font-medium">
          {t("associationDashboard.memberDetail.progress.title")}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {cycleAssignment
            ? t("associationDashboard.memberDetail.progress.description", {
                requirement: cycleAssignment.requirementName,
              })
            : t("associationDashboard.memberDetail.progress.noCycle")}
        </p>

        {cumulativeRows.length === 0 ? (
          <div
            className={`mt-6 flex ${CHART_HEIGHT} flex-col items-center justify-center rounded-2xl border border-dashed border-glass-border text-center`}
          >
            <L.ChartLine className="h-8 w-8 text-muted-foreground" />

            <p className="mt-3 font-medium">
              {t("associationDashboard.memberDetail.progress.emptyTitle")}
            </p>

            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              {t("associationDashboard.memberDetail.progress.emptyBody")}
            </p>
          </div>
        ) : (
          <div className="mt-6">
            <CumulativeChart
              label={label}
              locale={locale}
              palette={palette}
              rows={cumulativeRows}
            />
          </div>
        )}
      </div>
    </GlassCard>
  );
};
