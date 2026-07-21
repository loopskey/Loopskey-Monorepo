"use client";

import { KeyRound, Loader2, LogOut, ShieldAlert } from "lucide-react";
import { usePasswordChangeRequired } from "@hooks/usePasswordChangeRequired";
import { PasswordField } from "@elements/password-field";
import { GlassCard } from "@elements/glass-card";
import { Button } from "@ui/button";
import { Form } from "@ui/form";

const PasswordChangeRequired = () => {
  const { t, form, onSubmit, onLogout, isSaving, isLoggingOut } =
    usePasswordChangeRequired();

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <GlassCard className="w-full max-w-md p-6 sm:p-8" glow={false}>
        <div className="relative z-10">
          <Form {...form}>
            <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 shadow-inner dark:text-amber-300">
                  <ShieldAlert className="h-6 w-6" />
                </div>

                <h1 className="text-xl font-extrabold tracking-tight">
                  {t("organizationDashboard.settings.forcePassword.title")}
                </h1>

                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {t(
                    "organizationDashboard.settings.forcePassword.description",
                  )}
                </p>
              </div>

              <PasswordField
                name="currentPassword"
                control={form.control}
                autoComplete="current-password"
                label={t("authPages.activation.currentPassword")}
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
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t("authPages.common.savingNewPassword")}
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    {t("authPages.common.saveNewPassword")}
                  </>
                )}
              </Button>

              <Button
                radius="xl"
                type="button"
                variant="glass"
                className="w-full"
                onClick={onLogout}
                disabled={isLoggingOut}
              >
                <LogOut className="h-4 w-4" />
                {t("userMenu.logout")}
              </Button>
            </form>
          </Form>
        </div>
      </GlassCard>
    </main>
  );
};

export default PasswordChangeRequired;
