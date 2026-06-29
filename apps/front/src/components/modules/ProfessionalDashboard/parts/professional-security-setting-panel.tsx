"use client";

import { AtSign, KeyRound, Laptop, Mail, ShieldCheck } from "lucide-react";
import { useProfessionalSecuritySettingsPanel } from "@/hooks/useProfessionalSecuritySettingPanel";
import { TProfessionaSettingSecurity } from "@/types/professional-dashboard.types";
import { FloatingInputField } from "@elements/floating-input";
import { formatDateTime } from "@/utils/function-helper";
import { PasswordField } from "@elements/password-field";
import { Button } from "@ui/button";
import { Badge } from "@ui/badge";

import * as F from "@ui/form";

export const ProfessionalSecuritySettingsPanel = ({
  hook,
  icon: Icon,
}: TProfessionaSettingSecurity) => {
  const { t, profile, emailForm } = hook;

  const {
    emailRhf,
    passwordRhf,
    handleVerifyEmail,
    isSendOtpDisabled,
    handleSendEmailOtp,
    handleSavePassword,
    isPasswordSubmitDisabled,
    isVerifyEmailDisabled,
  } = useProfessionalSecuritySettingsPanel({
    settingsHook: hook,
  });

  return (
    <section className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-xl font-medium">
            {t("professionalDashboard.settings.security.title")}
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {t("professionalDashboard.settings.security.description")}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border border-glass-border bg-background/45 p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <h3 className="font-medium">
              {t("professionalDashboard.settings.security.passwordTitle")}
            </h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("professionalDashboard.settings.security.passwordDescription")}
          </p>
          <F.Form {...passwordRhf}>
            <form onSubmit={handleSavePassword} className="mt-5 space-y-5">
              <div className="grid gap-4">
                <PasswordField
                  control={passwordRhf.control}
                  name="currentPassword"
                  label={t(
                    "professionalDashboard.settings.security.currentPassword",
                  )}
                  autoComplete="current-password"
                />
                <PasswordField
                  control={passwordRhf.control}
                  name="newPassword"
                  label={t(
                    "professionalDashboard.settings.security.newPassword",
                  )}
                  autoComplete="new-password"
                />
                <PasswordField
                  control={passwordRhf.control}
                  name="confirmPassword"
                  label={t(
                    "professionalDashboard.settings.security.confirmPassword",
                  )}
                  autoComplete="new-password"
                />
              </div>
              <Button
                radius="xl"
                type="submit"
                variant="brand"
                disabled={isPasswordSubmitDisabled}
              >
                {t("professionalDashboard.settings.security.updatePassword")}
              </Button>
            </form>
          </F.Form>
        </div>

        <div className="rounded-3xl border border-glass-border bg-background/45 p-5">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="font-medium">
              {t("professionalDashboard.settings.security.emailTitle")}
            </h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("professionalDashboard.settings.security.currentEmail")}:{" "}
            <span className="font-medium text-foreground">
              {profile?.email ?? "-"}
            </span>
          </p>
          <F.Form {...emailRhf}>
            <form className="mt-5 space-y-5">
              <div className="grid gap-4">
                <FloatingInputField
                  type="email"
                  name="newEmail"
                  autoComplete="email"
                  control={emailRhf.control}
                  leftIcon={<AtSign className="h-4 w-4" />}
                  label={t("professionalDashboard.settings.security.newEmail")}
                />

                {emailForm.otpSent && (
                  <FloatingInputField
                    name="code"
                    inputMode="numeric"
                    control={emailRhf.control}
                    autoComplete="one-time-code"
                    leftIcon={<KeyRound className="h-4 w-4" />}
                    label={t("professionalDashboard.settings.security.otpCode")}
                  />
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  radius="xl"
                  type="button"
                  variant="glass"
                  onClick={handleSendEmailOtp}
                  disabled={isSendOtpDisabled}
                >
                  {t("professionalDashboard.settings.security.sendOtp")}
                </Button>

                {emailForm.otpSent && (
                  <Button
                    radius="xl"
                    type="button"
                    variant="brand"
                    onClick={handleVerifyEmail}
                    disabled={isVerifyEmailDisabled}
                  >
                    {t("professionalDashboard.settings.security.verifyEmail")}
                  </Button>
                )}
              </div>
            </form>
          </F.Form>
        </div>
      </div>

      <div className="rounded-3xl border border-glass-border bg-background/45 p-5">
        <div className="flex items-center gap-3">
          <Laptop className="h-5 w-5 text-primary" />
          <h3 className="font-medium">
            {t("professionalDashboard.settings.security.sessionsTitle")}
          </h3>
        </div>

        <div className="mt-4 rounded-2xl bg-muted/40 p-4">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <p className="font-medium">
                {t("professionalDashboard.settings.security.thisBrowser")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("professionalDashboard.settings.security.lastActive")}:{" "}
                {formatDateTime(new Date())}
              </p>
            </div>
            <Badge className="w-fit rounded-full">
              {t("professionalDashboard.settings.security.current")}
            </Badge>
          </div>
        </div>
      </div>
    </section>
  );
};
