"use client";

import { useEnrollContentMutation } from "@/lib/rtk/endpoints/content-interaction.api";
import { getOverviewSectionState } from "@/utils/professional-overview.helper";
import { OverviewCardMessage } from "@modules/ProfessionalDashboard/parts/overview-card";
import { useCoursesQuery } from "@/lib/rtk/endpoints/course.api";
import { ContentType } from "@/lib/graphql/base";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";
import { Button } from "@ui/button";

import ContentCardSkeleton from "@modules/Content/ContentCardSkeleton";
import ContentCard from "@elements/content-card";
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

        <Button asChild variant="outline" radius="xl">
          <Link href="/content">
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
            <ContentCardSkeleton key={index} />
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
            <ContentCard
              key={course.id}
              item={{
                id: course.id,
                href: `/courses/${course.slug}`,
                kind: "course",
                title: course.title,
                status: course.level,
                rating: course.rating,
                imageUrl: course.imageUrl,
                category: course.category,
                categoryCode: course.category,
                description: course.description,
                metaPrimary: t("content.card.professionals", {
                  count: course.professionals,
                }),
                metaSecondary: course.durationMinutes
                  ? t("content.card.minutes", {
                      count: course.durationMinutes,
                    })
                  : null,
              }}
              action={
                <Button
                  radius="lg"
                  className="w-full"
                  disabled={enrollState.isLoading}
                  onClick={() => enrollCourse(course.id)}
                >
                  {t("professionalDashboard.overview.enrollNow")}
                </Button>
              }
            />
          ))}
        </div>
      ) : null}
    </GlassCard>
  );
};
