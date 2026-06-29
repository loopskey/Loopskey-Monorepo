"use client";

import { TRoleLoginFormProps } from "@/types/auth-module.types";
import { useRoleLoginForm } from "@/hooks/useLoginForm";

import ForgotPasswordRequestForm from "@modules/Auth/parts/ForegetPasswordRequestForm";
import LoginCredentialsForm from "@modules/Auth/parts/LoginCredentialsForm";
import ResetPasswordForm from "@modules/Auth/parts/ResetPasswordForm";
import AuthFlipCard from "@modules/Auth/parts/AuthFlipCard";

const RoleLoginForm = ({ role }: TRoleLoginFormProps) => {
  const {
    step,
    onLogin,
    resetForm,
    loginForm,
    forgotForm,
    goToForgot,
    backToLogin,
    isLoggingIn,
    onResetPassword,
    onForgotPassword,
    isSendingResetCode,
    isResettingPassword,
    normalizedResetEmail,
  } = useRoleLoginForm({ role });

  return (
    <AuthFlipCard
      flipped={step !== "login"}
      front={
        <LoginCredentialsForm
          role={role}
          form={loginForm}
          onSubmit={onLogin}
          isLoading={isLoggingIn}
          onForgotPassword={goToForgot}
        />
      }
      back={
        step === "forgot" ? (
          <ForgotPasswordRequestForm
            form={forgotForm}
            onSubmit={onForgotPassword}
            onBackToLogin={backToLogin}
            isLoading={isSendingResetCode}
          />
        ) : (
          <ResetPasswordForm
            form={resetForm}
            onSubmit={onResetPassword}
            onBackToLogin={backToLogin}
            email={normalizedResetEmail}
            isLoading={isResettingPassword}
          />
        )
      }
    />
  );
};

export default RoleLoginForm;
