"use client";

import { TRoleRegisterFormProps } from "@/types/auth-module.types";
import { useRoleRegisterForm } from "@/hooks/useRegisterForm";

import EmailOtpVerificationForm from "@modules/Auth/parts/EmailOtpVerification";
import RegisterDetailsForm from "@modules/Auth/parts/RegisterDetailsForm";
import AuthStepPanel from "@modules/Auth/parts/AuthStepPanel";

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
    <AuthStepPanel stepKey={step}>
      {step === "otp" ? (
        <EmailOtpVerificationForm
          form={otpForm}
          onVerify={verifyOtp}
          onResend={resendOtp}
          email={normalizedEmail}
          onBack={goBackToDetails}
          isVerifying={isVerifying}
          isResending={isResending}
          resendCooldownSeconds={60}
        />
      ) : (
        <RegisterDetailsForm
          form={registerForm}
          onSubmit={sendOtp}
          isLoading={isRegistering}
        />
      )}
    </AuthStepPanel>
  );
};

export default RoleRegisterForm;
