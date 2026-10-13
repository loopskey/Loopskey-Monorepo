"use client";

import { startTransition, useCallback, useEffect, useMemo } from "react";
import { useRef, useState, ViewTransition } from "react";
import { RoadmapCard, RoadmapCardSkeleton } from "@elements/roadmap-card";
import { findCurrentPhaseId, dayStreak } from "@/utils/roadmap-journey.util";
import { RoadmapRecommendationsCard } from "@modules/ProfessionalRoadmap/RoadmapRecommendationsCard";
import { RoadmapGenerationStatus } from "@modules/ProfessionalRoadmap/RoadmapGenerationStatus";
import { useProfessionalRoadmaps } from "@/hooks/useProfessionalRoadmap";
import { findNextActionableStep } from "@/utils/roadmap-journey.util";
import { RoadmapJourneyTimeline } from "@modules/ProfessionalRoadmap/RoadmapJourneyTimeline";
import { buildCpdProgressView } from "@/utils/professional-overview.helper";
import { completionsThisWeek } from "@/utils/roadmap-journey.util";
import { ProgressDonutChart } from "@elements/dashboard-charts";
import { ContentPagination } from "@elements/pagination";
import { useChartSemantics } from "@hooks/useChartPalette";
import { buildRoadmapHref } from "@/utils/roadmap-navigation.util";
import { RoadmapMatchTier } from "@/lib/graphql/base";
import { RoadmapPhaseList } from "@modules/ProfessionalRoadmap/RoadmapPhaseList";
import { RoadmapHero } from "@modules/ProfessionalRoadmap/RoadmapHero";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { cn } from "@/lib/utils";

import Image from "next/image";
import Link from "next/link";

import * as L from "lucide-react";

const ROADMAP_CHAT_HREF = "/dashboard/professional/roadmap-chat";

