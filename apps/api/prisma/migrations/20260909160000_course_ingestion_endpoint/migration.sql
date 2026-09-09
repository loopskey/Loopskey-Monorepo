ALTER TABLE "IngestionBatch"
  ADD COLUMN "report" JSONB NOT NULL DEFAULT '[]';

ALTER TABLE "IngestionItem"
  ADD COLUMN "imageCandidateUrl" TEXT;
