"use client";

import { BellRing, Building2, RefreshCcw, ShieldCheck } from "lucide-react";
import { ProviderNotificationSettingsStep } from "@modules/ProviderDashboard/parts/provider-notif-settings-step";
import { ProviderSecuritySettingsStep } from "@modules/ProviderDashboard/parts/provider-security-settings-step";
import { ProviderProfileSettingsStep } from "@modules/ProviderDashboard/parts/provider-profile-settings-step";
import { useProviderSettingsTab } from "@/hooks/useProviderSettingsTab";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { cn } from "@/lib/utils";

const steps = [
  {
    value: 1,
    icon: Building2,
    key: "profile",
  },
  {
    value: 2,
    icon: BellRing,
    key: "notifications",
  },
  {
    value: 3,
    icon: ShieldCheck,
    key: "security",
  },
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
          variant="glass"
          disabled={isLoading}
          onClick={refreshAll}
        >
          <RefreshCcw className="h-4 w-4" />
          {t("common.refresh")}
        </Button>
      </section>

      <GlassCard>
        <div className="grid gap-3 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = activeStep === step.value;
            const isDone = activeStep > step.value;
            return (
              <button
                key={step.value}
                type="button"
                onClick={() => setActiveStep(step.value)}
                className={cn(
                  "relative flex items-center gap-4 rounded-3xl border p-4 text-left transition-all",
                  isActive
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                    : "border-glass-border bg-background/45 hover:border-primary/40",
                )}
              >
                <div
                  className={cn(
                    "flex h-11 w-11 items-center justify-center rounded-2xl",
                    isActive || isDone
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {t("providerDashboard.settings.stepLabel", {
                      step: step.value,
                    })}
                  </p>
                  <p className="font-medium">
                    {t(`providerDashboard.settings.steps.${step.key}.title`)}
                  </p>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {t(
                      `providerDashboard.settings.steps.${step.key}.description`,
                    )}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <span className="pointer-events-none absolute -right-2 top-1/2 hidden h-4 w-4 -translate-y-1/2 rotate-45 border-r border-t border-glass-border bg-background md:block" />
                )}
              </button>
            );
          })}
        </div>
      </GlassCard>

      <GlassCard>
        {activeStep === 1 && <ProviderProfileSettingsStep hook={hook} />}
        {activeStep === 2 && <ProviderNotificationSettingsStep hook={hook} />}
        {activeStep === 3 && <ProviderSecuritySettingsStep hook={hook} />}
      </GlassCard>
    </div>
  );
};

export default ProviderSettingsTab;
