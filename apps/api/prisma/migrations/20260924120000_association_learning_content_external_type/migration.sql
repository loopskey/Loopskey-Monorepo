-- CreateEnum
CREATE TYPE "AssociationLearningExternalType" AS ENUM ('COURSE', 'EVENT', 'PODCAST', 'VIDEO', 'ARTICLE', 'WEBINAR', 'OTHER');

-- AlterTable
ALTER TABLE "AssociationLearningContent" ADD COLUMN     "externalContentType" "AssociationLearningExternalType";
