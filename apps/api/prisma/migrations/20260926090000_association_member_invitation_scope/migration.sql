-- Scopes an ASSOCIATION_MEMBER_INVITE OtpCode to the one AssociationMember
-- it invites, instead of only (userId, purpose). Without this, a second
-- association inviting the same still-unclaimed email silently invalidates
-- or cooldown-blocks the first association's still-unused invitation, since
-- the issuing/resend logic queried and invalidated by (userId, purpose)
-- alone.
--
-- Additive only: nullable column, nullable FK, new index. Existing rows keep
-- `associationMemberId = NULL`, which is intentionally never blanket
-- backfilled -- there is no reliable way to attribute a pre-existing
-- invitation to the membership it was issued for, and leaving it unscoped is
-- strictly safer than guessing wrong. See AuthAccountActivationService.

-- ---------------------------------------------------------------------------
-- 1. AuditAction gains one value for the new accept-invitation flow.
-- ---------------------------------------------------------------------------
-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'ASSOCIATION_MEMBER_INVITATION_ACCEPTED';

-- ---------------------------------------------------------------------------
-- 2. OtpCode.associationMemberId
-- ---------------------------------------------------------------------------
ALTER TABLE "OtpCode" ADD COLUMN IF NOT EXISTS "associationMemberId" TEXT;

CREATE INDEX IF NOT EXISTS "OtpCode_associationMemberId_idx" ON "OtpCode"("associationMemberId");

DO $$
BEGIN
    ALTER TABLE "OtpCode"
        ADD CONSTRAINT "OtpCode_associationMemberId_fkey"
        FOREIGN KEY ("associationMemberId") REFERENCES "AssociationMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
