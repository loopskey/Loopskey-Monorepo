"use client";

import { TProfessionalWishlistFilters } from "@/types/hooks.types";
import { TProfessionalWishlistItem } from "@/types/hooks.types";
import { useToggleWishlistMutation } from "@/lib/rtk/endpoints/content-interaction.api";
import { DEFAULT_PAGE, PAGE_SIZE } from "@/utils/constant";
import { useMyWishlistQuery } from "@/lib/rtk/endpoints/content-interaction.api";
import { useMemo, useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebounced";
import { ContentType } from "@/lib/graphql/generated";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

import * as H from "@/utils/wishlist-filters.helper";

const SEARCH_DEBOUNCE_MS = 350;

export const useProfessionalWishlistTab = () => {
  const { t } = useI18n();

  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize] = useState(PAGE_SIZE);
  const [filters, setFilters] = useState<TProfessionalWishlistFilters>(
    H.WISHLIST_INITIAL_FILTERS,
  );

  const debouncedSearch = useDebouncedValue(
    filters.search.trim(),
    SEARCH_DEBOUNCE_MS,
  );

  const queryInput = useMemo(
    () =>
      H.buildWishlistQueryInput({
        filters,
        page,
        limit: pageSize,
        search: debouncedSearch,
      }),
    [page, pageSize, debouncedSearch, filters],
  );

  const { data, isFetching, refetch } = useMyWishlistQuery(queryInput);

  const [toggleWishlist, { isLoading: isRemoving }] =
    useToggleWishlistMutation();

  const wishlistItems = useMemo<TProfessionalWishlistItem[]>(() => {
    return (data?.items ?? []) as TProfessionalWishlistItem[];
  }, [data?.items]);

  const totalCount = data?.totalCount ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const safePage = data?.page ?? page;
  const hasNextPage = data?.hasNextPage ?? false;
  const canPrevious = data?.hasPreviousPage ?? false;

  const updateFilter = <Key extends keyof TProfessionalWishlistFilters>(
    key: Key,
    value: TProfessionalWishlistFilters[Key],
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(DEFAULT_PAGE);
  };

  const resetFilters = () => {
    setFilters(H.WISHLIST_INITIAL_FILTERS);
    setPage(DEFAULT_PAGE);
  };

  const goNext = () => setPage((current) => Math.min(current + 1, totalPages));
  const goPrevious = () =>
    setPage((current) => Math.max(current - 1, DEFAULT_PAGE));
  const handleRefresh = () => refetch();

  const handleRemove = async (contentType: ContentType, contentId: string) => {
    try {
      await toggleWishlist({ contentType, contentId }).unwrap();
      notify.success(t("professionalDashboard.wishlist.removed"));
      refetch();
    } catch {
      notify.error(t("authPages.common.genericError"));
    }
  };

  const hasActiveFilters = H.hasActiveWishlistFilters(filters);

  const isEmpty = !isFetching && totalCount === 0 && !hasActiveFilters;
  const isFilteredEmpty = !isFetching && totalCount === 0 && hasActiveFilters;

  return {
    t,
    goNext,
    filters,
    isEmpty,
    refetch,
    pageSize,
    totalCount,
    totalPages,
    isFetching,
    isRemoving,
    goPrevious,
    hasNextPage,
    canPrevious,
    updateFilter,
    handleRemove,
    resetFilters,
    handleRefresh,
    wishlistItems,
    page: safePage,
    isFilteredEmpty,
    hasActiveFilters,
  };
};
