"use client";

import { useLazyLinkedinOAuthUrlQuery } from "@/lib/rtk/endpoints/auth.api";
import { isLinkedInOAuthAllowedRole } from "@/utils/oauth.constant";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";
import { Role } from "@/lib/graphql/generated";

export const useLinkedInSocialOAuth = (role: Role) => {
  const { t } = useI18n();
  const [getLinkedInOAuthUrl, linkedInState] = useLazyLinkedinOAuthUrlQuery();

  const continueWithLinkedIn = async () => {
    try {
      if (!isLinkedInOAuthAllowedRole(role)) {
        notify.error(t("authPages.oauth.linkedinRoleNotAllowed"));
        return;
      }
      const result = await getLinkedInOAuthUrl(role).unwrap();
      if (!result?.url) {
        notify.error(t("authPages.common.genericError"));
        return;
      }
      window.location.assign(result.url);
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };
  return {
    continueWithLinkedIn,
    isLinkedInLoading: linkedInState.isFetching,
  };
};
