"use client";

import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";

import * as T from "@/types/professional-dashboard.types";

type UseProfessionalSecuritySettingsPanelParams = {
  settingsHook: T.TProfessionaSettingSecurity["hook"];
};

export const useProfessionalSecuritySettingsPanel = ({
  settingsHook,
}: UseProfessionalSecuritySettingsPanelParams) => {
  const {
    isLoading,
    emailForm,
    setEmailForm,
    savePassword,
    passwordForm,
    setPasswordForm,
    sendEmailChangeOtp,
    verifyEmailChangeOtp,
  } = settingsHook;

  const passwordRhf = useForm<T.PasswordSecurityFormValues>({
    mode: "onChange",
    defaultValues: {
      currentPassword: passwordForm.currentPassword ?? "",
      newPassword: passwordForm.newPassword ?? "",
      confirmPassword: passwordForm.confirmPassword ?? "",
    },
  });

  const emailRhf = useForm<T.EmailSecurityFormValues>({
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

  const handleSendEmailOtp = emailRhf.handleSubmit(() => {
    sendEmailChangeOtp();
  });

  const handleVerifyEmail = emailRhf.handleSubmit(() => {
    verifyEmailChangeOtp();
  });

  const isPasswordSubmitDisabled = useMemo(() => {
    return (
      isLoading ||
      !currentPassword ||
      !newPassword ||
      !confirmPassword ||
      newPassword !== confirmPassword
    );
  }, [isLoading, currentPassword, newPassword, confirmPassword]);

  const isSendOtpDisabled = useMemo(() => {
    return isLoading || !newEmail;
  }, [isLoading, newEmail]);

  const isVerifyEmailDisabled = useMemo(() => {
    return isLoading || !code;
  }, [isLoading, code]);

  return {
    emailRhf,
    passwordRhf,
    isSendOtpDisabled,
    handleVerifyEmail,
    handleSavePassword,
    handleSendEmailOtp,
    isVerifyEmailDisabled,
    isPasswordSubmitDisabled,
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
