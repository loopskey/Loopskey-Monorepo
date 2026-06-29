"use client";

import { ProviderEventsTableQueryVariables } from "@/lib/graphql/generated";
import { useProviderEventsTableQuery } from "@/lib/rtk/endpoints/provider.api";
import { useMemo, useState } from "react";
import { EventStatus } from "@/lib/graphql/generated";

type TProviderEventStatusFilter = "ALL" | EventStatus;

export const useProviderMyEventsTab = () => {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TProviderEventStatusFilter>("ALL");
  const [cursorStack, setCursorStack] = useState<string[]>([]);

  const cursor = cursorStack.at(-1);

  const variables = useMemo<ProviderEventsTableQueryVariables>(
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

  const query = useProviderEventsTableQuery(variables);
  const items = useMemo(() => query.data?.items ?? [], [query.data?.items]);
  const totalCount = query.data?.totalCount ?? 0;

  const stats = useMemo(
    () => ({
      totalEvents: totalCount,
      published: items.filter((item) => item.status === EventStatus.Published)
        .length,
      draft: items.filter((item) => item.status === EventStatus.Draft).length,
      totalRegistrations: items.reduce(
        (sum, item) => sum + Number(item.registrants ?? 0),
        0,
      ),
    }),
    [items, totalCount],
  );

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

  const updateStatus = (value: TProviderEventStatusFilter) => {
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
    setStatus: updateStatus,
    setSearch: updateSearch,
    page: cursorStack.length + 1,
    canPrevious: cursorStack.length > 0,
    hasNextPage: Boolean(query.data?.pageInfo?.hasNextPage),
  };
};
