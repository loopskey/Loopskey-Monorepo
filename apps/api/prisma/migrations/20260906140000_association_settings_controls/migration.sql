-- The master email switch. Existing rows keep the behaviour they had, which is
-- "not suppressed", so no association's outreach changes when this lands.
ALTER TABLE "AssociationSettings"
    ADD COLUMN IF NOT EXISTS "suppressAllEmail" BOOLEAN NOT NULL DEFAULT false;

-- Set only for a logo this platform stores. A logoUrl an association typed in
-- is never fetched, so the two columns are deliberately not interchangeable.
ALTER TABLE "Association"
    ADD COLUMN IF NOT EXISTS "logoStorageKey" TEXT;
