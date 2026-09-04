"use client";

import { getAssociationErrorTranslationKey } from "@utils/association-error";
import { AssociationLearningContentStatus } from "@/lib/graphql/base";
import { useCallback, useMemo, useState } from "react";
import { ContentType, PduCategory } from "@/lib/graphql/base";
import { AssociationAudienceKind } from "@/lib/graphql/base";
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

const NO_REQUIREMENT = "NONE";

const emptyForm: SC.TAssociationLearningContentForm = {
  isExternal: false,
  category: PduCategory.Technical,
  contentType: undefined,
  contentId: undefined,
  externalTitle: "",
  externalProvider: "",
  externalUrl: "",
  description: "",
  indicativeCredits: "",
  requirementId: NO_REQUIREMENT,
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
  const [detailId, setDetailId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [publishAudience, setPublishAudience] = useState<string>(
    AssociationAudienceKind.AllMembers,
  );
  const [publishGroupId, setPublishGroupId] = useState<string>("");

  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogType, setCatalogType] = useState<string>(ALL);

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const debouncedCatalog = useDebouncedValue(catalogSearch, SEARCH_DEBOUNCE_MS);

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
    skip: !publishingId,
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
    form.reset({ ...emptyForm, isExternal: external });
    setEditorOpen(true);
  };

  const openEdit = (item: T.TAssociationLearningContentRow) => {
    setEditorId(item.id);
    form.reset({
      isExternal: item.isExternal,
      category: item.category,
      contentType: item.contentType ?? undefined,
      contentId: item.contentId ?? undefined,
      externalTitle: item.isExternal ? item.title : "",
      externalProvider: item.provider ?? "",
      externalUrl: item.externalUrl ?? "",
      description: item.description ?? "",
      indicativeCredits:
        item.indicativeCredits === null ? "" : String(item.indicativeCredits),
      requirementId: item.requirementId ?? NO_REQUIREMENT,
    });
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setEditorId(null);
  };

  const pickCatalogItem = (item: T.TAssociationCatalogItem) => {
    form.setValue("contentType", item.contentType);
    form.setValue("contentId", item.contentId);
    form.clearErrors("contentId");
  };

  const submitEditor = form.handleSubmit(async (values) => {
    const credits = values.indicativeCredits?.trim();

    const input = {
      category: values.category as PduCategory,
      description: values.description?.trim() || undefined,
      indicativeCredits: credits ? Number(credits) : undefined,
      requirementId:
        values.requirementId === NO_REQUIREMENT
          ? undefined
          : values.requirementId,
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

    try {
      if (editorId)
        await updateItem({ ...input, learningContentId: editorId }).unwrap();
      else await createItem(input).unwrap();

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

  const openPublish = (item: T.TAssociationLearningContentRow) => {
    setPublishingId(item.id);
    setPublishAudience(item.audienceKind);
    setPublishGroupId(item.groupId ?? "");
  };

  const closePublish = () => setPublishingId(null);

  const confirmPublish = async () => {
    if (!publishingId) return;

    try {
      await publishItem({
        learningContentId: publishingId,
        audienceKind: publishAudience as AssociationAudienceKind,
        groupId:
          publishAudience === AssociationAudienceKind.Group
            ? publishGroupId || undefined
            : undefined,
      }).unwrap();
      notify.success(
        t("associationDashboard.learningContent.messages.published"),
      );
      setPublishingId(null);
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
    items,
    remove,
    status,
    source,
    search,
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
    closePublish,
    previousPage,
    resetFilters,
    submitEditor,
    isEditorOpen,
    catalogType,
    catalogSearch,
    catalogResults,
    confirmPublish,
    publishGroupId,
    groupOptions,
    publishAudience,
    setCatalogType,
    setCatalogSearch,
    requirementOptions,
    setPublishGroupId,
    setPublishAudience,
    pickCatalogItem,
    selectedContentId,
    requirementId,
    isEditing: Boolean(editorId),
    detail: detailQuery.data,
    detailId,
    isDetailLoading: detailQuery.isLoading,
    publishingId,
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
