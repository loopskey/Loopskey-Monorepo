"use client";

import { useOrganizationSettingsTab } from "@/hooks/useOrgSettingsTab";
import { FloatingSelectField } from "@elements/floating-select";
import { FloatingInputField } from "@elements/floating-input";
import { ComplianceCycle } from "@/lib/graphql/generated";
import { PasswordField } from "@elements/password-field";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Switch } from "@ui/switch";
import { Badge } from "@ui/badge";
import { Form } from "@ui/form";

import * as L from "lucide-react";

const OrganizationSettingsTab = () => {
  const {
    t,
    user,
    isLoading,
    departments,
    passwordForm,
    departmentForm,
    complianceForm,
    notificationForm,
    addDepartment,
    saveComplianceRules,
    submitPasswordChange,
    saveNotificationPrefs,
  } = useOrganizationSettingsTab();

  const complianceCycleOptions = Object.values(ComplianceCycle).map(
    (value) => ({
      value,
      label: value.replaceAll("_", " "),
    }),
  );

  const notificationItems = [
    {
      key: "complianceAlerts",
      title: t("organizationDashboard.settings.notifications.complianceAlerts"),
      hint: t(
        "organizationDashboard.settings.notifications.complianceAlertsHint",
      ),
    },
    {
      key: "assignmentNotifications",
      title: t(
        "organizationDashboard.settings.notifications.assignmentNotifications",
      ),
      hint: t(
        "organizationDashboard.settings.notifications.assignmentNotificationsHint",
      ),
    },
    {
      key: "weeklySummaryReport",
      title: t(
        "organizationDashboard.settings.notifications.weeklySummaryReport",
      ),
      hint: t(
        "organizationDashboard.settings.notifications.weeklySummaryReportHint",
      ),
    },
  ] as const;

  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-medium text-primary">
          {t("organizationDashboard.settings.eyebrow")}
        </p>
        <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
          {t("organizationDashboard.settings.title")}
        </h1>
        <p className="mt-2 max-w-3xl text-muted-foreground">
          {t("organizationDashboard.settings.description")}
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <div className="space-y-6">
          <GlassCard>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <L.ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-medium">
                  {t("organizationDashboard.settings.compliance.title")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("organizationDashboard.settings.compliance.description")}
                </p>
              </div>
            </div>

            <Form {...complianceForm}>
              <form
                className="mt-6 space-y-5"
                onSubmit={complianceForm.handleSubmit(saveComplianceRules)}
              >
                <div className="grid gap-5 md:grid-cols-2 items-center">
                  <FloatingInputField
                    type="number"
                    name="minimumPdu"
                    control={complianceForm.control}
                    label={t(
                      "organizationDashboard.settings.compliance.minimumPdu",
                    )}
                    leftIcon={<L.Target className="h-4 w-4" />}
                  />

                  <FloatingSelectField
                    name="complianceCycle"
                    control={complianceForm.control}
                    options={complianceCycleOptions}
                    label={t("organizationDashboard.settings.compliance.cycle")}
                    description={t(
                      "organizationDashboard.settings.compliance.cycleHint",
                    )}
                  />
                </div>

                <div className="flex items-center justify-between rounded-3xl border border-glass-border bg-background/45 p-4">
                  <div>
                    <p className="font-medium">
                      {t("organizationDashboard.settings.compliance.strict")}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {t(
                        "organizationDashboard.settings.compliance.strictHint",
                      )}
                    </p>
                  </div>

                  <Switch
                    checked={complianceForm.watch("strictCompliance")}
                    onCheckedChange={(value) =>
                      complianceForm.setValue("strictCompliance", value, {
                        shouldDirty: true,
                      })
                    }
                  />
                </div>

                <Button
                  radius="xl"
                  variant="brand"
                  type="submit"
                  disabled={isLoading}
                >
                  {t("organizationDashboard.settings.compliance.save")}
                </Button>
              </form>
            </Form>
          </GlassCard>

          <GlassCard>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <L.BellRing className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-medium">
                  {t("organizationDashboard.settings.notifications.title")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t(
                    "organizationDashboard.settings.notifications.description",
                  )}
                </p>
              </div>
            </div>

            <Form {...notificationForm}>
              <form
                className="mt-6 space-y-4"
                onSubmit={notificationForm.handleSubmit(saveNotificationPrefs)}
              >
                {notificationItems.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between rounded-3xl border border-glass-border bg-background/45 p-4"
                  >
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.hint}
                      </p>
                    </div>

                    <Switch
                      checked={notificationForm.watch(item.key)}
                      onCheckedChange={(value) =>
                        notificationForm.setValue(item.key, value, {
                          shouldDirty: true,
                        })
                      }
                    />
                  </div>
                ))}

                <Button
                  radius="xl"
                  variant="brand"
                  type="submit"
                  disabled={isLoading}
                >
                  {t("organizationDashboard.settings.notifications.save")}
                </Button>
              </form>
            </Form>
          </GlassCard>

          <GlassCard>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <L.Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-medium">
                  {t("organizationDashboard.settings.departments.title")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("organizationDashboard.settings.departments.description")}
                </p>
              </div>
            </div>

            <Form {...departmentForm}>
              <form
                className="mt-6 flex flex-col gap-3 sm:flex-row"
                onSubmit={departmentForm.handleSubmit(addDepartment)}
              >
                <FloatingInputField
                  name="title"
                  control={departmentForm.control}
                  label={t(
                    "organizationDashboard.settings.departments.placeholder",
                  )}
                  leftIcon={<L.Building className="h-4 w-4" />}
                  className="flex-1"
                />

                <Button
                  radius="xl"
                  type="submit"
                  variant="brand"
                  className="h-14"
                  disabled={isLoading}
                >
                  <L.Plus className="h-4 w-4" />
                  {t("organizationDashboard.settings.departments.add")}
                </Button>
              </form>
            </Form>

            <div className="mt-5 flex flex-wrap gap-2">
              {departments.length ? (
                departments.map((department) => (
                  <Badge key={department.id} variant="secondary">
                    {department.title}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  {t("organizationDashboard.settings.departments.empty")}
                </p>
              )}
            </div>
          </GlassCard>
        </div>

        <div className="space-y-6">
          <GlassCard>
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <L.UserRound className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-lg font-medium">
                  {user?.fullName ?? user?.email}
                </h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="mt-5 rounded-3xl bg-background/45 p-4 text-sm">
              <p className="text-muted-foreground">
                {t("organizationDashboard.settings.profile.role")}
              </p>
              <p className="mt-1 font-medium">{user?.role}</p>
            </div>
          </GlassCard>

          <GlassCard>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <L.KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-medium">
                  {t("organizationDashboard.settings.password.title")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("organizationDashboard.settings.password.description")}
                </p>
              </div>
            </div>

            <Form {...passwordForm}>
              <form
                className="mt-6 space-y-4"
                onSubmit={passwordForm.handleSubmit(submitPasswordChange)}
              >
                <PasswordField
                  name="currentPassword"
                  control={passwordForm.control}
                  autoComplete="current-password"
                  label={t("organizationDashboard.settings.password.current")}
                />

                <PasswordField
                  name="newPassword"
                  autoComplete="new-password"
                  control={passwordForm.control}
                  label={t("organizationDashboard.settings.password.new")}
                />

                <PasswordField
                  name="confirmPassword"
                  autoComplete="new-password"
                  control={passwordForm.control}
                  label={t("organizationDashboard.settings.password.confirm")}
                />

                <Button
                  radius="xl"
                  type="submit"
                  variant="brand"
                  disabled={isLoading}
                >
                  {t("organizationDashboard.settings.password.update")}
                </Button>
              </form>
            </Form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSettingsTab;
