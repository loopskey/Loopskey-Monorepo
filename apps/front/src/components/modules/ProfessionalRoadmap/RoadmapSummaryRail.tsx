"use client";

import { completionsThisWeek, dayStreak } from "@/utils/roadmap-journey.util";
import { RoadmapEnrollmentStatus } from "@/lib/graphql/base";
import { daysUntil } from "@/utils/roadmap-journey.util";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

import type { RoadmapSummaryRailProps } from "@/types/professional-roadmap-chat.types";

const KEY = "professionalDashboard.roadmap";

const RING_RADIUS = 32;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const STREAK_MIN_DAYS = 2;

const ROW_CLASS_NAME = "flex justify-between gap-3 border-t py-2 text-sm";

const clampPercent = (value: number) => Math.min(Math.max(value, 0), 100);

export const RoadmapSummaryRail = ({ roadmap }: RoadmapSummaryRailProps) => {
  const { t, language } = useI18n();

  const progress = clampPercent(roadmap.progress);
  const isCompleted =
    roadmap.status === RoadmapEnrollmentStatus.Completed || progress >= 100;
  const tracksCredits =
    typeof roadmap.requiredCredits === "number" && roadmap.requiredCredits > 0;
  const thisWeekCount = completionsThisWeek(roadmap.phases);
  const streak = dayStreak(roadmap.phases);
  const targetDays =
    !isCompleted && roadmap.targetDate
      ? daysUntil(new Date(roadmap.targetDate))
      : null;

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(
      new Date(value),
    );

  const stateLabel = isCompleted
    ? t(`${KEY}.completed`)
    : roadmap.completedSteps === 0
      ? t(`${KEY}.notStarted`)
      : t(`${KEY}.card.phaseOf`, {
          current: Math.min(roadmap.completedPhases + 1, roadmap.phasesCount),
          total: roadmap.phasesCount,
        });

  const targetNote =
    targetDays === null
      ? null
      : targetDays < 0
        ? t(`${KEY}.targetDatePassed`)
        : targetDays === 0
          ? t(`${KEY}.targetDateToday`)
          : t(`${KEY}.targetDateRemaining`, { days: targetDays });

  return (
    <aside
      aria-label={t(`${KEY}.progressSection`)}
      className="space-y-4 rounded-xl border p-4 xl:sticky xl:top-24"
    >
      <div className="flex items-center gap-4">
        <div
          role="img"
          className="relative size-[4.75rem] shrink-0"
          aria-label={t(`${KEY}.hero.progressRingLabel`, { progress })}
        >
          <svg viewBox="0 0 76 76" className="size-full -rotate-90">
            <circle
              cx="38"
              cy="38"
              fill="none"
              strokeWidth="7"
              r={RING_RADIUS}
              className="stroke-muted"
            />
            <circle
              cx="38"
              cy="38"
              fill="none"
              strokeWidth="7"
              r={RING_RADIUS}
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress / 100)}
              className={isCompleted ? "stroke-success" : "stroke-primary"}
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-base font-semibold tabular-nums">
            {progress}%
          </span>
        </div>

        <div className="min-w-0">
          <p className="font-medium tabular-nums">
            {t(`${KEY}.ofSteps`, {
              completed: roadmap.completedSteps,
              total: roadmap.totalSteps,
            })}
          </p>
          <p className="text-xs text-muted-foreground">{stateLabel}</p>
        </div>
      </div>

      <dl className="grid gap-x-6 sm:grid-cols-2 xl:grid-cols-1">
        <div className={ROW_CLASS_NAME}>
          <dt className="text-muted-foreground">
            {t(`${KEY}.summary.phasesDone`)}
          </dt>
          <dd className="font-medium tabular-nums">
            {t(`${KEY}.summary.countOf`, {
              completed: roadmap.completedPhases,
              total: roadmap.phasesCount,
            })}
          </dd>
        </div>

        {roadmap.estimatedWeeks ? (
          <div className={ROW_CLASS_NAME}>
            <dt className="text-muted-foreground">{t(`${KEY}.duration`)}</dt>
            <dd className="font-medium tabular-nums">
              {t(`${KEY}.weeks`, { count: roadmap.estimatedWeeks })}
            </dd>
          </div>
        ) : null}

        {isCompleted && roadmap.completedAt ? (
          <div className={ROW_CLASS_NAME}>
            <dt className="text-muted-foreground">{t(`${KEY}.completed`)}</dt>
            <dd className="font-medium tabular-nums">
              {formatDate(roadmap.completedAt)}
            </dd>
          </div>
        ) : null}

        {targetDays !== null && roadmap.targetDate ? (
          <div className={ROW_CLASS_NAME}>
            <dt className="text-muted-foreground">{t(`${KEY}.targetDate`)}</dt>
            <dd className="text-right font-medium tabular-nums">
              {formatDate(roadmap.targetDate)}
              <span
                className={cn(
                  "block text-xs font-normal",
                  targetDays < 0 ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {targetNote}
              </span>
            </dd>
          </div>
        ) : null}

        <div className={ROW_CLASS_NAME}>
          <dt className="text-muted-foreground">
            {t(`${KEY}.summary.doneThisWeek`)}
          </dt>
          <dd className="font-medium tabular-nums">{thisWeekCount}</dd>
        </div>

        {streak >= STREAK_MIN_DAYS ? (
          <div className={ROW_CLASS_NAME}>
            <dt className="text-muted-foreground">
              {t(`${KEY}.summary.streak`)}
            </dt>
            <dd className="font-medium tabular-nums">
              {t(`${KEY}.summary.days`, { count: streak })}
            </dd>
          </div>
        ) : null}
      </dl>

      {tracksCredits ? (
        <div className="space-y-2 border-t pt-3 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-muted-foreground">
              {t(`${KEY}.cpdTarget`)}
            </span>
            <span className="font-medium tabular-nums">
              {t(`${KEY}.creditsOf`, {
                earned: roadmap.earnedCredits,
                required: roadmap.requiredCredits ?? 0,
              })}
            </span>
          </div>
          <span className="block h-1.5 overflow-hidden rounded-full bg-muted">
            <span
              className={cn(
                "block h-full rounded-full",
                isCompleted ? "bg-success" : "bg-primary",
              )}
              style={{
                width: `${clampPercent((roadmap.earnedCredits / (roadmap.requiredCredits ?? 1)) * 100)}%`,
              }}
            />
          </span>
        </div>
      ) : null}

      {roadmap.coverageNote ? (
        <p className="border-t pt-3 text-xs leading-5 text-muted-foreground">
          {roadmap.coverageNote}
        </p>
      ) : null}
    </aside>
  );
};
