-- Compliance projection: how one learning activity contributes to one
-- requirement assignment, and the cached aggregate every association surface
-- reads.
--
-- Every statement is idempotent so the migration can be re-run after a partial
-- failure. Nothing here rewrites or deletes an existing row.

-- ---------------------------------------------------------------------------
-- 1. Enums
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    CREATE TYPE "AssociationAttributionState" AS ENUM ('COUNTED', 'AWAITING_REVIEW', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "AssociationComplianceBand" AS ENUM ('NOT_STARTED', 'AT_RISK', 'ON_TRACK', 'RENEWAL_READY');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 2. AuditAction gains the two review outcomes
-- ---------------------------------------------------------------------------
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'ASSOCIATION_ACTIVITY_APPROVED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'ASSOCIATION_ACTIVITY_REJECTED';

-- ---------------------------------------------------------------------------
-- 3. Cached projection on the assignment
--
-- Every column is derivable from the attributions below. They are cached
-- because the roster reads them for every member at once, and computedAt is
-- compared before a write so a slow recomputation cannot overwrite a newer one.
-- ---------------------------------------------------------------------------
ALTER TABLE "AssociationRequirementAssignment"
    ADD COLUMN IF NOT EXISTS "completedCredits" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "AssociationRequirementAssignment"
    ADD COLUMN IF NOT EXISTS "percent" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "AssociationRequirementAssignment"
    ADD COLUMN IF NOT EXISTS "band" "AssociationComplianceBand" NOT NULL DEFAULT 'NOT_STARTED';
ALTER TABLE "AssociationRequirementAssignment"
    ADD COLUMN IF NOT EXISTS "awaitingReviewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "AssociationRequirementAssignment"
    ADD COLUMN IF NOT EXISTS "isMissingEvidence" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "AssociationRequirementAssignment"
    ADD COLUMN IF NOT EXISTS "computedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "AssociationRequirementAssignment_band_idx" ON "AssociationRequirementAssignment"("band");

-- ---------------------------------------------------------------------------
-- 4. AssociationCreditAttribution
--
-- activityId is a plain string, deliberately not a foreign key: the activity is
-- owned by the professional module and a constraint across the two would stop
-- either from migrating alone. The unique index on (assignment, activity) is
-- what makes recomputation idempotent.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AssociationCreditAttribution" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "activityId" TEXT NOT NULL,
    "categoryId" TEXT,
    "creditedAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "activityDate" TIMESTAMP(3) NOT NULL,
    "isLate" BOOLEAN NOT NULL DEFAULT false,
    "state" "AssociationAttributionState" NOT NULL DEFAULT 'COUNTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssociationCreditAttribution_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AssociationCreditAttribution_assignmentId_activityId_key" ON "AssociationCreditAttribution"("assignmentId", "activityId");
CREATE INDEX IF NOT EXISTS "AssociationCreditAttribution_assignmentId_idx" ON "AssociationCreditAttribution"("assignmentId");
CREATE INDEX IF NOT EXISTS "AssociationCreditAttribution_activityId_idx" ON "AssociationCreditAttribution"("activityId");
CREATE INDEX IF NOT EXISTS "AssociationCreditAttribution_categoryId_idx" ON "AssociationCreditAttribution"("categoryId");
CREATE INDEX IF NOT EXISTS "AssociationCreditAttribution_state_idx" ON "AssociationCreditAttribution"("state");

DO $$
BEGIN
    ALTER TABLE "AssociationCreditAttribution"
        ADD CONSTRAINT "AssociationCreditAttribution_assignmentId_fkey"
        FOREIGN KEY ("assignmentId") REFERENCES "AssociationRequirementAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "AssociationCreditAttribution"
        ADD CONSTRAINT "AssociationCreditAttribution_categoryId_fkey"
        FOREIGN KEY ("categoryId") REFERENCES "AssociationRequirementCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 5. The rejection reason the member reads
--
-- Correspondence written by the reviewing association and read by the member on
-- their own dashboard, so it lives with the activity the member owns rather
-- than in the association's projection.
-- ---------------------------------------------------------------------------
ALTER TABLE "PDUActivity" ADD COLUMN IF NOT EXISTS "reviewNote" TEXT;
