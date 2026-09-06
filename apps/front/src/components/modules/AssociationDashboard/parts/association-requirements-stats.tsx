"use client";

import { TAssociationRequirementsStats } from "@/types/association-dashboard.types";
import { AssociationRequirementStatus } from "@/lib/graphql/base";
import { statusForStatCard } from "@utils/association-requirement";
import { useChartPalette } from "@hooks/useChartPalette";
import { TRequirementStatCard } from "@utils/association-requirement";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";

import dynamic from "next/dynamic";

import * as L from "lucide-react";

const DONUT_SIZE = 72;

const CoverageChart = dynamic(
  () =>
    import(
      "@modules/AssociationDashboard/parts/association-requirement-coverage-chart"
    ),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[72px] w-[72px] rounded-full" />,
  },
);

export const AssociationRequirementsStats = ({
  hook,
}: TAssociationRequirementsStats) => {
  const palette = useChartPalette();
  const { t, stats, status, locale, isLoading, rosterSize, applyStatCard } =
    hook;

  const covered = stats?.membersCovered ?? 0;

  const cards: Array<{
    id: TRequirementStatCard;
    icon: typeof L.ListChecks;
    value: number;
  }> = [
    { id: "total", icon: L.ListChecks, value: stats?.totalRequirements ?? 0 },
    {
      id: "published",
      icon: L.BadgeCheck,
      value: stats?.publishedRequirements ?? 0,
    },
    { id: "draft", icon: L.FileEdit, value: stats?.draftRequirements ?? 0 },
  ];

  const isCardActive = (card: TRequirementStatCard) => {
    const cardStatus = statusForStatCard(card);
    if (!cardStatus) return status === "ALL";
    return status === (cardStatus as AssociationRequirementStatus);
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <GlassCard key={card.id} glow={false} className="p-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => applyStatCard(card.id)}
            aria-pressed={isCardActive(card.id)}
            className="relative z-10 h-auto w-full justify-start gap-4 rounded-3xl p-6 text-left"
          >
            <span className="rounded-2xl bg-primary/10 p-3 text-primary">
              <card.icon className="h-5 w-5" />
            </span>

            <span>
              <span className="block text-sm text-muted-foreground">
                {t(`associationDashboard.requirements.stats.${card.id}`)}
              </span>

              {isLoading ? (
                <Skeleton className="mt-2 h-7 w-16" />
              ) : (
                <span className="block text-2xl font-medium tabular-nums">
                  {card.value.toLocaleString(locale)}
                </span>
              )}
            </span>
          </Button>
        </GlassCard>
      ))}

      <GlassCard glow={false}>
        <div className="relative z-10 flex items-center gap-4">
          {isLoading ? (
            <Skeleton className="h-[72px] w-[72px] rounded-full" />
          ) : (
            <CoverageChart
              covered={covered}
              palette={palette}
              size={DONUT_SIZE}
              total={Math.max(rosterSize, covered)}
              chartLabel={t(
                "associationDashboard.requirements.chart.coverageLabel",
              )}
              coveredLabel={t(
                "associationDashboard.requirements.chart.covered",
              )}
              uncoveredLabel={t(
                "associationDashboard.requirements.chart.uncovered",
              )}
              chartDescription={t(
                "associationDashboard.requirements.chart.coverageDescription",
                { covered, total: Math.max(rosterSize, covered) },
              )}
            />
          )}

          <div>
            <p className="text-sm text-muted-foreground">
              {t("associationDashboard.requirements.stats.covered")}
            </p>

            {isLoading ? (
              <Skeleton className="mt-2 h-7 w-16" />
            ) : (
              <p className="text-2xl font-medium tabular-nums">
                {covered.toLocaleString(locale)}
              </p>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
