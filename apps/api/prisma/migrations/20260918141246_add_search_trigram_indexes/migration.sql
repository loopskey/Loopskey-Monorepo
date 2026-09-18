-- Adds trigram indexes for the professional dashboard's `contains`/insensitive
-- search filters that were still running sequential scans:
--   - calendarRegistrations searches Event.title (indexed) and Event.location
--     (not indexed);
--   - certificates searches Certificate.title/issuer/certificateNumber (none
--     indexed);
--   - pduActivities searches 8 PDUActivity columns (none indexed).
--
-- CONCURRENTLY is deliberately absent: Prisma runs a migration inside a
-- transaction, which forbids it. On a large table, build the index out of
-- band with CREATE INDEX CONCURRENTLY and let the IF NOT EXISTS here find it.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "Event_location_trgm_idx"
ON "Event" USING GIN ("location" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Certificate_title_trgm_idx"
ON "Certificate" USING GIN ("title" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Certificate_issuer_trgm_idx"
ON "Certificate" USING GIN ("issuer" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Certificate_certificateNumber_trgm_idx"
ON "Certificate" USING GIN ("certificateNumber" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "PDUActivity_title_trgm_idx"
ON "PDUActivity" USING GIN ("title" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "PDUActivity_description_trgm_idx"
ON "PDUActivity" USING GIN ("description" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "PDUActivity_providerOrganizer_trgm_idx"
ON "PDUActivity" USING GIN ("providerOrganizer" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "PDUActivity_issuingOrganization_trgm_idx"
ON "PDUActivity" USING GIN ("issuingOrganization" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "PDUActivity_evidenceNote_trgm_idx"
ON "PDUActivity" USING GIN ("evidenceNote" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "PDUActivity_relatedCertification_trgm_idx"
ON "PDUActivity" USING GIN ("relatedCertification" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "PDUActivity_subCategory_trgm_idx"
ON "PDUActivity" USING GIN ("subCategory" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "PDUActivity_learningOutcome_trgm_idx"
ON "PDUActivity" USING GIN ("learningOutcome" gin_trgm_ops);
