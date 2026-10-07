"use client";

import { startTransition, useCallback, useEffect, useMemo } from "react";
import { useRef, useState, ViewTransition } from "react";
import { findCurrentPhaseId, dayStreak } from "@/utils/roadmap-journey.util";
import { RoadmapRecommendationsCard } from "@modules/ProfessionalRoadmap/RoadmapRecommendationsCard";
import { RoadmapGenerationStatus } from "@modules/ProfessionalRoadmap/RoadmapGenerationStatus";
import { useProfessionalRoadmaps } from "@/hooks/useProfessionalRoadmap";
import {
  daysUntil,
  findNextActionableStep,
} from "@/utils/roadmap-journey.util";
import { buildRoadmapHref } from "@/utils/roadmap-navigation.util";
import { RoadmapJourneyTimeline } from "@modules/ProfessionalRoadmap/RoadmapJourneyTimeline";
import { buildCpdProgressView } from "@/utils/professional-overview.helper";
import { completionsThisWeek } from "@/utils/roadmap-journey.util";
import { ProgressDonutChart } from "@elements/dashboard-charts";
import { ContentPagination } from "@elements/pagination";
import { useChartSemantics } from "@hooks/useChartPalette";
import { RoadmapMatchTier } from "@/lib/graphql/base";
import { RoadmapPhaseList } from "@modules/ProfessionalRoadmap/RoadmapPhaseList";
import { RoadmapHero } from "@modules/ProfessionalRoadmap/RoadmapHero";
import { GlassCard } from "@elements/glass-card";
import { Progress } from "@ui/progress";
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
    otherRoadmaps,
    justCompleted,
    exploreSearch,
    unenrollingId,
    isStatsLoading,
    myRoadmapsData,
    requestedStepId,
    hasFailedDraft,
    handleUnenroll,
    handlePrevious,
    recommendations,
    exploreRoadmaps,
    explorePageInfo,
    getProgressValue,
    activeRoadmap,
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

  type TCurrentRoadmapView = "statusCard" | "hero" | "none";
  const currentView: TCurrentRoadmapView =
    isGenerating || hasFailedDraft
      ? "statusCard"
      : activeRoadmap
        ? "hero"
        : "none";
  const [displayView, setDisplayView] =
    useState<TCurrentRoadmapView>(currentView);
  useEffect(() => {
    if (displayView === currentView) return;
    startTransition(() => setDisplayView(currentView));
  }, [currentView, displayView]);

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
        {displayView === "statusCard" && draft ? (
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

        {displayView === "hero" && activeRoadmap ? (
          <div id="your-learning-path" className="space-y-6">
            <RoadmapHero
              t={t}
              locale={locale}
              headingRef={heroHeadingRef}
              title={activeRoadmap.title}
              nextStepTitle={nextStep?.title}
              nextStepStatus={nextStep?.status}
              onContinue={handleContinue}
              newRoadmapHref={ROADMAP_CHAT_HREF}
              progress={activeRoadmap.progress}
              totalSteps={activeRoadmap.totalSteps}
              targetDate={activeRoadmap.targetDate}
              description={activeRoadmap.description}
              phasesCount={activeRoadmap.phasesCount}
              continueHref={continueHref}
              viewFullHref={viewFullHref}
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
                onStart={stepProgress.start}
                nextStepId={nextStep?.stepId}
                focusStepId={focusStepId}
                focusNonce={focusNonce}
                pending={stepProgress.pending}
                phases={activeRoadmap.phases}
                onComplete={stepProgress.complete}
                enrollmentId={activeRoadmap.id}
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

            <RoadmapRecommendationsCard
              t={t}
              recommendations={recommendations}
            />
          </div>
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

        <div className="mt-5 space-y-4">
          {myRoadmaps.map((roadmap) => (
            <div key={roadmap.id}>
              <div className="mb-2 flex justify-between gap-3 text-sm">
                <span className="line-clamp-1 font-medium">
                  {roadmap.title}
                </span>

                <span className="text-muted-foreground">
                  {getProgressValue(roadmap.progress)}%
                </span>
              </div>

              <Progress value={getProgressValue(roadmap.progress)} />
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-xl font-medium">
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
          <div className="flex min-h-72 items-center justify-center">
            <L.Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : otherRoadmaps.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-10 text-center">
            <L.Route className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 font-medium">
              {t("professionalDashboard.roadmap.emptyMyRoadmapsTitle")}
            </p>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              {t("professionalDashboard.roadmap.emptyMyRoadmapsDescription")}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {otherRoadmaps.map((roadmap) => (
              <li
                key={roadmap.id}
                className="flex flex-wrap items-center gap-4 py-3 first:pt-0 last:pb-0"
              >
                <Link
                  href={roadmapHref(roadmap)}
                  className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-muted"
                >
                  {roadmap.imageUrl ? (
                    <Image
                      fill
                      alt={roadmap.title}
                      src={roadmap.imageUrl}
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-primary/10 text-primary">
                      <L.BookOpenCheck className="h-5 w-5" />
                    </div>
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <Link
                      href={roadmapHref(roadmap)}
                      className="truncate text-sm font-medium hover:underline"
                    >
                      {roadmap.title}
                    </Link>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {getProgressValue(roadmap.progress)}%
                    </span>
                  </div>
                  <Progress
                    value={getProgressValue(roadmap.progress)}
                    className="mt-1.5 h-1.5"
                  />
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      {roadmap.completedSteps}/{roadmap.totalSteps}{" "}
                      {t("professionalDashboard.roadmap.steps")}
                    </span>
                    <span>
                      {roadmap.completedPhases}/{roadmap.phasesCount}{" "}
                      {t("professionalDashboard.roadmap.phases")}
                    </span>
                    {roadmap.targetDate ? (
                      <span
                        className={cn(
                          daysUntil(new Date(roadmap.targetDate)) < 0 &&
                            "text-destructive",
                        )}
                      >
                        {new Intl.DateTimeFormat(locale, {
                          dateStyle: "medium",
                        }).format(new Date(roadmap.targetDate))}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button asChild size="sm" radius="xl" variant="outline">
                    <Link href={roadmapHref(roadmap)}>
                      {t("professionalDashboard.common.details")}
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    radius="xl"
                    variant="ghost"
                    disabled={unenrollingId === roadmap.id}
                    onClick={() => handleUnenroll(roadmap.id)}
                    aria-label={t("professionalDashboard.roadmap.unenroll")}
                  >
                    {unenrollingId === roadmap.id ? (
                      <L.Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <L.X className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <ContentPagination
          page={page}
          className="mt-6"
          onNext={handleNext}
          canPrevious={page > 1}
          onPrevious={handlePrevious}
          isLoading={isMyRoadmapsFetching}
          totalCount={myRoadmapsData?.totalCount}
          hasNextPage={Boolean(myPageInfo?.hasNextPage)}
        />
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
                        alt={roadmap.title}
                        src={roadmap.imageUrl}
                        sizes="56px"
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
                        {roadmap.phasesCount}{" "}
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
