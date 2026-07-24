"use client";

import { PDU_CATEGORIES, getPduMonthLabel } from "@/utils/pdu.constant";
import { useRouter, useSearchParams } from "next/navigation";
import { usePduEvidenceUpload } from "@/hooks/usePduEvidenceUpload";
import { useDebouncedValue } from "@/hooks/useDebounced";
import { useMemo, useState } from "react";
import { PAGE_SIZE } from "@/utils/constant";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as API from "@/lib/rtk/endpoints/professional.api";
import * as H from "@/utils/learning-activities.helper";
import * as T from "@/types/professional-dashboard.types";

const SEARCH_DEBOUNCE_MS = 350;

export const useProfessionalCpdPduTracker = () => {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentYear = new Date().getFullYear();

  const [initialState] = useState<H.TActivityListState>(() =>
    H.readActivityListState(searchParams, currentYear),
  );

  const [page, setPage] = useState<number>(initialState.page);
  const [cursorStack, setCursorStack] = useState<string[]>(
    initialState.cursorStack,
  );
  const [filters, setFilters] = useState<T.TPduActivityFilters>(
    initialState.filters,
  );
  const [deletingActivityId, setDeletingActivityId] = useState<string | null>(
    null,
  );

  const currentCursor = cursorStack.at(-1);
  const debouncedSearch = useDebouncedValue(filters.search, SEARCH_DEBOUNCE_MS);

  const isFiltered = useMemo(
    () =>
      H.hasActiveActivityFilters(
        { ...filters, search: debouncedSearch },
        currentYear,
      ),
    [filters, debouncedSearch, currentYear],
  );

  const {
    data: report,
    isLoading: isReportLoading,
    isFetching: isReportFetching,
    refetch: refetchReport,
  } = API.useProfessionalPduReportQuery({ year: filters.year });

  const activityFilter = useMemo(
    () => H.buildActivityFilterInput({ filters, search: debouncedSearch }),
    [filters, debouncedSearch],
  );

  const {
    data: activitiesData,
    isLoading: isActivitiesLoading,
    isFetching: isActivitiesFetching,
    refetch: refetchActivities,
  } = API.useProfessionalPduActivitiesQuery({
    filter: activityFilter,
    pagination: { take: PAGE_SIZE, cursor: currentCursor },
  });

  const {
    data: summary,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    refetch: refetchSummary,
  } = API.useProfessionalPduActivitySummaryQuery();

  const [deleteActivity] = API.useDeleteProfessionalPduActivityMutation();
  const { downloadEvidence } = usePduEvidenceUpload();

  const activities = activitiesData?.items ?? [];
  const pageInfo = activitiesData?.pageInfo;

  const categoryRows = useMemo<T.PduCategoryRow[]>(() => {
    return PDU_CATEGORIES.map((category) => {
      const earned = Number(
        report?.byCategory?.find((item) => item.category === category)?.pdus ??
          0,
      );
      const target = Number(
        report?.targets?.find((item) => item.category === category)?.target ??
          0,
      );
      const progress = target > 0 ? (earned / target) * 100 : 0;

      return {
        category,
        earned,
        target,
        progress,
        barValue: Math.min(progress, 100),
        exceededBy: target > 0 && earned > target ? earned - target : 0,
      };
    }).filter((row) => row.earned > 0 || row.target > 0);
  }, [report?.byCategory, report?.targets]);

  const pduOverTime = useMemo(() => {
    return (report?.byMonth ?? []).map((point) => ({
      month: getPduMonthLabel(point.month),
      pdus: Number(point.pdus ?? 0),
    }));
  }, [report?.byMonth]);

  const hasChartData = useMemo(
    () => pduOverTime.some((point) => point.pdus > 0),
    [pduOverTime],
  );

  const yearOptions = useMemo(
    () => H.buildActivityYearOptions(currentYear),
    [currentYear],
  );

  const resetPagination = () => {
    setPage(1);
    setCursorStack([]);
  };

  const handleFilterChange = <K extends keyof T.TPduActivityFilters>(
    key: K,
    value: T.TPduActivityFilters[K],
  ) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
    resetPagination();
  };

  const handleResetFilters = () => {
    setFilters(H.createActivityFilters(currentYear));
    resetPagination();
  };

  const handleNext = () => {
    if (!pageInfo?.hasNextPage || !pageInfo.nextCursor) return;
    setCursorStack((previousStack) => [...previousStack, pageInfo.nextCursor!]);
    setPage((previousPage) => previousPage + 1);
  };

  const handlePrevious = () => {
    setCursorStack((previousStack) => previousStack.slice(0, -1));
    setPage((previousPage) => Math.max(1, previousPage - 1));
  };

  const handleRefresh = () => {
    void refetchReport();
    void refetchActivities();
    void refetchSummary();
  };

  const handleAddActivity = () => {
    router.push("/dashboard/professional?tab=add-activity");
  };

  const handleEditActivity = (activityId: string) => {
    router.push(`/dashboard/professional?tab=add-activity&id=${activityId}`);
  };

  const handleViewActivity = (activityId: string) => {
    router.push(
      H.buildActivityDetailHref(
        activityId,
        { filters, cursorStack, page },
        currentYear,
      ),
    );
  };

  const handleDeleteActivity = async (activityId: string) => {
    if (deletingActivityId) return;
    setDeletingActivityId(activityId);
    try {
      await deleteActivity({ activityId }).unwrap();
      notify.success(
        t("professionalDashboard.cpdPduTracker.activities.deleteSuccess"),
      );
    } catch {
      notify.error(t("authPages.common.genericError"));
    } finally {
      setDeletingActivityId(null);
    }
  };

  const handleDownloadEvidence = async (file: T.TPduEvidenceFile) => {
    try {
      await downloadEvidence(file);
    } catch {
      notify.error(
        t("professionalDashboard.cpdPduTracker.activities.downloadError"),
      );
    }
  };

  return {
    t,
    page,
    report,
    filters,
    summary,
    pageInfo,
    isFiltered,
    activities,
    handleNext,
    yearOptions,
    pduOverTime,
    hasChartData,
    categoryRows,
    handleRefresh,
    activitiesData,
    handlePrevious,
    isSummaryError,
    isReportLoading,
    isSummaryLoading,
    handleAddActivity,
    handleViewActivity,
    handleFilterChange,
    handleResetFilters,
    handleEditActivity,
    deletingActivityId,
    isActivitiesLoading,
    handleDeleteActivity,
    isActivitiesFetching,
    handleDownloadEvidence,
    activityTypeOptions: H.ACTIVITY_TYPE_OPTIONS,
    isRefreshing: isReportFetching || isActivitiesFetching,
    isDeletingActivity: Boolean(deletingActivityId),
  };
};
