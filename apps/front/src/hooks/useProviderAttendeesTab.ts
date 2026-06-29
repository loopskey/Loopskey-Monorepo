"use client";

import { useProviderAttendeesQuery } from "@/lib/rtk/endpoints/provider.api";
import { EventRegistrationStatus } from "@/lib/graphql/generated";
import { useMemo, useState } from "react";

export const useProviderAttendeesTab = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<EventRegistrationStatus | "ALL">("ALL");
  const [cursorStack, setCursorStack] = useState<string[]>([]);

  const cursor = cursorStack.at(-1);

  const variables = useMemo(
    () => ({
      filter: {
        search: search.trim() || undefined,
        status: status === "ALL" ? undefined : status,
      },
      pagination: {
        take: 10,
        cursor,
      },
    }),
    [search, status, cursor],
  );

  const query = useProviderAttendeesQuery(variables);

  const items = useMemo(() => query.data?.items ?? [], [query.data?.items]);

  const stats = query.data?.stats ?? {
    totalRegistered: 0,
    confirmed: 0,
    attended: 0,
    attendanceRate: 0,
  };

  const nextPage = () => {
    const nextCursor = query.data?.pageInfo?.nextCursor;
    if (nextCursor) setCursorStack((prev) => [...prev, nextCursor]);
  };

  const previousPage = () => {
    setCursorStack((prev) => prev.slice(0, -1));
  };

  const resetPagination = () => {
    setCursorStack([]);
  };

  const updateSearch = (value: string) => {
    setSearch(value);
    resetPagination();
  };

  const updateStatus = (value: EventRegistrationStatus | "ALL") => {
    setStatus(value);
    resetPagination();
  };

  return {
    ...query,
    items,
    stats,
    search,
    status,
    nextPage,
    previousPage,
    setSearch: updateSearch,
    setStatus: updateStatus,
    page: cursorStack.length + 1,
    canPrevious: cursorStack.length > 0,
    totalCount: query.data?.totalCount ?? 0,
    hasNextPage: Boolean(query.data?.pageInfo?.hasNextPage),
  };
};
