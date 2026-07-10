"use client";

import { useEnrollContentMutation } from "@/lib/rtk/endpoints/content-interaction.api";
import { getPduMonthLabel } from "@/utils/pdu.constant";
import { useCoursesQuery } from "@/lib/rtk/endpoints/course.api";
import { CHART_COLORS } from "@/utils/constant";
import { ContentType } from "@/lib/graphql/generated";
import { useMemo } from "react";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as API from "@/lib/rtk/endpoints/professional.api";

export const useProfessionalOverviewTab = () => {
  const { t } = useI18n();
  const currentYear = new Date().getFullYear();

  //   ============= API Hooks ===============
  const overviewQuery = API.useProfessionalOverviewQuery();

  const pduReportQuery = API.useProfessionalPduReportQuery({
    year: currentYear,
  });

  const calendarEventsQuery = API.useProfessionalCalendarEventsQuery({
    pagination: { take: 6 },
  });

  const myCalendarQuery = API.useMyCalendarEntriesQuery();

  const myCoursesQuery = API.useProfessionalMyCoursesQuery({
    pagination: { take: 8 },
  });

  const recommendedCoursesQuery = useCoursesQuery({
    pagination: { take: 10 },
  });

  const [enrollContent, enrollState] = useEnrollContentMutation();

  const overview = overviewQuery.data;
  const pduReport = pduReportQuery.data;
  const calendarEvents = calendarEventsQuery.data;
  const manualCalendarEvents = myCalendarQuery.data;
  const myCourses = myCoursesQuery.data;
  const recommendedCourses = recommendedCoursesQuery.data;

  const upcomingEvents = useMemo(() => {
    const fromRegistrations = (calendarEvents?.items ?? [])
      .filter((item) => item.isUpcoming && item.event)
      .map((item) => ({
        id: `registration:${item.id}`,
        title: item.event?.title ?? item.eventId,
        date: item.event?.startDate ?? item.createdAt,
        source: "registration" as const,
        contentType: "EVENT" as const,
      }));

    const fromManual = (manualCalendarEvents ?? [])
      .filter((item) => item.isUpcoming)
      .map((item) => ({
        id: `manual:${item.id}`,
        title: item.title,
        date: item.startDate,
        source: "manual" as const,
        contentType: (item.contentType ?? null) as ContentType | null,
      }));

    return [...fromRegistrations, ...fromManual].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  }, [calendarEvents?.items, manualCalendarEvents]);

  // ================= Use Memo =================
  const pduOverTime = useMemo(() => {
    return (pduReport?.byMonth ?? []).map((point) => ({
      month: getPduMonthLabel(point.month),
      pdus: Number(point.pdus ?? 0),
    }));
  }, [pduReport?.byMonth]);

  const hasPduOverTimeData = useMemo(
    () => pduOverTime.some((point) => point.pdus > 0),
    [pduOverTime],
  );

  const pduByCategory = useMemo(() => {
    return (pduReport?.byCategory ?? []).map((item, index) => ({
      category: item.category,
      pdus: Number(item.pdus ?? 0),
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [pduReport?.byCategory]);

  const goalProgress = Math.round(overview?.yearlyPduGoalProgress ?? 0);

  const goalChartData = useMemo(
    () => [
      {
        name: "earned",
        value: Math.min(goalProgress, 100),
        fill: "#2563eb",
      },
      {
        name: "remaining",
        value: Math.max(100 - goalProgress, 0),
        fill: "#e5e7eb",
      },
    ],
    [goalProgress],
  );

  const activeCourses = useMemo(() => {
    return (myCourses?.items ?? []).filter(
      (course) => course.status === "ACTIVE",
    );
  }, [myCourses?.items]);

  const isLoading =
    overviewQuery.isFetching ||
    pduReportQuery.isFetching ||
    myCoursesQuery.isFetching ||
    calendarEventsQuery.isFetching ||
    myCalendarQuery.isFetching ||
    recommendedCoursesQuery.isFetching;

  const refreshAll = () => {
    void overviewQuery.refetch();
    void pduReportQuery.refetch();
    void calendarEventsQuery.refetch();
    void myCalendarQuery.refetch();
    void myCoursesQuery.refetch();
    void recommendedCoursesQuery.refetch();
  };

  const enrollCourse = async (courseId: string) => {
    try {
      await enrollContent({
        contentId: courseId,
        contentType: ContentType.Course,
      }).unwrap();
      notify.success(t("professionalDashboard.overview.enrolled"));
      void myCoursesQuery.refetch();
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };
  return {
    overview,
    pduReport,
    myCourses,
    isLoading,
    refreshAll,
    pduOverTime,
    goalProgress,
    enrollCourse,
    goalChartData,
    pduByCategory,
    activeCourses,
    calendarEvents,
    upcomingEvents,
    recommendedCourses,
    hasPduOverTimeData,
    isEnrolling: enrollState.isLoading,
  };
};
