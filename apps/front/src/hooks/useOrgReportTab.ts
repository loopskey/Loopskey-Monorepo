"use client";

import { ALL_DEPARTMENTS, CHART_COLORS } from "@/utils/constant";
import { reportFilterSchema } from "@/lib/validations/org-dashboard.schema";
import { useMemo, useState } from "react";
import { TReportFilterForm } from "@/lib/validations/org-dashboard.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as TAPI from "@/lib/graphql/generated";
import * as API from "@/lib/rtk/endpoints/org-dashboard.api";

export const useOrgReportsTab = () => {
  const { t } = useI18n();

  const [memberSearch, setMemberSearch] = useState("");
  const [cursorStack, setCursorStack] = useState<string[]>([]);

  const cursor = cursorStack.at(-1);

  const form = useForm<TReportFilterForm>({
    resolver: zodResolver(reportFilterSchema),
    defaultValues: {
      endDate: "",
      startDate: "",
      departmentId: ALL_DEPARTMENTS,
      range: TAPI.OrganizationReportRangeEnum.CurrentYear,
    },
  });

  const range = form.watch("range");
  const departmentId = form.watch("departmentId");
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const departmentsQuery = API.useOrganizationDepartmentsQuery();

  const reportVariables = useMemo<TAPI.OrganizationReportsQueryVariables>(
    () => ({
      filter: {
        range,
        startDate:
          range === TAPI.OrganizationReportRangeEnum.Custom
            ? startDate || undefined
            : undefined,
        endDate:
          range === TAPI.OrganizationReportRangeEnum.Custom
            ? endDate || undefined
            : undefined,
        departmentId:
          departmentId === ALL_DEPARTMENTS ? undefined : departmentId,
      },
    }),
    [range, startDate, endDate, departmentId],
  );

  const topMembersVariables =
    useMemo<TAPI.OrganizationReportTopMembersQueryVariables>(
      () => ({
        filter: {
          search: memberSearch.trim() || undefined,
          startDate:
            range === TAPI.OrganizationReportRangeEnum.Custom
              ? startDate || undefined
              : undefined,
          endDate:
            range === TAPI.OrganizationReportRangeEnum.Custom
              ? endDate || undefined
              : undefined,
          departmentId:
            departmentId === ALL_DEPARTMENTS ? undefined : departmentId,
        },
        pagination: {
          take: 10,
          cursor,
        },
      }),
      [memberSearch, range, startDate, endDate, departmentId, cursor],
    );

  const reportQuery = API.useOrganizationReportsQuery(reportVariables);
  const topMembersQuery =
    API.useOrganizationReportTopMembersQuery(topMembersVariables);

  const report = reportQuery.data;
  const summary = report?.summary;

  const departments = useMemo(() => {
    return departmentsQuery.data ?? [];
  }, [departmentsQuery.data]);

  const topMembers = useMemo(() => {
    return topMembersQuery.data?.items ?? [];
  }, [topMembersQuery.data?.items]);

  const departmentOptions = useMemo(
    () => [
      {
        value: ALL_DEPARTMENTS,
        label: t("organizationDashboard.reports.filters.allDepartments"),
      },
      ...departments.map((department) => ({
        value: department.id,
        label: department.title,
      })),
    ],
    [departments, t],
  );

  const complianceTrendData = useMemo(() => {
    return report?.complianceTrend ?? [];
  }, [report?.complianceTrend]);

  const departmentComplianceChartData = useMemo(() => {
    return (report?.departmentCompliance ?? []).map((item, index) => ({
      ...item,
      color: CHART_COLORS[index % CHART_COLORS.length],
      complianceRounded: Number(item.compliance ?? 0).toFixed(2),
      averagePdusRounded: Number(item.averagePdus ?? 0).toFixed(2),
      totalPdusRounded: Number(item.totalPdus ?? 0).toFixed(2),
    }));
  }, [report?.departmentCompliance]);

  const hasDepartmentComplianceData = useMemo(() => {
    return departmentComplianceChartData.some(
      (item) =>
        Number(item.compliance ?? 0) > 0 || Number(item.teamSize ?? 0) > 0,
    );
  }, [departmentComplianceChartData]);

  const nextPage = () => {
    const nextCursor = topMembersQuery.data?.pageInfo?.nextCursor;
    if (nextCursor) setCursorStack((prev) => [...prev, nextCursor]);
  };
  const previousPage = () => setCursorStack((prev) => prev.slice(0, -1));
  const resetPagination = () => setCursorStack([]);
  const updateMemberSearch = (value: string) => {
    setMemberSearch(value);
    resetPagination();
  };

  const exportExcel = () => {
    const rows = topMembers.map((member) => ({
      PDUs: member.pdus,
      Email: member.email ?? "-",
      Name: member.fullName ?? "-",
      Completed: member.completedLearning,
      Department: member.departmentTitle ?? "-",
      Compliance: `${Math.round(member.compliance)}%`,
    }));
    const csv = [
      Object.keys(rows[0] ?? {}).join(","),
      ...rows.map((row) =>
        Object.values(row)
          .map((value) => `"${String(value).replaceAll('"', '""')}"`)
          .join(","),
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "organization-report.csv";
    link.click();
    URL.revokeObjectURL(url);
    notify.success(t("organizationDashboard.reports.messages.exported"));
  };

  const exportPdf = () => window.print();

  return {
    t,
    form,
    range,
    report,
    summary,
    nextPage,
    exportPdf,
    topMembers,
    exportExcel,
    memberSearch,
    previousPage,
    resetPagination,
    departmentOptions,
    complianceTrendData,
    chartColors: CHART_COLORS,
    hasDepartmentComplianceData,
    page: cursorStack.length + 1,
    departmentComplianceChartData,
    setMemberSearch: updateMemberSearch,
    canPrevious: cursorStack.length > 0,
    totalCount: topMembersQuery.data?.totalCount ?? 0,
    hasNextPage: Boolean(topMembersQuery.data?.pageInfo?.hasNextPage),
    isLoading:
      reportQuery.isFetching ||
      topMembersQuery.isFetching ||
      departmentsQuery.isFetching,
  };
};
