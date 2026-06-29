"use client";

import { useEffect, useMemo, useState } from "react";
import { TProfessionalWishlistFilters } from "@/types/hooks.types";
import { ContentType, WishlistSortBy } from "@/lib/graphql/generated";
import { TProfessionalWishlistItem } from "@/types/hooks.types";
import { useToggleWishlistMutation } from "@/lib/rtk/endpoints/content-interaction.api";
import { DEFAULT_PAGE, PAGE_SIZE } from "@/utils/constant";
import { useMyWishlistQuery } from "@/lib/rtk/endpoints/content-interaction.api";
import { useI18n } from "@/hooks/useI18n";
import { notify } from "@/hooks/notify";

const SEARCH_DEBOUNCE_MS = 350;

const initialFilters: TProfessionalWishlistFilters = {
  search: "",
  price: "ALL",
  category: "ALL",
  contentType: "ALL",
  onlyWithUrl: false,
  onlyWithRating: false,
  sortBy: WishlistSortBy.Newest,
};

const useDebouncedValue = <TValue>(value: TValue, delay: number): TValue => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [value, delay]);
  return debouncedValue;
};

export const useProfessionalWishlistTab = () => {
  const { t } = useI18n();

  const [page, setPage] = useState(DEFAULT_PAGE);
  const [pageSize] = useState(PAGE_SIZE);
  const [filters, setFilters] =
    useState<TProfessionalWishlistFilters>(initialFilters);

  const debouncedSearch = useDebouncedValue(
    filters.search.trim(),
    SEARCH_DEBOUNCE_MS,
  );

  const queryInput = useMemo(() => {
    return {
      page,
      limit: pageSize,
      search: debouncedSearch.length > 0 ? debouncedSearch : undefined,
      contentType:
        filters.contentType === "ALL" ? undefined : filters.contentType,
      category: filters.category === "ALL" ? undefined : filters.category,
      price: filters.price === "ALL" ? undefined : filters.price,
      sortBy: filters.sortBy,
      onlyWithUrl: filters.onlyWithUrl,
      onlyWithRating: filters.onlyWithRating,
    };
  }, [
    page,
    pageSize,
    debouncedSearch,
    filters.price,
    filters.category,
    filters.sortBy,
    filters.contentType,
    filters.onlyWithUrl,
    filters.onlyWithRating,
  ]);

  const { data, isFetching, refetch } = useMyWishlistQuery(queryInput);

  const [toggleWishlist, { isLoading: isRemoving }] =
    useToggleWishlistMutation();

  const wishlistItems = useMemo<TProfessionalWishlistItem[]>(() => {
    return (data?.items ?? []) as TProfessionalWishlistItem[];
  }, [data?.items]);

  const categories = useMemo<string[]>(() => {
    return data?.categories ?? [];
  }, [data?.categories]);

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
    setFilters(initialFilters);
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

  const hasActiveFilters =
    filters.search.trim().length > 0 ||
    filters.contentType !== "ALL" ||
    filters.category !== "ALL" ||
    filters.price !== "ALL" ||
    filters.sortBy !== "NEWEST" ||
    filters.onlyWithRating ||
    filters.onlyWithUrl;

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
    categories,
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
