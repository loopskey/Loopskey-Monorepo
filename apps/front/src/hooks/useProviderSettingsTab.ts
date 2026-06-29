"use client";

import { useUpdateProviderSettingsMutation } from "@/lib/rtk/endpoints/provider.api";
import { useEffect, useMemo, useState } from "react";
import { useProviderSettingsQuery } from "@/lib/rtk/endpoints/provider.api";
import { emptyToUndefined } from "@/utils/function-helper";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as AAPI from "@/lib/rtk/endpoints/auth.api";

export const useProviderSettingsTab = () => {
  const { t } = useI18n();

  const {
    data: settings,
    isFetching: isSettingsFetching,
    refetch: refetchSettings,
  } = useProviderSettingsQuery();

  const {
    data: currentUserPayload,
    isFetching: isCurrentUserFetching,
    refetch: refetchCurrentUser,
  } = AAPI.useCurrentUserQuery();

  const currentUser = currentUserPayload?.user;

  const [updateProviderSettings, updateProviderSettingsState] =
    useUpdateProviderSettingsMutation();

  const [changePassword, changePasswordState] =
    AAPI.useChangePasswordMutation();

  const [requestEmailChange, requestEmailChangeState] =
    AAPI.useRequestEmailChangeMutation();

  const [verifyEmailChange, verifyEmailChangeState] =
    AAPI.useVerifyEmailChangeMutation();

  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  const [profileForm, setProfileForm] = useState({
    organizationName: "",
    organizationProfile: "",
    aboutOrganization: "",
    contactEmail: "",
  });

  const [notificationForm, setNotificationForm] = useState({
    newRegistrationAlertEnabled: true,
    eventReminderEnabled: true,
    reminderHoursBeforeEvent: 24,
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
    setProfileForm({
      organizationName: settings.organizationName ?? "",
      organizationProfile: settings.organizationProfile ?? "",
      aboutOrganization: settings.aboutOrganization ?? "",
      contactEmail: settings.contactEmail ?? "",
    });
    setNotificationForm({
      newRegistrationAlertEnabled: settings.newRegistrationAlertEnabled ?? true,
      eventReminderEnabled: settings.eventReminderEnabled ?? true,
      reminderHoursBeforeEvent: settings.reminderHoursBeforeEvent ?? 24,
    });
  }, [settings]);

  const saveProfileSettings = async () => {
    try {
      await updateProviderSettings({
        organizationName: emptyToUndefined(profileForm.organizationName),
        organizationProfile: emptyToUndefined(profileForm.organizationProfile),
        aboutOrganization: emptyToUndefined(profileForm.aboutOrganization),
        contactEmail: emptyToUndefined(profileForm.contactEmail),
      }).unwrap();
      await refetchSettings();
      notify.success(t("providerDashboard.settings.messages.profileSaved"));
      setActiveStep(2);
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const saveNotificationSettings = async () => {
    try {
      await updateProviderSettings({
        newRegistrationAlertEnabled:
          notificationForm.newRegistrationAlertEnabled,
        eventReminderEnabled: notificationForm.eventReminderEnabled,
        reminderHoursBeforeEvent: Number(
          notificationForm.reminderHoursBeforeEvent,
        ),
      }).unwrap();
      await refetchSettings();
      notify.success(
        t("providerDashboard.settings.messages.notificationsSaved"),
      );
      setActiveStep(3);
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const savePassword = async () => {
    try {
      await changePassword(passwordForm).unwrap();
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      notify.success(t("providerDashboard.settings.messages.passwordChanged"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const sendEmailChangeOtp = async () => {
    try {
      await requestEmailChange({
        newEmail: emailForm.newEmail.trim().toLowerCase(),
      }).unwrap();
      setEmailForm((prev) => ({ ...prev, otpSent: true }));
      notify.success(t("providerDashboard.settings.messages.otpSent"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const verifyEmailChangeOtp = async () => {
    try {
      await verifyEmailChange({
        newEmail: emailForm.newEmail.trim().toLowerCase(),
        code: emailForm.code.trim(),
      }).unwrap();
      setEmailForm({
        newEmail: "",
        code: "",
        otpSent: false,
      });
      await Promise.all([refetchCurrentUser(), refetchSettings()]);
      notify.success(t("providerDashboard.settings.messages.emailChanged"));
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
      isCurrentUserFetching ||
      changePasswordState.isLoading ||
      verifyEmailChangeState.isLoading ||
      requestEmailChangeState.isLoading ||
      updateProviderSettingsState.isLoading,
    [
      isSettingsFetching,
      isCurrentUserFetching,
      changePasswordState.isLoading,
      verifyEmailChangeState.isLoading,
      requestEmailChangeState.isLoading,
      updateProviderSettingsState.isLoading,
    ],
  );
  return {
    t,
    settings,
    isLoading,
    emailForm,
    activeStep,
    refreshAll,
    currentUser,
    profileForm,
    passwordForm,
    savePassword,
    setEmailForm,
    setActiveStep,
    setProfileForm,
    setPasswordForm,
    notificationForm,
    sendEmailChangeOtp,
    saveProfileSettings,
    setNotificationForm,
    verifyEmailChangeOtp,
    saveNotificationSettings,
  };
};
