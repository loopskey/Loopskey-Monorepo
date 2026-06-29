"use client";

import { ArrowLeft, Loader2, Mail, KeyRound } from "lucide-react";
import { TForgotPasswordRequestFormProps } from "@/types/auth-module.types";
import { FloatingInputField } from "@elements/floating-input";
import { useI18n } from "@/hooks/useI18n";
import { Button } from "@ui/button";
import { Form } from "@ui/form";

const ForgotPasswordRequestForm = ({
  form,
  onSubmit,
  isLoading,
  onBackToLogin,
}: TForgotPasswordRequestFormProps) => {
  const { t } = useI18n();

  return (
    <Form {...form}>
      <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
            <KeyRound className="h-6 w-6" />
          </div>

          <h2 className="text-xl font-extrabold tracking-tight">
            {t("authPages.common.forgotPasswordTitle")}
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {t("authPages.common.forgotPasswordDescription")}
          </p>
        </div>

        <FloatingInputField
          name="email"
          type="email"
          autoComplete="email"
          control={form.control}
          label={t("authPages.common.email")}
          leftIcon={<Mail className="h-4 w-4" />}
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
              {t("authPages.common.sendingResetCode")}
            </>
          ) : (
            t("authPages.common.sendResetCode")
          )}
        </Button>

        <Button
          type="button"
          variant="glass"
          radius="xl"
          className="w-full"
          disabled={isLoading}
          onClick={onBackToLogin}
        >
          <ArrowLeft className="h-4 w-4" />
          {t("authPages.common.backToLogin")}
        </Button>
      </form>
    </Form>
  );
};

export default ForgotPasswordRequestForm;
