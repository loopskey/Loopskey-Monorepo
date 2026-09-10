-- Phase 05 adds ingestion for events, podcasts and YouTube channels. Only
-- YouTubeVideo needs a schema change: its rows are keyed by the source's own
-- video id within the channel, which no column carried. `externalRef` gives it
-- the same "<source>:<external-id>" identity every ingested parent already has,
-- so a channel crawl can upsert its videos idempotently.
--
-- Event schedule items are replaced as a set and need no key. Podcast episodes
-- are already keyed by the existing "(podcastId, episodeNumber)" unique
-- constraint. No other table changes.
ALTER TABLE "YouTubeVideo" ADD COLUMN "externalRef" TEXT;

CREATE UNIQUE INDEX "YouTubeVideo_externalRef_key" ON "YouTubeVideo"("externalRef");
