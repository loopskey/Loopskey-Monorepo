-- CreateEnum
CREATE TYPE "AssociationSubmissionWindow" AS ENUM ('WHOLE_PERIOD', 'DAYS_180', 'DAYS_90', 'DAYS_60', 'DAYS_30');

-- CreateEnum
CREATE TYPE "AssociationLateSubmissionPolicy" AS ENUM ('NOT_ACCEPTED', 'ACCEPTED_DURING_GRACE', 'ACCEPTED_FLAGGED_LATE');

-- CreateEnum
CREATE TYPE "AssociationRenewalCondition" AS ENUM ('TOTAL_CREDITS_MET');

-- AlterTable: add the new columns first, defaulted so every existing row is
-- immediately valid; lateSubmissionPolicy's blanket default matches what
-- allowLateSubmission=true meant, then the backfill below corrects the rows
-- that had allowLateSubmission=false.
ALTER TABLE "AssociationRequirement"
  ADD COLUMN "submissionWindow" "AssociationSubmissionWindow" NOT NULL DEFAULT 'WHOLE_PERIOD',
  ADD COLUMN "lateSubmissionPolicy" "AssociationLateSubmissionPolicy" NOT NULL DEFAULT 'ACCEPTED_FLAGGED_LATE',
  ADD COLUMN "renewalCondition" "AssociationRenewalCondition" NOT NULL DEFAULT 'TOTAL_CREDITS_MET';

-- Backfill: preserve today's compliance-attribution behavior exactly.
-- allowLateSubmission=false refused every submission after the effective
-- deadline; the same is true of NOT_ACCEPTED, so map it directly.
-- allowLateSubmission=true accepted only within gracePeriodDays and flagged
-- it late, which is exactly ACCEPTED_FLAGGED_LATE (already the column
-- default set above, so no row needs that case rewritten).
UPDATE "AssociationRequirement"
SET "lateSubmissionPolicy" = 'NOT_ACCEPTED'
WHERE "allowLateSubmission" = false;

-- AlterTable: drop the fields the new columns replace. submissionOpensAt and
-- submissionClosesAt were never read by the compliance-attribution window
-- calculation (deadline/reportingEnd already drove it), so nothing needs to
-- read them before they go.
ALTER TABLE "AssociationRequirement"
  DROP COLUMN "allowLateSubmission",
  DROP COLUMN "submissionClosesAt",
  DROP COLUMN "submissionOpensAt";
