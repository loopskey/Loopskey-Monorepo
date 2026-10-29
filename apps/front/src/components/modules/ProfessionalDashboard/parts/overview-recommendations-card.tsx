"use client";

import { getOverviewSectionState } from "@/utils/professional-overview.helper";
import { OverviewCardMessage } from "@modules/ProfessionalDashboard/parts/overview-card";
import { useCoursesQuery } from "@/lib/rtk/endpoints/course.api";
import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";
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

  const courses = recommendationsQuery.data?.items ?? [];
  const state = getOverviewSectionState({
    isLoading: recommendationsQuery.isLoading,
    isError: recommendationsQuery.isError,
    isEmpty: courses.length === 0,
  });

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
          className="mt-6 grid gap-x-6 gap-y-8 md:grid-cols-2 xl:grid-cols-3"
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
        <div className="mt-6 grid gap-x-6 gap-y-8 md:grid-cols-2 xl:grid-cols-3">
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
                categoryKey: course.category,
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
            />
          ))}
        </div>
      ) : null}
    </GlassCard>
  );
};
