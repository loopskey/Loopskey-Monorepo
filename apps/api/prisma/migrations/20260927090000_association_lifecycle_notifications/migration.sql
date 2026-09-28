-- Automatic association lifecycle and assignment notifications.
--
-- AssociationMessageDelivery becomes the one ledger for manual reminders and
-- automatic lifecycle mail. Manual rows keep their weekly cooldownBucket and the
-- existing (associationId, memberId, messageType, cooldownBucket) constraint.
-- Automatic rows are unique per occurrenceKey instead; their cooldownBucket is
-- NULL (except the automatic WELCOME), and PostgreSQL treats NULLs as distinct,
-- so they never collide with the cooldown constraint.
--
-- announcedAt marks the committed positive delta for an assignment or a
-- learning-content recipient. The backfill below marks everything that is
-- already targeted at an activated member as announced, so the release sends
-- nothing retroactively. Pending members are left unannounced on purpose:
-- they are notified once, when they accept their invitation.

-- ---------------------------------------------------------------------------
-- 1. New message types. None is used in this migration.
-- ---------------------------------------------------------------------------
ALTER TYPE "AssociationMessageType" ADD VALUE IF NOT EXISTS 'INVITATION';
ALTER TYPE "AssociationMessageType" ADD VALUE IF NOT EXISTS 'GROUP_ADDED';
ALTER TYPE "AssociationMessageType" ADD VALUE IF NOT EXISTS 'REQUIREMENT_ASSIGNED';
ALTER TYPE "AssociationMessageType" ADD VALUE IF NOT EXISTS 'LEARNING_CONTENT_ASSIGNED';

-- ---------------------------------------------------------------------------
-- 2. Occurrence-keyed deliveries.
-- ---------------------------------------------------------------------------
ALTER TABLE "AssociationMessageDelivery" ADD COLUMN IF NOT EXISTS "occurrenceKey" TEXT;
ALTER TABLE "AssociationMessageDelivery" ALTER COLUMN "cooldownBucket" DROP NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "AssociationMessageDelivery_occurrenceKey_key"
    ON "AssociationMessageDelivery"("occurrenceKey");

-- ---------------------------------------------------------------------------
-- 3. Requirement assignment announcement marker.
-- ---------------------------------------------------------------------------
ALTER TABLE "AssociationRequirementAssignment" ADD COLUMN IF NOT EXISTS "announcedAt" TIMESTAMP(3);

UPDATE "AssociationRequirementAssignment" AS assignment
SET "announcedAt" = assignment."assignedAt"
FROM "AssociationRequirement" AS requirement, "AssociationMember" AS member
WHERE requirement."id" = assignment."requirementId"
  AND member."id" = assignment."memberId"
  AND assignment."isTargeted" = true
  AND assignment."announcedAt" IS NULL
  AND requirement."status" = 'PUBLISHED'
  AND member."status" <> 'PENDING_ACTIVATION';

-- ---------------------------------------------------------------------------
-- 4. Learning content recipient ledger.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AssociationLearningContentRecipient" (
    "id" TEXT NOT NULL,
    "learningContentId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "isTargeted" BOOLEAN NOT NULL DEFAULT true,
    "announcedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssociationLearningContentRecipient_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AssociationLearningContentRecipient_memberId_idx"
    ON "AssociationLearningContentRecipient"("memberId");

CREATE UNIQUE INDEX IF NOT EXISTS "AssociationLearningContentRecipient_learningContentId_membe_key"
    ON "AssociationLearningContentRecipient"("learningContentId", "memberId");

DO $$
BEGIN
    ALTER TABLE "AssociationLearningContentRecipient"
        ADD CONSTRAINT "AssociationLearningContentRecipient_learningContentId_fkey"
        FOREIGN KEY ("learningContentId") REFERENCES "AssociationLearningContent"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "AssociationLearningContentRecipient"
        ADD CONSTRAINT "AssociationLearningContentRecipient_memberId_fkey"
        FOREIGN KEY ("memberId") REFERENCES "AssociationMember"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

INSERT INTO "AssociationLearningContentRecipient"
    ("id", "learningContentId", "memberId", "isTargeted", "announcedAt", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    content."id",
    member."id",
    true,
    CASE WHEN member."status" = 'PENDING_ACTIVATION' THEN NULL ELSE CURRENT_TIMESTAMP END,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "AssociationLearningContent" AS content
JOIN "AssociationMember" AS member
  ON member."associationId" = content."associationId"
 AND member."status" <> 'INACTIVE'
WHERE content."status" = 'PUBLISHED'
  AND (
    content."audienceKind" = 'ALL_MEMBERS'
    OR (
      content."audienceKind" = 'GROUP'
      AND EXISTS (
        SELECT 1 FROM "AssociationLearningContentTarget" AS target
        WHERE target."learningContentId" = content."id"
          AND target."groupId" = member."groupId"
      )
    )
    OR (
      content."audienceKind" = 'SPECIFIC_MEMBERS'
      AND EXISTS (
        SELECT 1 FROM "AssociationLearningContentTarget" AS target
        WHERE target."learningContentId" = content."id"
          AND target."memberId" = member."id"
      )
    )
  )
ON CONFLICT ("learningContentId", "memberId") DO NOTHING;
