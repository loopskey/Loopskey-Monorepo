"use client";

import { TProfessionalProfile } from "@/types/professional-profile.types";
import { TRoleChoice } from "@/types/professional-taxonomy.types";
import { useCallback, useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as PAPI from "@/lib/rtk/endpoints/professional.api";
import * as C from "@/utils/professional-profile.constant";
import * as OC from "@/utils/professional-onboarding.constant";
import * as V from "@/lib/validations/professional-profile.schema";

const toDefaults = (profile?: TProfessionalProfile): V.TDetailsFormInput => ({
  profession: profile?.profession ?? "",
  currentRole: profile?.currentRole ?? "",
  currentRoleTermId: profile?.currentRoleTermId ?? undefined,
  industry: profile?.industry ?? undefined,
  workLocation: profile?.workLocation ?? "",
  professionalSummary: profile?.professionalSummary ?? "",
  experienceRange: profile?.experienceRange ?? undefined,
  professionalGoal: profile?.professionalGoal ?? undefined,
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

  const { reset, formState, control, setValue } = rhf;
  const { isDirty } = formState;

  useEffect(() => {
    if (!profile || isDirty) return;
    reset(toDefaults(profile), { keepDirty: false, keepTouched: false });
  }, [profile, isDirty, reset]);

  const summary = useWatch({ control, name: "professionalSummary" });
  const summaryLength = (summary ?? "").length;

  const currentRole = useWatch({ control, name: "currentRole" });
  const currentRoleTermId = useWatch({ control, name: "currentRoleTermId" });

  const roleTerm = PAPI.useProfessionalTaxonomyTermsByIdsQuery(
    { ids: currentRoleTermId ? [currentRoleTermId] : [] },
    { skip: !currentRoleTermId },
  );

  const roleChoice: TRoleChoice | null = useMemo(() => {
    const label = currentRole?.trim();
    if (!label) return null;
    if (!currentRoleTermId) return { kind: "custom", label };
    const term = roleTerm.data?.find((one) => one.id === currentRoleTermId);
    return {
      kind: "canonical",
      term: {
        id: currentRoleTermId,
        label,
        groupKey: term?.groupKey ?? "",
        groupLabel: term?.groupLabel ?? "",
      },
    };
  }, [currentRole, currentRoleTermId, roleTerm.data]);

  const changeRole = useCallback(
    (choice: TRoleChoice | null) => {
      const options = { shouldDirty: true, shouldValidate: true };
      setValue(
        "currentRole",
        choice?.kind === "canonical"
          ? choice.term.label
          : (choice?.label ?? ""),
        options,
      );
      setValue(
        "currentRoleTermId",
        choice?.kind === "canonical" ? choice.term.id : undefined,
        options,
      );
    },
    [setValue],
  );

  const industryOptions = useMemo(
    () =>
      C.INDUSTRIES.map((value) => ({
        value,
        label: t(C.enumI18nKey("industry", value)),
      })),
    [t],
  );

  const goalOptions = useMemo(
    () =>
      OC.ONBOARDING_GOALS.map((value) => ({
        value,
        label: t(C.enumI18nKey("professionalGoal", value)),
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
        currentRoleTermId: values.currentRoleTermId ?? null,
        currentRole: values.currentRoleTermId
          ? null
          : (values.currentRole ?? null),
        experienceRange: values.experienceRange ?? null,
        professionalGoal: values.professionalGoal ?? null,
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
    goalOptions,
    roleChoice,
    changeRole,
    handleSubmit,
    summaryLength,
    industryOptions,
    experienceOptions,
    isSaving: updateState.isLoading,
    hasError: Boolean(updateState.error),
    isSaveDisabled: updateState.isLoading || !isDirty,
    summaryMaxLength: C.PROFESSIONAL_SUMMARY_MAX_LENGTH,
  };
};
