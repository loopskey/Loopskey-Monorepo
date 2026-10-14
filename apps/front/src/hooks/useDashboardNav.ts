"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { getDashboardTabsByRole } from "@/utils/dashboard-nav.config";
import { useCurrentUserQuery } from "@/lib/rtk/endpoints/auth.api";
import { stripLocalePrefix } from "@/lib/i18n/locale";

const TAB_BY_ROUTE: Record<string, string> = {
  "/dashboard/professional/roadmap-chat": "roadmap",
};

export const useDashboardNav = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { data, isLoading } = useCurrentUserQuery();

  const role = data?.user?.role;
  const activeTab =
    searchParams?.get("tab") ??
    TAB_BY_ROUTE[stripLocalePrefix(pathname ?? "")] ??
    "overview";
  const isReady = !isLoading && Boolean(role);

  return {
    role,
    activeTab,
    isReady,
    tabs: isReady ? getDashboardTabsByRole(role) : [],
  };
};
