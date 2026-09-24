"use client";

import { RoadmapStepProgressStatus } from "@/lib/graphql/base";
import { TRoadmapPhaseProps } from "@/types/professional-roadmap-chat.types";
import { GlassCard } from "@elements/glass-card";
import { useState } from "react";
import { Progress } from "@ui/progress";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as L from "lucide-react";

const KEY = "professionalDashboard.roadmap";

const statusLabel = (
  status: RoadmapStepProgressStatus | null | undefined,
  t: TRoadmapPhaseProps["t"],
) => {
  if (status === RoadmapStepProgressStatus.Completed)
    return t(`${KEY}.completed`);
  if (status === RoadmapStepProgressStatus.InProgress)
    return t(`${KEY}.inProgress`);
  return t(`${KEY}.notStarted`);
};

type TWeekRange = { start: number; end: number };

const weekRanges = (
  phases: TRoadmapPhaseProps["phases"],
): Map<string, TWeekRange> => {
  const ranges = new Map<string, TWeekRange>();
  let cursor = 1;
  for (const phase of phases) {
    const length = Math.max(phase.estimatedWeeks ?? 0, 0);
    const start = cursor;
    const end = length > 0 ? cursor + length - 1 : cursor;
    ranges.set(phase.id, { start, end });
    cursor = length > 0 ? cursor + length : cursor;
  }
  return ranges;
};

export const RoadmapPhaseList = ({
  t,
  phases,
  pending,
  onStart,
  onComplete,
  enrollmentId,
  failedStepId,
}: TRoadmapPhaseProps) => {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(
    new Set(),
  );
  const [reviewedSteps, setReviewedSteps] = useState<Set<string>>(new Set());
  const ranges = weekRanges(phases);

  const togglePhase = (phaseId: string) => {
    setExpandedPhases((current) => {
      const next = new Set(current);
      if (next.has(phaseId)) next.delete(phaseId);
      else next.add(phaseId);
      return next;
    });
  };

  const toggleStepReview = (stepId: string) => {
    setReviewedSteps((current) => {
      const next = new Set(current);
      if (next.has(stepId)) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
  };

  return (
    <GlassCard>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-medium">{t(`${KEY}.phasedContent`)}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(`${KEY}.phasedContentDescription`)}
          </p>
        </div>
        <L.ListChecks className="h-5 w-5 text-primary" aria-hidden="true" />
      </div>

      <ol className="space-y-5">
        {phases.map((phase, index) => {
          const isExpanded = expandedPhases.has(phase.id);
          const range = ranges.get(phase.id);
          return (
            <li key={phase.id} className="rounded-lg border p-4">
              <button
                type="button"
                onClick={() => togglePhase(phase.id)}
                aria-expanded={isExpanded}
                className="flex w-full items-start gap-4 text-left"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-medium text-primary">
                  {index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="font-medium">{phase.title}</h3>
                    <Badge variant={phase.completed ? "default" : "secondary"}>
                      {phase.completedSteps}/{phase.stepsCount}
                    </Badge>
                  </div>

                  {range ? (
                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      {t(`${KEY}.weekRange`, {
                        start: range.start,
                        end: range.end,
                      })}
                    </p>
                  ) : null}

                  {phase.description ? (
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {phase.description}
                    </p>
                  ) : null}

                  <div className="mt-4">
                    <Progress value={phase.progress} aria-label={phase.title} />
                  </div>
                </div>

                <L.ChevronDown
                  className={`mt-2 h-5 w-5 shrink-0 text-muted-foreground transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {isExpanded ? (
                <ul className="mt-4 space-y-3 border-t pt-4">
                  {phase.steps.map((step) => {
                    const isComplete =
                      step.status === RoadmapStepProgressStatus.Completed;
                    const busy = pending?.stepId === step.id;
                    const isReviewed = reviewedSteps.has(step.id);
                    return (
                      <li key={step.id} className="rounded-md border p-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-medium">
                                {step.title}
                              </p>
                              {/* Status as text, never colour alone. */}
                              <Badge
                                variant={isComplete ? "default" : "secondary"}
                              >
                                {statusLabel(step.status, t)}
                              </Badge>
                              {step.isCloseMatch ? (
                                <Badge variant="outline">
                                  {t(`${KEY}.closeMatchTag`)}
                                </Badge>
                              ) : null}
                            </div>

                            <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                              {step.contentType ? (
                                <span>{step.contentType}</span>
                              ) : null}
                              {step.estimatedMinutes ? (
                                <span>
                                  {t(`${KEY}.minutes`, {
                                    count: step.estimatedMinutes,
                                  })}
                                </span>
                              ) : null}
                              {typeof step.credits === "number" ? (
                                <span>
                                  {t(`${KEY}.pduValue`, {
                                    count: step.credits,
                                  })}
                                </span>
                              ) : null}
                            </div>

                            {isReviewed && step.description ? (
                              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                {step.description}
                              </p>
                            ) : null}

                            {failedStepId === step.id ? (
                              <p
                                role="alert"
                                className="mt-2 text-xs font-medium text-destructive"
                              >
                                {t(`${KEY}.stepFailed`)}
                              </p>
                            ) : null}
                          </div>

                          <div className="flex shrink-0 gap-2">
                            <Button
                              size="sm"
                              radius="xl"
                              variant="outline"
                              aria-pressed={isReviewed}
                              onClick={() => toggleStepReview(step.id)}
                            >
                              {t(`${KEY}.review`)}
                            </Button>

                            {!isComplete ? (
                              <>
                                {step.status === null ||
                                step.status === undefined ? (
                                  <Button
                                    size="sm"
                                    radius="xl"
                                    disabled={busy}
                                    onClick={() =>
                                      onStart(enrollmentId, step.id)
                                    }
                                  >
                                    {t(`${KEY}.start`)}
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    radius="xl"
                                    disabled={busy}
                                    onClick={() =>
                                      onComplete(enrollmentId, step.id)
                                    }
                                  >
                                    {busy ? (
                                      <L.Loader2
                                        className="h-4 w-4 animate-spin"
                                        aria-hidden="true"
                                      />
                                    ) : null}
                                    {t(`${KEY}.markComplete`)}
                                  </Button>
                                )}
                              </>
                            ) : (
                              <L.CheckCircle2
                                className="h-5 w-5 text-primary"
                                aria-hidden="true"
                              />
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ol>
    </GlassCard>
  );
};
