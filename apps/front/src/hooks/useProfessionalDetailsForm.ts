"use client";

import { TProfessionalProfile } from "@/types/professional-profile.types";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as PAPI from "@/lib/rtk/endpoints/professional.api";
import * as C from "@/utils/professional-profile.constant";
import * as V from "@/lib/validations/professional-profile.schema";

const toDefaults = (profile?: TProfessionalProfile): V.TDetailsFormInput => ({
  profession: profile?.profession ?? "",
  currentRole: profile?.currentRole ?? "",
  workLocation: profile?.workLocation ?? "",
  professionalSummary: profile?.professionalSummary ?? "",
  industry: profile?.industry ?? undefined,
  experienceRange: profile?.experienceRange ?? undefined,
});

export const useProfessionalDetailsForm = (profile?: TProfessionalProfile) => {
  const { t } = useI18n();
  const [updateDetails, updateState] =
    PAPI.useUpdateProfessionalDetailsMutation();

  const rhf = useForm<V.TDetailsFormInput, unknown, V.TDetailsFormValues>({
    mode: "onChange",
    resolver: zodResolver(V.professionalDetailsSchema),
    defaultValues: toDefaults(profile),
  });

  const { reset, formState, control } = rhf;
  const { isDirty } = formState;

  useEffect(() => {
    if (!profile || isDirty) return;
    reset(toDefaults(profile), { keepDirty: false, keepTouched: false });
  }, [profile, isDirty, reset]);

  const summary = useWatch({ control, name: "professionalSummary" });
  const summaryLength = (summary ?? "").length;

  const industryOptions = useMemo(
    () =>
      C.INDUSTRIES.map((value) => ({
        value,
        label: t(C.enumI18nKey("industry", value)),
      })),
    [t],
  );

  const experienceOptions = useMemo(
    () =>
      C.EXPERIENCE_RANGES.map((value) => ({
        value,
        label: t(C.enumI18nKey("experience", value)),
      })),
    [t],
  );

  const handleSubmit = rhf.handleSubmit(async (values) => {
    try {
      const saved = await updateDetails({
        profession: values.profession ?? null,
        industry: values.industry ?? null,
        currentRole: values.currentRole ?? null,
        experienceRange: values.experienceRange ?? null,
        workLocation: values.workLocation ?? null,
        professionalSummary: values.professionalSummary ?? null,
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
    summaryLength,
    industryOptions,
    experienceOptions,
    summaryMaxLength: C.PROFESSIONAL_SUMMARY_MAX_LENGTH,
    isSaving: updateState.isLoading,
    hasError: Boolean(updateState.error),
    isSaveDisabled: updateState.isLoading || !isDirty,
  };
};
