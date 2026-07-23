import { TProfessionalWishlistFilters } from "@/types/hooks.types";
import { MyWishlistInput } from "@/lib/graphql/generated";
import { WishlistSortBy } from "@/lib/graphql/generated";

export const WISHLIST_INITIAL_FILTERS: TProfessionalWishlistFilters = {
  search: "",
  contentType: "ALL",
  sortBy: WishlistSortBy.Newest,
};

export const hasActiveWishlistFilters = (
  filters: TProfessionalWishlistFilters,
): boolean =>
  filters.search.trim().length > 0 ||
  filters.contentType !== "ALL" ||
  filters.sortBy !== WishlistSortBy.Newest;

export const buildWishlistQueryInput = ({
  filters,
  page,
  limit,
  search,
}: {
  filters: TProfessionalWishlistFilters;
  page: number;
  limit: number;
  search: string;
}): MyWishlistInput => ({
  page,
  limit,
  search: search.length > 0 ? search : undefined,
  contentType: filters.contentType === "ALL" ? undefined : filters.contentType,
  sortBy: filters.sortBy,
});
