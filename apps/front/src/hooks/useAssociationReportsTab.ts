"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { AssociationRequirementStatus } from "@/lib/graphql/base";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@hooks/useI18n";

import * as API from "@lib/rtk/endpoints/association-dashboard.api";
import * as R from "@utils/association-reports";

const SCROLL_KEY_PREFIX = "association-reports-scroll:";

const REQUIREMENT_OPTION_LIMIT = 100;

export const useAssociationReportsTab = () => {
  const { t, language } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const locale = language === "fr" ? "fr-FR" : "en-GB";

  const view = useMemo(
    () => R.readAssociationReportView(searchParams),
    [searchParams],
  );

  const { report, filter, band, sort, direction, page } = view;

  const isRangeIncomplete = R.isCustomPeriodIncomplete(filter);

  const filterInput = useMemo(
    () => R.toAssociationReportFilterInput(filter),
    [filter],
  );

  const overviewQuery = API.useAssociationReportsOverviewQuery(
    { filter: filterInput },
    { skip: isRangeIncomplete },
  );

  const requirementsQuery = API.useAssociationRequirementOptionsQuery({
    pagination: { take: REQUIREMENT_OPTION_LIMIT },
  });

  const groupsQuery = API.useAssociationGroupsQuery();
  const profileQuery = API.useAssociationProfileQuery();

  const memberProgressQuery = API.useAssociationMemberProgressReportQuery(
    { filter: filterInput, pagination: { take: R.REPORT_FETCH_LIMIT } },
    { skip: isRangeIncomplete || report !== "member-progress" },
  );

  const groupProgressQuery = API.useAssociationGroupProgressReportQuery(
    { filter: filterInput },
    { skip: isRangeIncomplete || report !== "group-progress" },
  );

  const categoryCompletionQuery =
    API.useAssociationCategoryCompletionReportQuery(
      { filter: filterInput },
      { skip: isRangeIncomplete || report !== "category-completion" },
    );

  const missingEvidenceQuery = API.useAssociationMissingEvidenceReportQuery(
    { filter: filterInput, pagination: { take: R.REPORT_FETCH_LIMIT } },
    { skip: isRangeIncomplete || report !== "missing-evidence" },
  );

  const renewalReadinessQuery = API.useAssociationRenewalReadinessReportQuery(
    { filter: filterInput, pagination: { take: R.REPORT_FETCH_LIMIT } },
    { skip: isRangeIncomplete || report !== "renewal-readiness" },
  );

  const reportQueries = {
    "member-progress": memberProgressQuery,
    "group-progress": groupProgressQuery,
    "category-completion": categoryCompletionQuery,
    "missing-evidence": missingEvidenceQuery,
    "renewal-readiness": renewalReadinessQuery,
    "overview-summary": overviewQuery,
  };

  const reportQuery = report ? reportQueries[report] : overviewQuery;

  const requirements = useMemo(
    () =>
      (requirementsQuery.data?.items ?? []).filter(
        (requirement) =>
          requirement.status === AssociationRequirementStatus.Published,
      ),
    [requirementsQuery.data?.items],
  );

  const groupOptions = useMemo(
    () =>
      (groupsQuery.data ?? [])
        .filter((group) => group.isActive)
        .map((group) => ({ value: group.id, label: group.title })),
    [groupsQuery.data],
  );

  const requirementOptions = useMemo(
    () =>
      requirements.map((requirement) => ({
        value: requirement.id,
        label: requirement.name,
      })),
    [requirements],
  );

  const summary = overviewQuery.data?.associationReportSummary ?? null;
  const distribution =
    overviewQuery.data?.associationMemberDistribution ?? null;
  const groupCompliance =
    overviewQuery.data?.associationComplianceByGroup ?? [];
  const categoryProgress =
    overviewQuery.data?.associationProgressByCategory ?? [];
  const trend = overviewQuery.data?.associationComplianceTrend ?? [];

  const onTrackThreshold =
    profileQuery.data?.settings?.onTrackThreshold ?? null;

  const isStaleComputedAt = summary
    ? R.isComputedAtStale(summary.computedAt ?? null, Date.now())
    : false;

  const hasNoRequirements =
    requirementsQuery.isSuccess && requirements.length === 0;

  const scrollKey = SCROLL_KEY_PREFIX + R.associationReportHref(view);

  const restoredKey = useRef<string | null>(null);

  const isReportSettled = !reportQuery.isLoading && !reportQuery.isFetching;

  useEffect(() => {
    if (!isReportSettled) return;
    if (restoredKey.current === scrollKey) return;

    let stored: string | null = null;

    try {
      stored = window.sessionStorage.getItem(scrollKey);
      if (stored) window.sessionStorage.removeItem(scrollKey);
    } catch {
      stored = null;
    }

    if (!stored) return;

    restoredKey.current = scrollKey;
    window.scrollTo({ top: Number(stored) || 0, behavior: "auto" });
  }, [isReportSettled, scrollKey]);

  const goTo = useCallback(
    (next: Partial<R.TAssociationReportView>) =>
      router.push(R.associationReportHref({ ...view, page: 1, ...next })),
    [router, view],
  );

  const setFilter = (patch: Partial<R.TAssociationReportFilter>) =>
    goTo({ filter: { ...filter, ...patch } });

  const resetFilter = () =>
    goTo({ filter: R.DEFAULT_ASSOCIATION_REPORT_FILTER });

  const openReport = (
    key: R.TAssociationReportKey,
    patch: Partial<R.TAssociationReportView> = {},
  ) =>
    goTo({
      report: key,
      band: R.ALL_FILTER_VALUE,
      sort: "",
      direction: "desc",
      ...patch,
    });

  const closeReport = () =>
    goTo({ report: null, band: R.ALL_FILTER_VALUE, sort: "" });

  const setBand = (next: string) => goTo({ band: next });

  const toggleSort = (column: string) =>
    goTo({
      sort: column,
      direction: sort === column && direction === "desc" ? "asc" : "desc",
    });

  const setPage = (next: number) =>
    router.push(R.associationReportHref({ ...view, page: next }));

  const openMember = (memberId: string) => {
    try {
      window.sessionStorage.setItem(scrollKey, String(window.scrollY));
    } catch {
      restoredKey.current = scrollKey;
    }

    router.push(`/dashboard/association?tab=members&memberId=${memberId}`);
  };

  const orderAndPage = useCallback(
    <TRow>(
      rows: readonly TRow[],
      readers: Record<string, (row: TRow) => number | string | null>,
    ) => {
      const read = readers[sort];
      const ordered = read ? R.compareBy(rows, read, direction) : [...rows];

      return {
        total: rows.length,
        pages: R.pageCount(rows.length),
        rows: R.pageOf(ordered, page),
      };
    },
    [direction, page, sort],
  );

  const retry = () => {
    void overviewQuery.refetch();
    if (reportQuery !== overviewQuery) void reportQuery.refetch();
  };

  return {
    t,
    band,
    page,
    sort,
    trend,
    retry,
    filter,
    locale,
    report,
    setBand,
    setPage,
    summary,
    direction,
    setFilter,
    openMember,
    openReport,
    filterInput,
    toggleSort,
    closeReport,
    resetFilter,
    groupOptions,
    orderAndPage,
    distribution,
    onTrackThreshold,
    groupCompliance,
    categoryProgress,
    hasNoRequirements,
    isStaleComputedAt,
    isRangeIncomplete,
    requirementOptions,
    isError: overviewQuery.isError || reportQuery.isError,
    isLoading: overviewQuery.isLoading,
    isRefetching: overviewQuery.isFetching && !overviewQuery.isLoading,
    isReportLoading: !isReportSettled,
    memberProgress: memberProgressQuery.data ?? null,
    groupProgress: groupProgressQuery.data ?? [],
    categoryCompletion: categoryCompletionQuery.data ?? [],
    missingEvidence: missingEvidenceQuery.data ?? null,
    renewalReadiness: renewalReadinessQuery.data ?? null,
  };
};

export type TUseAssociationReportsTab = ReturnType<
  typeof useAssociationReportsTab
>;
