"use client";

import { useRef, useState, ViewTransition } from "react";
import { RoadmapRecommendationsCard } from "@modules/ProfessionalRoadmap/RoadmapRecommendationsCard";
import { startTransition, useEffect } from "react";
import { RoadmapGenerationStatus } from "@modules/ProfessionalRoadmap/RoadmapGenerationStatus";
import { useProfessionalRoadmaps } from "@/hooks/useProfessionalRoadmap";
import { RoadmapSummarySections } from "@modules/ProfessionalRoadmap/RoadmapSummarySections";
import { buildCpdProgressView } from "@/utils/professional-overview.helper";
import { ProgressDonutChart } from "@elements/dashboard-charts";
import { ContentPagination } from "@elements/pagination";
import { useChartSemantics } from "@hooks/useChartPalette";
import { RoadmapMatchTier } from "@/lib/graphql/base";
import { RoadmapPhaseList } from "@modules/ProfessionalRoadmap/RoadmapPhaseList";
import { daysUntil } from "@modules/ProfessionalRoadmap/RoadmapSummarySections";
import { GlassCard } from "@elements/glass-card";
import { Progress } from "@ui/progress";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
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
    getRoadmapHref,
    hasFailedDraft,
    handleUnenroll,
    handlePrevious,
    recommendations,
    exploreRoadmaps,
    explorePageInfo,
    getProgressValue,
    generatedRoadmap,
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
  const currentView: TCurrentRoadmapView = generatedRoadmap
    ? "hero"
    : isGenerating || hasFailedDraft
      ? "statusCard"
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
            variant={generatedRoadmap ? "outline" : "default"}
          >
            <Link href={ROADMAP_CHAT_HREF}>
              <L.Plus className="h-4 w-4" />
              {t("professionalDashboard.roadmap.newRoadmap")}
            </Link>
          </Button>

          {generatedRoadmap ? (
            <Button
              asChild
              radius="xl"
              className="w-full justify-center sm:w-auto"
            >
              <a href="#your-learning-path">
                <L.ArrowRight className="h-4 w-4" />
                {t("professionalDashboard.roadmap.continueRoadmap")}
              </a>
            </Button>
          ) : null}
        </div>
      </div>

      <ViewTransition>
        {displayView === "statusCard" && draft ? (
          <RoadmapGenerationStatus
            t={t}
            draftId={draft.id}
            status={draft.status}
            goal={draft.goal}
            failure={draft.failure}
            onRetry={handleRetryGeneration}
            isRetrying={isRetryingGeneration}
          />
        ) : null}

        {displayView === "hero" && generatedRoadmap ? (
          <div id="your-learning-path" className="space-y-6">
            <GlassCard className="p-6">
              <p className="text-sm font-medium text-primary">
                {t("professionalDashboard.roadmap.heroEyebrow")}
              </p>
              <h2
                ref={heroHeadingRef}
                tabIndex={-1}
                className="mt-1 text-2xl font-medium tracking-tight outline-none"
              >
                {generatedRoadmap.title}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {generatedRoadmap.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild radius="xl">
                  <a href="#your-learning-path-phases">
                    {t("professionalDashboard.roadmap.continueRoadmap")}
                    <L.ArrowRight className="h-4 w-4" />
                  </a>
                </Button>
                <Button asChild radius="xl" variant="outline">
                  <Link href={getRoadmapHref(generatedRoadmap)}>
                    {t("professionalDashboard.roadmap.viewFullRoadmap")}
                  </Link>
                </Button>
                <Button asChild radius="xl" variant="outline">
                  <Link href={ROADMAP_CHAT_HREF}>
                    {t("professionalDashboard.roadmap.newRoadmap")}
                  </Link>
                </Button>
              </div>
            </GlassCard>

            {generatedRoadmap.coverageNote ? (
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
                      {generatedRoadmap.coverageNote}
                    </p>
                  </div>
                </div>
              </GlassCard>
            ) : null}

            {generatedRoadmap.matchTier &&
            generatedRoadmap.matchTier !== RoadmapMatchTier.Exact ? (
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
                    {generatedRoadmap.draftId ? (
                      <Button asChild radius="xl" size="sm" className="mt-3">
                        <Link
                          href={`${ROADMAP_CHAT_HREF}?draftId=${encodeURIComponent(
                            generatedRoadmap.draftId,
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

            <RoadmapSummarySections
              t={t}
              locale={locale}
              recommendations={recommendations}
              progress={generatedRoadmap.progress}
              totalSteps={generatedRoadmap.totalSteps}
              targetDate={generatedRoadmap.targetDate}
              earnedCredits={generatedRoadmap.earnedCredits}
              completedSteps={generatedRoadmap.completedSteps}
              requiredCredits={generatedRoadmap.requiredCredits}
            />

            <div id="your-learning-path-phases">
              <RoadmapPhaseList
                t={t}
                onStart={stepProgress.start}
                pending={stepProgress.pending}
                phases={generatedRoadmap.phases}
                onComplete={stepProgress.complete}
                enrollmentId={generatedRoadmap.id}
                failedStepId={stepProgress.failedStepId}
              />
            </div>
          </div>
        ) : null}
      </ViewTransition>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("professionalDashboard.roadmap.enrolled")}
              </p>
              <p className="mt-2 text-3xl font-medium">
                {statValue(stats.enrolled)}
              </p>
            </div>

            <div className="rounded-md bg-primary/10 p-3 text-primary">
              <L.Route className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("professionalDashboard.roadmap.averageCompletion")}
              </p>
              <p className="mt-2 text-3xl font-medium">
                {isStatsError || isStatsLoading
                  ? statValue(stats.averageProgress)
                  : `${stats.averageProgress}%`}
              </p>
            </div>

            <div className="rounded-md bg-primary/10 p-3 text-primary">
              <L.TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("professionalDashboard.roadmap.completedPhases")}
              </p>
              <p className="mt-2 text-3xl font-medium">
                {statValue(`${stats.completedPhases}/${stats.totalPhases}`)}
              </p>
            </div>

            <div className="rounded-md bg-primary/10 p-3 text-primary">
              <L.CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("professionalDashboard.roadmap.nextMilestone")}
              </p>
              <p className="mt-2 text-3xl font-medium">
                {isStatsError
                  ? "—"
                  : isStatsLoading
                    ? "…"
                    : stats.nextMilestone === null
                      ? t("professionalDashboard.roadmap.notAvailable")
                      : `${stats.nextMilestone}%`}
              </p>
            </div>

            <div className="rounded-md bg-primary/10 p-3 text-primary">
              <L.Target className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>
      </div>

      {!generatedRoadmap ? (
        <RoadmapRecommendationsCard t={t} recommendations={recommendations} />
      ) : null}

      <GlassCard>
        <div className="mb-6">
          <h2 className="text-xl font-medium">
            {t("professionalDashboard.roadmap.overallProgress")}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {t("professionalDashboard.roadmap.overallProgressDescription", {
              count: stats.enrolled,
            })}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="flex flex-col items-center justify-center rounded-lg border p-8 text-center">
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

          <div className="flex flex-col items-center justify-center rounded-lg border p-8 text-center">
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
          <div className="grid gap-4 lg:grid-cols-3">
            {otherRoadmaps.map((roadmap) => (
              <div
                key={roadmap.id}
                className="overflow-hidden rounded-lg border transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
              >
                <Link
                  href={getRoadmapHref(roadmap)}
                  className="relative block h-40 overflow-hidden bg-muted"
                >
                  {roadmap.imageUrl ? (
                    <Image
                      fill
                      alt={roadmap.title}
                      src={roadmap.imageUrl}
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-primary/10 text-primary">
                      <L.BookOpenCheck className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                    <Badge className="bg-muted text-foreground hover:bg-muted">
                      {roadmap.status}
                    </Badge>
                    {roadmap.category ? (
                      <Badge variant="secondary">{roadmap.category}</Badge>
                    ) : null}
                  </div>
                </Link>

                <div className="p-5">
                  <h3 className="line-clamp-2 text-lg font-medium">
                    {roadmap.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {roadmap.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="secondary">{roadmap.level}</Badge>
                    <Badge variant="outline">
                      {roadmap.completedSteps}/{roadmap.totalSteps}{" "}
                      {t("professionalDashboard.roadmap.steps")}
                    </Badge>
                    {roadmap.targetDate ? (
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1",
                          daysUntil(new Date(roadmap.targetDate)) < 0 &&
                            "border-destructive/40 text-destructive",
                        )}
                      >
                        <L.CalendarDays className="h-3 w-3" />
                        {new Intl.DateTimeFormat(locale, {
                          dateStyle: "medium",
                        }).format(new Date(roadmap.targetDate))}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-xs font-medium text-muted-foreground">
                      <span>{t("professionalDashboard.common.progress")}</span>
                      <span>{getProgressValue(roadmap.progress)}%</span>
                    </div>
                    <Progress value={getProgressValue(roadmap.progress)} />
                  </div>
                  <div className="mt-5 flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {roadmap.completedPhases}/{roadmap.phasesCount}{" "}
                      {t("professionalDashboard.roadmap.phases")}
                    </span>
                    <span>
                      {t("professionalDashboard.roadmap.next")}:{" "}
                      {roadmap.nextPhaseTitle ?? "—"}
                    </span>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <Button asChild size="sm" radius="xl" className="flex-1">
                      <Link href={getRoadmapHref(roadmap)}>
                        {t("professionalDashboard.common.details")}
                        <L.ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>

                    <Button
                      radius="xl"
                      variant="outline"
                      size="sm"
                      disabled={unenrollingId === roadmap.id}
                      onClick={() => handleUnenroll(roadmap.id)}
                    >
                      {unenrollingId === roadmap.id ? (
                        <L.Loader2 className="h-4 w-4 animate-spin" />
                      ) : null}
                      {t("professionalDashboard.roadmap.unenroll")}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
          <div className="grid gap-4 lg:grid-cols-3">
            {exploreRoadmaps.map((roadmap) => (
              <div
                key={roadmap.id}
                className="overflow-hidden rounded-lg border transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
              >
                <Link
                  href={getRoadmapHref(roadmap)}
                  className="relative block h-40 overflow-hidden bg-muted"
                >
                  {roadmap.imageUrl ? (
                    <Image
                      fill
                      alt={roadmap.title}
                      src={roadmap.imageUrl}
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-primary/10 text-primary">
                      <L.Compass className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                    {roadmap.category ? (
                      <Badge className="bg-muted text-foreground hover:bg-muted">
                        {roadmap.category}
                      </Badge>
                    ) : null}
                    <Badge variant="secondary">{roadmap.level}</Badge>
                  </div>
                </Link>
                <div className="p-5">
                  <h3 className="line-clamp-2 text-lg font-medium">
                    {roadmap.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                    {roadmap.description}
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md bg-primary/5 p-3">
                      <p className="text-xs text-muted-foreground">
                        {t("professionalDashboard.roadmap.phases")}
                      </p>
                      <p className="mt-1 font-medium">{roadmap.phasesCount}</p>
                    </div>

                    <div className="rounded-md bg-primary/5 p-3">
                      <p className="text-xs text-muted-foreground">
                        {t("professionalDashboard.roadmap.duration")}
                      </p>
                      <p className="mt-1 font-medium">
                        {formatWeeks(roadmap.estimatedWeeks)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <Button size="sm" radius="xl" className="flex-1">
                      {t("professionalDashboard.roadmap.enroll")}
                    </Button>

                    <Button radius="xl" variant="outline" size="sm" asChild>
                      <Link href={getRoadmapHref(roadmap)}>
                        {t("professionalDashboard.common.details")}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
