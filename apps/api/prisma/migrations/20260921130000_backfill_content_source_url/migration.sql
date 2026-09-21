UPDATE "Course" AS c
SET "sourceUrl" = i."canonicalUrl"
FROM "IngestionItem" AS i
JOIN "IngestionSource" AS s ON s."id" = i."sourceId"
WHERE s."kind" = 'COURSE'
  AND i."catalogId" = c."id"
  AND c."sourceUrl" IS NULL
  AND i."canonicalUrl" ~* '^https?://';

UPDATE "Event" AS e
SET "sourceUrl" = i."canonicalUrl"
FROM "IngestionItem" AS i
JOIN "IngestionSource" AS s ON s."id" = i."sourceId"
WHERE s."kind" = 'EVENT'
  AND i."catalogId" = e."id"
  AND e."sourceUrl" IS NULL
  AND i."canonicalUrl" ~* '^https?://';

UPDATE "Podcast" AS p
SET "sourceUrl" = i."canonicalUrl"
FROM "IngestionItem" AS i
JOIN "IngestionSource" AS s ON s."id" = i."sourceId"
WHERE s."kind" = 'PODCAST'
  AND i."catalogId" = p."id"
  AND p."sourceUrl" IS NULL
  AND i."canonicalUrl" ~* '^https?://';

UPDATE "PodcastEpisode" AS e
SET "sourceUrl" = p."sourceUrl"
FROM "Podcast" AS p
WHERE e."podcastId" = p."id"
  AND e."sourceUrl" IS NULL
  AND p."sourceUrl" IS NOT NULL;
