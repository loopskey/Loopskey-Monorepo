import { BadRequestException, GoneException } from "@nestjs/common";
import { requestContext } from "@infrastructure/observability/request-context";
import { Logger } from "@nestjs/common";
import { Prisma } from "@prisma/client";

import type { CatalogFacetKind } from "@utils/catalog-facet.util";

export enum CatalogCursorError {
  INVALID = "CATALOG_CURSOR_INVALID",
  EXPIRED = "CATALOG_CURSOR_EXPIRED",
}

export const CATALOG_SEARCH_ORDER = "search";
export const CATALOG_SEARCH_CANDIDATE_CAP = 500;
export const MAX_CATALOG_CURSOR_LENGTH = 512;
export const MAX_CATALOG_SEARCH_LENGTH = 200;

const logger = new Logger("CatalogPagination");
const SLOW_PAGE_THRESHOLD_MS = Number(
  process.env.CATALOG_PAGE_SLOW_QUERY_MS ?? 500,
);
const CURSOR_VERSION = 1;
const DEFAULT_TAKE = 20;
const MAX_TAKE = 100;
const CURSOR_TOKEN_PATTERN = /^[A-Za-z0-9_-]+$/;
const CURSOR_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

export type CatalogCursorBinding = {
  kind: CatalogFacetKind;
  order: string;
};

export type CatalogWindow<TRow> = {
  rows: TRow[];
  anchorFound: boolean;
};

export type CatalogPageSource<TRow extends { id: string }> =
  CatalogCursorBinding & {
    take?: number | null;
    cursor?: string | null;
    count: () => Promise<number>;
    readAfter: (
      anchorId: string | null,
      limit: number,
    ) => Promise<CatalogWindow<TRow>>;
    readThrough: (anchorId: string, limit: number) => Promise<TRow[]>;
  };

export type CatalogPage<TRow> = {
  items: TRow[];
  totalCount: number;
  pageInfo: {
    hasNextPage: boolean;
    nextCursor: string | null;
    hasPreviousPage: boolean;
    previousCursor: string | null;
  };
};

const invalidCursor = () =>
  new BadRequestException({
    code: CatalogCursorError.INVALID,
    message: CatalogCursorError.INVALID,
  });

const expiredCursor = () =>
  new GoneException({
    code: CatalogCursorError.EXPIRED,
    message: CatalogCursorError.EXPIRED,
  });

const rejectionCode = (error: unknown) => {
  if (!(error instanceof BadRequestException || error instanceof GoneException))
    return null;
  const response = error.getResponse();
  const code = isRecord(response) ? response.code : null;
  return code === CatalogCursorError.INVALID ||
    code === CatalogCursorError.EXPIRED
    ? code
    : null;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const catalogPageSize = (take?: number | null) =>
  Math.min(take ?? DEFAULT_TAKE, MAX_TAKE);

export const catalogSortOrder = (field: string, direction: string) =>
  `${field}:${direction}`;

export const encodeCatalogCursor = (
  binding: CatalogCursorBinding,
  id: string,
) =>
  Buffer.from(
    JSON.stringify({
      v: CURSOR_VERSION,
      k: binding.kind,
      o: binding.order,
      i: id,
    }),
  ).toString("base64url");

export const decodeCatalogCursor = (
  token: string,
  binding: CatalogCursorBinding,
) => {
  if (token.length > MAX_CATALOG_CURSOR_LENGTH) throw invalidCursor();
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
    payload.k !== binding.kind ||
    payload.o !== binding.order ||
    typeof payload.i !== "string" ||
    !CURSOR_ID_PATTERN.test(payload.i)
  )
    throw invalidCursor();
  return payload.i;
};

const logPageRead = (
  source: CatalogCursorBinding & { cursor?: string | null },
  startedAt: number,
  outcome: "served" | CatalogCursorError,
) => {
  const durationMs = Date.now() - startedAt;
  const context = {
    outcome,
    durationMs,
    kind: source.kind,
    paged: Boolean(source.cursor),
    mode: source.order === CATALOG_SEARCH_ORDER ? "search" : "list",
    correlationId: requestContext.correlationId(),
  };
  if (durationMs > SLOW_PAGE_THRESHOLD_MS)
    logger.warn("Catalogue page exceeded slow-query threshold", context);
  else logger.log("Catalogue page read", context);
};

