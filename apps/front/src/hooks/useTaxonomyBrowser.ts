"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebounced";

import * as PAPI from "@/lib/rtk/endpoints/professional.api";
import * as C from "@/utils/professional-onboarding.constant";
import * as T from "@/types/professional-taxonomy.types";

const normalize = (value: string) => value.replace(/\s+/g, " ").trim();

const searchable = (value: string) =>
  value.replace(/\s/g, "").length >= C.TAXONOMY_SEARCH_MIN_LENGTH;

const toTerm = (term: T.TTaxonomyTerm): T.TTaxonomyTerm => ({
  id: term.id,
  label: term.label,
  groupKey: term.groupKey,
  groupLabel: term.groupLabel,
});

export const useTaxonomyBrowser = ({
  kind,
  enabled = true,
}: T.TTaxonomyBrowserOptions) => {
  const categoriesQuery = PAPI.useProfessionalTaxonomyCategoriesQuery(
    { kind },
    { skip: !enabled },
  );
  const [fetchTerms] = PAPI.useLazyProfessionalTaxonomyTermsQuery();

  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [pages, setPages] = useState<Record<string, T.TTaxonomyPage>>({});
  const [query, setQuery] = useState("");
  const [searchPage, setSearchPage] = useState<T.TTaxonomyPage | null>(null);

  const debounced = normalize(
    useDebouncedValue(query, C.TAXONOMY_SEARCH_DEBOUNCE_MS),
  );
  const isSearchActive = searchable(debounced);
  const isSearchTooShort = Boolean(normalize(query)) && !searchable(query);

  const searchRequest = useRef(0);
  const categoryRequests = useRef<Record<string, number>>({});

  const request = useCallback(
    (input: { groupKey?: string; search?: string; cursor?: string | null }) =>
      fetchTerms(
        {
          input: {
            kind,
            take: C.TAXONOMY_PAGE_SIZE,
            groupKey: input.groupKey ?? null,
            search: input.search ?? null,
            cursor: input.cursor ?? null,
          },
        },
        true,
      ).unwrap(),
    [fetchTerms, kind],
  );

  const loadCategory = useCallback(
    async (key: string, cursor: string | null) => {
      const ticket = (categoryRequests.current[key] ?? 0) + 1;
      categoryRequests.current[key] = ticket;
      setPages((current) => ({
        ...current,
        [key]: {
          items: cursor ? (current[key]?.items ?? []) : [],
          totalCount: current[key]?.totalCount ?? 0,
          nextCursor: current[key]?.nextCursor ?? null,
          status: cursor ? "loadingMore" : "loading",
        },
      }));
      try {
        const page = await request({ groupKey: key, cursor });
        if (categoryRequests.current[key] !== ticket) return;
        setPages((current) => ({
          ...current,
          [key]: {
            items: [
              ...(cursor ? (current[key]?.items ?? []) : []),
              ...page.items.map(toTerm),
            ],
            totalCount: page.totalCount,
            nextCursor: page.pageInfo.nextCursor ?? null,
            status: "ready",
          },
        }));
      } catch {
        if (categoryRequests.current[key] !== ticket) return;
        setPages((current) => ({
          ...current,
          [key]: {
            items: current[key]?.items ?? [],
            totalCount: current[key]?.totalCount ?? 0,
            nextCursor: current[key]?.nextCursor ?? null,
            status: "error",
          },
        }));
      }
    },
    [request],
  );

  const loadSearch = useCallback(
    async (search: string, cursor: string | null) => {
      const ticket = searchRequest.current + 1;
      searchRequest.current = ticket;
      setSearchPage((current) => ({
        items: cursor ? (current?.items ?? []) : [],
        totalCount: current?.totalCount ?? 0,
        nextCursor: current?.nextCursor ?? null,
        status: cursor ? "loadingMore" : "loading",
      }));
      try {
        const page = await request({ search, cursor });
        if (searchRequest.current !== ticket) return;
        setSearchPage((current) => ({
          items: [
            ...(cursor ? (current?.items ?? []) : []),
            ...page.items.map(toTerm),
          ],
          totalCount: page.totalCount,
          nextCursor: page.pageInfo.nextCursor ?? null,
          status: "ready",
        }));
      } catch {
        if (searchRequest.current !== ticket) return;
        setSearchPage((current) => ({
          items: current?.items ?? [],
          totalCount: current?.totalCount ?? 0,
          nextCursor: current?.nextCursor ?? null,
          status: "error",
        }));
      }
    },
    [request],
  );

  useEffect(() => {
    if (!enabled || !isSearchActive) {
      searchRequest.current += 1;
      setSearchPage(null);
      return;
    }
    void loadSearch(debounced, null);
  }, [enabled, isSearchActive, debounced, loadSearch]);

  const toggleCategory = useCallback(
    (key: string) => {
      setExpandedKey((current) => (current === key ? null : key));
      if (expandedKey !== key && !pages[key]) void loadCategory(key, null);
    },
    [expandedKey, pages, loadCategory],
  );

  const loadMoreCategory = useCallback(
    (key: string) => {
      const page = pages[key];
      if (page?.nextCursor && page.status === "ready")
        void loadCategory(key, page.nextCursor);
    },
    [pages, loadCategory],
  );

  const retryCategory = useCallback(
    (key: string) => {
      const page = pages[key];
      void loadCategory(key, page?.items.length ? page.nextCursor : null);
    },
    [pages, loadCategory],
  );

  const loadMoreSearch = useCallback(() => {
    if (searchPage?.nextCursor && searchPage.status === "ready")
      void loadSearch(debounced, searchPage.nextCursor);
  }, [searchPage, debounced, loadSearch]);

  const retrySearch = useCallback(() => {
    void loadSearch(
      debounced,
      searchPage?.items.length ? searchPage.nextCursor : null,
    );
  }, [searchPage, debounced, loadSearch]);

  return {
    query,
    setQuery,
    searchTerm: debounced,
    isSearchActive,
    isSearchTooShort,
    searchPage,
    loadMoreSearch,
    retrySearch,
    expandedKey,
    pages,
    toggleCategory,
    loadMoreCategory,
    retryCategory,
    categories: (categoriesQuery.data ?? []) as T.TTaxonomyCategory[],
    isCategoriesLoading: categoriesQuery.isLoading,
    hasCategoriesError: Boolean(categoriesQuery.error),
    retryCategories: categoriesQuery.refetch,
  };
};
