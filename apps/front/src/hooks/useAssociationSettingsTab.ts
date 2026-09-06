"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getAssociationErrorTranslationKey } from "@utils/association-error";
import { CreditType } from "@/lib/graphql/base";
import { useForm } from "react-hook-form";
import { useI18n } from "@hooks/useI18n";
import { notify } from "@hooks/notify";

import * as API from "@lib/rtk/endpoints/association-dashboard.api";
import * as S from "@utils/association-settings";

type TProfileForm = {
  name: string;
  description: string;
  country: string;
  website: string;
  contactEmail: string;
};

type TComplianceForm = {
  defaultCreditType: CreditType;
  onTrackThreshold: number;
  atRiskThreshold: number;
  renewalRequiresReviewedEvidence: boolean;
};

type TNotificationForm = {
  complianceReminders: boolean;
  welcomeMessages: boolean;
  weeklyDigest: boolean;
  suppressAllEmail: boolean;
};

type TImpact = {
  totalMembers: number;
  membersChangingBand: number;
  membersEnteringAtRisk: number;
  membersLeavingAtRisk: number;
};

export const useAssociationSettingsTab = () => {
  const { t } = useI18n();

  const profileQuery = API.useAssociationProfileQuery();
  const settingsQuery = API.useAssociationSettingsQuery();

  const [updateProfile, updateProfileState] =
    API.useUpdateAssociationProfileMutation();

  const [updateCompliance, updateComplianceState] =
    API.useUpdateAssociationComplianceSettingsMutation();

  const [updateNotifications, updateNotificationsState] =
    API.useUpdateAssociationNotificationSettingsMutation();

  const association = profileQuery.data ?? null;
  const settings = settingsQuery.data ?? null;

  const label = useCallback(
    (key: string, vars?: Record<string, string | number>) =>
      t(`associationDashboard.settings.${key}`, vars),
    [t],
  );

  const profileForm = useForm<TProfileForm>({
    defaultValues: {
      name: "",
      description: "",
      country: "",
      website: "",
      contactEmail: "",
    },
  });

  const complianceForm = useForm<TComplianceForm>({
    defaultValues: {
      defaultCreditType: CreditType.Cpd,
      onTrackThreshold: 70,
      atRiskThreshold: 40,
      renewalRequiresReviewedEvidence: true,
    },
  });

  const notificationForm = useForm<TNotificationForm>({
    defaultValues: {
      complianceReminders: true,
      welcomeMessages: true,
      weeklyDigest: true,
      suppressAllEmail: false,
    },
  });

  const loadedProfile = useRef(false);
  const loadedSettings = useRef(false);

  useEffect(() => {
    if (!association || loadedProfile.current) return;
    loadedProfile.current = true;

    profileForm.reset({
      name: association.name,
      description: association.description ?? "",
      country: association.country ?? "",
      website: association.website ?? "",
      contactEmail: association.contactEmail ?? "",
    });
  }, [association, profileForm]);

  useEffect(() => {
    if (!settings || loadedSettings.current) return;
    loadedSettings.current = true;

    complianceForm.reset({
      defaultCreditType: settings.defaultCreditType,
      onTrackThreshold: settings.onTrackThreshold,
      atRiskThreshold: settings.atRiskThreshold,
      renewalRequiresReviewedEvidence: settings.renewalRequiresReviewedEvidence,
    });

    notificationForm.reset({
      complianceReminders: settings.complianceReminders,
      welcomeMessages: settings.welcomeMessages,
      weeklyDigest: settings.weeklyDigest,
      suppressAllEmail: settings.suppressAllEmail,
    });
  }, [settings, complianceForm, notificationForm]);

  const failed = (error: unknown) =>
    notify.error(t(getAssociationErrorTranslationKey(error)));

  const saveProfile = profileForm.handleSubmit(async (values) => {
    try {
      await updateProfile({
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        country: values.country.trim() || undefined,
        website: values.website.trim() || undefined,
        contactEmail: values.contactEmail.trim() || undefined,
      }).unwrap();

      notify.success(label("profile.saved"));
    } catch (error) {
      failed(error);
    }
  });

  const [pending, setPending] = useState<TComplianceForm | null>(null);
  const [impact, setImpact] = useState<TImpact | null>(null);

  const closeConfirmation = () => {
    setPending(null);
    setImpact(null);
  };

  const applyCompliance = async (
    values: TComplianceForm,
    dryRun: boolean,
  ) => {
    if (!settings) return null;

    return updateCompliance({
      defaultCreditType: values.defaultCreditType,
      onTrackThreshold: Number(values.onTrackThreshold),
      atRiskThreshold: Number(values.atRiskThreshold),
      renewalRequiresReviewedEvidence: values.renewalRequiresReviewedEvidence,
      expectedUpdatedAt: settings.updatedAt,
      dryRun,
    }).unwrap();
  };

  const reviewCompliance = complianceForm.handleSubmit(async (values) => {
    if (!settings) return;

    const onTrack = Number(values.onTrackThreshold);
    const atRisk = Number(values.atRiskThreshold);

    if (!S.isThresholdPairValid(atRisk, onTrack)) {
      const message = label("compliance.orderInvalid");
      complianceForm.setError("atRiskThreshold", { message });
      complianceForm.setError("onTrackThreshold", { message });
      return;
    }

    try {
      const outcome = await applyCompliance(values, true);
      if (!outcome) return;

      setImpact(outcome.impact);
      setPending(values);
    } catch (error) {
      failed(error);
    }
  });

  const confirmCompliance = async () => {
    if (!pending) return;

    try {
      await applyCompliance(pending, false);
      notify.success(label("compliance.saved"));
      loadedSettings.current = false;
      closeConfirmation();
    } catch (error) {
      failed(error);
      closeConfirmation();
    }
  };

  const saveNotifications = notificationForm.handleSubmit(async (values) => {
    if (!settings) return;

    try {
      await updateNotifications({
        complianceReminders: values.complianceReminders,
        welcomeMessages: values.welcomeMessages,
        weeklyDigest: values.weeklyDigest,
        suppressAllEmail: values.suppressAllEmail,
        expectedUpdatedAt: settings.updatedAt,
      }).unwrap();

      notify.success(label("notifications.saved"));
      loadedSettings.current = false;
    } catch (error) {
      failed(error);
    }
  });

  const [isLogoBusy, setIsLogoBusy] = useState(false);

  const uploadLogo = async (file: File) => {
    const rejection = S.rejectionOf(file);

    if (rejection) {
      notify.error(
        label(
          rejection === "size" ? "branding.tooLarge" : "branding.wrongType",
          { limit: S.LOGO_MAX_MB, types: S.LOGO_ACCEPT_ATTRIBUTE },
        ),
      );
      return;
    }

    setIsLogoBusy(true);

    try {
      await S.uploadAssociationLogo(file);
      await profileQuery.refetch();
      notify.success(label("branding.saved"));
    } catch {
      notify.error(label("branding.failed"));
    } finally {
      setIsLogoBusy(false);
    }
  };

  const removeLogo = async () => {
    setIsLogoBusy(true);

    try {
      await S.removeAssociationLogo();
      await profileQuery.refetch();
      notify.success(label("branding.removed"));
    } catch {
      notify.error(label("branding.failed"));
    } finally {
      setIsLogoBusy(false);
    }
  };

  return {
    t,
    label,
    impact,
    pending,
    settings,
    association,
    profileForm,
    complianceForm,
    notificationForm,
    saveProfile,
    reviewCompliance,
    confirmCompliance,
    closeConfirmation,
    saveNotifications,
    uploadLogo,
    removeLogo,
    isLogoBusy,
    logoUrl: S.resolveAssociationLogoUrl(association?.logoUrl),
    isLoading: profileQuery.isLoading || settingsQuery.isLoading,
    isError: profileQuery.isError || settingsQuery.isError,
    retry: () => {
      void profileQuery.refetch();
      void settingsQuery.refetch();
    },
    isSavingProfile: updateProfileState.isLoading,
    isSavingCompliance: updateComplianceState.isLoading,
    isSavingNotifications: updateNotificationsState.isLoading,
  };
};

export type TUseAssociationSettingsTab = ReturnType<
  typeof useAssociationSettingsTab
>;
