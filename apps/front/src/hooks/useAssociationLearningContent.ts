"use client";

import { getAssociationErrorTranslationKey } from "@utils/association-error";
import { AssociationLearningContentStatus } from "@/lib/graphql/base";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ContentType, PduCategory } from "@/lib/graphql/base";
import { AssociationLearningExternalType } from "@/lib/graphql/base";
import { AssociationAudienceKind } from "@/lib/graphql/base";
import { AssociationMemberStatus } from "@/lib/graphql/base";
import { useRouter, useSearchParams } from "next/navigation";
import { SEARCH_DEBOUNCE_MS } from "@utils/constant";
import { useDebouncedValue } from "@hooks/useDebounced";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useI18n } from "@hooks/useI18n";
import { notify } from "@hooks/notify";

import * as API from "@lib/rtk/endpoints/association-dashboard.api";
import * as SC from "@lib/validations/association-dashboard.schema";
import * as T from "@/types/association-dashboard.types";

const PAGE_SIZE = 12;

const ALL = "ALL";

const CATALOG_TAKE = 20;

const MEMBER_PICKER_SIZE = 25;

const ASSIGNABLE_TAKE = 100;

export const LEARNING_CONTENT_STEPS = [
  "content",
  "cpd",
  "assignment",
  "review",
] as const;

export type TLearningContentStep = (typeof LEARNING_CONTENT_STEPS)[number];

const emptyForm: SC.TAssociationLearningContentForm = {
  isExternal: false,
  contentType: undefined,
  contentId: undefined,
  externalTitle: "",
  externalProvider: "",
  externalUrl: "",
  externalContentType: undefined,
  description: "",
  indicativeCredits: "",
  category: undefined,
  requirementId: undefined,
  audienceKind: AssociationAudienceKind.AllMembers,
  groupIds: [],
  memberIds: [],
};

const contentStepValid = (values: SC.TAssociationLearningContentForm) =>
  values.isExternal
    ? Boolean(
        values.externalTitle?.trim() &&
          values.externalContentType &&
          values.externalUrl?.trim() &&
          /^https:\/\//i.test(values.externalUrl.trim()),
      )
    : Boolean(values.contentType && values.contentId);

