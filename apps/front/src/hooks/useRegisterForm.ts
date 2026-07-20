"use client";

import { TRoleRegisterFormProps } from "@/types/auth-module.types";
import { useMemo, useState } from "react";
import { getAuthErrorCode } from "@/utils/auth-error";
import { getDashboardPath } from "@/utils/constant";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as API from "@/lib/rtk/endpoints/auth.api";
import * as S from "@/lib/validations/auth-form.schema";

type TRegisterStep = "details" | "otp";

export const useRoleRegisterForm = ({
  role,
  onVerified,
}: TRoleRegisterFormProps) => {
  const { t } = useI18n();
  const router = useRouter();

  const [step, setStep] = useState<TRegisterStep>("details");
  const [pendingEmail, setPendingEmail] = useState("");

  const [register, registerState] = API.useRegisterMutation();
  const [verifyEmailOtp, verifyState] = API.useVerifyEmailOtpMutation();
  const [resendEmailOtp, resendState] = API.useResendEmailOtpMutation();

  const registerForm = useForm<S.TRegisterValues>({
    resolver: zodResolver(S.registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const otpForm = useForm<S.TOtpVerificationValues>({
    resolver: zodResolver(S.otpVerificationSchema),
    defaultValues: {
      code: "",
    },
  });

  const normalizedEmail = useMemo(
    () => pendingEmail.trim().toLowerCase(),
    [pendingEmail],
  );

  const sendOtp = async (values: S.TRegisterValues) => {
    try {
      const email = values.email.trim().toLowerCase();
      await register({
        role,
        email,
        password: values.password,
        fullName: values.fullName.trim(),
        confirmPassword: values.confirmPassword,
      }).unwrap();
      setPendingEmail(email);
      otpForm.reset({ code: "" });
      setStep("otp");
      notify.success(t("authPages.common.otpSent"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const verifyOtp = async (values: S.TOtpVerificationValues) => {
    if (!normalizedEmail) return;
    try {
      const res = await verifyEmailOtp({
        email: normalizedEmail,
        code: values.code.trim().toUpperCase(),
      }).unwrap();
      notify.success(t("authPages.common.accountCreated"));
      registerForm.reset();
      otpForm.reset({ code: "" });
      setPendingEmail("");
      setStep("details");
      onVerified?.();
      router.replace(getDashboardPath(res.user?.role));
    } catch (error) {
      setStep("otp");
      const errorCode = getAuthErrorCode(error);
      const errorMessage =
        errorCode === "OTP_EXPIRED"
          ? t("authPages.common.otpExpired")
          : errorCode === "OTP_ATTEMPTS_EXCEEDED"
            ? t("authPages.common.otpAttemptsExceeded")
            : t("authPages.common.invalidOtp");
      otpForm.setError("code", {
        type: "server",
        message: errorMessage,
      });
      notify.error(errorMessage);
    }
  };

  const resendOtp = async () => {
    if (!normalizedEmail) return;
    try {
      await resendEmailOtp({ email: normalizedEmail }).unwrap();
      notify.success(t("authPages.common.otpResent"));
    } catch (error) {
      notify.error(t("authPages.common.genericError"));
      throw error;
    }
  };

  const goBackToDetails = () => {
    otpForm.reset({ code: "" });
    setStep("details");
  };

  return {
    t,
    step,
    otpForm,
    sendOtp,
    resendOtp,
    verifyOtp,
    registerForm,
    goBackToDetails,
    normalizedEmail,
    isVerifying: verifyState.isLoading,
    isResending: resendState.isLoading,
    isRegistering: registerState.isLoading,
  };
};
