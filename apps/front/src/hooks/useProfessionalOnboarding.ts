"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProfessionalGoal, ProfileTaxonomyKind } from "@/lib/graphql/base";
import { useCertificationSearchQuery } from "@/lib/rtk/endpoints/cpd-plan.api";
import { useDebouncedValue } from "@/hooks/useDebounced";
import { useRouter } from "next/navigation";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as PAPI from "@/lib/rtk/endpoints/professional.api";
import * as C from "@/utils/professional-onboarding.constant";
import * as T from "@/types/professional-onboarding.types";

const CERTIFICATION_SEARCH_LIMIT = 8;

export const useProfessionalOnboarding = () => {
  const { t } = useI18n();
  const router = useRouter();

  const [goal, setGoal] = useState<ProfessionalGoal | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const [role, setRole] = useState("");
  const [roleQuery, setRoleQuery] = useState("");

  const [skillIds, setSkillIds] = useState<string[]>([]);
  const [skillQuery, setSkillQuery] = useState("");
  const [wantsSuggestedSkills, setWantsSuggestedSkills] = useState(false);

  const [certification, setCertification] =
    useState<T.TOnboardingCertificationChoice | null>(null);
  const [isManualCertification, setIsManualCertification] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualIssuer, setManualIssuer] = useState("");
  const [manualError, setManualError] = useState<string | null>(null);

  const [startOnboarding] = PAPI.useStartProfessionalOnboardingMutation();
  const [completeOnboarding, completeState] =
    PAPI.useCompleteProfessionalOnboardingMutation();

  const taxonomyQuery = PAPI.useProfessionalProfileTaxonomyQuery();

  const hasStarted = useRef(false);
  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;
    void startOnboarding();
  }, [startOnboarding]);

  const steps = useMemo(() => C.stepsForGoal(goal), [goal]);

  useEffect(() => {
    setStepIndex((current) => Math.min(current, steps.length - 1));
  }, [steps.length]);

  const currentStep = steps[stepIndex];

  const stepDescriptors: T.TOnboardingStepDescriptor[] = useMemo(
    () =>
      steps.map((step, index) => ({
        step,
        index,
        label: t(C.ONBOARDING_STEP_I18N_KEY[step]),
      })),
    [steps, t],
  );

  const goalOptions: T.TOnboardingGoalOption[] = useMemo(
    () =>
      C.ONBOARDING_GOALS.map((value) => ({
        value,
        title: t(C.goalI18nKey(value, "title")),
        description: t(C.goalI18nKey(value, "description")),
      })),
    [t],
  );

  // ================= Roles =================
  const roleOptions: T.TOnboardingRoleOption[] = useMemo(
    () =>
      (taxonomyQuery.data ?? [])
        .filter((group) => group.kind === ProfileTaxonomyKind.Role)
        .flatMap((group) =>
          group.terms.map((term) => ({ id: term.id, label: term.label })),
        ),
    [taxonomyQuery.data],
  );

  const filteredRoles = useMemo(() => {
    const query = roleQuery.trim().toLowerCase();
    if (!query) return roleOptions;
    return roleOptions.filter((option) =>
      option.label.toLowerCase().includes(query),
    );
  }, [roleOptions, roleQuery]);

  const typedRole = roleQuery.trim();
  const canUseTypedRole =
    typedRole.length > 0 &&
    !roleOptions.some(
      (option) => option.label.toLowerCase() === typedRole.toLowerCase(),
    );

  const selectRole = useCallback((label: string) => {
    setRole(label);
    setRoleQuery(label);
  }, []);

  // ================= Skills =================
  const skillOptions: T.TOnboardingSkillOption[] = useMemo(
    () =>
      (taxonomyQuery.data ?? [])
        .filter((group) => group.kind === ProfileTaxonomyKind.SkillArea)
        .flatMap((group) =>
          group.terms.map((term) => ({
            id: term.id,
            label: term.label,
            groupLabel: group.groupLabel,
          })),
        ),
    [taxonomyQuery.data],
  );

  const filteredSkills = useMemo(() => {
    const query = skillQuery.trim().toLowerCase();
    if (!query) return skillOptions;
    return skillOptions.filter((option) =>
      option.label.toLowerCase().includes(query),
    );
  }, [skillOptions, skillQuery]);

  const selectedSkills = useMemo(
    () =>
      skillIds
        .map((id) => skillOptions.find((option) => option.id === id))
        .filter((option): option is T.TOnboardingSkillOption =>
          Boolean(option),
        ),
    [skillIds, skillOptions],
  );

  const isSkillLimitReached = skillIds.length >= C.ONBOARDING_MAX_SKILLS;

  const toggleSkill = useCallback((id: string) => {
    setSkillIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= C.ONBOARDING_MAX_SKILLS) return current;
      return [...current, id];
    });
    setWantsSuggestedSkills(false);
  }, []);

  const requestSuggestedSkills = useCallback(() => {
    setSkillIds([]);
    setWantsSuggestedSkills(true);
  }, []);

  const cancelSuggestedSkills = useCallback(
    () => setWantsSuggestedSkills(false),
    [],
  );

  // ================= Certification =================
  const [certificationQuery, setCertificationQuery] = useState("");
  const debouncedCertification = useDebouncedValue(certificationQuery, 350);
  const trimmedCertification = debouncedCertification.trim();
  const hasCertificationQuery =
    trimmedCertification.length >= C.CERTIFICATION_MIN_QUERY_LENGTH;

  const certificationSearch = useCertificationSearchQuery(
    {
      input: {
        query: trimmedCertification,
        limit: CERTIFICATION_SEARCH_LIMIT,
      },
    },
    { skip: !hasCertificationQuery || currentStep !== "certification" },
  );

  const certificationOptions: T.TOnboardingCertificationOption[] = useMemo(
    () =>
      hasCertificationQuery
        ? (certificationSearch.data ?? []).map((item) => ({
            id: item.id,
            name: item.name,
            abbreviation: item.abbreviation,
            organization: item.organization,
          }))
        : [],
    [hasCertificationQuery, certificationSearch.data],
  );

  const selectCertification = useCallback(
    (option: T.TOnboardingCertificationOption) =>
      setCertification({ kind: "catalogue", option }),
    [],
  );

  const chooseNoCertification = useCallback(() => {
    setCertification({ kind: "none" });
    setIsManualCertification(false);
  }, []);

  const openManualCertification = useCallback(() => {
    setIsManualCertification(true);
    setCertification(null);
    setManualError(null);
  }, []);

  const closeManualCertification = useCallback(() => {
    setIsManualCertification(false);
    setManualError(null);
  }, []);

  const clearCertification = useCallback(() => setCertification(null), []);

  const saveManualCertification = useCallback(() => {
    const name = manualName.trim();
    if (!name) {
      setManualError(t("professionalOnboarding.errors.certificationName"));
      return false;
    }
    setManualError(null);
    setCertification({ kind: "manual", name, issuer: manualIssuer.trim() });
    return true;
  }, [manualName, manualIssuer, t]);

  // ================= Navigation =================
  const isStepValid = useMemo(() => {
    if (currentStep === "goal") return Boolean(goal);
    if (currentStep === "role") return role.trim().length > 0;
    if (currentStep === "skills")
      return wantsSuggestedSkills || skillIds.length > 0;
    if (currentStep === "certification")
      return Boolean(certification) || isManualCertification;
    return false;
  }, [
    goal,
    role,
    skillIds,
    currentStep,
    certification,
    isManualCertification,
    wantsSuggestedSkills,
  ]);

  const isLastStep = stepIndex === steps.length - 1;

  const goBack = useCallback(
    () => setStepIndex((current) => Math.max(0, current - 1)),
    [],
  );

  const chooseGoal = useCallback((value: ProfessionalGoal) => {
    setGoal(value);
    if (value !== ProfessionalGoal.MaintainCertification) {
      setCertification(null);
      setIsManualCertification(false);
    }
  }, []);

  const submit = useCallback(async () => {
    if (!goal) return;

    let finalCertification = certification;
    if (isManualCertification && !finalCertification) {
      if (!saveManualCertification()) return;
      finalCertification = {
        kind: "manual",
        name: manualName.trim(),
        issuer: manualIssuer.trim(),
      };
    }

    try {
      await completeOnboarding({
        professionalGoal: goal,
        currentRole: role.trim(),
        skillsToImproveIds: skillIds,
        suggestSkills: wantsSuggestedSkills,
        certificationId:
          finalCertification?.kind === "catalogue"
            ? finalCertification.option.id
            : null,
        certificationName:
          finalCertification?.kind === "manual"
            ? finalCertification.name
            : null,
        certificationIssuer:
          finalCertification?.kind === "manual" && finalCertification.issuer
            ? finalCertification.issuer
            : null,
      }).unwrap();

      notify.success(t("professionalOnboarding.success"));
      router.replace(C.PROFILE_TAB_HREF);
    } catch {
      notify.error(t("professionalOnboarding.errors.saveFailed"));
    }
  }, [
    t,
    goal,
    role,
    router,
    skillIds,
    manualName,
    manualIssuer,
    certification,
    completeOnboarding,
    wantsSuggestedSkills,
    isManualCertification,
    saveManualCertification,
  ]);

  const goNext = useCallback(() => {
    if (!isStepValid) return;
    if (isLastStep) {
      void submit();
      return;
    }
    setStepIndex((current) => current + 1);
  }, [isStepValid, isLastStep, submit]);

  return {
    t,
    goal,
    role,
    steps,
    goNext,
    goBack,
    submit,
    skillIds,
    roleQuery,
    stepIndex,
    typedRole,
    isLastStep,
    chooseGoal,
    skillQuery,
    goalOptions,
    selectRole,
    currentStep,
    toggleSkill,
    isStepValid,
    manualName,
    manualError,
    setRoleQuery,
    setSkillQuery,
    manualIssuer,
    setManualName,
    filteredRoles,
    certification,
    selectedSkills,
    filteredSkills,
    setManualIssuer,
    stepDescriptors,
    canUseTypedRole,
    certificationQuery,
    selectCertification,
    clearCertification,
    isSkillLimitReached,
    wantsSuggestedSkills,
    certificationOptions,
    cancelSuggestedSkills,
    setCertificationQuery,
    chooseNoCertification,
    isManualCertification,
    hasCertificationQuery,
    requestSuggestedSkills,
    saveManualCertification,
    openManualCertification,
    closeManualCertification,
    isSaving: completeState.isLoading,
    maxSkills: C.ONBOARDING_MAX_SKILLS,
    refetchTaxonomy: taxonomyQuery.refetch,
    isRolesLoading: taxonomyQuery.isLoading,
    isSkillsLoading: taxonomyQuery.isLoading,
    hasRolesError: Boolean(taxonomyQuery.error),
    hasSkillsError: Boolean(taxonomyQuery.error),
    refetchCertifications: certificationSearch.refetch,
    isCertificationLoading: certificationSearch.isFetching,
    hasCertificationError: Boolean(certificationSearch.error),
  };
};
