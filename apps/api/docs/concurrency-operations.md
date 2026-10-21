# Concurrency safety: operations

How the invariants hardened in `feature/concurrency-safety` are enforced, what
an operator does when one of them looks wrong, and which decisions were made
deliberately rather than by default.

## Where each invariant actually lives

A preflight read is never the boundary. Every invariant below is held by a
database constraint or a conditional write, and the reads that precede them
exist only so a user gets a readable message instead of a constraint violation.

| Invariant                                                                                                | Enforced by                                                                                                                                                                                                                                          |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Attendee count never exceeds capacity                                                                    | `UPDATE "Event" SET attendees = attendees + 1 WHERE … attendees < capacity` inside the registration transaction                                                                                                                                      |
| One registration per user per event                                                                      | `EventRegistration(eventId, userId)` unique constraint                                                                                                                                                                                               |
| A seat is released once                                                                                  | `updateMany` on the attending statuses, `count === 1` before the decrement                                                                                                                                                                           |
| At most one committed refresh rotation                                                                   | `AuthSession.rotationCounter` compare-and-swap                                                                                                                                                                                                       |
| An OTP is consumed once                                                                                  | Conditional `deleteMany` on the verified code hash, in the same transaction as the user create                                                                                                                                                       |
| The OTP attempt limit holds                                                                              | `UPDATE … SET attempts = attempts + 1 WHERE attempts < maxAttempts` before verification                                                                                                                                                              |
| Only one password-reset or email-change OTP is outstanding, and its cooldown holds | `pg_advisory_xact_lock` per user and purpose, a cooldown check, and the supersession of older codes, all in one transaction |
| The reset and email-change OTP attempt limit holds | `UPDATE "OtpCode" SET attempts = attempts + 1 WHERE id = (latest unconsumed) AND attempts < maxAttempts AND expiresAt > now()` before the hash is compared |
| A reset code changes the password once | Conditional `updateMany` on `consumedAt: null` with `count === 1`, in the same transaction as the password write and the session revocation |
| A rate-limit window never over-admits under concurrent requests | One `INSERT … ON CONFLICT DO UPDATE` on `RateLimitBucket` that resets or increments the window in the same statement |
| One active cart per user                                                                                 | Partial unique index `Cart_userId_active_key`                                                                                                                                                                                                        |
| One content-linked PDU activity per user                                                                 | Partial unique index `PDUActivity_user_content_key`                                                                                                                                                                                                  |
| One rating aggregate per recomputation                                                                   | `pg_advisory_xact_lock` held across aggregate and publish                                                                                                                                                                                            |
| One delivery per outbox event                                                                            | `FOR UPDATE SKIP LOCKED` claim plus the `OutboxDelivery` row                                                                                                                                                                                         |
| An ingestion item is bulk-approved once                                                                  | One `UPDATE … RETURNING` over a `FOR UPDATE SKIP LOCKED` selection naming the unapproved state, so two overlapping bulk approvals take disjoint rows                                                                                                 |
| One account per work email                                                                               | `User.email` unique constraint, its violation recovered into the association "email already in use" code                                                                                                                                             |
| One association per owner                                                                                | `Association.ownerId` unique constraint                                                                                                                                                                                                              |
| An activation link activates once                                                                        | `updateMany` on `OtpCode` where `consumedAt IS NULL`, `count === 1` before the user is activated                                                                                                                                                     |
| A learning activity is decided once                                                                      | `updateMany` on `PDUActivity` naming `PENDING`, `count === 1`; the loser of a race receives the already-settled code and writes no audit entry                                                                                                       |
| A stale compliance recomputation is discarded                                                            | `updateMany` on the assignment where `computedAt IS NULL OR computedAt <= startedAt`, so a slow pass finishing after a newer one matches nothing                                                                                                     |
| One attribution per assignment and activity                                                              | `AssociationCreditAttribution(assignmentId, activityId)` unique index, which is what makes recomputation idempotent                                                                                                                                  |
| A repeated cycle rollover opens nothing                                                                  | `AssociationRequirementAssignment(requirementId, memberId, cycleStart)` unique index                                                                                                                                                                 |
| One generation per pending report export                                                                 | Partial unique index `AssociationGeneratedReport_pending_key` on (association, report type, format, filter hash) WHERE state is `PENDING`, its violation recovered into a read of the winning record                                                 |
| A generated export becomes ready once                                                                    | `updateMany` naming `PENDING`, `count === 1`, written only after the file exists in object storage                                                                                                                                                   |
| An expired export never points at a readable file                                                        | The retention sweep removes the object first, then marks the record with a `updateMany` naming `READY`                                                                                                                                               |
| A member is messaged once per type per cooldown window                                                   | Unique constraint `AssociationMessageDelivery(associationId, memberId, messageType, cooldownBucket)`, its violation recovered into a skip carrying the cooldown reason                                                                               |
| A queued message always has an email behind it                                                           | The delivery row and its outbox event are written in one transaction, chunk by chunk                                                                                                                                                                 |
| One recipient receives one copy                                                                          | `updateMany` naming `QUEUED` after the provider accepts it, with the outbox idempotency key handed to the provider so a retry is the same email                                                                                                      |
| Two administrators cannot silently overwrite each other's settings                                       | `updateMany` on `AssociationSettings` naming the `updatedAt` the client last read, `count === 1`; the loser receives the settings-stale code and re-reads rather than losing its edit                                                                |
| A threshold pair is never stored out of order                                                            | Both thresholds arrive together and are validated as a unit before the conditional write, so there is no read-modify-write window in which one could be saved against a stale partner                                                                |
| A reclassification follows every threshold change                                                        | The recompute event is appended to the outbox inside the same transaction as the settings write, so a settings change that commits always has a reclassification queued behind it                                                                    |
| A member invitation cannot suppress or be consumed by another association's invitation to the same email | `OtpCode.associationMemberId` scopes the invalidate-on-reissue, cooldown, and daily-limit queries per membership, not per user                                                                                                                       |
| A member invitation activates once, and only its own membership                                          | `updateMany` on `AssociationMember` naming `PENDING_ACTIVATION`, `count === 1`, in the same transaction as the conditional `OtpCode` consume — either losing rolls both back                                                                         |
| One lifecycle or assignment email per logical occurrence                                                 | Unique `AssociationMessageDelivery.occurrenceKey`, written with `ON CONFLICT DO NOTHING` so a duplicate is a no-op rather than an aborted transaction                                                                                                |
| A requirement assignment or learning-content recipient is announced once                                 | `announcedAt IS NULL → now` claim taken under `FOR UPDATE … ORDER BY id`, in the same transaction as the delivery row and its outbox event; untargeting clears `announcedAt`, so only a genuine unassign/reassign announces again                    |
| A member is told about a group only when they actually move into it                                      | `updateMany` on `AssociationMember` where the group differs, `count === 1`, in the same transaction as the group-added delivery                                                                                                                      |
| An automatic welcome and a manual welcome never both go out                                              | The automatic welcome takes the current weekly `cooldownBucket`, so it and a concurrent manual welcome collide on the cooldown constraint; afterwards any `WELCOME` row removes the member from the new-joiners list                                 |
| Concurrent directory syncs for one professional converge                                                 | `ProfessionalAssociationRequirementLink` is written with `createMany … skipDuplicates`, not a find-then-create upsert                                                                                                                                |
| A member completes an association item only if it was offered to them | `ProfessionalAssociationContentLink` is pushed by the association module whenever an item's audience, status or requirement changes; the activity write takes `FOR SHARE` on the member's link row inside the same transaction, so a withdrawal that races a completion either lands first and the completion is refused, or lands after and finds the activity |
| An item with completions cannot move to another requirement | `reassignContentRequirement` takes `FOR UPDATE` on the item's link rows, then counts activities for the item inside the same transaction; a completion that races it holds `FOR SHARE` on its own link row, so one of the two waits for the other and the move is refused or the completion sees the new requirement |
| One external-content activity per member per item | Partial unique index `PDUActivity_user_learning_content_key` on `(userId, associationLearningContentId)` where the activity has no catalogue reference; the second concurrent create hits `P2002`, reads the winner and updates it, which also returns a reviewed activity to `PENDING` |
| Publish and permanent delete cannot both win for one requirement                                         | The delete transaction takes `FOR UPDATE` on the association-scoped requirement row and then conditionally deletes only `DRAFT`; publish conditionally updates only `DRAFT`, so PostgreSQL serialises the two transitions and exactly one can commit |
| A requirement only ever targets its own association's active members                                     | `updateAudience` takes `FOR SHARE … ORDER BY id` on the selected `AssociationMember` or `AssociationGroup` rows, filtered by `associationId`, inside the transaction that replaces the targets; a deactivation racing the save either waits behind the lock or is seen by it, and a refusal rolls the `deleteMany` back so no partial audience survives |
| A SEO override is never silently overwritten | `updateMany` on `CourseSeo`/`EventSeo`/`PodcastSeo`/`YouTubeChannelSeo` naming the `version` the editor read, `count === 1`; the unique `(content, locale)` index arbitrates two first saves and is recovered as the same conflict |
| A social image still in use is never deleted | `ContentSocialImage` is referenced by RESTRICT foreign keys; retirement deletes the row first and removes the file only when that succeeds |
| Hiding a page from search converges | `updateMany` on `excludeFromIndex` naming the opposite value, so repeating the call changes and audits nothing |
| One public slug never points at two records in a route namespace | `ContentUrlClaim` holds every current and retired slug under a unique `(namespace, slug)` index. The `content_url_claim_sync` trigger on `Course`, `Event`, `Podcast` and `YouTubeChannel` writes it in the same statement as any insert or slug update, so create, import, ingestion and the slug editor all claim through one door; a slug claimed by another record raises a unique violation named after the content table's own slug constraint, which every existing caller already maps |
| A record has exactly one current URL | The partial unique index `ContentUrlClaim_current_target_key` allows one `isCurrent` row per `(namespace, targetId)`; the trigger retires the old claim before activating the new one, so A to B to C and a return to A leave one current row |
| A slug change cannot overwrite a newer one | `updateMany` naming the slug the editor read and `deletedAt: null`, `count === 1`; losers get `CONTENT_URL_VERSION_CONFLICT`, and a claim taken by another record is recovered outside the aborted transaction as `CONTENT_URL_SLUG_TAKEN` |
| A topic hub edit never overwrites a newer one | `updateMany` on `TopicHub` naming the `version` the editor read and the status it saw, `count === 1`; the same version guards publishing, so a publish and an edit from one version cannot both commit, and replacing the link list happens in the transaction that won the version |
| A hub is published only with reviewed copy and a live link | `setStatus` checks the copy and the eligible links first, then writes with the version it checked; any edit bumps the version, so the check cannot go stale before the write. The `TopicHub_published_check` constraint requires `publishedAt` for a published row |
| A provider's public text changes only on explicit approval | The approval is an `updateMany` on `ProviderPublicProfile` naming `reviewState = SUBMITTED` and the draft version that was submitted; it then snapshots the locked row into `ProviderPublicRevision` and moves `publishedRevision` in the same transaction. Any edit increments `draftVersion` and returns the state to `DRAFT`, so a stale approval matches no row. The public page reads only the revision named by `publishedRevision` |
| A telemetry event is counted once however often it is sent | `INSERT … ON CONFLICT DO NOTHING RETURNING` on `TelemetryDedupKey` inside the same transaction as the counter increments; only the keys the statement returned are counted, so twenty identical requests at the same instant add one. A failed write rolls the claim back with it, so the retry counts |
| Telemetry counters never lose an increment or deadlock | One multi-row `INSERT … ON CONFLICT DO UPDATE SET count = count + EXCLUDED.count` per table, rows pre-summed and sorted by the same key in every request, tables always written in the order dedup, vitals, conversions, intake |
| Telemetry intake is bounded across instances | `RateLimitService.spendAll` against the shared `RateLimitBucket` table, per client address and globally, spent before any aggregate is written; two API processes on one database accept exactly the limit |
| A registration is counted only when the account exists, and once | An outbox event appended in the transaction that creates the user; the handler claims a dedup key derived from the outbox idempotency key before incrementing, so a redelivery adds nothing and a rolled-back registration leaves no event |
| A withdrawal cannot be undone by a pending approval | Withdrawal conditionally moves `PUBLISHED` to `WITHDRAWN` and, in the same transaction, cancels a pending submission; an approval that was already waiting re-evaluates its predicate against the new row and matches nothing. `ProviderPublicProfile_published_check` requires a revision for a live profile |
| A roadmap has at most one open edit | Partial unique index `RoadmapDraft_open_edit_key` on `replacesRoadmapId` where the draft is `COLLECTING`, `READY`, `GENERATING` or `FAILED`; a second `startRoadmapEdit` that races the first hits the violation (`P2002`), reads the winning draft and answers with it |
| An edit draft never becomes the new-roadmap coach's draft | `findEditableDraft` filters `replacesRoadmapId: null`, and every other lookup of a draft by user alone goes through it |
| A regenerated roadmap replaces the old enrollment once, and carries progress once | In the transaction that creates the new enrollment, `updateMany` moves the old enrollment from "not `UNENROLLED`" to `UNENROLLED` and the step records are copied only when `count === 1`; an enrollment the professional already unenrolled is left alone and the new one starts empty |

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

