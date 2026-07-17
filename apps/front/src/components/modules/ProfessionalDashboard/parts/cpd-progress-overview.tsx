"use client";

import { CPD_COMPLIANCE_META } from "@/utils/cpd-plan.constant";
import { GoalHalfPieChart } from "@elements/dashboard-charts";
import { MetricCard } from "@modules/ProfessionalDashboard/parts/metric-card";
import { GlassCard } from "@elements/glass-card";
import { cn } from "@/lib/utils";

import * as L from "lucide-react";
import { CpdProgressOverviewProps } from "@/types/cpd-plan.types";

const TONE_CLASSES: Record<string, string> = {
  success: "text-emerald-600 bg-emerald-500/10 dark:text-emerald-400",
  info: "text-blue-600 bg-blue-500/10 dark:text-blue-400",
  warning: "text-amber-600 bg-amber-500/10 dark:text-amber-400",
  danger: "text-red-600 bg-red-500/10 dark:text-red-400",
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
    { name: "earned", value: earnedForArc, fill: "#2563eb" },
    {
      name: "remaining",
      value: Math.max(
        progress.totalRequiredCredits - progress.earnedCredits,
        0,
      ),
      fill: "#e2e8f0",
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

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <GlassCard>
          <h2 className="text-xl font-medium">
            {t("cpdProgress.progress.overallTitle")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("cpdProgress.progress.overallSubtitle")}
          </p>

          <GoalHalfPieChart
            data={chartData}
            progress={Math.round(progress.progressPercent)}
          />

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

        <GlassCard className="flex flex-col justify-center gap-4">
          <h2 className="text-xl font-medium">
            {t("cpdProgress.progress.complianceTitle")}
          </h2>

          <div
            className={cn(
              "flex items-center gap-4 rounded-2xl p-5",
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
