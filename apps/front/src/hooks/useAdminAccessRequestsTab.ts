"use client";

import { OrganizationAccessRequestStatus } from "@/lib/graphql/generated";
import { AdminOrgAccessRequestFilter } from "@/lib/graphql/generated";
import { useMemo, useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as API from "@/lib/rtk/endpoints/admin-dashboard.api";

type TStatusFilter = "ALL" | OrganizationAccessRequestStatus;

type TAccessRequestItem = NonNullable<
  ReturnType<typeof API.useAdminOrgAccessRequestsQuery>["data"]
>["items"][number];

export const statusOptions = [
  "ALL",
  OrganizationAccessRequestStatus.Pending,
  OrganizationAccessRequestStatus.Approved,
  OrganizationAccessRequestStatus.Rejected,
] as const;

export const useAdminAccessRequestsTab = () => {
  const { t } = useI18n();

  const [search, setSearchState] = useState("");
  const [status, setStatusState] = useState<TStatusFilter>("ALL");
  const [rejectReason, setRejectReason] = useState("");
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [selectedRequest, setSelectedRequest] =
    useState<TAccessRequestItem | null>(null);

  const cursor = cursorStack.at(-1);

  const variables = useMemo(() => {
    const filter: AdminOrgAccessRequestFilter = {
      search: search.trim() || undefined,
      status: status === "ALL" ? undefined : status,
    };

    return {
      filter,
      pagination: {
        take: 10,
        cursor,
      },
    };
  }, [search, status, cursor]);

  const query = API.useAdminOrgAccessRequestsQuery(variables);

  const [approveRequest, approveState] =
    API.useApproveAdminOrgAccessRequestMutation();

  const [rejectRequest, rejectState] =
    API.useRejectAdminOrgAccessRequestMutation();

  const items = useMemo(() => query.data?.items ?? [], [query.data?.items]);

  const stats = useMemo(() => {
    return {
      total: query.data?.totalCount ?? 0,
      pending: items.filter(
        (item) => item.status === OrganizationAccessRequestStatus.Pending,
      ).length,
      approved: items.filter(
        (item) => item.status === OrganizationAccessRequestStatus.Approved,
      ).length,
      rejected: items.filter(
        (item) => item.status === OrganizationAccessRequestStatus.Rejected,
      ).length,
    };
  }, [items, query.data?.totalCount]);

  const resetPagination = () => {
    setCursorStack([]);
  };

  const setSearch = (value: string) => {
    setSearchState(value);
    resetPagination();
  };

  const setStatus = (value: TStatusFilter) => {
    setStatusState(value);
    resetPagination();
  };

  const openRequestReview = (item: TAccessRequestItem) => {
    setRejectReason("");
    setSelectedRequest(item);
  };

  const closeRequestReview = () => {
    setRejectReason("");
    setSelectedRequest(null);
  };

  const refresh = async () => {
    await query.refetch();
  };

  const approve = async (requestId?: string) => {
    const targetId = requestId ?? selectedRequest?.id;
    if (!targetId) return;
    try {
      await approveRequest(targetId).unwrap();
      notify.success(t("adminDashboard.accessRequests.messages.approved"));
      closeRequestReview();
      await query.refetch();
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const reject = async (requestId?: string) => {
    const targetId = requestId ?? selectedRequest?.id;
    if (!targetId) return;
    if (!rejectReason.trim()) {
      notify.error(
        t("adminDashboard.accessRequests.dialog.rejectReasonRequired"),
      );
      return;
    }
    try {
      await rejectRequest({
        requestId: targetId,
        reason: rejectReason.trim(),
      }).unwrap();
      notify.success(t("adminDashboard.accessRequests.messages.rejected"));
      closeRequestReview();
      await query.refetch();
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const nextPage = () => {
    const nextCursor = query.data?.pageInfo?.nextCursor;
    if (!nextCursor || !query.data?.pageInfo?.hasNextPage) return;
    setCursorStack((prev) => {
      if (prev.at(-1) === nextCursor) return prev;
      return [...prev, nextCursor];
    });
  };

  const previousPage = () => setCursorStack((prev) => prev.slice(0, -1));

  const resetFilters = () => {
    setSearchState("");
    setStatusState("ALL");
    resetPagination();
  };

  const hasActiveFilters = search.trim().length > 0 || status !== "ALL";

  const isLoading =
    query.isFetching || approveState.isLoading || rejectState.isLoading;

  return {
    t,
    items,
    stats,
    query,
    search,
    status,
    reject,
    refresh,
    approve,
    nextPage,
    setSearch,
    setStatus,
    isLoading,
    previousPage,
    rejectReason,
    resetFilters,
    statusOptions,
    selectedRequest,
    setRejectReason,
    hasActiveFilters,
    openRequestReview,
    closeRequestReview,
    page: cursorStack.length + 1,
    canPrevious: cursorStack.length > 0,
    totalCount: query.data?.totalCount ?? 0,
    hasNextPage: Boolean(query.data?.pageInfo?.hasNextPage),
  };
};
