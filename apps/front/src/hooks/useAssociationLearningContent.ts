"use client";

import { getAssociationErrorTranslationKey } from "@utils/association-error";
import { AssociationLearningContentStatus } from "@/lib/graphql/base";
import { useCallback, useMemo, useState } from "react";
import { ContentType, PduCategory } from "@/lib/graphql/base";
import { AssociationAudienceKind } from "@/lib/graphql/base";
import { AssociationMemberStatus } from "@/lib/graphql/base";
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

export const LEARNING_CONTENT_WIZARD_LAST_STEP = 4;

const LEARNING_CONTENT_STEP_FIELDS: Record<
  number,
  (keyof SC.TAssociationLearningContentForm)[]
> = {
  1: [
    "contentType",
    "contentId",
    "externalTitle",
    "externalProvider",
    "externalUrl",
    "description",
  ],
  2: ["indicativeCredits"],
  3: ["audienceKind", "groupIds", "memberIds"],
  4: [],
};

const emptyForm: SC.TAssociationLearningContentForm = {
  isExternal: false,
  contentType: undefined,
  contentId: undefined,
  externalTitle: "",
  externalProvider: "",
  externalUrl: "",
  description: "",
  indicativeCredits: "",
  audienceKind: AssociationAudienceKind.AllMembers,
  groupIds: [],
  memberIds: [],
};

export const useAssociationLearningContent = () => {
  const { t, language } = useI18n();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [status, setStatus] = useState<string>(ALL);
  const [source, setSource] = useState<string>(ALL);
  const [requirementId, setRequirementId] = useState<string>(ALL);
  const [cursorStack, setCursorStack] = useState<string[]>([]);

  const [editorId, setEditorId] = useState<string | null>(null);
  const [isEditorOpen, setEditorOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);

  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogType, setCatalogType] = useState<string>(ALL);
  const [assignSearch, setAssignSearch] = useState("");
  const [pickedTitle, setPickedTitle] = useState("");

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const debouncedCatalog = useDebouncedValue(catalogSearch, SEARCH_DEBOUNCE_MS);
  const debouncedAssignSearch = useDebouncedValue(
    assignSearch,
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

  const requirementsQuery = API.useAssociationRequirementOptionsQuery({
    pagination: { take: 100 },
  });

  const groupsQuery = API.useAssociationGroupsQuery(undefined, {
    skip: !isEditorOpen,
  });

  const catalogQuery = API.useAssociationCatalogSearchQuery(
    {
      search: debouncedCatalog.trim() || undefined,
      contentType:
        catalogType === ALL ? undefined : (catalogType as ContentType),
      take: CATALOG_TAKE,
    },
    { skip: !isEditorOpen || isExternal },
  );

  // Deactivated members cannot receive a new assignment, so the picker
  // filters them out client-side rather than adding a multi-status server
  // filter for this one dialog.
  const assignMemberQuery = API.useAssociationMembersQuery(
    {
      filter: { search: debouncedAssignSearch.trim() || undefined },
      pagination: { take: MEMBER_PICKER_SIZE },
    },
    { skip: !isEditorOpen },
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

  const openCreate = (external: boolean) => {
    setEditorId(null);
    setCatalogSearch("");
    setCatalogType(ALL);
    setAssignSearch("");
    setPickedTitle("");
    setStep(1);
    form.reset({ ...emptyForm, isExternal: external });
    setEditorOpen(true);
  };

  const targetsToAudience = (item: T.TAssociationLearningContentRow) => ({
    groupIds: item.targets
      .filter((target) => target.groupId)
      .map((target) => target.groupId as string),
    memberIds: item.targets
      .filter((target) => target.memberId)
      .map((target) => target.memberId as string),
  });

  const openEditAtStep = (
    item: T.TAssociationLearningContentRow,
    initialStep: number,
  ) => {
    setEditorId(item.id);
    setAssignSearch("");
    setPickedTitle(item.isExternal ? "" : item.title);
    const { groupIds, memberIds } = targetsToAudience(item);
    form.reset({
      isExternal: item.isExternal,
      contentType: item.contentType ?? undefined,
      contentId: item.contentId ?? undefined,
      externalTitle: item.isExternal ? item.title : "",
      externalProvider: item.provider ?? "",
      externalUrl: item.externalUrl ?? "",
      description: item.description ?? "",
      indicativeCredits:
        item.indicativeCredits === null ? "" : String(item.indicativeCredits),
      audienceKind: item.audienceKind,
      groupIds,
      memberIds,
    });
    setStep(initialStep);
    setEditorOpen(true);
  };

  const openEdit = (item: T.TAssociationLearningContentRow) =>
    openEditAtStep(item, 1);

  const openPublish = (item: T.TAssociationLearningContentRow) =>
    openEditAtStep(item, 3);

  const closeEditor = () => {
    setEditorOpen(false);
    setEditorId(null);
  };

  const pickCatalogItem = (item: T.TAssociationCatalogItem) => {
    form.setValue("contentType", item.contentType);
    form.setValue("contentId", item.contentId);
    form.clearErrors("contentId");
    setPickedTitle(item.title);
  };

  const goToStep = (target: number) => {
    if (target <= step) setStep(target);
  };

  const next = async () => {
    const fields = LEARNING_CONTENT_STEP_FIELDS[step] ?? [];
    const valid = await form.trigger(fields, { shouldFocus: true });
    if (valid && step < LEARNING_CONTENT_WIZARD_LAST_STEP) setStep(step + 1);
  };

  const back = () => setStep((current) => Math.max(1, current - 1));

  const buildContentInput = (values: SC.TAssociationLearningContentForm) => {
    const credits = values.indicativeCredits?.trim();

    return {
      description: values.description?.trim() || undefined,
      indicativeCredits: credits ? Number(credits) : undefined,
      ...(values.isExternal
        ? {
            externalTitle: values.externalTitle?.trim(),
            externalProvider: values.externalProvider?.trim() || undefined,
            externalUrl: values.externalUrl?.trim(),
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
    setEditorId(created.id);
    return created.id;
  };

  const saveDraft = form.handleSubmit(async (values) => {
    try {
      await persistContent(values);
      notify.success(
        t(
          editorId
            ? "associationDashboard.learningContent.messages.saved"
            : "associationDashboard.learningContent.messages.added",
        ),
      );
      closeEditor();
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
      closeEditor();
    } catch (error) {
      failWith(error);
    }
  });

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
    closeEditor,
    isMutating,
    openPublish,
    previousPage,
    resetFilters,
    saveDraft,
    publish,
    isEditorOpen,
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
    selectedContentId,
    pickedTitle,
    requirementId,
    isEditing: Boolean(editorId),
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
  };
};

export type TUseAssociationLearningContent = ReturnType<
  typeof useAssociationLearningContent
>;
