"use client";

import { BellRing, Clock, UserPlus } from "lucide-react";
import { Button } from "@ui/button";
import { Switch } from "@ui/switch";
import { Input } from "@ui/input";
import { Label } from "@ui/label";

type Props = {
  hook: ReturnType<
    typeof import("@/hooks/useProviderSettingsTab").useProviderSettingsTab
  >;
};

export const ProviderNotificationSettingsStep = ({ hook }: Props) => {
  const {
    t,
    isLoading,
    notificationForm,
    setNotificationForm,
    saveNotificationSettings,
  } = hook;

  return (
    <section className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <BellRing className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-medium">
            {t("providerDashboard.settings.notifications.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("providerDashboard.settings.notifications.description")}
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="flex items-center justify-between gap-4 rounded-3xl border border-glass-border bg-background/45 p-5">
          <div className="flex gap-4">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <p className="font-medium">
                {t(
                  "providerDashboard.settings.notifications.registrationTitle",
                )}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(
                  "providerDashboard.settings.notifications.registrationDescription",
                )}
              </p>
            </div>
          </div>

          <Switch
            checked={notificationForm.newRegistrationAlertEnabled}
            onCheckedChange={(checked) =>
              setNotificationForm((prev) => ({
                ...prev,
                newRegistrationAlertEnabled: checked,
              }))
            }
          />
        </div>

        <div className="rounded-3xl border border-glass-border bg-background/45 p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-4">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">
                  {t("providerDashboard.settings.notifications.reminderTitle")}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t(
                    "providerDashboard.settings.notifications.reminderDescription",
                  )}
                </p>
              </div>
            </div>

            <Switch
              checked={notificationForm.eventReminderEnabled}
              onCheckedChange={(checked) =>
                setNotificationForm((prev) => ({
                  ...prev,
                  eventReminderEnabled: checked,
                }))
              }
            />
          </div>

          <div className="mt-5 max-w-xs space-y-2">
            <Label>
              {t("providerDashboard.settings.notifications.reminderHours")}
            </Label>
            <Input
              min={1}
              max={168}
              type="number"
              className="rounded-2xl"
              disabled={!notificationForm.eventReminderEnabled}
              value={notificationForm.reminderHoursBeforeEvent}
              onChange={(event) =>
                setNotificationForm((prev) => ({
                  ...prev,
                  reminderHoursBeforeEvent: Number(event.target.value),
                }))
              }
            />
          </div>
        </div>
      </div>

      <Button
        radius="xl"
        type="button"
        variant="brand"
        disabled={isLoading}
        onClick={saveNotificationSettings}
      >
        {t("providerDashboard.settings.notifications.save")}
      </Button>
    </section>
  );
};
