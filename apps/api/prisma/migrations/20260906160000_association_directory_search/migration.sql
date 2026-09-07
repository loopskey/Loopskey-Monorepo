-- The admin association directory searches names and contact emails with
-- ILIKE '%term%', which no btree index can serve. Trigram GIN indexes let the
-- planner reach an index for that predicate.
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "Association_name_trgm_idx"
  ON "Association" USING GIN ("name" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Association_contactEmail_trgm_idx"
  ON "Association" USING GIN ("contactEmail" gin_trgm_ops);
