"use client";

import { ProviderNotificationSettingsStep } from "@modules/ProviderDashboard/parts/provider-notif-settings-step";
import { ProviderSecuritySettingsStep } from "@modules/ProviderDashboard/parts/provider-security-settings-step";
import { ProviderProfileSettingsStep } from "@modules/ProviderDashboard/parts/provider-profile-settings-step";
import { useProviderSettingsTab } from "@/hooks/useProviderSettingsTab";
import { WizardStepper } from "@elements/wizard-stepper";
import { RefreshCcw } from "lucide-react";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";

const SETTINGS_STEPS = [
  { key: 1, section: "profile" },
  { key: 2, section: "notifications" },
  { key: 3, section: "security" },
] as const;

export const ProviderSettingsTab = () => {
  const hook = useProviderSettingsTab();
  const { t, activeStep, setActiveStep, refreshAll, isLoading } = hook;

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("providerDashboard.settings.eyebrow")}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t("providerDashboard.settings.title")}
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            {t("providerDashboard.settings.description")}
          </p>
        </div>

        <Button
          radius="xl"
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={refreshAll}
        >
          <RefreshCcw className="h-4 w-4" />
          {t("common.refresh")}
        </Button>
      </section>

      <WizardStepper
        activeKey={activeStep}
        onSelect={setActiveStep}
        label={t("providerDashboard.settings.stepsLabel")}
        steps={SETTINGS_STEPS.map((step) => ({
          key: step.key,
          isComplete: activeStep > step.key,
          title: t(`providerDashboard.settings.steps.${step.section}.title`),
          description: t(
            `providerDashboard.settings.steps.${step.section}.description`,
          ),
        }))}
      />

      <GlassCard>
        {activeStep === 1 && <ProviderProfileSettingsStep hook={hook} />}
        {activeStep === 2 && <ProviderNotificationSettingsStep hook={hook} />}
        {activeStep === 3 && <ProviderSecuritySettingsStep hook={hook} />}
      </GlassCard>
    </div>
  );
};

export default ProviderSettingsTab;
