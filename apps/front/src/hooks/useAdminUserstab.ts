"use client";

import { useMemo, useRef, useState } from "react";
import { Role, UserStatus } from "@/lib/graphql/generated";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as API from "@/lib/rtk/endpoints/admin-dashboard.api";

type TGrowthMode = "DAILY" | "MONTHLY";

export const useAdminUsersTab = () => {
  const { t } = useI18n();

  const chartRef = useRef<HTMLDivElement | null>(null);

  const [growthMode, setGrowthMode] = useState<TGrowthMode>("MONTHLY");

  const [userSearch, setUserSearch] = useState("");
  const [userRole, setUserRole] = useState<Role | "ALL">("ALL");
  const [userStatus, setUserStatus] = useState<UserStatus | "ALL">("ALL");
  const [premiumOnly, setPremiumOnly] = useState(false);
  const [userCursorStack, setUserCursorStack] = useState<string[]>([]);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditCursorStack, setAuditCursorStack] = useState<string[]>([]);

  const userCursor = userCursorStack.at(-1);
  const auditCursor = auditCursorStack.at(-1);

  const userVariables = useMemo(
    () => ({
      filter: {
        search: userSearch.trim() || undefined,
        role: userRole === "ALL" ? undefined : userRole,
        status: userStatus === "ALL" ? undefined : userStatus,
        premiumOnly: premiumOnly || undefined,
      },
      pagination: {
        take: 10,
        cursor: userCursor,
      },
    }),
    [userSearch, userRole, userStatus, premiumOnly, userCursor],
  );

  const auditVariables = useMemo(
    () => ({
      filter: {
        search: auditSearch.trim() || undefined,
      },
      pagination: {
        take: 10,
        cursor: auditCursor,
      },
    }),
    [auditSearch, auditCursor],
  );

  const usersQuery = API.useAdminUsersQuery(userVariables);
  const growthQuery = API.useAdminUserGrowthQuery({ mode: growthMode });
  const auditQuery = API.useAdminAuditLogsQuery(auditVariables);

  const [updateUserStatus, updateStatusState] =
    API.useUpdateAdminUserStatusMutation();

  const users = useMemo(() => usersQuery.data?.items ?? [], [usersQuery.data]);
  const auditLogs = useMemo(
    () => auditQuery.data?.items ?? [],
    [auditQuery.data],
  );
  const growth = useMemo(() => growthQuery.data ?? [], [growthQuery.data]);

  const stats = useMemo(() => {
    return {
      total: usersQuery.data?.totalCount ?? 0,
      providers: users.filter((item) => item.role === Role.Provider).length,
      professionals: users.filter((item) => item.role === Role.Professional)
        .length,
      premiumProviders: users.filter(
        (item) => item.role === Role.Provider && item.isPremium,
      ).length,
    };
  }, [users, usersQuery.data?.totalCount]);

  const changeUserStatus = async (userId: string, status: UserStatus) => {
    try {
      await updateUserStatus({ userId, status }).unwrap();
      notify.success(t("adminDashboard.users.messages.statusUpdated"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const nextUsersPage = () => {
    const nextCursor = usersQuery.data?.pageInfo?.nextCursor;
    if (nextCursor) setUserCursorStack((prev) => [...prev, nextCursor]);
  };

  const previousUsersPage = () => {
    setUserCursorStack((prev) => prev.slice(0, -1));
  };

  const nextAuditPage = () => {
    const nextCursor = auditQuery.data?.pageInfo?.nextCursor;
    if (nextCursor) setAuditCursorStack((prev) => [...prev, nextCursor]);
  };

  const previousAuditPage = () => {
    setAuditCursorStack((prev) => prev.slice(0, -1));
  };

  const exportGrowthPng = async () => {
    const htmlToImage = await import("html-to-image");
    if (!chartRef.current) return;
    const dataUrl = await htmlToImage.toPng(chartRef.current, {
      pixelRatio: 2,
      backgroundColor: "white",
    });
    const link = document.createElement("a");
    link.download = `user-growth-${growthMode.toLowerCase()}.png`;
    link.href = dataUrl;
    link.click();
  };

  const refreshAll = () => {
    void usersQuery.refetch();
    void growthQuery.refetch();
    void auditQuery.refetch();
  };

  return {
    t,
    users,
    stats,
    growth,
    chartRef,
    userRole,
    auditLogs,
    userSearch,
    userStatus,
    refreshAll,
    growthMode,
    auditSearch,
    premiumOnly,
    setUserRole,
    setUserSearch,
    setUserStatus,
    setGrowthMode,
    nextAuditPage,
    nextUsersPage,
    setAuditSearch,
    setPremiumOnly,
    exportGrowthPng,
    changeUserStatus,
    previousUsersPage,
    previousAuditPage,
    usersPage: userCursorStack.length + 1,
    auditPage: auditCursorStack.length + 1,
    canPreviousUsers: userCursorStack.length > 0,
    canPreviousAudit: auditCursorStack.length > 0,
    usersTotalCount: usersQuery.data?.totalCount ?? 0,
    auditTotalCount: auditQuery.data?.totalCount ?? 0,
    hasNextUsersPage: Boolean(usersQuery.data?.pageInfo?.hasNextPage),
    hasNextAuditPage: Boolean(auditQuery.data?.pageInfo?.hasNextPage),
    isLoading:
      usersQuery.isFetching ||
      growthQuery.isFetching ||
      auditQuery.isFetching ||
      updateStatusState.isLoading,
  };
};
