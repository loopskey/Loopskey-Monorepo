"use client";

import { clampPercent, isRoadmapCompleted } from "@/utils/roadmap-library.util";
import { completionsThisWeek, dayStreak } from "@/utils/roadmap-journey.util";
import { findCurrentPhaseId } from "@/utils/roadmap-journey.util";
import { daysUntil } from "@/utils/roadmap-journey.util";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

import type { TRoadmapProgressStripProps } from "@/types/professional-roadmap-chat.types";

const KEY = "professionalDashboard.roadmap";

const STREAK_MIN_DAYS = 2;

const STAT_CLASS_NAME =
  "min-w-0 border-border py-1 sm:border-l sm:px-5 sm:first:border-l-0 sm:first:pl-0 lg:first:border-l lg:first:pl-5";

export const RoadmapProgressStrip = ({
  roadmap,
}: TRoadmapProgressStripProps) => {
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

  const stats = [
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
    ...(streak >= STREAK_MIN_DAYS
      ? [
          {
            key: "streak",
            label: t(`${KEY}.summary.streak`),
            value: t(`${KEY}.summary.days`, { count: streak }),
          },
        ]
      : []),
    ...(tracksCredits
      ? [
          {
            key: "credits",
            label: t(`${KEY}.cpdTarget`),
            value: t(`${KEY}.creditsOf`, {
              earned: roadmap.earnedCredits,
              required: roadmap.requiredCredits ?? 0,
            }),
          },
        ]
      : []),
    ...(isCompleted && roadmap.completedAt
      ? [
          {
            key: "completed",
            label: t(`${KEY}.completed`),
            value: formatDate(roadmap.completedAt),
          },
        ]
      : targetDays !== null && roadmap.targetDate
        ? [
            {
              key: "target",
              label: t(`${KEY}.targetDate`),
              value: formatDate(roadmap.targetDate),
              note: targetNote,
              isLate: targetDays < 0,
            },
          ]
        : roadmap.estimatedWeeks
          ? [
              {
                key: "duration",
                label: t(`${KEY}.duration`),
                value: t(`${KEY}.weeks`, { count: roadmap.estimatedWeeks }),
              },
            ]
          : []),
  ];

  return (
    <section
      aria-label={t(`${KEY}.progressSection`)}
      className="flex flex-col gap-5 rounded-2xl border p-4 sm:p-5 lg:flex-row lg:items-center"
    >
      <div className="min-w-0 flex-1 space-y-2.5">
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">
            {progress}%
          </span>
          <span className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {t(`${KEY}.ofSteps`, {
                completed: roadmap.completedSteps,
                total: roadmap.totalSteps,
              })}
            </span>
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
            const isCurrent = phase.id === currentPhaseId && !phase.completed;
            const phaseProgress = phase.stepsCount
              ? clampPercent((phase.completedSteps / phase.stepsCount) * 100)
              : 0;
            return (
              <li
                key={phase.id}
                style={{ flexGrow: Math.max(phase.stepsCount, 1) }}
                className="min-w-0 basis-0 space-y-1.5"
              >
                <span
                  aria-hidden
                  className="block h-2 overflow-hidden rounded-full bg-muted"
                >
                  <span
                    style={{ width: `${phaseProgress}%` }}
                    className={cn(
                      "block h-full rounded-full",
                      phase.completed ? "bg-success" : "bg-primary",
                    )}
                  />
                </span>
                <span
                  className={cn(
                    "hidden truncate text-xs sm:block",
                    isCurrent
                      ? "font-semibold text-primary"
                      : "text-muted-foreground",
                  )}
                >
                  <span aria-hidden>
                    {index + 1} · {phase.title}
                  </span>
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
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:flex sm:flex-wrap sm:gap-y-3">
        {stats.map((stat) => (
          <div key={stat.key} className={STAT_CLASS_NAME}>
            <dt className="text-xs text-muted-foreground">{stat.label}</dt>
            <dd className="mt-0.5 text-base font-semibold tabular-nums text-foreground">
              {stat.value}
              {"note" in stat && stat.note ? (
                <span
                  className={cn(
                    "block text-xs font-normal",
                    "isLate" in stat && stat.isLate
                      ? "text-destructive"
                      : "text-muted-foreground",
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
