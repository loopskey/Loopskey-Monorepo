-- On a large IngestionItem table, build these CONCURRENTLY out of band before
-- deploying this migration (CONCURRENTLY cannot run inside Prisma's migration
-- transaction, so it is deliberately absent below, matching the existing
-- 20260909120100_catalog_trigram_indexes migration):
--
--   CREATE INDEX CONCURRENTLY IF NOT EXISTS "IngestionItem_sourceId_state_createdAt_id_idx"
--   ON "IngestionItem" ("sourceId", "state", "createdAt", "id");
--   CREATE INDEX CONCURRENTLY IF NOT EXISTS "IngestionItem_state_createdAt_id_idx"
--   ON "IngestionItem" ("state", "createdAt", "id");
--   CREATE INDEX CONCURRENTLY IF NOT EXISTS "IngestionItem_catalogId_idx"
--   ON "IngestionItem" ("catalogId");
--
-- The IF NOT EXISTS below then finds them and does nothing further; on a
-- smaller table it builds them directly.
--
-- `sourceId_state` (no createdAt/id) served the review queue's page read
-- only when both sourceId and state were filtered together. The admin
-- console's default view filters by state alone (no source selected), which
-- that index cannot serve at all -- Postgres cannot use a composite index's
-- second column without an equality condition on the first -- so the
-- default view sequentially scanned IngestionItem past a few thousand rows.
-- The two replacement indexes below each lead with a column the review
-- queue actually filters by alone, and both carry the orderBy columns so the
-- page read needs no separate sort step either.
DROP INDEX IF EXISTS "IngestionItem_sourceId_state_idx";

CREATE INDEX IF NOT EXISTS "IngestionItem_sourceId_state_createdAt_id_idx"
ON "IngestionItem" ("sourceId", "state", "createdAt", "id");

CREATE INDEX IF NOT EXISTS "IngestionItem_state_createdAt_id_idx"
ON "IngestionItem" ("state", "createdAt", "id");

-- matchingCatalogIds's replacement joins IngestionItem to the matched
-- catalog ids directly instead of materializing a capped id array, so the
-- join itself needs an index on the referenced column.
CREATE INDEX IF NOT EXISTS "IngestionItem_catalogId_idx"
ON "IngestionItem" ("catalogId");
