"use client";

import { useGoogleSocialOAuth } from "@/hooks/useGoogleSocialAuth";
import { Facebook, Linkedin } from "lucide-react";
import { TSocialAuthBtns } from "@/types/auth-module.types";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

const SocialAuthButtons = ({ role, disabled }: TSocialAuthBtns) => {
  const { t } = useI18n();
  const { continueWithGoogle, isGoogleLoading } = useGoogleSocialOAuth(role);

  return (
    <div className="space-y-3">
      <div className="relative flex items-center justify-center">
        <div className="h-px w-full bg-border" />
        <span className="absolute px-3 text-xs font-medium text-muted-foreground">
          {t("authPages.common.orContinueWith")}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Button
          radius="xl"
          type="button"
          variant="glass"
          onClick={continueWithGoogle}
          disabled={disabled || isGoogleLoading}
        >
          <span className="text-sm font-bold">G</span>
          <span className="sr-only">{t("authPages.common.google")}</span>
        </Button>

        <Button type="button" variant="glass" radius="xl" disabled>
          <Linkedin className="h-4 w-4" />
          <span className="sr-only">{t("authPages.common.linkedin")}</span>
        </Button>

        <Button type="button" variant="glass" radius="xl" disabled>
          <Facebook className="h-4 w-4" />
          <span className="sr-only">{t("authPages.common.facebook")}</span>
        </Button>
      </div>
    </div>
  );
};

export default SocialAuthButtons;
