"use client";

import { usePublicSession } from "@/hooks/usePublicSession";
import { useMemo } from "react";
import { Role } from "@/lib/graphql/base";

const DASHBOARD_PATH_BY_ROLE: Partial<Record<Role, string>> = {
  [Role.Professional]: "/dashboard/professional",
  [Role.Provider]: "/dashboard/provider",
};

export const useAuthSession = () => {
  const { user, isAuthenticated, isCheckingSession } = usePublicSession();
  const dashboardHref = useMemo(() => {
    if (!user?.role) return null;
    return DASHBOARD_PATH_BY_ROLE[user.role] ?? "/dashboard";
  }, [user?.role]);
  return {
    user,
    dashboardHref,
    isAuthenticated,
    isCheckingSession,
  };
};
