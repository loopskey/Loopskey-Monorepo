CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS "YouTubeVideo_title_trgm_idx"
ON "YouTubeVideo" USING GIN ("title" gin_trgm_ops);

CREATE INDEX IF NOT EXISTS "YouTubeVideo_description_trgm_idx"
ON "YouTubeVideo" USING GIN ("description" gin_trgm_ops);
