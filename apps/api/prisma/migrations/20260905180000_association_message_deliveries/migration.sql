-- Templated outreach: one row per recipient per templated message an
-- association sends, and the cooldown that stops a member being nudged twice.
--
-- Every statement is idempotent so the migration can be re-run after a partial
-- failure. Nothing here rewrites or deletes an existing row.

-- ---------------------------------------------------------------------------
-- 1. Enums
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    CREATE TYPE "AssociationMessageType" AS ENUM ('BEHIND_THRESHOLD', 'WELCOME', 'CATEGORY_BEHIND', 'CERTIFICATE_EXPIRING');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "AssociationMessageDeliveryState" AS ENUM ('QUEUED', 'SENT', 'FAILED', 'SKIPPED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 2. The delivery record
--
-- The rendered body is deliberately absent: the type and template version
-- reproduce what was sent, and the text carries the member's name and progress
-- figures, which have no business sitting in a history table.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AssociationMessageDelivery" (
    "id"              TEXT NOT NULL,
    "associationId"   TEXT NOT NULL,
    "memberId"        TEXT NOT NULL,
    "recipientUserId" TEXT NOT NULL,
    "messageType"     "AssociationMessageType" NOT NULL,
    "templateVersion" INTEGER NOT NULL DEFAULT 1,
    "audience"        JSONB NOT NULL,
    "context"         JSONB NOT NULL,
    "language"        "AppLanguage" NOT NULL DEFAULT 'EN',
    "cooldownBucket"  INTEGER NOT NULL,
    "state"           "AssociationMessageDeliveryState" NOT NULL DEFAULT 'QUEUED',
    "skipReason"      TEXT,
    "failureReason"   TEXT,
    "sentAt"          TIMESTAMP(3),
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssociationMessageDelivery_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- 3. Foreign keys
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    ALTER TABLE "AssociationMessageDelivery"
        ADD CONSTRAINT "AssociationMessageDelivery_associationId_fkey"
        FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "AssociationMessageDelivery"
        ADD CONSTRAINT "AssociationMessageDelivery_memberId_fkey"
        FOREIGN KEY ("memberId") REFERENCES "AssociationMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "AssociationMessageDelivery"
        ADD CONSTRAINT "AssociationMessageDelivery_recipientUserId_fkey"
        FOREIGN KEY ("recipientUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 4. Indexes
--
-- The history reads newest first for one association; the sections read by
-- type; a member's own history reads by member.
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "AssociationMessageDelivery_associationId_createdAt_idx"
    ON "AssociationMessageDelivery"("associationId", "createdAt");
CREATE INDEX IF NOT EXISTS "AssociationMessageDelivery_associationId_messageType_idx"
    ON "AssociationMessageDelivery"("associationId", "messageType");
CREATE INDEX IF NOT EXISTS "AssociationMessageDelivery_memberId_idx"
    ON "AssociationMessageDelivery"("memberId");
CREATE INDEX IF NOT EXISTS "AssociationMessageDelivery_state_idx"
    ON "AssociationMessageDelivery"("state");

-- ---------------------------------------------------------------------------
-- 5. The cooldown
--
-- This is the invariant, not a read before the write. The bucket is the send
-- time divided by the window, so two sends of the same type to the same member
-- inside one window compute the same bucket and the second violates this
-- constraint. The caller catches the violation and records a skip carrying the
-- cooldown reason, which is why a duplicate is reported rather than silently
-- dropped.
--
-- It is scoped by association on purpose: two associations may both nudge the
-- same professional on the same day, because neither knows about the other.
--
-- Every column is non-null, so Prisma can express this one and manages it. It
-- is not drift.
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS "AssociationMessageDelivery_associationId_memberId_messageTy_key"
    ON "AssociationMessageDelivery"("associationId", "memberId", "messageType", "cooldownBucket");
