"use client";

import { KeyRound, ShieldAlert, ShieldCheck } from "lucide-react";
import { Loader2, LogIn, MailWarning } from "lucide-react";
import { useAssociationActivation } from "@hooks/useAssociationActivation";
import { PasswordField } from "@elements/password-field";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Form } from "@ui/form";

import Link from "next/link";

const AssociationActivationCard = () => {
  const {
    t,
    screen,
    loginHref,
    passwordForm,
    isActivating,
    onSetPassword,
    associationName,
  } = useAssociationActivation();

  const needsNewLink =
    screen === "expired" || screen === "invalid" || screen === "missingToken";

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
                  {t("authPages.associationActivation.title")}
                </h1>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {associationName
                    ? t(
                        "authPages.associationActivation.descriptionNamed",
                        { associationName },
                        `The account for ${associationName} is ready. Create a secure password to activate it.`,
                      )
                    : t("authPages.associationActivation.description")}
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

        {needsNewLink && (
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
                {t("authPages.associationActivation.requestNewLink")}
              </p>
            </div>

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

export default AssociationActivationCard;
