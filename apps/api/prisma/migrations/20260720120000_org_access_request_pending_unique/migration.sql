-- Enforce "at most one PENDING access request per work email" at the database
-- level. The application check in OrgAccessRequestService.submitRequest can be
-- raced by two concurrent submissions (double-click, retry, duplicate tab);
-- this index is the authoritative guard. Violations surface as Prisma P2002 and
-- are mapped to REQUEST_ALREADY_EXISTS.
--
-- A partial index is required rather than a plain @@unique([workEmail]): an
-- applicant whose request was REJECTED must be able to submit again, and an
-- APPROVED request must not block anything either.
--
-- NOTE: Prisma cannot express partial unique indexes in schema.prisma, so this
-- index is unmanaged. `prisma migrate dev` will report drift and offer to drop
-- it. Keep it — see the comment on model OrganizationAccessRequest.

-- Collapse any pre-existing duplicate PENDING rows before adding the index,
-- keeping the earliest submission per email.
UPDATE "OrganizationAccessRequest" AS dup
SET "status" = 'REJECTED',
    "rejectReason" = 'Superseded by an earlier pending request for the same work email.',
    "updatedAt" = NOW()
WHERE dup."status" = 'PENDING'
  AND EXISTS (
    SELECT 1
    FROM "OrganizationAccessRequest" AS keep
    WHERE keep."workEmail" = dup."workEmail"
      AND keep."status" = 'PENDING'
      AND (keep."createdAt" < dup."createdAt"
           OR (keep."createdAt" = dup."createdAt" AND keep."id" < dup."id"))
  );

CREATE UNIQUE INDEX "OrganizationAccessRequest_workEmail_pending_key"
  ON "OrganizationAccessRequest" ("workEmail")
  WHERE "status" = 'PENDING';
