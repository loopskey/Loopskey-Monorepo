"use client";

import { AppLanguage, ProfileVisibility, Theme } from "@/lib/graphql/generated";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as PAPI from "@/lib/rtk/endpoints/professional.api";
import * as AAPI from "@/lib/rtk/endpoints/auth.api";

export const useProfessionalSettingsTab = () => {
  const { t, setLanguage } = useI18n();
  const { setTheme } = useTheme();

  const [changePassword, changePasswordState] =
    AAPI.useChangePasswordMutation();

  const [requestEmailChange, requestEmailChangeState] =
    AAPI.useRequestEmailChangeMutation();

  const [verifyEmailChange, verifyEmailChangeState] =
    AAPI.useVerifyEmailChangeMutation();

  const {
    data: settings,
    isFetching: isSettingsFetching,
    refetch: refetchSettings,
  } = PAPI.useProfessionalSettingsQuery();

  const { refetch: refetchCurrentUser } = AAPI.useCurrentUserQuery();

  const [updateSettings, updateSettingsState] =
    PAPI.useUpdateProfessionalSettingsMutation();

  const [resetSettings, resetSettingsState] =
    PAPI.useResetProfessionalSettingsMutation();

  const [settingsForm, setSettingsForm] = useState({
    messages: true,
    showEmail: false,
    loginAlerts: true,
    theme: Theme.System,
    courseUpdates: true,
    eventReminders: true,
    showCertificates: true,
    pushNotifications: true,
    emailNotifications: true,
    showLearningProgress: true,
    interfaceLanguage: AppLanguage.En,
    profileVisibility: ProfileVisibility.Public,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [emailForm, setEmailForm] = useState({
    newEmail: "",
    code: "",
    otpSent: false,
  });

  useEffect(() => {
    if (!settings) return;
    setSettingsForm({
      theme: settings.theme,
      messages: settings.messages,
      showEmail: settings.showEmail,
      loginAlerts: settings.loginAlerts,
      courseUpdates: settings.courseUpdates,
      eventReminders: settings.eventReminders,
      showCertificates: settings.showCertificates,
      interfaceLanguage: settings.interfaceLanguage,
      profileVisibility: settings.profileVisibility,
      pushNotifications: settings.pushNotifications,
      emailNotifications: settings.emailNotifications,
      showLearningProgress: settings.showLearningProgress,
    });
  }, [settings]);

  const applyAppPreferences = (input: {
    interfaceLanguage?: AppLanguage | null;
    theme?: Theme | null;
  }) => {
    if (input.theme) {
      const themeMap: Record<Theme, "light" | "dark" | "system"> = {
        [Theme.Light]: "light",
        [Theme.Dark]: "dark",
        [Theme.System]: "system",
      };
      setTheme(themeMap[input.theme]);
    }

    if (input.interfaceLanguage) {
      const localeMap: Record<AppLanguage, "en" | "fr"> = {
        [AppLanguage.En]: "en",
        [AppLanguage.Fr]: "fr",
      };
      setLanguage(localeMap[input.interfaceLanguage]);
    }
  };

  const saveGeneralSettings = async () => {
    try {
      const saved = await updateSettings({
        interfaceLanguage: settingsForm.interfaceLanguage,
        theme: settingsForm.theme,
      }).unwrap();
      applyAppPreferences(saved);
      notify.success(t("professionalDashboard.settings.saved"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const saveNotificationSettings = async () => {
    try {
      await updateSettings({
        messages: settingsForm.messages,
        loginAlerts: settingsForm.loginAlerts,
        courseUpdates: settingsForm.courseUpdates,
        eventReminders: settingsForm.eventReminders,
        pushNotifications: settingsForm.pushNotifications,
        emailNotifications: settingsForm.emailNotifications,
      }).unwrap();
      notify.success(t("professionalDashboard.settings.saved"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const savePrivacySettings = async () => {
    try {
      await updateSettings({
        showEmail: settingsForm.showEmail,
        showCertificates: settingsForm.showCertificates,
        profileVisibility: settingsForm.profileVisibility,
        showLearningProgress: settingsForm.showLearningProgress,
      }).unwrap();
      notify.success(t("professionalDashboard.settings.saved"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const resetPrivacySettings = async () => {
    try {
      const saved = await resetSettings().unwrap();
      setSettingsForm((prev) => ({
        ...prev,
        showEmail: saved.showEmail,
        showCertificates: saved.showCertificates,
        profileVisibility: saved.profileVisibility,
        showLearningProgress: saved.showLearningProgress,
      }));
      notify.success(t("professionalDashboard.settings.resetDone"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const savePassword = async () => {
    try {
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword,
      }).unwrap();
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      notify.success(
        t("professionalDashboard.settings.security.passwordChanged"),
      );
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const sendEmailChangeOtp = async () => {
    try {
      await requestEmailChange({
        newEmail: emailForm.newEmail,
      }).unwrap();
      setEmailForm((prev) => ({
        ...prev,
        otpSent: true,
      }));
      notify.success(t("professionalDashboard.settings.security.otpSent"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const verifyEmailChangeOtp = async () => {
    try {
      await verifyEmailChange({
        newEmail: emailForm.newEmail,
        code: emailForm.code,
      }).unwrap();
      setEmailForm({
        newEmail: "",
        code: "",
        otpSent: false,
      });
      await refetchCurrentUser();
      notify.success(t("professionalDashboard.settings.security.emailChanged"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const refreshAll = () => {
    void refetchSettings();
    void refetchCurrentUser();
  };

  const isLoading = useMemo(
    () =>
      isSettingsFetching ||
      updateSettingsState.isLoading ||
      resetSettingsState.isLoading ||
      changePasswordState.isLoading ||
      requestEmailChangeState.isLoading ||
      verifyEmailChangeState.isLoading,
    [
      isSettingsFetching,
      updateSettingsState.isLoading,
      resetSettingsState.isLoading,
      changePasswordState.isLoading,
      requestEmailChangeState.isLoading,
      verifyEmailChangeState.isLoading,
    ],
  );

  return {
    t,
    settings,
    isLoading,
    emailForm,
    refreshAll,
    settingsForm,
    passwordForm,
    setEmailForm,
    savePassword,
    setSettingsForm,
    setPasswordForm,
    sendEmailChangeOtp,
    saveGeneralSettings,
    savePrivacySettings,
    resetPrivacySettings,
    verifyEmailChangeOtp,
    saveNotificationSettings,
  };
};
