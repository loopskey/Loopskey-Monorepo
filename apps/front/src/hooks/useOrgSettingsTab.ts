"use client";

import { useEffect, useMemo, useState } from "react";
import { useChangePasswordMutation } from "@/lib/rtk/endpoints/auth.api";
import { useCurrentUserQuery } from "@/lib/rtk/endpoints/auth.api";
import { ComplianceCycle } from "@/lib/graphql/generated";
import { useForm } from "react-hook-form";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as API from "@/lib/rtk/endpoints/org-dashboard.api";

type TComplianceForm = {
  minimumPdu: string;
  complianceCycle: ComplianceCycle;
  strictCompliance: boolean;
};

type TNotificationForm = {
  complianceAlerts: boolean;
  assignmentNotifications: boolean;
  weeklySummaryReport: boolean;
};

type TPasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type TDepartmentForm = {
  title: string;
};

export const useOrganizationSettingsTab = () => {
  const { t } = useI18n();

  const [forceDialogDismissed, setForceDialogDismissed] = useState(false);

  const { data: currentUserData, refetch: refetchCurrentUser } =
    useCurrentUserQuery();

  const { data: settings, isFetching: isSettingsFetching } =
    API.useOrganizationSettingsQuery();

  const { data: departmentsData, isFetching: isDepartmentsFetching } =
    API.useOrganizationDepartmentsQuery();

  const [updateSettings, updateSettingsState] =
    API.useUpdateOrganizationSettingsMutation();

  const [createDepartment, createDepartmentState] =
    API.useCreateOrganizationDepartmentMutation();

  const [changePassword, changePasswordState] = useChangePasswordMutation();

  const user = currentUserData?.user;
  const departments = departmentsData ?? [];

  const complianceForm = useForm<TComplianceForm>({
    defaultValues: {
      minimumPdu: "30",
      complianceCycle: ComplianceCycle.Annual,
      strictCompliance: false,
    },
  });

  const notificationForm = useForm<TNotificationForm>({
    defaultValues: {
      complianceAlerts: false,
      assignmentNotifications: false,
      weeklySummaryReport: false,
    },
  });

  const passwordForm = useForm<TPasswordForm>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const departmentForm = useForm<TDepartmentForm>({
    defaultValues: {
      title: "",
    },
  });

  useEffect(() => {
    if (!settings) return;
    complianceForm.reset({
      minimumPdu: String(settings.minimumPdu ?? 30),
      complianceCycle: settings.complianceCycle ?? ComplianceCycle.Annual,
      strictCompliance: Boolean(settings.strictCompliance),
    });
    notificationForm.reset({
      complianceAlerts: Boolean(settings.complianceAlerts),
      assignmentNotifications: Boolean(settings.assignmentNotifications),
      weeklySummaryReport: Boolean(settings.weeklySummaryReport),
    });
  }, [settings, complianceForm, notificationForm]);

  const saveComplianceRules = async (values: TComplianceForm) => {
    try {
      await updateSettings({
        minimumPdu: Number(values.minimumPdu || 0),
        complianceCycle: values.complianceCycle,
        strictCompliance: values.strictCompliance,
      }).unwrap();
      notify.success(
        t("organizationDashboard.settings.messages.complianceSaved"),
      );
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const saveNotificationPrefs = async (values: TNotificationForm) => {
    try {
      await updateSettings({
        complianceAlerts: values.complianceAlerts,
        assignmentNotifications: values.assignmentNotifications,
        weeklySummaryReport: values.weeklySummaryReport,
      }).unwrap();
      notify.success(
        t("organizationDashboard.settings.messages.notificationsSaved"),
      );
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const addDepartment = async (values: TDepartmentForm) => {
    const title = values.title.trim();
    if (!title) {
      notify.error(
        t("organizationDashboard.settings.messages.departmentRequired"),
      );
      return;
    }
    try {
      await createDepartment({
        title,
      }).unwrap();
      departmentForm.reset({ title: "" });
      notify.success(
        t("organizationDashboard.settings.messages.departmentAdded"),
      );
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const submitPasswordChange = async (values: TPasswordForm) => {
    if (values.newPassword !== values.confirmPassword) {
      notify.error(
        t("organizationDashboard.settings.messages.passwordMismatch"),
      );
      return;
    }
    try {
      await changePassword(values).unwrap();
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setForceDialogDismissed(true);
      await refetchCurrentUser();
      notify.success(
        t("organizationDashboard.settings.messages.passwordChanged"),
      );
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const isLoading = useMemo(
    () =>
      isSettingsFetching ||
      isDepartmentsFetching ||
      updateSettingsState.isLoading ||
      createDepartmentState.isLoading ||
      changePasswordState.isLoading,
    [
      isSettingsFetching,
      isDepartmentsFetching,
      updateSettingsState.isLoading,
      createDepartmentState.isLoading,
      changePasswordState.isLoading,
    ],
  );

  return {
    t,
    user,
    isLoading,
    departments,
    passwordForm,
    addDepartment,
    departmentForm,
    complianceForm,
    notificationForm,
    saveComplianceRules,
    submitPasswordChange,
    saveNotificationPrefs,
    forceDialogDismissed,
    setForceDialogDismissed,
    shouldShowForcePasswordDialog: Boolean(user?.forcePasswordChange),
  };
};
