import { ContentType, Prisma } from "@prisma/client";

export type TCurrentUserPayload = {
  id?: string;
  sub?: string;
  role: string;
};

export type TResolvedContentForAction = {
  id: string;
  title: string;
  price: number;
  isFree: boolean;
  currency: string;
  contentType: ContentType;
};

// =============== Wishlist Service =============
export type TWishlistSearchRow = {
  id: string;
  userId: string;
  isFree: boolean;
  createdAt: Date;
  contentId: string;
  url: string | null;
  slug: string | null;
  title: string | null;
  rating: number | null;
  imageUrl: string | null;
  category: string | null;
  contentType: ContentType;
  currency: string | null;
  description: string | null;
  providerName: string | null;
  price: Prisma.Decimal | number | string | null;
};

export type TWishlistCountRow = {
  totalCount: bigint | number;
};

export type TWishlistCategoryRow = {
  category: string | null;
};
