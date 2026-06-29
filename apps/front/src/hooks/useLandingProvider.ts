"use client";

import { EventStatus, ProviderDashboardRange } from "@/lib/graphql/generated";
import { PromotionRequestStatus } from "@/lib/graphql/generated";
import { useMemo } from "react";
import { useI18n } from "@hooks/useI18n";

import * as API from "@/lib/rtk/endpoints/provider.api";
import * as L from "lucide-react";

const providerBenefits = [
  {
    key: "promoteEvents",
    icon: L.Megaphone,
  },
  {
    key: "reachPeople",
    icon: L.Target,
  },
  {
    key: "analytics",
    icon: L.LineChart,
  },
  {
    key: "growAudience",
    icon: L.Users,
  },
] as const;

const formatCompactNumber = (value?: number | null) => {
  const safeValue = Number(value ?? 0);
  if (!Number.isFinite(safeValue)) return "0";
  if (safeValue >= 1_000_000) return `${(safeValue / 1_000_000).toFixed(1)}M`;
  if (safeValue >= 1_000) return `${(safeValue / 1_000).toFixed(1)}k`;
  return String(Math.round(safeValue));
};

const formatCurrency = (value?: number | null) => {
  const safeValue = Number(value ?? 0);
  if (!Number.isFinite(safeValue)) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(safeValue);
};

const formatPercentage = (value?: number | null) => {
  const safeValue = Number(value ?? 0);
  if (!Number.isFinite(safeValue)) return "0%";
  return `${safeValue.toFixed(1)}%`;
};

const clampPercentage = (value?: number | null) => {
  const safeValue = Number(value ?? 0);
  if (!Number.isFinite(safeValue)) return 0;
  return Math.max(0, Math.min(100, Number(safeValue.toFixed(1))));
};

export const useLandingProviderShowcase = () => {
  const { t } = useI18n();

  const rangeVariables = useMemo(
    () => ({
      input: {
        range: ProviderDashboardRange.Last_30Days,
      },
    }),
    [],
  );

  const eventsVariables = useMemo(
    () => ({
      pagination: {
        take: 50,
      },
    }),
    [],
  );

  const promotionsVariables = useMemo(
    () => ({
      pagination: {
        take: 50,
      },
    }),
    [],
  );

  const overviewQuery = API.useProviderOverviewQuery(rangeVariables);
  const analyticsQuery = API.useProviderAnalyticsQuery(rangeVariables);
  const eventsQuery = API.useProviderEventsTableQuery(eventsVariables);
  const promotionsQuery =
    API.useProviderPromotionRequestsQuery(promotionsVariables);

  const overview = overviewQuery.data;
  const analytics = analyticsQuery.data;

  const events = useMemo(() => {
    return eventsQuery.data?.items ?? [];
  }, [eventsQuery.data?.items]);

  const promotions = useMemo(() => {
    return promotionsQuery.data?.items ?? [];
  }, [promotionsQuery.data?.items]);

  const publishedEvents = useMemo(() => {
    return events.filter((item) => item.status === EventStatus.Published);
  }, [events]);

  const approvedPromotions = useMemo(() => {
    return promotions.filter(
      (item) => item.status === PromotionRequestStatus.Approved,
    );
  }, [promotions]);

  const benefits = useMemo(() => {
    return providerBenefits.map((item) => ({
      ...item,
      title: t(`landing.provider.benefits.${item.key}.title`),
      description: t(`landing.provider.benefits.${item.key}.description`),
    }));
  }, [t]);

  const stats = useMemo(() => {
    return [
      {
        key: "totalEvents",
        label: t("landing.provider.stats.totalEvents"),
        value: formatCompactNumber(overview?.totalEvents ?? events.length),
      },
      {
        key: "totalRegistrations",
        label: t("landing.provider.stats.totalRegistrations"),
        value: formatCompactNumber(overview?.totalRegistrations),
      },
      {
        key: "conversionRate",
        label: t("landing.provider.stats.conversionRate"),
        value: formatPercentage(
          analytics?.conversionRate ?? overview?.conversionRate,
        ),
      },
    ];
  }, [
    t,
    events.length,
    overview?.totalEvents,
    overview?.totalRegistrations,
    overview?.conversionRate,
    analytics?.conversionRate,
  ]);

  const funnel = useMemo(() => {
    const totalEvents = Number(overview?.totalEvents ?? events.length ?? 0);
    const totalViews = Number(overview?.totalViews ?? 0);
    const totalRegistrations = Number(overview?.totalRegistrations ?? 0);
    const publishedRate =
      totalEvents > 0 ? (publishedEvents.length / totalEvents) * 100 : 0;
    const promotedRate =
      events.length > 0 ? (approvedPromotions.length / events.length) * 100 : 0;
    const calculatedConversionRate =
      totalViews > 0 ? (totalRegistrations / totalViews) * 100 : 0;
    return [
      {
        key: "publish",
        label: t("landing.provider.funnel.publish"),
        value: clampPercentage(publishedRate),
      },
      {
        key: "promote",
        label: t("landing.provider.funnel.promote"),
        value: clampPercentage(promotedRate),
      },
      {
        key: "convert",
        label: t("landing.provider.funnel.convert"),
        value: clampPercentage(
          analytics?.conversionRate ??
            overview?.conversionRate ??
            calculatedConversionRate,
        ),
      },
    ];
  }, [
    t,
    events.length,
    overview?.totalViews,
    overview?.totalEvents,
    publishedEvents.length,
    overview?.conversionRate,
    analytics?.conversionRate,
    approvedPromotions.length,
    overview?.totalRegistrations,
  ]);

  const dashboard = useMemo(() => {
    const topEvents = analytics?.topPerformingEvents ?? [];
    const bestEvent = topEvents[0];
    return {
      providerName:
        overview?.providerName ??
        t("landing.provider.dashboard.fallbackProvider"),
      totalRevenue: formatCurrency(analytics?.totalRevenue),
      avgRating: Number((analytics?.avgRating ?? 0).toFixed(1)),
      topEvents,
      bestEventTitle:
        bestEvent?.title ?? t("landing.provider.dashboard.noTopEvent"),
      bestEventRegistrations: bestEvent?.registrations ?? 0,
      bestEventConversionRate: formatPercentage(bestEvent?.conversionRate),
      statusBreakdown: overview?.statusBreakdown,
    };
  }, [
    t,
    analytics?.avgRating,
    overview?.providerName,
    analytics?.totalRevenue,
    overview?.statusBreakdown,
    analytics?.topPerformingEvents,
  ]);

  const isLoading =
    eventsQuery.isFetching ||
    overviewQuery.isFetching ||
    analyticsQuery.isFetching ||
    promotionsQuery.isFetching;

  const hasApiError =
    Boolean(eventsQuery.error) ||
    Boolean(overviewQuery.error) ||
    Boolean(analyticsQuery.error) ||
    Boolean(promotionsQuery.error);

  return {
    t,
    stats,
    funnel,
    events,
    benefits,
    dashboard,
    isLoading,
    promotions,
    eventsQuery,
    hasApiError,
    overviewQuery,
    analyticsQuery,
    promotionsQuery,
  };
};
