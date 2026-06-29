"use client";

import { useOrganizationOverviewQuery } from "@/lib/rtk/endpoints/org-dashboard.api";
import { CHART_COLORS } from "@utils/constant";
import { useMemo } from "react";
import { useI18n } from "@hooks/useI18n";

export const useOrgOverviewTab = () => {
  const { t } = useI18n();

  const overviewQuery = useOrganizationOverviewQuery();

  const overview = overviewQuery.data;
  const summary = overview?.summary;

  const complianceDistribution = useMemo(() => {
    const data = overview?.complianceDistribution;
    return [
      {
        key: "compliant",
        label: t("organizationDashboard.overview.compliance.compliant"),
        value: data?.compliant ?? 0,
      },
      {
        key: "atRisk",
        label: t("organizationDashboard.overview.compliance.atRisk"),
        value: data?.atRisk ?? 0,
      },
      {
        key: "nonCompliant",
        label: t("organizationDashboard.overview.compliance.nonCompliant"),
        value: data?.nonCompliant ?? 0,
      },
    ];
  }, [overview?.complianceDistribution, t]);

  const totalDistribution = useMemo(() => {
    return complianceDistribution.reduce((sum, item) => sum + item.value, 0);
  }, [complianceDistribution]);

  const complianceChartData = useMemo(() => {
    return complianceDistribution.map((item, index) => {
      const percent =
        totalDistribution > 0 ? (item.value / totalDistribution) * 100 : 0;
      return {
        ...item,
        percent: Math.round(percent),
        color: CHART_COLORS[index % CHART_COLORS.length],
        meta: t("organizationDashboard.overview.compliance.percentOfMembers", {
          value: Math.round(percent),
        }),
      };
    });
  }, [complianceDistribution, totalDistribution, t]);

  const hasComplianceChartData = useMemo(() => {
    return complianceChartData.some((item) => item.value > 0);
  }, [complianceChartData]);

  const attentionMembers = overview?.attentionMembers ?? [];
  const trendingTopics = overview?.trendingTopics ?? [];

  return {
    t,
    summary,
    overview,
    trendingTopics,
    attentionMembers,
    totalDistribution,
    complianceChartData,
    hasComplianceChartData,
    complianceDistribution,
    refetch: overviewQuery.refetch,
    isLoading: overviewQuery.isFetching,
  };
};
