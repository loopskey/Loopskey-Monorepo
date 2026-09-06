-- Association requirements: what an association obliges its members to
-- complete, who it applies to, and the per-member assignment rows every later
-- progress and report reads.
--
-- Every statement is idempotent so the migration can be re-run after a partial
-- failure. Nothing here rewrites or deletes an existing row.

-- ---------------------------------------------------------------------------
-- 1. Enums
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    CREATE TYPE "AssociationRequirementStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "AssociationReportingCycle" AS ENUM ('ONE_TIME', 'ANNUAL', 'MULTI_YEAR');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "AssociationAudienceKind" AS ENUM ('ALL_MEMBERS', 'GROUP', 'SPECIFIC_MEMBERS');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "AssociationEvidencePolicy" AS ENUM ('NOT_REQUIRED', 'REQUIRED_NO_REVIEW', 'REQUIRED_NEEDS_REVIEW');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 2. AssociationRequirement
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AssociationRequirement" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "creditType" "CreditType" NOT NULL DEFAULT 'CPD',
    "totalRequiredCredits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3),
    "reportingCycle" "AssociationReportingCycle" NOT NULL DEFAULT 'ONE_TIME',
    "cycleLengthYears" INTEGER,
    "evidencePolicy" "AssociationEvidencePolicy" NOT NULL DEFAULT 'NOT_REQUIRED',
    "reportingStart" TIMESTAMP(3),
    "reportingEnd" TIMESTAMP(3),
    "submissionOpensAt" TIMESTAMP(3),
    "submissionClosesAt" TIMESTAMP(3),
    "gracePeriodDays" INTEGER NOT NULL DEFAULT 0,
    "allowLateSubmission" BOOLEAN NOT NULL DEFAULT true,
    "remindersEnabled" BOOLEAN NOT NULL DEFAULT false,
    "reminderTiming" "CPDReminderTiming",
    "audienceKind" "AssociationAudienceKind" NOT NULL DEFAULT 'ALL_MEMBERS',
    "status" "AssociationRequirementStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssociationRequirement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "AssociationRequirement_associationId_idx" ON "AssociationRequirement"("associationId");
CREATE INDEX IF NOT EXISTS "AssociationRequirement_associationId_status_idx" ON "AssociationRequirement"("associationId", "status");
CREATE INDEX IF NOT EXISTS "AssociationRequirement_deadline_idx" ON "AssociationRequirement"("deadline");
CREATE INDEX IF NOT EXISTS "AssociationRequirement_createdAt_idx" ON "AssociationRequirement"("createdAt");

DO $$
BEGIN
    ALTER TABLE "AssociationRequirement"
        ADD CONSTRAINT "AssociationRequirement_associationId_fkey"
        FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "AssociationRequirement"
        ADD CONSTRAINT "AssociationRequirement_createdById_fkey"
        FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 3. AssociationRequirementCategory
--
-- Two unique indexes, both load-bearing: a display name cannot repeat within a
-- requirement, and neither can a mapped PDUCategory, so no activity can be
-- claimed by two categories at once.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AssociationRequirementCategory" (
    "id" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mappedCategory" "PDUCategory" NOT NULL,
    "requiredCredits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AssociationRequirementCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AssociationRequirementCategory_requirementId_name_key" ON "AssociationRequirementCategory"("requirementId", "name");
CREATE UNIQUE INDEX IF NOT EXISTS "AssociationRequirementCategory_requirementId_mappedCategory_key" ON "AssociationRequirementCategory"("requirementId", "mappedCategory");
CREATE INDEX IF NOT EXISTS "AssociationRequirementCategory_requirementId_idx" ON "AssociationRequirementCategory"("requirementId");

DO $$
BEGIN
    ALTER TABLE "AssociationRequirementCategory"
        ADD CONSTRAINT "AssociationRequirementCategory_requirementId_fkey"
        FOREIGN KEY ("requirementId") REFERENCES "AssociationRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 4. AssociationRequirementTarget
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AssociationRequirementTarget" (
    "id" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "kind" "AssociationAudienceKind" NOT NULL,
    "groupId" TEXT,
    "memberId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AssociationRequirementTarget_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AssociationRequirementTarget_requirementId_groupId_key" ON "AssociationRequirementTarget"("requirementId", "groupId");
CREATE UNIQUE INDEX IF NOT EXISTS "AssociationRequirementTarget_requirementId_memberId_key" ON "AssociationRequirementTarget"("requirementId", "memberId");
CREATE INDEX IF NOT EXISTS "AssociationRequirementTarget_requirementId_idx" ON "AssociationRequirementTarget"("requirementId");

DO $$
BEGIN
    ALTER TABLE "AssociationRequirementTarget"
        ADD CONSTRAINT "AssociationRequirementTarget_requirementId_fkey"
        FOREIGN KEY ("requirementId") REFERENCES "AssociationRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "AssociationRequirementTarget"
        ADD CONSTRAINT "AssociationRequirementTarget_groupId_fkey"
        FOREIGN KEY ("groupId") REFERENCES "AssociationGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "AssociationRequirementTarget"
        ADD CONSTRAINT "AssociationRequirementTarget_memberId_fkey"
        FOREIGN KEY ("memberId") REFERENCES "AssociationMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 5. AssociationRequirementAssignment
--
-- The unique index on (requirement, member, cycleStart) is what makes
-- materialisation idempotent: re-running it upserts onto the same row rather
-- than adding a second obligation for the same cycle.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AssociationRequirementAssignment" (
    "id" TEXT NOT NULL,
    "requirementId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "cycleStart" TIMESTAMP(3) NOT NULL,
    "cycleEnd" TIMESTAMP(3),
    "dueDate" TIMESTAMP(3),
    "isTargeted" BOOLEAN NOT NULL DEFAULT true,
    "recordedCredits" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssociationRequirementAssignment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AssociationRequirementAssignment_requirementId_memberId_cycleStart_key" ON "AssociationRequirementAssignment"("requirementId", "memberId", "cycleStart");
CREATE INDEX IF NOT EXISTS "AssociationRequirementAssignment_memberId_idx" ON "AssociationRequirementAssignment"("memberId");
CREATE INDEX IF NOT EXISTS "AssociationRequirementAssignment_dueDate_idx" ON "AssociationRequirementAssignment"("dueDate");
CREATE INDEX IF NOT EXISTS "AssociationRequirementAssignment_requirementId_idx" ON "AssociationRequirementAssignment"("requirementId");

DO $$
BEGIN
    ALTER TABLE "AssociationRequirementAssignment"
        ADD CONSTRAINT "AssociationRequirementAssignment_requirementId_fkey"
        FOREIGN KEY ("requirementId") REFERENCES "AssociationRequirement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "AssociationRequirementAssignment"
        ADD CONSTRAINT "AssociationRequirementAssignment_memberId_fkey"
        FOREIGN KEY ("memberId") REFERENCES "AssociationMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
