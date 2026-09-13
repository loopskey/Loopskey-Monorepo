"use client";

import { useProfessionalDashboardProfileQuery } from "@/lib/rtk/endpoints/professional.api";
import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

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
  if (isLoading || !data || needsOffer)
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );

  return <>{children}</>;
};
