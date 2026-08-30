-- Concurrency safety: database-level guards for invariants the application used
-- to protect with a preflight read. Every statement below is idempotent so the
-- migration can be re-run after a partial failure.
--
-- Backfill order matters: duplicates are collapsed BEFORE the unique indexes
-- that would reject them are created, and event counters are reconciled BEFORE
-- registration becomes a conditional write that trusts them.

-- ---------------------------------------------------------------------------
-- 1. Refresh-token rotation compare-and-swap
-- ---------------------------------------------------------------------------
-- Every refresh token carries the counter value it was minted at. A rotation
-- commits only while the stored value still matches, so two concurrent
-- refreshes presenting the same token cannot both succeed. Existing sessions
-- start at 0; tokens issued before this migration carry no counter and are
-- compared against the stored value, which is still 0 for them.
ALTER TABLE "AuthSession"
  ADD COLUMN IF NOT EXISTS "rotationCounter" INTEGER NOT NULL DEFAULT 0;

-- ---------------------------------------------------------------------------
-- 2. Event attendee reconciliation
-- ---------------------------------------------------------------------------
-- Registration now increments the counter under a conditional UPDATE that
-- compares it against capacity, which only holds if the counter starts out
-- true to the registration rows. Any drift accumulated by the previous
-- non-atomic read-then-write path is corrected here, once.
UPDATE "Event" AS e
SET "attendees" = source."active"
FROM (
  SELECT ev."id",
         COUNT(r."id") FILTER (
           WHERE r."status" IN ('REGISTERED', 'ATTENDED', 'COMPLETED')
         )::int AS "active"
  FROM "Event" ev
  LEFT JOIN "EventRegistration" r ON r."eventId" = ev."id"
  GROUP BY ev."id"
) AS source
WHERE e."id" = source."id"
  AND e."attendees" IS DISTINCT FROM source."active";

-- ---------------------------------------------------------------------------
-- 3. One active cart per user
-- ---------------------------------------------------------------------------
-- Winner: the newest active cart per user (createdAt, then id as a tiebreak).
-- Losing carts hand their items to the winner and are marked ABANDONED rather
-- than deleted, so nothing a user added is silently destroyed.

-- 3a. Name the winner for every user who has more than one active cart.
CREATE TEMPORARY TABLE IF NOT EXISTS "_cart_winner" ON COMMIT DROP AS
SELECT DISTINCT ON (c."userId")
       c."userId",
       c."id" AS "winnerId"
FROM "Cart" c
WHERE c."status" = 'ACTIVE'
ORDER BY c."userId", c."createdAt" DESC, c."id" DESC;

-- 3b. Drop losing items that would collide with an item the winner already
-- holds. The winner's row is the newer one and carries the newer price
-- snapshot, so it is the one worth keeping.
DELETE FROM "CartItem" losing
USING "Cart" losing_cart, "_cart_winner" w
WHERE losing."cartId" = losing_cart."id"
  AND losing_cart."status" = 'ACTIVE'
  AND losing_cart."userId" = w."userId"
  AND losing_cart."id" <> w."winnerId"
  AND EXISTS (
    SELECT 1 FROM "CartItem" keep
    WHERE keep."cartId" = w."winnerId"
      AND keep."contentType" = losing."contentType"
      AND keep."contentId" = losing."contentId"
  );

-- 3c. Move every surviving item to the winning cart.
UPDATE "CartItem" ci
SET "cartId" = w."winnerId"
FROM "Cart" losing_cart, "_cart_winner" w
WHERE ci."cartId" = losing_cart."id"
  AND losing_cart."status" = 'ACTIVE'
  AND losing_cart."userId" = w."userId"
  AND losing_cart."id" <> w."winnerId";

-- 3d. Retire the emptied duplicates.
UPDATE "Cart" c
SET "status" = 'ABANDONED', "updatedAt" = NOW()
FROM "_cart_winner" w
WHERE c."userId" = w."userId"
  AND c."status" = 'ACTIVE'
  AND c."id" <> w."winnerId";

-- 3e. Prisma cannot express a partial unique index, so this one is unmanaged.
-- `prisma migrate dev` will report it as drift and offer to drop it; keep it.
CREATE UNIQUE INDEX IF NOT EXISTS "Cart_userId_active_key"
  ON "Cart" ("userId")
  WHERE "status" = 'ACTIVE';

-- ---------------------------------------------------------------------------
-- 4. One content-linked PDU activity per user per content item
-- ---------------------------------------------------------------------------
-- Winner: the most recently updated activity. Manually logged activities carry
-- no content link; PostgreSQL null semantics would let unlimited NULL rows
-- coexist under a plain unique index, but the explicit NOT NULL predicate below
-- makes that exclusion deliberate rather than incidental.

-- 4a. Name the winner for every duplicated (user, content) triple.
CREATE TEMPORARY TABLE IF NOT EXISTS "_pdu_winner" ON COMMIT DROP AS
SELECT DISTINCT ON (a."userId", a."contentType", a."contentId")
       a."userId",
       a."contentType",
       a."contentId",
       a."id" AS "winnerId"
FROM "PDUActivity" a
WHERE a."contentType" IS NOT NULL
  AND a."contentId" IS NOT NULL
ORDER BY a."userId", a."contentType", a."contentId",
         a."updatedAt" DESC, a."id" DESC;

-- 4b. Evidence files follow their activity to the winner; losing them would
-- destroy uploaded proof a professional may need for an audit.
UPDATE "PDUActivityFile" f
SET "activityId" = w."winnerId"
FROM "PDUActivity" losing, "_pdu_winner" w
WHERE f."activityId" = losing."id"
  AND losing."userId" = w."userId"
  AND losing."contentType" = w."contentType"
  AND losing."contentId" = w."contentId"
  AND losing."id" <> w."winnerId";

-- 4c. Remove the now file-less duplicates.
DELETE FROM "PDUActivity" losing
USING "_pdu_winner" w
WHERE losing."userId" = w."userId"
  AND losing."contentType" = w."contentType"
  AND losing."contentId" = w."contentId"
  AND losing."id" <> w."winnerId";

-- 4d. Unmanaged partial unique index — see the note on 3e.
CREATE UNIQUE INDEX IF NOT EXISTS "PDUActivity_user_content_key"
  ON "PDUActivity" ("userId", "contentType", "contentId")
  WHERE "contentType" IS NOT NULL AND "contentId" IS NOT NULL;
