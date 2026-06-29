"use client";

import { AtSign, KeyRound, Mail, ShieldCheck } from "lucide-react";
import { useProviderSecuritySettingsStep } from "@/hooks/useProviderSecuritySetting";
import { FloatingInputField } from "@elements/floating-input";
import { PasswordField } from "@elements/password-field";
import { Button } from "@ui/button";

import * as F from "@ui/form";

type Props = {
  hook: ReturnType<
    typeof import("@/hooks/useProviderSettingsTab").useProviderSettingsTab
  >;
};

export const ProviderSecuritySettingsStep = ({ hook }: Props) => {
  const { t, emailForm, currentUser } = hook;

  const {
    emailRhf,
    passwordRhf,
    isSendOtpDisabled,
    handleSavePassword,
    isVerifyEmailDisabled,
    isPasswordSubmitDisabled,
    handleSendEmailChangeOtp,
    handleVerifyEmailChangeOtp,
  } = useProviderSecuritySettingsStep({ hook });

  return (
    <section className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-medium">
            {t("providerDashboard.settings.security.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("providerDashboard.settings.security.description")}
          </p>
        </div>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-glass-border bg-background/45 p-5">
          <div className="flex items-center gap-3">
            <KeyRound className="h-5 w-5 text-primary" />
            <h3 className="font-medium">
              {t("providerDashboard.settings.security.passwordTitle")}
            </h3>
          </div>
          <F.Form {...passwordRhf}>
            <form onSubmit={handleSavePassword} className="mt-5 space-y-5">
              <div className="grid gap-4">
                <PasswordField
                  name="currentPassword"
                  control={passwordRhf.control}
                  autoComplete="current-password"
                  label={t(
                    "providerDashboard.settings.security.currentPassword",
                  )}
                />

                <PasswordField
                  name="newPassword"
                  autoComplete="new-password"
                  control={passwordRhf.control}
                  label={t("providerDashboard.settings.security.newPassword")}
                />

                <PasswordField
                  name="confirmPassword"
                  autoComplete="new-password"
                  control={passwordRhf.control}
                  label={t(
                    "providerDashboard.settings.security.confirmPassword",
                  )}
                />
              </div>
              <Button
                radius="xl"
                type="submit"
                variant="brand"
                disabled={isPasswordSubmitDisabled}
              >
                {t("providerDashboard.settings.security.updatePassword")}
              </Button>
            </form>
          </F.Form>
        </div>

        <div className="rounded-3xl border border-glass-border bg-background/45 p-5">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-primary" />
            <h3 className="font-medium">
              {t("providerDashboard.settings.security.emailTitle")}
            </h3>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("providerDashboard.settings.security.currentEmail")}:{" "}
            <span className="font-medium text-foreground">
              {currentUser?.email ?? "-"}
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
                  label={t("providerDashboard.settings.security.newEmail")}
                />

                {emailForm.otpSent && (
                  <FloatingInputField
                    name="code"
                    inputMode="numeric"
                    control={emailRhf.control}
                    autoComplete="one-time-code"
                    leftIcon={<KeyRound className="h-4 w-4" />}
                    label={t("providerDashboard.settings.security.otpCode")}
                  />
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  radius="xl"
                  type="button"
                  variant="glass"
                  disabled={isSendOtpDisabled}
                  onClick={handleSendEmailChangeOtp}
                >
                  {t("providerDashboard.settings.security.sendOtp")}
                </Button>

                {emailForm.otpSent && (
                  <Button
                    radius="xl"
                    type="button"
                    variant="brand"
                    disabled={isVerifyEmailDisabled}
                    onClick={handleVerifyEmailChangeOtp}
                  >
                    {t("providerDashboard.settings.security.verifyEmail")}
                  </Button>
                )}
              </div>
            </form>
          </F.Form>
        </div>
      </div>
    </section>
  );
};
