"use client";

import { ChangeEvent, useMemo, useState } from "react";
import { PDU_CATEGORIES } from "@modules/ProfessionalDashboard/parts/target-form";
import { PAGE_SIZE } from "@/utils/constant";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as API from "@/lib/rtk/endpoints/professional.api";
import * as T from "@/types/professional-dashboard.types";

export const useProfessionalPduReport = () => {
  const { t } = useI18n();

  const currentYear = new Date().getFullYear();

  const [year, setYear] = useState<number>(currentYear);
  const [search, setSearch] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [isLogDialogOpen, setIsLogDialogOpen] = useState<boolean>(false);
  const [isTargetDialogOpen, setIsTargetDialogOpen] = useState<boolean>(false);

  const currentCursor = cursorStack.at(-1);

  const {
    data: report,
    isLoading,
    isFetching,
    refetch,
  } = API.useProfessionalPduReportQuery({ year });

  const {
    data: activitiesData,
    isLoading: isActivitiesLoading,
    isFetching: isActivitiesFetching,
  } = API.useProfessionalPduActivitiesQuery({
    filter: {
      search: search.trim() || undefined,
    },
    pagination: {
      take: PAGE_SIZE,
      cursor: currentCursor,
    },
  });

  const [createActivity, { isLoading: isCreatingActivity }] =
    API.useCreateProfessionalPduActivityMutation();

  const [upsertTarget, { isLoading: isSavingTarget }] =
    API.useUpsertProfessionalPduTargetMutation();

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
    });
  }, [report?.byCategory, report?.targets]);

  const handleYearChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (!value) {
      setYear(currentYear);
      return;
    }
    const nextYear = Number(value);
    if (Number.isFinite(nextYear)) setYear(nextYear);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    setCursorStack([]);
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

  const handleActivitySubmit = async (input: T.CreateActivityInput) => {
    await createActivity(input).unwrap();
    notify.success(t("professionalDashboard.pduReport.activityDialog.success"));
    setIsLogDialogOpen(false);
  };

  const handleTargetSubmit = async (input: T.UpsertTargetInput) => {
    await upsertTarget(input).unwrap();
    notify.success(t("professionalDashboard.pduReport.targetsDialog.success"));
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
      ["Activity", "Date", "Category", "Source", "Status", "PDUs"],
      ...activities.map((item) => [
        item.title,
        new Date(item.date).toLocaleDateString(),
        item.category,
        item.source,
        item.status,
        item.pdus,
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
    anchor.download = `professional-pdu-report-${year}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return {
    t,
    year,
    page,
    search,
    report,
    refetch,
    pageInfo,
    isLoading,
    exportCsv,
    activities,
    isFetching,
    handleNext,
    totalTarget,
    categoryRows,
    handlePrevious,
    isSavingTarget,
    activitiesData,
    isLogDialogOpen,
    handleYearChange,
    isCreatingActivity,
    handleTargetSubmit,
    isTargetDialogOpen,
    handleSearchChange,
    isActivitiesLoading,
    setIsLogDialogOpen,
    handleActivitySubmit,
    isActivitiesFetching,
    setIsTargetDialogOpen,
  };
};
