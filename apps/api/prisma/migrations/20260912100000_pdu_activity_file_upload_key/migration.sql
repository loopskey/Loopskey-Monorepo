-- AlterTable
ALTER TABLE "PDUActivityFile" ADD COLUMN "uploadKey" TEXT;

-- CreateIndex
-- Postgres treats each NULL as distinct under a unique index, so existing
-- rows (uploadKey = NULL) never collide with each other or with a future
-- keyed upload. No backfill is required or attempted.
CREATE UNIQUE INDEX "PDUActivityFile_activityId_uploadKey_key" ON "PDUActivityFile"("activityId", "uploadKey");
