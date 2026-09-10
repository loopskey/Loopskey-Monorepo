"use client";

import { IngestionContentKind, IngestionItemState } from "@/lib/graphql/base";
import { getIngestionErrorKey } from "@utils/ingestion-error";
import { SEARCH_DEBOUNCE_MS } from "@utils/constant";
import { useDebouncedValue } from "@hooks/useDebounced";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useI18n } from "@hooks/useI18n";
import { notify } from "@hooks/notify";

import * as API from "@lib/rtk/endpoints/ingestion.api";
import * as SC from "@lib/validations/ingestion.schema";

const PAGE_SIZE = 10;
const ALL = "ALL";
const SEARCH_MIN_LENGTH = 2;

export const sourceKindOptions = [
  ALL,
  IngestionContentKind.Course,
  IngestionContentKind.Event,
  IngestionContentKind.Podcast,
  IngestionContentKind.Youtube,
] as const;
type TSourceKindFilter = (typeof sourceKindOptions)[number];

export const sourceActiveOptions = [ALL, "ACTIVE", "INACTIVE"] as const;
type TSourceActiveFilter = (typeof sourceActiveOptions)[number];

export const reviewStateOptions = [
  IngestionItemState.Pending,
  IngestionItemState.Accepted,
  IngestionItemState.Rejected,
  IngestionItemState.Stale,
] as const;

const emptyCreateForm: SC.TCreateIngestionSourceForm = {
  slug: "",
  name: "",
  kind: IngestionContentKind.Course,
  autoPublish: false,
  stalenessWindowDays: "",
  fieldMap: "",
};

const parseFieldMap = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return JSON.parse(trimmed) as Record<string, unknown>;
};

