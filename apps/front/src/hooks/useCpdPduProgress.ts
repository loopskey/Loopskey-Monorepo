"use client";

import { useLazyProfessionalPduActivitiesQuery } from "@/lib/rtk/endpoints/professional.api";
import { buildCpdSummaryCsv, downloadCsv } from "@/utils/cpd-summary";
import { CpdSetupState, TCertification } from "@/types/cpd-plan.types";
import { useEffect, useMemo, useState } from "react";
import { CpdPlanFormValues } from "@/lib/validations/cpd-plan.schema";
import { useRouter } from "next/navigation";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as API from "@/lib/rtk/endpoints/cpd-plan.api";
import * as H from "@/utils/cpd-plan.helper";

const isDuplicateError = (error: unknown) => {
  const message = (error as { message?: string })?.message ?? "";
  return message.includes("CPD_PLAN_DUPLICATE");
};

const SUMMARY_ACTIVITY_LIMIT = 50;

export const useCpdPduProgress = () => {
  const { t } = useI18n();
  const router = useRouter();

  const {
    data: plans = [],
    isLoading: isPlansLoading,
    isFetching: isPlansFetching,
    refetch: refetchPlans,
  } = API.useMyCpdPlansQuery();

  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [setup, setSetup] = useState<CpdSetupState | null>(null);
  const [pendingDuplicate, setPendingDuplicate] =
    useState<CpdPlanFormValues | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [creatingCertId, setCreatingCertId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (!plans.length) {
      if (selectedPlanId !== null) setSelectedPlanId(null);
      return;
    }
    if (!selectedPlanId || !plans.some((plan) => plan.id === selectedPlanId))
      setSelectedPlanId(plans[0].id);
  }, [plans, selectedPlanId]);

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? null,
    [plans, selectedPlanId],
  );

  const {
    data: progress,
    isFetching: isProgressFetching,
    isLoading: isProgressLoading,
  } = API.useCpdPlanProgressQuery(
    { planId: selectedPlanId ?? "" },
    { skip: !selectedPlanId },
  );

  const [createFromSuggestion, { isLoading: isCreatingSuggestion }] =
    API.useCreateCpdPlanFromSuggestionMutation();
  const [createPlan, { isLoading: isCreatingPlan }] =
    API.useCreateCpdPlanMutation();
  const [deletePlan, { isLoading: isDeleting }] =
    API.useDeleteCpdPlanMutation();
  const [fetchActivities] = useLazyProfessionalPduActivitiesQuery();

  const hasPlans = plans.length > 0;
  const canGenerateSummary = Boolean(selectedPlan) && Boolean(progress);

  const openSearch = () => setSearchOpen(true);
  const closeSearch = () => setSearchOpen(false);

  const useSuggested = async (cert: TCertification) => {
    if (creatingCertId) return;
    setCreatingCertId(cert.id);
    try {
      const plan = await createFromSuggestion({
        certificationId: cert.id,
      }).unwrap();
      setSelectedPlanId(plan.id);
      setSearchOpen(false);
      notify.success(t("cpdProgress.toast.planCreated"));
    } catch {
      notify.error(t("cpdProgress.toast.createError"));
    } finally {
      setCreatingCertId(null);
    }
  };

  const editManually = (cert: TCertification) => {
    setSearchOpen(false);
    setSetup({
      mode: "editSuggestion",
      initial: H.certificationToForm(cert),
      certificationId: cert.id,
    });
  };

  const addManually = (query: string) => {
    setSearchOpen(false);
    setSetup({ mode: "manual", initial: H.emptyCpdPlanForm(query.trim()) });
  };

  const closeSetup = () => setSetup(null);

  const persistPlan = async (
    values: CpdPlanFormValues,
    allowDuplicate: boolean,
  ) => {
    const plan = await createPlan(
      H.formToCreateInput(values, {
        certificationId: setup?.certificationId,
        allowDuplicate,
      }),
    ).unwrap();
    setSelectedPlanId(plan.id);
    setSetup(null);
    setPendingDuplicate(null);
    notify.success(t("cpdProgress.toast.planCreated"));
  };

  const submitSetup = async (values: CpdPlanFormValues) => {
    try {
      await persistPlan(values, false);
    } catch (error) {
      if (isDuplicateError(error)) {
        setPendingDuplicate(values);
        return;
      }
      notify.error(t("cpdProgress.toast.createError"));
    }
  };

  const confirmDuplicate = async () => {
    if (!pendingDuplicate) return;
    try {
      await persistPlan(pendingDuplicate, true);
    } catch {
      setPendingDuplicate(null);
      notify.error(t("cpdProgress.toast.createError"));
    }
  };

  const cancelDuplicate = () => setPendingDuplicate(null);

  const requestDelete = (planId: string) => setDeleteTargetId(planId);
  const cancelDelete = () => setDeleteTargetId(null);
  const confirmDelete = async () => {
    if (!deleteTargetId || isDeleting) return;
    try {
      await deletePlan(deleteTargetId).unwrap();
      notify.success(t("cpdProgress.toast.planDeleted"));
      setDeleteTargetId(null);
    } catch {
      notify.error(t("cpdProgress.toast.deleteError"));
    }
  };

  const goToAddActivity = () =>
    router.push("/dashboard/professional?tab=add-activity");

  const generateSummary = async () => {
    if (!selectedPlan || !progress || isGenerating) return;
    setIsGenerating(true);
    try {
      const result = await fetchActivities({
        filter: {
          creditType: selectedPlan.creditType,
          dateFrom: selectedPlan.reportingStart,
          dateTo: selectedPlan.reportingEnd,
        },
        pagination: { take: SUMMARY_ACTIVITY_LIMIT },
      }).unwrap();
      const csv = buildCpdSummaryCsv(
        selectedPlan,
        progress,
        result?.items ?? [],
      );
      const safeName = selectedPlan.certificationName
        .replace(/[^\w-]+/g, "-")
        .toLowerCase();
      downloadCsv(`cpd-summary-${safeName}.csv`, csv);
      notify.success(t("cpdProgress.toast.summaryReady"));
    } catch {
      notify.error(t("cpdProgress.toast.summaryError"));
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    t,
    plans,
    progress,
    hasPlans,
    selectedPlan,
    refetchPlans,
    selectedPlanId,
    isPlansLoading,
    isPlansFetching,
    setSelectedPlanId,
    isProgressLoading,
    isProgressFetching,
    isCreatingSuggestion,
    isSubmittingPlan: isCreatingPlan,
    searchOpen,
    openSearch,
    closeSearch,
    useSuggested,
    creatingCertId,
    editManually,
    addManually,
    setup,
    closeSetup,
    submitSetup,
    pendingDuplicate,
    confirmDuplicate,
    cancelDuplicate,
    deleteTargetId,
    requestDelete,
    cancelDelete,
    confirmDelete,
    isDeleting,
    canGenerateSummary,
    generateSummary,
    isGenerating,
    goToAddActivity,
  };
};
