"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useLazyCurrentUserQuery } from "@/lib/rtk/endpoints/auth.api";
import { useEffect, useRef } from "react";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";
import { Role } from "@/lib/graphql/generated";

import * as C from "@/utils/oauth.constant";

const DEFAULT_AUTH_REDIRECT = "/auth/professional";

export const useOAuthBridge = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasHandled = useRef(false);
  const { t } = useI18n();
  const [getCurrentUser, currentUserState] = useLazyCurrentUserQuery();

  useEffect(() => {
    if (hasHandled.current) return;
    hasHandled.current = true;
    const redirectToAuthPage = (role?: Role | null) => {
      if (C.isOAuthAllowedRole(role)) {
        router.replace(C.OAUTH_AUTH_PAGE_BY_ROLE[role]);
        return;
      }
      router.replace(DEFAULT_AUTH_REDIRECT);
    };

    const handleOAuthError = (code?: string | null, role?: Role | null) => {
      const errorKey = C.getOAuthErrorTranslationKey(code);
      notify.error(t(errorKey));
      redirectToAuthPage(role);
    };

    const handleOAuthRedirect = async () => {
      const status = searchParams.get("status");
      const code = searchParams.get("code");
      const role = searchParams.get("role") as Role | null;
      const actualRole = searchParams.get("actualRole") as Role | null;
      if (status !== "success") {
        handleOAuthError(code, actualRole ?? role);
        return;
      }
      if (!C.isOAuthAllowedRole(role)) {
        notify.error(t("authPages.oauth.roleNotAllowed"));
        router.replace(DEFAULT_AUTH_REDIRECT);
        return;
      }
      try {
        const currentUserPayload = await getCurrentUser(
          undefined,
          false,
        ).unwrap();
        if (!currentUserPayload?.success || !currentUserPayload.user) {
          notify.error(t("authPages.oauth.sessionNotFound"));
          redirectToAuthPage(role);
          return;
        }
        const currentUser = currentUserPayload.user;
        if (currentUser.role !== role) {
          notify.error(t("authPages.oauth.invalidRole"));
          redirectToAuthPage(role);
          return;
        }
        router.replace(C.OAUTH_SUCCESS_REDIRECT_BY_ROLE[role]);
      } catch {
        notify.error(t("authPages.oauth.sessionNotFound"));
        redirectToAuthPage(role);
      }
    };
    void handleOAuthRedirect();
  }, [getCurrentUser, router, searchParams, t]);

  return {
    isVerifyingSession: currentUserState.isFetching,
  };
};
