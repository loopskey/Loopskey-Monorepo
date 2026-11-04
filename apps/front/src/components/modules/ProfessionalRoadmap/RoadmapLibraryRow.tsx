"use client";

import { clampPercent, roadmapState } from "@/utils/roadmap-library.util";
import { translateWithFallback } from "@/utils/function-helper";
import { buildRoadmapTabHref } from "@/utils/roadmap-navigation.util";
import { RoadmapActionsMenu } from "@modules/ProfessionalRoadmap/RoadmapActionsMenu";
import { humanizeEnumValue } from "@/utils/function-helper";
import { nextStepTitle } from "@/utils/roadmap-library.util";
import { RoadmapSource } from "@/lib/graphql/base";
import { RoadmapTile } from "@elements/roadmap-tile";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import type { TRoadmapLibraryRowProps } from "@/types/professional-roadmap-chat.types";

import Link from "next/link";

const KEY = "professionalDashboard.roadmap";

export const LIBRARY_ROW_GRID_CLASS_NAME =
  "md:grid md:grid-cols-[minmax(0,1fr)_10rem_minmax(0,14rem)_10rem] md:items-center md:gap-5";

export const RoadmapLibraryRow = ({
  onEdit,
  roadmap,
  isActive,
  onUnenroll,
  unenrollingId,
  editingRoadmapId,
}: TRoadmapLibraryRowProps) => {
  const { t } = useI18n();

  const state = roadmapState(roadmap);
  const progress = clampPercent(roadmap.progress);
  const isCompleted = state === "completed";
  const nextTitle = nextStepTitle(roadmap);
  const href = buildRoadmapTabHref(roadmap.id);

  const meta = [
    t(
      roadmap.source === RoadmapSource.Generated
        ? `${KEY}.card.aiGenerated`
        : `${KEY}.card.catalog`,
    ),
    translateWithFallback(
      t,
      `content.enums.courseLevel.${roadmap.level}`,
      humanizeEnumValue(roadmap.level),
    ),
    roadmap.estimatedWeeks
      ? t(`${KEY}.weeks`, { count: roadmap.estimatedWeeks })
      : null,
  ].filter(Boolean);

  const action =
    state === "completed"
      ? { label: `${KEY}.actions.review`, aria: `${KEY}.actions.reviewLabel` }
      : state === "notStarted"
        ? { label: `${KEY}.actions.start`, aria: `${KEY}.actions.startLabel` }
        : {
            label: `${KEY}.actions.continue`,
            aria: `${KEY}.actions.continueLabel`,
          };

  return (
    <li
      className={cn(
        "flex flex-col gap-3 border-t px-4 py-3.5 first:border-t-0",
        LIBRARY_ROW_GRID_CLASS_NAME,
        isActive && "bg-muted/50",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <RoadmapTile category={roadmap.category} />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <Link
              href={href}
              className="rounded-sm font-semibold text-foreground underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              {roadmap.title}
            </Link>
            {isActive ? (
              <span className="rounded-full bg-accent px-2 py-px text-[11px] font-semibold text-primary">
                {t(`${KEY}.library.current`)}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">{meta.join(" · ")}</p>
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs font-semibold tabular-nums">
          <span className={cn(isCompleted && "text-success-soft-foreground")}>
            {isCompleted
              ? t(`${KEY}.completed`)
              : state === "notStarted"
                ? t(`${KEY}.notStarted`)
                : `${progress}%`}
          </span>
          {isCompleted ? null : (
            <span className="ml-1.5 font-normal text-muted-foreground">
              {t(`${KEY}.ofSteps`, {
                completed: roadmap.completedSteps,
                total: roadmap.totalSteps,
              })}
            </span>
          )}
        </p>
        <span
          aria-hidden
          className="block h-1.5 overflow-hidden rounded-full bg-muted"
        >
          <span
            style={{ width: `${progress}%` }}
            className={cn(
              "block h-full rounded-full",
              isCompleted ? "bg-success" : "bg-primary",
            )}
          />
        </span>
      </div>

      <p className="min-w-0 text-sm text-muted-foreground md:truncate">
        <span className="font-medium text-foreground md:sr-only">
          {t(`${KEY}.library.columns.nextStep`)}:{" "}
        </span>
        {nextTitle ?? t(`${KEY}.library.allDone`)}
      </p>

      <div className="flex items-center gap-1 md:justify-end">
        <Button
          asChild
          size="sm"
          variant={isCompleted ? "outline" : "default"}
          className="flex-1 md:flex-none"
        >
          <Link
            href={href}
            aria-label={t(action.aria, { title: roadmap.title })}
          >
            {t(action.label)}
          </Link>
        </Button>
        <RoadmapActionsMenu
          onEdit={onEdit}
          roadmap={roadmap}
          onUnenroll={onUnenroll}
          unenrollingId={unenrollingId}
          editingRoadmapId={editingRoadmapId}
        />
      </div>
    </li>
  );
};
