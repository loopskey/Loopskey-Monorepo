"use client";

import { getAssociationErrorTranslationKey } from "@utils/association-error";
import { AssociationRequirementStatus } from "@/lib/graphql/base";
import { AssociationReportingCycle } from "@/lib/graphql/base";
import { AssociationAudienceKind } from "@/lib/graphql/base";
import { AssociationEvidencePolicy } from "@/lib/graphql/base";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CpdReminderTiming, CreditType } from "@/lib/graphql/base";
import { SEARCH_DEBOUNCE_MS } from "@utils/constant";
import { useDebouncedValue } from "@hooks/useDebounced";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { useI18n } from "@hooks/useI18n";
import { notify } from "@hooks/notify";

import * as REQ from "@utils/association-requirement";
import * as API from "@lib/rtk/endpoints/association-dashboard.api";
import * as SC from "@lib/validations/association-dashboard.schema";
import * as T from "@/types/association-dashboard.types";

const PAGE_SIZE = 10;

const MEMBER_PICKER_SIZE = 25;

const ALL = "ALL";

const detailsDefaults: SC.TAssociationRequirementDetailsForm = {
  name: "",
  memberIds: [],
  description: "",
  deadline: "",
  groupId: "",
  cycleLengthYears: "",
  creditType: CreditType.Cpd,
  totalRequiredCredits: 0,
  reportingCycle: AssociationReportingCycle.OneTime,
  audienceKind: AssociationAudienceKind.AllMembers,
};

