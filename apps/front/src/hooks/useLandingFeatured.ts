"use client";

import { SortDirection, CourseSortField } from "@/lib/graphql/base";
import { LANDING_HUB_POOL_SIZE } from "@/utils/landing-public.constant";
import { LANDING_HUB_VIEW_ALL_HREF } from "@/utils/landing-public.constant";
import { LANDING_HUB_ROW_SIZE } from "@/utils/landing-public.constant";
import { toCourseCardItem } from "@/lib/content-catalog/card-items";
import { pickRecommendedItems } from "@/utils/landing-hub.util";
import { useCallback, useMemo } from "react";
import { useI18n } from "@/hooks/useI18n";

import type { TLandingHubRow } from "@/types/landing-module.types";

import * as CourseApi from "@/lib/rtk/endpoints/course.api";

export const useLandingFeatured = () => {
  const { t, language } = useI18n();

  const featuredQuery = CourseApi.useFeaturedCoursesQuery({
    take: LANDING_HUB_POOL_SIZE,
  });

  const ratedQuery = CourseApi.useCoursesQuery({
    pagination: { take: LANDING_HUB_POOL_SIZE },
    sort: { field: CourseSortField.Rating, direction: SortDirection.Desc },
  });

  const popularQuery = CourseApi.useCoursesQuery({
    pagination: { take: LANDING_HUB_ROW_SIZE },
    sort: {
      field: CourseSortField.Professionals,
      direction: SortDirection.Desc,
    },
  });

  const popularItems = useMemo(
    () =>
      (popularQuery.data?.items ?? []).map((course) =>
        toCourseCardItem(course, t, language),
      ),
    [popularQuery.data, t, language],
  );

  const recommendedItems = useMemo(
    () =>
      pickRecommendedItems(
        [...(featuredQuery.data ?? []), ...(ratedQuery.data?.items ?? [])].map(
          (course) => toCourseCardItem(course, t, language),
        ),
        new Set(popularItems.map((item) => item.id)),
        LANDING_HUB_ROW_SIZE,
      ),
    [featuredQuery.data, ratedQuery.data, popularItems, t, language],
  );

  const refetchRecommended = useCallback(() => {
    void featuredQuery.refetch();
    void ratedQuery.refetch();
  }, [featuredQuery, ratedQuery]);

  const refetchPopular = useCallback(() => {
    void popularQuery.refetch();
  }, [popularQuery]);

  const rows: TLandingHubRow[] = [
    {
      id: "recommended",
      title: t("landing.learningHub.recommended"),
      items: recommendedItems,
      isLoading: featuredQuery.isLoading || ratedQuery.isLoading,
      isError: featuredQuery.isError && ratedQuery.isError,
      refetch: refetchRecommended,
      viewAllHref: LANDING_HUB_VIEW_ALL_HREF,
    },
    {
      id: "popular",
      title: t("landing.learningHub.popular"),
      items: popularItems,
      isLoading: popularQuery.isLoading,
      isError: popularQuery.isError,
      refetch: refetchPopular,
      viewAllHref: LANDING_HUB_VIEW_ALL_HREF,
    },
  ];

  return { t, rows };
};
