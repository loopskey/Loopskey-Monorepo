-- Make certification fuzzy search case-insensitive AND index-backed.
-- pg_trgm's similarity()/% operators are case-sensitive, so we index the
-- lower()ed expressions that the search query matches against.
DROP INDEX IF EXISTS "Certification_name_trgm_idx";
DROP INDEX IF EXISTS "Certification_abbreviation_trgm_idx";
DROP INDEX IF EXISTS "Certification_organization_trgm_idx";
DROP INDEX IF EXISTS "Certification_organizationAbbr_trgm_idx";
DROP INDEX IF EXISTS "Certification_association_trgm_idx";

CREATE INDEX "Certification_name_trgm_idx"
  ON "Certification" USING GIN (lower("name") gin_trgm_ops);
CREATE INDEX "Certification_abbreviation_trgm_idx"
  ON "Certification" USING GIN (lower("abbreviation") gin_trgm_ops);
CREATE INDEX "Certification_organization_trgm_idx"
  ON "Certification" USING GIN (lower("organization") gin_trgm_ops);
CREATE INDEX "Certification_organizationAbbr_trgm_idx"
  ON "Certification" USING GIN (lower(COALESCE("organizationAbbr", '')) gin_trgm_ops);
CREATE INDEX "Certification_association_trgm_idx"
  ON "Certification" USING GIN (lower(COALESCE("association", '')) gin_trgm_ops);
