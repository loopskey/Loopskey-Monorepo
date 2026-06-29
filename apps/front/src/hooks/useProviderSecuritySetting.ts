"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";

import * as T from "@/types/hooks.types";

export const useProviderSecuritySettingsStep = ({
  hook,
}: T.UseProviderSecuritySettingsStepParams) => {
  const {
    emailForm,
    isLoading,
    setEmailForm,
    savePassword,
    passwordForm,
    setPasswordForm,
    sendEmailChangeOtp,
    verifyEmailChangeOtp,
  } = hook;

  const passwordRhf = useForm<T.ProviderPasswordSecurityFormValues>({
    mode: "onChange",
    defaultValues: {
      currentPassword: passwordForm.currentPassword ?? "",
      newPassword: passwordForm.newPassword ?? "",
      confirmPassword: passwordForm.confirmPassword ?? "",
    },
  });

  const emailRhf = useForm<T.ProviderEmailSecurityFormValues>({
    mode: "onChange",
    defaultValues: {
      newEmail: emailForm.newEmail ?? "",
      code: emailForm.code ?? "",
    },
  });

  const passwordValues = useWatch({
    control: passwordRhf.control,
  });

  const emailValues = useWatch({
    control: emailRhf.control,
  });

  const currentPassword = passwordValues.currentPassword ?? "";
  const newPassword = passwordValues.newPassword ?? "";
  const confirmPassword = passwordValues.confirmPassword ?? "";

  const newEmail = emailValues.newEmail ?? "";
  const code = emailValues.code ?? "";

  useEffect(() => {
    setPasswordForm((prev) => ({
      ...prev,
      currentPassword,
      newPassword,
      confirmPassword,
    }));
  }, [currentPassword, newPassword, confirmPassword, setPasswordForm]);

  useEffect(() => {
    setEmailForm((prev) => ({
      ...prev,
      newEmail,
      code,
    }));
  }, [newEmail, code, setEmailForm]);

  const handleSavePassword = passwordRhf.handleSubmit(() => {
    savePassword();
  });

  const handleSendEmailChangeOtp = emailRhf.handleSubmit(() => {
    sendEmailChangeOtp();
  });

  const handleVerifyEmailChangeOtp = emailRhf.handleSubmit(() => {
    verifyEmailChangeOtp();
  });

  const isPasswordSubmitDisabled = useMemo(() => {
    return (
      isLoading ||
      !currentPassword.trim() ||
      !newPassword.trim() ||
      !confirmPassword.trim() ||
      newPassword !== confirmPassword
    );
  }, [isLoading, currentPassword, newPassword, confirmPassword]);

  const isSendOtpDisabled = useMemo(() => {
    return isLoading || !newEmail.trim();
  }, [isLoading, newEmail]);

  const isVerifyEmailDisabled = useMemo(() => {
    return isLoading || !code.trim();
  }, [isLoading, code]);

  return {
    emailRhf,
    passwordRhf,
    isSendOtpDisabled,
    handleSavePassword,
    isVerifyEmailDisabled,
    isPasswordSubmitDisabled,
    handleSendEmailChangeOtp,
    handleVerifyEmailChangeOtp,
    passwordValues: {
      newPassword,
      currentPassword,
      confirmPassword,
    },
    emailValues: {
      code,
      newEmail,
    },
  };
};
