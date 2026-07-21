"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useI18n } from "@hooks/useI18n";
import { notify } from "@hooks/notify";

import * as API from "@lib/rtk/endpoints/auth.api";
import * as S from "@lib/validations/auth-form.schema";

export const usePasswordChangeRequired = () => {
  const { t } = useI18n();

  const [changePassword, changePasswordState] = API.useChangePasswordMutation();
  const [logout, logoutState] = API.useLogoutMutation();

  const form = useForm<S.TMandatoryPasswordChangeValues>({
    resolver: zodResolver(S.mandatoryPasswordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: S.TMandatoryPasswordChangeValues) => {
    try {
      await changePassword(values).unwrap();
      form.reset();
      notify.success(
        t("organizationDashboard.settings.messages.passwordChanged"),
      );
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const onLogout = async () => {
    try {
      await logout().unwrap();
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  return {
    t,
    form,
    onSubmit,
    onLogout,
    isSaving: changePasswordState.isLoading,
    isLoggingOut: logoutState.isLoading,
  };
};
