"use client";

import { RoadmapEnrollmentStatus } from "@/lib/graphql/base";
import { CourseCategory } from "@/lib/graphql/base";
import { translateWithFallback } from "@/utils/function-helper";
import { humanizeEnumValue } from "@/utils/function-helper";
import { RoadmapMatchTier } from "@/lib/graphql/base";
import { RoadmapSource } from "@/lib/graphql/base";
import { daysUntil } from "@/utils/roadmap-journey.util";
import { Skeleton } from "@ui/skeleton";
import { useI18n } from "@/hooks/useI18n";
import { cn } from "@/lib/utils";

import type { TRoadmapCardProps } from "@/types/element.types";

import Image from "next/image";
import Link from "next/link";

import * as L from "lucide-react";
import * as A from "@ui/alert-dialog";

const CATEGORY_ART_CLASS_NAME: Record<CourseCategory, string> = {
  [CourseCategory.Cpd]: "bg-[url('/roadmap-art-cpd.svg')]",
  [CourseCategory.Other]: "bg-[url('/roadmap-art-other.svg')]",
  [CourseCategory.Design]: "bg-[url('/roadmap-art-design.svg')]",
  [CourseCategory.Finance]: "bg-[url('/roadmap-art-finance.svg')]",
  [CourseCategory.Business]: "bg-[url('/roadmap-art-business.svg')]",
  [CourseCategory.Education]: "bg-[url('/roadmap-art-education.svg')]",
  [CourseCategory.Marketing]: "bg-[url('/roadmap-art-marketing.svg')]",
  [CourseCategory.Technology]: "bg-[url('/roadmap-art-technology.svg')]",
  [CourseCategory.Leadership]: "bg-[url('/roadmap-art-leadership.svg')]",
  [CourseCategory.Compliance]: "bg-[url('/roadmap-art-compliance.svg')]",
  [CourseCategory.Healthcare]: "bg-[url('/roadmap-art-healthcare.svg')]",
  [CourseCategory.Engineering]: "bg-[url('/roadmap-art-engineering.svg')]",
};

const RING_RADIUS = 24;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const CHIP_CLASS_NAME =
  "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold backdrop-blur-md";

const GLASS_CHIP_CLASS_NAME = cn(CHIP_CLASS_NAME, "bg-black/45 text-white");

const clampPercent = (value: number) => Math.min(Math.max(value, 0), 100);

