"use client";

import { ProfessionalProfileSettingsFormValues } from "@/types/professional-dashboard.types";
import { TProfessionalSettingProfile } from "@/types/professional-dashboard.types";
import { useForm, useWatch } from "react-hook-form";
import { useEffect } from "react";

type UseProfessionalProfileSettingsPanelParams = {
  settingsHook: TProfessionalSettingProfile["hook"];
};

export const useProfessionalProfileSettingsPanel = ({
  settingsHook,
}: UseProfessionalProfileSettingsPanelParams) => {
  const { profileForm, setProfileForm, saveProfile, isLoading } = settingsHook;

  const profileRhf = useForm<ProfessionalProfileSettingsFormValues>({
    mode: "onChange",
    defaultValues: {
      bio: profileForm.bio ?? "",
      phone: profileForm.phone ?? "",
      website: profileForm.website ?? "",
      fullName: profileForm.fullName ?? "",
      location: profileForm.location ?? "",
      education: profileForm.education ?? "",
      avatarUrl: profileForm.avatarUrl ?? "",
      occupation: profileForm.occupation ?? "",
    },
  });

  const profileValues = useWatch({
    control: profileRhf.control,
  });

  const bio = profileValues.bio ?? "";
  const phone = profileValues.phone ?? "";
  const website = profileValues.website ?? "";
  const fullName = profileValues.fullName ?? "";
  const location = profileValues.location ?? "";
  const education = profileValues.education ?? "";
  const avatarUrl = profileValues.avatarUrl ?? "";
  const occupation = profileValues.occupation ?? "";

  useEffect(() => {
    setProfileForm((prev) => ({
      ...prev,
      bio,
      phone,
      website,
      fullName,
      location,
      avatarUrl,
      education,
      occupation,
    }));
  }, [
    bio,
    phone,
    website,
    fullName,
    location,
    avatarUrl,
    education,
    occupation,
    setProfileForm,
  ]);

  const handleRemoveAvatar = () => {
    profileRhf.setValue("avatarUrl", "", {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setProfileForm((prev) => ({
      ...prev,
      avatarUrl: "",
    }));
  };

  const handleSaveProfile = profileRhf.handleSubmit(() => {
    saveProfile();
  });

  const isSaveDisabled = isLoading;

  return {
    profileRhf,
    isSaveDisabled,
    handleSaveProfile,
    handleRemoveAvatar,
    profileValues: {
      bio,
      phone,
      website,
      fullName,
      location,
      avatarUrl,
      education,
      occupation,
    },
  };
};
