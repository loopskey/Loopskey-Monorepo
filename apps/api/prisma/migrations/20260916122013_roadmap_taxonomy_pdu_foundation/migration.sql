-- CreateEnum
CREATE TYPE "DeliveryFormat" AS ENUM ('ONLINE', 'IN_PERSON', 'SELF_PACED', 'LIVE_COHORT');

-- AlterTable
ALTER TABLE "RoadmapDraft" ADD COLUMN     "preferredDeliveryFormats" "DeliveryFormat"[] DEFAULT ARRAY[]::"DeliveryFormat"[];

-- AlterTable
ALTER TABLE "RoadmapStep" ADD COLUMN     "credits" DOUBLE PRECISION;
