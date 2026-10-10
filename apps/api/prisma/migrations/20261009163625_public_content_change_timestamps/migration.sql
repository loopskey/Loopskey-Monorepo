-- Public discovery needs one timestamp that means "the content a visitor can
-- see changed", which no existing column expresses:
--
--   * `updatedAt` moves on any write, including the event view counter, the
--     rating recomputation and the attendee reconciliation. Publishing it as a
--     sitemap `lastmod` would claim freshness no visitor can observe.
--   * `lastUpdatedAt` is the crawled source's own timestamp on three of the
--     four tables, is nullable there, and is absent from the publication
--     mutations entirely.
--
-- Additive and backward-compatible: NOT NULL with a default, so every existing
-- writer keeps working untouched, and nothing is dropped.
--
-- The generated form of this migration also carried 45 `DROP INDEX` statements
-- for the trigram and partial indexes that live in migration SQL rather than in
-- the Prisma schema. They are drift to Prisma and load-bearing to the search
-- paths, so they are removed here; see the "Text search" section of
-- context/coding-standards.md.
--
-- No index is added. Eligible-URL enumeration reads one kind at a time as an
-- ordered (createdAt, id) range, which the existing "<Table>_createdAt_idx"
-- already serves: measured at 100,000 courses (90,000 eligible), both the shard
-- aggregate and a 2,500-row page plan as Index Scans on it. A composite
-- (status, deletedAt, createdAt, id) index and a partial index on the
-- eligibility predicate were both built and measured, and the planner chose
-- neither, because `status` discards only a tenth of the rows and the heap is
-- visited for `slug` regardless. If the published fraction ever becomes small,
-- the partial form is the fix:
--
--   CREATE INDEX CONCURRENTLY "Course_public_url_idx" ON "Course"
--     ("createdAt", "id") WHERE "deletedAt" IS NULL AND "status" = 'PUBLISHED';
ALTER TABLE "Course" ADD COLUMN "publicContentUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Event" ADD COLUMN "publicContentUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "Podcast" ADD COLUMN "publicContentUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "YouTubeChannel" ADD COLUMN "publicContentUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Deterministic one-time backfill. The column default stamped every existing
-- row with the migration's own clock, which would announce the entire catalogue
-- as changed today. The best historical evidence is the row's own last write,
-- narrowed by the source timestamp when there is one and clamped into
-- [createdAt, updatedAt] so a crawled future date or a pre-creation date cannot
-- escape the row's own lifetime.
UPDATE "Course"
SET "publicContentUpdatedAt" =
  GREATEST("createdAt", LEAST("updatedAt", COALESCE("lastUpdatedAt", "updatedAt")));

UPDATE "Event"
SET "publicContentUpdatedAt" =
  GREATEST("createdAt", LEAST("updatedAt", COALESCE("lastUpdatedAt", "updatedAt")));

UPDATE "Podcast"
SET "publicContentUpdatedAt" =
  GREATEST("createdAt", LEAST("updatedAt", COALESCE("lastUpdatedAt", "updatedAt")));

UPDATE "YouTubeChannel"
SET "publicContentUpdatedAt" =
  GREATEST("createdAt", LEAST("updatedAt", COALESCE("lastUpdatedAt", "updatedAt")));
