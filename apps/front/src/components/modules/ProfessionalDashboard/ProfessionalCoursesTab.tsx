"use client";

import { ExternalLearningProvider } from "@/lib/graphql/generated";
import { ExternalLearningButton } from "@elements/external-learning-btn";
import { useProfessionalCourses } from "@/hooks/useProfessionalCourses";
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

const ProfessionalCoursesTab = () => {
  const {
    t,
    data,
    page,
    stats,
    search,
    courses,
    refetch,
    pageInfo,
    isLoading,
    isFetching,
    formatDate,
    handleNext,
    formatPrice,
    getCourseHref,
    formatDuration,
    handlePrevious,
    getCourseTitle,
    getProgressValue,
    getCourseActionLabel,
    handleSearchInputChange,
  } = useProfessionalCourses();

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            {t("professionalDashboard.courses.eyebrow")}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t("professionalDashboard.courses.title")}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {t("professionalDashboard.courses.description")}
          </p>
        </div>

        <Button
          type="button"
          radius="xl"
          variant="glass"
          disabled={isFetching}
          onClick={() => refetch()}
        >
          <L.RefreshCcw
            className={cn("h-4 w-4", isFetching && "animate-spin")}
          />
          {t("common.refresh")}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("professionalDashboard.courses.cards.total")}
              </p>

              <p className="mt-2 text-3xl font-medium">{stats.total}</p>
            </div>

            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <L.BookOpen className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("professionalDashboard.courses.cards.active")}
              </p>

              <p className="mt-2 text-3xl font-medium">{stats.active}</p>
            </div>

            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <L.PlayCircle className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {t("professionalDashboard.courses.cards.completed")}
              </p>
              <p className="mt-2 text-3xl font-medium">{stats.completed}</p>
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
                {t("professionalDashboard.courses.cards.averageProgress")}
              </p>

              <p className="mt-2 text-3xl font-medium">{stats.avgProgress}%</p>
            </div>

            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <L.TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="space-y-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-xl font-medium">
              {t("professionalDashboard.courses.progressTitle")}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {t("professionalDashboard.courses.progressDescription")}
            </p>
          </div>

          <div className="relative w-full max-w-md">
            <L.Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={handleSearchInputChange}
              placeholder={t("professionalDashboard.courses.search")}
              className="h-12 rounded-2xl bg-background/60 pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-72 items-center justify-center">
            <L.Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : courses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-glass-border bg-background/40 p-10 text-center">
            <L.BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 font-medium">
              {t("professionalDashboard.courses.emptyTitle")}
            </p>
            <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-muted-foreground">
              {t("professionalDashboard.courses.emptyDescription")}
            </p>
            <Button className="mt-5" radius="xl" variant="brand" asChild>
              <Link href="/courses">
                <L.GraduationCap className="h-4 w-4" />
                {t("professionalDashboard.certificates.earnMore")}
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-5">
            {courses.map((course) => {
              const progress = getProgressValue(course.progress);
              const courseHref = getCourseHref(course);
              const title = getCourseTitle(course);
              return (
                <div
                  key={course.id}
                  className="group overflow-hidden rounded-[2rem] border border-glass-border bg-background/45 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-primary/5"
                >
                  <div className="grid gap-0 lg:grid-cols-[260px_1fr]">
                    <Link
                      href={courseHref}
                      className="relative block min-h-52 overflow-hidden bg-muted lg:min-h-full"
                    >
                      {course.courseImageUrl ? (
                        <Image
                          fill
                          alt={title}
                          src={course.courseImageUrl}
                          className="h-full min-h-52 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full min-h-52 items-center justify-center bg-primary/10 text-primary">
                          <L.BookOpen className="h-12 w-12" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-medium/60 via-medium/10 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                        <Badge className="bg-background/90 text-foreground hover:bg-background/90">
                          {course.status}
                        </Badge>
                        {course.courseIsFree ? (
                          <Badge className="bg-primary text-primary-foreground">
                            {t("professionalDashboard.courses.free")}
                          </Badge>
                        ) : null}
                      </div>
                    </Link>

                    <div className="flex flex-col justify-between p-5 md:p-6">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          {course.courseLevel ? (
                            <Badge variant="secondary">
                              {course.courseLevel}
                            </Badge>
                          ) : null}
                          {course.courseCategory ? (
                            <Badge variant="outline">
                              {course.courseCategory}
                            </Badge>
                          ) : null}
                          <Badge variant="secondary">
                            {course.contentType}
                          </Badge>
                        </div>
                        <Link href={courseHref}>
                          <h3 className="mt-4 line-clamp-2 text-xl font-medium transition-colors group-hover:text-primary">
                            {title}
                          </h3>
                        </Link>
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                          {course.courseDescription ??
                            t(
                              "professionalDashboard.courses.descriptionFallback",
                            )}
                        </p>
                        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                          <span className="inline-flex items-center gap-1.5">
                            <L.UserRound className="h-4 w-4" />
                            {course.providerName ??
                              t(
                                "professionalDashboard.courses.unknownProvider",
                              )}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <L.Clock className="h-4 w-4" />
                            {formatDuration(course.courseDurationMinutes)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <L.CalendarDays className="h-4 w-4" />
                            {formatDate(course.startedAt)}
                          </span>
                          {course.courseRating ? (
                            <span className="inline-flex items-center gap-1.5">
                              <L.Star className="h-4 w-4 fill-current text-primary" />
                              {Number(course.courseRating).toFixed(1)}
                              {course.courseRatingCount ? (
                                <span>({course.courseRatingCount})</span>
                              ) : null}
                            </span>
                          ) : null}

                          {course.completedAt ? (
                            <span className="inline-flex items-center gap-1.5 text-primary">
                              <L.Award className="h-4 w-4" />
                              {formatDate(course.completedAt)}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                        <div>
                          <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="font-medium">
                              {t("professionalDashboard.courses.progress")}
                            </span>
                            <span className="font-medium text-primary">
                              {progress}%
                            </span>
                          </div>
                          <Progress value={progress} className="h-2.5" />
                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              {t("professionalDashboard.courses.startedAt")}:{" "}
                              {formatDate(course.startedAt)}
                            </span>
                            {course.completedAt ? (
                              <span>
                                ·{" "}
                                {t("professionalDashboard.courses.completedAt")}
                                : {formatDate(course.completedAt)}
                              </span>
                            ) : null}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
                          <div className="rounded-2xl bg-primary/5 px-4 py-2 text-center">
                            <p className="text-xs text-muted-foreground">
                              {t("professionalDashboard.courses.price")}
                            </p>
                            <p className="font-medium">
                              {formatPrice(
                                course.coursePrice,
                                course.courseCurrency,
                                course.courseIsFree,
                              )}
                            </p>
                          </div>
                          {course.courseImageUrl ? (
                            <ExternalLearningButton
                              title={title}
                              courseId={course.id ?? course.contentId}
                              externalUrl={course.courseImageUrl}
                              provider={ExternalLearningProvider.Other}
                              label={getCourseActionLabel(course)}
                            />
                          ) : (
                            <Button radius="xl" variant="brand" asChild>
                              <Link href={courseHref}>
                                <L.PlayCircle className="h-4 w-4" />
                                {getCourseActionLabel(course)}
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      <ContentPagination
        page={page}
        onNext={handleNext}
        isLoading={isFetching}
        canPrevious={page > 1}
        onPrevious={handlePrevious}
        totalCount={data?.totalCount}
        hasNextPage={Boolean(pageInfo?.hasNextPage)}
      />
    </div>
  );
};

export default ProfessionalCoursesTab;
