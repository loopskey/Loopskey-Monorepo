"use client";

import { GlassCard } from "@elements/glass-card";
import { useI18n } from "@hooks/useI18n";

type TAssociationTabProps = {
  bodyKey: string;
  titleKey: string;
};

export const AssociationTabPlaceholder = ({
  bodyKey,
  titleKey,
}: TAssociationTabProps) => {
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-primary">
          {t("associationDashboard.eyebrow")}
        </p>

        <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
          {t(titleKey)}
        </h1>
      </section>

      <GlassCard className="relative" glow={false}>
        <p className="text-muted-foreground">{t(bodyKey)}</p>
      </GlassCard>
    </div>
  );
};