export const readCatalogPage = async <TRow extends { id: string }>(
  source: CatalogPageSource<TRow>,
): Promise<CatalogPage<TRow>> => {
  const startedAt = Date.now();
  try {
    const page = await readCatalogWindow(source);
    logPageRead(source, startedAt, "served");
    return page;
  } catch (error) {
    const code = rejectionCode(error);
    if (code) logPageRead(source, startedAt, code);
    throw error;
  }
};

const readCatalogWindow = async <TRow extends { id: string }>(
  source: CatalogPageSource<TRow>,
): Promise<CatalogPage<TRow>> => {
  const take = catalogPageSize(source.take);
  const anchorId = source.cursor
    ? decodeCatalogCursor(source.cursor, source)
    : null;
  const [window, totalCount] = await Promise.all([
    source.readAfter(anchorId, take + 1),
    source.count(),
  ]);
  if (anchorId && !window.anchorFound) throw expiredCursor();

  const hasNextPage = window.rows.length > take;
  const items = hasNextPage ? window.rows.slice(0, take) : window.rows;
  const behind = anchorId ? await source.readThrough(anchorId, take + 1) : [];
  const previousAnchor = behind.length > take ? behind[0] : undefined;

  return {
    items,
    totalCount,
    pageInfo: {
      hasNextPage,
      nextCursor: hasNextPage
        ? encodeCatalogCursor(source, items[items.length - 1].id)
        : null,
      hasPreviousPage: anchorId !== null,
      previousCursor: previousAnchor
        ? encodeCatalogCursor(source, previousAnchor.id)
        : null,
    },
  };
};

export const readPrismaWindowAfter = async <TRow>(
  anchorId: string | null,
  exists: (id: string) => Promise<boolean>,
  find: (position: {
    cursor?: { id: string };
    skip: number;
  }) => Promise<TRow[]>,
): Promise<CatalogWindow<TRow>> => {
  if (!anchorId) return { rows: await find({ skip: 0 }), anchorFound: true };
  if (!(await exists(anchorId))) return { rows: [], anchorFound: false };
  return {
    rows: await find({ cursor: { id: anchorId }, skip: 1 }),
    anchorFound: true,
  };
};

export const catalogSearchWindow = (
  order: Prisma.Sql,
  anchorId: string | null,
  limit: number,
  direction: "after" | "through",
) => {
  const bounds =
    direction === "after"
      ? Prisma.sql`ranked."rowPosition" >= anchor."rowPosition"
          AND ranked."rowPosition" <= anchor."rowPosition" + ${limit}::int`
      : Prisma.sql`ranked."rowPosition" > anchor."rowPosition" - ${limit}::int
          AND ranked."rowPosition" <= anchor."rowPosition"`;
  return Prisma.sql`
    ranked AS (
      SELECT u.*, ROW_NUMBER() OVER (ORDER BY ${order}) AS "rowPosition"
      FROM (
        SELECT * FROM exact_matches
        UNION ALL
        SELECT * FROM fuzzy_matches
      ) u
    ),
    anchor AS (
      SELECT COALESCE(
        (SELECT "rowPosition" FROM ranked WHERE "id" = ${anchorId}::text),
        CASE WHEN ${anchorId}::text IS NULL THEN 0 END
      ) AS "rowPosition"
    )
    SELECT ranked.*
    FROM ranked CROSS JOIN anchor
    WHERE ${bounds}
    ORDER BY ranked."rowPosition"
  `;
};

export const readSearchWindowAfter = <TRow extends { id: string }>(
  rows: TRow[],
  anchorId: string | null,
): CatalogWindow<TRow> => {
  if (!anchorId) return { rows, anchorFound: true };
  const anchorFound = rows[0]?.id === anchorId;
  return { rows: anchorFound ? rows.slice(1) : [], anchorFound };
};

export const withoutSearchColumns = <
  TRow extends { searchRank: number; rowPosition: bigint },
>({
  searchRank: _searchRank,
  rowPosition: _rowPosition,
  ...row
}: TRow) => row;

export const clampSearchCount = (count: bigint | number | undefined) =>
  Math.min(Number(count ?? 0), CATALOG_SEARCH_CANDIDATE_CAP);
