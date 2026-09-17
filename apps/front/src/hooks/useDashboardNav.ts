"use client";

import { getDashboardTabsByRole } from "@/utils/dashboard-nav.config";
import { useCurrentUserQuery } from "@/lib/rtk/endpoints/auth.api";
import { useSearchParams } from "next/navigation";

export const useDashboardNav = () => {
  const searchParams = useSearchParams();
  const { data, isLoading, isFetching } = useCurrentUserQuery();

  const role = data?.user?.role;
  const activeTab = searchParams?.get("tab") ?? "overview";
  const isReady = !isLoading && !isFetching && Boolean(role);

  return {
    role,
    activeTab,
    isReady,
    tabs: isReady ? getDashboardTabsByRole(role) : [],
  };
};
