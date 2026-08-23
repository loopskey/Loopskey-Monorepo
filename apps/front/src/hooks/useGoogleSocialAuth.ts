"use client";

import { useLazyGoogleOAuthUrlQuery } from "@/lib/rtk/endpoints/auth.api";
import { getAuthErrorTranslationKey } from "@/utils/auth-error";
import { isGoogleOAuthAllowedRole } from "@/utils/oauth.constant";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";
import { Role } from "@/lib/graphql/base";

export const useGoogleSocialOAuth = (role: Role) => {
  const { t } = useI18n();
  const [getGoogleOAuthUrl, googleState] = useLazyGoogleOAuthUrlQuery();

  const continueWithGoogle = async () => {
    try {
      if (!isGoogleOAuthAllowedRole(role)) {
        notify.error(t("authPages.oauth.roleNotAllowed"));
        return;
      }
      const result = await getGoogleOAuthUrl(role).unwrap();
      if (!result?.url) {
        notify.error(t("authPages.common.genericError"));
        return;
      }
      window.location.assign(result.url);
    } catch (error) {
      notify.error(t(getAuthErrorTranslationKey(error)));
    }
  };
  return {
    continueWithGoogle,
    isGoogleLoading: googleState.isFetching,
  };
};
