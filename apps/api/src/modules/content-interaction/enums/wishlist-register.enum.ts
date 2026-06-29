import { registerEnumType } from "@nestjs/graphql";

export enum WishlistPriceFilter {
  FREE = "FREE",
  PAID = "PAID",
}

export enum WishlistSortBy {
  NEWEST = "NEWEST",
  OLDEST = "OLDEST",
  TITLE_ASC = "TITLE_ASC",
  PRICE_ASC = "PRICE_ASC",
  TITLE_DESC = "TITLE_DESC",
  PRICE_DESC = "PRICE_DESC",
  RATING_DESC = "RATING_DESC",
}

registerEnumType(WishlistPriceFilter, {
  name: "WishlistPriceFilter",
});

registerEnumType(WishlistSortBy, {
  name: "WishlistSortBy",
});
