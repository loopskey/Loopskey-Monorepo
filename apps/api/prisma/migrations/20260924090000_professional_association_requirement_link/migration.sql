-- ProfessionalAssociationRequirementLink: a professional-development-owned
-- read-model mirror of "which association requirements are currently
-- assigned to this user", pushed by the association module whenever
-- assignment targeting is (re)materialised. It exists because the
-- professional module may not read association-owned tables directly (see
-- src/architecture/domain-ownership.ts) but still needs a synchronous,
-- authoritative answer when validating `associationRequirementId` on a PDU
-- activity.
CREATE TABLE IF NOT EXISTS "ProfessionalAssociationRequirementLink" (
    "userId" TEXT NOT NULL,
    "associationRequirementId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfessionalAssociationRequirementLink_pkey" PRIMARY KEY ("userId", "associationRequirementId")
);

CREATE INDEX IF NOT EXISTS "ProfessionalAssociationRequirementLink_userId_idx" ON "ProfessionalAssociationRequirementLink"("userId");

-- Backfill: mirror every assignment that is currently targeted, published,
-- and owned by an active member, so existing legitimate assignments do not
-- start failing the ownership check the moment this migration deploys.
INSERT INTO "ProfessionalAssociationRequirementLink" ("userId", "associationRequirementId", "createdAt")
SELECT DISTINCT m."userId", a."requirementId", NOW()
FROM "AssociationRequirementAssignment" a
JOIN "AssociationMember" m ON m."id" = a."memberId"
JOIN "AssociationRequirement" r ON r."id" = a."requirementId"
WHERE a."isTargeted" = true
  AND m."status" <> 'INACTIVE'
  AND r."status" = 'PUBLISHED'
ON CONFLICT ("userId", "associationRequirementId") DO NOTHING;
