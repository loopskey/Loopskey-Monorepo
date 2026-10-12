-- CreateEnum
CREATE TYPE "ContentUrlNamespace" AS ENUM ('COURSE', 'EVENT', 'PODCAST', 'YOUTUBE');

-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'CONTENT_SLUG_CHANGED';

-- CreateTable
CREATE TABLE "ContentUrlClaim" (
    "id" TEXT NOT NULL,
    "namespace" "ContentUrlNamespace" NOT NULL,
    "slug" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "retiredAt" TIMESTAMP(3),

    CONSTRAINT "ContentUrlClaim_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentUrlClaim_namespace_targetId_idx" ON "ContentUrlClaim"("namespace", "targetId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentUrlClaim_namespace_slug_key" ON "ContentUrlClaim"("namespace", "slug");

-- Unmanaged: one current claim per target, and a retired claim always has a retirement time.
CREATE UNIQUE INDEX "ContentUrlClaim_current_target_key"
  ON "ContentUrlClaim"("namespace", "targetId")
  WHERE "isCurrent";

ALTER TABLE "ContentUrlClaim"
  ADD CONSTRAINT "ContentUrlClaim_retirement_check"
  CHECK (("isCurrent" AND "retiredAt" IS NULL) OR (NOT "isCurrent" AND "retiredAt" IS NOT NULL));

-- Backfill: every existing slug becomes the current claim of its record, byte for byte.
-- Slugs are already unique inside each table, so no namespace can collide here.
INSERT INTO "ContentUrlClaim" ("id", "namespace", "slug", "targetId")
SELECT gen_random_uuid()::text, 'COURSE', "slug", "id" FROM "Course";

INSERT INTO "ContentUrlClaim" ("id", "namespace", "slug", "targetId")
SELECT gen_random_uuid()::text, 'EVENT', "slug", "id" FROM "Event";

INSERT INTO "ContentUrlClaim" ("id", "namespace", "slug", "targetId")
SELECT gen_random_uuid()::text, 'PODCAST', "slug", "id" FROM "Podcast";

INSERT INTO "ContentUrlClaim" ("id", "namespace", "slug", "targetId")
SELECT gen_random_uuid()::text, 'YOUTUBE', "slug", "id" FROM "YouTubeChannel";

-- Keeps the registry in step with every write to a content slug, whichever code path made it.
CREATE FUNCTION "content_url_claim_sync"() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  claim_namespace "ContentUrlNamespace" := TG_ARGV[0]::"ContentUrlNamespace";
  slug_constraint TEXT := TG_ARGV[1];
  owner_id TEXT;
BEGIN
  IF TG_OP = 'UPDATE' AND NEW."slug" = OLD."slug" THEN
    RETURN NEW;
  END IF;

  SELECT "targetId" INTO owner_id
  FROM "ContentUrlClaim"
  WHERE "namespace" = claim_namespace AND "slug" = NEW."slug"
  FOR UPDATE;

  IF owner_id IS NOT NULL AND owner_id <> NEW."id" THEN
    RAISE EXCEPTION 'duplicate key value violates unique constraint "%"', slug_constraint
      USING ERRCODE = '23505',
            CONSTRAINT = slug_constraint,
            TABLE = TG_TABLE_NAME,
            DETAIL = format('Key (slug)=(%s) already exists.', NEW."slug");
  END IF;

  IF TG_OP = 'UPDATE' THEN
    UPDATE "ContentUrlClaim"
    SET "isCurrent" = false, "retiredAt" = timezone('UTC', now())
    WHERE "namespace" = claim_namespace
      AND "targetId" = NEW."id"
      AND "isCurrent"
      AND "slug" <> NEW."slug";
  END IF;

  IF owner_id IS NULL THEN
    BEGIN
      INSERT INTO "ContentUrlClaim" ("id", "namespace", "slug", "targetId")
      VALUES (gen_random_uuid()::text, claim_namespace, NEW."slug", NEW."id");
    EXCEPTION WHEN unique_violation THEN
      RAISE EXCEPTION 'duplicate key value violates unique constraint "%"', slug_constraint
        USING ERRCODE = '23505',
              CONSTRAINT = slug_constraint,
              TABLE = TG_TABLE_NAME,
              DETAIL = format('Key (slug)=(%s) already exists.', NEW."slug");
    END;
  ELSE
    UPDATE "ContentUrlClaim"
    SET "isCurrent" = true, "retiredAt" = NULL
    WHERE "namespace" = claim_namespace AND "slug" = NEW."slug";
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER "Course_content_url_claim"
  AFTER INSERT OR UPDATE OF "slug" ON "Course"
  FOR EACH ROW EXECUTE FUNCTION "content_url_claim_sync"('COURSE', 'Course_slug_key');

CREATE TRIGGER "Event_content_url_claim"
  AFTER INSERT OR UPDATE OF "slug" ON "Event"
  FOR EACH ROW EXECUTE FUNCTION "content_url_claim_sync"('EVENT', 'Event_slug_key');

CREATE TRIGGER "Podcast_content_url_claim"
  AFTER INSERT OR UPDATE OF "slug" ON "Podcast"
  FOR EACH ROW EXECUTE FUNCTION "content_url_claim_sync"('PODCAST', 'Podcast_slug_key');

CREATE TRIGGER "YouTubeChannel_content_url_claim"
  AFTER INSERT OR UPDATE OF "slug" ON "YouTubeChannel"
  FOR EACH ROW EXECUTE FUNCTION "content_url_claim_sync"('YOUTUBE', 'YouTubeChannel_slug_key');
