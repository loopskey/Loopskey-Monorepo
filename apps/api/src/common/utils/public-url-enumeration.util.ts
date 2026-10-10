import { AppLanguage, ContentType, Prisma } from "@prisma/client";
import { BadRequestException } from "@nestjs/common";
import { resolveVariants } from "@utils/content-translation.util";

export enum PublicUrlSelectorError {
  INVALID_CURSOR = "PUBLIC_URL_CURSOR_INVALID",
  INVALID_SELECTOR = "PUBLIC_URL_SELECTOR_INVALID",
}

export const PUBLIC_URL_DEFAULT_SHARD_SIZE = 10_000;
export const PUBLIC_URL_MAX_SHARD_SIZE = 25_000;
export const PUBLIC_URL_MAX_SHARD_COUNT = 1_000;
export const PUBLIC_URL_DEFAULT_TAKE = 2_500;
export const PUBLIC_URL_MAX_TAKE = 2_500;
export const PUBLIC_URL_MAX_CURSOR_LENGTH = 256;

const CURSOR_VERSION = 1;
const CURSOR_TOKEN_PATTERN = /^[A-Za-z0-9_-]+$/;
const CURSOR_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
const CURSOR_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}$/;
const IDENTIFIER_PATTERN = /^[A-Za-z][A-Za-z0-9]*$/;
const PUBLISHED = "PUBLISHED";

export type PublicUrlSource = {
  readonly kind: ContentType;
  readonly table: string;
  readonly statusType: string;
  readonly translationTable: string;
  readonly translationParentColumn: string;
};

export type PublicUrlAnchor = {
  readonly createdAt: string;
  readonly id: string;
};

export type PublicUrlShard = {
  readonly index: number;
  readonly urlCount: number;
  readonly lastPublicChangeAt: Date;
  readonly startCursor: string;
  readonly endCursor: string | null;
};

export type PublicUrlRow = {
  readonly slug: string;
  readonly publicChangeAt: Date;
  readonly availableLocales: AppLanguage[];
};

export type PublicUrlPage = {
  readonly items: PublicUrlRow[];
  readonly nextCursor: string | null;
  readonly hasNextPage: boolean;
};

export type PublicUrlShardSet = {
  readonly shardSize: number;
  readonly shards: PublicUrlShard[];
  readonly truncated: boolean;
};

export interface PublicUrlApi {
  readonly kind: ContentType;
  readShards(): Promise<PublicUrlShardSet>;
  readPage(selector: PublicUrlPageSelector): Promise<PublicUrlPage>;
}

export type PublicUrlPageSelector = {
  readonly startCursor: string;
  readonly endCursor?: string | null;
  readonly after?: string | null;
  readonly take?: number | null;
};

const invalidCursor = () =>
  new BadRequestException({
    code: PublicUrlSelectorError.INVALID_CURSOR,
    message: PublicUrlSelectorError.INVALID_CURSOR,
  });

const invalidSelector = () =>
  new BadRequestException({
    code: PublicUrlSelectorError.INVALID_SELECTOR,
    message: PublicUrlSelectorError.INVALID_SELECTOR,
  });

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const toCursorTimestamp = (value: Date) =>
  value.toISOString().slice(0, -1);

export const encodePublicUrlCursor = (
  kind: ContentType,
  anchor: PublicUrlAnchor,
) =>
  Buffer.from(
    JSON.stringify({
      v: CURSOR_VERSION,
      k: kind,
      c: anchor.createdAt,
      i: anchor.id,
    }),
  ).toString("base64url");

export const decodePublicUrlCursor = (
  token: string,
  kind: ContentType,
): PublicUrlAnchor => {
  if (token.length > PUBLIC_URL_MAX_CURSOR_LENGTH) throw invalidCursor();
  if (!CURSOR_TOKEN_PATTERN.test(token)) throw invalidCursor();
  let payload: unknown;
  try {
    payload = JSON.parse(Buffer.from(token, "base64url").toString("utf8"));
  } catch {
    throw invalidCursor();
  }
  if (
    !isRecord(payload) ||
    payload.v !== CURSOR_VERSION ||
    payload.k !== kind ||
    typeof payload.c !== "string" ||
    typeof payload.i !== "string" ||
    !CURSOR_TIMESTAMP_PATTERN.test(payload.c) ||
    !CURSOR_ID_PATTERN.test(payload.i)
  )
    throw invalidCursor();
  return { createdAt: payload.c, id: payload.i };
};

const SHARD_SIZE_VARIABLE = "PUBLIC_URL_SHARD_SIZE";

export const publicUrlShardSize = () => {
  const configured = process.env[SHARD_SIZE_VARIABLE]?.trim();
  if (!configured) return PUBLIC_URL_DEFAULT_SHARD_SIZE;

  const size = Number(configured);
  if (!Number.isInteger(size) || size < 1 || size > PUBLIC_URL_MAX_SHARD_SIZE)
    throw new Error(
      `Invalid ${SHARD_SIZE_VARIABLE}: it must be a whole number between 1 ` +
        `and ${PUBLIC_URL_MAX_SHARD_SIZE}.`,
    );
  return size;
};

export const publicUrlPageTake = (requested?: number | null) => {
  const take = requested ?? PUBLIC_URL_DEFAULT_TAKE;
  if (!Number.isInteger(take) || take < 1 || take > PUBLIC_URL_MAX_TAKE)
    throw invalidSelector();
  return take;
};