## Content slug registry

`20261011170323_content_url_claims` creates `ContentUrlClaim`, backfills one
current claim per existing course, event, podcast and YouTube channel with the
stored slug unchanged, and installs the synchronising triggers. Slugs are
already unique inside each content table, so the backfill cannot collide.
Audit before deploying:

```sql
SELECT 'COURSE' AS kind, COUNT(*) FROM "Course"
UNION ALL SELECT 'EVENT', COUNT(*) FROM "Event"
UNION ALL SELECT 'PODCAST', COUNT(*) FROM "Podcast"
UNION ALL SELECT 'YOUTUBE', COUNT(*) FROM "YouTubeChannel";
```

After the migration every kind's claim count must equal these counts, and no
record may lack a current claim:

```sql
SELECT c."id" FROM "Course" c
LEFT JOIN "ContentUrlClaim" u
  ON u."namespace" = 'COURSE' AND u."targetId" = c."id" AND u."isCurrent"
WHERE u."id" IS NULL;
```

Rollback disables editing by removing the `changeContentSlug` resolver. Keep the
table and triggers: dropping them would let a retired path be taken over and
turn every old link into a 404. Claims are never deleted, including for a
soft-deleted or hard-deleted record.

## Topic hubs and provider profiles

`20261012051007_topic_hubs_and_provider_profiles` is additive. It adds
`TopicHub`, `TopicHubTranslation`, `TopicHubReference`, `ProviderPublicProfile`
and `ProviderPublicRevision`, two enum values for the URL namespace registry,
seven audit actions, two CHECK constraints and one slug-claim trigger per new
table. It backfills nothing: no hub or profile exists until an administrator or a
provider creates one, and nothing is published automatically.

