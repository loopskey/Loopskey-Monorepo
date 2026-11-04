-- AlterTable
ALTER TABLE "RoadmapDraft" ADD COLUMN     "pendingChanges" JSONB NOT NULL DEFAULT '[]',
ADD COLUMN     "readyToRegenerate" BOOLEAN NOT NULL DEFAULT false;
