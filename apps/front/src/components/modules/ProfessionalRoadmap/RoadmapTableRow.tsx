"use client";

import { clampPercent, roadmapState } from "@/utils/roadmap-library.util";
import { translateWithFallback } from "@/utils/function-helper";
import { RoadmapActionsMenu } from "@modules/ProfessionalRoadmap/RoadmapActionsMenu";
import { humanizeEnumValue } from "@/utils/function-helper";
import { nextStepTitle } from "@/utils/roadmap-library.util";
import { RoadmapSource } from "@/lib/graphql/base";
import { RoadmapTile } from "@elements/roadmap-tile";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import type { TRoadmapTableRowProps } from "@/types/professional-roadmap-chat.types";

import * as L from "lucide-react";

const KEY = "professionalDashboard.roadmap";

export const TABLE_ROW_GRID_CLASS_NAME =
  "md:grid md:grid-cols-[minmax(0,1fr)_10rem_minmax(0,13rem)_11.5rem] md:items-center md:gap-5";

const ACTION_KEYS = {
  completed: { label: "actions.review", aria: "actions.reviewLabel" },
  notStarted: { label: "actions.start", aria: "actions.startLabel" },
  inProgress: { label: "actions.continue", aria: "actions.continueLabel" },
} as const;

export const RoadmapTableRow = ({
  onEdit,
  isOpen,
  details,
  roadmap,
  onToggle,
  onContinue,
  onUnenroll,
  unenrollingId,
  editingRoadmapId,
}: TRoadmapTableRowProps) => {
  const { t } = useI18n();

  const state = roadmapState(roadmap);
  const progress = clampPercent(roadmap.progress);
  const isCompleted = state === "completed";
  const nextTitle = nextStepTitle(roadmap);
  const detailsId = `roadmap-details-${roadmap.id}`;
  const action = ACTION_KEYS[state];

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

  return (
    <li
      className={cn(
        "border-t first:border-t-0",
        isOpen && "border-y-primary/25 bg-muted/40",
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-3 px-4 py-3.5 md:py-3",
          TABLE_ROW_GRID_CLASS_NAME,
        )}
      >
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls={isOpen ? detailsId : undefined}
            onClick={() => onToggle(roadmap.id)}
            className="group flex min-w-0 flex-1 items-center gap-3 rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span
              aria-hidden
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-lg transition-colors",
                isOpen
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-primary group-hover:bg-accent",
              )}
            >
              <L.ChevronRight
                className={cn(
                  "size-4 transition-transform motion-reduce:transition-none",
                  isOpen && "rotate-90",
                )}
              />
            </span>
            <RoadmapTile category={roadmap.category} />
            <span className="min-w-0">
              <span className="block font-semibold text-foreground group-hover:text-primary">
                {roadmap.title}
              </span>
              <span className="block text-xs text-muted-foreground">
                {meta.join(" · ")}
              </span>
              <span className="sr-only">
                {t(isOpen ? `${KEY}.table.hide` : `${KEY}.table.show`)}
              </span>
            </span>
          </button>
        </div>

        <div className="space-y-1.5 md:pl-0">
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
            size="sm"
            type="button"
            onClick={() => onContinue(roadmap.id)}
            variant={isCompleted ? "outline" : "default"}
            className={cn(
              "flex-1 md:flex-none",
              isCompleted && "bg-background",
            )}
            aria-label={t(`${KEY}.${action.aria}`, { title: roadmap.title })}
          >
            {isCompleted ? (
              <L.ListChecks aria-hidden />
            ) : (
              <L.Play aria-hidden />
            )}
            {t(`${KEY}.${action.label}`)}
          </Button>
          <RoadmapActionsMenu
            onEdit={onEdit}
            roadmap={roadmap}
            onUnenroll={onUnenroll}
            unenrollingId={unenrollingId}
            editingRoadmapId={editingRoadmapId}
          />
        </div>
      </div>

      {isOpen && details ? (
        <section
          id={detailsId}
          aria-label={t(`${KEY}.table.details`, { title: roadmap.title })}
          className="border-t border-border/70 px-4 pb-5 pt-4 md:pl-[3.75rem] md:pr-5"
        >
          {details}
        </section>
      ) : null}
    </li>
  );
};
