"use client";

import { TProfessionalProfile } from "@/types/professional-profile.types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useI18n } from "@/hooks/useI18n";
import { useForm } from "react-hook-form";
import { notify } from "@/hooks/notify";

import * as PAPI from "@/lib/rtk/endpoints/professional.api";
import * as C from "@/utils/professional-profile.constant";
import * as V from "@/lib/validations/professional-profile.schema";

const toDefaults = (
  profile?: TProfessionalProfile,
): V.TBasicProfileFormInput => ({
  fullName: profile?.fullName ?? "",
  linkedInUrl: profile?.linkedInUrl ?? "",
  countryCode: profile?.countryCode ?? "",
  timeZone: profile?.timeZone ?? "",
  language: profile?.language ?? undefined,
});

export const useProfessionalBasicProfileForm = (
  profile?: TProfessionalProfile,
) => {
  const { t, language } = useI18n();
  const [updateBasicProfile, updateState] =
    PAPI.useUpdateProfessionalBasicProfileMutation();

  const rhf = useForm<
    V.TBasicProfileFormInput,
    unknown,
    V.TBasicProfileFormValues
  >({
    mode: "onChange",
    resolver: zodResolver(V.basicProfileSchema),
    defaultValues: toDefaults(profile),
  });

  const { reset, formState } = rhf;
  const { isDirty } = formState;

  // A background refetch must never clobber edits in progress, so server values
  // are only pushed into the form while it is clean.
  useEffect(() => {
    if (!profile || isDirty) return;
    reset(toDefaults(profile), { keepDirty: false, keepTouched: false });
  }, [profile, isDirty, reset]);

  const countryOptions = useMemo(
    () => C.getCountryOptions(language),
    [language],
  );
  const timeZoneOptions = useMemo(() => C.getTimeZoneOptions(), []);

  const languageOptions = useMemo(
    () =>
      C.PROFILE_LANGUAGES.map((value) => ({
        value,
        label: t(C.enumI18nKey("language", value)),
      })),
    [t],
  );

  const handleSubmit = rhf.handleSubmit(async (values) => {
    try {
      const saved = await updateBasicProfile({
        fullName: values.fullName,
        linkedInUrl: values.linkedInUrl ?? null,
        countryCode: values.countryCode ?? null,
        timeZone: values.timeZone ?? null,
        language: values.language ?? null,
      }).unwrap();
      reset(toDefaults(saved), { keepDirty: false, keepTouched: false });
      notify.success(t("professionalDashboard.profile.saved"));
    } catch {
      notify.error(t("professionalDashboard.profile.errors.saveFailed"));
    }
  });

  return {
    t,
    rhf,
    handleSubmit,
    countryOptions,
    languageOptions,
    timeZoneOptions,
    isSaving: updateState.isLoading,
    hasError: Boolean(updateState.error),
    isSaveDisabled: updateState.isLoading || !isDirty,
  };
};
