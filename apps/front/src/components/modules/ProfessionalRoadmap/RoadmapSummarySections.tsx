"use client";

import { TRoadmapSummaryProps } from "@/types/professional-roadmap-chat.types";
import { GlassCard } from "@elements/glass-card";
import { Progress } from "@ui/progress";
import { Badge } from "@ui/badge";

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
  const target = targetDate ? new Date(targetDate) : null;
  const remaining = target ? daysUntil(target) : null;
  const tracksCredits =
    typeof requiredCredits === "number" && requiredCredits > 0;
  const creditProgress = tracksCredits
    ? Math.min(Math.round((earnedCredits / requiredCredits) * 100), 100)
    : 0;

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

        {tracksCredits ? (
          <div className="mt-4">
            <div className="mb-2 flex justify-between text-xs font-medium text-muted-foreground">
              <span>{t(`${key}.creditsProgress`)}</span>
              <span>
                {t(`${key}.creditsOf`, {
                  earned: earnedCredits,
                  required: requiredCredits,
                })}
              </span>
            </div>
            <Progress
              value={creditProgress}
              aria-label={t(`${key}.creditsProgress`)}
            />
          </div>
        ) : null}
      </GlassCard>

      {recommendations.length > 0 ? (
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-muted-foreground">
              {t(`${key}.recommended`)}
            </h3>
            <L.Sparkles className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>

          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {t(`${key}.recommendedDescription`)}
          </p>

          <ul className="mt-4 space-y-3">
            {recommendations.map((item) => (
              <li
                key={`${item.contentType}:${item.contentId}`}
                className="rounded-2xl border border-glass-border bg-background/40 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.isFree ? (
                    <Badge variant="secondary">{t(`${key}.free`)}</Badge>
                  ) : null}
                </div>

                <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{item.contentType}</span>
                  {item.durationMinutes ? (
                    <span>
                      {t(`${key}.minutes`, { count: item.durationMinutes })}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </GlassCard>
      ) : null}
    </div>
  );
};
