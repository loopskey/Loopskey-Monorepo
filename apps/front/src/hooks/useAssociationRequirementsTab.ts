"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getAssociationErrorTranslationKey } from "@utils/association-error";
import { AssociationLateSubmissionPolicy } from "@/lib/graphql/base";
import { CpdReminderTiming, CreditType } from "@/lib/graphql/base";
import { AssociationRequirementStatus } from "@/lib/graphql/base";
import { AssociationSubmissionWindow } from "@/lib/graphql/base";
import { AssociationRenewalCondition } from "@/lib/graphql/base";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AssociationReportingCycle } from "@/lib/graphql/base";
import { AssociationEvidencePolicy } from "@/lib/graphql/base";
import { AssociationAudienceKind } from "@/lib/graphql/base";
import { AssociationMemberStatus } from "@/lib/graphql/base";
import { useFieldArray, useForm } from "react-hook-form";
import { SEARCH_DEBOUNCE_MS } from "@utils/constant";
import { useDebouncedValue } from "@hooks/useDebounced";
import { zodResolver } from "@hookform/resolvers/zod";
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
  groupIds: [],
  cycleLengthYears: "",
  creditType: CreditType.Cpd,
  totalRequiredCredits: 0,
  reportingCycle: AssociationReportingCycle.Annual,
  audienceKind: AssociationAudienceKind.AllMembers,
};

