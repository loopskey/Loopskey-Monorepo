-- Adds the four short-field trigram indexes the landing catalogue search's
-- bounded fuzzy fallback depends on: Event.speaker, Event.organizer,
-- Podcast.host, and YouTubeChannel.provider. Course.title/instructor/
-- description and Event.title/description/location are already indexed by
-- earlier migrations; only these four were missing.
--
-- CONCURRENTLY is deliberately absent: Prisma runs a migration inside a
-- transaction, which forbids it. On a large table, build each index out of
-- band first and let the IF NOT EXISTS here find it already there:
--
--   CREATE INDEX CONCURRENTLY IF NOT EXISTS "Event_speaker_trgm_idx"
--     ON "Event" USING GIN ("speaker" gin_trgm_ops);
--   CREATE INDEX CONCURRENTLY IF NOT EXISTS "Event_organizer_trgm_idx"
--     ON "Event" USING GIN ("organizer" gin_trgm_ops);
--   CREATE INDEX CONCURRENTLY IF NOT EXISTS "Podcast_host_trgm_idx"
--     ON "Podcast" USING GIN ("host" gin_trgm_ops);
--   CREATE INDEX CONCURRENTLY IF NOT EXISTS "YouTubeChannel_provider_trgm_idx"
--     ON "YouTubeChannel" USING GIN ("provider" gin_trgm_ops);
--
-- Event and Podcast currently hold fewer than 100 published rows each, so a
-- brief SHARE lock from the plain form below is safe today; rehearse the
-- CONCURRENTLY form regardless before either table grows past that on a
-- production-size restore, per apps/api/docs/concurrency-operations.md.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "Event_speaker_trgm_idx"
ON "Event" USING GIN ("speaker" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Event_organizer_trgm_idx"
ON "Event" USING GIN ("organizer" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "Podcast_host_trgm_idx"
ON "Podcast" USING GIN ("host" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "YouTubeChannel_provider_trgm_idx"
ON "YouTubeChannel" USING GIN ("provider" gin_trgm_ops);
