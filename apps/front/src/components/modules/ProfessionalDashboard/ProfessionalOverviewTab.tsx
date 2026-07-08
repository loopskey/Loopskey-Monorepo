"use client";

import { useProfessionalOverviewTab } from "@/hooks/useProfessionalOverviewTab";
import { DashboardStatCard } from "@modules/ProfessionalDashboard/parts/dashboard-stat-card";
import { SnapshotRow } from "@modules/ProfessionalDashboard/parts/snapshot-learning";
import { formatDate } from "@/utils/function-helper";
import { GlassCard } from "@elements/glass-card";
import { Progress } from "@ui/progress";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import Image from "next/image";
import Link from "next/link";

import * as L from "lucide-react";
import * as C from "@elements/dashboard-charts";

const ProfessionalOverviewTab = () => {
  const { t } = useI18n();
  const {
    overview,
    isLoading,
    refreshAll,
    pduOverTime,
    isEnrolling,
    goalProgress,
    enrollCourse,
    activeCourses,
    pduByCategory,
    goalChartData,
    upcomingEvents,
    recommendedCourses,
  } = useProfessionalOverviewTab();

  const professionalName = overview?.professionalName ?? "Professional";

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("professionalDashboard.overview.eyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-3xl">
            {t("professionalDashboard.overview.title").replace(
              "{name}",
              professionalName,
            )}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {t("professionalDashboard.overview.description")}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            radius="xl"
            variant="glass"
            disabled={isLoading}
            onClick={refreshAll}
          >
            <L.RefreshCcw className="h-4 w-4" />
            {t("common.refresh")}
          </Button>

          <Button asChild variant="glass" radius="xl">
            <Link href="/dashboard/professional?tab=calendar">
              {t("professionalDashboard.overview.viewCalendar")}
            </Link>
          </Button>

          <Button asChild variant="brand" radius="xl">
            <Link href="/courses">
              {t("professionalDashboard.overview.browseCourses")}
            </Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardStatCard
          icon={L.BookOpen}
          value={overview?.activeCourses ?? 0}
          title={t("professionalDashboard.overview.cards.activeCourses")}
        />

        <DashboardStatCard
          icon={L.BookOpen}
          value={overview?.completedCourses ?? 0}
          title={t("professionalDashboard.overview.cards.completedCourses")}
        />

        <DashboardStatCard
          icon={L.Target}
          value={(overview?.totalPdus ?? 0).toFixed(2)}
          title={t("professionalDashboard.overview.cards.totalPdus")}
        />

        <DashboardStatCard
          icon={L.Award}
          value={overview?.certificatesEarned ?? 0}
          title={t("professionalDashboard.overview.cards.certificates")}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <GlassCard className="xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium">
                {t("professionalDashboard.overview.pduOverTime")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("professionalDashboard.overview.pduOverTimeDescription")}
              </p>
            </div>

            <L.TrendingUp className="h-5 w-5 text-primary" />
          </div>

          <div className="mt-6 h-72">
            <C.PduOverTimeChart data={pduOverTime} />
          </div>
        </GlassCard>

        <GlassCard>
          <h2 className="text-lg font-medium">
            {t("professionalDashboard.overview.goalProgress")}
          </h2>
          <C.GoalHalfPieChart data={goalChartData} progress={goalProgress} />
          <p className="text-center text-sm text-muted-foreground">
            {t("professionalDashboard.overview.goalProgressLabel")}
          </p>
        </GlassCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <GlassCard>
          <h2 className="text-lg font-medium">
            {t("professionalDashboard.overview.pdusByCategory")}
          </h2>
          <div className="mt-6 h-72">
            <C.PduByCategoryChart data={pduByCategory} />
          </div>
        </GlassCard>

        <GlassCard className="xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-medium">
              {t("professionalDashboard.overview.upcomingEvents")}
            </h2>

            <Button asChild variant="glass" radius="xl" size="sm">
              <Link href="/dashboard/professional?tab=calendar">
                {t("professionalDashboard.overview.viewAll")}
              </Link>
            </Button>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {upcomingEvents.length ? (
              upcomingEvents.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-glass-border bg-background/45 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                      <L.CalendarDays className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-bold">{item.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatDate(item.date)}
                      </p>

                      <Badge
                        variant={
                          item.source === "manual" ? "default" : "secondary"
                        }
                        className="mt-3 rounded-full"
                      >
                        {item.source === "manual"
                          ? t("professionalDashboard.calendar.upcoming.manual")
                          : t(
                              "professionalDashboard.calendar.upcoming.registered",
                            )}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="rounded-3xl border border-dashed border-glass-border p-6 text-sm text-muted-foreground">
                {t("professionalDashboard.overview.emptyUpcomingEvents")}
              </p>
            )}
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <GlassCard>
          <h2 className="text-lg font-medium">
            {t("professionalDashboard.overview.learningSnapshot")}
          </h2>

          <div className="mt-5 space-y-4">
            <SnapshotRow
              value={overview?.activeCourses ?? 0}
              label={t("professionalDashboard.overview.cards.activeCourses")}
            />
            <SnapshotRow
              value={overview?.completedCourses ?? 0}
              label={t("professionalDashboard.overview.cards.completedCourses")}
            />
            <SnapshotRow
              value={overview?.totalPdus ?? 0}
              label={t("professionalDashboard.overview.cards.totalPdus")}
            />
            <SnapshotRow
              value={overview?.certificatesEarned ?? 0}
              label={t("professionalDashboard.overview.cards.certificates")}
            />
          </div>
        </GlassCard>

        <GlassCard className="xl:col-span-2">
          <h2 className="text-lg font-medium">
            {t("professionalDashboard.overview.myActiveCourses")}
          </h2>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {activeCourses.length ? (
              activeCourses.slice(0, 4).map((course) => (
                <div
                  key={course.id}
                  className="rounded-3xl border border-glass-border bg-background/45 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-medium">
                      {course.courseTitle ?? course.contentId}
                    </p>
                    <Badge className="rounded-full">
                      {course.progress ?? 0}%
                    </Badge>
                  </div>
                  <Progress value={course.progress ?? 0} className="mt-4" />
                  <Button
                    asChild
                    size="sm"
                    radius="xl"
                    variant="glass"
                    className="mt-4"
                  >
                    <Link href={`/courses/${course.contentId}`}>
                      {t("professionalDashboard.overview.continue")}
                    </Link>
                  </Button>
                </div>
              ))
            ) : (
              <p className="rounded-3xl border border-dashed border-glass-border p-6 text-sm text-muted-foreground">
                {t("professionalDashboard.overview.emptyActiveCourses")}
              </p>
            )}
          </div>
        </GlassCard>
      </section>

      <GlassCard>
        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
          <div>
            <h2 className="text-lg font-medium">
              {t("professionalDashboard.overview.recommendedCourses")}
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              {t(
                "professionalDashboard.overview.recommendedCoursesDescription",
              )}
            </p>
          </div>

          <Button asChild variant="glass" radius="xl">
            <Link href="/courses">
              {t("professionalDashboard.overview.browseAll")}
            </Link>
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(recommendedCourses?.items ?? []).slice(0, 10).map((course) => (
            <div
              key={course.id}
              className="overflow-hidden rounded-[2rem] border border-glass-border"
            >
              <div className="relative aspect-video overflow-hidden bg-muted">
                {course.imageUrl ? (
                  <Image
                    fill
                    alt={course.title}
                    src={course.imageUrl}
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  />
                ) : null}
              </div>

              <div className="space-y-4 p-5">
                <Badge variant="secondary" className="rounded-full">
                  {course.category}
                </Badge>

                <h3 className="line-clamp-2 text-base font-medium">
                  {course.title}
                </h3>

                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {course.description}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1 font-medium">
                    <L.Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {course.rating ?? 0}
                  </span>

                  <span className="font-medium text-primary">
                    {course.isFree
                      ? t("common.free")
                      : `${course.price ?? 0} ${course.currency ?? "USD"}`}
                  </span>
                </div>

                <Button
                  radius="xl"
                  variant="brand"
                  className="w-full"
                  disabled={isEnrolling}
                  onClick={() => enrollCourse(course.id)}
                >
                  {t("professionalDashboard.overview.enrollNow")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};

export default ProfessionalOverviewTab;
