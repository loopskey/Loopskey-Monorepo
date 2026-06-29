"use client";

import { TProfessionalGeneralSetting } from "@/types/professional-dashboard.types";
import { AppLanguage, Theme } from "@/lib/graphql/generated";
import { Button } from "@ui/button";
import { Label } from "@ui/label";

import * as S from "@ui/select";

export const ProfessionalGeneralSettingsPanel = ({
  icon: Icon,
  hook,
}: TProfessionalGeneralSetting) => {
  const { t, settingsForm, setSettingsForm, saveGeneralSettings, isLoading } =
    hook;

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-medium">
            {t("professionalDashboard.settings.general.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("professionalDashboard.settings.general.description")}
          </p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label>{t("professionalDashboard.settings.general.language")}</Label>

          <S.Select
            value={settingsForm.interfaceLanguage}
            onValueChange={(value) =>
              setSettingsForm((prev) => ({
                ...prev,
                interfaceLanguage: value as AppLanguage,
              }))
            }
          >
            <S.SelectTrigger className="rounded-2xl">
              <S.SelectValue />
            </S.SelectTrigger>
            <S.SelectContent>
              <S.SelectItem value={AppLanguage.En}>English</S.SelectItem>
              <S.SelectItem value={AppLanguage.Fr}>Français</S.SelectItem>
            </S.SelectContent>
          </S.Select>

          <p className="text-xs text-muted-foreground">
            {t("professionalDashboard.settings.general.languageHint")}
          </p>
        </div>

        <div className="space-y-2">
          <Label>{t("professionalDashboard.settings.general.theme")}</Label>
          <S.Select
            value={settingsForm.theme}
            onValueChange={(value) =>
              setSettingsForm((prev) => ({
                ...prev,
                theme: value as Theme,
              }))
            }
          >
            <S.SelectTrigger className="rounded-2xl">
              <S.SelectValue />
            </S.SelectTrigger>

            <S.SelectContent>
              <S.SelectItem value={Theme.Light}>
                {t("professionalDashboard.settings.general.light")}
              </S.SelectItem>
              <S.SelectItem value={Theme.Dark}>
                {t("professionalDashboard.settings.general.dark")}
              </S.SelectItem>
              <S.SelectItem value={Theme.System}>
                {t("professionalDashboard.settings.general.system")}
              </S.SelectItem>
            </S.SelectContent>
          </S.Select>

          <p className="text-xs text-muted-foreground">
            {t("professionalDashboard.settings.general.themeHint")}
          </p>
        </div>
      </div>

      <div className="rounded-3xl bg-primary/5 p-4 text-sm text-muted-foreground">
        {t("professionalDashboard.settings.general.note")}
      </div>

      <Button
        radius="xl"
        type="button"
        variant="brand"
        disabled={isLoading}
        onClick={saveGeneralSettings}
      >
        {t("professionalDashboard.settings.general.save")}
      </Button>
    </div>
  );
};
