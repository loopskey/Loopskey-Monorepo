-- Phase 04 admin review queue needs to record who approved or rejected an
-- item and when. `rejectionReason` already exists from phase 02.
ALTER TABLE "IngestionItem" ADD COLUMN "reviewedById" TEXT;
ALTER TABLE "IngestionItem" ADD COLUMN "reviewedAt" TIMESTAMP(3);

ALTER TABLE "IngestionItem"
  ADD CONSTRAINT "IngestionItem_reviewedById_fkey"
  FOREIGN KEY ("reviewedById") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
