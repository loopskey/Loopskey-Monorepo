"use client";

import { clampPercent, isRoadmapCompleted } from "@/utils/roadmap-library.util";
import { completionsThisWeek, dayStreak } from "@/utils/roadmap-journey.util";
import { findCurrentPhaseId } from "@/utils/roadmap-journey.util";
import { daysUntil } from "@/utils/roadmap-journey.util";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

import type { TRoadmapProgressCardProps } from "@/types/professional-roadmap-chat.types";
import type { TStat } from "@/types/professional-roadmap-chat.types";

const KEY = "professionalDashboard.roadmap";

const STREAK_MIN_DAYS = 2;

export const RoadmapProgressCard = ({ roadmap }: TRoadmapProgressCardProps) => {
  const { t, language } = useI18n();

  const progress = clampPercent(roadmap.progress);
  const isCompleted = isRoadmapCompleted(roadmap);
  const currentPhaseId = findCurrentPhaseId(roadmap.phases);
  const currentPhaseNumber =
    roadmap.phases.findIndex((phase) => phase.id === currentPhaseId) + 1;
  const thisWeek = completionsThisWeek(roadmap.phases);
  const streak = dayStreak(roadmap.phases);
  const targetDays =
    !isCompleted && roadmap.targetDate
      ? daysUntil(new Date(roadmap.targetDate))
      : null;
  const tracksCredits =
    typeof roadmap.requiredCredits === "number" && roadmap.requiredCredits > 0;

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(
      new Date(value),
    );

  const targetNote =
    targetDays === null
      ? null
      : targetDays < 0
        ? t(`${KEY}.targetDatePassed`)
        : targetDays === 0
          ? t(`${KEY}.targetDateToday`)
          : t(`${KEY}.targetDateRemaining`, { days: targetDays });

  const stats: TStat[] = [
    {
      key: "week",
      label: t(`${KEY}.strip.thisWeek`),
      value: t(`${KEY}.strip.stepsCount`, { count: thisWeek }),
    },
    {
      key: "phases",
      label: t(`${KEY}.summary.phasesDone`),
      value: t(`${KEY}.summary.countOf`, {
        completed: roadmap.completedPhases,
        total: roadmap.phasesCount,
      }),
    },
  ];
  if (streak >= STREAK_MIN_DAYS)
    stats.push({
      key: "streak",
      label: t(`${KEY}.summary.streak`),
      value: t(`${KEY}.summary.days`, { count: streak }),
    });
  if (tracksCredits)
    stats.push({
      key: "credits",
      label: t(`${KEY}.cpdTarget`),
      value: t(`${KEY}.creditsOf`, {
        earned: roadmap.earnedCredits,
        required: roadmap.requiredCredits ?? 0,
      }),
    });
  if (isCompleted && roadmap.completedAt)
    stats.push({
      key: "completed",
      label: t(`${KEY}.completed`),
      value: formatDate(roadmap.completedAt),
    });
  else if (targetDays !== null && roadmap.targetDate)
    stats.push({
      key: "target",
      label: t(`${KEY}.targetDate`),
      value: formatDate(roadmap.targetDate),
      note: targetNote,
      isLate: targetDays < 0,
    });
  else if (roadmap.estimatedWeeks)
    stats.push({
      key: "duration",
      label: t(`${KEY}.duration`),
      value: t(`${KEY}.weeks`, { count: roadmap.estimatedWeeks }),
    });

  return (
    <section
      aria-label={t(`${KEY}.progressSection`)}
      className="space-y-3 rounded-2xl border bg-card p-4"
    >
      <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
        <span className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">
          {progress}%
        </span>
        <span className="text-sm text-muted-foreground">
          {t(`${KEY}.ofSteps`, {
            completed: roadmap.completedSteps,
            total: roadmap.totalSteps,
          })}
          {!isCompleted && currentPhaseNumber > 0 ? (
            <>
              {" · "}
              {t(`${KEY}.card.phaseOf`, {
                current: currentPhaseNumber,
                total: roadmap.phasesCount,
              })}
            </>
          ) : null}
        </span>
      </p>

      <ol className="flex gap-1">
        {roadmap.phases.map((phase, index) => {
          const phaseProgress = phase.stepsCount
            ? clampPercent((phase.completedSteps / phase.stepsCount) * 100)
            : 0;
          return (
            <li
              key={phase.id}
              style={{ flexGrow: Math.max(phase.stepsCount, 1) }}
              className="h-2 min-w-0 basis-0 overflow-hidden rounded-full bg-muted"
            >
              <span
                style={{ width: `${phaseProgress}%` }}
                className={cn(
                  "block h-full rounded-full",
                  phase.completed ? "bg-success" : "bg-primary",
                )}
              />
              <span className="sr-only">
                {t(`${KEY}.strip.phaseLabel`, {
                  number: index + 1,
                  title: phase.title,
                })}
                {", "}
                {t(`${KEY}.ofSteps`, {
                  completed: phase.completedSteps,
                  total: phase.stepsCount,
                })}
              </span>
            </li>
          );
        })}
      </ol>

      <dl>
        {stats.map((stat) => (
          <div
            key={stat.key}
            className="flex items-start justify-between gap-3 border-t py-2 text-sm"
          >
            <dt className="text-muted-foreground">{stat.label}</dt>
            <dd className="text-right font-semibold tabular-nums text-foreground">
              {stat.value}
              {stat.note ? (
                <span
                  className={cn(
                    "block text-xs font-normal",
                    stat.isLate ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {stat.note}
                </span>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
};
