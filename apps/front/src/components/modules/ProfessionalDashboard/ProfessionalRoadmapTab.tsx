"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { ROADMAP_CATALOG_ELEMENT_ID } from "@/utils/roadmap-navigation.util";
import { RoadmapGenerationStatus } from "@modules/ProfessionalRoadmap/RoadmapGenerationStatus";
import { useProfessionalRoadmaps } from "@/hooks/useProfessionalRoadmap";
import { ROADMAP_CHAT_HREF } from "@/utils/roadmap-navigation.util";
import { useRoadmapLibrary } from "@/hooks/useRoadmapLibrary";
import { RoadmapDetails } from "@modules/ProfessionalRoadmap/RoadmapDetails";
import { ViewTransition } from "react";
import { RoadmapCatalog } from "@modules/ProfessionalRoadmap/RoadmapCatalog";
import { RoadmapTable } from "@modules/ProfessionalRoadmap/RoadmapTable";
import { Button } from "@ui/button";

import type { TProfessionalRoadmap } from "@/types/professional-dashboard.types";

import Link from "next/link";

import * as L from "lucide-react";

const KEY = "professionalDashboard.roadmap";

const ProfessionalRoadmapTab = () => {
  const {
    t,
    draft,
    handleEdit,
    openRoadmap,
    isGenerating,
    stepProgress,
    justCompleted,
    unenrollingId,
    toggleRoadmap,
    myRoadmapsData,
    hasFailedDraft,
    handleUnenroll,
    continueRoadmap,
    editingRoadmapId,
    recommendations,
    isMyRoadmapsLoading,
    isRetryingGeneration,
    handleRetryGeneration,
    acknowledgeCompletion,
  } = useProfessionalRoadmaps();

  const totalCount = myRoadmapsData?.totalCount ?? 0;
  const library = useRoadmapLibrary(totalCount);
  const { explore } = library;

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
    if (window.location.hash !== `#${ROADMAP_CATALOG_ELEMENT_ID}`) return;
    document
      .getElementById(ROADMAP_CATALOG_ELEMENT_ID)
      ?.scrollIntoView({ block: "start" });
  }, []);

  const hasNoRoadmaps =
    !isMyRoadmapsLoading && Boolean(myRoadmapsData) && totalCount === 0;

  const renderDetails = (roadmap: TProfessionalRoadmap) => (
    <RoadmapDetails
      onEdit={handleEdit}
      roadmap={roadmap}
      onStart={stepProgress.start}
      pending={stepProgress.pending}
      onComplete={stepProgress.complete}
      failedStepId={stepProgress.failedStepId}
      editingRoadmapId={editingRoadmapId}
      recommendations={openRoadmap?.id === roadmap.id ? recommendations : []}
    />
  );

  return (
    <div className="space-y-8">
      <div className="space-y-5">
        <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
          <div className="min-w-0 flex-1">
            <h1
              tabIndex={-1}
              ref={headingRef}
              className="text-2xl font-semibold tracking-tight text-foreground outline-none sm:text-3xl"
            >
              {t(`${KEY}.library.title`)}
            </h1>
            {totalCount > 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {t(`${KEY}.library.summary`, {
                  total: totalCount,
                  inProgress: library.counts.inProgress,
                  completed: library.counts.completed,
                })}
              </p>
            ) : null}
          </div>
          <Button asChild size="lg">
            <Link href={ROADMAP_CHAT_HREF}>
              <L.Plus aria-hidden />
              {t(`${KEY}.newRoadmap`)}
            </Link>
          </Button>
        </div>

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

        {hasNoRoadmaps ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed px-6 py-12 text-center">
            <span className="rounded-full bg-accent p-4 text-primary">
              <L.Route aria-hidden className="size-7" />
            </span>
            <p className="mt-4 text-lg font-semibold">
              {t(`${KEY}.emptyMyRoadmapsTitle`)}
            </p>
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
        ) : (
          <RoadmapTable
            library={library}
            onEdit={handleEdit}
            onToggle={toggleRoadmap}
            onUnenroll={handleUnenroll}
            onContinue={continueRoadmap}
            unenrollingId={unenrollingId}
            renderDetails={renderDetails}
            editingRoadmapId={editingRoadmapId}
            openRoadmapId={openRoadmap?.id ?? null}
          />
        )}
      </div>

      <RoadmapCatalog
        page={explore.page}
        goNext={explore.goNext}
        isError={explore.isError}
        roadmaps={explore.roadmaps}
        isLoading={explore.isLoading}
        search={library.exploreSearch}
        isFetching={explore.isFetching}
        totalCount={explore.totalCount}
        goPrevious={explore.goPrevious}
        hasNextPage={explore.hasNextPage}
        onRetry={() => explore.refetch()}
        onSearchChange={library.changeExploreSearch}
      />
    </div>
  );
};

export default ProfessionalRoadmapTab;