Check after deploying:

```sql
SELECT tgname FROM pg_trigger
WHERE tgname IN ('TopicHub_content_url_claim', 'ProviderPublicProfile_content_url_claim');

SELECT count(*) FROM "ProviderPublicProfile"
WHERE "status" = 'PUBLISHED' AND "publishedRevision" IS NULL;
```

The second query must return 0. Rollback hides the public routes and keeps every
draft, revision and slug claim; never drop the tables, because a retired hub or
provider path would then be free for another page to take.


## Search telemetry

`20261012124743_telemetry_aggregates` is additive. It adds ten enums and the
tables `TelemetryVitalBucket`, `TelemetryConversionDaily`,
`TelemetryIntakeDaily` and `TelemetryDedupKey`, plus a positive-count CHECK on
each counter table. It backfills nothing and collection is off until
`TELEMETRY_ENABLED=true`.

What is stored, the limits and the privacy decision are in
`docs/seo/telemetry-and-privacy.md`. Operationally:

- Intake never fails a request. A disabled switch, a rate limit, a sampling
  decision and a storage error all answer `accepted`/`dropped`. Drops are
  counted by outcome in `TelemetryIntakeDaily` on a best-effort basis, so under
  heavy load the counters can undercount; the accepted counts and the
  aggregates are exact, and nothing is counted while collection is disabled.
