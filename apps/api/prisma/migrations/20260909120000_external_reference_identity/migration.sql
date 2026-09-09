-- A crawled row needs an identity that survives a title change. The import
-- keyed on the slug, so a source that renamed a course created a second row.
-- `externalRef` is that identity, namespaced "<source>:<external-id>".
ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "externalRef" TEXT;
ALTER TABLE "Event" ADD COLUMN IF NOT EXISTS "externalRef" TEXT;
ALTER TABLE "Podcast" ADD COLUMN IF NOT EXISTS "externalRef" TEXT;
ALTER TABLE "YouTubeChannel" ADD COLUMN IF NOT EXISTS "externalRef" TEXT;

-- Backfill the rows the spreadsheet import created, recovering the source and
-- the external id from the slug `buildStableSlug` produced:
-- slugify(platform) || '-' || slugify(externalCourseId).
--
-- Only the four named platforms are claimed. A slug ending in ten hex
-- characters is the hashed-title fallback, where no external id existed, and a
-- generic 'other-' or 'external-' prefix cannot be told apart from an ordinary
-- title, so both are left null for manual review rather than guessed at.
--
-- Duplicates are resolved here, before the unique index exists, so the
-- constraint never discovers them. The oldest row keeps the identity.
DO $$
DECLARE
  candidate_count    INTEGER;
  backfilled_count   INTEGER;
  duplicate_count    INTEGER;
  unattributed_count INTEGER;
BEGIN
  WITH candidate AS (
    SELECT
      c."id",
      c."createdAt",
      CASE
        WHEN c."slug" LIKE 'linkedin-learning-%'
          THEN 'LINKEDIN_LEARNING:' || substring(c."slug" FROM 19)
        WHEN c."slug" LIKE 'coursera-%'
          THEN 'COURSERA:' || substring(c."slug" FROM 10)
        WHEN c."slug" LIKE 'udemy-%'
          THEN 'UDEMY:' || substring(c."slug" FROM 7)
        WHEN c."slug" LIKE 'edx-%'
          THEN 'EDX:' || substring(c."slug" FROM 5)
      END AS "ref"
    FROM "Course" c
    WHERE c."providerId" IS NULL
      AND c."userId" IS NULL
      AND c."externalRef" IS NULL
      AND c."slug" !~ '-[0-9a-f]{10}$'
      AND (
        c."slug" LIKE 'linkedin-learning-%'
        OR c."slug" LIKE 'coursera-%'
        OR c."slug" LIKE 'udemy-%'
        OR c."slug" LIKE 'edx-%'
      )
  ),
  named AS (
    SELECT * FROM candidate WHERE "ref" IS NOT NULL AND "ref" NOT LIKE '%:'
  ),
  winner AS (
    SELECT DISTINCT ON ("ref") "id", "ref"
    FROM named
    ORDER BY "ref", "createdAt" ASC, "id" ASC
  ),
  claimed AS (
    UPDATE "Course" c
    SET "externalRef" = w."ref"
    FROM winner w
    WHERE c."id" = w."id"
    RETURNING 1
  )
  SELECT
    (SELECT count(*) FROM named),
    (SELECT count(*) FROM claimed)
  INTO candidate_count, backfilled_count;

  duplicate_count := candidate_count - backfilled_count;

  SELECT count(*) INTO unattributed_count
  FROM "Course" c
  WHERE c."providerId" IS NULL
    AND c."userId" IS NULL
    AND c."externalRef" IS NULL;

  RAISE NOTICE
    'externalRef backfill: % claimed, % duplicates left null, % rows left unattributed',
    backfilled_count, duplicate_count, unattributed_count;
END $$;

-- Created last, so the backfill above has already collapsed every duplicate.
-- PostgreSQL treats NULLs as distinct, so provider-created rows stay unindexed.
CREATE UNIQUE INDEX IF NOT EXISTS "Course_externalRef_key"
  ON "Course" ("externalRef");

CREATE UNIQUE INDEX IF NOT EXISTS "Event_externalRef_key"
  ON "Event" ("externalRef");

CREATE UNIQUE INDEX IF NOT EXISTS "Podcast_externalRef_key"
  ON "Podcast" ("externalRef");

CREATE UNIQUE INDEX IF NOT EXISTS "YouTubeChannel_externalRef_key"
  ON "YouTubeChannel" ("externalRef");
