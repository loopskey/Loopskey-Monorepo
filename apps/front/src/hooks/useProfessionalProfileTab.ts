"use client";

import { useEffect } from "react";
import { useI18n } from "@/hooks/useI18n";
import { useForm } from "react-hook-form";
import { notify } from "@/hooks/notify";

import * as PAPI from "@/lib/rtk/endpoints/professional.api";
import * as AAPI from "@/lib/rtk/endpoints/auth.api";
import * as T from "@/types/hooks.types";

const EMPTY_PROFILE_FORM_VALUES: T.TProfessionalProfileFormValues = {
  fullName: "",
  phone: "",
  location: "",
  website: "",
  education: "",
  occupation: "",
  avatarUrl: "",
  bio: "",
};

const toFormString = (value?: string | null) => value ?? "";

const toNullableString = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const toOptionalString = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const mapProfileToFormValues = (
  profile?: T.TProfessionalProfileSource | null,
): T.TProfessionalProfileFormValues => {
  if (!profile) return EMPTY_PROFILE_FORM_VALUES;
  return {
    fullName: toFormString(profile.fullName),
    phone: toFormString(profile.phone),
    location: toFormString(profile.location),
    website: toFormString(profile.website),
    education: toFormString(profile.education),
    occupation: toFormString(profile.occupation),
    avatarUrl: toFormString(profile.avatarUrl),
    bio: toFormString(profile.bio),
  };
};

export const useProfessionalProfileTab = () => {
  const { t } = useI18n();
  const {
    data: profile,
    isFetching: isProfileFetching,
    refetch: refetchProfile,
  } = PAPI.useProfessionalDashboardProfileQuery();
  const { refetch: refetchCurrentUser } = AAPI.useCurrentUserQuery();
  const [updateProfile, updateProfileState] =
    PAPI.useUpdateProfessionalDashboardProfileMutation();
  const profileRhf = useForm<T.TProfessionalProfileFormValues>({
    mode: "onChange",
    defaultValues: EMPTY_PROFILE_FORM_VALUES,
  });
  useEffect(() => {
    if (!profile) return;
    profileRhf.reset(mapProfileToFormValues(profile), {
      keepDirty: false,
      keepTouched: false,
    });
  }, [profile, profileRhf]);
  const profileValues = profileRhf.watch();
  const refreshProfile = async () => {
    await Promise.all([refetchProfile(), refetchCurrentUser()]);
  };
  const handleRemoveAvatar = () => {
    profileRhf.setValue("avatarUrl", "", {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const handleSaveProfile = profileRhf.handleSubmit(async (values) => {
    try {
      const input = {
        fullName: toOptionalString(values.fullName),
        phone: toNullableString(values.phone),
        location: toNullableString(values.location),
        website: toNullableString(values.website),
        education: toNullableString(values.education),
        occupation: toNullableString(values.occupation),
        avatarUrl: toNullableString(values.avatarUrl),
        bio: toNullableString(values.bio),
      };
      const savedProfile = await updateProfile(input).unwrap();
      profileRhf.reset(mapProfileToFormValues(savedProfile), {
        keepDirty: false,
        keepTouched: false,
      });
      await refreshProfile();
      notify.success(t("professionalDashboard.settings.profileSaved"));
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  });

  const isLoading = isProfileFetching || updateProfileState.isLoading;
  const isSaveDisabled = isLoading || !profileRhf.formState.isDirty;

  return {
    t,
    profile,
    isLoading,
    profileRhf,
    profileValues,
    refreshProfile,
    isSaveDisabled,
    handleSaveProfile,
    handleRemoveAvatar,
  };
};

export type UseProfessionalProfileTabReturn = ReturnType<
  typeof useProfessionalProfileTab
>;
