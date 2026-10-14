"use client";

import { RoadmapStepProgressStatus } from "@/lib/graphql/base";
import { roadmapContentHref } from "@/utils/roadmap-navigation.util";
import { findCurrentPhaseId } from "@/utils/roadmap-journey.util";
import { RoadmapStepMeta } from "@modules/ProfessionalRoadmap/RoadmapStepMeta";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import type { TRoadmapPhaseProps } from "@/types/professional-roadmap-chat.types";

import Link from "next/link";

import * as DM from "@ui/dropdown-menu";
import * as L from "lucide-react";

const KEY = "professionalDashboard.roadmap";

type WeekRange = { start: number; end: number };

const weekRanges = (
  phases: TRoadmapPhaseProps["phases"],
): Map<string, WeekRange> => {
  const ranges = new Map<string, WeekRange>();
  let cursor = 1;
  for (const phase of phases) {
    const length = Math.max(phase.estimatedWeeks ?? 0, 0);
    if (length === 0) continue;
    ranges.set(phase.id, { start: cursor, end: cursor + length - 1 });
    cursor += length;
  }
  return ranges;
};

const toggled = (current: Set<string>, id: string) => {
  const next = new Set(current);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
};

export const RoadmapPhaseList = ({
  phases,
  pending,
  onStart,
  onComplete,
  nextStepId,
  enrollmentId,
  failedStepId,
}: TRoadmapPhaseProps) => {
  const { t } = useI18n();
  const currentPhaseId = findCurrentPhaseId(phases);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(
    () => new Set(currentPhaseId ? [currentPhaseId] : []),
  );
  const [detailedSteps, setDetailedSteps] = useState<Set<string>>(new Set());
  const ranges = weekRanges(phases);

  const weekLabel = (range: WeekRange) =>
    range.start === range.end
      ? t(`${KEY}.weekSingle`, { week: range.start })
      : t(`${KEY}.weekRange`, { start: range.start, end: range.end });

  return (
    <ol>
      {phases.map((phase, index) => {
        const isExpanded = expandedPhases.has(phase.id);
        const isCurrent = phase.id === currentPhaseId && !phase.completed;
        const range = ranges.get(phase.id);
        const stateLabel = phase.completed
          ? t(`${KEY}.completed`)
          : isCurrent && phase.completedSteps > 0
            ? t(`${KEY}.inProgress`)
            : null;
        const summary = [range ? weekLabel(range) : null, stateLabel].filter(
          Boolean,
        );

        return (
          <li
            key={phase.id}
            className="relative grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3.5 pb-4 last:pb-0"
          >
            {index < phases.length - 1 ? (
              <span
                aria-hidden
                className={cn(
                  "absolute bottom-0 left-[15px] top-8 w-0.5",
                  phase.completed ? "bg-success" : "bg-border",
                )}
              />
            ) : null}

            <span
              aria-hidden
              className={cn(
                "relative grid size-8 place-items-center rounded-full border-2 text-xs font-semibold tabular-nums",
                phase.completed
                  ? "border-success bg-success text-success-foreground"
                  : isCurrent
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground",
              )}
            >
              {phase.completed ? <L.Check className="size-4" /> : index + 1}
            </span>

            <div className="min-w-0">
              <h3>
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() =>
                    setExpandedPhases((current) => toggled(current, phase.id))
                  }
                  className="flex min-h-8 w-full items-center justify-between gap-3 rounded-md text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="min-w-0 font-medium">{phase.title}</span>
                  <span className="flex shrink-0 items-center gap-2 text-xs tabular-nums text-muted-foreground">
                    {t(`${KEY}.ofSteps`, {
                      completed: phase.completedSteps,
                      total: phase.stepsCount,
                    })}
                    <L.ChevronDown
                      aria-hidden
                      className={cn(
                        "size-4 transition-transform motion-reduce:transition-none",
                        isExpanded && "rotate-180",
                      )}
                    />
                  </span>
                </button>
              </h3>

              {summary.length > 0 ? (
                <p className="text-xs text-muted-foreground">
                  {summary.join(" · ")}
                </p>
              ) : null}

              {isExpanded ? (
                <>
                  {phase.description ? (
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                      {phase.description}
                    </p>
                  ) : null}

                  <ul className="mt-3 overflow-hidden rounded-lg border">
                    {phase.steps.map((step) => {
                      const isComplete =
                        step.status === RoadmapStepProgressStatus.Completed;
                      const isStarted =
                        step.status === RoadmapStepProgressStatus.InProgress;
                      const isBusy = pending?.stepId === step.id;
                      const isNext = step.id === nextStepId;
                      const isDetailed = detailedSteps.has(step.id);
                      const contentHref = roadmapContentHref(
                        step.contentType,
                        step.contentSlug,
                      );
                      const hasMenu = !isComplete || Boolean(step.description);

                      return (
                        <li
                          key={step.id}
                          className={cn(
                            "grid grid-cols-[1.5rem_minmax(0,1fr)] items-center gap-x-3 gap-y-1 border-b px-3 py-2.5 last:border-b-0 sm:grid-cols-[1.5rem_minmax(0,1fr)_auto]",
                            isNext && "bg-primary/5",
                          )}
                        >
                          <span className="grid size-6 place-items-center">
                            {isBusy ? (
                              <L.Loader2
                                aria-hidden
                                className="size-5 animate-spin text-primary"
                              />
                            ) : isComplete ? (
                              <span className="grid size-5 place-items-center rounded-full bg-success text-success-foreground">
                                <L.Check aria-hidden className="size-3.5" />
                              </span>
                            ) : isStarted ? (
                              <L.CircleDot
                                aria-hidden
                                className="size-5 text-primary"
                              />
                            ) : (
                              <L.Circle
                                aria-hidden
                                className="size-5 text-muted-foreground/60"
                              />
                            )}
                            <span className="sr-only">
                              {isComplete
                                ? t(`${KEY}.completed`)
                                : isStarted
                                  ? t(`${KEY}.inProgress`)
                                  : t(`${KEY}.notStarted`)}
                            </span>
                          </span>

                          <div className="min-w-0 space-y-0.5">
                            <p
                              className={cn(
                                "text-sm font-medium break-words",
                                isComplete && "text-muted-foreground",
                              )}
                            >
                              {step.title}
                            </p>

                            <RoadmapStepMeta
                              credits={step.credits}
                              contentType={step.contentType}
                              estimatedMinutes={step.estimatedMinutes}
                            >
                              {isNext ? (
                                <span className="rounded-full bg-primary px-2 py-px text-[11px] font-semibold text-primary-foreground">
                                  {t(`${KEY}.nextStepTag`)}
                                </span>
                              ) : isStarted ? (
                                <span className="rounded-full bg-accent px-2 py-px text-[11px] font-semibold text-accent-foreground">
                                  {t(`${KEY}.inProgress`)}
                                </span>
                              ) : null}
                              {step.isCloseMatch ? (
                                <span className="rounded-full bg-warning-soft px-2 py-px text-[11px] font-semibold text-warning-soft-foreground">
                                  {t(`${KEY}.closeMatchTag`)}
                                </span>
                              ) : null}
                            </RoadmapStepMeta>

                            {isDetailed && step.description ? (
                              <p className="pt-1 text-sm leading-6 text-muted-foreground">
                                {step.description}
                              </p>
                            ) : null}

                            {failedStepId === step.id ? (
                              <p
                                role="alert"
                                className="pt-1 text-xs font-medium text-destructive"
                              >
                                {t(`${KEY}.stepFailed`)}
                              </p>
                            ) : null}
                          </div>

                          <div className="col-start-2 -ml-2.5 flex items-center gap-1 sm:col-start-3 sm:ml-0">
                            {contentHref ? (
                              <Button
                                asChild
                                size="sm"
                                variant="ghost"
                                className="text-primary"
                              >
                                <Link
                                  target="_blank"
                                  href={contentHref}
                                  rel="noopener noreferrer"
                                >
                                  {t(`${KEY}.openContent`)}
                                  <span className="sr-only">
                                    : {step.title}
                                  </span>
                                  <L.ArrowUpRight
                                    aria-hidden
                                    className="size-3.5"
                                  />
                                </Link>
                              </Button>
                            ) : null}

                            {hasMenu ? (
                              <DM.DropdownMenu>
                                <DM.DropdownMenuTrigger asChild>
                                  <Button
                                    size="iconSm"
                                    variant="ghost"
                                    aria-label={t(`${KEY}.stepActions`, {
                                      title: step.title,
                                    })}
                                  >
                                    <L.MoreHorizontal className="size-4" />
                                  </Button>
                                </DM.DropdownMenuTrigger>

                                <DM.DropdownMenuContent align="end">
                                  {!isComplete ? (
                                    <DM.DropdownMenuItem
                                      disabled={isBusy}
                                      onSelect={() =>
                                        isStarted
                                          ? onComplete(enrollmentId, step.id)
                                          : onStart(enrollmentId, step.id)
                                      }
                                    >
                                      {isStarted ? (
                                        <L.CheckCircle2 className="size-4" />
                                      ) : (
                                        <L.Play className="size-4" />
                                      )}
                                      {t(
                                        isStarted
                                          ? `${KEY}.markComplete`
                                          : `${KEY}.start`,
                                      )}
                                    </DM.DropdownMenuItem>
                                  ) : null}

                                  {step.description ? (
                                    <DM.DropdownMenuItem
                                      onSelect={() =>
                                        setDetailedSteps((current) =>
                                          toggled(current, step.id),
                                        )
                                      }
                                    >
                                      <L.Info className="size-4" />
                                      {t(
                                        isDetailed
                                          ? `${KEY}.hideDetails`
                                          : `${KEY}.showDetails`,
                                      )}
                                    </DM.DropdownMenuItem>
                                  ) : null}
                                </DM.DropdownMenuContent>
                              </DM.DropdownMenu>
                            ) : null}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
};
