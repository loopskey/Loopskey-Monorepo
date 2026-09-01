-- Association role foundation: the ASSOCIATION role, the account it owns, and
-- the settings every later association phase reads.
--
-- Every statement is idempotent so the migration can be re-run after a partial
-- failure. Nothing here rewrites an existing row: the enum members are
-- additive and the two tables are new.

-- ---------------------------------------------------------------------------
-- 1. Enum members
-- ---------------------------------------------------------------------------
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'ASSOCIATION';
ALTER TYPE "OtpPurpose" ADD VALUE IF NOT EXISTS 'ASSOCIATION_ACTIVATION';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'ASSOCIATION_ACCOUNT_CREATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'ASSOCIATION_ACCOUNT_ACTIVATED';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'ASSOCIATION_ACTIVATION_RESENT';
ALTER TYPE "AuditAction" ADD VALUE IF NOT EXISTS 'ASSOCIATION_SETTINGS_UPDATED';

-- ---------------------------------------------------------------------------
-- 2. Association
-- ---------------------------------------------------------------------------
-- One association per owner is a database fact, not an application check: the
-- unique index on "ownerId" is what makes two concurrent creations for the
-- same owner resolve to exactly one row.
CREATE TABLE IF NOT EXISTS "Association" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "description" TEXT,
    "country" TEXT,
    "website" TEXT,
    "contactEmail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Association_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Association_ownerId_key" ON "Association"("ownerId");
CREATE INDEX IF NOT EXISTS "Association_ownerId_idx" ON "Association"("ownerId");
CREATE INDEX IF NOT EXISTS "Association_name_idx" ON "Association"("name");

DO $$
BEGIN
    ALTER TABLE "Association"
        ADD CONSTRAINT "Association_ownerId_fkey"
        FOREIGN KEY ("ownerId") REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 3. AssociationSettings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AssociationSettings" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "defaultCreditType" "CreditType" NOT NULL DEFAULT 'CPD',
    "onTrackThreshold" INTEGER NOT NULL DEFAULT 70,
    "atRiskThreshold" INTEGER NOT NULL DEFAULT 40,
    "renewalRequiresReviewedEvidence" BOOLEAN NOT NULL DEFAULT true,
    "complianceReminders" BOOLEAN NOT NULL DEFAULT true,
    "welcomeMessages" BOOLEAN NOT NULL DEFAULT true,
    "weeklyDigest" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssociationSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AssociationSettings_associationId_key" ON "AssociationSettings"("associationId");

DO $$
BEGIN
    ALTER TABLE "AssociationSettings"
        ADD CONSTRAINT "AssociationSettings_associationId_fkey"
        FOREIGN KEY ("associationId") REFERENCES "Association"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
