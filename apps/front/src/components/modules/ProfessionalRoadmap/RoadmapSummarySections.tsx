"use client";

import { TRoadmapSummaryProps } from "@/types/professional-roadmap-chat.types";
import { RoadmapRecommendationsCard } from "@modules/ProfessionalRoadmap/RoadmapRecommendationsCard";
import { buildCpdProgressView } from "@/utils/professional-overview.helper";
import { ProgressDonutChart } from "@elements/dashboard-charts";
import { useChartSemantics } from "@hooks/useChartPalette";
import { GlassCard } from "@elements/glass-card";
import { Progress } from "@ui/progress";

import * as L from "lucide-react";

const MS_PER_DAY = 86_400_000;

export const daysUntil = (target: Date, now = new Date()) => {
  const startOfTarget = Date.UTC(
    target.getUTCFullYear(),
    target.getUTCMonth(),
    target.getUTCDate(),
  );
  const startOfToday = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  return Math.round((startOfTarget - startOfToday) / MS_PER_DAY);
};

export const RoadmapSummarySections = ({
  t,
  locale,
  progress,
  totalSteps,
  targetDate,
  earnedCredits,
  completedSteps,
  requiredCredits,
  recommendations,
}: TRoadmapSummaryProps) => {
  const key = "professionalDashboard.roadmap";
  const semantics = useChartSemantics();
  const target = targetDate ? new Date(targetDate) : null;
  const remaining = target ? daysUntil(target) : null;
  const tracksCredits =
    typeof requiredCredits === "number" && requiredCredits > 0;
  const cpdView = buildCpdProgressView(
    {
      earnedCredits,
      totalRequiredCredits: requiredCredits,
      progressPercent: progress,
    },
    {
      earned: t(`${key}.creditsEarnedLabel`),
      remaining: t(`${key}.creditsRemainingLabel`),
    },
    { progress: semantics.onTrack, remainder: semantics.track },
  );

  const targetLabel = () => {
    if (remaining === null) return t(`${key}.noTargetDate`);
    if (remaining < 0) return t(`${key}.targetDatePassed`);
    if (remaining === 0) return t(`${key}.targetDateToday`);
    return t(`${key}.targetDateRemaining`, { days: remaining });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <GlassCard className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            {t(`${key}.progressSection`)}
          </h3>
          <L.TrendingUp className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>

        <p className="mt-3 text-3xl font-medium">{progress}%</p>

        <p className="mt-1 text-sm text-muted-foreground">
          {t(`${key}.ofSteps`, {
            completed: completedSteps,
            total: totalSteps,
          })}
        </p>

        <Progress
          value={progress}
          className="mt-4"
          aria-label={t(`${key}.progressSection`)}
        />
      </GlassCard>

      <GlassCard className="p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">
            {t(`${key}.targetDate`)}
          </h3>
          <L.CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
        </div>

        <p className="mt-3 text-2xl font-medium">
          {target
            ? new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(
                target,
              )
            : "—"}
        </p>
        <p
          className={
            remaining !== null && remaining < 0
              ? "mt-1 text-sm font-medium text-destructive"
              : "mt-1 text-sm text-muted-foreground"
          }
        >
          {targetLabel()}
        </p>
      </GlassCard>

      {tracksCredits ? (
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              {t(`${key}.cpdTarget`)}
            </h3>
            <L.Target className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>

          <ProgressDonutChart
            data={cpdView.chartData}
            ariaLabel={t(`${key}.creditsOf`, {
              earned: earnedCredits,
              required: requiredCredits,
            })}
            centerLabel={
              <>
                <p className="text-3xl font-medium text-primary">
                  {cpdView.chartPercent}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {t(`${key}.cpdTargetComplete`)}
                </p>
              </>
            }
          />

          <p className="text-center text-sm text-muted-foreground">
            {t(`${key}.creditsOf`, {
              earned: earnedCredits,
              required: requiredCredits,
            })}
          </p>
        </GlassCard>
      ) : null}

      <RoadmapRecommendationsCard t={t} recommendations={recommendations} />
    </div>
  );
};
