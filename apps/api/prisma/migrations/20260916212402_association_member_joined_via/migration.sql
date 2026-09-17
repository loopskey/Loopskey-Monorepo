-- CreateEnum
CREATE TYPE "AssociationMemberJoinedVia" AS ENUM ('INVITED', 'BULK_IMPORTED', 'LINKED_EXISTING_ACCOUNT');

-- AlterTable
ALTER TABLE "AssociationMember" ADD COLUMN     "joinedVia" "AssociationMemberJoinedVia" NOT NULL DEFAULT 'INVITED';

-- RenameIndex
ALTER INDEX "AssociationRequirementAssignment_requirementId_memberId_cycleSt" RENAME TO "AssociationRequirementAssignment_requirementId_memberId_cyc_key";
