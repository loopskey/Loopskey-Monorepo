-- AlterTable: drop the four Settings fields confirmed to have zero readers
-- anywhere outside the settings CRUD path itself (repo-wide grep). No
-- backfill needed: nothing downstream ever read these columns.
ALTER TABLE "AssociationSettings"
  DROP COLUMN "complianceReminders",
  DROP COLUMN "defaultCreditType",
  DROP COLUMN "renewalRequiresReviewedEvidence",
  DROP COLUMN "weeklyDigest";
