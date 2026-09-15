-- AlterTable
ALTER TABLE "PDUActivity" ADD COLUMN     "cpdPlanId" TEXT;

-- AlterTable
ALTER TABLE "ProfessionalSettings" DROP COLUMN "courseUpdates",
DROP COLUMN "emailNotifications",
DROP COLUMN "eventReminders",
DROP COLUMN "loginAlerts",
DROP COLUMN "messages",
DROP COLUMN "profileVisibility",
DROP COLUMN "pushNotifications",
DROP COLUMN "showCertificates",
DROP COLUMN "showEmail",
DROP COLUMN "showLearningProgress";

-- DropEnum
DROP TYPE "ProfileVisibility";

-- CreateIndex
CREATE INDEX "PDUActivity_cpdPlanId_idx" ON "PDUActivity"("cpdPlanId");

-- AddForeignKey
ALTER TABLE "PDUActivity" ADD CONSTRAINT "PDUActivity_cpdPlanId_fkey" FOREIGN KEY ("cpdPlanId") REFERENCES "CPDPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
