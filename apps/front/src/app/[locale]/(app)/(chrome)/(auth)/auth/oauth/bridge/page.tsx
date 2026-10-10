"use client";

import { useOAuthBridge } from "@/hooks/useOAuthBridge";
import { Suspense } from "react";
import { Skeleton } from "@ui/skeleton";
import { useI18n } from "@/hooks/useI18n";

import AuthPageShell from "@modules/Auth/parts/AuthPageSell";

const OAuthBridgeSkeleton = ({ label }: { label?: string }) => (
  <section className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
    <div
      role="status"
      aria-live="polite"
      className="w-full rounded-lg border bg-card p-8 shadow-md"
    >
      {label && <span className="sr-only">{label}</span>}
      <Skeleton className="mx-auto mb-6 h-14 w-14 rounded-full" />
      <Skeleton className="mx-auto h-6 w-48 rounded-md" />
      <div className="mx-auto mt-4 max-w-xs space-y-2">
        <Skeleton className="h-4 w-full rounded-full" />
        <Skeleton className="mx-auto h-4 w-2/3 rounded-full" />
      </div>
    </div>
  </section>
);

const OAuthBridgeContent = () => {
  useOAuthBridge();

  const { t } = useI18n();

  return (
    <AuthPageShell>
      <OAuthBridgeSkeleton label={t("authPages.oauth.completingLogin")} />
    </AuthPageShell>
  );
};

const OAuthBridgePage = () => {
  return (
    <Suspense
      fallback={
        <AuthPageShell>
          <OAuthBridgeSkeleton />
        </AuthPageShell>
      }
    >
      <OAuthBridgeContent />
    </Suspense>
  );
};

export default OAuthBridgePage;
