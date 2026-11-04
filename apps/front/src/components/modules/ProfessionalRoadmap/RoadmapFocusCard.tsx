"use client";

import { ROADMAP_NEXT_STEP_ELEMENT_ID } from "@/utils/roadmap-navigation.util";
import { RoadmapStepProgressStatus } from "@/lib/graphql/base";
import { findNextActionableStep } from "@/utils/roadmap-journey.util";
import { formatDurationMinutes } from "@/utils/content-source.helper";
import { translateWithFallback } from "@/utils/function-helper";
import { ROADMAP_CATALOG_HREF } from "@/utils/roadmap-navigation.util";
import { roadmapContentHref } from "@/utils/roadmap-navigation.util";
import { humanizeEnumValue } from "@/utils/function-helper";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

import type { TRoadmapFocusCardProps } from "@/types/professional-roadmap-chat.types";

import Link from "next/link";

import * as L from "lucide-react";

const KEY = "professionalDashboard.roadmap";

export const RoadmapFocusCard = ({
  roadmap,
  pending,
  onStart,
  onComplete,
  failedStepId,
}: TRoadmapFocusCardProps) => {
  const { t, language } = useI18n();

  const next = findNextActionableStep(roadmap.phases);
  const phaseIndex = roadmap.phases.findIndex(
    (phase) => phase.id === next?.phaseId,
  );
  const phase = roadmap.phases[phaseIndex];
  const stepIndex =
    phase?.steps.findIndex((candidate) => candidate.id === next?.stepId) ?? -1;
  const step = phase?.steps[stepIndex];

  if (!phase || !step)
    return (
      <section
        id={ROADMAP_NEXT_STEP_ELEMENT_ID}
        aria-labelledby="roadmap-focus-title"
        className="flex scroll-mt-24 flex-col gap-4 rounded-2xl border border-success/25 bg-success-soft p-5 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-success-soft-foreground">
            {t(`${KEY}.focus.completedTitle`)}
          </p>
          <h2
            id="roadmap-focus-title"
            className="text-lg font-semibold text-foreground"
          >
            {t(`${KEY}.focus.completedDescription`, {
              count: roadmap.totalSteps,
            })}
          </h2>
          {roadmap.completedAt ? (
            <p className="text-xs text-muted-foreground">
              {t(`${KEY}.card.completedOn`, {
                date: new Intl.DateTimeFormat(language, {
                  dateStyle: "medium",
                }).format(new Date(roadmap.completedAt)),
              })}
            </p>
          ) : null}
        </div>

        <Button asChild variant="outline" className="bg-background">
          <Link href={ROADMAP_CATALOG_HREF}>{t(`${KEY}.focus.findNext`)}</Link>
        </Button>
      </section>
    );

  const isStarted = step.status === RoadmapStepProgressStatus.InProgress;
  const isBusy = pending?.stepId === step.id;
  const contentHref = roadmapContentHref(step.contentType, step.contentSlug);
  const duration = formatDurationMinutes(step.estimatedMinutes);
  const meta = [
    step.contentType
      ? translateWithFallback(
          t,
          `common.contentTypes.${step.contentType}`,
          humanizeEnumValue(step.contentType),
        )
      : null,
    duration,
    typeof step.credits === "number"
      ? t(`${KEY}.pduValue`, { count: step.credits })
      : null,
    phase.title,
  ].filter(Boolean);

  return (
    <section
      id={ROADMAP_NEXT_STEP_ELEMENT_ID}
      aria-labelledby="roadmap-focus-title"
      className="flex scroll-mt-24 flex-col gap-4 rounded-2xl bg-primary p-5 text-primary-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6"
    >
      <div className="min-w-0 space-y-1.5">
        <p className="text-xs font-bold uppercase tracking-wider text-primary-foreground/80">
          {t(
            roadmap.completedSteps === 0 && !isStarted
              ? `${KEY}.focus.startHere`
              : `${KEY}.focus.upNext`,
          )}
          {" · "}
          {t(`${KEY}.focus.eyebrow`, {
            phase: phaseIndex + 1,
            step: stepIndex + 1,
            total: phase.steps.length,
          })}
        </p>

        <h2
          id="roadmap-focus-title"
          className="text-lg font-semibold leading-snug break-words sm:text-xl"
        >
          {step.title}
        </h2>

        <p className="text-sm text-primary-foreground/85">{meta.join(" · ")}</p>

        {failedStepId === step.id ? (
          <p
            role="alert"
            className="inline-block rounded-md bg-background px-2 py-1 text-xs font-medium text-destructive"
          >
            {t(`${KEY}.stepFailed`)}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
        {contentHref ? (
          <Button
            asChild
            size="lg"
            variant="ghost"
            className="border border-primary-foreground/45 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Link href={contentHref} target="_blank" rel="noopener noreferrer">
              {t(`${KEY}.viewContent`)}
              <L.ArrowUpRight aria-hidden />
            </Link>
          </Button>
        ) : null}

        <Button
          size="lg"
          type="button"
          disabled={isBusy}
          className="bg-background text-primary shadow-none hover:bg-background/90"
          onClick={() =>
            isStarted
              ? onComplete(roadmap.id, step.id)
              : onStart(roadmap.id, step.id)
          }
        >
          {isBusy ? (
            <L.Loader2 aria-hidden className="animate-spin" />
          ) : isStarted ? (
            <L.CheckCircle2 aria-hidden />
          ) : (
            <L.Play aria-hidden />
          )}
          {t(isStarted ? `${KEY}.markComplete` : `${KEY}.focus.startStep`)}
        </Button>
      </div>
    </section>
  );
};
