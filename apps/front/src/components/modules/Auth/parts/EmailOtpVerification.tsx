"use client";

import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react";
import { TEmailOtpVerificationFormProps } from "@/types/auth-module.types";
import { useEffect, useMemo, useState } from "react";
import { FloatingInputField } from "@elements/floating-input";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Form } from "@ui/form";

const EmailOtpVerificationForm = ({
  form,
  email,
  onBack,
  onVerify,
  onResend,
  isVerifying,
  isResending,
  resendCooldownSeconds = 60,
}: TEmailOtpVerificationFormProps) => {
  const { t } = useI18n();

  const [remainingSeconds, setRemainingSeconds] = useState(
    resendCooldownSeconds,
  );

  const canResend = remainingSeconds <= 0;

  const normalizedEmail = useMemo(() => {
    return email.trim().toLowerCase();
  }, [email]);

  useEffect(() => {
    setRemainingSeconds(resendCooldownSeconds);
  }, [normalizedEmail, resendCooldownSeconds]);

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

  const handleResend = async () => {
    if (!canResend || isResending) return;
    await onResend();
    setRemainingSeconds(resendCooldownSeconds);
    form.reset({ code: "" });
  };

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={form.handleSubmit(onVerify)}>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {t("authPages.common.verifyEmailTitle")}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t(
              "authPages.common.verifyEmailDescription",
              { email: normalizedEmail },
              `We sent a verification code to ${normalizedEmail}.`,
            )}
          </p>
        </div>

        <FloatingInputField
          name="code"
          maxLength={6}
          inputMode="text"
          control={form.control}
          autoComplete="one-time-code"
          inputClassName="uppercase tracking-[0.35em]"
          label={t("authPages.common.verificationCode")}
          leftIcon={<ShieldCheck className="h-4 w-4" />}
        />

        <Button
          size="lg"
          radius="xl"
          type="submit"
          variant="brand"
          className="w-full"
          disabled={isVerifying}
        >
          {isVerifying ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("authPages.common.creatingAccount")}
            </>
          ) : (
            t("authPages.common.createAccount")
          )}
        </Button>

        <div className="grid gap-3 sm:grid-cols-2">
          <Button
            radius="xl"
            type="button"
            variant="glass"
            onClick={onBack}
            disabled={isVerifying || isResending}
          >
            <ArrowLeft className="h-4 w-4" />
            {t("authPages.common.editRegistration")}
          </Button>

          {canResend ? (
            <Button
              radius="xl"
              type="button"
              variant="brandSoft"
              onClick={handleResend}
              disabled={isVerifying || isResending}
            >
              {isResending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("authPages.common.resendingCode")}
                </>
              ) : (
                t("authPages.common.resendCode")
              )}
            </Button>
          ) : (
            <Button
              disabled
              radius="xl"
              type="button"
              variant="cancel"
              className="cursor-default"
            >
              {t(
                "authPages.common.resendAvailableIn",
                { seconds: remainingSeconds },
                `Resend code available in ${remainingSeconds}s`,
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default EmailOtpVerificationForm;
