"use client";

import { useLazyGoogleOAuthUrlQuery } from "@/lib/rtk/endpoints/auth.api";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";
import { Role } from "@/lib/graphql/generated";

export const useGoogleSocialOAuth = (role: Role) => {
  const { t } = useI18n();
  const [getGoogleOAuthUrl, googleState] = useLazyGoogleOAuthUrlQuery();

  const continueWithGoogle = async () => {
    try {
      const result = await getGoogleOAuthUrl(role).unwrap();
      if (!result.url) {
        notify.error(t("authPages.common.genericError"));
        return;
      }
      window.location.assign(result.url);
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };
  return {
    continueWithGoogle,
    isGoogleLoading: googleState.isFetching,
  };
};
