"use client";

import { useProfessionalDashboardProfileQuery } from "@/lib/rtk/endpoints/professional.api";
import { DashboardContentSkeleton } from "@layouts/parts/DashboardSkeleton";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

import * as C from "@/utils/professional-onboarding.constant";

export const ProfessionalOnboardingGate = ({
  children,
}: {
  children: ReactNode;
}) => {
  const router = useRouter();

  const { data, error, isLoading, isFetching } =
    useProfessionalDashboardProfileQuery();

  const isSettled = Boolean(data) && !isFetching && !error;
  const needsOffer =
    isSettled && !data?.onboardingCompletedAt && !data?.onboardingDismissedAt;

  useEffect(() => {
    if (needsOffer) router.replace(C.ONBOARDING_HREF);
  }, [router, needsOffer]);

  if (error) return <>{children}</>;
  if (isLoading || !data || needsOffer) return <DashboardContentSkeleton />;

  return <>{children}</>;
};
