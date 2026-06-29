"use client";

import { TRoleRouteGuardProps } from "@/types/guards.types";
import { useCurrentUserQuery } from "@/lib/rtk/endpoints/auth.api";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { siteLinks } from "@/utils/constant";
import { Loader2 } from "lucide-react";

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

  if (isChecking || !user || !isAllowed)
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );

  return <>{children}</>;
};
