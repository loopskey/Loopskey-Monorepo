"use client";

import { useCertificationSearchQuery } from "@/lib/rtk/endpoints/cpd-plan.api";
import { useMemo, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebounced";

const MIN_QUERY_LENGTH = 2;
const SEARCH_LIMIT = 8;

export const useCertificationSearch = () => {
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 350);
  const trimmed = debounced.trim();
  const hasQuery = trimmed.length >= MIN_QUERY_LENGTH;

  const { data, isFetching, isError, refetch } = useCertificationSearchQuery(
    { input: { query: trimmed, limit: SEARCH_LIMIT } },
    { skip: !hasQuery },
  );

  const results = useMemo(
    () => (hasQuery ? (data ?? []) : []),
    [hasQuery, data],
  );

  const resetQuery = () => setQuery("");

  return {
    query,
    results,
    isError,
    refetch,
    setQuery,
    hasQuery,
    isFetching,
    resetQuery,
    debouncedQuery: trimmed,
  };
};
