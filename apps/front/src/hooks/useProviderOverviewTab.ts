"use client";

import { ProviderDashboardRange } from "@/lib/graphql/generated";
import { useMemo, useState } from "react";

import * as API from "@/lib/rtk/endpoints/provider.api";

export const useProviderOverviewTab = () => {
  const [range, setRange] = useState<ProviderDashboardRange>(
    ProviderDashboardRange.Last_30Days,
  );

  const overviewQuery = API.useProviderOverviewQuery({ input: { range } });
  const analyticsQuery = API.useProviderAnalyticsQuery({ input: { range } });
  const eventsQuery = API.useProviderEventsTableQuery({
    pagination: { take: 6 },
  });

  const overview = overviewQuery.data;
  const analytics = analyticsQuery.data;

  const events = useMemo(
    () => eventsQuery.data?.items ?? [],
    [eventsQuery.data?.items],
  );

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return events
      .filter((event) => new Date(event.startDate) >= now)
      .slice(0, 4);
  }, [events]);

  const performanceChartData = useMemo(
    () => analytics?.registrationsOverTime ?? [],
    [analytics?.registrationsOverTime],
  );

  const topEvents = useMemo(
    () => analytics?.topPerformingEvents ?? [],
    [analytics?.topPerformingEvents],
  );

  const refreshAll = () => {
    void overviewQuery.refetch();
    void analyticsQuery.refetch();
    void eventsQuery.refetch();
  };

  return {
    range,
    events,
    setRange,
    overview,
    analytics,
    topEvents,
    refreshAll,
    upcomingEvents,
    performanceChartData,
    isLoading:
      overviewQuery.isFetching ||
      analyticsQuery.isFetching ||
      eventsQuery.isFetching,
  };
};