export const useAssociationRequirementsTab = () => {
  const { t, language } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pendingNavigationRef = useRef<string | null>(null);

  const requirementId = searchParams?.get("requirement") ?? null;
  const stepParam = searchParams?.get("step");
  const step: REQ.TRequirementWizardStep =
    REQ.REQUIREMENT_WIZARD_STEPS.find((known) => known === stepParam) ??
    "details";
  const isWizard = Boolean(stepParam);
  const isDetail = Boolean(requirementId) && !stepParam;

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>(ALL);
  const [cursorStack, setCursorStack] = useState<string[]>([]);

  const [openRule, setOpenRule] = useState<T.TRequirementRuleCard | null>(null);
  const [problems, setProblems] = useState<REQ.TRequirementProblem[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [isAssignOpen, setAssignOpen] = useState(false);
  const [memberCursor, setMemberCursor] = useState<string | undefined>();
  const [loadedMembers, setLoadedMembers] = useState<{
    search: string;
    items: { value: string; label: string; hint: string }[];
  }>({ search: "", items: [] });

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
  const [remove, removeState] = API.useDeleteAssociationRequirementMutation();

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
      submissionWindow: AssociationSubmissionWindow.WholePeriod,
      gracePeriodDays: 0,
      lateSubmissionPolicy: AssociationLateSubmissionPolicy.AcceptedFlaggedLate,
      renewalCondition: AssociationRenewalCondition.TotalCreditsMet,
    },
  });

  const { reset: resetDetails } = detailsForm;
  const { reset: resetCategories } = categoriesForm;
  const { reset: resetReporting } = reportingForm;

  // Specific members has to be populated while the draft is still unsaved, so
  // the picker follows the chosen audience, not the requirement id.
  const pickedAudienceKind = detailsForm.watch("audienceKind");
  const isPickingMembers =
    isAssignOpen ||
    (isWizard &&
      pickedAudienceKind === AssociationAudienceKind.SpecificMembers);

  const pickerQuery = API.useAssociationMembersQuery(
    {
      filter: {
        status: AssociationMemberStatus.Active,
        search: debouncedMemberSearch.trim() || undefined,
      },
      pagination: { take: MEMBER_PICKER_SIZE, cursor: memberCursor },
    },
    { skip: !isPickingMembers },
  );

  useEffect(() => {
    setMemberCursor(undefined);
  }, [debouncedMemberSearch]);

  /**
   * Pages are accumulated rather than replaced, so Load more grows the list.
   *
   * The search term is stored alongside them because RTK Query serves a
   * previously seen term from cache without a new reference, which would
   * otherwise leave this effect with nothing to react to and the list empty.
   */
  useEffect(() => {
    const items = pickerQuery.data?.items;
    if (!items) return;

    setLoadedMembers((previous) => {
      const base = previous.search === debouncedMemberSearch ? previous.items : [];
      const seen = new Set(base.map((member) => member.value));

      const added = items
        .filter((member) => !seen.has(member.id))
        .map((member) => ({
          value: member.id,
          label: member.fullName ?? member.email ?? member.id,
          hint: member.memberNumber ?? member.email ?? "",
        }));

      if (base === previous.items && added.length === 0) return previous;
      return { search: debouncedMemberSearch, items: [...base, ...added] };
    });
  }, [pickerQuery.data?.items, debouncedMemberSearch]);

  /**
   * A member already targeted may sit outside the loaded pages, so the saved
   * targets carry their own label and are shown as selected regardless.
   */
  const selectedMemberOptions = useMemo(
    () =>
      (requirement?.targets ?? []).flatMap((target) =>
        target.memberId
          ? [
              {
                value: target.memberId,
                label: target.label ?? target.memberId,
                hint: "",
              },
            ]
          : [],
      ),
    [requirement?.targets],
  );

  const memberOptions = useMemo(() => {
    const loaded = loadedMembers.items;
    const known = new Set(loaded.map((member) => member.value));

    return [
      ...loaded,
      ...selectedMemberOptions.filter((member) => !known.has(member.value)),
    ];
  }, [loadedMembers.items, selectedMemberOptions]);

  useEffect(() => {
    pendingNavigationRef.current = null;
  }, [searchParams]);

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
      groupIds: requirement.targets
        .map((target) => target.groupId)
        .filter((groupId): groupId is string => Boolean(groupId)),
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
      submissionWindow: requirement.submissionWindow,
      gracePeriodDays: requirement.gracePeriodDays,
      lateSubmissionPolicy: requirement.lateSubmissionPolicy,
      renewalCondition: requirement.renewalCondition,
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
      const nextHref = `${pathname}?${params.toString()}`;
      const currentHref = `${pathname}?${searchParams?.toString() ?? ""}`;
      if (nextHref === currentHref || pendingNavigationRef.current === nextHref)
        return;
      pendingNavigationRef.current = nextHref;
      router.replace(nextHref, { scroll: false });
    },
    [pathname, router, searchParams],
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
    groupIds:
      values.audienceKind === AssociationAudienceKind.Group
        ? values.groupIds
        : undefined,
    memberIds:
      values.audienceKind === AssociationAudienceKind.SpecificMembers
        ? values.memberIds
        : undefined,
  });

  const persistDetails = async (
    values: SC.TAssociationRequirementDetailsValues,
  ) => {
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

    return savedId;
  };

  /**
   * Moving forward holds the requirement to what publish will demand.
   *
   * Save as draft keeps using the lenient resolver, so an unfinished
   * requirement can still be parked; Continue reports the credit total and
   * deadline here instead of letting publish raise them first on Review.
   */
  const submitDetails = detailsForm.handleSubmit(async (values) => {
    setProblems([]);

    const issues = SC.requirementPublishIssues(values);

    if (issues.length) {
      issues.forEach(({ field, message }) =>
        detailsForm.setError(field, { type: "custom", message }),
      );
      detailsForm.setFocus(issues[0].field);
      return;
    }

    try {
      const savedId = await persistDetails(values);
      goTo(savedId, "rules");
    } catch (error) {
      failWith(error);
    }
  });

  const saveDetailsAsDraft = detailsForm.handleSubmit(async (values) => {
    setProblems([]);

    try {
      await persistDetails(values);
      notify.success(
        t("associationDashboard.requirements.messages.savedDraft"),
      );
      goTo(null);
    } catch (error) {
      failWith(error);
    }
  });

  const persistCategories = async (
    values: SC.TAssociationRequirementCategoriesValues,
  ) => {
    if (!requirementId) return;

    await saveCategories({
      requirementId,
      categories: values.categories.map((category, index) => ({
        order: index,
        name: category.name.trim(),
        mappedCategory: category.mappedCategory,
        requiredCredits: category.requiredCredits,
      })),
    }).unwrap();
  };

  const submitCategories = categoriesForm.handleSubmit(async (values) => {
    if (!requirementId) return;
    setProblems([]);

    try {
      await persistCategories(values);
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

  const persistReporting = async (
    values: SC.TAssociationRequirementReportingValues,
  ) => {
    if (!requirementId) return;

    await saveReporting({
      requirementId,
      reportingStart: REQ.fromDateInputValue(values.reportingStart),
      reportingEnd: REQ.fromDateInputValue(values.reportingEnd),
      submissionWindow: values.submissionWindow,
      gracePeriodDays: values.gracePeriodDays,
      lateSubmissionPolicy: values.lateSubmissionPolicy,
      renewalCondition: values.renewalCondition,
    }).unwrap();
  };

  const submitReporting = reportingForm.handleSubmit(async (values) => {
    if (!requirementId) return;

    try {
      await persistReporting(values);
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

  const deleteRequirement = async (targetId: string) => {
    try {
      await remove({ requirementId: targetId }).unwrap();
      notify.success(t("associationDashboard.requirements.messages.deleted"));

      if (requirementId === targetId) goTo(null);
      else if (requirements.length === 1 && cursorStack.length > 0)
        setCursorStack((previous) => previous.slice(0, -1));
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

  /**
   * Continue from Rules, holding the step until its subforms are publishable.
   *
   * Review is a summary, so every category and reporting problem has to be
   * raised here. The offending card is opened and its field focused, and a
   * subform the user edited but never saved is persisted on the way out so
   * Review and publish read what they configured.
   */
  const submitRules = async () => {
    setProblems([]);

    const categories = SC.associationRequirementCategoriesSchema.safeParse(
      categoriesForm.getValues(),
    );

    if (!categories.success || allocation.isOverflowing) {
      setOpenRule("categories");
      await categoriesForm.trigger();

      const path = categories.success
        ? null
        : categories.error.issues[0]?.path.join(".");

      if (path)
        categoriesForm.setFocus(
          path as Parameters<typeof categoriesForm.setFocus>[0],
        );

      return;
    }

    const reporting = SC.associationRequirementReportingSchema.safeParse(
      reportingForm.getValues(),
    );

    if (!reporting.success) {
      setOpenRule("reporting");
      await reportingForm.trigger();

      const path = reporting.error.issues[0]?.path.join(".");

      if (path)
        reportingForm.setFocus(
          path as Parameters<typeof reportingForm.setFocus>[0],
        );

      return;
    }

    try {
      if (categoriesForm.formState.isDirty)
        await persistCategories(categories.data);

      if (reportingForm.formState.isDirty)
        await persistReporting(reporting.data);

      goTo(requirementId, "review");
    } catch (error) {
      failWith(error);
    }
  };

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
    archiveState.isLoading ||
    removeState.isLoading;

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
    submitRules,
    setMemberSearch,
    submitEvidence,
    categoriesForm,
    submitAudience,
    submitReminders,
    submitReporting,
    submitCategories,
    submitPublishedEdits,
    saveDetailsAsDraft,
    exitToList: () => goTo(null),
    archiveRequirement,
    deleteRequirement,
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
    isMemberPickerError: pickerQuery.isError,
    hasMoreMembers: Boolean(pickerQuery.data?.pageInfo?.hasNextPage),
    memberTotalCount: pickerQuery.data?.totalCount ?? 0,
    loadMoreMembers: () => {
      const nextCursor = pickerQuery.data?.pageInfo?.nextCursor;
      if (nextCursor) setMemberCursor(nextCursor);
    },
    retryMemberPicker: () => void pickerQuery.refetch(),
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
