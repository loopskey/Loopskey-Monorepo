"use client";

import { useMemo } from "react";

import * as API from "@/lib/rtk/endpoints/admin-dashboard.api";

export const useAdminOverviewTab = () => {
  const overviewQuery = API.useAdminDashboardOverviewQuery();

  const usersQuery = API.useAdminUsersQuery({
    pagination: { take: 6 },
  });

  const auditLogsQuery = API.useAdminAuditLogsQuery({
    pagination: { take: 6 },
  });

  const overview = overviewQuery.data;

  const statusChartData = useMemo(() => {
    if (!overview) return [];
    return [
      {
        label: "Pending",
        count: overview.pendingRequests,
      },
      {
        label: "Approved",
        count: overview.approvedRequests,
      },
      {
        label: "Rejected",
        count: overview.rejectedRequests,
      },
    ];
  }, [overview]);

  const requestTrendData = useMemo(() => {
    return overview?.requestTrend ?? [];
  }, [overview?.requestTrend]);

  const recentUsers = useMemo(() => {
    return usersQuery.data?.items ?? [];
  }, [usersQuery.data?.items]);

  const recentAuditLogs = useMemo(() => {
    return auditLogsQuery.data?.items ?? [];
  }, [auditLogsQuery.data?.items]);

  const refreshAll = () => {
    void overviewQuery.refetch();
    void usersQuery.refetch();
    void auditLogsQuery.refetch();
  };

  return {
    overview,
    refreshAll,
    recentUsers,
    statusChartData,
    recentAuditLogs,
    requestTrendData,
    isLoading:
      usersQuery.isFetching ||
      overviewQuery.isFetching ||
      auditLogsQuery.isFetching,
  };
};
