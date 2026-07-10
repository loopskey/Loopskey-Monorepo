"use client";

import { PDU_CATEGORIES, getPduMonthLabel } from "@/utils/pdu.constant";
import { ChangeEvent, useMemo, useState } from "react";
import { usePduEvidenceUpload } from "@/hooks/usePduEvidenceUpload";
import { useDebouncedValue } from "@/hooks/useDebounced";
import { useRouter } from "next/navigation";
import { PAGE_SIZE } from "@/utils/constant";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as API from "@/lib/rtk/endpoints/professional.api";
import * as T from "@/types/professional-dashboard.types";

const EMPTY_FILTERS: T.TPduActivityFilters = {
  search: "",
};

export const useProfessionalCpdPduTracker = () => {
  const { t } = useI18n();
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const [page, setPage] = useState<number>(1);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [filters, setFilters] = useState<T.TPduActivityFilters>(EMPTY_FILTERS);
  const [isTargetDialogOpen, setIsTargetDialogOpen] = useState<boolean>(false);

  const currentCursor = cursorStack.at(-1);
  const debouncedSearch = useDebouncedValue(filters.search, 350);

  const isFiltered = useMemo(
    () => debouncedSearch.trim().length > 0,
    [debouncedSearch],
  );

  const {
    data: report,
    isLoading,
    isFetching,
    refetch,
  } = API.useProfessionalPduReportQuery({ year });

  const activityFilter = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
    }),
    [debouncedSearch],
  );

  const {
    data: activitiesData,
    isLoading: isActivitiesLoading,
    isFetching: isActivitiesFetching,
  } = API.useProfessionalPduActivitiesQuery({
    filter: activityFilter,
    pagination: {
      take: PAGE_SIZE,
      cursor: currentCursor,
    },
  });

  const [upsertTarget, { isLoading: isSavingTarget }] =
    API.useUpsertProfessionalPduTargetMutation();

  const [deleteActivity, { isLoading: isDeletingActivity }] =
    API.useDeleteProfessionalPduActivityMutation();

  const { downloadEvidence } = usePduEvidenceUpload();

  const activities = activitiesData?.items ?? [];
  const pageInfo = activitiesData?.pageInfo;

  const totalTarget = useMemo<number>(() => {
    return (report?.targets ?? []).reduce((sum, target) => {
      return sum + Number(target.target ?? 0);
    }, 0);
  }, [report?.targets]);

  const categoryRows = useMemo<T.PduCategoryRow[]>(() => {
    return PDU_CATEGORIES.map((category) => {
      const earned =
        report?.byCategory?.find((item) => item.category === category)?.pdus ??
        0;
      const target =
        report?.targets?.find((item) => item.category === category)?.target ??
        0;
      const numericEarned = Number(earned);
      const numericTarget = Number(target);
      const progress =
        numericTarget > 0
          ? Math.min((numericEarned / numericTarget) * 100, 100)
          : 0;
      return {
        category,
        progress,
        earned: numericEarned,
        target: numericTarget,
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

  const resetPagination = () => {
    setPage(1);
    setCursorStack([]);
  };

  const handleYearChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (!value) {
      setYear(currentYear);
      return;
    }
    const nextYear = Number(value);
    if (Number.isFinite(nextYear)) setYear(nextYear);
  };

  const handleFilterChange = <K extends keyof T.TPduActivityFilters>(
    key: K,
    value: T.TPduActivityFilters[K],
  ) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
    resetPagination();
  };

  const handleResetFilters = () => {
    setFilters(EMPTY_FILTERS);
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

  const handleAddActivity = () => {
    router.push("/dashboard/professional?tab=add-activity");
  };

  const handleEditActivity = (activityId: string) => {
    router.push(`/dashboard/professional?tab=add-activity&id=${activityId}`);
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await deleteActivity({ activityId }).unwrap();
      notify.success(
        t("professionalDashboard.cpdPduTracker.activities.deleteSuccess"),
      );
    } catch {
      notify.error(t("authPages.common.genericError"));
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

  const handleTargetSubmit = async (input: T.UpsertTargetInput) => {
    await upsertTarget(input).unwrap();
    notify.success(
      t("professionalDashboard.cpdPduTracker.targetsDialog.success"),
    );
    setIsTargetDialogOpen(false);
  };

  const exportCsv = () => {
    const rows: T.CsvCell[][] = [
      ["Year", year],
      ["Total PDUs", report?.totalPdus ?? 0],
      ["Total Target", totalTarget],
      [
        "Progress To Goal",
        `${Number(report?.progressToGoal ?? 0).toFixed(2)}%`,
      ],
      ["Activities", report?.activities ?? 0],
      ["Average / Month", Number(report?.averagePerMonth ?? 0).toFixed(2)],
      [],
      ["Category", "Earned", "Target", "Progress"],
      ...categoryRows.map((item) => [
        item.category,
        item.earned,
        item.target,
        `${item.progress.toFixed(2)}%`,
      ]),
      [],
      [
        "Activity",
        "Type",
        "Date Completed",
        "Credit Type",
        "Credit Value",
        "Category",
        "Reporting Year",
        "Provider",
        "Status",
        "Certificate",
      ],
      ...activities.map((item) => [
        item.title,
        item.source,
        new Date(item.date).toLocaleDateString(),
        item.creditType,
        item.pdus,
        item.category,
        item.reportingYear ?? "",
        item.providerOrganizer ?? "",
        item.completionStatus,
        item.evidenceFiles.length ? "Attached" : "No file",
      ]),
    ];
    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `cpd-pdu-tracker-${year}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return {
    t,
    year,
    page,
    report,
    filters,
    refetch,
    pageInfo,
    isLoading,
    exportCsv,
    isFiltered,
    activities,
    isFetching,
    handleNext,
    totalTarget,
    pduOverTime,
    hasChartData,
    categoryRows,
    activitiesData,
    handlePrevious,
    isSavingTarget,
    handleYearChange,
    handleAddActivity,
    handleTargetSubmit,
    handleResetFilters,
    handleFilterChange,
    isTargetDialogOpen,
    handleEditActivity,
    isDeletingActivity,
    isActivitiesLoading,
    handleDeleteActivity,
    isActivitiesFetching,
    setIsTargetDialogOpen,
    handleDownloadEvidence,
  };
};
