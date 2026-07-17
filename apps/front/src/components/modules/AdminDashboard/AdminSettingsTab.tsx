"use client";

import { FloatingTextareaField } from "@elements/floating-textarea";
import { useAdminSettingsTab } from "@/hooks/useAdminSettingsTab";
import { FloatingInputField } from "@elements/floating-input";
import { PasswordField } from "@elements/password-field";
import { UserAvatar } from "@elements/user-avatar";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Form } from "@ui/form";

import * as L from "lucide-react";

const AdminSettingsTab = () => {
  const {
    t,
    user,
    otpSent,
    isLoading,
    emailForm,
    refreshAll,
    profileForm,
    saveProfile,
    passwordForm,
    removeAvatar,
    savePassword,
    sendEmailOtp,
    verifyEmailOtp,
  } = useAdminSettingsTab();

  const avatarUrl = profileForm.watch("avatarUrl");
  const fullName = profileForm.watch("fullName");

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-primary">
            {t("adminDashboard.settings.eyebrow")}
          </p>

          <h1 className="mt-2 text-3xl font-medium tracking-tight md:text-4xl">
            {t("adminDashboard.settings.title")}
          </h1>

          <p className="mt-2 max-w-3xl text-muted-foreground">
            {t("adminDashboard.settings.description")}
          </p>
        </div>

        <Button
          type="button"
          radius="xl"
          variant="glass"
          disabled={isLoading}
          onClick={refreshAll}
        >
          <L.RefreshCcw className="h-4 w-4" />
          {t("common.refresh")}
        </Button>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px]">
        <GlassCard>
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <L.UserRound className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-medium">
                {t("adminDashboard.settings.profile.title")}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {t("adminDashboard.settings.profile.description")}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 rounded-3xl border border-glass-border bg-background/45 p-5 sm:flex-row sm:items-center">
            <UserAvatar
              fullName={fullName}
              avatarUrl={avatarUrl}
              email={user?.email}
              className="h-20 w-20 border border-primary/20"
              fallbackClassName="bg-primary/10 text-lg font-medium text-primary"
            />
            <div className="flex-1">
              <p className="font-medium">{fullName || user?.email}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <Button
              radius="xl"
              type="button"
              variant="glass"
              disabled={isLoading}
              onClick={removeAvatar}
            >
              <L.Trash2 className="h-4 w-4" />
              {t("adminDashboard.settings.profile.removeAvatar")}
            </Button>
          </div>

          <Form {...profileForm}>
            <form className="mt-6 space-y-5" onSubmit={saveProfile}>
              <FloatingInputField
                name="fullName"
                control={profileForm.control}
                leftIcon={<L.UserRound className="h-4 w-4" />}
                label={t("adminDashboard.settings.profile.fullName")}
              />

              <FloatingInputField
                name="avatarUrl"
                control={profileForm.control}
                leftIcon={<L.Camera className="h-4 w-4" />}
                label={t("adminDashboard.settings.profile.avatarUrl")}
                description={t(
                  "adminDashboard.settings.profile.avatarDescription",
                )}
              />

              <FloatingTextareaField
                name="bio"
                control={profileForm.control}
                label={t("adminDashboard.settings.profile.bio")}
              />

              <Button
                radius="xl"
                type="submit"
                variant="brand"
                disabled={isLoading}
              >
                {t("adminDashboard.settings.profile.save")}
              </Button>
            </form>
          </Form>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <L.Mail className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-medium">
                  {t("adminDashboard.settings.email.title")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("adminDashboard.settings.email.description")}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-3xl bg-muted/45 p-4 text-sm">
              <span className="text-muted-foreground">
                {t("adminDashboard.settings.email.currentEmail")}:
              </span>{" "}
              <span className="font-medium">{user?.email ?? "-"}</span>
            </div>

            <Form {...emailForm}>
              <form className="mt-5 space-y-5">
                <FloatingInputField
                  type="email"
                  name="newEmail"
                  control={emailForm.control}
                  leftIcon={<L.Mail className="h-4 w-4" />}
                  label={t("adminDashboard.settings.email.newEmail")}
                />

                {otpSent && (
                  <FloatingInputField
                    name="code"
                    control={emailForm.control}
                    leftIcon={<L.ShieldCheck className="h-4 w-4" />}
                    label={t("adminDashboard.settings.email.otpCode")}
                  />
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    radius="xl"
                    type="button"
                    variant="glass"
                    disabled={isLoading}
                    onClick={sendEmailOtp}
                  >
                    {t("adminDashboard.settings.email.sendOtp")}
                  </Button>

                  {otpSent && (
                    <Button
                      radius="xl"
                      type="button"
                      variant="brand"
                      disabled={isLoading}
                      onClick={verifyEmailOtp}
                    >
                      {t("adminDashboard.settings.email.verify")}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </GlassCard>

          <GlassCard>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <L.KeyRound className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-xl font-medium">
                  {t("adminDashboard.settings.password.title")}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("adminDashboard.settings.password.description")}
                </p>
              </div>
            </div>

            <Form {...passwordForm}>
              <form className="mt-6 space-y-5" onSubmit={savePassword}>
                <PasswordField
                  name="currentPassword"
                  control={passwordForm.control}
                  autoComplete="current-password"
                  label={t("adminDashboard.settings.password.currentPassword")}
                />

                <PasswordField
                  name="newPassword"
                  autoComplete="new-password"
                  control={passwordForm.control}
                  label={t("adminDashboard.settings.password.newPassword")}
                />

                <PasswordField
                  name="confirmPassword"
                  autoComplete="new-password"
                  control={passwordForm.control}
                  label={t("adminDashboard.settings.password.confirmPassword")}
                />

                <Button
                  radius="xl"
                  type="submit"
                  variant="brand"
                  disabled={isLoading}
                >
                  {t("adminDashboard.settings.password.update")}
                </Button>
              </form>
            </Form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsTab;
