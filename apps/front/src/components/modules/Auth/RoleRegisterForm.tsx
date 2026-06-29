"use client";

import { TRoleRegisterFormProps } from "@/types/auth-module.types";
import { useRoleRegisterForm } from "@/hooks/useRegisterForm";

import EmailOtpVerificationForm from "@modules/Auth/parts/EmailOtpVerification";
import RegisterDetailsForm from "@modules/Auth/parts/RegisterDetailsForm";
import AuthFlipCard from "@modules/Auth/parts/AuthFlipCard";

const RoleRegisterForm = (props: TRoleRegisterFormProps) => {
  const {
    step,
    otpForm,
    sendOtp,
    verifyOtp,
    resendOtp,
    isVerifying,
    isResending,
    registerForm,
    isRegistering,
    normalizedEmail,
    goBackToDetails,
  } = useRoleRegisterForm(props);

  return (
    <AuthFlipCard
      flipped={step === "otp"}
      front={
        <RegisterDetailsForm
          form={registerForm}
          onSubmit={sendOtp}
          isLoading={isRegistering}
        />
      }
      back={
        <EmailOtpVerificationForm
          form={otpForm}
          onVerify={verifyOtp}
          onResend={resendOtp}
          email={normalizedEmail}
          isVerifying={isVerifying}
          isResending={isResending}
          onBack={goBackToDetails}
          resendCooldownSeconds={60}
        />
      }
    />
  );
};

export default RoleRegisterForm;
