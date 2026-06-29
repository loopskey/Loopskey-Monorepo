"use client";

import { TRegisterDetailsFormProps } from "@/types/auth-module.types";
import { Loader2, Mail, UserRound } from "lucide-react";
import { FloatingInputField } from "@elements/floating-input";
import { PasswordField } from "@elements/password-field";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Form } from "@ui/form";

const RegisterDetailsForm = ({
  form,
  onSubmit,
  isLoading,
}: TRegisterDetailsFormProps) => {
  const { t } = useI18n();

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <FloatingInputField
          name="fullName"
          autoComplete="name"
          control={form.control}
          label={t("authPages.common.fullName")}
          leftIcon={<UserRound className="h-4 w-4" />}
        />

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
          label={t("authPages.common.password")}
        />

        <PasswordField
          name="confirmPassword"
          control={form.control}
          label={t("authPages.common.confirmPassword")}
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
              {t("authPages.common.sendingVerificationCode")}
            </>
          ) : (
            t("authPages.common.sendVerificationCode")
          )}
        </Button>
      </form>
    </Form>
  );
};

export default RegisterDetailsForm;
