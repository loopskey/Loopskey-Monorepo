import { Prisma } from "@prisma/client";
import { WishlistPriceFilter } from "@contentAction/enums/wishlist-register.enum";
import { MyWishlistInput } from "@contentAction/dtos/my-wishlist.input";
import { WishlistSortBy } from "@contentAction/enums/wishlist-register.enum";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

import * as T from "@contentAction/types/content-interaction.types";

@Injectable()
export class WishlistContentService {
  constructor(private readonly prismaService: PrismaService) {}

  async refreshWishlistSearchDocuments(): Promise<void> {
    await this.prismaService.$executeRaw`
      REFRESH MATERIALIZED VIEW CONCURRENTLY "WishlistSearchDocument"
    `;
  }

  private toNumber(
    value: Prisma.Decimal | number | string | null,
  ): number | null {
    if (value === null) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private normalizeSearch(search?: string | null): string | null {
    const value = search?.trim().toLowerCase();
    return value && value.length > 0 ? value : null;
  }

  private getPagination(input?: MyWishlistInput) {
    const page = Math.max(1, input?.page ?? 1);
    const limit = Math.min(Math.max(1, input?.limit ?? 9), 50);
    const offset = (page - 1) * limit;
    return {
      page,
      limit,
      offset,
    };
  }

  private getWishlistWhereSql(
    userId: string,
    input?: MyWishlistInput,
  ): Prisma.Sql {
    const search = this.normalizeSearch(input?.search);
    const conditions: Prisma.Sql[] = [Prisma.sql`w."userId" = ${userId}`];
    if (input?.contentType)
      conditions.push(
        Prisma.sql`w."contentType" = ${input.contentType}::"ContentType"`,
      );
    if (input?.category && input.category !== "ALL")
      conditions.push(Prisma.sql`d."category" = ${input.category}`);
    if (input?.price === WishlistPriceFilter.FREE)
      conditions.push(Prisma.sql`d."isFree" = TRUE`);
    if (input?.price === WishlistPriceFilter.PAID)
      conditions.push(Prisma.sql`d."isFree" = FALSE`);
    if (input?.onlyWithRating)
      conditions.push(Prisma.sql`d."rating" IS NOT NULL`);
    if (input?.onlyWithUrl)
      conditions.push(Prisma.sql`d."url" IS NOT NULL AND d."url" <> ''`);
    if (search)
      conditions.push(
        Prisma.sql`(
          d."searchText" ILIKE ${`%${search}%`}
          OR d."searchText" % ${search}
        )`,
      );
    return Prisma.sql`${Prisma.join(conditions, " AND ")}`;
  }

  private getWishlistOrderSql(input?: MyWishlistInput): Prisma.Sql {
    const search = this.normalizeSearch(input?.search);
    if (search)
      return Prisma.sql`
        ORDER BY
          similarity(d."searchText", ${search}) DESC,
          w."createdAt" DESC
      `;
    switch (input?.sortBy) {
      case WishlistSortBy.OLDEST:
        return Prisma.sql`ORDER BY w."createdAt" ASC`;
      case WishlistSortBy.TITLE_ASC:
        return Prisma.sql`ORDER BY d."title" ASC NULLS LAST`;
      case WishlistSortBy.TITLE_DESC:
        return Prisma.sql`ORDER BY d."title" DESC NULLS LAST`;
      case WishlistSortBy.RATING_DESC:
        return Prisma.sql`ORDER BY d."rating" DESC NULLS LAST, w."createdAt" DESC`;
      case WishlistSortBy.PRICE_ASC:
        return Prisma.sql`ORDER BY d."price" ASC NULLS LAST, w."createdAt" DESC`;
      case WishlistSortBy.PRICE_DESC:
        return Prisma.sql`ORDER BY d."price" DESC NULLS LAST, w."createdAt" DESC`;
      case WishlistSortBy.NEWEST:
      default:
        return Prisma.sql`ORDER BY w."createdAt" DESC`;
    }
  }

  private mapWishlistRow(row: T.TWishlistSearchRow) {
    return {
      id: row.id,
      userId: row.userId,
      contentId: row.contentId,
      createdAt: row.createdAt,
      contentType: row.contentType,
      content: {
        url: row.url,
        slug: row.slug,
        title: row.title,
        isFree: row.isFree,
        rating: row.rating,
        imageUrl: row.imageUrl,
        category: row.category,
        currency: row.currency,
        description: row.description,
        providerName: row.providerName,
        price: this.toNumber(row.price),
      },
    };
  }

  async myWishlist(userId: string, input?: MyWishlistInput) {
    const { page, limit, offset } = this.getPagination(input);
    const whereSql = this.getWishlistWhereSql(userId, input);
    const orderSql = this.getWishlistOrderSql(input);
    const rows = await this.prismaService.$queryRaw<T.TWishlistSearchRow[]>`
      SELECT
        w."id",
        w."userId",
        w."contentId",
        w."createdAt",
        w."contentType",
        d."url",
        d."slug",
        d."title",
        d."price",
        d."isFree",
        d."rating",
        d."imageUrl",
        d."category",
        d."currency",
        d."description",
        d."providerName"
      FROM "WishlistItem" w
      INNER JOIN "WishlistSearchDocument" d
        ON d."contentType" = w."contentType"
        AND d."contentId" = w."contentId"
      WHERE ${whereSql}
      ${orderSql}
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const countRows = await this.prismaService.$queryRaw<T.TWishlistCountRow[]>`
      SELECT COUNT(*) AS "totalCount"
      FROM "WishlistItem" w
      INNER JOIN "WishlistSearchDocument" d
        ON d."contentType" = w."contentType"
        AND d."contentId" = w."contentId"
      WHERE ${whereSql}
    `;

    const categoryRows = await this.prismaService.$queryRaw<
      T.TWishlistCategoryRow[]
    >`
      SELECT DISTINCT d."category"
      FROM "WishlistItem" w
      INNER JOIN "WishlistSearchDocument" d
        ON d."contentType" = w."contentType"
        AND d."contentId" = w."contentId"
      WHERE w."userId" = ${userId}
        AND d."category" IS NOT NULL
        ${input?.contentType ? Prisma.sql`AND w."contentType" = ${input.contentType}::"ContentType"` : Prisma.empty}
      ORDER BY d."category" ASC
    `;
    const totalCount = Number(countRows[0]?.totalCount ?? 0);
    const totalPages = Math.max(1, Math.ceil(totalCount / limit));
    const safePage = Math.min(page, totalPages);
    return {
      limit,
      totalCount,
      totalPages,
      page: safePage,
      hasPreviousPage: safePage > 1,
      hasNextPage: safePage < totalPages,
      items: rows.map((row) => this.mapWishlistRow(row)),
      categories: categoryRows
        .map((row) => row.category)
        .filter((category): category is string => Boolean(category)),
    };
  }
}
