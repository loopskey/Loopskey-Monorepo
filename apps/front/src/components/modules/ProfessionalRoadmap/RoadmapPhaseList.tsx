"use client";

import { RoadmapStepProgressStatus } from "@/lib/graphql/base";
import { TRoadmapPhaseProps } from "@/types/professional-roadmap-chat.types";
import { GlassCard } from "@elements/glass-card";
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

export const RoadmapPhaseList = ({
  t,
  phases,
  pending,
  onStart,
  onComplete,
  enrollmentId,
  failedStepId,
}: TRoadmapPhaseProps) => (
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
      {phases.map((phase, index) => (
        <li
          key={phase.id}
          className="rounded-3xl border border-glass-border bg-background/45 p-4 backdrop-blur-xl"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-medium text-primary">
              {index + 1}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-medium">{phase.title}</h3>
                <Badge variant={phase.completed ? "default" : "secondary"}>
                  {phase.completed
                    ? t(`${KEY}.completed`)
                    : t(`${KEY}.inProgress`)}
                </Badge>
              </div>

              {phase.description ? (
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {phase.description}
                </p>
              ) : null}

              <div className="mt-4">
                <div className="mb-2 flex justify-between text-xs font-medium text-muted-foreground">
                  <span>
                    {t(`${KEY}.ofSteps`, {
                      completed: phase.completedSteps,
                      total: phase.stepsCount,
                    })}
                  </span>
                  <span>{phase.progress}%</span>
                </div>
                <Progress value={phase.progress} aria-label={phase.title} />
              </div>

              <ul className="mt-4 space-y-3">
                {phase.steps.map((step) => {
                  const isComplete =
                    step.status === RoadmapStepProgressStatus.Completed;
                  const busy = pending?.stepId === step.id;
                  return (
                    <li
                      key={step.id}
                      className="rounded-2xl border border-glass-border bg-background/40 p-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium">{step.title}</p>
                            {/* Status as text, never colour alone. */}
                            <Badge
                              variant={isComplete ? "default" : "secondary"}
                            >
                              {statusLabel(step.status, t)}
                            </Badge>
                          </div>

                          {step.description ? (
                            <p className="mt-1 text-sm leading-6 text-muted-foreground">
                              {step.description}
                            </p>
                          ) : null}

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
                          </div>

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
                          {!isComplete ? (
                            <>
                              {step.status === null ||
                              step.status === undefined ? (
                                <Button
                                  size="sm"
                                  radius="xl"
                                  variant="glass"
                                  disabled={busy}
                                  onClick={() => onStart(enrollmentId, step.id)}
                                >
                                  {t(`${KEY}.start`)}
                                </Button>
                              ) : null}

                              <Button
                                size="sm"
                                radius="xl"
                                variant="brand"
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
            </div>
          </div>
        </li>
      ))}
    </ol>
  </GlassCard>
);
