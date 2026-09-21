"use client";

import { RequirementCategoryProgress } from "@modules/ProfessionalDashboard/parts/requirement-category-progress";
import { RequirementLearningContent } from "@modules/ProfessionalDashboard/parts/requirement-learning-content";
import { RequirementActivitiesTable } from "@modules/ProfessionalDashboard/parts/requirement-activities-table";
import { RequirementSourceBadge } from "@modules/ProfessionalDashboard/parts/requirement-source-badge";
import { buildCpdProgressView } from "@/utils/professional-overview.helper";
import { ProgressDonutChart } from "@elements/dashboard-charts";
import { useChartSemantics } from "@hooks/useChartPalette";
import { formatDeadline } from "@/utils/function-helper";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { cn } from "@/lib/utils";

import type { TAssociationRequirementViewProps } from "@/types/professional-requirement.types";

import * as R from "@/utils/professional-requirement.helper";
import * as L from "lucide-react";

const KEY = "cpdProgress.requirements";

const BAND_ICONS: Record<string, L.LucideIcon> = {
  Circle: L.Circle,
  TrendingUp: L.TrendingUp,
  CheckCircle2: L.CheckCircle2,
  AlertTriangle: L.AlertTriangle,
};

const Stat = ({
  label,
  value,
  helper,
}: {
  label: string;
  value: string;
  helper?: string | null;
}) => (
  <div className="rounded-md bg-muted p-4">
    <dt className="text-xs text-muted-foreground">{label}</dt>
    <dd className="mt-1 text-lg font-medium">{value}</dd>
    {helper ? (
      <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
    ) : null}
  </div>
);

export const RequirementAssociationView = ({
  t,
  detail,
  summary,
  isLoading,
  onLogActivity,
  onMarkComplete,
}: TAssociationRequirementViewProps) => {
  const semantics = useChartSemantics();

  const creditLabel = t(`cpdProgress.creditTypes.${summary.creditType}`);
  const meta = R.BAND_META[summary.band] ?? R.BAND_META.NOT_STARTED;
  const BandIcon = BAND_ICONS[meta.icon] ?? L.Circle;
  const bandLabel = t(`${KEY}.band.${summary.band}`);

  const view = buildCpdProgressView(
    {
      earnedCredits: summary.completedCredits,
      remainingCredits: summary.remainingCredits,
      totalRequiredCredits: summary.requiredCredits,
      progressPercent: summary.percent,
    },
    { earned: t(`${KEY}.completed`), remaining: t(`${KEY}.remaining`) },
    { progress: semantics.onTrack, remainder: semantics.track },
  );

  const bandBadge = (
    <Badge
      className={cn(
        "gap-1.5 border-transparent",
        R.REQUIREMENT_TONE_CLASSES[meta.tone],
      )}
    >
      <BandIcon className="h-3.5 w-3.5" aria-hidden />
      {bandLabel}
    </Badge>
  );

  const evidenceHelper =
    summary.evidencePolicy === "NOT_REQUIRED"
      ? null
      : summary.awaitingReviewCount > 0
        ? t(`${KEY}.awaitingReview`, { count: summary.awaitingReviewCount })
        : t(`${KEY}.evidenceOk`);

  return (
    <div className="space-y-6">
      <GlassCard className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-md bg-primary/10 p-3 text-primary">
            <L.Building2 className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium">{summary.associationName}</p>
            <p className="text-sm text-muted-foreground">
              {[
                summary.name,
                t(`${KEY}.summaryProgress`, {
                  earned: view.earned,
                  total: view.total,
                  credit: creditLabel,
                }),
                t(`${KEY}.managedBy`),
              ].join(" · ")}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RequirementSourceBadge t={t} source="ASSOCIATION" />
          {bandBadge}
        </div>
      </GlassCard>

      <GlassCard className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-medium">{summary.name}</h2>
              {bandBadge}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {t(`${KEY}.assignedBy`, { association: summary.associationName })}
            </p>
            {summary.description ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {summary.description}
              </p>
            ) : null}
          </div>

          <Button
            radius="xl"
            type="button"
            onClick={onLogActivity}
            className="w-full justify-center md:w-auto"
          >
            <L.Plus className="h-4 w-4" />
            {t(`${KEY}.logActivity`)}
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[220px_1fr] lg:items-center">
          <div className="mx-auto w-full max-w-[220px]">
            <ProgressDonutChart
              data={view.chartData}
              valueSuffix={creditLabel}
              ariaLabel={t(`${KEY}.chartAria`, {
                earned: view.earned,
                total: view.total,
                credit: creditLabel,
                percent: Math.round(view.percent),
              })}
              centerLabel={
                <span className="text-3xl font-medium text-primary">
                  {view.chartPercent}%
                </span>
              }
            />
            <p className="text-center text-sm text-muted-foreground">
              {t(`${KEY}.toGo`, {
                amount: view.remaining,
                credit: creditLabel,
              })}
            </p>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            <Stat
              label={t(`${KEY}.totalRequired`)}
              value={`${view.total} ${creditLabel}`}
            />
            <Stat
              label={t(`${KEY}.completed`)}
              value={`${view.earned} ${creditLabel}`}
            />
            <Stat
              label={t(`${KEY}.deadline`)}
              value={summary.dueDate ? formatDeadline(summary.dueDate) : "—"}
              helper={R.deadlineText(t, summary.dueDate, summary.daysRemaining)}
            />
            <Stat
              label={t(`${KEY}.evidence`)}
              value={t(`${KEY}.evidencePolicy.${summary.evidencePolicy}`)}
              helper={evidenceHelper}
            />
          </dl>
        </div>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <RequirementCategoryProgress
          t={t}
          isLoading={isLoading}
          creditLabel={creditLabel}
          categories={detail?.categories ?? []}
        />
        <RequirementLearningContent
          t={t}
          isLoading={isLoading}
          onMarkComplete={onMarkComplete}
          contents={detail?.learningContents ?? []}
        />
      </div>

      <RequirementActivitiesTable
        t={t}
        isLoading={isLoading}
        rows={R.associationActivityRows(t, detail?.activities ?? [])}
      />
    </div>
  );
};
