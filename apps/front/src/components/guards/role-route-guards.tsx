"use client";

import { TRoleRouteGuardProps } from "@/types/guards.types";
import { useCurrentUserQuery } from "@/lib/rtk/endpoints/auth.api";
import { DashboardContentSkeleton } from "@layouts/parts/DashboardSkeleton";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { siteLinks } from "@/utils/constant";

import PasswordChangeRequired from "@modules/Auth/PasswordChangeRequired";

export const RoleRouteGuard = ({
  children,
  allowedRoles,
  redirectUnauthorizedTo = siteLinks.home,
  redirectUnauthenticatedTo = siteLinks.login,
}: TRoleRouteGuardProps) => {
  const router = useRouter();

  const { data, isLoading, isFetching } = useCurrentUserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const user = data?.user;
  const isChecking = isLoading || isFetching;
  const isAllowed = Boolean(user?.role && allowedRoles.includes(user.role));

  useEffect(() => {
    if (isChecking) return;
    if (!user) {
      router.replace(redirectUnauthenticatedTo);
      return;
    }
    if (!isAllowed) router.replace(redirectUnauthorizedTo);
  }, [
    user,
    router,
    isAllowed,
    isChecking,
    redirectUnauthorizedTo,
    redirectUnauthenticatedTo,
  ]);

  if (isChecking || !user || !isAllowed) return <DashboardContentSkeleton />;
  if (user.forcePasswordChange) return <PasswordChangeRequired />;
  return <>{children}</>;
};
