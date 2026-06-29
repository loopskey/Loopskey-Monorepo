"use client";

import { TProfessionalPrivacySettingPanel } from "@/types/professional-dashboard.types";
import { ProfileVisibility } from "@/lib/graphql/generated";
import { visibilityItems } from "@/utils/constant";
import { Button } from "@ui/button";
import { Switch } from "@ui/switch";
import { cn } from "@/lib/utils";

export const ProfessionalPrivacySettingsPanel = ({
  icon: Icon,
  hook,
}: TProfessionalPrivacySettingPanel) => {
  const {
    t,
    isLoading,
    settingsForm,
    setSettingsForm,
    savePrivacySettings,
    resetPrivacySettings,
  } = hook;

  const ProfessionalPrivacyConst = [
    {
      key: "showEmail",
      title: t("professionalDashboard.settings.privacy.showEmail"),
      description: t(
        "professionalDashboard.settings.privacy.showEmailDescription",
      ),
    },
    {
      key: "showLearningProgress",
      title: t("professionalDashboard.settings.privacy.showLearningProgress"),
      description: t(
        "professionalDashboard.settings.privacy.showLearningProgressDescription",
      ),
    },
    {
      key: "showCertificates",
      title: t("professionalDashboard.settings.privacy.showCertificates"),
      description: t(
        "professionalDashboard.settings.privacy.showCertificatesDescription",
      ),
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-medium">
            {t("professionalDashboard.settings.privacy.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("professionalDashboard.settings.privacy.description")}
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {visibilityItems.map((item) => {
          const active = settingsForm.profileVisibility === item.value;
          return (
            <button
              key={item.value}
              type="button"
              onClick={() =>
                setSettingsForm((prev) => ({
                  ...prev,
                  profileVisibility: item.value as ProfileVisibility,
                }))
              }
              className={cn(
                "rounded-3xl border p-4 text-left transition-all",
                active
                  ? "border-primary bg-primary/10"
                  : "border-glass-border bg-background/45 hover:border-primary/40",
              )}
            >
              <p className="font-medium">
                {t(`professionalDashboard.settings.privacy.${item.key}`)}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {t(
                  `professionalDashboard.settings.privacy.${item.key}Description`,
                )}
              </p>
            </button>
          );
        })}
      </div>

      <div className="grid gap-3">
        {ProfessionalPrivacyConst.map((row) => (
          <div
            key={row.key}
            className="flex items-center justify-between gap-4 rounded-3xl border border-glass-border bg-background/45 p-4"
          >
            <div>
              <p className="font-medium">{row.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {row.description}
              </p>
            </div>

            <Switch
              checked={Boolean(
                settingsForm[row.key as keyof typeof settingsForm],
              )}
              onCheckedChange={(checked) =>
                setSettingsForm((prev) => ({
                  ...prev,
                  [row.key]: checked,
                }))
              }
            />
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          radius="xl"
          type="button"
          variant="brand"
          disabled={isLoading}
          onClick={savePrivacySettings}
        >
          {t("professionalDashboard.settings.privacy.save")}
        </Button>

        <Button
          radius="xl"
          type="button"
          variant="glass"
          disabled={isLoading}
          onClick={resetPrivacySettings}
        >
          {t("professionalDashboard.settings.privacy.reset")}
        </Button>
      </div>
    </section>
  );
};
