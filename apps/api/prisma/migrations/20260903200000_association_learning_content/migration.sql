-- The association's curated learning library: what a member who is behind
-- should actually go and do.
--
-- Every statement is idempotent so the migration can be re-run after a partial
-- failure. Nothing here rewrites or deletes an existing row.

-- ---------------------------------------------------------------------------
-- 1. Status enum
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    CREATE TYPE "AssociationLearningContentStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'WITHDRAWN');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 2. The item
--
-- A catalogue reference keeps only the type and the id. Titles, images and
-- availability are resolved through the learning-catalog module at read time,
-- so an endorsement can never show a title the catalogue has since changed.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AssociationLearningContent" (
    "id"                TEXT NOT NULL,
    "associationId"     TEXT NOT NULL,
    "createdById"       TEXT NOT NULL,
    "contentType"       "ContentType",
    "contentId"         TEXT,
    "externalTitle"     TEXT,
    "externalProvider"  TEXT,
    "externalUrl"       TEXT,
    "description"       TEXT,
    "category"          "PDUCategory" NOT NULL,
    "indicativeCredits" DOUBLE PRECISION,
    "requirementId"     TEXT,
    "status"            "AssociationLearningContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt"       TIMESTAMP(3),
    "withdrawnAt"       TIMESTAMP(3),
    "audienceKind"      "AssociationAudienceKind" NOT NULL DEFAULT 'ALL_MEMBERS',
    "groupId"           TEXT,
    "createdAt"         TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"         TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssociationLearningContent_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- 3. Foreign keys
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    ALTER TABLE "AssociationLearningContent"
        ADD CONSTRAINT "AssociationLearningContent_associationId_fkey"
        FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "AssociationLearningContent"
        ADD CONSTRAINT "AssociationLearningContent_createdById_fkey"
        FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "AssociationLearningContent"
        ADD CONSTRAINT "AssociationLearningContent_requirementId_fkey"
        FOREIGN KEY ("requirementId") REFERENCES "AssociationRequirement"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "AssociationLearningContent"
        ADD CONSTRAINT "AssociationLearningContent_groupId_fkey"
        FOREIGN KEY ("groupId") REFERENCES "AssociationGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 4. Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "AssociationLearningContent_associationId_idx"
    ON "AssociationLearningContent"("associationId");
CREATE INDEX IF NOT EXISTS "AssociationLearningContent_associationId_status_idx"
    ON "AssociationLearningContent"("associationId", "status");
CREATE INDEX IF NOT EXISTS "AssociationLearningContent_category_idx"
    ON "AssociationLearningContent"("category");
CREATE INDEX IF NOT EXISTS "AssociationLearningContent_requirementId_idx"
    ON "AssociationLearningContent"("requirementId");
CREATE INDEX IF NOT EXISTS "AssociationLearningContent_groupId_idx"
    ON "AssociationLearningContent"("groupId");
CREATE INDEX IF NOT EXISTS "AssociationLearningContent_contentType_contentId_idx"
    ON "AssociationLearningContent"("contentType", "contentId");

-- ---------------------------------------------------------------------------
-- 5. One endorsement per catalogue item per association
--
-- Unmanaged: Prisma cannot express a partial unique index, and this one must
-- ignore the external rows where both content columns are null so any number
-- of them may coexist. `prisma migrate dev` reports it as drift and offers to
-- drop it — refuse that offer. The model's docstring says the same.
--
-- This is what arbitrates two simultaneous endorsements of the same course:
-- the loser catches the violation and recovers into an update of the winner.
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS "AssociationLearningContent_catalog_key"
    ON "AssociationLearningContent"("associationId", "contentType", "contentId")
    WHERE "contentType" IS NOT NULL AND "contentId" IS NOT NULL;
