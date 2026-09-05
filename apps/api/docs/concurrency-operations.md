# Concurrency safety: operations

How the invariants hardened in `feature/concurrency-safety` are enforced, what
an operator does when one of them looks wrong, and which decisions were made
deliberately rather than by default.

## Where each invariant actually lives

A preflight read is never the boundary. Every invariant below is held by a
database constraint or a conditional write, and the reads that precede them
exist only so a user gets a readable message instead of a constraint violation.

| Invariant | Enforced by |
| --- | --- |
| Attendee count never exceeds capacity | `UPDATE "Event" SET attendees = attendees + 1 WHERE … attendees < capacity` inside the registration transaction |
| One registration per user per event | `EventRegistration(eventId, userId)` unique constraint |
| A seat is released once | `updateMany` on the attending statuses, `count === 1` before the decrement |
| At most one committed refresh rotation | `AuthSession.rotationCounter` compare-and-swap |
| An OTP is consumed once | Conditional `deleteMany` on the verified code hash, in the same transaction as the user create |
| The OTP attempt limit holds | `UPDATE … SET attempts = attempts + 1 WHERE attempts < maxAttempts` before verification |
| One active cart per user | Partial unique index `Cart_userId_active_key` |
| One content-linked PDU activity per user | Partial unique index `PDUActivity_user_content_key` |
| One rating aggregate per recomputation | `pg_advisory_xact_lock` held across aggregate and publish |
| One delivery per outbox event | `FOR UPDATE SKIP LOCKED` claim plus the `OutboxDelivery` row |
| One account per work email | `User.email` unique constraint, its violation recovered into the association "email already in use" code |
| One association per owner | `Association.ownerId` unique constraint |
| An activation link activates once | `updateMany` on `OtpCode` where `consumedAt IS NULL`, `count === 1` before the user is activated |
| A learning activity is decided once | `updateMany` on `PDUActivity` naming `PENDING`, `count === 1`; the loser of a race receives the already-settled code and writes no audit entry |
| A stale compliance recomputation is discarded | `updateMany` on the assignment where `computedAt IS NULL OR computedAt <= startedAt`, so a slow pass finishing after a newer one matches nothing |
| One attribution per assignment and activity | `AssociationCreditAttribution(assignmentId, activityId)` unique index, which is what makes recomputation idempotent |
| A repeated cycle rollover opens nothing | `AssociationRequirementAssignment(requirementId, memberId, cycleStart)` unique index |
| One generation per pending report export | Partial unique index `AssociationGeneratedReport_pending_key` on (association, report type, format, filter hash) WHERE state is `PENDING`, its violation recovered into a read of the winning record |
| A generated export becomes ready once | `updateMany` naming `PENDING`, `count === 1`, written only after the file exists in object storage |
| An expired export never points at a readable file | The retention sweep removes the object first, then marks the record with a `updateMany` naming `READY` |

## Decisions

**Refresh-token reuse revokes the session, a lost race does not.** A token whose
`rot` claim is behind the stored counter should no longer exist anywhere, so
presenting it revokes the session and the user signs in again. A request that
merely loses the compare-and-swap — two browser tabs refreshing in the same
instant — is answered as unauthenticated and changes nothing. Reuse is checked
before the hash comparison, because a superseded token no longer matches the
stored hash and checking the hash first would report every replay as an
ordinary invalid token.

**`toggleWishlist` is retained, not deprecated.** No new GraphQL operations were
added, so the public contract is unchanged. A toggle is genuinely ambiguous
under concurrency and no implementation can resolve that; what the service now
guarantees is that each call performs one atomic operation, that concurrent
calls cannot produce a duplicate row or a missing-row error, and that the final
state is one a caller asked for. The idempotent `addToWishlist` and
`removeFromWishlist` operations exist behind it, so exposing explicit mutations
later is a resolver change rather than a persistence change.

