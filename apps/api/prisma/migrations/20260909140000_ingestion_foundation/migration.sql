-- The ingestion edge: one source per crawler feed, revocable machine
-- credentials, and a place to record submissions. All four tables start empty
-- and nothing is reachable until an administrator creates a source in phase 04.
CREATE TYPE "IngestionContentKind" AS ENUM ('COURSE', 'EVENT', 'PODCAST', 'YOUTUBE');
CREATE TYPE "IngestionBatchMode" AS ENUM ('FULL', 'INCREMENTAL');
CREATE TYPE "IngestionBatchStatus" AS ENUM ('RECEIVED', 'PROCESSING', 'COMPLETED', 'FAILED');
CREATE TYPE "IngestionItemState" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'STALE');

CREATE TABLE "IngestionSource" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "IngestionContentKind" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "autoPublish" BOOLEAN NOT NULL DEFAULT false,
    "stalenessWindowDays" INTEGER,
    "fieldMap" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngestionSource_pkey" PRIMARY KEY ("id")
);

-- The prefix is looked up on every authenticated request, so it is unique and
-- indexed: verification must never scan.
CREATE TABLE "IngestionApiKey" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "prefix" TEXT NOT NULL,
    "secretHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "rateLimit" INTEGER NOT NULL DEFAULT 600,
    "rateWindowSeconds" INTEGER NOT NULL DEFAULT 60,
    "rateWindowStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rateWindowCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngestionApiKey_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IngestionBatch" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "idempotencyKey" TEXT NOT NULL,
    "mode" "IngestionBatchMode" NOT NULL DEFAULT 'INCREMENTAL',
    "status" "IngestionBatchStatus" NOT NULL DEFAULT 'RECEIVED',
    "correlationId" TEXT,
    "receivedCount" INTEGER NOT NULL DEFAULT 0,
    "acceptedCount" INTEGER NOT NULL DEFAULT 0,
    "rejectedCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngestionBatch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "IngestionItem" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "batchId" TEXT,
    "externalId" TEXT NOT NULL,
    "canonicalUrl" TEXT,
    "canonicalHash" TEXT NOT NULL,
    "unmappedFields" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "state" "IngestionItemState" NOT NULL DEFAULT 'PENDING',
    "rejectionReason" TEXT,
    "catalogId" TEXT,
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IngestionItem_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "IngestionSource_slug_key" ON "IngestionSource"("slug");
CREATE INDEX "IngestionSource_kind_isActive_idx" ON "IngestionSource"("kind", "isActive");

CREATE UNIQUE INDEX "IngestionApiKey_prefix_key" ON "IngestionApiKey"("prefix");
CREATE INDEX "IngestionApiKey_sourceId_idx" ON "IngestionApiKey"("sourceId");

-- The identity boundary for a retried submission.
CREATE UNIQUE INDEX "IngestionBatch_sourceId_idempotencyKey_key" ON "IngestionBatch"("sourceId", "idempotencyKey");
CREATE INDEX "IngestionBatch_sourceId_createdAt_idx" ON "IngestionBatch"("sourceId", "createdAt");

-- The identity boundary for one crawled entity.
CREATE UNIQUE INDEX "IngestionItem_sourceId_externalId_key" ON "IngestionItem"("sourceId", "externalId");
CREATE INDEX "IngestionItem_sourceId_state_idx" ON "IngestionItem"("sourceId", "state");
CREATE INDEX "IngestionItem_batchId_idx" ON "IngestionItem"("batchId");

ALTER TABLE "IngestionApiKey" ADD CONSTRAINT "IngestionApiKey_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "IngestionSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IngestionBatch" ADD CONSTRAINT "IngestionBatch_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "IngestionSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IngestionItem" ADD CONSTRAINT "IngestionItem_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "IngestionSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "IngestionItem" ADD CONSTRAINT "IngestionItem_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "IngestionBatch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