- Retention runs inside each API instance every hour: dedup keys after 24 hours,
  daily aggregates after 395 days, 5000 rows per delete and at most twenty
  batches per table per sweep. Two instances sweeping at once are harmless.
- Check after deploying:

```sql
SELECT count(*) FROM "TelemetryDedupKey"
WHERE "seenAt" < now() - interval '48 hours';

SELECT "outcome", sum("count") FROM "TelemetryIntakeDaily"
WHERE "day" >= current_date - 1 GROUP BY "outcome";
```

The first query should return 0 once the sweep has run. A growing
`SINK_FAILED` or `RATE_LIMITED` share in the second means the sink or a client
needs attention. To stop collection, set `TELEMETRY_ENABLED=false` on the API.
Never drop the tables to roll back; the data is aggregate and harmless to keep.


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
lease is `OUTBOX_LEASE_MS` (default 180000, above the 150000ms roadmap generation
call plus a safety margin). While a handler runs, `OutboxProcessor` renews the lease every third of
its length, so a slow delivery stays claimed by the worker that holds it.
Renewal is a compare-and-set on `attemptCount`: a worker whose lease was taken
over fails its renewal, its delivery throws, and its failure write matches no
row, so it cannot disturb the new holder's lease. A handler may also call
`context.renewLease()` to check ownership before an expensive side effect;
roadmap generation does so before every AI call.

