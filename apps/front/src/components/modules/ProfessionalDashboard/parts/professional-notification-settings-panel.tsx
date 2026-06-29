"use client";

import { TProfessionalNotificationSetting } from "@/types/professional-dashboard.types";
import { Button } from "@ui/button";
import { Switch } from "@ui/switch";

export const ProfessionalNotificationSettingsPanel = ({
  icon: Icon,
  hook,
}: TProfessionalNotificationSetting) => {
  const {
    t,
    isLoading,
    settingsForm,
    setSettingsForm,
    saveNotificationSettings,
  } = hook;

  const rows = [
    {
      key: "emailNotifications",
      title: t(
        "professionalDashboard.settings.notifications.emailNotifications",
      ),
      description: t(
        "professionalDashboard.settings.notifications.emailNotificationsDescription",
      ),
    },
    {
      key: "pushNotifications",
      title: t(
        "professionalDashboard.settings.notifications.pushNotifications",
      ),
      description: t(
        "professionalDashboard.settings.notifications.pushNotificationsDescription",
      ),
    },
    {
      key: "courseUpdates",
      title: t("professionalDashboard.settings.notifications.courseUpdates"),
      description: t(
        "professionalDashboard.settings.notifications.courseUpdatesDescription",
      ),
    },
    {
      key: "messages",
      title: t("professionalDashboard.settings.notifications.messages"),
      description: t(
        "professionalDashboard.settings.notifications.messagesDescription",
      ),
    },
    {
      key: "eventReminders",
      title: t("professionalDashboard.settings.notifications.eventReminders"),
      description: t(
        "professionalDashboard.settings.notifications.eventRemindersDescription",
      ),
    },
    {
      key: "loginAlerts",
      title: t("professionalDashboard.settings.notifications.loginAlerts"),
      description: t(
        "professionalDashboard.settings.notifications.loginAlertsDescription",
      ),
    },
  ] as const;

  return (
    <section className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-medium">
            {t("professionalDashboard.settings.notifications.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("professionalDashboard.settings.notifications.description")}
          </p>
        </div>
      </div>

      <div className="grid gap-3">
        {rows.map((row) => (
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
              checked={Boolean(settingsForm[row.key])}
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

      <Button
        radius="xl"
        type="button"
        variant="brand"
        disabled={isLoading}
        onClick={saveNotificationSettings}
      >
        {t("professionalDashboard.settings.notifications.save")}
      </Button>
    </section>
  );
};
