"use client";

import { Facebook, Linkedin, Loader2 } from "lucide-react";
import { useLinkedInSocialOAuth } from "@/hooks/useLinkedInSocialAuth";
import { useGoogleSocialOAuth } from "@/hooks/useGoogleSocialAuth";
import { TSocialAuthBtns } from "@/types/auth-module.types";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

import * as C from "@/utils/oauth.constant";

const SocialAuthButtons = ({ role, disabled }: TSocialAuthBtns) => {
  const { t } = useI18n();
  const { continueWithGoogle, isGoogleLoading } = useGoogleSocialOAuth(role);
  const { continueWithLinkedIn, isLinkedInLoading } =
    useLinkedInSocialOAuth(role);
  const isGoogleAllowed = C.isGoogleOAuthAllowedRole(role);
  const isLinkedInAllowed = C.isLinkedInOAuthAllowedRole(role);
  if (!isGoogleAllowed && !isLinkedInAllowed) return null;

  const isRedirecting = isGoogleLoading || isLinkedInLoading;

  return (
    <div className="space-y-3">
      <div className="relative flex items-center justify-center">
        <div className="h-px w-full bg-border" />
        <span className="absolute bg-background px-3 text-xs font-medium text-muted-foreground">
          {t("authPages.common.orContinueWith")}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {isGoogleAllowed && (
          <Button
            radius="xl"
            type="button"
            variant="glass"
            onClick={continueWithGoogle}
            disabled={disabled || isRedirecting}
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="text-sm font-bold">G</span>
            )}
            <span className="sr-only">{t("authPages.common.google")}</span>
          </Button>
        )}

        {isLinkedInAllowed && (
          <Button
            radius="xl"
            type="button"
            variant="glass"
            onClick={continueWithLinkedIn}
            disabled={disabled || isRedirecting}
          >
            {isLinkedInLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Linkedin className="h-4 w-4" />
            )}
            <span className="sr-only">{t("authPages.common.linkedin")}</span>
          </Button>
        )}

        <Button type="button" variant="glass" radius="xl" disabled>
          <Facebook className="h-4 w-4" />
          <span className="sr-only">{t("authPages.common.facebook")}</span>
        </Button>
      </div>
    </div>
  );
};

export default SocialAuthButtons;