Association learning content reaches a professional through two read models the
professional module owns: `ProfessionalAssociationRequirementLink` (which
requirements a member holds) and `ProfessionalAssociationContentLink` (which
items a member was offered, and the requirement each counts toward). The
association module pushes both through `PROFESSIONAL_REQUIREMENT_DIRECTORY_API`
in the transaction that changes the audience, status or requirement. The
backfill in `20261020120000_association_content_sync` seeds the content links
from the existing recipients. Both sides read completion back through
`contentCompletions`, which returns the completion date, the submission date
(`PDUActivity.createdAt`), the credits and the review status; the credited
amount and the late flag come from the assignment's `AssociationCreditAttribution`.
The reporting start of a published requirement is immutable, and a change to the
reporting end, grace period or late policy recomputes every assignment. The
partial index above is unmanaged for the same reason as the others.

Editing a roadmap starts a second draft (`replacesRoadmapId` set) that copies the
saved brief from the draft behind the current enrollment. Generation of that
draft is the same job as any other; the only difference is inside the persist
transaction, where the new enrollment retires the old one and copies the step
progress of every step whose content (type and id) survived into the new
roadmap. If generation fails the old roadmap and enrollment are untouched. Step
writes that land on the old enrollment after the commit are not carried, and
the old enrollment keeps accepting them because the step mutations check
ownership, not status. The partial index is unmanaged — Prisma cannot express
it — and `prisma migrate dev` will report it as drift; do not accept the drop.

Roadmap generation is idempotent on `RoadmapDraft.status`. The handler does
nothing unless the draft is `GENERATING`, and does not call the AI service when
a `RoadmapEnrollment` already exists for the draft (a redelivery after the
roadmap was persisted but before the event was marked processed). Persistence
first flips `GENERATING` to `COMPLETED` with `updateMany` inside the same
transaction as the roadmap and enrollment, and rolls everything back when the
count is not 1, so a second worker that finished late discards its result;
`RoadmapEnrollment.draftId` stays unique as the backstop.

Every handler receives `context.idempotencyKey`, which is `outbox-<eventId>` and
is identical on every attempt at the same event. Hand it to any provider that
accepts one — the mail handler passes it to Resend as `Idempotency-Key`. This is
what makes the unavoidable window between an external side effect and the
`OutboxDelivery` row harmless: a process killed in that window retries, and the
provider collapses the two requests into one.

**Two lanes, not one shared queue.** `OutboxProcessor` claims strictly by
`occurredAt`, so a single instance draining every event type let a sustained
burst from a high-volume producer (ingestion, driven by a crawler sync) starve
low-volume, time-critical events — an OTP email queued behind ten thousand
`ingestion.item.published` rows waited as long as the burst took to drain
(confirmed in production, 2026-09-25/26). `MailModule` now runs two standing
`OutboxProcessor` instances instead: a realtime lane (mail, audit, roadmap
generation, association notifications) and a bulk lane (ingestion). Each
instance is constructed with a `lane` option and claims only
`handlers.eventNamesForLane(lane)` — every `OutboxHandler` declares its own
`lane: "realtime" | "bulk"`, a required interface field, so an event name can
never end up unassigned or claimable by both lanes at once. Poll interval and
lease are configured per lane (`OUTBOX_POLL_INTERVAL_MS`/`OUTBOX_LEASE_MS` for
realtime, `OUTBOX_BULK_POLL_INTERVAL_MS`/`OUTBOX_BULK_LEASE_MS` for bulk), so
a lane's cadence can be tuned without affecting the other. To find which lane
owns a given handler, check its `lane` field in
`apps/api/src/infrastructure/outbox/handlers/` or the handler's own module;
each lane's log lines carry a `OutboxProcessor:realtime` /
`OutboxProcessor:bulk` logger context so production logs can be filtered by
lane directly.

Two association handlers now consume their own events rather than the shared
`mail.delivery.requested`. The templated-message handler renders each recipient's
copy at delivery time from the figures captured when the send was accepted, so
neither the rendered body nor the member's name and progress ever sit in an
outbox payload. It hands the provider `context.idempotencyKey`, which is what
makes a redelivery the same email rather than a second one.

