"use client";

import { useMemo, useState } from "react";
import { getDashboardPath } from "@/utils/constant";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";
import { Role } from "@/lib/graphql/generated";

import * as API from "@/lib/rtk/endpoints/auth.api";
import * as S from "@/lib/validations/auth-form.schema";

type TLoginStep = "login" | "forgot" | "reset";

export const useRoleLoginForm = ({ role }: { role: Role }) => {
  const { t } = useI18n();
  const router = useRouter();

  const [step, setStep] = useState<TLoginStep>("login");
  const [resetEmail, setResetEmail] = useState("");

  const [login, loginState] = API.useLoginMutation();
  const [forgotPassword, forgotPasswordState] = API.useForgotPasswordMutation();
  const [resetPassword, resetPasswordState] = API.useResetPasswordMutation();

  const loginForm = useForm<S.TLoginValues>({
    resolver: zodResolver(S.loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const forgotForm = useForm<S.TForgotPasswordValues>({
    resolver: zodResolver(S.forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const resetForm = useForm<S.TResetPasswordValues>({
    resolver: zodResolver(S.resetPasswordSchema),
    defaultValues: {
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const normalizedResetEmail = useMemo(
    () => resetEmail.trim().toLowerCase(),
    [resetEmail],
  );

  const onLogin = async (values: S.TLoginValues) => {
    try {
      const res = await login({
        role,
        email: values.email.trim().toLowerCase(),
        password: values.password,
      }).unwrap();
      notify.success(t("authPages.common.loginSuccess"));
      router.replace(getDashboardPath(res.user?.role));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const onForgotPassword = async (values: S.TForgotPasswordValues) => {
    try {
      const email = values.email.trim().toLowerCase();
      await forgotPassword({ email }).unwrap();
      setResetEmail(email);
      resetForm.reset({
        code: "",
        newPassword: "",
        confirmPassword: "",
      });
      setStep("reset");
      notify.success(t("authPages.common.resetCodeSent"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const onResetPassword = async (values: S.TResetPasswordValues) => {
    try {
      await resetPassword({
        email: normalizedResetEmail,
        code: values.code.trim().toUpperCase(),
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      }).unwrap();
      notify.success(t("authPages.common.passwordResetSuccess"));
      forgotForm.reset();
      resetForm.reset();
      setResetEmail("");
      setStep("login");
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const goToForgot = () => {
    const email = loginForm.getValues("email");
    if (email) forgotForm.setValue("email", email.trim().toLowerCase());
    setStep("forgot");
  };

  const backToLogin = () => setStep("login");

  return {
    t,
    step,
    onLogin,
    loginForm,
    resetForm,
    forgotForm,
    goToForgot,
    backToLogin,
    onResetPassword,
    onForgotPassword,
    normalizedResetEmail,
    isLoggingIn: loginState.isLoading,
    isSendingResetCode: forgotPasswordState.isLoading,
    isResettingPassword: resetPasswordState.isLoading,
  };
};
