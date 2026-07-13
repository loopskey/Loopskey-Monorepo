"use client";

import { TProfessionalProfile } from "@/types/professional-profile.types";
import { TLearningFormatCard } from "@/types/professional-profile.types";
import { useEffect, useMemo } from "react";
import { LearningFormat } from "@/lib/graphql/generated";
import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "@/hooks/useI18n";
import { useForm } from "react-hook-form";
import { notify } from "@/hooks/notify";

import * as PAPI from "@/lib/rtk/endpoints/professional.api";
import * as C from "@/utils/professional-profile.constant";
import * as V from "@/lib/validations/professional-profile.schema";

const toDefaults = (
  profile?: TProfessionalProfile,
): V.TPreferencesFormInput => ({
  preferredLearningFormats: profile?.preferredLearningFormats ?? [],
  learningTimeCommitment: profile?.learningTimeCommitment ?? undefined,
  learningBudgetPreference: profile?.learningBudgetPreference ?? undefined,
});

export const useProfessionalPreferencesForm = (
  profile?: TProfessionalProfile,
) => {
  const { t } = useI18n();
  const [updatePreferences, updateState] =
    PAPI.useUpdateProfessionalPreferencesMutation();

  const rhf = useForm<
    V.TPreferencesFormInput,
    unknown,
    V.TPreferencesFormValues
  >({
    mode: "onChange",
    resolver: zodResolver(V.professionalPreferencesSchema),
    defaultValues: toDefaults(profile),
  });

  const { reset, formState, setValue, watch } = rhf;
  const { isDirty } = formState;

  useEffect(() => {
    if (!profile || isDirty) return;
    reset(toDefaults(profile), { keepDirty: false, keepTouched: false });
  }, [profile, isDirty, reset]);

  const selectedFormats = watch("preferredLearningFormats") ?? [];

  const toggleFormat = (format: LearningFormat) => {
    const next = selectedFormats.includes(format)
      ? selectedFormats.filter((item) => item !== format)
      : [...selectedFormats, format];
    setValue("preferredLearningFormats", next, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const formatCards = useMemo<TLearningFormatCard[]>(
    () =>
      C.LEARNING_FORMATS.map((value) => ({
        value,
        icon: C.LEARNING_FORMAT_ICONS[value],
        label: t(C.enumI18nKey("learningFormat", value)),
      })),
    [t],
  );

  const timeOptions = useMemo(
    () =>
      C.LEARNING_TIME_COMMITMENTS.map((value) => ({
        value,
        label: t(C.enumI18nKey("learningTime", value)),
      })),
    [t],
  );

  const budgetOptions = useMemo(
    () =>
      C.LEARNING_BUDGET_PREFERENCES.map((value) => ({
        value,
        label: t(C.enumI18nKey("budget", value)),
      })),
    [t],
  );

  const handleSubmit = rhf.handleSubmit(async (values) => {
    try {
      const saved = await updatePreferences({
        preferredLearningFormats: values.preferredLearningFormats,
        learningTimeCommitment: values.learningTimeCommitment ?? null,
        learningBudgetPreference: values.learningBudgetPreference ?? null,
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
    formatCards,
    timeOptions,
    handleSubmit,
    budgetOptions,
    toggleFormat,
    selectedFormats,
    isSaving: updateState.isLoading,
    hasError: Boolean(updateState.error),
    isSaveDisabled: updateState.isLoading || !isDirty,
  };
};
