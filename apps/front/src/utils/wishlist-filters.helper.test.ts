import { describe, expect, it } from "vitest";

import { ContentType, WishlistSortBy } from "@/lib/graphql/generated";
import {
  buildWishlistQueryInput,
  hasActiveWishlistFilters,
  WISHLIST_INITIAL_FILTERS,
} from "./wishlist-filters.helper";

const REMOVED_KEYS = ["price", "category", "onlyWithRating", "onlyWithUrl"];

describe("WISHLIST_INITIAL_FILTERS", () => {
  it("only carries the supported filters", () => {
    expect(Object.keys(WISHLIST_INITIAL_FILTERS).sort()).toEqual([
      "contentType",
      "search",
      "sortBy",
    ]);
  });

  it("defaults to no active filters", () => {
    expect(hasActiveWishlistFilters(WISHLIST_INITIAL_FILTERS)).toBe(false);
  });
});

describe("buildWishlistQueryInput", () => {
  it("never includes the removed Wishlist parameters", () => {
    const input = buildWishlistQueryInput({
      filters: {
        search: "react",
        contentType: ContentType.Course,
        sortBy: WishlistSortBy.TitleAsc,
      },
      page: 2,
      limit: 12,
      search: "react",
    });

    for (const key of REMOVED_KEYS) {
      expect(input).not.toHaveProperty(key);
    }
  });

  it("passes the supported filters through", () => {
    const input = buildWishlistQueryInput({
      filters: {
        search: "react",
        contentType: ContentType.Course,
        sortBy: WishlistSortBy.TitleAsc,
      },
      page: 2,
      limit: 12,
      search: "react",
    });

    expect(input).toMatchObject({
      page: 2,
      limit: 12,
      search: "react",
      contentType: ContentType.Course,
      sortBy: WishlistSortBy.TitleAsc,
    });
  });

  it("omits an empty search and treats 'ALL' content type as no filter", () => {
    const input = buildWishlistQueryInput({
      filters: {
        search: "",
        contentType: "ALL",
        sortBy: WishlistSortBy.Newest,
      },
      page: 1,
      limit: 12,
      search: "",
    });

    expect(input.search).toBeUndefined();
    expect(input.contentType).toBeUndefined();
    expect(input.sortBy).toBe(WishlistSortBy.Newest);
  });
});

describe("hasActiveWishlistFilters", () => {
  it("detects an active search", () => {
    expect(
      hasActiveWishlistFilters({
        ...WISHLIST_INITIAL_FILTERS,
        search: "  react ",
      }),
    ).toBe(true);
  });

  it("detects a non-default content type", () => {
    expect(
      hasActiveWishlistFilters({
        ...WISHLIST_INITIAL_FILTERS,
        contentType: ContentType.Event,
      }),
    ).toBe(true);
  });

  it("detects a non-default sort", () => {
    expect(
      hasActiveWishlistFilters({
        ...WISHLIST_INITIAL_FILTERS,
        sortBy: WishlistSortBy.TitleAsc,
      }),
    ).toBe(true);
  });

  it("ignores whitespace-only search", () => {
    expect(
      hasActiveWishlistFilters({
        ...WISHLIST_INITIAL_FILTERS,
        search: "   ",
      }),
    ).toBe(false);
  });
});
