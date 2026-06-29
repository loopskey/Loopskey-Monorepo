"use client";

import { ArrowLeft, KeyRound, Loader2, ShieldCheck, Timer } from "lucide-react";
import { TResetPasswordFormProps } from "@/types/auth-module.types";
import { useEffect, useState } from "react";
import { FloatingInputField } from "@elements/floating-input";
import { PasswordField } from "@elements/password-field";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Form } from "@ui/form";

const ResetPasswordForm = ({
  form,
  email,
  isLoading,
  onSubmit,
  onBackToLogin,
  backToLoginCooldownSeconds = 60,
}: TResetPasswordFormProps) => {
  const { t } = useI18n();

  const [remainingSeconds, setRemainingSeconds] = useState(
    backToLoginCooldownSeconds,
  );

  const canGoBackToLogin = remainingSeconds <= 0;

  useEffect(() => {
    setRemainingSeconds(backToLoginCooldownSeconds);
  }, [email, backToLoginCooldownSeconds]);

  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [remainingSeconds]);

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <h2 className="text-xl font-extrabold tracking-tight">
            {t("authPages.common.resetPasswordTitle")}
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t(
              "authPages.common.resetPasswordDescription",
              { email },
              `Enter the code sent to ${email} and choose a new password.`,
            )}
          </p>
        </div>

        <FloatingInputField
          name="code"
          maxLength={6}
          inputMode="text"
          control={form.control}
          autoComplete="one-time-code"
          label={t("authPages.common.resetCode")}
          leftIcon={<KeyRound className="h-4 w-4" />}
          inputClassName="uppercase tracking-[0.35em]"
        />

        <PasswordField
          name="newPassword"
          control={form.control}
          autoComplete="new-password"
          label={t("authPages.common.newPassword")}
        />

        <PasswordField
          name="confirmPassword"
          control={form.control}
          autoComplete="new-password"
          label={t("authPages.common.confirmNewPassword")}
        />

        <Button
          size="lg"
          radius="xl"
          type="submit"
          variant="brand"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("authPages.common.savingNewPassword")}
            </>
          ) : (
            t("authPages.common.saveNewPassword")
          )}
        </Button>

        {canGoBackToLogin ? (
          <Button
            radius="xl"
            type="button"
            variant="glass"
            className="w-full"
            disabled={isLoading}
            onClick={onBackToLogin}
          >
            <ArrowLeft className="h-4 w-4" />
            {t("authPages.common.backToLogin")}
          </Button>
        ) : (
          <Button
            radius="xl"
            type="button"
            variant="cancel"
            className="w-full cursor-default"
            disabled
          >
            <Timer className="h-4 w-4" />
            {t(
              "authPages.common.backToLoginAvailableIn",
              { seconds: remainingSeconds },
              `Back to login available in ${remainingSeconds}s`,
            )}
          </Button>
        )}
      </form>
    </Form>
  );
};

export default ResetPasswordForm;
