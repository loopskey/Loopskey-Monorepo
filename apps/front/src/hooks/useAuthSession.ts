"use client";

import { useCurrentUserQuery } from "@/lib/rtk/endpoints/auth.api";
import { useMemo } from "react";
import { Role } from "@/lib/graphql/generated";

const DASHBOARD_PATH_BY_ROLE: Partial<Record<Role, string>> = {
  [Role.Professional]: "/dashboard/professional",
  [Role.Provider]: "/dashboard/provider",
};

export const useAuthSession = () => {
  const { data, isLoading, isFetching, isError } = useCurrentUserQuery(
    undefined,
    {
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    },
  );
  const user = data?.success ? (data.user ?? null) : null;
  const dashboardHref = useMemo(() => {
    if (!user?.role) return null;
    return DASHBOARD_PATH_BY_ROLE[user.role] ?? "/dashboard";
  }, [user?.role]);
  return {
    user,
    dashboardHref,
    isAuthError: isError,
    isAuthenticated: Boolean(user),
    isCheckingSession: isLoading || isFetching,
  };
};
