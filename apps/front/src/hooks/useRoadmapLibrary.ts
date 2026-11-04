"use client";

import { ProfessionalExploreRoadmapsQueryVariables } from "@/lib/graphql/operations/professional";
import { ProfessionalMyRoadmapsQueryVariables } from "@/lib/graphql/operations/professional";
import { ROADMAP_LIST_TAKE, sortRoadmaps } from "@/utils/roadmap-library.util";
import { countRoadmapStates } from "@/utils/roadmap-library.util";
import { SEARCH_DEBOUNCE_MS } from "@utils/constant";
import { useMemo, useState } from "react";
import { useDebouncedValue } from "@hooks/useDebounced";
import { filterRoadmaps } from "@/utils/roadmap-library.util";
import { PAGE_SIZE } from "@/utils/constant";
import { useI18n } from "@/hooks/useI18n";

import * as API from "@/lib/rtk/endpoints/professional.api";

import type { TRoadmapStateFilter } from "@/utils/roadmap-library.util";
import type { TRoadmapSort } from "@/utils/roadmap-library.util";

export const useRoadmapLibrary = (totalRoadmaps: number) => {
  const { language } = useI18n();
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState<TRoadmapStateFilter>("all");
  const [sort, setSort] = useState<TRoadmapSort>("newest");
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [exploreSearch, setExploreSearch] = useState("");
  const [exploreCursorStack, setExploreCursorStack] = useState<string[]>([]);

  const usesServerSearch = totalRoadmaps > ROADMAP_LIST_TAKE;
  const debouncedSearch = useDebouncedValue(search.trim(), SEARCH_DEBOUNCE_MS);
  const debouncedExploreSearch = useDebouncedValue(
    exploreSearch.trim(),
    SEARCH_DEBOUNCE_MS,
  );

  const myRoadmapsVariables = useMemo<ProfessionalMyRoadmapsQueryVariables>(
    () =>
      usesServerSearch
        ? {
            filter: { search: debouncedSearch || undefined },
            pagination: {
              take: ROADMAP_LIST_TAKE,
              cursor: cursorStack.at(-1),
            },
          }
        : { pagination: { take: ROADMAP_LIST_TAKE } },
    [usesServerSearch, debouncedSearch, cursorStack],
  );

  const exploreVariables = useMemo<ProfessionalExploreRoadmapsQueryVariables>(
    () => ({
      filter: { search: debouncedExploreSearch || undefined },
      pagination: { take: PAGE_SIZE, cursor: exploreCursorStack.at(-1) },
    }),
    [debouncedExploreSearch, exploreCursorStack],
  );

  const roadmapsQuery = API.useProfessionalMyRoadmapsQuery(myRoadmapsVariables);
  const exploreQuery =
    API.useProfessionalExploreRoadmapsQuery(exploreVariables);

  const loaded = useMemo(
    () => roadmapsQuery.data?.items ?? [],
    [roadmapsQuery.data?.items],
  );
  const counts = countRoadmapStates(loaded);
  const roadmaps = sortRoadmaps(
    filterRoadmaps(loaded, {
      search: usesServerSearch ? "" : search,
      state: stateFilter,
    }),
    sort,
    language,
  );

  const pageInfo = roadmapsQuery.data?.pageInfo;
  const explorePageInfo = exploreQuery.data?.pageInfo;

  const changeSearch = (value: string) => {
    setSearch(value);
    setCursorStack([]);
  };

  const changeExploreSearch = (value: string) => {
    setExploreSearch(value);
    setExploreCursorStack([]);
  };

  return {
    sort,
    search,
    counts,
    setSort,
    roadmaps,
    stateFilter,
    changeSearch,
    exploreSearch,
    setStateFilter,
    changeExploreSearch,
    totalCount: roadmapsQuery.data?.totalCount ?? 0,
    isLoading: roadmapsQuery.isLoading,
    isFetching: roadmapsQuery.isFetching,
    isError: roadmapsQuery.isError && !roadmapsQuery.data,
    refetch: roadmapsQuery.refetch,
    page: cursorStack.length + 1,
    hasNextPage: Boolean(pageInfo?.hasNextPage),
    goNext: () => {
      if (!pageInfo?.hasNextPage || !pageInfo.nextCursor) return;
      setCursorStack((stack) => [...stack, pageInfo.nextCursor!]);
    },
    goPrevious: () => setCursorStack((stack) => stack.slice(0, -1)),
    explore: {
      roadmaps: exploreQuery.data?.items ?? [],
      totalCount: exploreQuery.data?.totalCount,
      isLoading: exploreQuery.isLoading,
      isFetching: exploreQuery.isFetching,
      isError: exploreQuery.isError && !exploreQuery.data,
      refetch: exploreQuery.refetch,
      page: exploreCursorStack.length + 1,
      hasNextPage: Boolean(explorePageInfo?.hasNextPage),
      goNext: () => {
        if (!explorePageInfo?.hasNextPage || !explorePageInfo.nextCursor)
          return;
        setExploreCursorStack((stack) => [
          ...stack,
          explorePageInfo.nextCursor!,
        ]);
      },
      goPrevious: () => setExploreCursorStack((stack) => stack.slice(0, -1)),
    },
  };
};
