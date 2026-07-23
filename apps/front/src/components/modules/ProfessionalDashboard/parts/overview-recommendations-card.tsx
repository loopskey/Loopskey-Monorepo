"use client";

import { useEnrollContentMutation } from "@/lib/rtk/endpoints/content-interaction.api";
import { getOverviewSectionState } from "@/utils/professional-overview.helper";
import { OverviewCardMessage } from "@modules/ProfessionalDashboard/parts/overview-card";
import { useCoursesQuery } from "@/lib/rtk/endpoints/course.api";
import { ContentType } from "@/lib/graphql/generated";
import { GlassCard } from "@elements/glass-card";
import { Skeleton } from "@ui/skeleton";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import Image from "next/image";
import Link from "next/link";

import * as L from "lucide-react";

const RECOMMENDATION_LIMIT = 6;

export const OverviewRecommendationsCard = () => {
  const { t } = useI18n();

  const recommendationsQuery = useCoursesQuery({
    pagination: { take: RECOMMENDATION_LIMIT },
  });
  const [enrollContent, enrollState] = useEnrollContentMutation();

  const courses = recommendationsQuery.data?.items ?? [];
  const state = getOverviewSectionState({
    isLoading: recommendationsQuery.isLoading,
    isError: recommendationsQuery.isError,
    isEmpty: courses.length === 0,
  });

  const enrollCourse = async (courseId: string) => {
    try {
      await enrollContent({
        contentId: courseId,
        contentType: ContentType.Course,
      }).unwrap();
      notify.success(t("professionalDashboard.overview.enrolled"));
      void recommendationsQuery.refetch();
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  return (
    <GlassCard>
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-end">
        <div>
          <h2 className="text-lg font-medium">
            {t("professionalDashboard.overview.recommendedCourses")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("professionalDashboard.overview.recommendedCoursesDescription")}
          </p>
        </div>

        <Button asChild variant="glass" radius="xl">
          <Link href="/courses">
            {t("professionalDashboard.overview.browseAll")}
          </Link>
        </Button>
      </div>

      {state === "loading" ? (
        <div
          className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          aria-hidden
        >
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-72 w-full rounded-[2rem]" />
          ))}
        </div>
      ) : null}

      {state === "error" ? (
        <div className="mt-6">
          <OverviewCardMessage
            tone="danger"
            icon={L.AlertTriangle}
            title={t("professionalDashboard.overview.states.errorTitle")}
            description={t(
              "professionalDashboard.overview.states.errorDescription",
            )}
          />
        </div>
      ) : null}

      {state === "empty" ? (
        <div className="mt-6">
          <OverviewCardMessage
            icon={L.Sparkles}
            title={t(
              "professionalDashboard.overview.recommendationsEmptyTitle",
            )}
            description={t(
              "professionalDashboard.overview.recommendationsEmptyDescription",
            )}
          />
        </div>
      ) : null}

      {state === "content" ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
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
                  disabled={enrollState.isLoading}
                  onClick={() => enrollCourse(course.id)}
                >
                  {t("professionalDashboard.overview.enrollNow")}
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </GlassCard>
  );
};
