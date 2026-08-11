"use client";

import { useProfessionalDashboardProfileQuery } from "@/lib/rtk/endpoints/professional.api";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { Loader2 } from "lucide-react";

import * as C from "@/utils/professional-onboarding.constant";

/**
 * Sends a professional who has not finished onboarding to the wizard, and keeps
 * one who has out of it. Completion is read from the profile itself, so the
 * gate and the wizard share a single source of truth.
 */
export const ProfessionalOnboardingGate = ({
  children,
}: {
  children: ReactNode;
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const { data, error, isLoading, isFetching } =
    useProfessionalDashboardProfileQuery();

  const isOnboardingRoute = pathname === C.ONBOARDING_HREF;
  const isComplete = Boolean(data?.onboardingCompletedAt);

  // A refetch keeps the previous result, so waiting for it to settle stops the
  // gate from acting on a profile that predates the wizard's own save.
  const isChecking = isLoading || isFetching || !data;
  const needsRedirect =
    !isChecking && (isComplete ? isOnboardingRoute : !isOnboardingRoute);

  useEffect(() => {
    if (!needsRedirect) return;
    router.replace(isComplete ? C.PROFILE_TAB_HREF : C.ONBOARDING_HREF);
  }, [router, isComplete, needsRedirect]);

  // If the profile cannot be read the gate has nothing to decide on. Letting
  // the page through leaves the user with the screen's own error and retry
  // rather than a spinner that never resolves.
  if (error) return <>{children}</>;

  if (isLoading || !data || needsRedirect)
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );

  return <>{children}</>;
};
