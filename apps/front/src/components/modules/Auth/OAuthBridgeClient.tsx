"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { getDashboardPath } from "@utils/constant";
import { useEffect } from "react";
import { useI18n } from "@hooks/useI18n";
import { notify } from "@hooks/notify";
import { isRole } from "@utils/function-helper";
import { Role } from "@lib/graphql/generated";

const OAuthBridgeClient = () => {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get("status");
    const roleParam = searchParams.get("role");
    const forcePasswordChange = searchParams.get("forcePasswordChange");
    if (status !== "success" || !isRole(roleParam)) {
      notify.error(t("authPages.common.oauthFailed"));
      router.replace("/auth/login");
      return;
    }
    notify.success(t("authPages.common.loginSuccess"));
    if (forcePasswordChange === "true" && roleParam === Role.Organization) {
      router.replace("/dashboard/organization?tab=settings");
      return;
    }
    router.replace(getDashboardPath(roleParam));
  }, [router, searchParams, t]);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">
      {t("authPages.common.oauthRedirecting")}
    </div>
  );
};

export default OAuthBridgeClient;
