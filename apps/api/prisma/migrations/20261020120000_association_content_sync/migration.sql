CREATE TABLE "ProfessionalAssociationContentLink" (
    "userId" TEXT NOT NULL,
    "learningContentId" TEXT NOT NULL,
    "requirementId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProfessionalAssociationContentLink_pkey" PRIMARY KEY ("userId","learningContentId")
);

CREATE INDEX "ProfessionalAssociationContentLink_learningContentId_idx" ON "ProfessionalAssociationContentLink"("learningContentId");

CREATE INDEX "ProfessionalAssociationContentLink_requirementId_idx" ON "ProfessionalAssociationContentLink"("requirementId");

INSERT INTO "ProfessionalAssociationContentLink"
  ("userId", "learningContentId", "requirementId", "createdAt", "updatedAt")
SELECT member."userId", content."id", content."requirementId", NOW(), NOW()
FROM "AssociationLearningContentRecipient" recipient
JOIN "AssociationLearningContent" content ON content."id" = recipient."learningContentId"
JOIN "AssociationMember" member ON member."id" = recipient."memberId"
WHERE recipient."isTargeted" = true
  AND content."status" = 'PUBLISHED'
  AND member."status" <> 'INACTIVE'
  AND member."associationId" = content."associationId"
ON CONFLICT ("userId", "learningContentId") DO NOTHING;

CREATE TEMPORARY TABLE "_pdu_learning_winner" ON COMMIT DROP AS
SELECT DISTINCT ON (a."userId", a."associationLearningContentId")
       a."userId",
       a."associationLearningContentId",
       a."id" AS "winnerId"
FROM "PDUActivity" a
WHERE a."associationLearningContentId" IS NOT NULL
  AND (a."contentType" IS NULL OR a."contentId" IS NULL)
ORDER BY a."userId", a."associationLearningContentId",
         a."updatedAt" DESC, a."id" DESC;

UPDATE "PDUActivityFile" f
SET "activityId" = w."winnerId"
FROM "PDUActivity" losing, "_pdu_learning_winner" w
WHERE f."activityId" = losing."id"
  AND losing."userId" = w."userId"
  AND losing."associationLearningContentId" = w."associationLearningContentId"
  AND (losing."contentType" IS NULL OR losing."contentId" IS NULL)
  AND losing."id" <> w."winnerId";

DELETE FROM "AssociationCreditAttribution" attribution
USING "PDUActivity" losing, "_pdu_learning_winner" w
WHERE attribution."activityId" = losing."id"
  AND losing."userId" = w."userId"
  AND losing."associationLearningContentId" = w."associationLearningContentId"
  AND (losing."contentType" IS NULL OR losing."contentId" IS NULL)
  AND losing."id" <> w."winnerId";

DELETE FROM "PDUActivity" losing
USING "_pdu_learning_winner" w
WHERE losing."userId" = w."userId"
  AND losing."associationLearningContentId" = w."associationLearningContentId"
  AND (losing."contentType" IS NULL OR losing."contentId" IS NULL)
  AND losing."id" <> w."winnerId";

CREATE UNIQUE INDEX IF NOT EXISTS "PDUActivity_user_learning_content_key"
  ON "PDUActivity" ("userId", "associationLearningContentId")
  WHERE "associationLearningContentId" IS NOT NULL
    AND ("contentType" IS NULL OR "contentId" IS NULL);