export const useAssociationLearningContent = () => {
  const { t, language } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const contentParam = searchParams?.get("content") ?? null;
  const stepParam = searchParams?.get("step");
  const step: TLearningContentStep =
    LEARNING_CONTENT_STEPS.find((known) => known === stepParam) ?? "content";
  const isWizard = Boolean(contentParam);
  const isAssign = searchParams?.get("assign") === "1";
  const editorId =
    contentParam && contentParam !== "new" ? contentParam : null;

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [status, setStatus] = useState<string>(ALL);
  const [source, setSource] = useState<string>(ALL);
  const [requirementId, setRequirementId] = useState<string>(ALL);
  const [cursorStack, setCursorStack] = useState<string[]>([]);

  const [detailId, setDetailId] = useState<string | null>(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const [detailsSheetItem, setDetailsSheetItem] =
    useState<T.TAssociationCatalogItem | null>(null);
  const [justPublishedId, setJustPublishedId] = useState<string | null>(null);

  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogType, setCatalogType] = useState<string>(ALL);
  const [assignSearch, setAssignSearch] = useState("");
  const [pickedTitle, setPickedTitle] = useState("");

  const [assignSelectedIds, setAssignSelectedIds] = useState<string[]>([]);

  const [membersItem, setMembersItem] =
    useState<T.TAssociationLearningContentRow | null>(null);
  const [memberAddSearch, setMemberAddSearch] = useState("");

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const debouncedCatalog = useDebouncedValue(catalogSearch, SEARCH_DEBOUNCE_MS);
  const debouncedAssignSearch = useDebouncedValue(
    assignSearch,
    SEARCH_DEBOUNCE_MS,
  );
  const debouncedMemberAddSearch = useDebouncedValue(
    memberAddSearch,
    SEARCH_DEBOUNCE_MS,
  );

  const form = useForm<SC.TAssociationLearningContentForm>({
    resolver: zodResolver(SC.associationLearningContentSchema),
    defaultValues: emptyForm,
  });

  const isExternal = form.watch("isExternal");

  const filter = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      category: category === ALL ? undefined : (category as PduCategory),
      status:
        status === ALL
          ? undefined
          : (status as AssociationLearningContentStatus),
      requirementId: requirementId === ALL ? undefined : requirementId,
      isExternal: source === ALL ? undefined : source === "EXTERNAL",
    }),
    [debouncedSearch, category, status, requirementId, source],
  );

  const listQuery = API.useAssociationLearningContentsQuery({
    filter,
    pagination: { take: PAGE_SIZE, cursor: cursorStack.at(-1) },
  });

  const detailQuery = API.useAssociationLearningContentQuery(
    { learningContentId: detailId ?? "" },
    { skip: !detailId },
  );

  const editorQuery = API.useAssociationLearningContentQuery(
    { learningContentId: editorId ?? "" },
    { skip: !editorId },
  );

  const membersQuery = API.useAssociationLearningContentMembersQuery(
    { learningContentId: membersItem?.id ?? "" },
    { skip: !membersItem },
  );

  const memberAddQuery = API.useAssociationMembersQuery(
    {
      filter: { search: debouncedMemberAddSearch.trim() || undefined },
      pagination: { take: MEMBER_PICKER_SIZE },
    },
    {
      skip:
        !membersItem ||
        membersItem.audienceKind !== AssociationAudienceKind.SpecificMembers,
    },
  );

  const requirementsQuery = API.useAssociationRequirementOptionsQuery({
    pagination: { take: 100 },
  });

  const groupsQuery = API.useAssociationGroupsQuery(undefined, {
    skip: !isWizard && !isAssign,
  });

  const catalogQuery = API.useAssociationCatalogSearchQuery(
    {
      search: debouncedCatalog.trim() || undefined,
      contentType:
        catalogType === ALL ? undefined : (catalogType as ContentType),
      take: CATALOG_TAKE,
    },
    { skip: !isWizard || isExternal },
  );

  const assignMemberQuery = API.useAssociationMembersQuery(
    {
      filter: { search: debouncedAssignSearch.trim() || undefined },
      pagination: { take: MEMBER_PICKER_SIZE },
    },
    { skip: !isWizard && !isAssign },
  );

  const assignableQuery = API.useAssociationLearningContentsQuery(
    { filter: {}, pagination: { take: ASSIGNABLE_TAKE } },
    { skip: !isAssign },
  );

  const [createItem, createState] =
    API.useCreateAssociationLearningContentMutation();
  const [updateItem, updateState] =
    API.useUpdateAssociationLearningContentMutation();
  const [publishItem, publishState] =
    API.usePublishAssociationLearningContentMutation();
  const [withdrawItem, withdrawState] =
    API.useWithdrawAssociationLearningContentMutation();
  const [deleteItem, deleteState] =
    API.useDeleteAssociationLearningContentMutation();

  const items = useMemo(() => listQuery.data?.items ?? [], [listQuery.data]);

  const assignableItems = useMemo(
    () => assignableQuery.data?.items ?? [],
    [assignableQuery.data],
  );

  const requirementOptions = useMemo(
    () =>
      (requirementsQuery.data?.items ?? []).map((requirement) => ({
        value: requirement.id,
        label: requirement.name,
      })),
    [requirementsQuery.data],
  );

  const groupOptions = useMemo(
    () =>
      (groupsQuery.data ?? [])
        .filter((group) => group.isActive)
        .map((group) => ({ value: group.id, label: group.title })),
    [groupsQuery.data],
  );

  const assignMemberOptions = useMemo(
    () =>
      (assignMemberQuery.data?.items ?? [])
        .filter((member) => member.status !== AssociationMemberStatus.Inactive)
        .map((member) => ({
          value: member.id,
          label: member.fullName ?? member.email ?? member.id,
          hint: member.memberNumber ?? member.email ?? "",
        })),
    [assignMemberQuery.data?.items],
  );

  const catalogResults = useMemo(
    () => catalogQuery.data ?? [],
    [catalogQuery.data],
  );

  const members = useMemo(() => membersQuery.data ?? [], [membersQuery.data]);

  const memberAddOptions = useMemo(() => {
    const targeted = new Set(members.map((member) => member.id));
    return (memberAddQuery.data?.items ?? [])
      .filter(
        (member) =>
          member.status !== AssociationMemberStatus.Inactive &&
          !targeted.has(member.id),
      )
      .map((member) => ({
        value: member.id,
        label: member.fullName ?? member.email ?? member.id,
        hint: member.memberNumber ?? member.email ?? "",
      }));
  }, [memberAddQuery.data?.items, members]);

  const selectedContentId = form.watch("contentId");

  const failWith = useCallback(
    (error: unknown) =>
      notify.error(t(getAssociationErrorTranslationKey(error))),
    [t],
  );

  const changeFilter =
    <TValue>(apply: (value: TValue) => void) =>
    (value: TValue) => {
      setCursorStack([]);
      apply(value);
    };

  const resetFilters = () => {
    setSearch("");
    setCategory(ALL);
    setStatus(ALL);
    setSource(ALL);
    setRequirementId(ALL);
    setCursorStack([]);
  };

  const nextPage = () => {
    const nextCursor = listQuery.data?.pageInfo?.nextCursor;
    if (nextCursor) setCursorStack((previous) => [...previous, nextCursor]);
  };

  const previousPage = () =>
    setCursorStack((previous) => previous.slice(0, -1));

  const goTo = useCallback(
    (nextContentId: string | null, nextStep?: TLearningContentStep) => {
      const wasInWizard = Boolean(searchParams?.get("content"));
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("tab", "learning-content");
      if (nextContentId) params.set("content", nextContentId);
      else params.delete("content");
      if (nextStep) params.set("step", nextStep);
      else params.delete("step");
      params.delete("assign");
      const url = `?${params.toString()}`;
      if (!wasInWizard && nextContentId) router.push(url, { scroll: false });
      else router.replace(url, { scroll: false });
    },
    [router, searchParams],
  );

  const goToAssign = useCallback(
    (open: boolean) => {
      const wasOpen = searchParams?.get("assign") === "1";
      const params = new URLSearchParams(searchParams?.toString() ?? "");
      params.set("tab", "learning-content");
      if (open) params.set("assign", "1");
      else params.delete("assign");
      params.delete("content");
      params.delete("step");
      const url = `?${params.toString()}`;
      if (!wasOpen && open) router.push(url, { scroll: false });
      else router.replace(url, { scroll: false });
    },
    [router, searchParams],
  );

  const openCreate = () => {
    setCatalogSearch("");
    setCatalogType(ALL);
    setAssignSearch("");
    setPickedTitle("");
    hydratedForRef.current = null;
    form.reset(emptyForm);
    goTo("new", "content");
  };

  const openAssign = () => {
    setAssignSearch("");
    setAssignSelectedIds([]);
    form.reset(emptyForm);
    goToAssign(true);
  };

  const closeAssign = () => goToAssign(false);

  const toggleAssignSelect = (id: string) =>
    setAssignSelectedIds((current) =>
      current.includes(id)
        ? current.filter((existing) => existing !== id)
        : [...current, id],
    );

  const targetsToAudience = (item: T.TAssociationLearningContentRow) => ({
    groupIds: item.targets
      .filter((target) => target.groupId)
      .map((target) => target.groupId as string),
    memberIds: item.targets
      .filter((target) => target.memberId)
      .map((target) => target.memberId as string),
  });

  const hydratedForRef = useRef<string | null>(null);

  // Hydrates the form from the URL's `content` param: a fresh reset for
  // `new`, or the fetched item once it loads. Runs once per distinct id so a
  // reload restores the step without clobbering in-progress edits on rerender.
  useEffect(() => {
    if (!isWizard) return;
    const target = contentParam ?? "";
    if (hydratedForRef.current === target) return;

    if (!editorId) {
      hydratedForRef.current = target;
      setPickedTitle("");
      form.reset(emptyForm);
      return;
    }

    const row = editorQuery.data;
    if (!row) return;
    hydratedForRef.current = target;
    setPickedTitle(row.isExternal ? "" : row.title);
    const { groupIds, memberIds } = targetsToAudience(row);
    form.reset({
      isExternal: row.isExternal,
      contentType: row.contentType ?? undefined,
      contentId: row.contentId ?? undefined,
      externalTitle: row.isExternal ? row.title : "",
      externalProvider: row.provider ?? "",
      externalUrl: row.externalUrl ?? "",
      externalContentType: row.externalContentType ?? undefined,
      description: row.description ?? "",
      indicativeCredits:
        row.indicativeCredits === null ? "" : String(row.indicativeCredits),
      category: row.category ?? undefined,
      requirementId: row.requirementId ?? undefined,
      audienceKind: row.audienceKind,
      groupIds,
      memberIds,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWizard, contentParam, editorId, editorQuery.data]);

  // FR7: a step that is not reachable yet (its content is not valid)
  // redirects to the first incomplete step, rather than showing a half-built
  // page after a direct reload or a typed URL.
  useEffect(() => {
    if (!isWizard || step === "content") return;
    if (hydratedForRef.current !== (contentParam ?? "")) return;
    if (!contentStepValid(form.getValues())) goTo(contentParam, "content");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isWizard, step, contentParam, editorQuery.data]);

  useEffect(() => {
    if (!isWizard) return;
    if (typeof window === "undefined") return;
    const handler = (event: BeforeUnloadEvent) => {
      if (!form.formState.isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isWizard, form.formState.isDirty]);

  const requestExitWizard = () => {
    if (form.formState.isDirty) setConfirmExit(true);
    else goTo(null);
  };

  const confirmExitWizard = () => {
    setConfirmExit(false);
    goTo(null);
  };

  const cancelExitWizard = () => setConfirmExit(false);

  const pickCatalogItem = (item: T.TAssociationCatalogItem) => {
    form.setValue("contentType", item.contentType, { shouldDirty: true });
    form.setValue("contentId", item.contentId, { shouldDirty: true });
    form.clearErrors("contentId");
    if (item.indicativeCredits)
      form.setValue("indicativeCredits", String(item.indicativeCredits));
    setPickedTitle(item.title);
  };

  const clearCatalogItem = () => {
    form.setValue("contentType", undefined, { shouldDirty: true });
    form.setValue("contentId", undefined, { shouldDirty: true });
    setPickedTitle("");
  };

  const switchToManual = () => {
    form.setValue("isExternal", true, { shouldDirty: true });
    clearCatalogItem();
  };

  const switchToLibrary = () => {
    form.setValue("isExternal", false, { shouldDirty: true });
    form.setValue("externalTitle", "");
    form.setValue("externalUrl", "");
    form.setValue("externalContentType", undefined);
  };

  const openDetailsSheet = (item: T.TAssociationCatalogItem) =>
    setDetailsSheetItem(item);
  const closeDetailsSheet = () => setDetailsSheetItem(null);

  const goToStep = (target: TLearningContentStep) => {
    const currentIndex = LEARNING_CONTENT_STEPS.indexOf(step);
    const targetIndex = LEARNING_CONTENT_STEPS.indexOf(target);
    if (targetIndex <= currentIndex) goTo(contentParam ?? "new", target);
  };

  const STEP_FIELDS: Record<
    TLearningContentStep,
    (keyof SC.TAssociationLearningContentForm)[]
  > = {
    content: isExternal
      ? ["externalTitle", "externalContentType", "externalUrl"]
      : ["contentId"],
    cpd: [],
    assignment: ["audienceKind", "groupIds", "memberIds"],
    review: [],
  };

  const next = async () => {
    const valid = await form.trigger(STEP_FIELDS[step], { shouldFocus: true });
    if (!valid) return;
    const targetId = await ensureDraft();
    if (!targetId) return;
    const currentIndex = LEARNING_CONTENT_STEPS.indexOf(step);
    const nextStep = LEARNING_CONTENT_STEPS[currentIndex + 1];
    if (nextStep) goTo(targetId, nextStep);
  };

  const back = () => {
    const currentIndex = LEARNING_CONTENT_STEPS.indexOf(step);
    const previous = LEARNING_CONTENT_STEPS[Math.max(0, currentIndex - 1)];
    goTo(contentParam, previous);
  };

  const buildContentInput = (values: SC.TAssociationLearningContentForm) => {
    const credits = values.indicativeCredits?.trim();

    return {
      description: values.description?.trim() || undefined,
      indicativeCredits: credits ? Number(credits) : undefined,
      category: (values.category as PduCategory) || undefined,
      requirementId: values.requirementId || null,
      ...(values.isExternal
        ? {
            externalTitle: values.externalTitle?.trim(),
            externalProvider: values.externalProvider?.trim() || undefined,
            externalUrl: values.externalUrl?.trim(),
            externalContentType:
              (values.externalContentType as AssociationLearningExternalType) ||
              undefined,
          }
        : {
            contentType: values.contentType as ContentType,
            contentId: values.contentId,
          }),
    };
  };

  const persistContent = async (values: SC.TAssociationLearningContentForm) => {
    const input = buildContentInput(values);

    if (editorId) {
      const updated = await updateItem({
        ...input,
        learningContentId: editorId,
      }).unwrap();
      return updated.id;
    }

    const created = await createItem(input).unwrap();
    return created.id;
  };

  // Used by `next()` so a draft exists (and the URL points at its real id)
  // before moving past step 1, matching `Save draft`'s persistence. Marks the
  // id as already hydrated so switching the URL from `new` to the real id
  // does not trigger a redundant re-fetch-and-reset of the form we just saved.
  const ensureDraft = async () => {
    try {
      const id = await persistContent(form.getValues());
      hydratedForRef.current = id;
      form.reset(form.getValues(), { keepValues: true });
      return id;
    } catch (error) {
      failWith(error);
      return null;
    }
  };

  const saveDraft = form.handleSubmit(async (values) => {
    try {
      const id = await persistContent(values);
      hydratedForRef.current = id;
      form.reset(values, { keepValues: true });
      if (contentParam !== id) goTo(id, step);
      notify.success(
        t(
          editorId
            ? "associationDashboard.learningContent.messages.saved"
            : "associationDashboard.learningContent.messages.added",
        ),
      );
    } catch (error) {
      failWith(error);
    }
  });

  const publish = form.handleSubmit(async (values) => {
    try {
      const learningContentId = await persistContent(values);

      await publishItem({
        learningContentId,
        audienceKind: values.audienceKind,
        groupIds:
          values.audienceKind === AssociationAudienceKind.Group
            ? values.groupIds
            : undefined,
        memberIds:
          values.audienceKind === AssociationAudienceKind.SpecificMembers
            ? values.memberIds
            : undefined,
      }).unwrap();

      notify.success(
        t("associationDashboard.learningContent.messages.published"),
      );
      setJustPublishedId(learningContentId);
      goTo(null);
    } catch (error) {
      failWith(error);
    }
  });

  // Bypasses `form.handleSubmit`, which would also run the content-step
  // validation this page never shows; only the audience fields matter here.
  const applyAssignment = async () => {
    if (!assignSelectedIds.length) return;
    const valid = await form.trigger(["audienceKind", "groupIds", "memberIds"]);
    if (!valid) return;
    const values = form.getValues();

    try {
      await Promise.all(
        assignSelectedIds.map(async (id) => {
          if (values.requirementId)
            await updateItem({
              learningContentId: id,
              requirementId: values.requirementId,
            }).unwrap();

          await publishItem({
            learningContentId: id,
            audienceKind: values.audienceKind,
            groupIds:
              values.audienceKind === AssociationAudienceKind.Group
                ? values.groupIds
                : undefined,
            memberIds:
              values.audienceKind === AssociationAudienceKind.SpecificMembers
                ? values.memberIds
                : undefined,
          }).unwrap();
        }),
      );
      notify.success(
        t("associationDashboard.learningContent.messages.assigned", {
          count: assignSelectedIds.length,
        }),
      );
      setAssignSelectedIds([]);
      closeAssign();
    } catch (error) {
      failWith(error);
    }
  };

  const withdraw = async (learningContentId: string) => {
    try {
      await withdrawItem({ learningContentId }).unwrap();
      notify.success(
        t("associationDashboard.learningContent.messages.withdrawn"),
      );
    } catch (error) {
      failWith(error);
    }
  };

  const openMembers = (item: T.TAssociationLearningContentRow) => {
    setMemberAddSearch("");
    setMembersItem(item);
  };

  const closeMembers = () => setMembersItem(null);

  // Reads the current roster from `members` (the live, auto-refetching
  // members query) rather than the possibly-stale `membersItem.targets`
  // snapshot, so two adds/removes in quick succession each build on the
  // other's result instead of racing to overwrite it.
  const addMember = async (memberId: string) => {
    if (!membersItem) return;

    try {
      await publishItem({
        learningContentId: membersItem.id,
        audienceKind: membersItem.audienceKind,
        memberIds: [...members.map((member) => member.id), memberId],
      }).unwrap();
      notify.success(t("associationDashboard.learningContent.members.added"));
    } catch (error) {
      failWith(error);
    }
  };

  const removeMember = async (memberId: string) => {
    if (!membersItem) return;

    try {
      await publishItem({
        learningContentId: membersItem.id,
        audienceKind: membersItem.audienceKind,
        memberIds: members
          .map((member) => member.id)
          .filter((id) => id !== memberId),
      }).unwrap();
      notify.success(t("associationDashboard.learningContent.members.removed"));
    } catch (error) {
      failWith(error);
    }
  };

  const remove = async (learningContentId: string) => {
    try {
      await deleteItem({ learningContentId }).unwrap();
      notify.success(
        t("associationDashboard.learningContent.messages.deleted"),
      );
      if (detailId === learningContentId) setDetailId(null);
    } catch (error) {
      failWith(error);
    }
  };

  const isMutating =
    createState.isLoading ||
    updateState.isLoading ||
    publishState.isLoading ||
    withdrawState.isLoading ||
    deleteState.isLoading;

  const isFiltered =
    Boolean(debouncedSearch.trim()) ||
    category !== ALL ||
    status !== ALL ||
    source !== ALL ||
    requirementId !== ALL;

  const openEdit = (item: T.TAssociationLearningContentRow) =>
    goTo(item.id, "content");

  const openPublish = (item: T.TAssociationLearningContentRow) =>
    goTo(item.id, "assignment");

  return {
    t,
    form,
    step,
    next,
    back,
    items,
    remove,
    status,
    source,
    search,
    goToStep,
    withdraw,
    category,
    openEdit,
    nextPage,
    isExternal,
    isFiltered,
    openCreate,
    setDetailId,
    isMutating,
    openPublish,
    openMembers,
    closeMembers,
    membersItem,
    members,
    isMembersLoading: membersQuery.isFetching,
    addMember,
    removeMember,
    memberAddSearch,
    setMemberAddSearch,
    memberAddOptions,
    isMemberAddLoading: memberAddQuery.isFetching,
    previousPage,
    resetFilters,
    saveDraft,
    publish,
    isWizard,
    isAssign,
    catalogType,
    catalogSearch,
    catalogResults,
    groupOptions,
    setCatalogType,
    setCatalogSearch,
    requirementOptions,
    assignSearch,
    setAssignSearch,
    assignMemberOptions,
    isAssignPickerLoading: assignMemberQuery.isFetching,
    pickCatalogItem,
    clearCatalogItem,
    switchToManual,
    switchToLibrary,
    detailsSheetItem,
    openDetailsSheet,
    closeDetailsSheet,
    selectedContentId,
    pickedTitle,
    requirementId,
    isEditing: Boolean(editorId),
    isEditorLoading: Boolean(editorId) && editorQuery.isLoading,
    detail: detailQuery.data,
    detailId,
    isDetailLoading: detailQuery.isLoading,
    page: cursorStack.length + 1,
    canPrevious: cursorStack.length > 0,
    locale: language === "fr" ? "fr-FR" : "en-GB",
    totalCount: listQuery.data?.totalCount ?? 0,
    hasNextPage: Boolean(listQuery.data?.pageInfo?.hasNextPage),
    isCatalogLoading: catalogQuery.isFetching,
    isSaving: createState.isLoading || updateState.isLoading,
    isPublishing: publishState.isLoading,
    setSearch: changeFilter(setSearch),
    setStatus: changeFilter(setStatus),
    setSource: changeFilter(setSource),
    setCategory: changeFilter(setCategory),
    setRequirementId: changeFilter(setRequirementId),
    isRefetching: listQuery.isFetching && !listQuery.isLoading,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    retry: () => {
      void listQuery.refetch();
    },
    requestExitWizard,
    confirmExitWizard,
    cancelExitWizard,
    confirmExit,
    justPublishedId,
    openAssign,
    closeAssign,
    assignableItems,
    isAssignableLoading: assignableQuery.isLoading,
    assignSelectedIds,
    toggleAssignSelect,
    applyAssignment,
    isAssigning: publishState.isLoading || updateState.isLoading,
  };
};

export type TUseAssociationLearningContent = ReturnType<
  typeof useAssociationLearningContent
>;
