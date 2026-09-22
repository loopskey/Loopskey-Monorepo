"use client";

import { TRoleLoginFormProps } from "@/types/auth-module.types";
import { useRoleLoginForm } from "@/hooks/useLoginForm";

import ForgotPasswordRequestForm from "@modules/Auth/parts/ForegetPasswordRequestForm";
import LoginCredentialsForm from "@modules/Auth/parts/LoginCredentialsForm";
import ResetPasswordForm from "@modules/Auth/parts/ResetPasswordForm";
import AuthStepPanel from "@modules/Auth/parts/AuthStepPanel";

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
    <AuthStepPanel stepKey={step}>
      {step === "forgot" ? (
        <ForgotPasswordRequestForm
          form={forgotForm}
          onSubmit={onForgotPassword}
          onBackToLogin={backToLogin}
          isLoading={isSendingResetCode}
        />
      ) : step === "reset" ? (
        <ResetPasswordForm
          form={resetForm}
          onSubmit={onResetPassword}
          onBackToLogin={backToLogin}
          email={normalizedResetEmail}
          isLoading={isResettingPassword}
        />
      ) : (
        <LoginCredentialsForm
          role={role}
          form={loginForm}
          onSubmit={onLogin}
          isLoading={isLoggingIn}
          onForgotPassword={goToForgot}
        />
      )}
    </AuthStepPanel>
  );
};

export default RoleLoginForm;