const ProfessionalRoadmapTab = () => {
  const {
    t,
    page,
    stats,
    draft,
    search,
    locale,
    myPageInfo,
    myRoadmaps,
    handleNext,
    explorePage,
    formatWeeks,
    isGenerating,
    stepProgress,
    isStatsError,
    justCompleted,
    exploreSearch,
    unenrollingId,
    isStatsLoading,
    activeRoadmap,
    myRoadmapsData,
    hasFailedDraft,
    handleUnenroll,
    handlePrevious,
    recommendations,
    requestedStepId,
    exploreRoadmaps,
    explorePageInfo,
    handleExploreNext,
    exploreRoadmapsData,
    isMyRoadmapsLoading,
    isMyRoadmapsFetching,
    isRetryingGeneration,
    handleExplorePrevious,
    handleRetryGeneration,
    acknowledgeCompletion,
    handleSearchInputChange,
    isExploreRoadmapsLoading,
    isExploreRoadmapsFetching,
    handleExploreSearchInputChange,
  } = useProfessionalRoadmaps();

  const semantics = useChartSemantics();

  const isStatusVisible = isGenerating || hasFailedDraft;
  const [displayStatus, setDisplayStatus] = useState(isStatusVisible);
  useEffect(() => {
    if (displayStatus === isStatusVisible) return;
    startTransition(() => setDisplayStatus(isStatusVisible));
  }, [isStatusVisible, displayStatus]);

  const heroHeadingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (!justCompleted) return;
    heroHeadingRef.current?.focus();
    acknowledgeCompletion();
  }, [justCompleted, acknowledgeCompletion]);

  const statValue = (value: number | string) => {
    if (isStatsError) return "—";
    if (isStatsLoading) return "…";
    return value;
  };

  const progressPercent =
    isStatsError || isStatsLoading ? 0 : stats.averageProgress;
  const progressChartData = [
    {
      name: "completed",
      label: t("professionalDashboard.roadmap.activitiesDone"),
      value: progressPercent,
      fill: semantics.renewalReady,
    },
    {
      name: "remaining",
      label: t("professionalDashboard.roadmap.remaining"),
      value: Math.max(0, 100 - progressPercent),
      fill: semantics.track,
    },
  ];

  const tracksCpdTarget =
    !isStatsError &&
    !isStatsLoading &&
    typeof stats.totalRequiredCredits === "number" &&
    stats.totalRequiredCredits > 0;
  const cpdProgressView = buildCpdProgressView(
    {
      earnedCredits: stats.totalEarnedCredits,
      totalRequiredCredits: stats.totalRequiredCredits,
      progressPercent: 0,
    },
    {
      earned: t("professionalDashboard.roadmap.creditsEarnedLabel"),
      remaining: t("professionalDashboard.roadmap.creditsRemainingLabel"),
    },
    { progress: semantics.onTrack, remainder: semantics.track },
  );

  const currentPhaseId = useMemo(
    () => findCurrentPhaseId(activeRoadmap?.phases ?? []),
    [activeRoadmap],
  );
  const nextStep = useMemo(
    () => findNextActionableStep(activeRoadmap?.phases ?? []),
    [activeRoadmap],
  );
  const requestedStepExists = Boolean(
    requestedStepId &&
      activeRoadmap?.phases.some((phase) =>
        phase.steps.some((step) => step.id === requestedStepId),
      ),
  );
  const focusStepId = requestedStepId
    ? requestedStepExists
      ? requestedStepId
      : (nextStep?.stepId ?? null)
    : null;
  const [focusNonce, setFocusNonce] = useState(0);
  const handleContinue = useCallback(() => {
    if (focusStepId && focusStepId === nextStep?.stepId)
      setFocusNonce((current) => current + 1);
  }, [focusStepId, nextStep?.stepId]);
  const roadmapHref = (roadmap: {
    id: string;
    phases: Parameters<typeof findNextActionableStep>[0];
  }) =>
    buildRoadmapHref(
      roadmap.id,
      findNextActionableStep(roadmap.phases)?.stepId,
    );
  const continueHref = activeRoadmap
    ? buildRoadmapHref(activeRoadmap.id, nextStep?.stepId)
    : ROADMAP_CHAT_HREF;
  const viewFullHref = activeRoadmap
    ? buildRoadmapHref(activeRoadmap.id)
    : ROADMAP_CHAT_HREF;
  const thisWeekCount = useMemo(
    () => completionsThisWeek(activeRoadmap?.phases ?? []),
    [activeRoadmap],
  );
  const streak = useMemo(
    () => dayStreak(activeRoadmap?.phases ?? []),
    [activeRoadmap],
  );
  const roadmapTracksCpdTarget =
    typeof activeRoadmap?.requiredCredits === "number" &&
    activeRoadmap.requiredCredits > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("professionalDashboard.roadmap.eyebrow")}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t("professionalDashboard.roadmap.title")}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t("professionalDashboard.roadmap.subtitle")}
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            radius="xl"
            className="w-full justify-center sm:w-auto"
            variant={activeRoadmap ? "outline" : "default"}
          >
            <Link href={ROADMAP_CHAT_HREF}>
              <L.Plus className="h-4 w-4" />
              {t("professionalDashboard.roadmap.newRoadmap")}
            </Link>
          </Button>

          {activeRoadmap ? (
            <Button
              asChild
              radius="xl"
              className="w-full justify-center sm:w-auto"
            >
              <Link href={continueHref} onClick={handleContinue}>
                <L.ArrowRight className="h-4 w-4" />
                {t(
                  nextStep
                    ? "professionalDashboard.roadmap.continueRoadmap"
                    : "professionalDashboard.roadmap.hero.viewCompleted",
                )}
              </Link>
            </Button>
          ) : null}
        </div>
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

      <GlassCard className="p-4">
        <div className="grid grid-cols-2 gap-4 divide-y divide-border sm:grid-cols-4 sm:divide-y-0 sm:divide-x">
          <div className="flex items-center gap-2 pt-3 first:pt-0 sm:pt-0 sm:first:pl-0 sm:pl-4">
            <L.Route
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <p className="text-lg font-medium">{statValue(stats.enrolled)}</p>
              <p className="text-xs text-muted-foreground">
                {t("professionalDashboard.roadmap.enrolled")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 sm:pt-0 sm:pl-4">
            <L.TrendingUp
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <p className="text-lg font-medium">
                {isStatsError || isStatsLoading
                  ? statValue(stats.averageProgress)
                  : `${stats.averageProgress}%`}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("professionalDashboard.roadmap.averageCompletion")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 sm:pt-0 sm:pl-4">
            <L.CheckCircle2
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <p className="text-lg font-medium">
                {statValue(`${stats.completedPhases}/${stats.totalPhases}`)}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("professionalDashboard.roadmap.completedPhases")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-3 sm:pt-0 sm:pl-4">
            <L.Target
              className="h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <div>
              <p className="text-lg font-medium">
                {isStatsError
                  ? "—"
                  : isStatsLoading
                    ? "…"
                    : stats.nextMilestone === null
                      ? t("professionalDashboard.roadmap.notAvailable")
                      : `${stats.nextMilestone}%`}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("professionalDashboard.roadmap.nextMilestone")}
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      <section className="space-y-6" aria-labelledby="my-roadmaps-heading">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2
              id="my-roadmaps-heading"
              className="text-xl font-medium tracking-tight"
            >
              {t("professionalDashboard.roadmap.myRoadmaps")}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("professionalDashboard.roadmap.myRoadmapsDescription")}
            </p>
          </div>

          <div className="relative w-full md:max-w-sm">
            <L.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={handleSearchInputChange}
              placeholder={t("professionalDashboard.roadmap.searchMyRoadmaps")}
              className="h-12 rounded-md bg-muted pl-10"
            />
          </div>
        </div>

        {isMyRoadmapsLoading ? (
          <div
            aria-hidden
            className="grid gap-x-6 gap-y-8 md:grid-cols-2 xl:grid-cols-3"
          >
            {Array.from({ length: 3 }).map((_, index) => (
              <RoadmapCardSkeleton key={index} />
            ))}
          </div>
        ) : myRoadmaps.length === 0 ? (
          <GlassCard>
            <div className="flex min-h-56 flex-col items-center justify-center text-center">
              <div className="rounded-full bg-primary/10 p-4 text-primary">
                <L.Route className="h-7 w-7" />
              </div>
              <p className="mt-4 font-medium">
                {t("professionalDashboard.roadmap.emptyMyRoadmapsTitle")}
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {t("professionalDashboard.roadmap.emptyMyRoadmapsDescription")}
              </p>
              <Button asChild radius="xl" className="mt-5">
                <Link href={ROADMAP_CHAT_HREF}>
                  <L.Plus className="h-4 w-4" />
                  {t("professionalDashboard.roadmap.emptyMyRoadmapsAction")}
                </Link>
              </Button>
            </div>
          </GlassCard>
        ) : (
          <ul
            className={cn(
              "grid gap-x-6 gap-y-8 md:grid-cols-2 xl:grid-cols-3",
              isMyRoadmapsFetching && "opacity-70 transition-opacity",
            )}
          >
            {myRoadmaps.map((roadmap) => (
              <li key={roadmap.id} className="flex">
                <RoadmapCard
                  roadmap={roadmap}
                  className="w-full"
                  href={roadmapHref(roadmap)}
                  onUnenroll={handleUnenroll}
                  isSelected={roadmap.id === activeRoadmap?.id}
                  isUnenrolling={unenrollingId === roadmap.id}
                />
              </li>
            ))}
          </ul>
        )}

        <ContentPagination
          page={page}
          onNext={handleNext}
          canPrevious={page > 1}
          onPrevious={handlePrevious}
          isLoading={isMyRoadmapsFetching}
          totalCount={myRoadmapsData?.totalCount}
          hasNextPage={Boolean(myPageInfo?.hasNextPage)}
        />
      </section>

      {activeRoadmap ? (
        <div id="your-learning-path" className="space-y-6">
          <div>
            <h2 className="text-xl font-medium tracking-tight">
              {t("professionalDashboard.roadmap.workspaceTitle")}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("professionalDashboard.roadmap.workspaceDescription")}
            </p>
          </div>

          <RoadmapHero
            t={t}
            locale={locale}
            headingRef={heroHeadingRef}
            continueHref={continueHref}
            title={activeRoadmap.title}
            onContinue={handleContinue}
            viewFullHref={viewFullHref}
            nextStepTitle={nextStep?.title}
            nextStepStatus={nextStep?.status}
            progress={activeRoadmap.progress}
            newRoadmapHref={ROADMAP_CHAT_HREF}
            totalSteps={activeRoadmap.totalSteps}
            targetDate={activeRoadmap.targetDate}
            description={activeRoadmap.description}
            phasesCount={activeRoadmap.phasesCount}
            completedSteps={activeRoadmap.completedSteps}
            estimatedWeeks={activeRoadmap.estimatedWeeks}
          />

          {activeRoadmap.coverageNote ? (
            <GlassCard className="p-5">
              <div className="flex items-start gap-3">
                <L.Info
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-sm font-medium">
                    {t("professionalDashboard.roadmap.coverageNote")}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {activeRoadmap.coverageNote}
                  </p>
                </div>
              </div>
            </GlassCard>
          ) : null}

          {activeRoadmap.matchTier &&
          activeRoadmap.matchTier !== RoadmapMatchTier.Exact ? (
            <GlassCard className="p-5">
              <div className="flex items-start gap-3">
                <L.AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-sm font-medium">
                    {t(
                      "professionalDashboard.roadmap.closeMatchDisclosure.title",
                    )}
                  </h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {t(
                      "professionalDashboard.roadmap.closeMatchDisclosure.description",
                    )}
                  </p>
                  {activeRoadmap.draftId ? (
                    <Button asChild radius="xl" size="sm" className="mt-3">
                      <Link
                        href={`${ROADMAP_CHAT_HREF}?draftId=${encodeURIComponent(
                          activeRoadmap.draftId,
                        )}&focus=preferences`}
                      >
                        {t(
                          "professionalDashboard.roadmap.closeMatchDisclosure.action",
                        )}
                      </Link>
                    </Button>
                  ) : null}
                </div>
              </div>
            </GlassCard>
          ) : null}

          <RoadmapJourneyTimeline
            t={t}
            phases={activeRoadmap.phases}
            currentPhaseId={currentPhaseId}
          />

          <div id="your-learning-path-phases">
            <RoadmapPhaseList
              t={t}
              focusNonce={focusNonce}
              focusStepId={focusStepId}
              onStart={stepProgress.start}
              nextStepId={nextStep?.stepId}
              phases={activeRoadmap.phases}
              pending={stepProgress.pending}
              enrollmentId={activeRoadmap.id}
              onComplete={stepProgress.complete}
              failedStepId={stepProgress.failedStepId}
            />
          </div>

          <GlassCard className="p-5">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              {roadmapTracksCpdTarget ? (
                <span className="flex items-center gap-2">
                  <L.Target
                    className="h-4 w-4 text-primary"
                    aria-hidden="true"
                  />
                  {t("professionalDashboard.roadmap.hero.cpdStrip", {
                    earned: activeRoadmap.earnedCredits,
                    required: activeRoadmap.requiredCredits ?? 0,
                  })}
                </span>
              ) : null}
              <span className="flex items-center gap-2">
                <L.CalendarCheck2
                  className="h-4 w-4 text-primary"
                  aria-hidden="true"
                />
                {t("professionalDashboard.roadmap.hero.thisWeek", {
                  count: thisWeekCount,
                })}
              </span>
              {streak >= 2 ? (
                <span className="flex items-center gap-2">
                  <L.Flame
                    className="h-4 w-4 text-primary"
                    aria-hidden="true"
                  />
                  {t("professionalDashboard.roadmap.hero.streak", {
                    count: streak,
                  })}
                </span>
              ) : null}
            </div>
          </GlassCard>

          <RoadmapRecommendationsCard t={t} recommendations={recommendations} />
        </div>
      ) : null}

      {!activeRoadmap ? (
        <RoadmapRecommendationsCard t={t} recommendations={recommendations} />
      ) : null}

      <GlassCard className="p-5">
        <div className="mb-4">
          <h2 className="text-base font-medium">
            {t("professionalDashboard.roadmap.overallProgress")}
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            {t("professionalDashboard.roadmap.overallProgressDescription", {
              count: stats.enrolled,
            })}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col items-center justify-center rounded-lg border p-5 text-center">
            <div className="w-full max-w-[200px]">
              <ProgressDonutChart
                data={progressChartData}
                valueSuffix="%"
                ariaLabel={t("professionalDashboard.roadmap.activitiesDone")}
                centerLabel={
                  <span className="text-3xl font-medium text-primary">
                    {isStatsError || isStatsLoading
                      ? statValue(stats.averageProgress)
                      : `${stats.averageProgress}%`}
                  </span>
                }
              />
            </div>

            <p className="mt-2 text-sm font-medium">
              {t("professionalDashboard.roadmap.activitiesDone")}
            </p>
            <p className="mt-1 text-xs leading-6 text-muted-foreground">
              {t("professionalDashboard.roadmap.averageProgressText")}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center rounded-lg border p-5 text-center">
            {tracksCpdTarget ? (
              <>
                <div className="w-full max-w-[200px]">
                  <ProgressDonutChart
                    data={cpdProgressView.chartData}
                    ariaLabel={t("professionalDashboard.roadmap.cpdTarget")}
                    centerLabel={
                      <span className="text-3xl font-medium text-primary">
                        {cpdProgressView.chartPercent}%
                      </span>
                    }
                  />
                </div>

                <p className="mt-2 text-sm font-medium">
                  {t("professionalDashboard.roadmap.cpdTarget")}
                </p>
                <p className="mt-1 text-xs leading-6 text-muted-foreground">
                  {t("professionalDashboard.roadmap.creditsOf", {
                    earned: stats.totalEarnedCredits,
                    required: stats.totalRequiredCredits ?? 0,
                  })}
                </p>
              </>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">
                {isStatsError
                  ? statValue(0)
                  : t("professionalDashboard.roadmap.noCpdTargetTracked")}
              </p>
            )}
          </div>
        </div>
      </GlassCard>

      <GlassCard>
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-medium">
              {t("professionalDashboard.roadmap.exploreRoadmaps")}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("professionalDashboard.roadmap.exploreRoadmapsDescription")}
            </p>
          </div>

          <div className="relative w-full md:max-w-sm">
            <L.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={exploreSearch}
              onChange={handleExploreSearchInputChange}
              placeholder={t(
                "professionalDashboard.roadmap.searchExploreRoadmaps",
              )}
              className="h-12 rounded-md bg-muted pl-10"
            />
          </div>
        </div>

        {isExploreRoadmapsLoading ? (
          <div className="flex min-h-72 items-center justify-center">
            <L.Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : exploreRoadmaps.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            <L.Compass className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 font-medium">
              {t("professionalDashboard.roadmap.emptyExploreTitle")}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {t("professionalDashboard.roadmap.emptyExploreDescription")}
            </p>
          </div>
        ) : (
          <>
            <p className="mb-3 text-sm text-muted-foreground">
              {t("professionalDashboard.roadmap.exploreUnavailable")}
            </p>
            <ul className="divide-y divide-border">
              {exploreRoadmaps.map((roadmap) => (
                <li
                  key={roadmap.id}
                  className="flex flex-wrap items-center gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
                    {roadmap.imageUrl ? (
                      <Image
                        fill
                        sizes="56px"
                        alt={roadmap.title}
                        src={roadmap.imageUrl}
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-primary/10 text-primary">
                        <L.Compass className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {roadmap.title}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      {roadmap.category ? (
                        <span>{roadmap.category}</span>
                      ) : null}
                      <span>{roadmap.level}</span>
                      <span>
                        {roadmap.phasesCount}
                        {t("professionalDashboard.roadmap.phases")}
                      </span>
                      <span>{formatWeeks(roadmap.estimatedWeeks)}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Button size="sm" radius="xl" disabled>
                      {t("professionalDashboard.roadmap.enroll")}
                    </Button>
                    <Button radius="xl" variant="outline" size="sm" disabled>
                      {t("professionalDashboard.common.details")}
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        <ContentPagination
          className="mt-6"
          page={explorePage}
          onNext={handleExploreNext}
          canPrevious={explorePage > 1}
          onPrevious={handleExplorePrevious}
          isLoading={isExploreRoadmapsFetching}
          totalCount={exploreRoadmapsData?.totalCount}
          hasNextPage={Boolean(explorePageInfo?.hasNextPage)}
        />
      </GlassCard>
    </div>
  );
};

export default ProfessionalRoadmapTab;
