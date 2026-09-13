-- Certification catalogue completion: import provenance/status columns, and
-- alias/diacritic-insensitive search. Hand-written (like the earlier
-- certification/association trigram migrations) because it mixes plain
-- Prisma-tracked columns with raw expression indexes Prisma cannot express.

ALTER TABLE "Certification" ADD COLUMN "aliases" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "Certification" ADD COLUMN "sourceVersion" TEXT;
ALTER TABLE "Certification" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "Certification_isActive_idx" ON "Certification"("isActive");

-- FR8 (this spec): a catalogue item stores renewal-cycle rules, not a global
-- absolute personal deadline. Existing hard-coded suggested deadlines are
-- migrated to null rather than carried forward into a new catalogue version.
UPDATE "Certification" SET "suggestedDeadline" = NULL;

-- Diacritic-insensitive matching alongside the existing case-insensitive
-- (lower()) trigram indexes from 20260717130200_certification_trgm_ci.
-- Postgres marks unaccent() (both the one- and two-argument forms) STABLE,
-- not IMMUTABLE, so it cannot be used directly in an index expression. The
-- documented workaround: wrap it in our own function and declare that one
-- IMMUTABLE, since the mapping never actually changes for the fixed
-- 'unaccent' dictionary this function pins. The search query must call this
-- exact function too, or the planner will not match it to the index.
CREATE EXTENSION IF NOT EXISTS unaccent;

-- LANGUAGE plpgsql (not sql): a plain SQL function body gets inlined into
-- the CREATE INDEX expression, and Postgres fails to re-resolve the
-- unaccent(regdictionary, text) overload during that inlining. plpgsql
-- functions are opaque to the planner, which sidesteps it.
--
-- SET search_path is required, not cosmetic: without it, a plain ANALYZE
-- (which autovacuum runs automatically, and which re-evaluates expression-
-- index functions to rebuild their statistics) fails with "function
-- unaccent(regdictionary, text) does not exist" even though the exact same
-- call succeeds in a normal query. Pinning the search_path makes the
-- function's name resolution identical in every calling context.
CREATE OR REPLACE FUNCTION certification_unaccent(input text) RETURNS text AS $$
BEGIN
  RETURN unaccent('public.unaccent'::regdictionary, input);
END;
$$ LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE STRICT
   SET search_path = public, pg_catalog;

-- array_to_string() is also only STABLE, so the aliases index needs its own
-- wrapper folding array_to_string + lower + unaccent into one call.
CREATE OR REPLACE FUNCTION certification_unaccent_array(input text[]) RETURNS text AS $$
BEGIN
  RETURN unaccent('public.unaccent'::regdictionary, lower(array_to_string(input, ' ')));
END;
$$ LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE STRICT
   SET search_path = public, pg_catalog;

DROP INDEX IF EXISTS "Certification_name_trgm_idx";
DROP INDEX IF EXISTS "Certification_abbreviation_trgm_idx";
DROP INDEX IF EXISTS "Certification_organization_trgm_idx";
DROP INDEX IF EXISTS "Certification_organizationAbbr_trgm_idx";
DROP INDEX IF EXISTS "Certification_association_trgm_idx";

CREATE INDEX "Certification_name_trgm_idx"
  ON "Certification" USING GIN (certification_unaccent(lower("name")) gin_trgm_ops);
CREATE INDEX "Certification_abbreviation_trgm_idx"
  ON "Certification" USING GIN (certification_unaccent(lower("abbreviation")) gin_trgm_ops);
CREATE INDEX "Certification_organization_trgm_idx"
  ON "Certification" USING GIN (certification_unaccent(lower("organization")) gin_trgm_ops);
CREATE INDEX "Certification_organizationAbbr_trgm_idx"
  ON "Certification" USING GIN (certification_unaccent(lower(COALESCE("organizationAbbr", ''))) gin_trgm_ops);
CREATE INDEX "Certification_association_trgm_idx"
  ON "Certification" USING GIN (certification_unaccent(lower(COALESCE("association", ''))) gin_trgm_ops);

-- Aliases are searched as one concatenated, normalized blob per row: cheap,
-- index-backed similarity scoring for typeahead ranking. The search query
-- also checks each alias individually with ILIKE as an exact-substring
-- fallback, so this collapsing only affects fuzzy-similarity ranking, not
-- whether a real alias match is found.
CREATE INDEX "Certification_aliases_trgm_idx"
  ON "Certification" USING GIN (certification_unaccent_array("aliases") gin_trgm_ops);
