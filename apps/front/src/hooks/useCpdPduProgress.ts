"use client";

import { useLazyProfessionalPduActivitiesQuery } from "@/lib/rtk/endpoints/professional.api";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildCpdSummaryCsv, downloadCsv } from "@/utils/cpd-summary";
import { useRouter, useSearchParams } from "next/navigation";
import { CpdSetupState, TCpdPlan } from "@/types/cpd-plan.types";
import { ProfessionalMessageCode } from "@loopskey/api-contracts/error-codes";
import { CpdPlanFormValues } from "@/lib/validations/cpd-plan.schema";
import { TCertification } from "@/types/cpd-plan.types";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import type { TAssociationRequirementContent } from "@/types/professional-requirement.types";

import * as API from "@/lib/rtk/endpoints/cpd-plan.api";
import * as H from "@/utils/cpd-plan.helper";
import * as R from "@/utils/professional-requirement.helper";

const isDuplicateError = (error: unknown) => {
  const message = (error as { message?: string })?.message ?? "";
  return message.includes(ProfessionalMessageCode.CPD_PLAN_DUPLICATE);
};

const SUMMARY_ACTIVITY_LIMIT = 50;

export const useCpdPduProgress = () => {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    data: plans = [],
    isLoading: isPlansLoading,
    isFetching: isPlansFetching,
    refetch: refetchPlans,
  } = API.useMyCpdPlansQuery(
    undefined,
    API.REQUIREMENT_QUERY_SUBSCRIPTION_OPTIONS,
  );

  const {
    data: associationRequirements = [],
    isLoading: isAssociationsLoading,
    isError: isAssociationsError,
    refetch: refetchAssociations,
  } = API.useMyAssociationRequirementsQuery(
    undefined,
    API.REQUIREMENT_QUERY_SUBSCRIPTION_OPTIONS,
  );

  const requirementUrlParam = searchParams?.get(R.REQUIREMENT_PARAM) ?? null;
  const [selectedKey, setSelectedKeyState] = useState<string | null>(
    requirementUrlParam,
  );
  const lastUrlParamRef = useRef(requirementUrlParam);

  useEffect(() => {
    if (lastUrlParamRef.current === requirementUrlParam) return;
    lastUrlParamRef.current = requirementUrlParam;
    setSelectedKeyState(requirementUrlParam);
  }, [requirementUrlParam]);

  const setSelectedKey = (key: string | null) => {
    lastUrlParamRef.current = key;
    setSelectedKeyState(key);
    const params = new URLSearchParams(searchParams?.toString());
    if (key) params.set(R.REQUIREMENT_PARAM, key);
    else params.delete(R.REQUIREMENT_PARAM);
    router.replace(`/dashboard/professional?${params.toString()}`, {
      scroll: false,
    });
  };
  const [searchOpen, setSearchOpen] = useState(false);
  const [setup, setSetup] = useState<CpdSetupState | null>(null);
  const [pendingDuplicate, setPendingDuplicate] =
    useState<CpdPlanFormValues | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [creatingCertId, setCreatingCertId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const options = useMemo(
    () => R.buildRequirementOptions(associationRequirements, plans),
    [associationRequirements, plans],
  );

  const activeKey = R.resolveActiveKey(options, selectedKey);
  const active = R.parseRequirementKey(activeKey);
  const selectedPlanId = active?.source === "PLAN" ? active.id : null;
  const selectedAssociationId =
    active?.source === "ASSOCIATION" ? active.id : null;

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.id === selectedPlanId) ?? null,
    [plans, selectedPlanId],
  );

  const selectedAssociation = useMemo(
    () =>
      associationRequirements.find(
        (requirement) => requirement.requirementId === selectedAssociationId,
      ) ?? null,
    [associationRequirements, selectedAssociationId],
  );

  const {
    data: progress,
    isFetching: isProgressFetching,
    isLoading: isProgressLoading,
  } = API.useCpdPlanProgressQuery(
    { planId: selectedPlanId ?? "" },
    { skip: !selectedPlanId, ...API.REQUIREMENT_QUERY_SUBSCRIPTION_OPTIONS },
  );

  const { data: planActivities = [], isLoading: isPlanActivitiesLoading } =
    API.useCpdPlanActivitiesQuery(
      { planId: selectedPlanId ?? "" },
      { skip: !selectedPlanId, ...API.REQUIREMENT_QUERY_SUBSCRIPTION_OPTIONS },
    );

  const { data: associationDetail, isLoading: isAssociationDetailLoading } =
    API.useMyAssociationRequirementQuery(
      { requirementId: selectedAssociationId ?? "" },
      {
        skip: !selectedAssociationId,
        ...API.REQUIREMENT_QUERY_SUBSCRIPTION_OPTIONS,
      },
    );

  const { data: draftPlans = [] } = API.useMyDraftCpdPlansQuery(
    undefined,
    API.REQUIREMENT_QUERY_SUBSCRIPTION_OPTIONS,
  );
  const [activatePlan, { isLoading: isActivatingPlan }] =
    API.useActivateCpdPlanMutation();

  const [createFromSuggestion, { isLoading: isCreatingSuggestion }] =
    API.useCreateCpdPlanFromSuggestionMutation();
  const [createPlan, { isLoading: isCreatingPlan }] =
    API.useCreateCpdPlanMutation();
  const [updatePlan, { isLoading: isUpdatingPlan }] =
    API.useUpdateCpdPlanMutation();
  const [deletePlan, { isLoading: isDeleting }] =
    API.useDeleteCpdPlanMutation();
  const [fetchActivities] = useLazyProfessionalPduActivitiesQuery();

  const hasRequirements = options.length > 0;
  const isRequirementsLoading = isPlansLoading || isAssociationsLoading;
  const canGenerateSummary = Boolean(selectedPlan) && Boolean(progress);

  const openSearch = () => setSearchOpen(true);
  const closeSearch = () => setSearchOpen(false);

  const selectPlan = (planId: string) =>
    setSelectedKey(R.requirementKey("PLAN", planId));

  const useSuggested = async (cert: TCertification) => {
    if (creatingCertId) return;
    setCreatingCertId(cert.id);
    try {
      const plan = await createFromSuggestion({
        certificationId: cert.id,
      }).unwrap();
      selectPlan(plan.id);
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

  const trackDraftPlan = async (planId: string) => {
    try {
      const plan = await activatePlan(planId).unwrap();
      selectPlan(plan.id);
      notify.success(t("cpdProgress.toast.planCreated"));
    } catch {
      notify.error(t("cpdProgress.toast.createError"));
    }
  };

  const editPlan = (plan: TCpdPlan) => {
    setSetup({
      mode: "edit",
      planId: plan.id,
      certificationId: plan.certificationId ?? undefined,
      initial: H.planToForm(plan),
    });
  };

  const closeSetup = () => setSetup(null);

  const persistPlan = async (
    values: CpdPlanFormValues,
    allowDuplicate: boolean,
  ) => {
    const input = H.formToCreateInput(values, {
      certificationId: setup?.certificationId,
      allowDuplicate,
    });
    const plan =
      setup?.mode === "edit" && setup.planId
        ? await updatePlan({ ...input, id: setup.planId }).unwrap()
        : await createPlan(input).unwrap();
    selectPlan(plan.id);
    setSetup(null);
    setPendingDuplicate(null);
    notify.success(
      t(
        setup?.mode === "edit"
          ? "cpdProgress.toast.planUpdated"
          : "cpdProgress.toast.planCreated",
      ),
    );
  };

  const submitSetup = async (values: CpdPlanFormValues) => {
    try {
      await persistPlan(values, false);
    } catch (error) {
      if (isDuplicateError(error)) {
        setPendingDuplicate(values);
        return;
      }
      notify.error(
        t(
          setup?.mode === "edit"
            ? "cpdProgress.toast.updateError"
            : "cpdProgress.toast.createError",
        ),
      );
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
    router.push(activeKey ? R.logActivityHref(activeKey) : R.ADD_ACTIVITY_HREF);

  const markComplete = (content: TAssociationRequirementContent) => {
    if (!activeKey) return;
    router.push(R.logActivityHref(activeKey, content.id));
  };

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
    options,
    progress,
    activeKey,
    draftPlans,
    trackDraftPlan,
    isActivatingPlan,
    openSearch,
    searchOpen,
    closeSearch,
    selectedPlan,
    refetchPlans,
    planActivities,
    markComplete,
    selectedPlanId,
    hasRequirements,
    associationDetail,
    setSelectedKey,
    isPlansLoading,
    isPlansFetching,
    isProgressLoading,
    isProgressFetching,
    selectedAssociation,
    isAssociationsError,
    isCreatingSuggestion,
    isRequirementsLoading,
    refetchAssociations,
    isPlanActivitiesLoading,
    isAssociationDetailLoading,
    setup,
    editPlan,
    closeSetup,
    isDeleting,
    addManually,
    submitSetup,
    editManually,
    useSuggested,
    isGenerating,
    cancelDelete,
    requestDelete,
    confirmDelete,
    creatingCertId,
    deleteTargetId,
    cancelDuplicate,
    goToAddActivity,
    generateSummary,
    confirmDuplicate,
    pendingDuplicate,
    canGenerateSummary,
    isSubmittingPlan: isCreatingPlan || isUpdatingPlan,
  };
};
