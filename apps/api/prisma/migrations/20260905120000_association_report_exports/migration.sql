-- Report exports: the six reports leaving the platform as a branded PDF or a
-- workbook, generated asynchronously and stored privately.
--
-- Every statement is idempotent so the migration can be re-run after a partial
-- failure. Nothing here rewrites or deletes an existing row.

-- ---------------------------------------------------------------------------
-- 1. Enums
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    CREATE TYPE "AssociationReportType" AS ENUM ('OVERVIEW_SUMMARY', 'MEMBER_PROGRESS', 'GROUP_PROGRESS', 'CATEGORY_COMPLETION', 'MISSING_EVIDENCE', 'RENEWAL_READINESS');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "AssociationReportFormat" AS ENUM ('PDF', 'EXCEL');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "AssociationGeneratedReportState" AS ENUM ('PENDING', 'READY', 'FAILED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 2. The record
--
-- It outlives its file. Retention deletes the object and marks the row
-- EXPIRED, so the association keeps the history of what it asked for even once
-- the bytes are gone. "storageKey" never leaves the API.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AssociationGeneratedReport" (
    "id"            TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "reportType"    "AssociationReportType" NOT NULL,
    "format"        "AssociationReportFormat" NOT NULL,
    "filter"        JSONB NOT NULL,
    "filterHash"    TEXT NOT NULL,
    "locale"        TEXT NOT NULL DEFAULT 'en',
    "state"         "AssociationGeneratedReportState" NOT NULL DEFAULT 'PENDING',
    "storageKey"    TEXT NOT NULL,
    "fileName"      TEXT NOT NULL,
    "mimeType"      TEXT NOT NULL,
    "sizeBytes"     INTEGER,
    "rowCount"      INTEGER,
    "failureReason" TEXT,
    "readyAt"       TIMESTAMP(3),
    "expiresAt"     TIMESTAMP(3),
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssociationGeneratedReport_pkey" PRIMARY KEY ("id")
);

-- ---------------------------------------------------------------------------
-- 3. Foreign keys
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    ALTER TABLE "AssociationGeneratedReport"
        ADD CONSTRAINT "AssociationGeneratedReport_associationId_fkey"
        FOREIGN KEY ("associationId") REFERENCES "Association"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "AssociationGeneratedReport"
        ADD CONSTRAINT "AssociationGeneratedReport_requestedById_fkey"
        FOREIGN KEY ("requestedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 4. Indexes
--
-- The library reads newest first for one association; the retention sweep reads
-- by state and expiry.
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS "AssociationGeneratedReport_associationId_createdAt_idx"
    ON "AssociationGeneratedReport"("associationId", "createdAt");
CREATE INDEX IF NOT EXISTS "AssociationGeneratedReport_associationId_state_idx"
    ON "AssociationGeneratedReport"("associationId", "state");
CREATE INDEX IF NOT EXISTS "AssociationGeneratedReport_state_expiresAt_idx"
    ON "AssociationGeneratedReport"("state", "expiresAt");

-- ---------------------------------------------------------------------------
-- 5. One pending export per report, format and filter
--
-- Unmanaged: Prisma cannot express a partial unique index, and this one must
-- constrain only the pending rows so an association may hold any number of
-- finished exports of the same report. `prisma migrate dev` reports it as drift
-- and offers to drop it — refuse that offer. The model's docstring says the
-- same.
--
-- This is what arbitrates two simultaneous requests for the same export: the
-- loser catches the violation and recovers into a read of the pending record
-- the winner created, so one generation happens and both callers are answered
-- with it.
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS "AssociationGeneratedReport_pending_key"
    ON "AssociationGeneratedReport"("associationId", "reportType", "format", "filterHash")
    WHERE "state" = 'PENDING';