export const RoadmapCard = ({
  href,
  roadmap,
  className,
  onUnenroll,
  isSelected = false,
  isUnenrolling = false,
}: TRoadmapCardProps) => {
  const { t, language } = useI18n();

  const progress = clampPercent(roadmap.progress);
  const isCompleted =
    roadmap.status === RoadmapEnrollmentStatus.Completed || progress >= 100;
  const isFresh = !isCompleted && roadmap.completedSteps === 0;
  const isGenerated = roadmap.source === RoadmapSource.Generated;
  const isCloseMatch =
    Boolean(roadmap.matchTier) && roadmap.matchTier !== RoadmapMatchTier.Exact;
  const tracksCredits =
    typeof roadmap.requiredCredits === "number" && roadmap.requiredCredits > 0;

  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(language, { dateStyle: "medium" }).format(
      new Date(value),
    );

  const phaseNumber = Math.min(
    roadmap.completedPhases + 1,
    roadmap.phasesCount,
  );
  const targetDays =
    !isCompleted && roadmap.targetDate
      ? daysUntil(new Date(roadmap.targetDate))
      : null;

  const categoryLabel = roadmap.category
    ? translateWithFallback(
        t,
        `content.enums.courseCategory.${roadmap.category}`,
        humanizeEnumValue(roadmap.category),
      )
    : null;
  const levelLabel = translateWithFallback(
    t,
    `content.enums.courseLevel.${roadmap.level}`,
    humanizeEnumValue(roadmap.level),
  );

  const statusLabel = isCompleted
    ? t("professionalDashboard.roadmap.completed")
    : isFresh
      ? t("professionalDashboard.roadmap.notStarted")
      : t("professionalDashboard.roadmap.inProgress");
  const statusClassName = isCompleted
    ? "bg-success text-success-foreground"
    : isFresh
      ? "bg-white/25 text-white backdrop-blur-md"
      : "bg-background text-foreground";

  const ctaLabel = isCompleted
    ? t("professionalDashboard.roadmap.card.view")
    : isFresh
      ? t("professionalDashboard.roadmap.card.start")
      : t("professionalDashboard.roadmap.card.continue");

  const ringClassName = isCompleted ? "stroke-success" : "stroke-primary";
  const fillClassName = isCompleted ? "bg-success" : "bg-primary";

  return (
    <article
      aria-current={isSelected ? "true" : undefined}
      className={cn(
        "group relative isolate flex min-w-0 flex-col overflow-hidden rounded-2xl bg-card text-card-foreground shadow-md",
        "transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl",
        "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        "has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-offset-2",
        isSelected && "ring-2 ring-primary ring-offset-2",
        className,
      )}
    >
      <div className="relative isolate h-32 overflow-hidden bg-muted">
        {roadmap.imageUrl ? (
          <Image
            fill
            alt=""
            src={roadmap.imageUrl}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="-z-20 object-cover"
          />
        ) : (
          <div
            aria-hidden
            className={cn(
              "absolute inset-0 -z-20 bg-cover bg-center",
              CATEGORY_ART_CLASS_NAME[roadmap.category ?? CourseCategory.Other],
            )}
          />
        )}

        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-gradient-to-t from-black/40 to-transparent"
        />

        <div className="absolute inset-x-6 top-5 flex items-center justify-between gap-2">
          <span className={GLASS_CHIP_CLASS_NAME}>
            {isGenerated ? (
              <L.Sparkles className="size-3" aria-hidden />
            ) : (
              <L.BookOpen className="size-3" aria-hidden />
            )}
            {isGenerated
              ? t("professionalDashboard.roadmap.card.aiGenerated")
              : t("professionalDashboard.roadmap.card.catalog")}
          </span>

          <A.AlertDialog>
            <A.AlertDialogTrigger asChild>
              <button
                type="button"
                disabled={isUnenrolling}
                aria-label={t(
                  "professionalDashboard.roadmap.card.unenrollLabel",
                  {
                    title: roadmap.title,
                  },
                )}
                className="relative z-10 grid size-8 place-items-center rounded-full bg-black/45 text-white backdrop-blur-md transition-colors hover:bg-destructive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-60"
              >
                {isUnenrolling ? (
                  <L.Loader2 className="size-4 animate-spin" />
                ) : (
                  <L.X className="size-4" />
                )}
              </button>
            </A.AlertDialogTrigger>

            <A.AlertDialogContent>
              <A.AlertDialogHeader>
                <A.AlertDialogTitle>
                  {t("professionalDashboard.roadmap.card.unenrollTitle")}
                </A.AlertDialogTitle>
                <A.AlertDialogDescription>
                  {t("professionalDashboard.roadmap.card.unenrollDescription", {
                    title: roadmap.title,
                  })}
                </A.AlertDialogDescription>
              </A.AlertDialogHeader>
              <A.AlertDialogFooter>
                <A.AlertDialogCancel>{t("common.cancel")}</A.AlertDialogCancel>
                <A.AlertDialogAction onClick={() => onUnenroll(roadmap.id)}>
                  {t("professionalDashboard.roadmap.unenroll")}
                </A.AlertDialogAction>
              </A.AlertDialogFooter>
            </A.AlertDialogContent>
          </A.AlertDialog>
        </div>

        <span
          className={cn(
            CHIP_CLASS_NAME,
            "absolute bottom-3.5 left-6",
            statusClassName,
          )}
        >
          {statusLabel}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col gap-3 px-6 pt-4">
        <div
          aria-hidden
          className="absolute -top-8 right-6 grid size-16 place-items-center rounded-full bg-card shadow-lg"
        >
          <svg
            viewBox="0 0 56 56"
            className="absolute inset-1 size-14 -rotate-90"
          >
            <circle
              cx="28"
              cy="28"
              fill="none"
              strokeWidth="5"
              r={RING_RADIUS}
              className="stroke-muted"
            />
            <circle
              cx="28"
              cy="28"
              fill="none"
              strokeWidth="5"
              r={RING_RADIUS}
              strokeLinecap="round"
              className={ringClassName}
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={RING_CIRCUMFERENCE * (1 - progress / 100)}
            />
          </svg>
          <span className="relative text-sm font-bold tabular-nums tracking-tight">
            {progress}%
          </span>
        </div>

        <p className="flex min-h-[18px] items-center gap-2 pr-20 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {categoryLabel ? (
            <>
              <span className="truncate">{categoryLabel}</span>
              <span aria-hidden className="opacity-50">
                ·
              </span>
            </>
          ) : null}
          <span className="shrink-0">{levelLabel}</span>
        </p>

        <h3 className="line-clamp-2 text-balance text-lg font-semibold leading-tight tracking-tight">
          {roadmap.title}
        </h3>

        <span className="sr-only">
          {t("professionalDashboard.roadmap.hero.progressRingLabel", {
            progress,
          })}
        </span>

        <p className="line-clamp-2 text-[13px] leading-5 text-muted-foreground">
          {roadmap.description}
        </p>

        <div className="flex flex-col gap-2 pt-1">
          <div
            role="img"
            className="flex gap-1"
            aria-label={t("professionalDashboard.roadmap.card.phasesComplete", {
              completed: roadmap.completedPhases,
              total: roadmap.phasesCount,
            })}
          >
            {roadmap.phases.map((phase) => (
              <div
                key={phase.id}
                className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted"
              >
                <div
                  className={cn("h-full rounded-full", fillClassName)}
                  style={{
                    width: `${phase.completed ? 100 : clampPercent(phase.progress)}%`,
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex min-w-0 items-baseline justify-between gap-3 text-xs">
            {isCompleted ? (
              <>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {t("professionalDashboard.roadmap.card.phasesDone", {
                    completed: roadmap.completedPhases,
                    total: roadmap.phasesCount,
                  })}
                </span>
                {roadmap.completedAt ? (
                  <span className="flex items-center gap-1.5 truncate font-semibold text-success">
                    <L.CheckCircle2 className="size-3.5 shrink-0" aria-hidden />
                    {t("professionalDashboard.roadmap.card.completedOn", {
                      date: formatDate(roadmap.completedAt),
                    })}
                  </span>
                ) : null}
              </>
            ) : (
              <>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {t("professionalDashboard.roadmap.card.phaseOf", {
                    current: phaseNumber,
                    total: roadmap.phasesCount,
                  })}
                </span>
                {roadmap.nextPhaseTitle ? (
                  <span className="truncate font-semibold">
                    {roadmap.nextPhaseTitle}
                  </span>
                ) : null}
              </>
            )}
          </div>
        </div>

        <ul className="mt-1 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t pt-3.5 text-[12.5px]">
          <li className="flex min-w-0 items-center gap-2">
            <L.CheckCircle2
              className="size-4 shrink-0 text-primary"
              aria-hidden
            />
            <span className="truncate tabular-nums">
              {t("professionalDashboard.roadmap.ofSteps", {
                completed: roadmap.completedSteps,
                total: roadmap.totalSteps,
              })}
            </span>
          </li>

          {roadmap.estimatedWeeks ? (
            <li className="flex min-w-0 items-center gap-2">
              <L.Clock3 className="size-4 shrink-0 text-primary" aria-hidden />
              <span className="truncate tabular-nums">
                {t("professionalDashboard.roadmap.weeks", {
                  count: roadmap.estimatedWeeks,
                })}
              </span>
            </li>
          ) : null}

          {targetDays !== null && roadmap.targetDate ? (
            <li
              className={cn(
                "col-span-2 flex min-w-0 items-center gap-2",
                targetDays < 0 && "font-semibold text-destructive",
              )}
            >
              <L.CalendarDays
                aria-hidden
                className={cn(
                  "size-4 shrink-0",
                  targetDays < 0 ? "text-destructive" : "text-primary",
                )}
              />
              <span className="truncate tabular-nums">
                {targetDays < 0
                  ? t("professionalDashboard.roadmap.card.overdue", {
                      days: -targetDays,
                      date: formatDate(roadmap.targetDate),
                    })
                  : targetDays === 0
                    ? t("professionalDashboard.roadmap.targetDateToday")
                    : t("professionalDashboard.roadmap.card.dueIn", {
                        days: targetDays,
                        date: formatDate(roadmap.targetDate),
                      })}
              </span>
            </li>
          ) : null}

          {isCloseMatch ? (
            <li className="col-span-2 flex min-w-0 items-center gap-2">
              <L.AlertTriangle
                aria-hidden
                className="size-4 shrink-0 text-warning"
              />
              <span className="truncate">
                {t("professionalDashboard.roadmap.closeMatchTag")}
              </span>
            </li>
          ) : null}

          {tracksCredits ? (
            <li className="col-span-2 flex flex-col gap-1.5">
              <span className="flex min-w-0 items-center gap-2">
                <L.Target
                  className="size-4 shrink-0 text-primary"
                  aria-hidden
                />
                <span className="truncate tabular-nums">
                  {t("professionalDashboard.roadmap.card.cpdCredits", {
                    earned: roadmap.earnedCredits,
                    required: roadmap.requiredCredits ?? 0,
                  })}
                </span>
              </span>
              <span className="block h-1 overflow-hidden rounded-full bg-muted">
                <span
                  className={cn("block h-full rounded-full", fillClassName)}
                  style={{
                    width: `${clampPercent((roadmap.earnedCredits / (roadmap.requiredCredits ?? 1)) * 100)}%`,
                  }}
                />
              </span>
            </li>
          ) : null}
        </ul>
      </div>

      <div className="px-6 pb-6 pt-5">
        <Link
          href={href}
          className={cn(
            "flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors",
            "after:absolute after:inset-0 after:content-['']",
            isCompleted
              ? "bg-accent text-accent-foreground"
              : "bg-primary text-primary-foreground",
          )}
        >
          {ctaLabel}
          <span className="sr-only">: {roadmap.title}</span>
          <L.ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" />
        </Link>
      </div>
    </article>
  );
};

export const RoadmapCardSkeleton = ({ className }: { className?: string }) => {
  return (
    <div
      aria-hidden
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-2xl bg-card shadow-md",
        className,
      )}
    >
      <Skeleton className="h-32 w-full rounded-none" />

      <div className="flex flex-col gap-3 px-6 pt-8">
        <Skeleton className="h-3 w-28 rounded-full" />
        <Skeleton className="h-5 w-4/5 rounded-full" />
        <Skeleton className="h-3.5 w-full rounded-full" />
        <Skeleton className="h-1.5 w-full rounded-full" />
        <Skeleton className="h-3 w-40 rounded-full" />
      </div>

      <div className="px-6 pb-6 pt-8">
        <Skeleton className="h-11 w-full rounded-xl" />
      </div>
    </div>
  );
};
