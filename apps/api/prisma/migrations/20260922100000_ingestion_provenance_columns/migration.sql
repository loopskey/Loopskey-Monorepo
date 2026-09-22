-- AlterTable
ALTER TABLE "Course" ADD COLUMN "sourcePlatform" TEXT,
ADD COLUMN "sourceLanguage" TEXT,
ADD COLUMN "rawCategory" TEXT,
ADD COLUMN "rawLevel" TEXT,
ADD COLUMN "rawDuration" TEXT,
ADD COLUMN "crawledAt" TIMESTAMP(3),
ADD COLUMN "internalCategory" TEXT,
ADD COLUMN "offersCertificate" BOOLEAN,
ADD COLUMN "creditValue" DOUBLE PRECISION,
ADD COLUMN "creditSource" TEXT,
ADD COLUMN "creditConfidence" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN "sourcePlatform" TEXT,
ADD COLUMN "sourceLanguage" TEXT,
ADD COLUMN "rawType" TEXT,
ADD COLUMN "rawDeliveryMode" TEXT,
ADD COLUMN "rawCategory" TEXT,
ADD COLUMN "lastUpdatedAt" TIMESTAMP(3),
ADD COLUMN "crawledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Podcast" ADD COLUMN "sourcePlatform" TEXT,
ADD COLUMN "sourceLanguage" TEXT,
ADD COLUMN "rawCategory" TEXT,
ADD COLUMN "lastUpdatedAt" TIMESTAMP(3),
ADD COLUMN "crawledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "YouTubeChannel" ADD COLUMN "sourceUrl" TEXT,
ADD COLUMN "sourcePlatform" TEXT,
ADD COLUMN "sourceLanguage" TEXT,
ADD COLUMN "rawCategory" TEXT,
ADD COLUMN "lastUpdatedAt" TIMESTAMP(3),
ADD COLUMN "crawledAt" TIMESTAMP(3);

UPDATE "YouTubeChannel" AS c
SET "sourceUrl" = i."canonicalUrl"
FROM "IngestionItem" AS i
JOIN "IngestionSource" AS s ON s."id" = i."sourceId"
WHERE s."kind" = 'YOUTUBE'
  AND i."catalogId" = c."id"
  AND c."sourceUrl" IS NULL
  AND i."canonicalUrl" ~* '^https?://';
