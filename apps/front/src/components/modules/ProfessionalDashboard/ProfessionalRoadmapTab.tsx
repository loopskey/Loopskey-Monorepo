"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { RoadmapRecommendationsCard } from "@modules/ProfessionalRoadmap/RoadmapRecommendationsCard";
import { ROADMAP_CATALOG_ELEMENT_ID } from "@/utils/roadmap-navigation.util";
import { RoadmapGenerationStatus } from "@modules/ProfessionalRoadmap/RoadmapGenerationStatus";
import { useProfessionalRoadmaps } from "@/hooks/useProfessionalRoadmap";
import { RoadmapWorkspaceHeader } from "@modules/ProfessionalRoadmap/RoadmapWorkspaceHeader";
import { findNextActionableStep } from "@/utils/roadmap-journey.util";
import { RoadmapProgressStrip } from "@modules/ProfessionalRoadmap/RoadmapProgressStrip";
import { RoadmapCatalogCard } from "@modules/ProfessionalRoadmap/RoadmapAsideCards";
import { RoadmapDraftStatus } from "@/lib/graphql/base";
import { ROADMAP_CHAT_HREF } from "@/utils/roadmap-navigation.util";
import { RoadmapFocusCard } from "@modules/ProfessionalRoadmap/RoadmapFocusCard";
import { RoadmapPhaseList } from "@modules/ProfessionalRoadmap/RoadmapPhaseList";
import { RoadmapEditCard } from "@modules/ProfessionalRoadmap/RoadmapAsideCards";
import { RoadmapLibrary } from "@modules/ProfessionalRoadmap/RoadmapLibrary";
import { ViewTransition } from "react";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";

import Link from "next/link";

import * as L from "lucide-react";

const KEY = "professionalDashboard.roadmap";

