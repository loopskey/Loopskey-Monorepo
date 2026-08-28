"use client";

import { useDismissProfessionalOnboardingMutation } from "@/lib/rtk/endpoints/professional.api";
import { useProfessionalDashboardProfileQuery } from "@/lib/rtk/endpoints/professional.api";
import { ReactNode, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import * as C from "@/utils/professional-onboarding.constant";

export const ProfessionalOnboardingGate = ({
  children,
}: {
  children: ReactNode;
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const { data, error, isLoading, isFetching } =
    useProfessionalDashboardProfileQuery();
  const [dismissOnboarding] = useDismissProfessionalOnboardingMutation();

  const isOnboardingRoute = pathname === C.ONBOARDING_HREF;

  const isSettled = Boolean(data) && !isFetching && !error;
  const isOffered =
    isSettled && !data?.onboardingCompletedAt && !data?.onboardingDismissedAt;
  const hasSeenWizard = useRef(false);
  useEffect(() => {
    if (isOnboardingRoute) hasSeenWizard.current = true;
  }, [isOnboardingRoute]);

  const hasLeftWizard =
    isOffered && !isOnboardingRoute && hasSeenWizard.current;
  const needsOffer = isOffered && !isOnboardingRoute && !hasSeenWizard.current;
  const needsExit = isSettled && !isOffered && isOnboardingRoute;

  const hasDismissed = useRef(false);
  useEffect(() => {
    if (!hasLeftWizard || hasDismissed.current) return;
    hasDismissed.current = true;
    void dismissOnboarding();
  }, [hasLeftWizard, dismissOnboarding]);

  useEffect(() => {
    if (needsOffer) router.replace(C.ONBOARDING_HREF);
    else if (needsExit) router.replace(C.PROFILE_TAB_HREF);
  }, [router, needsOffer, needsExit]);
  if (error) return <>{children}</>;
  if (isLoading || !data || needsOffer || needsExit)
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );

  return <>{children}</>;
};