**Rating aggregates are recomputed under a lock, not at read time and not
asynchronously.** Reading them live would change four modules' query paths;
recomputing them asynchronously would need a version guard to stop an older
recomputation landing last. Instead, the aggregate and the write to the owning
module happen inside one transaction that holds a per-content advisory lock, so
recomputations for the same content item are serialised and the newest one
commits last. The owning module receives a structurally-typed writer through its
public contract — it stays free of ORM types while still writing inside the
caller's transaction.

**Duplicate backfill winners.** The newest active cart wins and inherits the
losing carts' items; colliding items are dropped in favour of the winner's
newer price snapshot, and emptied duplicates become `ABANDONED` rather than
being deleted. The most recently updated content-linked PDU activity wins and
inherits the losers' evidence files before they are removed — uploaded proof is
never destroyed by the migration.

## Migration and rollback

`20260828140000_concurrency_safety` is ordered so that duplicates are collapsed
before the indexes that would reject them are created, and so that event
counters are reconciled before registration starts trusting them. Every
statement is idempotent, and Prisma runs the file in one transaction, so a
failure rolls the whole thing back.

Audit a production-like database before deploying:

```sql
-- Users holding more than one active cart.
SELECT "userId", COUNT(*) FROM "Cart" WHERE "status" = 'ACTIVE'
GROUP BY "userId" HAVING COUNT(*) > 1;

-- Duplicate content-linked PDU activities.
SELECT "userId", "contentType", "contentId", COUNT(*) FROM "PDUActivity"
WHERE "contentType" IS NOT NULL AND "contentId" IS NOT NULL
GROUP BY 1, 2, 3 HAVING COUNT(*) > 1;

-- Event counters that disagree with their registration rows.
SELECT e."id", e."attendees", COUNT(r."id") FILTER (
         WHERE r."status" IN ('REGISTERED', 'ATTENDED', 'COMPLETED')
       ) AS actual
FROM "Event" e LEFT JOIN "EventRegistration" r ON r."eventId" = e."id"
GROUP BY e."id", e."attendees"
HAVING e."attendees" IS DISTINCT FROM COUNT(r."id") FILTER (
         WHERE r."status" IN ('REGISTERED', 'ATTENDED', 'COMPLETED'));
```

If any of these return rows, read the migration's backfill sections and confirm
the winner policy is the one this data wants before applying it.

Both indexes are built without `CONCURRENTLY`, so they take a brief `SHARE` lock
on their tables. On a large `PDUActivity` table, build the index out of band
first and let the migration's `IF NOT EXISTS` find it already there:

```sql
CREATE UNIQUE INDEX CONCURRENTLY "PDUActivity_user_content_key"
  ON "PDUActivity" ("userId", "contentType", "contentId")
  WHERE "contentType" IS NOT NULL AND "contentId" IS NOT NULL;
```

To roll back, drop the two indexes and the column; nothing else in the migration
needs undoing, because the backfills leave the data in a state the previous code
also accepts:

```sql
DROP INDEX IF EXISTS "Cart_userId_active_key";
DROP INDEX IF EXISTS "PDUActivity_user_content_key";
ALTER TABLE "AuthSession" DROP COLUMN IF EXISTS "rotationCounter";
```

Dropping `rotationCounter` invalidates nothing: tokens carrying a `rot` claim
are simply ignored by code that does not read it.

Both partial indexes are unmanaged — Prisma cannot express them in
`schema.prisma`. `prisma migrate dev` reports them as drift and offers to drop
them. Do not accept; the model docstrings say so too.

## Reconciling an event's attendee count

`attendees` is a cache of the registration rows beneath it. After a restore, an
incident, or any direct database edit, recompute it:

```sql
UPDATE "Event" e SET "attendees" = src.active
FROM (
  SELECT ev."id", COUNT(r."id") FILTER (
           WHERE r."status" IN ('REGISTERED', 'ATTENDED', 'COMPLETED')
         )::int AS active
  FROM "Event" ev LEFT JOIN "EventRegistration" r ON r."eventId" = ev."id"
  GROUP BY ev."id"
) src
WHERE e."id" = src."id" AND e."attendees" IS DISTINCT FROM src.active;
```