export const useAdminIngestionTab = () => {
  const { t } = useI18n();

  const [view, setView] = useState<"sources" | "review">("sources");

  // ---------------- Sources list ----------------
  const [sourceSearch, setSourceSearchState] = useState("");
  const [sourceKind, setSourceKindState] = useState<TSourceKindFilter>(ALL);
  const [sourceActive, setSourceActiveState] =
    useState<TSourceActiveFilter>(ALL);
  const [sourceCursorStack, setSourceCursorStack] = useState<string[]>([]);
  const debouncedSourceSearch = useDebouncedValue(
    sourceSearch.trim(),
    SEARCH_DEBOUNCE_MS,
  );

  const sourcesVariables = useMemo(
    () => ({
      filter: {
        search:
          debouncedSourceSearch.length >= SEARCH_MIN_LENGTH
            ? debouncedSourceSearch
            : undefined,
        kind: sourceKind === ALL ? undefined : sourceKind,
        isActive:
          sourceActive === ALL ? undefined : sourceActive === "ACTIVE",
      },
      pagination: { take: PAGE_SIZE, cursor: sourceCursorStack.at(-1) },
    }),
    [debouncedSourceSearch, sourceKind, sourceActive, sourceCursorStack],
  );

  const sourcesQuery = API.useIngestionSourcesQuery(sourcesVariables);
  const [createSource, createSourceState] =
    API.useCreateIngestionSourceMutation();
  const [updateSource, updateSourceState] =
    API.useUpdateIngestionSourceMutation();
  const [activateSource] = API.useActivateIngestionSourceMutation();
  const [deactivateSource] = API.useDeactivateIngestionSourceMutation();

  const resetSourcePagination = () => setSourceCursorStack([]);
  const setSourceSearch = (value: string) => {
    setSourceSearchState(value);
    resetSourcePagination();
  };
  const setSourceKind = (value: TSourceKindFilter) => {
    setSourceKindState(value);
    resetSourcePagination();
  };
  const setSourceActive = (value: TSourceActiveFilter) => {
    setSourceActiveState(value);
    resetSourcePagination();
  };
  const resetSourceFilters = () => {
    setSourceSearchState("");
    setSourceKindState(ALL);
    setSourceActiveState(ALL);
    resetSourcePagination();
  };
  const sourceHasActiveFilters =
    sourceSearch.trim().length > 0 || sourceKind !== ALL || sourceActive !== ALL;

  const sourceNextPage = () => {
    const nextCursor = sourcesQuery.data?.pageInfo?.nextCursor;
    if (!nextCursor || !sourcesQuery.data?.pageInfo?.hasNextPage) return;
    setSourceCursorStack((previous) =>
      previous.at(-1) === nextCursor ? previous : [...previous, nextCursor],
    );
  };
  const sourcePreviousPage = () =>
    setSourceCursorStack((previous) => previous.slice(0, -1));

  // ---------------- Create source dialog ----------------
  const [isCreateOpen, setCreateOpen] = useState(false);
  const createForm = useForm<SC.TCreateIngestionSourceForm>({
    resolver: zodResolver(SC.createIngestionSourceSchema),
    defaultValues: emptyCreateForm,
  });

  const openCreate = () => {
    createForm.reset(emptyCreateForm);
    setCreateOpen(true);
  };
  const closeCreate = () => {
    if (createSourceState.isLoading) return;
    setCreateOpen(false);
  };

  const submitCreate = createForm.handleSubmit(async (values) => {
    try {
      const fieldMap = parseFieldMap(values.fieldMap);
      await createSource({
        slug: values.slug.trim().toLowerCase(),
        name: values.name.trim(),
        kind: values.kind,
        autoPublish: values.autoPublish,
        stalenessWindowDays: values.stalenessWindowDays
          ? Number(values.stalenessWindowDays)
          : undefined,
        fieldMap,
      }).unwrap();
      notify.success(t("adminDashboard.ingestion.sources.created"));
      setCreateOpen(false);
    } catch (error) {
      notify.error(t(getIngestionErrorKey(error)));
    }
  });

  // ---------------- Selected source detail ----------------
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(
    null,
  );
  const selectedSourceQuery = API.useIngestionSourceQuery(
    selectedSourceId ?? "",
    { skip: !selectedSourceId },
  );

  const openSourceDetail = (sourceId: string) => setSelectedSourceId(sourceId);
  const closeSourceDetail = () => setSelectedSourceId(null);

  const editForm = useForm<SC.TUpdateIngestionSourceForm>({
    resolver: zodResolver(SC.updateIngestionSourceSchema),
    defaultValues: {
      name: "",
      autoPublish: false,
      stalenessWindowDays: "",
      fieldMap: "",
    },
    values: selectedSourceQuery.data
      ? {
          name: selectedSourceQuery.data.name,
          autoPublish: selectedSourceQuery.data.autoPublish,
          stalenessWindowDays: selectedSourceQuery.data.stalenessWindowDays
            ? String(selectedSourceQuery.data.stalenessWindowDays)
            : "",
          fieldMap: JSON.stringify(
            selectedSourceQuery.data.fieldMap ?? {},
            null,
            2,
          ),
        }
      : undefined,
  });

  const submitEdit = editForm.handleSubmit(async (values) => {
    if (!selectedSourceId) return;
    try {
      const fieldMap = parseFieldMap(values.fieldMap);
      await updateSource({
        sourceId: selectedSourceId,
        name: values.name.trim(),
        autoPublish: values.autoPublish,
        stalenessWindowDays: values.stalenessWindowDays
          ? Number(values.stalenessWindowDays)
          : null,
        fieldMap: fieldMap ?? {},
      }).unwrap();
      notify.success(t("adminDashboard.ingestion.sources.updated"));
    } catch (error) {
      notify.error(t(getIngestionErrorKey(error)));
    }
  });

  const toggleSourceActive = async (
    sourceId: string,
    isActive: boolean,
  ) => {
    try {
      if (isActive) await deactivateSource(sourceId).unwrap();
      else await activateSource(sourceId).unwrap();
      notify.success(
        t(
          isActive
            ? "adminDashboard.ingestion.sources.deactivated"
            : "adminDashboard.ingestion.sources.activated",
        ),
      );
    } catch (error) {
      notify.error(t(getIngestionErrorKey(error)));
    }
  };

  // ---------------- Keys ----------------
  const keysQuery = API.useIngestionApiKeysQuery(selectedSourceId ?? "", {
    skip: !selectedSourceId,
  });
  const [issueKey, issueKeyState] = API.useIssueIngestionApiKeyMutation();
  const [revokeKey, revokeKeyState] = API.useRevokeIngestionApiKeyMutation();

  const [isIssueOpen, setIssueOpen] = useState(false);
  const [issuedCredential, setIssuedCredential] = useState<string | null>(
    null,
  );
  const issueForm = useForm<SC.TIssueIngestionApiKeyForm>({
    resolver: zodResolver(SC.issueIngestionApiKeySchema),
    defaultValues: { name: "", expiresAt: "" },
  });

  const openIssue = () => {
    issueForm.reset({ name: "", expiresAt: "" });
    setIssuedCredential(null);
    setIssueOpen(true);
  };
  const closeIssue = () => {
    if (issueKeyState.isLoading) return;
    setIssueOpen(false);
    setIssuedCredential(null);
  };

  const submitIssue = issueForm.handleSubmit(async (values) => {
    if (!selectedSourceId) return;
    try {
      const issued = await issueKey({
        sourceId: selectedSourceId,
        name: values.name.trim(),
        expiresAt: values.expiresAt
          ? new Date(values.expiresAt).toISOString()
          : undefined,
      }).unwrap();
      setIssuedCredential(issued.credential);
    } catch (error) {
      notify.error(t(getIngestionErrorKey(error)));
    }
  });

  const [revokeTarget, setRevokeTarget] = useState<{
    id: string;
    prefix: string;
  } | null>(null);
  const openRevokeConfirm = (id: string, prefix: string) =>
    setRevokeTarget({ id, prefix });
  const closeRevokeConfirm = () => {
    if (revokeKeyState.isLoading) return;
    setRevokeTarget(null);
  };
  const confirmRevoke = async () => {
    if (!revokeTarget) return;
    try {
      await revokeKey(revokeTarget.id).unwrap();
      notify.success(t("adminDashboard.ingestion.keys.revoked"));
      setRevokeTarget(null);
    } catch (error) {
      notify.error(t(getIngestionErrorKey(error)));
    }
  };

  // ---------------- Batches ----------------
  const [batchCursorStack, setBatchCursorStack] = useState<string[]>([]);
  const batchesQuery = API.useIngestionBatchesQuery(
    selectedSourceId
      ? {
          sourceId: selectedSourceId,
          pagination: { take: PAGE_SIZE, cursor: batchCursorStack.at(-1) },
        }
      : { sourceId: "" },
    { skip: !selectedSourceId },
  );
  const batchNextPage = () => {
    const nextCursor = batchesQuery.data?.pageInfo?.nextCursor;
    if (!nextCursor || !batchesQuery.data?.pageInfo?.hasNextPage) return;
    setBatchCursorStack((previous) =>
      previous.at(-1) === nextCursor ? previous : [...previous, nextCursor],
    );
  };
  const batchPreviousPage = () =>
    setBatchCursorStack((previous) => previous.slice(0, -1));

  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const batchDetailQuery = API.useIngestionBatchQuery(selectedBatchId ?? "", {
    skip: !selectedBatchId,
  });
  const openBatchDetail = (batchId: string) => setSelectedBatchId(batchId);
  const closeBatchDetail = () => setSelectedBatchId(null);

  // ---------------- Review queue ----------------
  const [reviewSourceId, setReviewSourceIdState] = useState<string>(ALL);
  const [reviewState, setReviewStateState] = useState<IngestionItemState>(
    IngestionItemState.Pending,
  );
  const [reviewSearch, setReviewSearchState] = useState("");
  const [reviewCursorStack, setReviewCursorStack] = useState<string[]>([]);
  const debouncedReviewSearch = useDebouncedValue(
    reviewSearch.trim(),
    SEARCH_DEBOUNCE_MS,
  );

  const reviewVariables = useMemo(
    () => ({
      filter: {
        sourceId: reviewSourceId === ALL ? undefined : reviewSourceId,
        state: reviewState,
        search:
          debouncedReviewSearch.length >= SEARCH_MIN_LENGTH
            ? debouncedReviewSearch
            : undefined,
      },
      pagination: { take: PAGE_SIZE, cursor: reviewCursorStack.at(-1) },
    }),
    [reviewSourceId, reviewState, debouncedReviewSearch, reviewCursorStack],
  );

  const reviewQuery = API.useIngestionItemsQuery(reviewVariables);
  const [approveItem, approveItemState] = API.useApproveIngestionItemMutation();
  const [rejectItem, rejectItemState] = API.useRejectIngestionItemMutation();

  const resetReviewPagination = () => setReviewCursorStack([]);
  const setReviewSourceId = (value: string) => {
    setReviewSourceIdState(value);
    resetReviewPagination();
  };
  const setReviewState = (value: IngestionItemState) => {
    setReviewStateState(value);
    resetReviewPagination();
  };
  const setReviewSearch = (value: string) => {
    setReviewSearchState(value);
    resetReviewPagination();
  };
  const reviewNextPage = () => {
    const nextCursor = reviewQuery.data?.pageInfo?.nextCursor;
    if (!nextCursor || !reviewQuery.data?.pageInfo?.hasNextPage) return;
    setReviewCursorStack((previous) =>
      previous.at(-1) === nextCursor ? previous : [...previous, nextCursor],
    );
  };
  const reviewPreviousPage = () =>
    setReviewCursorStack((previous) => previous.slice(0, -1));

  const approve = async (itemId: string) => {
    try {
      await approveItem(itemId).unwrap();
      notify.success(t("adminDashboard.ingestion.review.approved"));
    } catch (error) {
      notify.error(t(getIngestionErrorKey(error)));
    }
  };

  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const rejectForm = useForm<SC.TRejectIngestionItemForm>({
    resolver: zodResolver(SC.rejectIngestionItemSchema),
    defaultValues: { reason: "" },
  });
  const openReject = (itemId: string) => {
    rejectForm.reset({ reason: "" });
    setRejectTargetId(itemId);
  };
  const closeReject = () => {
    if (rejectItemState.isLoading) return;
    setRejectTargetId(null);
  };
  const submitReject = rejectForm.handleSubmit(async (values) => {
    if (!rejectTargetId) return;
    try {
      await rejectItem({
        itemId: rejectTargetId,
        reason: values.reason.trim(),
      }).unwrap();
      notify.success(t("adminDashboard.ingestion.review.rejected"));
      setRejectTargetId(null);
    } catch (error) {
      notify.error(t(getIngestionErrorKey(error)));
    }
  });

  return {
    t,
    view,
    setView,

    // sources
    sourcesQuery,
    sourceSearch,
    setSourceSearch,
    sourceKind,
    setSourceKind,
    sourceActive,
    setSourceActive,
    sourceHasActiveFilters,
    resetSourceFilters,
    sourcePage: sourceCursorStack.length + 1,
    sourceNextPage,
    sourcePreviousPage,
    sourceCanPrevious: sourceCursorStack.length > 0,

    isCreateOpen,
    openCreate,
    closeCreate,
    createForm,
    submitCreate,
    isCreating: createSourceState.isLoading,

    // detail
    selectedSourceId,
    selectedSourceQuery,
    openSourceDetail,
    closeSourceDetail,
    editForm,
    submitEdit,
    isSavingEdit: updateSourceState.isLoading,
    toggleSourceActive,

    // keys
    keysQuery,
    isIssueOpen,
    openIssue,
    closeIssue,
    issueForm,
    submitIssue,
    isIssuing: issueKeyState.isLoading,
    issuedCredential,
    revokeTarget,
    openRevokeConfirm,
    closeRevokeConfirm,
    confirmRevoke,
    isRevoking: revokeKeyState.isLoading,

    // batches
    batchesQuery,
    batchNextPage,
    batchPreviousPage,
    batchPage: batchCursorStack.length + 1,
    batchCanPrevious: batchCursorStack.length > 0,
    selectedBatchId,
    batchDetailQuery,
    openBatchDetail,
    closeBatchDetail,

    // review
    reviewQuery,
    reviewSourceId,
    setReviewSourceId,
    reviewState,
    setReviewState,
    reviewSearch,
    setReviewSearch,
    reviewNextPage,
    reviewPreviousPage,
    reviewPage: reviewCursorStack.length + 1,
    reviewCanPrevious: reviewCursorStack.length > 0,
    approve,
    isApproving: approveItemState.isLoading,
    rejectTargetId,
    openReject,
    closeReject,
    rejectForm,
    submitReject,
    isRejecting: rejectItemState.isLoading,
  };
};

export type TUseAdminIngestionTab = ReturnType<typeof useAdminIngestionTab>;
