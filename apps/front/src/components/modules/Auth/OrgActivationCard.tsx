"use client";

import { KeyRound, ShieldAlert, ShieldCheck } from "lucide-react";
import { Loader2, LogIn, MailWarning } from "lucide-react";
import { useOrganizationActivation } from "@hooks/useOrganizationActivation";
import { FloatingInputField } from "@elements/floating-input";
import { PasswordField } from "@elements/password-field";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Form } from "@ui/form";

import Link from "next/link";

const OrgActivationCard = () => {
  const {
    t,
    screen,
    loginHref,
    resendForm,
    passwordForm,
    isActivating,
    isResending,
    onSetPassword,
    organizationName,
    onResendActivation,
  } = useOrganizationActivation();

  const canRequestNewLink = screen === "expired" || screen === "invalid";

  return (
    <GlassCard className="mx-auto w-full max-w-md p-6 sm:p-8" glow={false}>
      <div className="relative z-10">
        {screen === "checking" && (
          <div
            role="status"
            aria-live="polite"
            className="flex min-h-56 flex-col items-center justify-center gap-3"
          >
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {t("authPages.activation.checking")}
            </p>
          </div>
        )}

        {screen === "form" && (
          <Form {...passwordForm}>
            <form
              className="space-y-5"
              onSubmit={passwordForm.handleSubmit(onSetPassword)}
            >
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                  <ShieldCheck className="h-6 w-6" />
                </div>

                <h1 className="text-xl font-extrabold tracking-tight">
                  {t("authPages.activation.title")}
                </h1>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {organizationName
                    ? t(
                        "authPages.activation.descriptionNamed",
                        { organizationName },
                        `The account for ${organizationName} has been approved. Create a secure password to activate it.`,
                      )
                    : t("authPages.activation.description")}
                </p>
              </div>

              <PasswordField
                name="password"
                autoComplete="new-password"
                control={passwordForm.control}
                label={t("authPages.common.newPassword")}
              />

              <PasswordField
                name="confirmPassword"
                autoComplete="new-password"
                control={passwordForm.control}
                label={t("authPages.common.confirmNewPassword")}
              />

              <Button
                size="lg"
                radius="xl"
                type="submit"
                variant="brand"
                className="w-full"
                disabled={isActivating}
              >
                {isActivating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("authPages.activation.activating")}
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    {t("authPages.activation.submit")}
                  </>
                )}
              </Button>
            </form>
          </Form>
        )}

        {screen === "used" && (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">
              {t("authPages.activation.usedTitle")}
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              {t("authPages.activation.usedDescription")}
            </p>
            <Button asChild size="lg" radius="xl" className="w-full">
              <Link href={loginHref}>
                <LogIn className="h-4 w-4" />
                {t("authPages.common.backToLogin")}
              </Link>
            </Button>
          </div>
        )}

        {(screen === "missingToken" || canRequestNewLink) && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-inner">
                {screen === "expired" ? (
                  <MailWarning className="h-6 w-6" />
                ) : (
                  <ShieldAlert className="h-6 w-6" />
                )}
              </div>

              <h1 className="text-xl font-extrabold tracking-tight">
                {screen === "expired"
                  ? t("authPages.activation.expiredTitle")
                  : t("authPages.activation.invalidTitle")}
              </h1>

              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {screen === "expired"
                  ? t("authPages.activation.expiredDescription")
                  : t("authPages.activation.invalidDescription")}
              </p>
            </div>

            <Form {...resendForm}>
              <form
                className="space-y-4"
                onSubmit={resendForm.handleSubmit(onResendActivation)}
              >
                <FloatingInputField
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  control={resendForm.control}
                  label={t("authPages.activation.workEmail")}
                />

                <Button
                  size="lg"
                  radius="xl"
                  type="submit"
                  variant="brand"
                  className="w-full"
                  disabled={isResending}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {t("authPages.activation.resending")}
                    </>
                  ) : (
                    t("authPages.activation.resend")
                  )}
                </Button>
              </form>
            </Form>

            <Button asChild radius="xl" variant="glass" className="w-full">
              <Link href={loginHref}>
                <LogIn className="h-4 w-4" />
                {t("authPages.common.backToLogin")}
              </Link>
            </Button>
          </div>
        )}
      </div>
    </GlassCard>
  );
};

export default OrgActivationCard;
