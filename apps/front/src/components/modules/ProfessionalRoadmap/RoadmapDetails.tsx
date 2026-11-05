"use client";

import { RoadmapRecommendationsCard } from "@modules/ProfessionalRoadmap/RoadmapRecommendationsCard";
import { findNextActionableStep } from "@/utils/roadmap-journey.util";
import { buildRoadmapEditHref } from "@/utils/roadmap-navigation.util";
import { RoadmapProgressCard } from "@modules/ProfessionalRoadmap/RoadmapProgressCard";
import { RoadmapFocusCard } from "@modules/ProfessionalRoadmap/RoadmapFocusCard";
import { RoadmapPhaseList } from "@modules/ProfessionalRoadmap/RoadmapPhaseList";
import { RoadmapMatchTier } from "@/lib/graphql/base";
import { canEditRoadmap } from "@/utils/roadmap-library.util";
import { useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import type { TRoadmapDetailsProps } from "@/types/professional-roadmap-chat.types";

import Link from "next/link";

import * as L from "lucide-react";

const KEY = "professionalDashboard.roadmap";

const DESCRIPTION_CLAMP_MIN_LENGTH = 110;

export const RoadmapDetails = ({
  onEdit,
  roadmap,
  pending,
  onStart,
  onComplete,
  failedStepId,
  recommendations,
  editingRoadmapId,
}: TRoadmapDetailsProps) => {
  const { t } = useI18n();
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const canEdit = canEditRoadmap(roadmap);
  const isStartingEdit = editingRoadmapId === roadmap.roadmapId;
  const isCloseMatch =
    Boolean(roadmap.matchTier) && roadmap.matchTier !== RoadmapMatchTier.Exact;
  const isClampable =
    roadmap.description.length > DESCRIPTION_CLAMP_MIN_LENGTH ||
    Boolean(roadmap.coverageNote);
  const nextStepId = findNextActionableStep(roadmap.phases)?.stepId;

  return (
    <div className="space-y-4">
      {roadmap.description || canEdit ? (
        <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
          <div className="min-w-0 flex-[1_1_20rem] text-sm leading-6 text-muted-foreground">
            {roadmap.description ? (
              <p className={cn(isClampable && !isAboutOpen && "line-clamp-1")}>
                {roadmap.description}
              </p>
            ) : null}
            {isAboutOpen && roadmap.coverageNote ? (
              <p className="mt-1.5 text-xs">{roadmap.coverageNote}</p>
            ) : null}
            {isClampable ? (
              <button
                type="button"
                aria-expanded={isAboutOpen}
                onClick={() => setIsAboutOpen((current) => !current)}
                className="rounded-sm font-semibold text-primary underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring"
              >
                {t(isAboutOpen ? `${KEY}.showLess` : `${KEY}.showMore`)}
              </button>
            ) : null}
          </div>
          {canEdit ? (
            <Button
              size="sm"
              type="button"
              variant="outline"
              className="bg-background"
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
        </div>
      ) : null}

      {isCloseMatch ? (
        <div className="flex items-start gap-3 rounded-xl bg-warning-soft p-3 text-sm">
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
                href={buildRoadmapEditHref(roadmap.draftId)}
                className="inline-block font-medium text-primary underline-offset-4 hover:underline"
              >
                {t(`${KEY}.closeMatchDisclosure.action`)}
              </Link>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-5">
          <RoadmapFocusCard
            roadmap={roadmap}
            onStart={onStart}
            pending={pending}
            onComplete={onComplete}
            failedStepId={failedStepId}
          />
          <RoadmapPhaseList
            pending={pending}
            onStart={onStart}
            onComplete={onComplete}
            nextStepId={nextStepId}
            phases={roadmap.phases}
            enrollmentId={roadmap.id}
            failedStepId={failedStepId}
          />
        </div>

        <aside
          aria-label={t(`${KEY}.aside`)}
          className="grid gap-4 sm:grid-cols-2 lg:w-80 lg:shrink-0 lg:grid-cols-1"
        >
          <RoadmapProgressCard roadmap={roadmap} />
          <RoadmapRecommendationsCard recommendations={recommendations} />
        </aside>
      </div>
    </div>
  );
};
