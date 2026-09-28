# assignment-email-notifications

- Spec: `context/features/assignment-email-notifications.md`
- Scope: `full`
- Model: `High reasoning — Prisma migration with backfill, transactional outbox fan-out, concurrency-sensitive occurrence uniqueness, and a GraphQL contract change.`
- Branch: `feature/assignment-email-notifications`
- Base: `289ef4b9c09490a53c602b9f3ed5c4392830ca64`
- Status: `Ready`

## Acceptance

- [x] Inviting an unknown/unclaimed email creates one pending member and sends one invitation email with a working acceptance CTA.
- [x] Retrying the invite does not duplicate mail; an intentional permitted resend produces exactly one new token/email occurrence.
- [x] Linking an already-active professional sends one consolidated membership/welcome email.
- [x] Accepting an invitation sends one consolidated membership/welcome email and does not resend the original invitation.
- [x] The automatic welcome is reflected in existing Notifications eligibility/history, so the same member is not offered a duplicate manual welcome.
- [x] Adding an active member to a new group sends one group-added email; a same-group update or removal sends none.
- [x] Moving groups sends one group-B email and only positive-delta requirement/content assignment emails.
- [x] A newly targeted active member receives one requirement email with a working authorized CTA.
- [x] A newly targeted active member receives one Learning Content email with a working authorized CTA.
- [x] Initial publish and later direct/group/all-member targeting notify only newly targeted members.
- [x] A pending member receives no group/assignment mail before activation, then receives current applicable notifications exactly once after activation.
- [x] Existing targeted members receive nothing when materialization reruns or concurrent commands converge.
- [x] Existing manual welcome and all current reminder types still honor authorization, settings, audience rules, cooldown, history, and retry behavior.
- [x] Notification history shows the new categories and accurate queued/sent/failed/skipped state within association scope.
- [x] `suppressAllEmail` suppresses non-essential lifecycle/assignment/reminder mail but never blocks the essential invitation/activation-link email.
- [x] Wrong-owner, removed-member, withdrawn, archived, unpublished, or deleted CTA access is denied or safely unavailable.
- [x] A crash/retry after provider success does not duplicate any logical mail.

## Decisions

- One delivery ledger: `AssociationMessageDelivery` gains nullable `occurrenceKey` (unique) and a nullable `cooldownBucket`; the weekly-cooldown unique constraint is unchanged and still governs manual welcome/reminders. Lifecycle rows carry no bucket except the automatic `WELCOME`, which takes the current bucket so it also collides with a concurrent manual welcome.
- Positive delta is an atomic `announcedAt IS NULL → now` claim on `AssociationRequirementAssignment` and on a new `AssociationLearningContentRecipient` ledger, in the same transaction as the delivery row and outbox event. Untargeting clears `announcedAt`, so only a genuine unassign/reassign can notify again. The migration backfills `announcedAt` for already-targeted non-pending members so the release sends nothing retroactively.
- Suppression is decided when the intent is recorded: a suppressed notification is stored as `SKIPPED` / `EMAIL_SUPPRESSED` with no outbox event. The invitation is never suppressed.
- Pending members accrue assignments/recipients unannounced; acceptance announces welcome, initial group, and all current assignments in the acceptance transaction.
- Handlers re-check applicability at send time (member active, group still current and active, requirement/content still published and targeted) and settle a stale delivery as `SKIPPED` / `NO_LONGER_APPLICABLE`.
- The invitation moves from the generic `mail.delivery.requested` event to `association.member.invited.v1` with a `INVITATION` delivery row, so it appears in history; the rendered mail (with its link) stays only in the outbox payload, never in the history row.
- Learning Content fan-out is event-driven (`association.learning-content.audience-changed.v1`, appended in the publish transaction) and chunked at 200 with lease renewal; member-level changes resync inline.
- CTAs: welcome → professional dashboard; group → Requirements tab; requirement → Requirements tab with `requirement=association:<id>`; catalogue content → its own page with association context; external content → Requirements view (never a third-party link).
- Fixed on the way, because the concurrency tests exposed them: `ProfessionalRequirementDirectoryApiService` used a find-then-create upsert that leaked a raw P2002 under concurrent member updates (now `createMany … skipDuplicates`); bulk import never materialised assignments for imported members (now refreshes targeting per created member); the history UI did not recognise `EMAIL_SUPPRESSED` as a skip reason (skip reasons now derive from the generated enum).

## Verification

- Migration authored by hand from `prisma migrate diff` (the generated diff tried to drop 40 hand-written trigram indexes); applied with `prisma migrate deploy`; residual drift is only three pre-existing hand-written indexes — pass
- `npm run test --workspace api` — pass (130 suites, 1555 tests)
- `npm run test:e2e --workspace api` on an isolated PostgreSQL 16 — pass (25 suites, 172 tests); new `association-lifecycle-notifications` suite passed 5/5 repeated runs
- `npm run lint` — pass (includes i18n placeholder check)
- `npm run check-types` — pass
- `npm run build` — pass
- `npm run bundle-report --workspace front` — pass, no new dependency
- `npm run codegen --workspace front` — schema change is additive (4 message types, 1 skip reason)
- Browser (association Notifications tab, local API + isolated DB): success list in EN and FR with all new types and QUEUED/SENT/SKIPPED/FAILED states and reasons; empty state; 375px width without horizontal overflow — pass. The in-tab error state is unreachable by stopping the API (the session guard redirects to sign-in first); that path is unchanged.
- Controlled-inbox smoke check — not run: no mail-provider credentials in the environment.

## Submission

- Commit:
- PR:
- CI:
