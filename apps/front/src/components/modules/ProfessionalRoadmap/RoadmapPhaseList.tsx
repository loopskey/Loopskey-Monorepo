"use client";

import { RoadmapStepProgressStatus } from "@/lib/graphql/base";
import { roadmapContentHref } from "@/utils/roadmap-navigation.util";
import { findCurrentPhaseId } from "@/utils/roadmap-journey.util";
import { RoadmapStepMeta } from "@modules/ProfessionalRoadmap/RoadmapStepMeta";
import { clampPercent } from "@/utils/roadmap-library.util";
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

const SEGMENT_CLASS_NAME =
  "h-8 rounded-md px-3 text-xs font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring";

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
  const [remainingOnly, setRemainingOnly] = useState(false);
  const ranges = weekRanges(phases);

  const totalSteps = phases.reduce((sum, phase) => sum + phase.stepsCount, 0);
  const remainingSteps = phases.reduce(
    (sum, phase) => sum + phase.stepsCount - phase.completedSteps,
    0,
  );
  const visiblePhases = remainingOnly
    ? phases.filter((phase) => !phase.completed)
    : phases;
  const allExpanded =
    visiblePhases.length > 0 &&
    visiblePhases.every((phase) => expandedPhases.has(phase.id));

  const toggleAll = () =>
    setExpandedPhases((current) => {
      const next = new Set(current);
      for (const phase of visiblePhases)
        if (allExpanded) next.delete(phase.id);
        else next.add(phase.id);
      return next;
    });

  const weekLabel = (range: WeekRange) =>
    range.start === range.end
      ? t(`${KEY}.weekSingle`, { week: range.start })
      : t(`${KEY}.weekRange`, { start: range.start, end: range.end });

  return (
    <section aria-labelledby="roadmap-path-title" className="space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <h2
          id="roadmap-path-title"
          className="text-lg font-semibold text-foreground"
        >
          {t(`${KEY}.sections.path`)}
        </h2>
        <div
          role="group"
          aria-label={t(`${KEY}.path.show`)}
          className="inline-flex rounded-lg bg-muted p-0.5"
        >
          {[false, true].map((isRemaining) => {
            const isOn = remainingOnly === isRemaining;
            return (
              <button
                key={String(isRemaining)}
                type="button"
                aria-pressed={isOn}
                onClick={() => setRemainingOnly(isRemaining)}
                className={cn(
                  SEGMENT_CLASS_NAME,
                  isOn
                    ? "bg-background text-primary shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isRemaining
                  ? t(`${KEY}.path.remaining`, { count: remainingSteps })
                  : t(`${KEY}.path.all`, { count: totalSteps })}
              </button>
            );
          })}
        </div>
        {visiblePhases.length > 0 ? (
          <Button
            size="sm"
            type="button"
            variant="ghost"
            onClick={toggleAll}
            className="ml-auto text-primary"
          >
            {t(
              allExpanded ? `${KEY}.path.collapseAll` : `${KEY}.path.expandAll`,
            )}
          </Button>
        ) : null}
      </div>

      {visiblePhases.length === 0 ? (
        <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
          {t(`${KEY}.path.empty`)}
        </p>
      ) : (
        <ol className="space-y-2.5">
          {visiblePhases.map((phase) => {
            const number = phases.indexOf(phase) + 1;
            const isExpanded = expandedPhases.has(phase.id);
            const isCurrent = phase.id === currentPhaseId && !phase.completed;
            const range = ranges.get(phase.id);
            const stateLabel = phase.completed
              ? t(`${KEY}.completed`)
              : isCurrent && phase.completedSteps > 0
                ? t(`${KEY}.inProgress`)
                : null;
            const summary = [range ? weekLabel(range) : null, stateLabel]
              .filter(Boolean)
              .join(" · ");
            const phaseProgress = phase.stepsCount
              ? clampPercent((phase.completedSteps / phase.stepsCount) * 100)
              : 0;
            const steps = remainingOnly
              ? phase.steps.filter(
                  (step) => step.status !== RoadmapStepProgressStatus.Completed,
                )
              : phase.steps;

            return (
              <li
                key={phase.id}
                className={cn(
                  "overflow-hidden rounded-2xl border bg-card",
                  isCurrent && "border-primary/35",
                )}
              >
                <h3>
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() =>
                      setExpandedPhases((current) => toggled(current, phase.id))
                    }
                    className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold tabular-nums",
                        phase.completed
                          ? "border-success bg-success text-success-foreground"
                          : isCurrent
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground",
                      )}
                    >
                      {phase.completed ? (
                        <L.Check className="size-4" />
                      ) : (
                        number
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-foreground">
                        {phase.title}
                      </span>
                      {summary ? (
                        <span className="block text-xs text-muted-foreground">
                          {summary}
                        </span>
                      ) : null}
                    </span>
                    <span className="flex shrink-0 items-center gap-2.5">
                      <span
                        aria-hidden
                        className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-muted sm:block"
                      >
                        <span
                          style={{ width: `${phaseProgress}%` }}
                          className={cn(
                            "block h-full rounded-full",
                            phase.completed ? "bg-success" : "bg-primary",
                          )}
                        />
                      </span>
                      <span className="text-xs font-semibold tabular-nums text-muted-foreground">
                        <span aria-hidden>
                          {phase.completedSteps}/{phase.stepsCount}
                        </span>
                        <span className="sr-only">
                          {t(`${KEY}.ofSteps`, {
                            completed: phase.completedSteps,
                            total: phase.stepsCount,
                          })}
                        </span>
                      </span>
                      <L.ChevronDown
                        aria-hidden
                        className={cn(
                          "size-4 text-muted-foreground transition-transform motion-reduce:transition-none",
                          isExpanded && "rotate-180",
                        )}
                      />
                    </span>
                  </button>
                </h3>

                {isExpanded ? (
                  <div className="border-t">
                    {phase.description ? (
                      <p className="max-w-3xl px-4 pt-3 text-sm leading-6 text-muted-foreground sm:pl-16">
                        {phase.description}
                      </p>
                    ) : null}

                    <ul className="p-2">
                      {steps.map((step) => {
                        const isComplete =
                          step.status === RoadmapStepProgressStatus.Completed;
                        const isStarted =
                          step.status === RoadmapStepProgressStatus.InProgress;
                        const isBusy = pending?.stepId === step.id;
                        const isNext = step.id === nextStepId;
                        const showsAction = isNext || isStarted;
                        const isActivity = !step.contentType;
                        const isDetailed =
                          isActivity || detailedSteps.has(step.id);
                        const contentHref = roadmapContentHref(
                          step.contentType,
                          step.contentSlug,
                        );
                        const hasMenuItems =
                          (!isComplete && !showsAction) ||
                          (!isActivity && Boolean(step.description));
                        const runAction = () =>
                          isStarted
                            ? onComplete(enrollmentId, step.id)
                            : onStart(enrollmentId, step.id);

                        return (
                          <li
                            key={step.id}
                            className={cn(
                              "flex flex-wrap items-center gap-x-3 gap-y-1.5 rounded-xl px-2.5 py-2.5",
                              isNext && "bg-muted",
                            )}
                          >
                            <span className="grid size-6 shrink-0 place-items-center">
                              {isBusy ? (
                                <L.Loader2
                                  aria-hidden
                                  className="size-5 animate-spin text-primary"
                                />
                              ) : isComplete ? (
                                <span className="grid size-5 place-items-center rounded-full bg-success text-success-foreground">
                                  <L.Check aria-hidden className="size-3.5" />
                                </span>
                              ) : isStarted || isNext ? (
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

                            <div className="min-w-0 flex-1 basis-0 space-y-0.5">
                              <p
                                className={cn(
                                  "text-sm font-semibold break-words",
                                  isComplete
                                    ? "text-muted-foreground"
                                    : "text-foreground",
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

                            {showsAction && !isComplete ? (
                              <div className="order-last basis-full pl-9 sm:order-none sm:basis-auto sm:pl-0">
                                <Button
                                  size="sm"
                                  type="button"
                                  variant="outline"
                                  disabled={isBusy}
                                  onClick={runAction}
                                  className="border-primary/40 text-primary"
                                  aria-label={t(
                                    isStarted
                                      ? `${KEY}.path.completeStep`
                                      : `${KEY}.path.startStep`,
                                    { title: step.title },
                                  )}
                                >
                                  {t(
                                    isStarted
                                      ? `${KEY}.markComplete`
                                      : `${KEY}.start`,
                                  )}
                                </Button>
                              </div>
                            ) : null}

                            <div className="flex items-center gap-1">
                              {contentHref ? (
                                <Button
                                  asChild
                                  size="icon"
                                  variant="ghost"
                                  className="size-9 text-primary"
                                >
                                  <Link
                                    target="_blank"
                                    href={contentHref}
                                    rel="noopener noreferrer"
                                    aria-label={t(`${KEY}.path.openStep`, {
                                      title: step.title,
                                    })}
                                  >
                                    <L.ArrowUpRight aria-hidden />
                                  </Link>
                                </Button>
                              ) : null}

                              {hasMenuItems ? (
                                <DM.DropdownMenu>
                                  <DM.DropdownMenuTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="size-9 text-muted-foreground"
                                      aria-label={t(`${KEY}.stepActions`, {
                                        title: step.title,
                                      })}
                                    >
                                      <L.MoreHorizontal aria-hidden />
                                    </Button>
                                  </DM.DropdownMenuTrigger>

                                  <DM.DropdownMenuContent align="end">
                                    {!isComplete && !showsAction ? (
                                      <DM.DropdownMenuItem
                                        disabled={isBusy}
                                        onSelect={runAction}
                                      >
                                        <L.Play className="size-4" />
                                        {t(`${KEY}.start`)}
                                      </DM.DropdownMenuItem>
                                    ) : null}

                                    {step.description && !isActivity ? (
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
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
};