const ProfessionalRoadmapTab = () => {
  const {
    t,
    draft,
    myRoadmaps,
    handleEdit,
    isGenerating,
    stepProgress,
    justCompleted,
    unenrollingId,
    activeRoadmap,
    isLibraryView,
    myRoadmapsData,
    hasFailedDraft,
    handleUnenroll,
    editingRoadmapId,
    recommendations,
    isMyRoadmapsError,
    refetchMyRoadmaps,
    isMyRoadmapsLoading,
    isRetryingGeneration,
    handleRetryGeneration,
    acknowledgeCompletion,
  } = useProfessionalRoadmaps();

  const isStatusVisible = isGenerating || hasFailedDraft;
  const [displayStatus, setDisplayStatus] = useState(isStatusVisible);
  useEffect(() => {
    if (displayStatus === isStatusVisible) return;
    startTransition(() => setDisplayStatus(isStatusVisible));
  }, [isStatusVisible, displayStatus]);

  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!justCompleted) return;
    headingRef.current?.focus();
    acknowledgeCompletion();
  }, [justCompleted, acknowledgeCompletion]);

  useEffect(() => {
    if (!isLibraryView) return;
    if (window.location.hash !== `#${ROADMAP_CATALOG_ELEMENT_ID}`) return;
    document
      .getElementById(ROADMAP_CATALOG_ELEMENT_ID)
      ?.scrollIntoView({ block: "start" });
  }, [isLibraryView]);

  const totalCount = myRoadmapsData?.totalCount ?? 0;
  const hasLoadFailed = isMyRoadmapsError && !myRoadmapsData;
  const generatingGoal =
    draft?.status === RoadmapDraftStatus.Generating ? draft.goal : null;
  const nextStepId = activeRoadmap
    ? findNextActionableStep(activeRoadmap.phases)?.stepId
    : null;

  const status = (
    <ViewTransition>
      {displayStatus && draft ? (
        <RoadmapGenerationStatus
          t={t}
          goal={draft.goal}
          draftId={draft.id}
          status={draft.status}
          failure={draft.failure}
          updatedAt={draft.updatedAt}
          onRetry={handleRetryGeneration}
          isRetrying={isRetryingGeneration}
          isEdit={Boolean(draft.replacesRoadmapId)}
        />
      ) : null}
    </ViewTransition>
  );

  if (isLibraryView)
    return (
      <div className="space-y-6">
        {status}
        <RoadmapLibrary
          onEdit={handleEdit}
          totalRoadmaps={totalCount}
          onUnenroll={handleUnenroll}
          unenrollingId={unenrollingId}
          activeRoadmapId={activeRoadmap?.id}
          editingRoadmapId={editingRoadmapId}
        />
      </div>
    );

  return (
    <div className="space-y-6">
      {status}

      {isMyRoadmapsLoading ? (
        <div aria-hidden className="space-y-5">
          <div className="flex items-center gap-3.5">
            <Skeleton className="size-12 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-32 rounded-full" />
              <Skeleton className="h-6 w-2/3 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      ) : hasLoadFailed ? (
        <GlassCard>
          <div className="flex min-h-48 flex-col items-center justify-center text-center">
            <p className="font-medium">{t(`${KEY}.loadError.title`)}</p>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
              {t(`${KEY}.loadError.description`)}
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => refetchMyRoadmaps()}
            >
              <L.RotateCcw aria-hidden />
              {t("professionalDashboard.common.refresh")}
            </Button>
          </div>
        </GlassCard>
      ) : activeRoadmap ? (
        <>
          <RoadmapWorkspaceHeader
            onEdit={handleEdit}
            key={activeRoadmap.id}
            roadmaps={myRoadmaps}
            roadmap={activeRoadmap}
            totalCount={totalCount}
            headingRef={headingRef}
            onUnenroll={handleUnenroll}
            unenrollingId={unenrollingId}
            generatingGoal={generatingGoal}
            editingRoadmapId={editingRoadmapId}
          />

          <RoadmapProgressStrip roadmap={activeRoadmap} />

          <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
            <div className="min-w-0 flex-1 space-y-6">
              <RoadmapFocusCard
                roadmap={activeRoadmap}
                onStart={stepProgress.start}
                pending={stepProgress.pending}
                onComplete={stepProgress.complete}
                failedStepId={stepProgress.failedStepId}
              />

              <RoadmapPhaseList
                key={activeRoadmap.id}
                nextStepId={nextStepId}
                phases={activeRoadmap.phases}
                onStart={stepProgress.start}
                pending={stepProgress.pending}
                enrollmentId={activeRoadmap.id}
                onComplete={stepProgress.complete}
                failedStepId={stepProgress.failedStepId}
              />
            </div>

            <aside
              aria-label={t(`${KEY}.aside`)}
              className="grid gap-4 sm:grid-cols-2 xl:w-80 xl:shrink-0 xl:grid-cols-1"
            >
              <RoadmapRecommendationsCard recommendations={recommendations} />
              <RoadmapEditCard
                onEdit={handleEdit}
                roadmap={activeRoadmap}
                editingRoadmapId={editingRoadmapId}
              />
              <RoadmapCatalogCard />
            </aside>
          </div>
        </>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col items-center rounded-2xl border border-dashed px-6 py-12 text-center">
            <span className="rounded-full bg-accent p-4 text-primary">
              <L.Route aria-hidden className="size-7" />
            </span>
            <h1
              ref={headingRef}
              tabIndex={-1}
              className="mt-4 text-lg font-semibold outline-none"
            >
              {t(`${KEY}.emptyMyRoadmapsTitle`)}
            </h1>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {t(`${KEY}.emptyMyRoadmapsDescription`)}
            </p>
            <Button asChild className="mt-5">
              <Link href={ROADMAP_CHAT_HREF}>
                <L.Plus aria-hidden />
                {t(`${KEY}.emptyMyRoadmapsAction`)}
              </Link>
            </Button>
          </div>
          <RoadmapCatalogCard />
        </div>
      )}
    </div>
  );
};

export default ProfessionalRoadmapTab;
