"use client";

import { formatNumber, formatPercent } from "@utils/function-helper";
import { fallbackCompliance } from "@utils/landing-public.constant";
import { fallbackFeatures } from "@utils/landing-public.constant";
import { fallbackStats } from "@utils/landing-public.constant";
import { useMemo } from "react";
import { useI18n } from "@hooks/useI18n";

import type { OrganizationOverviewQuery } from "@/lib/graphql/operations/org-dashboard";

export type OrganizationQueryState = {
  data?: OrganizationOverviewQuery["organizationOverview"];
  isFetching: boolean;
};

export const useLandingOrganizationShowcase = (
  overviewQuery: OrganizationQueryState = { isFetching: false },
) => {
  const { t } = useI18n();

  const overview = overviewQuery.data;
  const summary = overview?.summary;
  const distribution = overview?.complianceDistribution;

  const stats = useMemo(() => {
    if (!summary) {
      return fallbackStats.map((item) => ({
        ...item,
        label: t(`landing.organization.stats.${item.key}`),
      }));
    }
    return [
      {
        key: "teamMembers",
        label: t("landing.organization.stats.teamMembers"),
        value: formatNumber(summary.totalMembers),
      },
      {
        key: "cpdCompliant",
        label: t("landing.organization.stats.cpdCompliant"),
        value: formatPercent(summary.averageCompliance),
      },
      {
        key: "avgGrowth",
        label: t("landing.organization.stats.avgGrowth"),
        value: formatPercent(summary.engagementRate),
      },
    ];
  }, [summary, t]);

  const complianceRows = useMemo(() => {
    if (!distribution) {
      return fallbackCompliance.map((item) => ({
        ...item,
        label: t(`landing.organization.compliance.${item.key}`),
      }));
    }
    const total =
      distribution.compliant + distribution.atRisk + distribution.nonCompliant;
    const toPercent = (value: number) => {
      if (!total) return 0;
      return Math.round((value / total) * 100);
    };

    return [
      {
        key: "compliant",
        label: t("landing.organization.compliance.compliant"),
        value: toPercent(distribution.compliant),
      },
      {
        key: "atRisk",
        label: t("landing.organization.compliance.atRisk"),
        value: toPercent(distribution.atRisk),
      },
      {
        key: "nonCompliant",
        label: t("landing.organization.compliance.nonCompliant"),
        value: toPercent(distribution.nonCompliant),
      },
    ];
  }, [distribution, t]);

  const features = useMemo(() => {
    return fallbackFeatures.map((item) => ({
      ...item,
      title: t(`landing.organization.features.${item.key}`),
    }));
  }, [t]);

  const trendingTopics = useMemo(() => {
    const topics = overview?.trendingTopics ?? [];
    if (!topics.length) {
      return [
        {
          title: t("landing.organization.topics.aiRoadmaps"),
          percentage: 76,
        },
        {
          title: t("landing.organization.topics.compliance"),
          percentage: 64,
        },
        {
          title: t("landing.organization.topics.leadership"),
          percentage: 48,
        },
      ];
    }
    return topics.slice(0, 3).map((item) => ({
      title: item.title,
      percentage: Math.round(item.percentage),
    }));
  }, [overview?.trendingTopics, t]);

  return {
    t,
    stats,
    features,
    complianceRows,
    trendingTopics,
    isLoading: overviewQuery.isFetching,
  };
};
