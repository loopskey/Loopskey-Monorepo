"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ProfessionalGoal } from "@/lib/graphql/base";
import { useCertificationSearchQuery } from "@/lib/rtk/endpoints/cpd-plan.api";
import { useDebouncedValue } from "@/hooks/useDebounced";
import { useRouter } from "next/navigation";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as PAPI from "@/lib/rtk/endpoints/professional.api";
import * as C from "@/utils/professional-onboarding.constant";
import * as T from "@/types/professional-onboarding.types";
import * as TX from "@/types/professional-taxonomy.types";

const CERTIFICATION_SEARCH_LIMIT = 8;

export const useProfessionalOnboarding = () => {
  const { t } = useI18n();
  const router = useRouter();

  const [goal, setGoal] = useState<ProfessionalGoal | null>(null);
  const [stepIndex, setStepIndex] = useState(0);

  const [roleChoice, setRoleChoice] = useState<TX.TRoleChoice | null>(null);

  const [selectedSkills, setSelectedSkills] = useState<TX.TTaxonomyTerm[]>([]);
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
  const [dismissOnboarding, dismissState] =
    PAPI.useDismissProfessionalOnboardingMutation();

  const [isSkipConfirmOpen, setIsSkipConfirmOpen] = useState(false);
  const openSkipConfirm = useCallback(() => setIsSkipConfirmOpen(true), []);
  const closeSkipConfirm = useCallback(() => setIsSkipConfirmOpen(false), []);

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
        icon: C.ONBOARDING_STEP_ICON[step],
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
  const roleTermId =
    roleChoice?.kind === "canonical" ? roleChoice.term.id : null;

  // ================= Skills =================
  const suggestionsQuery = PAPI.useProfessionalSkillSuggestionsQuery(
    { roleTermId },
    { skip: currentStep !== "skills" },
  );

  const skillSuggestions: TX.TSkillSuggestionState = useMemo(
    () => ({
      items: (suggestionsQuery.data?.items ?? []).map((term) => ({
        id: term.id,
        label: term.label,
        groupKey: term.groupKey,
        groupLabel: term.groupLabel,
      })),
      isFallback: Boolean(suggestionsQuery.data?.isFallback),
      isLoading: suggestionsQuery.isFetching,
      hasError: Boolean(suggestionsQuery.error),
      onRetry: () => void suggestionsQuery.refetch(),
    }),
    [suggestionsQuery],
  );

  const toggleSkill = useCallback((term: TX.TTaxonomyTerm) => {
    setSelectedSkills((current) => {
      if (current.some((item) => item.id === term.id))
        return current.filter((item) => item.id !== term.id);
      if (current.length >= C.ONBOARDING_MAX_SKILLS) return current;
      return [...current, term];
    });
    setWantsSuggestedSkills(false);
  }, []);

  const requestSuggestedSkills = useCallback(() => {
    setSelectedSkills([]);
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
    if (currentStep === "role") return Boolean(roleChoice);
    if (currentStep === "skills")
      return wantsSuggestedSkills || selectedSkills.length > 0;
    if (currentStep === "certification")
      return Boolean(certification) || isManualCertification;
    return false;
  }, [
    goal,
    roleChoice,
    selectedSkills,
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
        currentRoleTermId: roleTermId,
        currentRole: roleChoice?.kind === "custom" ? roleChoice.label : null,
        skillsToImproveIds: selectedSkills.map((term) => term.id),
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
    roleChoice,
    roleTermId,
    router,
    selectedSkills,
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

  const confirmSkip = useCallback(async () => {
    try {
      await dismissOnboarding().unwrap();
      setIsSkipConfirmOpen(false);
      router.replace(C.OVERVIEW_HREF);
    } catch {
      setIsSkipConfirmOpen(false);
      notify.error(t("professionalOnboarding.skip.error"));
    }
  }, [dismissOnboarding, router, t]);

  return {
    t,
    goal,
    roleChoice,
    setRoleChoice,
    steps,
    goNext,
    goBack,
    submit,
    stepIndex,
    isLastStep,
    chooseGoal,
    goalOptions,
    currentStep,
    isStepValid,
    manualName,
    manualError,
    manualIssuer,
    setManualName,
    certification,
    selectedSkills,
    toggleSkill,
    skillSuggestions,
    setManualIssuer,
    stepDescriptors,
    certificationQuery,
    selectCertification,
    clearCertification,
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
    confirmSkip,
    openSkipConfirm,
    closeSkipConfirm,
    isSkipConfirmOpen,
    isSkipping: dismissState.isLoading,
    isSaving: completeState.isLoading,
    maxSkills: C.ONBOARDING_MAX_SKILLS,
    refetchCertifications: certificationSearch.refetch,
    isCertificationLoading: certificationSearch.isFetching,
    hasCertificationError: Boolean(certificationSearch.error),
  };
};
