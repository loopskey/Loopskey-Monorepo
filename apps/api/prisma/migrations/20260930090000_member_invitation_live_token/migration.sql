-- At most one live (unconsumed) invitation token per association membership.
-- Issuance is serialised by a row lock on the membership, and this index is
-- the authoritative backstop: a second concurrent issuance fails with P2002
-- and is answered as a recent-invitation cooldown.
--
-- NOTE: Prisma cannot express partial unique indexes in schema.prisma, so this
-- index is unmanaged. `prisma migrate dev` will report drift and offer to drop
-- it. Keep it — see the comment on model OtpCode.
--
-- Winner policy for pre-existing duplicates: the newest live token per
-- membership (by createdAt, then id) stays usable; older live siblings were
-- already superseded by a later email and are marked consumed. Tokens with no
-- membership (legacy rows) are untouched.
UPDATE "OtpCode" AS dup
SET "consumedAt" = NOW()
WHERE dup."purpose" = 'ASSOCIATION_MEMBER_INVITE'
  AND dup."consumedAt" IS NULL
  AND dup."associationMemberId" IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM "OtpCode" AS keep
    WHERE keep."associationMemberId" = dup."associationMemberId"
      AND keep."purpose" = 'ASSOCIATION_MEMBER_INVITE'
      AND keep."consumedAt" IS NULL
      AND (keep."createdAt" > dup."createdAt"
           OR (keep."createdAt" = dup."createdAt" AND keep."id" > dup."id"))
  );

CREATE UNIQUE INDEX IF NOT EXISTS "OtpCode_live_member_invite_key"
  ON "OtpCode" ("associationMemberId")
  WHERE "purpose" = 'ASSOCIATION_MEMBER_INVITE'
    AND "consumedAt" IS NULL
    AND "associationMemberId" IS NOT NULL;