`EventRepository.reconcileAttendeeCount(eventId)` does the same for a single
event from application code.

## Outbox

Claims use `FOR UPDATE SKIP LOCKED` and push `availableAt` out by one lease. The
lease is `OUTBOX_LEASE_MS` (default 60000). A handler that can legitimately run
longer should either raise that value or call `context.renewLease()` while it
works; without one of the two, a slow delivery becomes claimable by a second
worker while the first is still running.

Every handler receives `context.idempotencyKey`, which is `outbox-<eventId>` and
is identical on every attempt at the same event. Hand it to any provider that
accepts one — the mail handler passes it to Resend as `Idempotency-Key`. This is
what makes the unavoidable window between an external side effect and the
`OutboxDelivery` row harmless: a process killed in that window retries, and the
provider collapses the two requests into one.

A handler whose failure will not improve on retry should not throw. The report
export handler marks its record `FAILED` and returns for anything the domain
refused — a deleted group, a filter the period rules reject — and throws only
for the unexpected, so a user sees a reason in seconds rather than after ten
backoffs. Its `abandon` hook writes the same terminal state when the processor
does give up.

Retries stop at ten attempts. Inspect what is stuck:

```sql
-- Terminal failures: out of attempts, never processed.
SELECT "id", "eventName", "attemptCount", "lastError", "occurredAt"
FROM "OutboxEvent"
WHERE "processedAt" IS NULL AND "attemptCount" >= 10
ORDER BY "occurredAt";

-- Currently leased (claimed, not yet finished).
SELECT "id", "eventName", "attemptCount", "availableAt"
FROM "OutboxEvent"
WHERE "processedAt" IS NULL AND "availableAt" > NOW();
```

To retry a terminal failure after fixing its cause, reset the attempt count and
make it available. Delete the delivery row too only if the side effect genuinely
did not happen — leaving it in place is what stops a re-run from duplicating a
side effect that already occurred:

```sql
UPDATE "OutboxEvent"
SET "attemptCount" = 0, "availableAt" = NOW(), "lastError" = NULL
WHERE "id" = '<event-id>';
```

## What the logs will say

None of these carry token, hash, cookie, or OTP material; they carry the
correlation ID and non-sensitive identifiers only.

| Message | Means |
| --- | --- |
| `Refresh rotation lost a concurrent compare-and-swap` | Two requests presented the same refresh token; one committed |
| `Refresh token reuse detected; session revoked` | A superseded token was replayed |
| `Registration lost a race for an email address` | An account for that address appeared while an OTP was being verified |
| `Recovered a concurrent active-cart creation` | The partial unique index rejected a second cart; the winner was read back |
| `Recovered a concurrent content-linked PDU activity` | Two requests logged the same content; the winner was updated |
| `Outbox lease renewal found no claimable event` | A handler renewed a lease for work that had already finished |
| `Outbox delivery already recorded` | A redelivery found its delivery row already present |

Expected conflicts are logged at `warn` and answered with domain error codes.
None of them are internal server failures, and none should be alerted on
individually; a sustained rise in any of them is the signal worth watching.

## Testing

`apps/api/test/concurrency/` holds PostgreSQL-backed suites that start their
operations from a shared barrier, so the operations genuinely overlap rather
than merely being started together. They assert final database state, not only
the responses.

E2E suites run one at a time (`maxWorkers: 1` in `test/jest-e2e.json`). Every
suite boots a full application against one PostgreSQL instance and the
concurrency suites deliberately saturate it; running them in parallel exhausts
the connection pool and turns real assertions into transaction timeouts. Each
suite also namespaces its fixtures through `suiteScope`, so no suite's cleanup
can delete another's rows.