Automatic lifecycle mail uses the same delivery ledger. The business write
that causes it — an accepted invitation, a direct link of an active account, a
real group move, or a positive assignment delta — records the
`AssociationMessageDelivery` row and appends one versioned event in the same
transaction: `association.member.invited.v1`,
`association.membership.activated.v1`, `association.member.group-added.v1`,
`association.requirement.assigned.v1` or
`association.learning-content.assigned.v1`. One realtime handler,
`AssociationLifecycleMessageHandler`, claims all five. It re-reads the member,
group, requirement or content at send time and settles anything no longer true
as `SKIPPED` with `NO_LONGER_APPLICABLE` instead of mailing it. A notification
suppressed by the association's settings is written as `SKIPPED` with
`EMAIL_SUPPRESSED` and never queued; the invitation is essential account-access
mail and is never suppressed. Learning-content audiences resolve through
`association.learning-content.audience-changed.v1`, whose handler synchronises
the `AssociationLearningContentRecipient` ledger in bounded batches and renews
its lease after each one.

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

## Member invitation acceptance

`association-management` owns `AssociationMember`; `identity-access` owns
`OtpCode`/`User`. `apps/api/src/architecture/prisma-ownership.spec.ts` enforces
that neither domain reaches directly into the other's Prisma models, so the
accept flow is split across a port instead of one service:

- `AuthAccountActivationService.acceptMemberInvitationToken` (identity-access)
  classifies the token, conditionally consumes it, and — only if the account
  is not yet claimed — sets its password. It never touches `AssociationMember`.
- `AssociationMemberInvitationService.acceptInvitation` (association-management)
  opens the transaction, calls the above through the `AccountActivationApi`
  port with that transaction as `atomicContext`, then conditionally activates
  the membership and writes the audit entry inside the same transaction.

Because both writes share one transaction, either one losing its conditional
update (`consumedAt IS NULL`, `status = PENDING_ACTIVATION`) rolls the other
back too — there is no window where the token is spent but the membership
never activated, or vice versa.

The same `OtpCode.associationMemberId` scoping used above for invalidation and
cooldown also makes each membership's invitation independent of any other
membership the same person holds or is being invited to: accepting one
membership's token can only ever activate that membership.

## What the logs will say

None of these carry token, hash, cookie, or OTP material; they carry the
correlation ID and non-sensitive identifiers only.

| Message                                                | Means                                                                                                     |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `Refresh rotation lost a concurrent compare-and-swap`  | Two requests presented the same refresh token; one committed                                              |
| `Refresh token reuse detected; session revoked`        | A superseded token was replayed                                                                           |
| `Registration lost a race for an email address`        | An account for that address appeared while an OTP was being verified                                      |
| `Recovered a concurrent active-cart creation`          | The partial unique index rejected a second cart; the winner was read back                                 |
| `Recovered a concurrent content-linked PDU activity`   | Two requests logged the same content; the winner was updated                                              |
| `Outbox lease renewal found no claimable event`        | A handler renewed a lease for work that had already finished                                              |
| `Outbox delivery already recorded`                     | A redelivery found its delivery row already present                                                       |
| `Association compliance settings updated`              | A settings write committed; the line carries the new thresholds and whether a reclassification was queued |
| `Association reclassified after a threshold change`    | The queued recompute finished, with the assignment count it touched                                       |
| `Association lifecycle notifications recorded`         | Lifecycle deliveries were written, with how many were queued, suppressed, or already existed              |
| `Association lifecycle delivery skipped at send time`  | A queued lifecycle email was no longer applicable, or its recipient had no active verified address        |
| `Association learning content recipients synchronised` | A learning-content audience resync finished, with targeted, untargeted and announced counts               |
| `Content slug changed` | An editor changed a slug; the line carries the kind, actor, content id and correlation ID |
| `Content slug already claimed` | A requested slug belongs to another record, current or retired |
| `Content slug version conflict` | The slug changed since the editor read it, or two edits raced |
| `Topic hub status changed` | An administrator published or withdrew a hub; the line carries the hub id, both states and the correlation ID |
| `Topic hub has no eligible links` | A published hub was read while none of its links was visible; an editorial review signal |
| `Provider profile submitted` | A provider submitted a draft for review |
| `Provider profile reviewed` | An administrator approved or rejected a submitted draft |
| `Provider profile edit lost a version race` | A provider saved from a draft version that was no longer current |
| `Telemetry sink write failed` | A telemetry batch could not be stored and was dropped; the line carries the correlation ID, the error name and the event count, never an event id or a dimension |
| `Telemetry sink was slow` | A batch took longer than 750 ms to store; an early sign the aggregate tables or the database need attention |
| `Telemetry retention sweep finished` | The hourly sweep removed expired dedup keys or aggregates; the line carries the two counts |
| `Telemetry retention sweep failed` | The sweep threw; expired rows stay until the next hour and nothing else is affected |

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
