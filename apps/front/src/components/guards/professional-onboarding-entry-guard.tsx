"use client";

import { useProfessionalDashboardProfileQuery } from "@/lib/rtk/endpoints/professional.api";
import { DashboardContentSkeleton } from "@layouts/parts/DashboardSkeleton";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import * as C from "@/utils/professional-onboarding.constant";

export const ProfessionalOnboardingEntryGuard = ({
  children,
}: {
  children: ReactNode;
}) => {
  const router = useRouter();
  const { data, error, isLoading, isFetching } =
    useProfessionalDashboardProfileQuery();

  const isSettled = Boolean(data) && !isFetching && !error;
  const isAlreadyResolved =
    isSettled && Boolean(data?.onboardingCompletedAt || data?.onboardingDismissedAt);

  useEffect(() => {
    if (isAlreadyResolved) router.replace(C.PROFILE_TAB_HREF);
  }, [isAlreadyResolved, router]);

  if (error) return <>{children}</>;
  if (isLoading || !data || isAlreadyResolved)
    return <DashboardContentSkeleton />;

  return <>{children}</>;
};
