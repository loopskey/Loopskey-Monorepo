"use client";

import { useOAuthBridge } from "@/hooks/useOAuthBridge";
import { Loader2 } from "lucide-react";
import { useI18n } from "@/hooks/useI18n";

import AuthPageShell from "@modules/Auth/parts/AuthPageSell";

const OAuthBridgePage = () => {
  useOAuthBridge();

  const { t } = useI18n();

  return (
    <AuthPageShell>
      <section className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
        <div className="rounded-3xl border border-border/60 bg-background/70 p-8 shadow-xl backdrop-blur">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Loader2 className="h-7 w-7 animate-spin" />
          </div>

          <h1 className="text-xl font-bold">
            {t("authPages.oauth.completingLogin")}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {t("authPages.oauth.pleaseWait")}
          </p>
        </div>
      </section>
    </AuthPageShell>
  );
};

export default OAuthBridgePage;
