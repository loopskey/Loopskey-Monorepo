import { ContentType, Prisma } from "@prisma/client";

import { CATALOG_SEARCH_CANDIDATE_CAP } from "@utils/catalog-pagination.util";

type CatalogSearchDefinition = {
  kind: ContentType;
  table: string;
  searchable: string[];
  fuzzy: string[];
  eligible: Prisma.Sql;
  projection: Prisma.Sql;
  join: Prisma.Sql;
};

const DEFINITIONS: CatalogSearchDefinition[] = [
  {
    kind: ContentType.COURSE,
    table: "Course",
    searchable: ["title", "instructor", "description"],
    fuzzy: ["title", "instructor"],
    eligible: Prisma.sql`c."deletedAt" IS NULL AND c."status" = 'PUBLISHED'::"CourseStatus"`,
    projection: Prisma.sql`c."slug", c."level"::text AS "level", c."imageUrl",
      c."durationMinutes", c."creditValue"::float AS "indicativeCredits", p."fullName" AS "provider"`,
    join: Prisma.sql`LEFT JOIN "User" p ON p."id" = c."providerId"`,
  },
  {
    kind: ContentType.EVENT,
    table: "Event",
    searchable: ["title", "speaker", "organizer", "location", "description"],
    fuzzy: ["title", "speaker", "organizer", "location"],
    eligible: Prisma.sql`c."deletedAt" IS NULL AND c."status" = 'PUBLISHED'::"EventStatus"`,
    projection: Prisma.sql`c."slug", NULL::text AS "level", c."imageUrl",
      NULL::int AS "durationMinutes", NULLIF(c."pdu", 0)::float AS "indicativeCredits",
      COALESCE(c."organizer", c."speaker") AS "provider"`,
    join: Prisma.empty,
  },
  {
    kind: ContentType.PODCAST,
    table: "Podcast",
    searchable: ["title", "host", "description"],
    fuzzy: ["title", "host"],
    eligible: Prisma.sql`c."deletedAt" IS NULL AND c."status" = 'PUBLISHED'::"PodcastStatus"`,
    projection: Prisma.sql`c."slug", NULL::text AS "level", c."imageUrl",
      c."durationMinutes", NULL::float AS "indicativeCredits", p."fullName" AS "provider"`,
    join: Prisma.sql`LEFT JOIN "User" p ON p."id" = c."providerId"`,
  },
  {
    kind: ContentType.YOUTUBE,
    table: "YouTubeVideo",
    searchable: ["title", "description"],
    fuzzy: ["title"],
    eligible: Prisma.sql`c."status" = 'PUBLISHED'::"YouTubeVideoStatus"
      AND c."channelId" IN (SELECT "id" FROM "YouTubeChannel"
        WHERE "deletedAt" IS NULL AND "status" = 'PUBLISHED'::"YouTubeChannelStatus")`,
    projection: Prisma.sql`p."slug", NULL::text AS "level", c."thumbnailUrl" AS "imageUrl",
      c."durationMinutes", NULL::float AS "indicativeCredits", p."title" AS "provider"`,
    join: Prisma.sql`JOIN "YouTubeChannel" p ON p."id" = c."channelId"`,
  },
];

const column = (name: string) => Prisma.raw(`c."${name}"`);

const matching = (names: string[], search: string) =>
  Prisma.join(
    names.map(
      (name) => Prisma.sql`${column(name)} ILIKE '%' || ${search} || '%'`,
    ),
    " OR ",
  );

const fuzzyMatching = (names: string[], search: string) =>
  Prisma.join(
    names.map((name) => Prisma.sql`${column(name)} % ${search}`),
    " OR ",
  );

