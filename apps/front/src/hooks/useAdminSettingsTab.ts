"use client";

import { useEffect, useMemo, useState } from "react";
import { useUpdateUserMutation } from "@/lib/rtk/endpoints/admin.api";
import { TAdminPasswordForm } from "@/types/admin-dashboard.types";
import { TAdminProfileForm } from "@/types/admin-dashboard.types";
import { TAdminEmailForm } from "@/types/admin-dashboard.types";
import { useForm } from "react-hook-form";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as API from "@/lib/rtk/endpoints/auth.api";

export const useAdminSettingsTab = () => {
  const { t } = useI18n();

  const {
    data: currentUserData,
    isFetching: isCurrentUserFetching,
    refetch: refetchCurrentUser,
  } = API.useCurrentUserQuery();

  const user = currentUserData?.user;

  const profileForm = useForm<TAdminProfileForm>({
    defaultValues: {
      fullName: "",
      avatarUrl: "",
      bio: "",
    },
  });

  const passwordForm = useForm<TAdminPasswordForm>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const emailForm = useForm<TAdminEmailForm>({
    defaultValues: {
      newEmail: "",
      code: "",
    },
  });

  const [otpSent, setOtpSent] = useState(false);

  const [updateUser, updateUserState] = useUpdateUserMutation();
  const [changePassword, changePasswordState] = API.useChangePasswordMutation();
  const [requestEmailChange, requestEmailChangeState] =
    API.useRequestEmailChangeMutation();
  const [verifyEmailChange, verifyEmailChangeState] =
    API.useVerifyEmailChangeMutation();

  useEffect(() => {
    if (!user) return;
    profileForm.reset({
      fullName: user.fullName ?? "",
      avatarUrl: user.avatarUrl ?? "",
      bio: user.bio ?? "",
    });
  }, [user, profileForm]);

  const saveProfile = profileForm.handleSubmit(async (values) => {
    if (!user?.id) return;
    try {
      await updateUser({
        userId: user.id,
        fullName: values.fullName.trim() || undefined,
        avatarUrl: values.avatarUrl.trim() || undefined,
        bio: values.bio.trim() || undefined,
      }).unwrap();
      await refetchCurrentUser();
      notify.success(t("adminDashboard.settings.messages.profileSaved"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  });

  const removeAvatar = async () => {
    profileForm.setValue("avatarUrl", "");
    await saveProfile();
  };

  const savePassword = passwordForm.handleSubmit(async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      notify.error(t("adminDashboard.settings.messages.passwordMismatch"));
      return;
    }
    try {
      await changePassword(values).unwrap();
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      notify.success(t("adminDashboard.settings.messages.passwordChanged"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  });

  const sendEmailOtp = emailForm.handleSubmit(async (values) => {
    try {
      await requestEmailChange({
        newEmail: values.newEmail.trim(),
      }).unwrap();
      setOtpSent(true);
      notify.success(t("adminDashboard.settings.messages.otpSent"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  });

  const verifyEmailOtp = emailForm.handleSubmit(async (values) => {
    try {
      await verifyEmailChange({
        newEmail: values.newEmail.trim(),
        code: values.code.trim(),
      }).unwrap();
      setOtpSent(false);
      emailForm.reset({
        newEmail: "",
        code: "",
      });
      await refetchCurrentUser();
      notify.success(t("adminDashboard.settings.messages.emailChanged"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  });

  const refreshAll = () => {
    void refetchCurrentUser();
  };

  const isLoading = useMemo(
    () =>
      isCurrentUserFetching ||
      updateUserState.isLoading ||
      changePasswordState.isLoading ||
      requestEmailChangeState.isLoading ||
      verifyEmailChangeState.isLoading,
    [
      isCurrentUserFetching,
      updateUserState.isLoading,
      changePasswordState.isLoading,
      requestEmailChangeState.isLoading,
      verifyEmailChangeState.isLoading,
    ],
  );

  return {
    t,
    user,
    otpSent,
    isLoading,
    emailForm,
    refreshAll,
    profileForm,
    saveProfile,
    passwordForm,
    removeAvatar,
    savePassword,
    sendEmailOtp,
    verifyEmailOtp,
  };
};
