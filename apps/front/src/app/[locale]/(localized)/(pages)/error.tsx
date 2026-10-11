"use client";

import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";

type PublicPageErrorProps = {
  reset: () => void;
};

const PublicPageError = ({ reset }: PublicPageErrorProps) => {
  const { t } = useI18n();

  return (
    <main className="px-4 py-10 sm:px-6 lg:px-8">
      <GlassCard className="mx-auto max-w-3xl p-10 text-center" glow={false}>
        <div className="relative z-10 space-y-4">
          <h1 className="text-2xl font-medium">
            {t("contentDetails.common.unavailableTitle")}
          </h1>
          <p className="text-muted-foreground">
            {t("contentDetails.common.unavailableDescription")}
          </p>
          <Button onClick={reset}>{t("contentDetails.common.retry")}</Button>
        </div>
      </GlassCard>
    </main>
  );
};

export default PublicPageError;