const rankedMatches = (definition: CatalogSearchDefinition, search: string) => {
  const table = Prisma.raw(`"${definition.table}"`);
  if (!search)
    return Prisma.sql`SELECT c.*, 0::float AS "searchRank" FROM ${table} c
      WHERE ${definition.eligible}`;

  const exact = matching(definition.searchable, search);
  const fuzzy = fuzzyMatching(definition.fuzzy, search);
  const similarities = Prisma.join(
    definition.fuzzy.map(
      (name) => Prisma.sql`COALESCE(similarity(${column(name)}, ${search}), 0)`,
    ),
  );
  const secondary = definition.fuzzy.slice(1);
  const secondaryBand = secondary.length
    ? Prisma.sql`WHEN (${matching(secondary, search)}) THEN 2`
    : Prisma.empty;

  return Prisma.sql`WITH exact AS (
    SELECT c.*, (CASE WHEN c."title" ILIKE '%' || ${search} || '%' THEN 3
      ${secondaryBand} ELSE 1 END)::float AS "searchRank"
    FROM ${table} c WHERE ${definition.eligible} AND (${exact})
    ORDER BY "searchRank" DESC, c."createdAt" DESC, c."id" DESC
    LIMIT ${CATALOG_SEARCH_CANDIDATE_CAP}
  ), fuzzy AS (
    SELECT c.*, LEAST(GREATEST(${similarities}), 0.99)::float AS "searchRank"
    FROM ${table} c WHERE ${definition.eligible} AND (${fuzzy})
      AND c."id" NOT IN (SELECT "id" FROM exact)
    ORDER BY "searchRank" DESC, c."createdAt" DESC, c."id" DESC
    LIMIT GREATEST(${CATALOG_SEARCH_CANDIDATE_CAP} - (SELECT COUNT(*)::int FROM exact), 0)
  ) SELECT * FROM exact UNION ALL SELECT * FROM fuzzy`;
};

export const endorsementCatalogCandidates = (
  search: string,
  contentType?: string | null,
) => {
  const definitions = DEFINITIONS.filter(
    (definition) => !contentType || definition.kind === contentType,
  );
  return Prisma.join(
    definitions.map(
      (definition) => Prisma.sql`(
    SELECT ${definition.kind} || '_' || c."id" AS "id",
      ${definition.kind}::text AS "contentType", c."id" AS "contentId", c."title",
      ${definition.projection}, c."searchRank", c."createdAt" AS "recency"
    FROM (${rankedMatches(definition, search)}) c ${definition.join}
  )`,
    ),
    " UNION ALL ",
  );
};

export const ENDORSEMENT_SEARCH_ORDER = Prisma.sql`"searchRank" DESC, "recency" DESC, "contentType" ASC, "contentId" DESC`;

export type EndorsementBrowseAnchor = {
  recency: Date;
  contentType: string;
  contentId: string;
};

export const endorsementBrowseAnchor = (id: string) => {
  const separator = id.indexOf("_");
  const definition = DEFINITIONS.find(
    (candidate) => candidate.kind === id.slice(0, separator),
  );
  if (!definition) return null;
  const contentId = id.slice(separator + 1);
  return Prisma.sql`SELECT c."createdAt" AS "recency", ${definition.kind}::text AS "contentType", c."id" AS "contentId"
    FROM ${Prisma.raw(`"${definition.table}"`)} c WHERE c."id" = ${contentId} AND ${definition.eligible}`;
};

export const endorsementBrowseCandidates = (
  contentType: string | null | undefined,
  anchor: EndorsementBrowseAnchor | null,
  limit: number,
  direction: "after" | "through",
) => {
  const forward = direction === "after";
  const compare = forward ? Prisma.sql`<` : Prisma.sql`>`;
  const chronological = forward ? Prisma.sql`DESC` : Prisma.sql`ASC`;
  const definitions = DEFINITIONS.filter(
    (definition) => !contentType || definition.kind === contentType,
  );
  return Prisma.join(
    definitions.map((definition) => {
      const position = anchor
        ? Prisma.sql`AND (
      c."createdAt" ${compare} ${anchor.recency} OR (
        c."createdAt" = ${anchor.recency} AND (
          ${definition.kind}::text ${forward ? Prisma.sql`>` : Prisma.sql`<`} ${anchor.contentType}::text OR (
            ${definition.kind}::text = ${anchor.contentType}::text AND c."id" ${forward ? Prisma.sql`<=` : Prisma.sql`>=`} ${anchor.contentId}
          )
        )
      )
    )`
        : Prisma.empty;
      return Prisma.sql`(
      SELECT ${definition.kind} || '_' || c."id" AS "id", ${definition.kind}::text AS "contentType",
        c."id" AS "contentId", c."title", ${definition.projection}, 0::float AS "searchRank", c."createdAt" AS "recency"
      FROM (SELECT c.* FROM ${Prisma.raw(`"${definition.table}"`)} c
        WHERE ${definition.eligible} ${position}
        ORDER BY c."createdAt" ${chronological}, c."id" ${chronological} LIMIT ${limit}) c
      ${definition.join}
    )`;
    }),
    " UNION ALL ",
  );
};
