"use client";

import { TProfileTaxonomyGroup } from "@/types/professional-profile.types";
import { TProfessionalProfile } from "@/types/professional-profile.types";
import { TMultiSelectOption } from "@/types/professional-profile.types";
import { TTaxonomyTerm } from "@/types/professional-taxonomy.types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProfileTaxonomyKind } from "@/lib/graphql/base";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as PAPI from "@/lib/rtk/endpoints/professional.api";
import * as C from "@/utils/professional-profile.constant";
import * as V from "@/lib/validations/professional-profile.schema";

export type TSkillTermField = "mainSkillAreaIds" | "skillsToImproveIds";

const toIds = (terms?: { id: string }[]) =>
  (terms ?? []).map((term) => term.id);

const toTerm = (term: TTaxonomyTerm): TTaxonomyTerm => ({
  id: term.id,
  label: term.label,
  groupKey: term.groupKey,
  groupLabel: term.groupLabel,
});

const toDefaults = (profile?: TProfessionalProfile): V.TSkillsFormInput => ({
  mainSkillAreaIds: toIds(profile?.mainSkillAreas),
  favoriteSubjectIds: toIds(profile?.favoriteSubjects),
  skillsToImproveIds: toIds(profile?.skillsToImprove),
  currentSkillLevel: profile?.currentSkillLevel ?? undefined,
  targetSkillLevel: profile?.targetSkillLevel ?? undefined,
});

const toOptions = (
  groups: TProfileTaxonomyGroup[] | undefined,
): TMultiSelectOption[] =>
  (groups ?? []).flatMap((group) =>
    group.terms.map((term) => ({
      value: term.id,
      label: term.label,
      groupLabel: group.groupLabel,
    })),
  );

export const useProfessionalSkillsForm = (profile?: TProfessionalProfile) => {
  const { t } = useI18n();
  const subjectsQuery = PAPI.useProfessionalProfileTaxonomyQuery({
    kind: ProfileTaxonomyKind.Subject,
  });
  const [updateSkills, updateState] =
    PAPI.useUpdateProfessionalSkillsMutation();

  const rhf = useForm<V.TSkillsFormInput, unknown, V.TSkillsFormValues>({
    mode: "onChange",
    resolver: zodResolver(V.professionalSkillsSchema),
    defaultValues: toDefaults(profile),
  });

  const { reset, formState, control, setValue, getValues } = rhf;
  const { isDirty } = formState;

  useEffect(() => {
    if (!profile || isDirty) return;
    reset(toDefaults(profile), { keepDirty: false, keepTouched: false });
  }, [profile, isDirty, reset]);

  const [picked, setPicked] = useState<Record<string, TTaxonomyTerm>>({});

  const mainSkillAreaIds = useWatch({ control, name: "mainSkillAreaIds" });
  const skillsToImproveIds = useWatch({ control, name: "skillsToImproveIds" });

  const known = useMemo(() => {
    const terms = new Map<string, TTaxonomyTerm>();
    for (const term of [
      ...(profile?.mainSkillAreas ?? []),
      ...(profile?.skillsToImprove ?? []),
    ])
      terms.set(term.id, toTerm(term));
    for (const term of Object.values(picked)) terms.set(term.id, term);
    return terms;
  }, [profile, picked]);

  const missingIds = useMemo(
    () =>
      [...new Set([...(mainSkillAreaIds ?? []), ...(skillsToImproveIds ?? [])])]
        .filter((id) => !known.has(id))
        .sort(),
    [mainSkillAreaIds, skillsToImproveIds, known],
  );

  const hydration = PAPI.useProfessionalTaxonomyTermsByIdsQuery(
    { ids: missingIds },
    { skip: !missingIds.length },
  );

  const termsFor = useCallback(
    (ids: string[] | undefined) => {
      const hydrated = new Map(
        (hydration.data ?? []).map((term) => [term.id, toTerm(term)]),
      );
      return (ids ?? []).flatMap((id) => {
        const term = known.get(id) ?? hydrated.get(id);
        return term ? [term] : [];
      });
    },
    [known, hydration.data],
  );

  const toggleSkillTerm = useCallback(
    (field: TSkillTermField, term: TTaxonomyTerm) => {
      const ids = getValues(field) ?? [];
      const next = ids.includes(term.id)
        ? ids.filter((id) => id !== term.id)
        : ids.length >= C.MAX_SELECTED_TERMS
          ? ids
          : [...ids, term.id];
      setPicked((current) => ({ ...current, [term.id]: term }));
      setValue(field, next, { shouldDirty: true, shouldValidate: true });
    },
    [getValues, setValue],
  );

  const subjectOptions = useMemo(
    () => toOptions(subjectsQuery.data),
    [subjectsQuery.data],
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
    subjectOptions,
    skillLevelOptions,
    toggleSkillTerm,
    mainSkillTerms: termsFor(mainSkillAreaIds),
    skillsToImproveTerms: termsFor(skillsToImproveIds),
    maxSelectedTerms: C.MAX_SELECTED_TERMS,
    isSaving: updateState.isLoading,
    hasError: Boolean(updateState.error),
    isTaxonomyLoading: subjectsQuery.isLoading,
    hasTaxonomyError: Boolean(subjectsQuery.error),
    refetchTaxonomy: subjectsQuery.refetch,
    isSaveDisabled: updateState.isLoading || !isDirty,
  };
};
