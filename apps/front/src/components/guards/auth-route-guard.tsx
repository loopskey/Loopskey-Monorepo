"use client";

import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { useCurrentUserQuery } from "@/lib/rtk/endpoints/auth.api";
import { getDashboardPath } from "@/utils/constant";
import { Loader2 } from "lucide-react";

const AUTH_GUARD_EXCLUDED_PATHS = [
  "/auth/oauth",
  "/auth/organization/activate",
] as const;

export const AuthRouteGuard = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isLoading, isFetching } = useCurrentUserQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const isExcludedPath = AUTH_GUARD_EXCLUDED_PATHS.some((path) =>
    pathname.startsWith(path),
  );
  const user = data?.success ? data.user : null;
  const isChecking = isLoading || isFetching;

  useEffect(() => {
    if (isExcludedPath || isChecking || !user?.role) return;
    router.replace(getDashboardPath(user.role));
  }, [isChecking, isExcludedPath, router, user?.role]);

  if (isExcludedPath) return <>{children}</>;

  if (isChecking || user?.role) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return <>{children}</>;
};
