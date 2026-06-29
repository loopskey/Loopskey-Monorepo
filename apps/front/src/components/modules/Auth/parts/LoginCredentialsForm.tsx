"use client";

import { TLoginCredentialsFormProps } from "@/types/auth-module.types";
import { FloatingInputField } from "@elements/floating-input";
import { Loader2, Mail } from "lucide-react";
import { PasswordField } from "@elements/password-field";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Form } from "@ui/form";

import SocialAuthButtons from "@modules/Auth/parts/SocialAithBtns";

const LoginCredentialsForm = ({
  role,
  form,
  isLoading,
  onSubmit,
  onForgotPassword,
}: TLoginCredentialsFormProps) => {
  const { t } = useI18n();

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <FloatingInputField
          name="email"
          type="email"
          autoComplete="email"
          control={form.control}
          label={t("authPages.common.email")}
          leftIcon={<Mail className="h-4 w-4" />}
        />

        <PasswordField
          name="password"
          control={form.control}
          autoComplete="current-password"
          label={t("authPages.common.password")}
        />

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm font-semibold text-primary hover:underline"
          >
            {t("authPages.common.forgotPassword")}
          </button>
        </div>

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
              {t("authPages.common.loggingIn")}
            </>
          ) : (
            t("authPages.common.loginButton")
          )}
        </Button>

        <SocialAuthButtons role={role} disabled={isLoading} />
      </form>
    </Form>
  );
};

export default LoginCredentialsForm;
