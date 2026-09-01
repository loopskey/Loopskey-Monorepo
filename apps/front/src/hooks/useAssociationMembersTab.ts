"use client";

import { getAssociationErrorTranslationKey } from "@utils/association-error";
import { useCallback, useMemo, useState } from "react";
import { AssociationMemberStatus } from "@/lib/graphql/base";
import { buildRosterComposition } from "@utils/association-roster-composition";
import { SEARCH_DEBOUNCE_MS } from "@utils/constant";
import { useDebouncedValue } from "@hooks/useDebounced";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useI18n } from "@hooks/useI18n";
import { notify } from "@hooks/notify";

import * as IMPORT from "@utils/association-members-import";
import * as API from "@lib/rtk/endpoints/association-dashboard.api";
import * as SC from "@lib/validations/association-dashboard.schema";
import * as T from "@/types/association-dashboard.types";

const PAGE_SIZE = 10;

const COMPOSITION_SAMPLE_SIZE = 100;

const ALL = "ALL";

export const useAssociationMembersTab = () => {
  const { t, language } = useI18n();

  const [search, setSearch] = useState("");
  const [groupId, setGroupId] = useState<string>(ALL);
  const [status, setStatus] = useState<string>(ALL);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [view, setView] = useState<T.TAssociationMembersView>("roster");

  const [isInviteOpen, setInviteOpen] = useState(false);
  const [inviteOutcome, setInviteOutcome] =
    useState<T.TAssociationInviteOutcomeView | null>(null);

  const [importPreview, setImportPreview] =
    useState<IMPORT.TAssociationImportPreview | null>(null);
  const [importFileName, setImportFileName] = useState("");
  const [importResult, setImportResult] =
    useState<T.TAssociationImportResult | null>(null);
  const [isParsing, setParsing] = useState(false);

  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);

  const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS);
  const cursor = cursorStack.at(-1);

  const inviteForm = useForm<SC.TInviteAssociationMemberForm>({
    resolver: zodResolver(SC.inviteAssociationMemberSchema),
    defaultValues: { email: "", fullName: "", groupId: "", memberNumber: "" },
  });

  const groupForm = useForm<SC.TAssociationGroupForm>({
    resolver: zodResolver(SC.associationGroupSchema),
    defaultValues: { title: "", description: "" },
  });

  const filter = useMemo(
    () => ({
      search: debouncedSearch.trim() || undefined,
      groupId: groupId === ALL ? undefined : groupId,
      status: status === ALL ? undefined : (status as AssociationMemberStatus),
    }),
    [debouncedSearch, groupId, status],
  );

  const membersQuery = API.useAssociationMembersQuery({
    filter,
    pagination: { take: PAGE_SIZE, cursor },
  });

  const statsQuery = API.useAssociationMemberStatsQuery();
  const groupsQuery = API.useAssociationGroupsQuery();

  const compositionQuery = API.useAssociationMembersQuery({
    pagination: { take: COMPOSITION_SAMPLE_SIZE },
  });

  const [inviteMember, inviteState] = API.useInviteAssociationMemberMutation();
  const [bulkInvite, bulkInviteState] =
    API.useBulkInviteAssociationMembersMutation();
  const [setMemberStatus, setMemberStatusState] =
    API.useSetAssociationMemberStatusMutation();
  const [resendInvitation, resendInvitationState] =
    API.useResendAssociationMemberInvitationMutation();
  const [createGroup, createGroupState] =
    API.useCreateAssociationGroupMutation();
  const [updateGroup, updateGroupState] =
    API.useUpdateAssociationGroupMutation();
  const [setGroupActive, setGroupActiveState] =
    API.useSetAssociationGroupActiveMutation();

  const members = useMemo(
    () => membersQuery.data?.items ?? [],
    [membersQuery.data?.items],
  );

  const groups = useMemo(() => groupsQuery.data ?? [], [groupsQuery.data]);

  const groupOptions = useMemo(
    () =>
      groups
        .filter((group) => group.isActive)
        .map((group) => ({ value: group.id, label: group.title })),
    [groups],
  );

  const compositionRows = useMemo(
    () =>
      buildRosterComposition(
        compositionQuery.data?.items ?? [],
        t("associationDashboard.members.chart.ungrouped"),
      ),
    [compositionQuery.data?.items, t],
  );

  const compositionTotal = compositionQuery.data?.totalCount ?? 0;
  const compositionSampled = compositionQuery.data?.items.length ?? 0;

  const isFiltered =
    Boolean(debouncedSearch.trim()) || groupId !== ALL || status !== ALL;

  const failWith = useCallback(
    (error: unknown) =>
      notify.error(t(getAssociationErrorTranslationKey(error))),
    [t],
  );

  const importFailureMessage = useCallback(
    (failure: { code: string; reason: string }) =>
      t(getAssociationErrorTranslationKey(failure.code)),
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
    setGroupId(ALL);
    setStatus(ALL);
    setCursorStack([]);
  };

  const nextPage = () => {
    const nextCursor = membersQuery.data?.pageInfo?.nextCursor;
    if (nextCursor) setCursorStack((previous) => [...previous, nextCursor]);
  };

  const previousPage = () =>
    setCursorStack((previous) => previous.slice(0, -1));

  const applyCompositionSegment = (
    segmentGroupId: string | null,
    segmentStatus: AssociationMemberStatus,
  ) => {
    setCursorStack([]);
    setGroupId(segmentGroupId ?? ALL);
    setStatus(segmentStatus);
  };

  const openInvite = () => {
    setInviteOutcome(null);
    inviteForm.reset();
    setInviteOpen(true);
  };

  const submitInvite = inviteForm.handleSubmit(async (values) => {
    try {
      const result = await inviteMember({
        email: values.email.trim().toLowerCase(),
        fullName: values.fullName.trim(),
        groupId: values.groupId || undefined,
        memberNumber: values.memberNumber?.trim() || undefined,
      }).unwrap();
      setInviteOutcome({
        outcome: result.outcome,
        memberName: result.member.fullName ?? values.fullName.trim(),
        memberEmail: result.member.email ?? values.email.trim().toLowerCase(),
      });
      inviteForm.reset();
    } catch (error) {
      failWith(error);
    }
  });

  const closeInvite = () => {
    setInviteOpen(false);
    setInviteOutcome(null);
  };

  const resendMemberInvitation = async (memberId: string) => {
    try {
      await resendInvitation({ memberId }).unwrap();
      notify.success(
        t("associationDashboard.members.messages.invitationResent"),
      );
    } catch (error) {
      failWith(error);
    }
  };

  const changeMemberStatus = async (
    memberId: string,
    nextStatus: AssociationMemberStatus,
  ) => {
    try {
      await setMemberStatus({ memberId, status: nextStatus }).unwrap();
      notify.success(
        t(
          nextStatus === AssociationMemberStatus.Inactive
            ? "associationDashboard.members.messages.memberDeactivated"
            : "associationDashboard.members.messages.memberReactivated",
        ),
      );
    } catch (error) {
      failWith(error);
    }
  };

  const previewImportFile = async (file?: File | null) => {
    if (!file) return;
    setImportResult(null);
    setParsing(true);
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(await file.arrayBuffer());
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
      setImportFileName(file.name);
      setImportPreview(IMPORT.buildImportPreview(rawRows));
    } catch {
      setImportPreview(null);
      setImportFileName("");
      notify.error(t("associationDashboard.members.bulk.parseFailed"));
    } finally {
      setParsing(false);
    }
  };

  const clearImport = () => {
    setImportPreview(null);
    setImportFileName("");
    setImportResult(null);
  };

  const confirmImport = async () => {
    const rows = importPreview
      ? IMPORT.toBulkInviteRows(importPreview.rows)
      : [];
    if (!rows.length) return;

    try {
      const result = await bulkInvite({ rows }).unwrap();
      setImportResult(result);
      setImportPreview(null);
      notify.success(
        t("associationDashboard.members.messages.imported", {
          invited: result.invited,
          linked: result.linked,
          failed: result.failed,
        }),
      );
    } catch (error) {
      failWith(error);
    }
  };

  const downloadTemplate = () => {
    const columns = IMPORT.ASSOCIATION_IMPORT_COLUMNS;
    const byColumn = (prefix: string) =>
      Object.fromEntries(
        columns.map((column) => [column, t(prefix + column)]),
      ) as Record<IMPORT.TAssociationImportColumn, string>;

    const csv = IMPORT.buildImportTemplateCsv(
      byColumn("associationDashboard.members.bulk.columns."),
      byColumn("associationDashboard.members.bulk.example."),
    );

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "association-members-template.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const startGroupEdit = (group: T.TAssociationGroupRow) => {
    setEditingGroupId(group.id);
    groupForm.reset({
      title: group.title,
      description: group.description ?? "",
    });
  };

  const cancelGroupEdit = () => {
    setEditingGroupId(null);
    groupForm.reset({ title: "", description: "" });
  };

  const submitGroup = groupForm.handleSubmit(async (values) => {
    try {
      if (editingGroupId) {
        await updateGroup({
          groupId: editingGroupId,
          title: values.title.trim(),
          description: values.description?.trim() || undefined,
        }).unwrap();
        notify.success(t("associationDashboard.members.messages.groupUpdated"));
      } else {
        await createGroup({
          title: values.title.trim(),
          description: values.description?.trim() || undefined,
        }).unwrap();
        notify.success(t("associationDashboard.members.messages.groupCreated"));
      }
      cancelGroupEdit();
    } catch (error) {
      failWith(error);
    }
  });

  const toggleGroupActive = async (group: T.TAssociationGroupRow) => {
    try {
      await setGroupActive({
        groupId: group.id,
        isActive: !group.isActive,
      }).unwrap();
      notify.success(
        t(
          group.isActive
            ? "associationDashboard.members.messages.groupDeactivated"
            : "associationDashboard.members.messages.groupReactivated",
        ),
      );
    } catch (error) {
      failWith(error);
    }
  };

  const isMutating =
    inviteState.isLoading ||
    bulkInviteState.isLoading ||
    createGroupState.isLoading ||
    updateGroupState.isLoading ||
    setGroupActiveState.isLoading ||
    setMemberStatusState.isLoading ||
    resendInvitationState.isLoading;

  return {
    t,
    view,
    search,
    status,
    groupId,
    setView,
    members,
    nextPage,
    isFiltered,
    openInvite,
    inviteForm,
    closeInvite,
    submitInvite,
    isInviteOpen,
    groupOptions,
    previousPage,
    resetFilters,
    setInviteOpen,
    inviteOutcome,
    compositionRows,
    compositionTotal,
    compositionSampled,
    resendMemberInvitation,
    stats: statsQuery.data,
    applyCompositionSegment,
    page: cursorStack.length + 1,
    setSearch: changeFilter(setSearch),
    setStatus: changeFilter(setStatus),
    canPrevious: cursorStack.length > 0,
    setGroupId: changeFilter(setGroupId),
    locale: language === "fr" ? "fr-FR" : "en-GB",
    totalCount: membersQuery.data?.totalCount ?? 0,
    hasNoMembers: (statsQuery.data?.totalMembers ?? 0) === 0,
    hasNextPage: Boolean(membersQuery.data?.pageInfo?.hasNextPage),
    isCompositionPartial: compositionTotal > compositionSampled,
    isInviting: inviteState.isLoading,
    changeMemberStatus,
    isParsing,
    clearImport,
    importResult,
    confirmImport,
    importPreview,
    importFileName,
    downloadTemplate,
    importFailureMessage,
    previewImportFile,
    isImporting: bulkInviteState.isLoading,
    groups,
    groupForm,
    submitGroup,
    editingGroupId,
    startGroupEdit,
    cancelGroupEdit,
    toggleGroupActive,
    isGroupSaving: createGroupState.isLoading || updateGroupState.isLoading,
    isMutating,
    isRefetching: membersQuery.isFetching && !membersQuery.isLoading,
    isError: membersQuery.isError || statsQuery.isError,
    isLoading:
      membersQuery.isLoading ||
      statsQuery.isLoading ||
      groupsQuery.isLoading ||
      compositionQuery.isLoading,
    retry: () => {
      void membersQuery.refetch();
      void statsQuery.refetch();
      void groupsQuery.refetch();
      void compositionQuery.refetch();
    },
  };
};

export type TUseAssociationMembersTab = ReturnType<
  typeof useAssociationMembersTab
>;