export const useAssociationRequirementsTab = () => {
  const { t, language } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const requirementId = searchParams?.get("requirement") ?? null;
  const stepParam = searchParams?.get("step");
  const step: REQ.TRequirementWizardStep =
    REQ.REQUIREMENT_WIZARD_STEPS.find((known) => known === stepParam) ??
    "details";
  const isWizard = Boolean(requirementId) && Boolean(stepParam);
  const isDetail = Boolean(requirementId) && !stepParam;

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>(ALL);
  const [cursorStack, setCursorStack] = useState<string[]>([]);

  const [openRule, setOpenRule] = useState<T.TRequirementRuleCard | null>(null);
  const [problems, setProblems] = useState<REQ.TRequirementProblem[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [isAssignOpen, setAssignOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const debouncedMemberSearch = useDebouncedValue(
    memberSearch,
    SEARCH_DEBOUNCE_MS,
  );
  const cursor = cursorStack.at(-1);

  const filter = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      status:
        status === ALL ? undefined : (status as AssociationRequirementStatus),
    }),
    [debouncedSearch, status],
  );

  const listQuery = API.useAssociationRequirementsQuery(
    { filter, pagination: { take: PAGE_SIZE, cursor } },
    { skip: Boolean(requirementId) },
  );

  const statsQuery = API.useAssociationRequirementStatsQuery();
  const memberStatsQuery = API.useAssociationMemberStatsQuery();
  const groupsQuery = API.useAssociationGroupsQuery();

  const requirementQuery = API.useAssociationRequirementQuery(
    { requirementId: requirementId ?? "" },
    { skip: !requirementId },
  );

  const pickerQuery = API.useAssociationMembersQuery(
    {
      filter: { search: debouncedMemberSearch.trim() || undefined },
      pagination: { take: MEMBER_PICKER_SIZE },
    },
    { skip: !requirementId && !isAssignOpen },
  );

  const [createDraft, createDraftState] =
    API.useCreateAssociationRequirementDraftMutation();
  const [saveDetails, saveDetailsState] =
    API.useUpdateAssociationRequirementDetailsMutation();
  const [saveAudience, saveAudienceState] =
    API.useUpdateAssociationRequirementAudienceMutation();
  const [saveCategories, saveCategoriesState] =
    API.useUpdateAssociationRequirementCategoriesMutation();
  const [saveEvidence, saveEvidenceState] =
    API.useUpdateAssociationRequirementEvidenceRulesMutation();
  const [saveReporting, saveReportingState] =
    API.useUpdateAssociationRequirementReportingRulesMutation();
  const [publish, publishState] =
    API.usePublishAssociationRequirementMutation();
  const [archive, archiveState] =
    API.useArchiveAssociationRequirementMutation();

  const requirement = requirementQuery.data ?? null;
  const requirements = useMemo(
    () => listQuery.data?.items ?? [],
    [listQuery.data?.items],
  );

  const groupOptions = useMemo(
    () =>
      (groupsQuery.data ?? [])
        .filter((group) => group.isActive)
        .map((group) => ({ value: group.id, label: group.title })),
    [groupsQuery.data],
  );

  const memberOptions = useMemo(
    () =>
      (pickerQuery.data?.items ?? []).map((member) => ({
        value: member.id,
        label: member.fullName ?? member.email ?? member.id,
        hint: member.memberNumber ?? member.email ?? "",
      })),
    [pickerQuery.data?.items],
  );

  const rosterSize = memberStatsQuery.data?.totalMembers ?? 0;

  const detailsForm = useForm<
    SC.TAssociationRequirementDetailsForm,
    unknown,
    SC.TAssociationRequirementDetailsValues
  >({
    resolver: zodResolver(SC.associationRequirementDetailsSchema),
    defaultValues: detailsDefaults,
  });

  const categoriesForm = useForm<
    SC.TAssociationRequirementCategoriesForm,
    unknown,
    SC.TAssociationRequirementCategoriesValues
  >({
    resolver: zodResolver(SC.associationRequirementCategoriesSchema),
    defaultValues: { categories: [] },
  });

  const categoryRows = useFieldArray({
    name: "categories",
    control: categoriesForm.control,
  });

  const reportingForm = useForm<
    SC.TAssociationRequirementReportingForm,
    unknown,
    SC.TAssociationRequirementReportingValues
  >({
    resolver: zodResolver(SC.associationRequirementReportingSchema),
    defaultValues: {
      reportingStart: "",
      reportingEnd: "",
      submissionOpensAt: "",
      submissionClosesAt: "",
      gracePeriodDays: 0,
      allowLateSubmission: true,
    },
  });

  const { reset: resetDetails } = detailsForm;
  const { reset: resetCategories } = categoriesForm;
  const { reset: resetReporting } = reportingForm;

  useEffect(() => {
    if (!requirement) return;

    resetDetails({
      name: requirement.name,
      description: requirement.description ?? "",
      creditType: requirement.creditType,
      totalRequiredCredits: requirement.totalRequiredCredits,
      deadline: REQ.toDateInputValue(requirement.deadline),
      reportingCycle: requirement.reportingCycle,
      cycleLengthYears: requirement.cycleLengthYears ?? "",
      audienceKind: requirement.audienceKind,
      groupId:
        requirement.targets.find((target) => target.groupId)?.groupId ?? "",
      memberIds: requirement.targets
        .map((target) => target.memberId)
        .filter((memberId): memberId is string => Boolean(memberId)),
    });

    resetCategories({
      categories: requirement.categories.map((category) => ({
        name: category.name,
        mappedCategory: category.mappedCategory,
        requiredCredits: category.requiredCredits,
      })),
    });

    resetReporting({
      reportingStart: REQ.toDateInputValue(requirement.reportingStart),
      reportingEnd: REQ.toDateInputValue(requirement.reportingEnd),
      submissionOpensAt: REQ.toDateInputValue(requirement.submissionOpensAt),
      submissionClosesAt: REQ.toDateInputValue(requirement.submissionClosesAt),
      gracePeriodDays: requirement.gracePeriodDays,
      allowLateSubmission: requirement.allowLateSubmission,
    });
  }, [requirement, resetDetails, resetCategories, resetReporting]);

  const goTo = useCallback(
    (
      nextRequirementId: string | null,
      nextStep?: REQ.TRequirementWizardStep,
    ) => {
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("tab", "requirements");
      if (nextRequirementId) params.set("requirement", nextRequirementId);
      else params.delete("requirement");
      if (nextStep) params.set("step", nextStep);
      else params.delete("step");
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  const failWith = useCallback(
    (error: unknown) => {
      const returned = REQ.extractRequirementProblems(error);
      if (returned.length) setProblems(returned);
      notify.error(t(getAssociationErrorTranslationKey(error)));
    },
    [t],
  );

  const audienceInput = (values: SC.TAssociationRequirementDetailsValues) => ({
    audienceKind: values.audienceKind,
    groupId:
      values.audienceKind === AssociationAudienceKind.Group
        ? values.groupId || undefined
        : undefined,
    memberIds:
      values.audienceKind === AssociationAudienceKind.SpecificMembers
        ? values.memberIds
        : undefined,
  });

  const submitDetails = detailsForm.handleSubmit(async (values) => {
    setProblems([]);

    try {
      const saved = requirementId
        ? await saveDetails({
            requirementId,
            name: values.name.trim(),
            description: values.description?.trim() || undefined,
            creditType: values.creditType,
            totalRequiredCredits: values.totalRequiredCredits,
            deadline: REQ.fromDateInputValue(values.deadline),
            reportingCycle: values.reportingCycle,
            cycleLengthYears:
              values.reportingCycle === AssociationReportingCycle.MultiYear &&
              typeof values.cycleLengthYears === "number"
                ? values.cycleLengthYears
                : undefined,
          }).unwrap()
        : await createDraft({
            name: values.name.trim(),
            creditType: values.creditType,
          }).unwrap();

      const savedId = saved.id;

      if (!requirementId)
        await saveDetails({
          requirementId: savedId,
          description: values.description?.trim() || undefined,
          totalRequiredCredits: values.totalRequiredCredits,
          deadline: REQ.fromDateInputValue(values.deadline),
          reportingCycle: values.reportingCycle,
          cycleLengthYears:
            values.reportingCycle === AssociationReportingCycle.MultiYear &&
            typeof values.cycleLengthYears === "number"
              ? values.cycleLengthYears
              : undefined,
        }).unwrap();

      await saveAudience({
        requirementId: savedId,
        ...audienceInput(values),
      }).unwrap();

      goTo(savedId, "rules");
    } catch (error) {
      failWith(error);
    }
  });

  const submitCategories = categoriesForm.handleSubmit(async (values) => {
    if (!requirementId) return;
    setProblems([]);

    try {
      await saveCategories({
        requirementId,
        categories: values.categories.map((category, index) => ({
          order: index,
          name: category.name.trim(),
          mappedCategory: category.mappedCategory,
          requiredCredits: category.requiredCredits,
        })),
      }).unwrap();
      notify.success(
        t("associationDashboard.requirements.messages.rulesSaved"),
      );
      setOpenRule(null);
    } catch (error) {
      failWith(error);
    }
  });

  const submitEvidence = async (policy: AssociationEvidencePolicy) => {
    if (!requirementId) return;

    try {
      await saveEvidence({ requirementId, evidencePolicy: policy }).unwrap();
      notify.success(
        t("associationDashboard.requirements.messages.rulesSaved"),
      );
      setOpenRule(null);
    } catch (error) {
      failWith(error);
    }
  };

  const submitReporting = reportingForm.handleSubmit(async (values) => {
    if (!requirementId) return;

    try {
      await saveReporting({
        requirementId,
        reportingStart: REQ.fromDateInputValue(values.reportingStart),
        reportingEnd: REQ.fromDateInputValue(values.reportingEnd),
        submissionOpensAt: REQ.fromDateInputValue(values.submissionOpensAt),
        submissionClosesAt: REQ.fromDateInputValue(values.submissionClosesAt),
        gracePeriodDays: values.gracePeriodDays,
        allowLateSubmission: values.allowLateSubmission,
      }).unwrap();
      notify.success(
        t("associationDashboard.requirements.messages.rulesSaved"),
      );
      setOpenRule(null);
    } catch (error) {
      failWith(error);
    }
  });

  const submitReminders = async (
    remindersEnabled: boolean,
    reminderTiming?: CpdReminderTiming,
  ) => {
    if (!requirementId) return;

    try {
      await saveDetails({
        requirementId,
        remindersEnabled,
        reminderTiming: remindersEnabled ? reminderTiming : undefined,
      }).unwrap();
    } catch (error) {
      failWith(error);
    }
  };

  const submitPublishedEdits = detailsForm.handleSubmit(async (values) => {
    if (!requirementId) return;

    try {
      await saveDetails({
        requirementId,
        name: values.name.trim(),
        description: values.description?.trim() || undefined,
      }).unwrap();
      notify.success(t("associationDashboard.requirements.messages.saved"));
    } catch (error) {
      failWith(error);
    }
  });

  const publishRequirement = async () => {
    if (!requirementId) return;
    setProblems([]);

    try {
      await publish({ requirementId }).unwrap();
      notify.success(t("associationDashboard.requirements.messages.published"));
      goTo(requirementId);
    } catch (error) {
      failWith(error);
    }
  };

  const archiveRequirement = async (targetId: string) => {
    try {
      await archive({ requirementId: targetId }).unwrap();
      notify.success(t("associationDashboard.requirements.messages.archived"));
    } catch (error) {
      failWith(error);
    }
  };

  const submitAudience = detailsForm.handleSubmit(async (values) => {
    if (!requirementId) return;

    const before = requirement?.assignedMemberCount ?? 0;

    try {
      const saved = await saveAudience({
        requirementId,
        ...audienceInput(values),
      }).unwrap();

      const added = Math.max(0, saved.assignedMemberCount - before);
      notify.success(
        t("associationDashboard.requirements.messages.assigned", { added }),
      );
      setAssignOpen(false);
    } catch (error) {
      failWith(error);
    }
  });

  const allocation = REQ.buildCategoryAllocation(
    categoriesForm.watch("categories") ?? [],
    Number(detailsForm.watch("totalRequiredCredits")) || 0,
    t("associationDashboard.requirements.rules.categories.remainder"),
  );

  const usedMappings = new Set(
    (categoriesForm.watch("categories") ?? []).map(
      (category) => category.mappedCategory,
    ),
  );

  const changeFilter =
    <TValue>(apply: (value: TValue) => void) =>
    (value: TValue) => {
      setCursorStack([]);
      apply(value);
    };

  const applyStatCard = (card: REQ.TRequirementStatCard) => {
    setCursorStack([]);
    setStatus(REQ.statusForStatCard(card) ?? ALL);
  };

  const startWizard = () => {
    setProblems([]);
    resetDetails(detailsDefaults);
    resetCategories({ categories: [] });
    goTo(null, "details");
  };

  const isSaving =
    createDraftState.isLoading ||
    saveDetailsState.isLoading ||
    saveAudienceState.isLoading ||
    saveCategoriesState.isLoading ||
    saveEvidenceState.isLoading ||
    saveReportingState.isLoading ||
    publishState.isLoading ||
    archiveState.isLoading;

  return {
    t,
    step,
    goTo,
    search,
    status,
    problems,
    openRule,
    isWizard,
    isDetail,
    isSaving,
    allocation,
    setOpenRule,
    requirement,
    rosterSize,
    detailsForm,
    requirements,
    categoryRows,
    usedMappings,
    memberSearch,
    startWizard,
    isAssignOpen,
    groupOptions,
    reportingForm,
    setAssignOpen,
    memberOptions,
    submitDetails,
    setMemberSearch,
    submitEvidence,
    categoriesForm,
    submitAudience,
    submitReminders,
    submitReporting,
    submitCategories,
    submitPublishedEdits,
    archiveRequirement,
    publishRequirement,
    applyStatCard,
    requirementId,
    stats: statsQuery.data,
    page: cursorStack.length + 1,
    setSearch: changeFilter(setSearch),
    setStatus: changeFilter(setStatus),
    canPrevious: cursorStack.length > 0,
    locale: language === "fr" ? "fr-FR" : "en-GB",
    totalCount: listQuery.data?.totalCount ?? 0,
    hasNextPage: Boolean(listQuery.data?.pageInfo?.hasNextPage),
    isFiltered: Boolean(debouncedSearch.trim()) || status !== ALL,
    hasNoRequirements: (statsQuery.data?.totalRequirements ?? 0) === 0,
    isMemberPickerLoading: pickerQuery.isFetching,
    nextPage: () => {
      const nextCursor = listQuery.data?.pageInfo?.nextCursor;
      if (nextCursor) setCursorStack((previous) => [...previous, nextCursor]);
    },
    previousPage: () => setCursorStack((previous) => previous.slice(0, -1)),
    resetFilters: () => {
      setSearch("");
      setStatus(ALL);
      setCursorStack([]);
    },
    isRefetching: listQuery.isFetching && !listQuery.isLoading,
    isError:
      listQuery.isError || statsQuery.isError || requirementQuery.isError,
    isLoading:
      statsQuery.isLoading ||
      groupsQuery.isLoading ||
      memberStatsQuery.isLoading ||
      (requirementId ? requirementQuery.isLoading : listQuery.isLoading),
    retry: () => {
      void statsQuery.refetch();
      void groupsQuery.refetch();
      void memberStatsQuery.refetch();
      if (requirementId) void requirementQuery.refetch();
      else void listQuery.refetch();
    },
  };
};

export type TUseAssociationRequirementsTab = ReturnType<
  typeof useAssociationRequirementsTab
>;
