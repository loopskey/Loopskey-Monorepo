"use client";

import { ProfessionalProfileSettingsPanel } from "@modules/ProfessionalDashboard/parts/professional-profile-panel";
import { useProfessionalProfileTab } from "@/hooks/useProfessionalProfileTab";
import { RefreshCcw, UserRound } from "lucide-react";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

const ProfessionalProfileTab = () => {
  const hook = useProfessionalProfileTab();
  const { t, isLoading, refreshProfile } = hook;

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("professionalDashboard.profile.eyebrow")}
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight">
            {t("professionalDashboard.profile.title")}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {t("professionalDashboard.profile.description")}
          </p>
        </div>

        <Button
          radius="xl"
          type="button"
          variant="glass"
          disabled={isLoading}
          onClick={() => void refreshProfile()}
        >
          <RefreshCcw className="h-4 w-4" />
          {t("common.refresh")}
        </Button>
      </section>

      <GlassCard>
        <ProfessionalProfileSettingsPanel icon={UserRound} hook={hook} />
      </GlassCard>
    </div>
  );
};

export default ProfessionalProfileTab;
