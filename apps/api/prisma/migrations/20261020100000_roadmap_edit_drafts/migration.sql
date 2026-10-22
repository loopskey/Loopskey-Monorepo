-- AlterTable
ALTER TABLE "RoadmapDraft" ADD COLUMN     "replacesRoadmapId" TEXT;

-- CreateIndex
CREATE INDEX "RoadmapDraft_replacesRoadmapId_idx" ON "RoadmapDraft"("replacesRoadmapId");

-- AddForeignKey
ALTER TABLE "RoadmapDraft" ADD CONSTRAINT "RoadmapDraft_replacesRoadmapId_fkey" FOREIGN KEY ("replacesRoadmapId") REFERENCES "Roadmap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapDraft_open_edit_key" ON "RoadmapDraft"("replacesRoadmapId")
WHERE "replacesRoadmapId" IS NOT NULL
  AND "status" IN ('COLLECTING', 'READY', 'GENERATING', 'FAILED');
