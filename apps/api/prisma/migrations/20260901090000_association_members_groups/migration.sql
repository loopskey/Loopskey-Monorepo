-- Association members and groups: the roster an association certifies, and the
-- segmentation behind it.
--
-- Every statement is idempotent so the migration can be re-run after a partial
-- failure. Nothing here rewrites an existing row.

-- ---------------------------------------------------------------------------
-- 1. Enum members
-- ---------------------------------------------------------------------------
ALTER TYPE "OtpPurpose" ADD VALUE IF NOT EXISTS 'ASSOCIATION_MEMBER_INVITE';

DO $$
BEGIN
    CREATE TYPE "AssociationMemberStatus" AS ENUM ('PENDING_ACTIVATION', 'ACTIVE', 'INACTIVE');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 2. AssociationGroup
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "AssociationGroup" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssociationGroup_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AssociationGroup_associationId_title_key" ON "AssociationGroup"("associationId", "title");
CREATE INDEX IF NOT EXISTS "AssociationGroup_associationId_idx" ON "AssociationGroup"("associationId");

DO $$
BEGIN
    ALTER TABLE "AssociationGroup"
        ADD CONSTRAINT "AssociationGroup_associationId_fkey"
        FOREIGN KEY ("associationId") REFERENCES "Association"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ---------------------------------------------------------------------------
-- 3. AssociationMember
-- ---------------------------------------------------------------------------
-- One membership per user per association is a database fact: it is what makes
-- two simultaneous invitations for the same email converge on one row instead
-- of both passing a read that neither had committed yet.
CREATE TABLE IF NOT EXISTS "AssociationMember" (
    "id" TEXT NOT NULL,
    "associationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "groupId" TEXT,
    "memberNumber" TEXT,
    "status" "AssociationMemberStatus" NOT NULL DEFAULT 'PENDING_ACTIVATION',
    "notes" TEXT,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activatedAt" TIMESTAMP(3),
    "deactivatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssociationMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AssociationMember_associationId_userId_key" ON "AssociationMember"("associationId", "userId");
CREATE INDEX IF NOT EXISTS "AssociationMember_associationId_idx" ON "AssociationMember"("associationId");
CREATE INDEX IF NOT EXISTS "AssociationMember_userId_idx" ON "AssociationMember"("userId");
CREATE INDEX IF NOT EXISTS "AssociationMember_groupId_idx" ON "AssociationMember"("groupId");
CREATE INDEX IF NOT EXISTS "AssociationMember_status_idx" ON "AssociationMember"("status");

-- A member number is unique within an association only when present. Prisma
-- cannot express a partial unique index, so this one is unmanaged:
-- `prisma migrate dev` will report it as drift and offer to drop it; keep it.
-- Without the WHERE clause, PostgreSQL null semantics would still allow many
-- null member numbers, but the index would be managed and the intent lost.
CREATE UNIQUE INDEX IF NOT EXISTS "AssociationMember_member_number_key"
  ON "AssociationMember" ("associationId", "memberNumber")
  WHERE "memberNumber" IS NOT NULL;

DO $$
BEGIN
    ALTER TABLE "AssociationMember"
        ADD CONSTRAINT "AssociationMember_associationId_fkey"
        FOREIGN KEY ("associationId") REFERENCES "Association"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "AssociationMember"
        ADD CONSTRAINT "AssociationMember_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "AssociationMember"
        ADD CONSTRAINT "AssociationMember_groupId_fkey"
        FOREIGN KEY ("groupId") REFERENCES "AssociationGroup"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
