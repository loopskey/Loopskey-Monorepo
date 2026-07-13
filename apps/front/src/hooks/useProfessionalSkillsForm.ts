"use client";

import { TProfileTaxonomyGroup } from "@/types/professional-profile.types";
import { TProfessionalProfile } from "@/types/professional-profile.types";
import { ProfileTaxonomyKind } from "@/lib/graphql/generated";
import { TMultiSelectOption } from "@/types/professional-profile.types";
import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "@/hooks/useI18n";
import { useForm } from "react-hook-form";
import { notify } from "@/hooks/notify";

import * as PAPI from "@/lib/rtk/endpoints/professional.api";
import * as C from "@/utils/professional-profile.constant";
import * as V from "@/lib/validations/professional-profile.schema";

const toIds = (terms?: { id: string }[]) =>
  (terms ?? []).map((term) => term.id);

const toDefaults = (profile?: TProfessionalProfile): V.TSkillsFormInput => ({
  mainSkillAreaIds: toIds(profile?.mainSkillAreas),
  favoriteSubjectIds: toIds(profile?.favoriteSubjects),
  skillsToImproveIds: toIds(profile?.skillsToImprove),
  currentSkillLevel: profile?.currentSkillLevel ?? undefined,
  targetSkillLevel: profile?.targetSkillLevel ?? undefined,
});

const toOptions = (
  groups: TProfileTaxonomyGroup[] | undefined,
  kind: ProfileTaxonomyKind,
): TMultiSelectOption[] =>
  (groups ?? [])
    .filter((group) => group.kind === kind)
    .flatMap((group) =>
      group.terms.map((term) => ({
        value: term.id,
        label: term.label,
        groupLabel: group.groupLabel,
      })),
    );

export const useProfessionalSkillsForm = (profile?: TProfessionalProfile) => {
  const { t } = useI18n();
  const taxonomyQuery = PAPI.useProfessionalProfileTaxonomyQuery();
  const [updateSkills, updateState] =
    PAPI.useUpdateProfessionalSkillsMutation();

  const rhf = useForm<V.TSkillsFormInput, unknown, V.TSkillsFormValues>({
    mode: "onChange",
    resolver: zodResolver(V.professionalSkillsSchema),
    defaultValues: toDefaults(profile),
  });

  const { reset, formState } = rhf;
  const { isDirty } = formState;

  useEffect(() => {
    if (!profile || isDirty) return;
    reset(toDefaults(profile), { keepDirty: false, keepTouched: false });
  }, [profile, isDirty, reset]);

  const skillOptions = useMemo(
    () => toOptions(taxonomyQuery.data, ProfileTaxonomyKind.SkillArea),
    [taxonomyQuery.data],
  );

  const subjectOptions = useMemo(
    () => toOptions(taxonomyQuery.data, ProfileTaxonomyKind.Subject),
    [taxonomyQuery.data],
  );

  const skillLevelOptions = useMemo(
    () =>
      C.SKILL_LEVELS.map((value) => ({
        value,
        label: t(C.enumI18nKey("skillLevel", value)),
      })),
    [t],
  );

  const handleSubmit = rhf.handleSubmit(async (values) => {
    try {
      const saved = await updateSkills({
        mainSkillAreaIds: values.mainSkillAreaIds,
        favoriteSubjectIds: values.favoriteSubjectIds,
        skillsToImproveIds: values.skillsToImproveIds,
        currentSkillLevel: values.currentSkillLevel ?? null,
        targetSkillLevel: values.targetSkillLevel ?? null,
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
    skillOptions,
    subjectOptions,
    skillLevelOptions,
    isSaving: updateState.isLoading,
    hasError: Boolean(updateState.error),
    isTaxonomyLoading: taxonomyQuery.isLoading,
    hasTaxonomyError: Boolean(taxonomyQuery.error),
    refetchTaxonomy: taxonomyQuery.refetch,
    isSaveDisabled: updateState.isLoading || !isDirty,
  };
};
