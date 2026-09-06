"use client";

import { useSearchParams } from "next/navigation";
import { useI18n } from "@hooks/useI18n";
import { useMemo } from "react";

import * as API from "@lib/rtk/endpoints/association-dashboard.api";
import * as M from "@utils/association-messages";
import * as O from "@utils/association-overview";
import * as R from "@utils/association-reports";

export const useAssociationOverviewTab = () => {
  const { t, language } = useI18n();
  const searchParams = useSearchParams();

  const locale = language === "fr" ? "fr-FR" : "en-GB";

  const filter = useMemo(() => {
    const requested = R.readAssociationReportView(searchParams).filter;
    return R.isCustomPeriodIncomplete(requested)
      ? R.DEFAULT_ASSOCIATION_REPORT_FILTER
      : requested;
  }, [searchParams]);

  const filterInput = useMemo(
    () => R.toAssociationReportFilterInput(filter),
    [filter],
  );

  const profileQuery = API.useAssociationProfileQuery();
  const countsQuery = API.useAssociationOverviewCountsQuery();
  const attentionQuery = API.useAssociationAttentionListsQuery();

  const reportsQuery = API.useAssociationReportsOverviewQuery({
    filter: filterInput,
  });

  const requirementsQuery = API.useAssociationRequirementProgressReportQuery({
    filter: filterInput,
  });

  const activityQuery = API.useAssociationRecentActivityQuery({
    limit: O.OVERVIEW_ACTIVITY_LIMIT,
  });

  const totalMembers = countsQuery.data?.associationMemberStats.totalMembers ?? 0;

  const totalRequirements =
    countsQuery.data?.associationRequirements.totalCount ?? 0;

  const totalLearningContent =
    countsQuery.data?.associationLearningContents.totalCount ?? 0;

  const isNewAssociation =
    countsQuery.isSuccess && totalMembers === 0 && totalRequirements === 0;

  const counts = {
    members: totalMembers,
    requirements: totalRequirements,
    learningContent: totalLearningContent,
  };

  const attentionCounts = attentionQuery.data?.counts ?? null;

  const attentionTotal = M.ATTENTION_SECTIONS.reduce(
    (total, section) => total + O.attentionCountOf(attentionCounts, section),
    0,
  );

  const requirements = requirementsQuery.data ?? [];

  return {
    t,
    locale,
    filter,
    counts,
    requirements,
    attentionCounts,
    attentionTotal,
    isNewAssociation,
    onTrackThreshold: profileQuery.data?.settings?.onTrackThreshold ?? null,
    associationName: profileQuery.data?.name ?? null,
    associationDescription: profileQuery.data?.description ?? null,
    isProfileLoading: profileQuery.isLoading,
    countsPanel: {
      isLoading: countsQuery.isLoading,
      isError: countsQuery.isError,
      retry: () => void countsQuery.refetch(),
    },
    chartsPanel: {
      isLoading: reportsQuery.isLoading,
      isError: reportsQuery.isError,
      retry: () => void reportsQuery.refetch(),
    },
    attentionPanel: {
      isLoading: attentionQuery.isLoading,
      isError: attentionQuery.isError,
      retry: () => void attentionQuery.refetch(),
    },
    requirementsPanel: {
      isLoading: requirementsQuery.isLoading,
      isError: requirementsQuery.isError,
      retry: () => void requirementsQuery.refetch(),
    },
    activityPanel: {
      isLoading: activityQuery.isLoading,
      isError: activityQuery.isError,
      retry: () => void activityQuery.refetch(),
    },
    activity: activityQuery.data ?? [],
    groupCompliance: reportsQuery.data?.associationComplianceByGroup ?? [],
    categoryProgress: reportsQuery.data?.associationProgressByCategory ?? [],
    trend: reportsQuery.data?.associationComplianceTrend ?? [],
  };
};

export type TUseAssociationOverviewTab = ReturnType<
  typeof useAssociationOverviewTab
>;
