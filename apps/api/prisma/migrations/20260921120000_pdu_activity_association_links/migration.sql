-- AlterTable
ALTER TABLE "PDUActivity" ADD COLUMN "associationRequirementId" TEXT,
ADD COLUMN "associationLearningContentId" TEXT;

-- CreateIndex
CREATE INDEX "PDUActivity_associationRequirementId_idx" ON "PDUActivity"("associationRequirementId");

-- CreateIndex
CREATE INDEX "PDUActivity_associationLearningContentId_idx" ON "PDUActivity"("associationLearningContentId");
