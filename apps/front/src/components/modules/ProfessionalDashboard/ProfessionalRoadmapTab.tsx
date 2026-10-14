"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/tabs";
import { RoadmapRecommendationsList } from "@modules/ProfessionalRoadmap/RoadmapRecommendationsList";
import { RoadmapGenerationStatus } from "@modules/ProfessionalRoadmap/RoadmapGenerationStatus";
import { useProfessionalRoadmaps } from "@/hooks/useProfessionalRoadmap";
import { findNextActionableStep } from "@/utils/roadmap-journey.util";
import { RoadmapWorkspaceHeader } from "@modules/ProfessionalRoadmap/RoadmapWorkspaceHeader";
import { RoadmapSummaryRail } from "@modules/ProfessionalRoadmap/RoadmapSummaryRail";
import { RoadmapExploreList } from "@modules/ProfessionalRoadmap/RoadmapExploreList";
import { ROADMAP_CHAT_HREF } from "@/utils/roadmap-navigation.util";
import { ContentPagination } from "@elements/pagination";
import { RoadmapFocusCard } from "@modules/ProfessionalRoadmap/RoadmapFocusCard";
import { RoadmapPhaseList } from "@modules/ProfessionalRoadmap/RoadmapPhaseList";
import { RoadmapSwitcher } from "@modules/ProfessionalRoadmap/RoadmapSwitcher";
import { ViewTransition } from "react";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

import type { RoadmapSection } from "@/types/professional-roadmap-chat.types";

import Link from "next/link";

import * as L from "lucide-react";

const KEY = "professionalDashboard.roadmap";

const ROADMAP_SEARCH_MIN_COUNT = 7;

type SectionSelection = { roadmapId?: string; section: RoadmapSection };

const SECTION_LABEL_KEY: Record<RoadmapSection, string> = {
  path: `${KEY}.sections.path`,
  recommended: `${KEY}.sections.recommended`,
  explore: `${KEY}.sections.explore`,
};

const SECTION_TRIGGER_CLASS_NAME =
  "-mb-px h-auto flex-none rounded-none border-0 border-b-2 border-transparent px-3 py-2.5 text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none";

