"use client";

import { OrganizationAccessRequestStatus } from "@/lib/graphql/generated";
import { AdminOrgAccessRequestFilter } from "@/lib/graphql/generated";
import { useMemo, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebounced";
import { useI18n } from "@/hooks/useI18n";

import * as API from "@/lib/rtk/endpoints/admin-dashboard.api";

type TStatusFilter = "ALL" | OrganizationAccessRequestStatus;
type TSortDirection = "asc" | "desc";

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
  const [sortDirection, setSortDirectionState] =
    useState<TSortDirection>("desc");
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    null,
  );
  const debouncedSearch = useDebouncedValue(search.trim(), 350);

  const cursor = cursorStack.at(-1);

  const variables = useMemo(() => {
    const filter: AdminOrgAccessRequestFilter = {
      search: debouncedSearch || undefined,
      status: status === "ALL" ? undefined : status,
      sortDirection,
    };
    return {
      filter,
      pagination: {
        take: 10,
        cursor,
      },
    };
  }, [debouncedSearch, status, sortDirection, cursor]);

  const query = API.useAdminOrgAccessRequestsQuery(variables);
  const detailQuery = API.useAdminOrgAccessRequestDetailQuery(
    selectedRequestId ?? "",
    {
      skip: !selectedRequestId,
      refetchOnMountOrArgChange: true,
    },
  );

  const items = useMemo(() => query.data?.items ?? [], [query.data?.items]);

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

  const setSortDirection = (value: TSortDirection) => {
    setSortDirectionState(value);
    resetPagination();
  };

  const openRequestReview = (item: TAccessRequestItem) => {
    setSelectedRequestId(item.id);
  };

  const closeRequestReview = () => {
    setSelectedRequestId(null);
  };

  const refresh = async () => {
    await query.refetch();
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
    setSortDirectionState("desc");
    resetPagination();
  };

  const hasActiveFilters =
    search.trim().length > 0 || status !== "ALL" || sortDirection !== "desc";

  return {
    t,
    items,
    query,
    search,
    status,
    refresh,
    nextPage,
    setSearch,
    setStatus,
    detailQuery,
    sortDirection,
    selectedRequestId,
    setSortDirection,
    isLoading: query.isFetching,
    previousPage,
    resetFilters,
    statusOptions,
    selectedRequest: detailQuery.data ?? null,
    hasActiveFilters,
    openRequestReview,
    closeRequestReview,
    page: cursorStack.length + 1,
    canPrevious: cursorStack.length > 0,
    totalCount: query.data?.totalCount ?? 0,
    hasNextPage: Boolean(query.data?.pageInfo?.hasNextPage),
  };
};