const identifier = (value: string) => {
  if (!IDENTIFIER_PATTERN.test(value)) throw invalidSelector();
  return Prisma.raw(`"${value}"`);
};

const eligibleRows = (source: PublicUrlSource) =>
  Prisma.sql`FROM ${identifier(source.table)}
    WHERE "deletedAt" IS NULL
      AND "status" = ${PUBLISHED}::${identifier(source.statusType)}`;

type ShardRow = {
  index: number;
  urlCount: number;
  lastPublicChangeAt: Date;
  startId: string;
  startCreatedAt: Date;
};

export type PublicUrlShardReader = {
  $queryRaw<T>(query: Prisma.Sql): Promise<T>;
};

export const readPublicUrlShards = async (
  reader: PublicUrlShardReader,
  source: PublicUrlSource,
): Promise<PublicUrlShardSet> => {
  const shardSize = publicUrlShardSize();
  const rows = await reader.$queryRaw<ShardRow[]>(Prisma.sql`
    WITH eligible AS (
      SELECT
        "id",
        "createdAt",
        "publicContentUpdatedAt",
        (row_number() OVER (ORDER BY "createdAt", "id") - 1) / ${shardSize}::bigint AS shard
      ${eligibleRows(source)}
    )
    SELECT
      shard::int AS "index",
      count(*)::int AS "urlCount",
      max("publicContentUpdatedAt") AS "lastPublicChangeAt",
      (array_agg("id" ORDER BY "createdAt", "id"))[1] AS "startId",
      (array_agg("createdAt" ORDER BY "createdAt", "id"))[1] AS "startCreatedAt"
    FROM eligible
    GROUP BY shard
    ORDER BY shard
    LIMIT ${PUBLIC_URL_MAX_SHARD_COUNT + 1}
  `);

  const truncated = rows.length > PUBLIC_URL_MAX_SHARD_COUNT;
  const kept = truncated ? rows.slice(0, PUBLIC_URL_MAX_SHARD_COUNT) : rows;
  const cursorOf = (row: ShardRow) =>
    encodePublicUrlCursor(source.kind, {
      id: row.startId,
      createdAt: toCursorTimestamp(row.startCreatedAt),
    });

  return {
    shardSize,
    truncated,
    shards: kept.map((row, position) => ({
      index: row.index,
      urlCount: row.urlCount,
      lastPublicChangeAt: row.lastPublicChangeAt,
      startCursor: cursorOf(row),
      endCursor: kept[position + 1] ? cursorOf(kept[position + 1]) : null,
    })),
  };
};

type UrlRow = {
  slug: string;
  createdAt: Date;
  id: string;
  publicChangeAt: Date;
  sourceLanguage: string | null;
  publishedLocales: AppLanguage[];
};

export const readPublicUrlPage = async (
  reader: PublicUrlShardReader,
  source: PublicUrlSource,
  selector: PublicUrlPageSelector,
): Promise<PublicUrlPage> => {
  const take = publicUrlPageTake(selector.take);
  const start = decodePublicUrlCursor(selector.startCursor, source.kind);
  const end = selector.endCursor
    ? decodePublicUrlCursor(selector.endCursor, source.kind)
    : null;
  const after = selector.after
    ? decodePublicUrlCursor(selector.after, source.kind)
    : null;

  const lower = after
    ? Prisma.sql`("createdAt", "id") > (${after.createdAt}::timestamp(3), ${after.id})`
    : Prisma.sql`("createdAt", "id") >= (${start.createdAt}::timestamp(3), ${start.id})`;
  const upper = end
    ? Prisma.sql`AND ("createdAt", "id") < (${end.createdAt}::timestamp(3), ${end.id})`
    : Prisma.empty;

  const rows = await reader.$queryRaw<UrlRow[]>(Prisma.sql`
    SELECT
      "slug",
      "createdAt",
      "id",
      "publicContentUpdatedAt" AS "publicChangeAt",
      "sourceLanguage",
      COALESCE(
        (
          SELECT array_agg(t."locale"::text ORDER BY t."locale")
          FROM ${identifier(source.translationTable)} t
          WHERE t.${identifier(source.translationParentColumn)} = ${identifier(source.table)}."id"
            AND t."isPublished"
        ),
        ARRAY[]::text[]
      ) AS "publishedLocales"
    ${eligibleRows(source)}
      AND ${lower}
      ${upper}
    ORDER BY "createdAt", "id"
    LIMIT ${take + 1}
  `);

  const hasNextPage = rows.length > take;
  const page = hasNextPage ? rows.slice(0, take) : rows;
  const last = page[page.length - 1];

  return {
    hasNextPage,
    items: page.map((row) => {
      const variants = resolveVariants({
        sourceLanguage: row.sourceLanguage,
        published: row.publishedLocales,
      });
      return {
        slug: row.slug,
        publicChangeAt: row.publicChangeAt,
        availableLocales: [
          ...(variants.english ? [AppLanguage.EN] : []),
          ...(variants.french ? [AppLanguage.FR] : []),
        ],
      };
    }),
    nextCursor:
      hasNextPage && last
        ? encodePublicUrlCursor(source.kind, {
            id: last.id,
            createdAt: toCursorTimestamp(last.createdAt),
          })
        : null,
  };
};
