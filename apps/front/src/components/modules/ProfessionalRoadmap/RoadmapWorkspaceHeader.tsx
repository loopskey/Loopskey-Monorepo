"use client";

import { buildRoadmapLibraryHref } from "@/utils/roadmap-navigation.util";
import { translateWithFallback } from "@/utils/function-helper";
import { buildRoadmapEditHref } from "@/utils/roadmap-navigation.util";
import { RoadmapActionsMenu } from "@modules/ProfessionalRoadmap/RoadmapActionsMenu";
import { humanizeEnumValue } from "@/utils/function-helper";
import { RoadmapMatchTier } from "@/lib/graphql/base";
import { RoadmapSwitcher } from "@modules/ProfessionalRoadmap/RoadmapSwitcher";
import { canEditRoadmap } from "@/utils/roadmap-library.util";
import { RoadmapSource } from "@/lib/graphql/base";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import type { TRoadmapWorkspaceHeaderProps } from "@/types/professional-roadmap-chat.types";

import Link from "next/link";

import * as L from "lucide-react";

const KEY = "professionalDashboard.roadmap";

const DESCRIPTION_CLAMP_MIN_LENGTH = 110;

const CHIP_CLASS_NAME =
  "inline-flex h-7 items-center gap-1.5 rounded-full bg-muted px-2.5 text-xs font-medium text-foreground";

export const RoadmapWorkspaceHeader = ({
  onEdit,
  roadmap,
  roadmaps,
  totalCount,
  onUnenroll,
  headingRef,
  unenrollingId,
  generatingGoal,
  editingRoadmapId,
}: TRoadmapWorkspaceHeaderProps) => {
  const { t } = useI18n();
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const isGenerated = roadmap.source === RoadmapSource.Generated;
  const isCloseMatch =
    Boolean(roadmap.matchTier) && roadmap.matchTier !== RoadmapMatchTier.Exact;
  const canEdit = canEditRoadmap(roadmap);
  const isStartingEdit = editingRoadmapId === roadmap.roadmapId;
  const isClampable =
    roadmap.description.length > DESCRIPTION_CLAMP_MIN_LENGTH ||
    Boolean(roadmap.coverageNote);

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

  return (
    <header className="space-y-3">
      <div className="flex flex-wrap items-start gap-x-4 gap-y-3">
        <div className="min-w-0 flex-[1_1_26rem]">
          <RoadmapSwitcher
            roadmap={roadmap}
            roadmaps={roadmaps}
            totalCount={totalCount}
            headingRef={headingRef}
            generatingGoal={generatingGoal}
          />
        </div>

        <div className="flex items-center gap-2 sm:ml-auto sm:pt-3">
          <Button asChild variant="outline" className="hidden md:inline-flex">
            <Link href={buildRoadmapLibraryHref(roadmap.id)}>
              <L.LayoutGrid aria-hidden />
              {t(`${KEY}.header.allRoadmaps`)}
            </Link>
          </Button>
          {canEdit ? (
            <Button
              type="button"
              variant="outline"
              disabled={Boolean(editingRoadmapId)}
              onClick={() => onEdit(roadmap.roadmapId)}
            >
              {isStartingEdit ? (
                <L.Loader2 aria-hidden className="animate-spin" />
              ) : (
                <L.Pencil aria-hidden />
              )}
              {t(`${KEY}.header.editRoadmap`)}
            </Button>
          ) : null}
          <RoadmapActionsMenu
            roadmap={roadmap}
            onUnenroll={onUnenroll}
            unenrollingId={unenrollingId}
            className="border border-border text-foreground"
          />
        </div>
      </div>

      <ul className="flex flex-wrap items-center gap-2">
        <li
          className={cn(
            CHIP_CLASS_NAME,
            isGenerated && "bg-accent font-semibold text-primary",
          )}
        >
          {isGenerated ? (
            <L.Sparkles aria-hidden className="size-3.5" />
          ) : (
            <L.BookOpen aria-hidden className="size-3.5" />
          )}
          {t(isGenerated ? `${KEY}.card.aiGenerated` : `${KEY}.card.catalog`)}
        </li>
        {categoryLabel ? (
          <li className={CHIP_CLASS_NAME}>{categoryLabel}</li>
        ) : null}
        <li className={CHIP_CLASS_NAME}>{levelLabel}</li>
        <li className={cn(CHIP_CLASS_NAME, "tabular-nums")}>
          {t(`${KEY}.header.phasesSteps`, {
            phases: roadmap.phasesCount,
            steps: roadmap.totalSteps,
          })}
        </li>
        {roadmap.estimatedWeeks ? (
          <li className={cn(CHIP_CLASS_NAME, "tabular-nums")}>
            {t(`${KEY}.weeks`, { count: roadmap.estimatedWeeks })}
          </li>
        ) : null}
      </ul>

      {roadmap.description || roadmap.coverageNote ? (
        <div className="max-w-3xl text-sm leading-6 text-muted-foreground">
          {roadmap.description ? (
            <p className={cn(isClampable && !isAboutOpen && "line-clamp-1")}>
              {roadmap.description}
            </p>
          ) : null}
          {isAboutOpen && roadmap.coverageNote ? (
            <p className="mt-2 text-xs">{roadmap.coverageNote}</p>
          ) : null}
          {isClampable ? (
            <button
              type="button"
              aria-expanded={isAboutOpen}
              onClick={() => setIsAboutOpen((current) => !current)}
              className="mt-0.5 rounded-sm font-semibold text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
            >
              {t(isAboutOpen ? `${KEY}.showLess` : `${KEY}.showMore`)}
            </button>
          ) : null}
        </div>
      ) : null}

      {isCloseMatch ? (
        <div className="flex max-w-3xl items-start gap-3 rounded-xl bg-warning-soft p-3 text-sm">
          <L.AlertTriangle
            aria-hidden
            className="mt-0.5 size-4 shrink-0 text-warning-soft-foreground"
          />
          <div className="min-w-0 space-y-1">
            <p className="font-medium">
              {t(`${KEY}.closeMatchDisclosure.title`)}
            </p>
            <p className="leading-6 text-muted-foreground">
              {t(`${KEY}.closeMatchDisclosure.description`)}
            </p>
            {roadmap.draftId ? (
              <Link
                className="inline-block font-medium text-primary underline-offset-4 hover:underline"
                href={buildRoadmapEditHref(roadmap.draftId)}
              >
                {t(`${KEY}.closeMatchDisclosure.action`)}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}
    </header>
  );
};
