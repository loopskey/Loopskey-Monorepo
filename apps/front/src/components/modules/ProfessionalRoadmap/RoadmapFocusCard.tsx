"use client";

import { ROADMAP_NEXT_STEP_ELEMENT_ID } from "@/utils/roadmap-navigation.util";
import { RoadmapStepProgressStatus } from "@/lib/graphql/base";
import { findNextActionableStep } from "@/utils/roadmap-journey.util";
import { roadmapContentHref } from "@/utils/roadmap-navigation.util";
import { RoadmapStepMeta } from "@modules/ProfessionalRoadmap/RoadmapStepMeta";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import type { TRoadmapFocusCardProps } from "@/types/professional-roadmap-chat.types";

import Link from "next/link";

import * as L from "lucide-react";

const KEY = "professionalDashboard.roadmap";

const EYEBROW_CLASS_NAME = "text-xs font-semibold uppercase tracking-wider";

export const RoadmapFocusCard = ({
  roadmap,
  pending,
  onStart,
  focusRef,
  onExplore,
  onComplete,
  failedStepId,
}: TRoadmapFocusCardProps) => {
  const { t, language } = useI18n();

  const next = findNextActionableStep(roadmap.phases);
  const phaseIndex = roadmap.phases.findIndex(
    (phase) => phase.id === next?.phaseId,
  );
  const phase = roadmap.phases[phaseIndex];
  const step = phase?.steps.find((candidate) => candidate.id === next?.stepId);

  if (!phase || !step)
    return (
      <section
        tabIndex={-1}
        ref={focusRef}
        id={ROADMAP_NEXT_STEP_ELEMENT_ID}
        className="flex flex-col gap-4 rounded-xl border border-success/20 bg-success-soft p-5 outline-none scroll-mt-24 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0 space-y-1">
          <p className={cn(EYEBROW_CLASS_NAME, "text-success-soft-foreground")}>
            {t(`${KEY}.focus.completedTitle`)}
          </p>
          <h3 className="text-lg font-medium">
            {t(`${KEY}.focus.completedDescription`, {
              count: roadmap.totalSteps,
            })}
          </h3>
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

        <Button type="button" variant="outline" onClick={onExplore}>
          {t(`${KEY}.focus.findNext`)}
        </Button>
      </section>
    );

  const isStarted = step.status === RoadmapStepProgressStatus.InProgress;
  const isBusy = pending?.stepId === step.id;
  const contentHref = roadmapContentHref(step.contentType, step.contentSlug);

  return (
    <section
      tabIndex={-1}
      ref={focusRef}
      id={ROADMAP_NEXT_STEP_ELEMENT_ID}
      className="flex flex-col gap-4 rounded-xl border border-primary/15 bg-primary/5 p-5 outline-none scroll-mt-24 focus-visible:ring-2 focus-visible:ring-ring sm:flex-row sm:items-center sm:justify-between"
    >
      <div className="min-w-0 space-y-1.5">
        <p className={cn(EYEBROW_CLASS_NAME, "text-primary")}>
          {t(
            roadmap.completedSteps === 0 && !isStarted
              ? `${KEY}.focus.startHere`
              : `${KEY}.focus.upNext`,
          )}
          {" · "}
          {t(`${KEY}.card.phaseOf`, {
            current: phaseIndex + 1,
            total: roadmap.phases.length,
          })}
        </p>

        <h3 className="text-lg font-medium leading-snug break-words">
          {step.title}
        </h3>

        <RoadmapStepMeta
          credits={step.credits}
          contentType={step.contentType}
          estimatedMinutes={step.estimatedMinutes}
        >
          <span className="min-w-0 truncate">{phase.title}</span>
        </RoadmapStepMeta>

        {failedStepId === step.id ? (
          <p role="alert" className="text-xs font-medium text-destructive">
            {t(`${KEY}.stepFailed`)}
          </p>
        ) : null}
      </div>

      <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
        {contentHref ? (
          <Button asChild variant="outline">
            <Link href={contentHref} target="_blank" rel="noopener noreferrer">
              {t(`${KEY}.viewContent`)}
              <L.ArrowUpRight aria-hidden className="size-4" />
            </Link>
          </Button>
        ) : null}

        <Button
          type="button"
          disabled={isBusy}
          onClick={() =>
            isStarted
              ? onComplete(roadmap.id, step.id)
              : onStart(roadmap.id, step.id)
          }
        >
          {isBusy ? (
            <L.Loader2 aria-hidden className="size-4 animate-spin" />
          ) : null}
          {t(isStarted ? `${KEY}.markComplete` : `${KEY}.start`)}
        </Button>
      </div>
    </section>
  );
};
