"use client";

import { Bell, Palette, RefreshCcw, Shield, UserRound } from "lucide-react";
import { ProfessionalNotificationSettingsPanel } from "@modules/ProfessionalDashboard/parts/professional-notification-settings-panel";
import { ProfessionalSecuritySettingsPanel } from "@modules/ProfessionalDashboard/parts/professional-security-setting-panel";
import { ProfessionalGeneralSettingsPanel } from "@modules/ProfessionalDashboard/parts/professional-general-settings-panel";
import { ProfessionalPrivacySettingsPanel } from "@modules/ProfessionalDashboard/parts/professional-privacy-setting-panel";
import { ProfessionalProfileSettingsPanel } from "@modules/ProfessionalDashboard/parts/professional-profile-settings-panel";
import { useProfessionalSettingsTab } from "@/hooks/useProfessionalSettingstab";
import { TSettingsTab } from "@/types/professional-dashboard.types";
import { AnimatedTabs } from "@elements/animated-tabs";
import { GlassCard } from "@elements/glass-card";
import { useState } from "react";
import { Button } from "@ui/button";

const ProfessionalSettingsTab = () => {
  const hook = useProfessionalSettingsTab();
  const { t, isLoading, refreshAll } = hook;

  const [activeTab, setActiveTab] = useState<TSettingsTab>("general");

  const tabs = [
    {
      value: "general",
      label: t("professionalDashboard.settings.tabs.general"),
    },
    {
      value: "notifications",
      label: t("professionalDashboard.settings.tabs.notifications"),
    },
    {
      value: "privacy",
      label: t("professionalDashboard.settings.tabs.privacy"),
    },
    {
      value: "profile",
      label: t("professionalDashboard.settings.tabs.profile"),
    },
    {
      value: "security",
      label: t("professionalDashboard.settings.tabs.security"),
    },
  ] satisfies { value: TSettingsTab; label: string }[];

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("professionalDashboard.settings.eyebrow")}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight">
            {t("professionalDashboard.settings.title")}
          </h1>

          <p className="mt-2 max-w-2xl text-muted-foreground">
            {t("professionalDashboard.settings.description")}
          </p>
        </div>

        <Button
          radius="xl"
          type="button"
          variant="glass"
          disabled={isLoading}
          onClick={refreshAll}
        >
          <RefreshCcw className="h-4 w-4" />
          {t("common.refresh")}
        </Button>
      </section>

      <AnimatedTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <GlassCard>
        {activeTab === "general" && (
          <ProfessionalGeneralSettingsPanel icon={Palette} hook={hook} />
        )}

        {activeTab === "notifications" && (
          <ProfessionalNotificationSettingsPanel icon={Bell} hook={hook} />
        )}

        {activeTab === "privacy" && (
          <ProfessionalPrivacySettingsPanel icon={Shield} hook={hook} />
        )}

        {activeTab === "profile" && (
          <ProfessionalProfileSettingsPanel icon={UserRound} hook={hook} />
        )}

        {activeTab === "security" && (
          <ProfessionalSecuritySettingsPanel icon={Shield} hook={hook} />
        )}
      </GlassCard>
    </div>
  );
};

export default ProfessionalSettingsTab;