const ProfessionalRoadmapTab = () => {
  const {
    t,
    page,
    draft,
    search,
    myPageInfo,
    myRoadmaps,
    handleNext,
    explorePage,
    isGenerating,
    stepProgress,
    justCompleted,
    exploreSearch,
    unenrollingId,
    activeRoadmap,
    myRoadmapsData,
    hasFailedDraft,
    handleUnenroll,
    handlePrevious,
    recommendations,
    exploreRoadmaps,
    explorePageInfo,
    isMyRoadmapsError,
    refetchMyRoadmaps,
    handleExploreNext,
    exploreRoadmapsData,
    isMyRoadmapsLoading,
    isMyRoadmapsFetching,
    isRetryingGeneration,
    handleExplorePrevious,
    handleRetryGeneration,
    acknowledgeCompletion,
    isExploreRoadmapsError,
    refetchExploreRoadmaps,
    handleSearchInputChange,
    isExploreRoadmapsLoading,
    isExploreRoadmapsFetching,
    handleExploreSearchInputChange,
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

  const [selection, setSelection] = useState<SectionSelection | null>(null);
  if (selection && selection.roadmapId !== activeRoadmap?.id)
    setSelection(null);
  const selectedSection = selection?.section ?? null;
  const selectSection = (value: RoadmapSection) =>
    setSelection({ roadmapId: activeRoadmap?.id, section: value });
  const sections: RoadmapSection[] = [
    ...(activeRoadmap ? (["path"] as const) : []),
    ...(recommendations.length > 0 ? (["recommended"] as const) : []),
    "explore",
  ];
  const section =
    selectedSection && sections.includes(selectedSection)
      ? selectedSection
      : sections[0];
  const sectionCount: Record<RoadmapSection, number | undefined> = {
    path: activeRoadmap?.totalSteps,
    recommended: recommendations.length,
    explore: exploreRoadmapsData?.totalCount,
  };

  const isSearching = search.trim() !== "";
  const hasNextPage = Boolean(myPageInfo?.hasNextPage);
  const isPaged = page > 1 || hasNextPage;
  const hasLoadFailed = isMyRoadmapsError && !myRoadmapsData;
  const isEmpty =
    !isMyRoadmapsLoading &&
    !hasLoadFailed &&
    myRoadmaps.length === 0 &&
    !isSearching &&
    !isPaged &&
    !isStatusVisible;
  const showSwitcher = myRoadmaps.length > 1 || isSearching || isPaged;
  const showSearch =
    isSearching ||
    (myRoadmapsData?.totalCount ?? 0) >= ROADMAP_SEARCH_MIN_COUNT;
  const nextStepId = activeRoadmap
    ? findNextActionableStep(activeRoadmap.phases)?.stepId
    : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-medium text-primary">
            {t(`${KEY}.eyebrow`)}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t(`${KEY}.title`)}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t(`${KEY}.subtitle`)}
          </p>
        </div>

        <Button
          asChild
          variant="outline"
          className="w-full justify-center sm:w-auto"
        >
          <Link href={ROADMAP_CHAT_HREF}>
            <L.Plus className="size-4" />
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
          />
        ) : null}
      </ViewTransition>

      {isMyRoadmapsLoading ? (
        <div aria-hidden className="space-y-4">
          <Skeleton className="h-7 w-2/5 rounded-full" />
          <Skeleton className="h-4 w-3/5 rounded-full" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
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
              <L.RotateCcw className="size-4" />
              {t("professionalDashboard.common.refresh")}
            </Button>
          </div>
        </GlassCard>
      ) : (
        <>
          {showSwitcher ? (
            <div className="space-y-3">
              <RoadmapSwitcher
                search={search}
                roadmaps={myRoadmaps}
                showSearch={showSearch}
                isFetching={isMyRoadmapsFetching}
                activeRoadmapId={activeRoadmap?.id}
                onSearchChange={handleSearchInputChange}
              />

              {isPaged ? (
                <ContentPagination
                  page={page}
                  onNext={handleNext}
                  canPrevious={page > 1}
                  hasNextPage={hasNextPage}
                  onPrevious={handlePrevious}
                  isLoading={isMyRoadmapsFetching}
                  totalCount={myRoadmapsData?.totalCount}
                />
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-x-8 gap-y-5 border-t pt-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
            {activeRoadmap ? (
              <>
                <div className="min-w-0 xl:col-start-1">
                  <RoadmapWorkspaceHeader
                    key={activeRoadmap.id}
                    roadmap={activeRoadmap}
                    headingRef={headingRef}
                    onUnenroll={handleUnenroll}
                    isUnenrolling={unenrollingId === activeRoadmap.id}
                  />
                </div>

                <div className="min-w-0 xl:col-start-1">
                  <RoadmapFocusCard
                    roadmap={activeRoadmap}
                    onStart={stepProgress.start}
                    pending={stepProgress.pending}
                    onComplete={stepProgress.complete}
                    failedStepId={stepProgress.failedStepId}
                    onExplore={() => selectSection("explore")}
                  />
                </div>

                <div className="min-w-0 xl:col-start-2 xl:row-span-3 xl:row-start-1">
                  <RoadmapSummaryRail roadmap={activeRoadmap} />
                </div>
              </>
            ) : isEmpty ? (
              <div className="flex flex-col items-center rounded-xl border border-dashed px-6 py-10 text-center xl:col-span-2">
                <div className="rounded-full bg-primary/10 p-4 text-primary">
                  <L.Route className="size-7" />
                </div>
                <p className="mt-4 font-medium">
                  {t(`${KEY}.emptyMyRoadmapsTitle`)}
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  {t(`${KEY}.emptyMyRoadmapsDescription`)}
                </p>
                <Button asChild className="mt-5">
                  <Link href={ROADMAP_CHAT_HREF}>
                    <L.Plus className="size-4" />
                    {t(`${KEY}.emptyMyRoadmapsAction`)}
                  </Link>
                </Button>
              </div>
            ) : null}

            <Tabs
              value={section}
              className={cn(
                "min-w-0 gap-4",
                activeRoadmap ? "xl:col-start-1" : "xl:col-span-2",
              )}
              onValueChange={(value) => selectSection(value as RoadmapSection)}
            >
              <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-none border-b bg-transparent p-0">
                {sections.map((item) => (
                  <TabsTrigger
                    key={item}
                    value={item}
                    className={SECTION_TRIGGER_CLASS_NAME}
                  >
                    {t(SECTION_LABEL_KEY[item])}
                    {typeof sectionCount[item] === "number" ? (
                      <span className="font-normal tabular-nums opacity-70">
                        {sectionCount[item]}
                      </span>
                    ) : null}
                  </TabsTrigger>
                ))}
              </TabsList>

              {activeRoadmap ? (
                <TabsContent value="path">
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
                </TabsContent>
              ) : null}

              <TabsContent value="recommended">
                <RoadmapRecommendationsList recommendations={recommendations} />
              </TabsContent>

              <TabsContent value="explore">
                <RoadmapExploreList
                  page={explorePage}
                  search={exploreSearch}
                  roadmaps={exploreRoadmaps}
                  onNext={handleExploreNext}
                  isError={isExploreRoadmapsError && !exploreRoadmapsData}
                  onPrevious={handleExplorePrevious}
                  isLoading={isExploreRoadmapsLoading}
                  isFetching={isExploreRoadmapsFetching}
                  onRetry={() => refetchExploreRoadmaps()}
                  totalCount={exploreRoadmapsData?.totalCount}
                  onSearchChange={handleExploreSearchInputChange}
                  hasNextPage={Boolean(explorePageInfo?.hasNextPage)}
                />
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfessionalRoadmapTab;
