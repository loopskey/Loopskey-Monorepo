"use client";

import { CpdProgressOverviewProps } from "@/types/cpd-plan.types";
import { CPD_COMPLIANCE_META } from "@/utils/cpd-plan.constant";
import { useChartSemantics } from "@hooks/useChartPalette";
import { ProgressDonutChart } from "@elements/dashboard-charts";
import { MetricCard } from "@modules/ProfessionalDashboard/parts/metric-card";
import { GlassCard } from "@elements/glass-card";
import { cn } from "@/lib/utils";

import * as L from "lucide-react";

const TONE_CLASSES: Record<string, string> = {
  success: "text-success-soft-foreground bg-success-soft",
  info: "text-primary bg-primary/10",
  warning: "text-warning-soft-foreground bg-warning-soft",
  danger: "text-destructive-soft-foreground bg-destructive-soft",
  neutral: "text-muted-foreground bg-muted",
};

const STATUS_ICONS: Record<string, L.LucideIcon> = {
  Circle: L.Circle,
  Loader: L.Loader,
  CalendarX: L.CalendarX,
  TrendingUp: L.TrendingUp,
  FileWarning: L.FileWarning,
  CheckCircle2: L.CheckCircle2,
  AlertTriangle: L.AlertTriangle,
};

export const CpdProgressOverview = ({
  t,
  plan,
  progress,
}: CpdProgressOverviewProps) => {
  const semantics = useChartSemantics();

  const creditLabel = t(`cpdProgress.creditTypes.${plan.creditType}`);
  const meta = CPD_COMPLIANCE_META[progress.complianceStatus] ?? {
    tone: "neutral",
    icon: "Circle",
  };
  const StatusIcon = STATUS_ICONS[meta.icon] ?? L.Circle;

  const earnedForArc = Math.min(
    progress.earnedCredits,
    progress.totalRequiredCredits,
  );
  const chartData = [
    {
      name: "earned",
      label: t("cpdProgress.progress.cards.earned"),
      value: earnedForArc,
      fill: semantics.onTrack,
    },
    {
      name: "remaining",
      label: t("cpdProgress.progress.cards.remaining"),
      value: Math.max(
        progress.totalRequiredCredits - progress.earnedCredits,
        0,
      ),
      fill: semantics.track,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={L.Award}
          label={t("cpdProgress.progress.cards.earned")}
          value={`${progress.earnedCredits} ${creditLabel}`}
          helper={t("cpdProgress.progress.cards.earnedHelper", {
            count: progress.activitiesCounted,
          })}
        />
        <MetricCard
          icon={L.Hourglass}
          label={t("cpdProgress.progress.cards.remaining")}
          value={`${progress.remainingCredits} ${creditLabel}`}
          helper={t("cpdProgress.progress.cards.remainingHelper", {
            total: progress.totalRequiredCredits,
          })}
        />
        <MetricCard
          icon={L.Layers}
          value={String(progress.categoriesMissing)}
          label={t("cpdProgress.progress.cards.categoriesMissing")}
          helper={t("cpdProgress.progress.cards.categoriesMissingHelper")}
        />
        <MetricCard
          icon={L.FileWarning}
          value={String(progress.evidenceMissing)}
          label={t("cpdProgress.progress.cards.evidenceMissing")}
          helper={t("cpdProgress.progress.cards.evidenceMissingHelper")}
        />
      </div>

      {progress.startingCredits > 0 && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <L.History aria-hidden className="h-4 w-4 shrink-0" />
          {t("cpdProgress.progress.startingCredits", {
            amount: progress.startingCredits,
            credit: creditLabel,
          })}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassCard className="flex flex-col items-center text-center">
          <h2 className="text-xl font-medium">
            {t("cpdProgress.progress.overallTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("cpdProgress.progress.overallSubtitle")}
          </p>

          <div className="mx-auto mt-2 w-full max-w-[220px]">
            <ProgressDonutChart
              data={chartData}
              ariaLabel={t("cpdProgress.progress.overallTitle")}
              centerLabel={
                <span className="text-3xl font-medium text-primary">
                  {Math.round(progress.progressPercent)}%
                </span>
              }
            />
          </div>

          <p className="mt-2 text-center text-sm text-muted-foreground">
            {t("cpdProgress.progress.accessibleSummary", {
              earned: progress.earnedCredits,
              total: progress.totalRequiredCredits,
              percent: progress.progressPercent.toFixed(0),
              credit: creditLabel,
            })}
          </p>

          {progress.earnedCredits > progress.totalRequiredCredits && (
            <p className="mt-1 text-center text-sm font-medium text-primary">
              {t("cpdProgress.progress.exceeded", {
                amount:
                  Math.round(
                    (progress.earnedCredits - progress.totalRequiredCredits) *
                      100,
                  ) / 100,
                credit: creditLabel,
              })}
            </p>
          )}
        </GlassCard>

        <GlassCard className="flex flex-col items-center justify-center gap-4 text-center">
          <h2 className="text-xl font-medium">
            {t("cpdProgress.progress.complianceTitle")}
          </h2>

          <div
            className={cn(
              "flex w-full flex-col items-center gap-3 rounded-md p-5",
              TONE_CLASSES[meta.tone],
            )}
          >
            <StatusIcon className="h-8 w-8 shrink-0" />
            <div>
              <p className="text-lg font-medium">
                {t(`cpdProgress.compliance.${progress.complianceStatus}`)}
              </p>
              <p className="text-sm opacity-80">
                {t(`cpdProgress.complianceHint.${progress.complianceStatus}`)}
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
