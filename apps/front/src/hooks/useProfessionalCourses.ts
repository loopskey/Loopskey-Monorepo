"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { ProfessionalCourse } from "@/types/professional-dashboard.types";
import { TCourseStats } from "@/types/professional-dashboard.types";
import { PAGE_SIZE } from "@/utils/constant";
import { useI18n } from "@/hooks/useI18n";

import * as API from "@/lib/rtk/endpoints/professional.api";
import * as GQL from "@/lib/graphql/generated";

const FALLBACK_CURRENCY = "USD";

export const useProfessionalCourses = () => {
  const { t } = useI18n();

  // ================= States ==============
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [cursorStack, setCursorStack] = useState<string[]>([]);

  const currentCursor = cursorStack.at(-1);

  // ================ Use Memo ===============
  const variables = useMemo<GQL.ProfessionalMyCoursesQueryVariables>(
    () => ({
      filter: {
        search: search.trim() || undefined,
      },
      pagination: {
        take: PAGE_SIZE,
        cursor: currentCursor,
      },
    }),
    [search, currentCursor],
  );

  const { data, isLoading, isFetching, refetch } =
    API.useProfessionalMyCoursesQuery(variables);

  const courses = useMemo<ProfessionalCourse[]>(() => {
    return data?.items ?? [];
  }, [data?.items]);

  const pageInfo = data?.pageInfo;

  const stats = useMemo<TCourseStats>(() => {
    const total = data?.totalCount ?? 0;
    const active = courses.filter((course) => {
      return course.status === GQL.ContentEnrollmentStatus.Active;
    }).length;
    const completed = courses.filter((course) => {
      return course.status === GQL.ContentEnrollmentStatus.Completed;
    }).length;
    const avgProgress =
      courses.length > 0
        ? Math.round(
            courses.reduce((sum, course) => {
              return sum + Number(course.progress ?? 0);
            }, 0) / courses.length,
          )
        : 0;
    return {
      total,
      active,
      completed,
      avgProgress,
    };
  }, [courses, data?.totalCount]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    setCursorStack([]);
  };

  const handleSearchInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    handleSearchChange(event.target.value);
  };

  const handleNext = () => {
    if (!pageInfo?.hasNextPage || !pageInfo.nextCursor) return;
    setCursorStack((previousStack) => [...previousStack, pageInfo.nextCursor!]);
    setPage((previousPage) => previousPage + 1);
  };

  const handlePrevious = () => {
    setCursorStack((previousStack) => previousStack.slice(0, -1));
    setPage((previousPage) => {
      return Math.max(1, previousPage - 1);
    });
  };

  const formatDate = (date?: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString();
  };

  const formatDuration = (minutes?: number | null) => {
    const value = Number(minutes ?? 0);
    if (!value) return "—";
    if (value < 60) return `${value} min`;
    const hours = Math.floor(value / 60);
    const remainingMinutes = value % 60;
    if (!remainingMinutes) return `${hours}h`;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatPrice = (
    price?: number | null,
    currency?: string | null,
    isFree?: boolean | null,
  ) => {
    if (isFree) return t("professionalDashboard.courses.free");
    if (price == null) return "—";
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || FALLBACK_CURRENCY,
    }).format(Number(price));
  };

  const getCourseTitle = (course: ProfessionalCourse) => {
    return (
      course.courseTitle ||
      t("professionalDashboard.courses.courseFallback", {
        id: course.contentId,
      })
    );
  };

  const getCourseHref = (course: ProfessionalCourse) => {
    if (course.courseSlug) return `/courses/${course.courseSlug}`;
    return `/courses/${course.contentId}`;
  };

  const getCourseActionLabel = (course: ProfessionalCourse) => {
    if (course.status === GQL.ContentEnrollmentStatus.Completed)
      return t("professionalDashboard.courses.review");
    return t("professionalDashboard.courses.continue");
  };

  const getProgressValue = (progress?: number | null) => {
    return Math.min(Math.max(Number(progress ?? 0), 0), 100);
  };

  return {
    t,
    data,
    page,
    stats,
    search,
    courses,
    refetch,
    pageInfo,
    isLoading,
    formatDate,
    isFetching,
    handleNext,
    formatPrice,
    getCourseHref,
    formatDuration,
    handlePrevious,
    getCourseTitle,
    getProgressValue,
    handleSearchChange,
    getCourseActionLabel,
    handleSearchInputChange,
  };
};
