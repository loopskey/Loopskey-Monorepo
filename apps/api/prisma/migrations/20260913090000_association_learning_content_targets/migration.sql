-- Association learning content: audience moves from a single denormalised
-- `groupId` column to a target table shared by all/group/specific-member
-- assignment, mirroring AssociationRequirementTarget. `category` becomes
-- optional because the wizard no longer collects it.
--
-- Every statement is idempotent so the migration can be re-run after a
-- partial failure. The backfill copies each legacy `groupId` into exactly one
-- new target row; it never invents an audience for a row that did not have
-- one.

-- ---------------------------------------------------------------------------
-- 1. AssociationLearningContentTarget
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AssociationLearningContentTarget" (
    "id" TEXT NOT NULL,
    "learningContentId" TEXT NOT NULL,
    "kind" "AssociationAudienceKind" NOT NULL,
    "groupId" TEXT,
    "memberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssociationLearningContentTarget_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AssociationLearningContentTarget_learningContentId_groupId_key" ON "AssociationLearningContentTarget"("learningContentId", "groupId");
CREATE UNIQUE INDEX IF NOT EXISTS "AssociationLearningContentTarget_learningContentId_memberId_key" ON "AssociationLearningContentTarget"("learningContentId", "memberId");
CREATE INDEX IF NOT EXISTS "AssociationLearningContentTarget_learningContentId_idx" ON "AssociationLearningContentTarget"("learningContentId");

DO $$
BEGIN
    ALTER TABLE "AssociationLearningContentTarget"
        ADD CONSTRAINT "AssociationLearningContentTarget_learningContentId_fkey"
        FOREIGN KEY ("learningContentId") REFERENCES "AssociationLearningContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "AssociationLearningContentTarget"
        ADD CONSTRAINT "AssociationLearningContentTarget_groupId_fkey"
        FOREIGN KEY ("groupId") REFERENCES "AssociationGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "AssociationLearningContentTarget"
        ADD CONSTRAINT "AssociationLearningContentTarget_memberId_fkey"
        FOREIGN KEY ("memberId") REFERENCES "AssociationMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 2. Backfill: one GROUP target per legacy row that already carried a group,
-- so reads through the new target table see exactly the audience the row had
-- before this migration ran. Rows are never touched twice: an existing
-- target for the same (learningContentId, groupId) is left as-is.
-- ---------------------------------------------------------------------------
INSERT INTO "AssociationLearningContentTarget" ("id", "learningContentId", "kind", "groupId", "createdAt")
SELECT gen_random_uuid()::text, "id", 'GROUP', "groupId", NOW()
FROM "AssociationLearningContent"
WHERE "groupId" IS NOT NULL
ON CONFLICT ("learningContentId", "groupId") DO NOTHING;

-- ---------------------------------------------------------------------------
-- 3. Drop the now-redundant column, its index, and its foreign key.
-- ---------------------------------------------------------------------------
DROP INDEX IF EXISTS "AssociationLearningContent_groupId_idx";

ALTER TABLE "AssociationLearningContent" DROP CONSTRAINT IF EXISTS "AssociationLearningContent_groupId_fkey";
ALTER TABLE "AssociationLearningContent" DROP COLUMN IF EXISTS "groupId";

-- ---------------------------------------------------------------------------
-- 4. Category becomes optional: the wizard no longer collects it, and no
-- value is backfilled for existing NULLs because there are none yet -- this
-- only relaxes the constraint for future writes.
-- ---------------------------------------------------------------------------
ALTER TABLE "AssociationLearningContent" ALTER COLUMN "category" DROP NOT NULL;
