-- CreateEnum
CREATE TYPE "RoadmapMatchTier" AS ENUM ('EXACT', 'SIMILAR', 'RELATED', 'BROAD');

-- AlterTable
ALTER TABLE "Roadmap" ADD COLUMN     "matchTier" "RoadmapMatchTier";

-- AlterTable
ALTER TABLE "RoadmapStep" ADD COLUMN     "isCloseMatch" BOOLEAN NOT NULL DEFAULT false;

-- Roadmap candidate selection now has a SIMILAR relaxation tier scored with
-- word_similarity() against title + category, and an EXACT tier that also
-- checks category (previously only title/description). CONCURRENTLY is
-- deliberately absent: Prisma runs a migration inside a transaction, which
-- forbids it. On a large table, build the index out of band with
-- CREATE INDEX CONCURRENTLY and let the IF NOT EXISTS here find it.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- An enum-to-text cast is STABLE, not IMMUTABLE, so Postgres refuses it
-- directly inside an index expression. Wrapping it in a SQL function we
-- declare IMMUTABLE ourselves is the standard workaround: the mapping from
-- an enum label to its text form for a fixed set of catalog values never
-- changes without a schema migration, which would rebuild the index anyway.
CREATE OR REPLACE FUNCTION "roadmap_enum_text"(value anyenum)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$ SELECT value::text $$;

CREATE INDEX IF NOT EXISTS "Course_similarTier_trgm_idx"
ON "Course" USING GIN (lower("title" || ' ' || roadmap_enum_text("category")) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Course_category_trgm_idx"
ON "Course" USING GIN ((roadmap_enum_text("category")) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Event_similarTier_trgm_idx"
ON "Event" USING GIN (lower("title" || ' ' || roadmap_enum_text("category")) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Event_category_trgm_idx"
ON "Event" USING GIN ((roadmap_enum_text("category")) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Podcast_similarTier_trgm_idx"
ON "Podcast" USING GIN (lower("title" || ' ' || roadmap_enum_text("category")) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Podcast_category_trgm_idx"
ON "Podcast" USING GIN ((roadmap_enum_text("category")) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "YouTubeChannel_similarTier_trgm_idx"
ON "YouTubeChannel" USING GIN (lower("title" || ' ' || roadmap_enum_text("category")) gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "YouTubeChannel_category_trgm_idx"
ON "YouTubeChannel" USING GIN ((roadmap_enum_text("category")) gin_trgm_ops);
