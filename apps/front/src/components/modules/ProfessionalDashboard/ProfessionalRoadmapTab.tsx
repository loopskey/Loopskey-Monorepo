"use client";

import { useProfessionalRoadmaps } from "@/hooks/useProfessionalRoadmap";
import { ContentPagination } from "@elements/pagination";
import { GlassCard } from "@elements/glass-card";
import { Progress } from "@ui/progress";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";
import { Input } from "@ui/input";
import { cn } from "@/lib/utils";

import Image from "next/image";
import Link from "next/link";

import * as L from "lucide-react";

const ProfessionalRoadmapTab = () => {
  const {
    t,
    page,
    stats,
    search,
    myPageInfo,
    myRoadmaps,
    isFetching,
    refetchAll,
    handleNext,
    explorePage,
    formatWeeks,
    learningSteps,
    exploreSearch,
    myRoadmapsData,
    getRoadmapHref,
    handlePrevious,
    featuredRoadmap,
    exploreRoadmaps,
    explorePageInfo,
    getProgressValue,
    handleExploreNext,
    exploreRoadmapsData,
    isMyRoadmapsLoading,
    isMyRoadmapsFetching,
    handleExplorePrevious,
    handleSearchInputChange,
    isExploreRoadmapsLoading,
    isExploreRoadmapsFetching,
    handleExploreSearchInputChange,
  } = useProfessionalRoadmaps();

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
            radius="xl"
            variant="glass"
            disabled={isFetching}
            onClick={refetchAll}
          >
            <L.RefreshCw
              className={cn("h-4 w-4", isFetching && "animate-spin")}
            />
            {t("professionalDashboard.common.refresh")}
          </Button>

          <Button radius="xl" variant="brand" asChild>
            <Link href="/roadmaps/create">
              <L.Plus className="h-4 w-4" />
              {t("professionalDashboard.roadmap.createCustomPath")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("professionalDashboard.roadmap.enrolled")}
              </p>
              <p className="mt-2 text-3xl font-medium">{stats.enrolled}</p>
            </div>

            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
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
                {stats.averageProgress}%
              </p>
            </div>

            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
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
                {stats.completedPhases}
              </p>
            </div>

            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
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
                {stats.nextMilestone}%
              </p>
            </div>

            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <L.Target className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <GlassCard>
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-medium">
                {t("professionalDashboard.roadmap.yourLearningPath")}
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {featuredRoadmap
                  ? featuredRoadmap.title
                  : t("professionalDashboard.roadmap.learningPathDescription")}
              </p>
            </div>

            <L.Layers3 className="h-5 w-5 text-primary" />
          </div>

          {isMyRoadmapsLoading ? (
            <div className="flex min-h-72 items-center justify-center">
              <L.Loader2 className="h-7 w-7 animate-spin text-primary" />
            </div>
          ) : learningSteps.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-glass-border bg-background/40 p-10 text-center">
              <L.BookOpenCheck className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-4 font-medium">
                {t("professionalDashboard.roadmap.noLearningPath")}
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                {t("professionalDashboard.roadmap.noLearningPathDescription")}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {learningSteps.map((step, index) => (
                <div
                  key={step.id}
                  className="rounded-3xl border border-glass-border bg-background/45 p-4 backdrop-blur-xl"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-medium text-primary">
                      {index + 1}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h3 className="font-medium">{step.title}</h3>
                        <Badge
                          variant={step.completed ? "default" : "secondary"}
                        >
                          {step.completed
                            ? t("professionalDashboard.common.completed")
                            : t("professionalDashboard.common.inProgress")}
                        </Badge>
                      </div>

                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {step.description ??
                          t(
                            "professionalDashboard.roadmap.phaseDescriptionFallback",
                          )}
                      </p>

                      <div className="mt-4">
                        <div className="mb-2 flex justify-between text-xs font-medium text-muted-foreground">
                          <span>
                            {t("professionalDashboard.common.progress")}
                          </span>
                          <span>{getProgressValue(step.progress)}%</span>
                        </div>
                        <Progress value={getProgressValue(step.progress)} />
                      </div>
                      <div className="mt-3 text-xs text-muted-foreground">
                        {step.stepsCount}{" "}
                        {t("professionalDashboard.roadmap.steps")}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

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

          <div className="flex flex-col items-center justify-center rounded-[2rem] border border-glass-border bg-background/45 p-8 text-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-full border-[10px] border-primary/20">
              <span className="text-3xl font-medium text-primary">
                {stats.averageProgress}%
              </span>
            </div>

            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              {t("professionalDashboard.roadmap.averageProgressText")}
            </p>
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
      </div>

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
              className="h-12 rounded-2xl bg-background/60 pl-10"
            />
          </div>
        </div>

        {isMyRoadmapsLoading ? (
          <div className="flex min-h-72 items-center justify-center">
            <L.Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : myRoadmaps.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-glass-border bg-background/40 p-10 text-center">
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
            {myRoadmaps.map((roadmap) => (
              <div
                key={roadmap.id}
                className="overflow-hidden rounded-[2rem] border border-glass-border bg-background/45 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
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
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-primary/10 text-primary">
                      <L.BookOpenCheck className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-medium/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                    <Badge className="bg-background/90 text-foreground hover:bg-background/90">
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
                  </div>
                  <div className="mt-5">
                    <div className="mb-2 flex justify-between text-xs font-medium text-muted-foreground">
                      <span>{t("professionalDashboard.common.progress")}</span>
                      <span>{getProgressValue(roadmap.progress)}%</span>
                    </div>
                    medium{" "}
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
                    <Button
                      asChild
                      size="sm"
                      radius="xl"
                      variant="brand"
                      className="flex-1"
                    >
                      <Link href={getRoadmapHref(roadmap)}>
                        {t("professionalDashboard.common.details")}
                        <L.ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>

                    <Button radius="xl" variant="glass" size="sm">
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
              className="h-12 rounded-2xl bg-background/60 pl-10"
            />
          </div>
        </div>

        {isExploreRoadmapsLoading ? (
          <div className="flex min-h-72 items-center justify-center">
            <L.Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : exploreRoadmaps.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-glass-border bg-background/40 p-10 text-center">
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
                className="overflow-hidden rounded-[2rem] border border-glass-border bg-background/45 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/30"
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
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-primary/10 text-primary">
                      <L.Compass className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-medium/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                    {roadmap.category ? (
                      <Badge className="bg-background/90 text-foreground hover:bg-background/90">
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
                    <div className="rounded-2xl bg-primary/5 p-3">
                      <p className="text-xs text-muted-foreground">
                        {t("professionalDashboard.roadmap.phases")}
                      </p>
                      <p className="mt-1 font-medium">{roadmap.phasesCount}</p>
                    </div>

                    <div className="rounded-2xl bg-primary/5 p-3">
                      <p className="text-xs text-muted-foreground">
                        {t("professionalDashboard.roadmap.duration")}
                      </p>
                      <p className="mt-1 font-medium">
                        {formatWeeks(roadmap.estimatedWeeks)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <Button
                      size="sm"
                      radius="xl"
                      variant="brand"
                      className="flex-1"
                    >
                      {t("professionalDashboard.roadmap.enroll")}
                    </Button>

                    <Button radius="xl" variant="glass" size="sm" asChild>
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
