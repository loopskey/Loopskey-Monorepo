# Feature: Association lifecycle and assignment email notifications

## Status

Draft

## Objective

Provide one reliable, idempotent email-notification flow for the complete
association member lifecycle:

1. invitation to an association;
2. successful association membership/activation;
3. addition to an association group;
4. assignment of a requirement to a professional;
5. assignment of Learning Content to a professional; and
6. the existing Notifications experience for welcome messages and reminders.

Persist notification intent through the transactional outbox so domain state
and notifications cannot diverge. Reuse the existing Notifications history and
delivery controls where their semantics fit, without forcing distinct
assignment occurrences into the existing seven-day reminder cooldown model.

## User Value

As a professional member, I want timely emails when I am invited, activated,
added to a group, or assigned work so that I understand what changed and can
open the exact relevant experience. As an association administrator, I want
these deliveries to be visible, retry-safe, and consistent with the existing
welcome/reminder Notifications area.

## Current-Implementation Audit

| Scenario | Current project behavior | Feature action |
| --- | --- | --- |
| Invite an unknown/unclaimed email to an association | Implemented. The pending membership, activation token, and `mail.delivery.requested` event are created transactionally. The invitation has an acceptance CTA and a stable idempotency key. | Preserve and add regression coverage; do not create a second invitation path. |
| Add an already-active professional to an association | The member is linked immediately as `ACTIVE`; no association-membership/welcome email is sent. | Missing: emit the membership transition and send the consolidated membership/welcome email once. |
| Accept an association invitation | The member becomes `ACTIVE` and the transition is audited; no confirmation/welcome email is sent. | Missing: send the consolidated membership/welcome email once after activation. |
| Add/move a member to an association group | Group state is updated. Requirement materialization may run, but there is no independent group-membership email. | Missing: send a group-added email for a real transition to a new group. |
| Assign a requirement | Assignment rows are materialized, but no member-level outbox event or email is created. The published-event handler only logs. | Missing: emit and deliver only the positive assignment delta. |
| Assign Learning Content | Audience targeting is stored/resolved, but there is no durable member-level assignment event/email. The published-event handler only logs. | Missing: add durable recipient-delta handling and email delivery. |
| Existing welcome/reminder Notifications | Implemented as an administrator-triggered flow. It supports `WELCOME`, `CATEGORY_BEHIND`, `BEHIND_THRESHOLD`, and `CERTIFICATE_EXPIRING`, delivery history, cooldown, `welcomeMessages`, and `suppressAllEmail`. It is not an automatic lifecycle notification. | Preserve reminder behavior and integrate automatic membership/welcome delivery with its history/settings so manual and automatic welcomes do not duplicate. |

## Notification Taxonomy and Policy

| Notification | Trigger | Recipient/CTA | Delivery policy |
| --- | --- | --- | --- |
| Association invitation | A new pending membership and activation token are committed for an unknown/unclaimed account. | Invited email; CTA accepts/activates the invitation. | Existing essential transactional email; it is not blocked by association marketing/reminder suppression. |
| Membership/welcome | An invitation is accepted, or an existing active professional is linked directly to the association. | Active professional; CTA opens the professional dashboard for that association context. | One consolidated email, not separate membership and welcome emails. Reuse the existing `WELCOME` history/eligibility semantics and respect association email settings. |
| Group added | An active professional changes from no/different group to a new active group. | That professional; CTA opens the relevant professional dashboard/requirements context. | One email for the new group transition. No removal email and no email for a no-op update. Respect `suppressAllEmail`. |
| Requirement assigned | A published, actionable requirement changes from not-targeted to targeted for an active member. | Newly targeted professional; CTA opens Requirements with the requirement selected. | One email per true assignment occurrence. Respect `suppressAllEmail`. |
| Learning Content assigned | Published, actionable Learning Content changes from not-targeted to targeted for an active member. | Newly targeted professional; CTA opens internal content detail/context; external content first opens a safe platform-owned intermediary or Requirements view. | One email per true assignment occurrence. Respect `suppressAllEmail`. |
| Welcome/reminders from Notifications | An authorized association administrator sends an existing welcome or reminder notification. | Eligible selected members; existing safe CTA. | Existing manual behavior, settings, cooldown, history, and retry rules remain intact. |

Invitation and membership/welcome are distinct lifecycle moments. The latter is
deliberately consolidated with the welcome notification so activation does not
generate two near-identical messages. An automatically queued/sent welcome must
make the member ineligible for another manual welcome under the existing
Notifications rules.

## Scope

- Preserve the existing association-invitation implementation and verify its
  token, resend, idempotency, and delivery behavior.
- Add an automatic membership/welcome notification for both invitation
  acceptance and immediate linking of an existing active professional.
- Add group-membership-added notifications for actual positive transitions.
- Emit member-level requirement and Learning Content assignment events whenever
  targeting adds a recipient.
- Cover initial publication and later direct-member, group, audience, activation,
  and reassignment changes.
- Defer assignment notifications for pending members until activation, then
  notify once for their current actionable positive assignments.
- Surface lifecycle/assignment delivery state in the association Notifications
  history, alongside the existing welcome/reminder history, with clear type and
  `QUEUED`, `SENT`, `FAILED`, or `SKIPPED` status.
- Keep provider calls outside domain/database transactions and process them
  through the transactional outbox.
- Include association identity, a concise change/item summary, text and HTML
  variants, and a safe CTA in every applicable email.

## Non-goals

- Do not build a new end-user notification-preferences center.
- Do not make existing behind/certificate reminders scheduled or automatic;
  their current administrator-triggered behavior remains unchanged.
- Do not notify on removal from a group, assignment removal, progress
  recomputation, metadata edits, or repeated materialization with no positive
  delta.
- Do not expose other recipients, association roster data, tokens, or unsafe
  third-party URLs.
- Do not replace the existing invitation token/activation mechanism.

## Functional Requirements

### 1. Association invitation

1. Creating a pending association member for an unknown/unclaimed email must
   continue to create the activation token and invitation mail intent in the
   same transaction.
2. One logical invitation/token occurrence produces one email. A request retry
   or outbox retry cannot create a duplicate delivery.
3. An intentional resend issues a fresh token/occurrence and invalidates or
   supersedes the prior token according to the existing activation policy.
4. The CTA must preserve safe redirect/association context and must never expose
   the raw token in logs, audit metadata, or notification-history payloads.

### 2. Association membership and welcome

1. The transition to `ACTIVE` must append a versioned lifecycle notification
   event transactionally for:
   - successful invitation acceptance; and
   - immediate linking of an existing active professional.
2. The event must feed the existing welcome delivery/history semantics rather
   than producing a second, competing welcome implementation.
3. A member receives at most one membership/welcome email per association
   membership occurrence. Retries and repeated acceptance/link commands are
   no-ops for notification purposes.
4. Existing `welcomeMessages` and `suppressAllEmail` settings apply. Suppressed
   attempts must be observable as `SKIPPED` (with a non-sensitive reason) or be
   consistently excluded from eligibility; the chosen behavior must be covered
   by tests and the Notifications UI.

### 3. Group membership

1. A transition to a new active group must append
   `association.member.group-added.v1` in the same transaction as the member's
   group change.
2. Creating a member with an initial group counts as a group-added transition;
   pending recipients defer the email until activation.
3. Re-saving the same group, removing a group, deleting/deactivating a group, or
   retrying the command sends no group-added email.
4. Moving from group A to group B sends one notification for group B. It does
   not send a removal email for group A.
5. Group changes must also run positive-delta materialization for both published
   requirements and published Learning Content. Only newly acquired items may
   generate assignment notifications; retained items must not notify again.

### 4. Requirement assignment

1. When an actionable requirement changes from not-targeted to targeted for a
   member, append `association.requirement.assigned.v1` transactionally with the
   authoritative assignment occurrence.
2. Initial publication and later `ALL_MEMBERS`, `GROUPS`, and
   `SPECIFIC_MEMBERS` targeting changes notify only the positive recipient
   delta.
3. Existing assignment upsert counts cannot be treated as newly created counts;
   the implementation must derive the actual inserted/reactivated occurrence.
4. Re-running materialization, retrying a request, or changing unrelated fields
   sends no duplicate email.
5. Withdrawn, archived, deleted, or otherwise non-actionable requirements are
   never advertised as actionable.

### 5. Learning Content assignment

1. Learning Content must have a durable member-level recipient/assignment
   occurrence, or an equivalent transactional delta ledger, so a committed
   not-targeted-to-targeted transition can be identified reliably.
2. Append `association.learning-content.assigned.v1` for each positive delta
   across publication, direct-member, group, audience, and activation changes.
3. Dynamic list resolution alone is not an idempotency boundary. Concurrent
   targeting changes must converge on one assignment occurrence and one logical
   email.
4. Archived, unpublished, deleted, or otherwise non-actionable content is never
   advertised as actionable.

### 6. Existing Notifications area

1. Existing manual welcome and reminder sends must continue to use the current
   authorization, audience validation, cooldown, association settings, and
   retry-safe delivery flow.
2. The Notifications history/API/UI must distinguish invitation, membership or
   welcome, group addition, requirement assignment, Learning Content assignment,
   and existing reminder types without leaking message bodies or recipient data
   beyond the administrator's association scope.
3. Assignment and lifecycle occurrences require occurrence-based idempotency.
   They must not reuse the existing weekly cooldown bucket as their uniqueness
   key because multiple legitimate assignments can occur within one week.
4. Failure remains visible and retryable/reissuable. A provider retry after
   success must not duplicate delivery.

## Roles and Permissions

- Association-owned services derive recipients; callers and event handlers may
  not submit arbitrary recipient addresses.
- Only authorized association administrators can view delivery history or send
  the existing manual welcome/reminder messages.
- Handlers query only minimum recipient fields and never log email addresses,
  tokens, provider payloads, or rendered HTML.
- CTA authorization is rechecked when opened; possession of a URL does not
  grant access to an association, requirement, or content item.

## Contract Changes

- Add versioned internal events such as:
  - `association.membership.activated.v1`;
  - `association.member.group-added.v1`;
  - `association.requirement.assigned.v1`; and
  - `association.learning-content.assigned.v1`.
- Event payloads contain stable IDs and an occurrence/version identifier, not
  mutable display data, raw addresses, tokens, or rendered content. Handlers
  load current safe data through the owning service/port.
- Extend the association Notifications GraphQL history contract only as needed
  to expose the new notification type and delivery status. Existing clients
  must remain compatible.
- If the current `AssociationMessageDelivery` model cannot represent
  occurrence-based lifecycle/assignment uniqueness, add an occurrence key or a
  separate lifecycle-delivery ledger rather than weakening its existing
  welcome/reminder cooldown constraint.

## Data and Domain Rules

- A notification event is created alongside the conditional state transition
  that owns it. A read-then-send loop is not a correctness boundary.
- Use a database uniqueness constraint for each logical occurrence. Application
  checks alone are insufficient under retries/concurrency.
- A true unassign/reassign may notify again only when represented by a new
  assignment occurrence/version.
- Pending members do not receive assignment or group emails. On activation,
  current positive assignments and initial group membership are emitted once.
- Inactive/removed members receive no new lifecycle or assignment email.
- A group add that also creates assignments can legitimately produce one group
  notification plus one notification per newly assigned item. Each has its own
  stable occurrence key; delivery order is not a correctness guarantee.
- Invitation delivery is essential account-access mail. Membership/welcome,
  group, assignment, and existing reminder mail follow association delivery
  settings. Suppression decisions must be observable and consistent.
- No external provider call may occur inside a domain/database transaction.

## Dependencies and Side Effects

- Reuse `MailService`, `mail.delivery.requested`, transactional outbox
  processing, bounded retries, and delivery inspection.
- Reuse existing association invitation and welcome/reminder templates/services
  where appropriate; add dedicated escaped HTML/text templates for group,
  requirement, and Learning Content notifications.
- Large `ALL_MEMBERS` publications require bounded/chunked fan-out that remains
  transactionally recoverable and idempotent without holding an unbounded
  transaction.
- Updating group membership now affects requirement and Learning Content
  targeting, delivery history, and outbox volume; instrument backlog/failure
  counts without high-cardinality member identifiers.

## Acceptance Criteria

- [ ] Inviting an unknown/unclaimed email creates one pending member and sends one invitation email with a working acceptance CTA.
- [ ] Retrying the invite does not duplicate mail; an intentional permitted resend produces exactly one new token/email occurrence.
- [ ] Linking an already-active professional sends one consolidated membership/welcome email.
- [ ] Accepting an invitation sends one consolidated membership/welcome email and does not resend the original invitation.
- [ ] The automatic welcome is reflected in existing Notifications eligibility/history, so the same member is not offered a duplicate manual welcome.
- [ ] Adding an active member to a new group sends one group-added email; a same-group update or removal sends none.
- [ ] Moving groups sends one group-B email and only positive-delta requirement/content assignment emails.
- [ ] A newly targeted active member receives one requirement email with a working authorized CTA.
- [ ] A newly targeted active member receives one Learning Content email with a working authorized CTA.
- [ ] Initial publish and later direct/group/all-member targeting notify only newly targeted members.
- [ ] A pending member receives no group/assignment mail before activation, then receives current applicable notifications exactly once after activation.
- [ ] Existing targeted members receive nothing when materialization reruns or concurrent commands converge.
- [ ] Existing manual welcome and all current reminder types still honor authorization, settings, audience rules, cooldown, history, and retry behavior.
- [ ] Notification history shows the new categories and accurate queued/sent/failed/skipped state within association scope.
- [ ] `suppressAllEmail` suppresses non-essential lifecycle/assignment/reminder mail but never blocks the essential invitation/activation-link email.
- [ ] Wrong-owner, removed-member, withdrawn, archived, unpublished, or deleted CTA access is denied or safely unavailable.
- [ ] A crash/retry after provider success does not duplicate any logical mail.

## Verification

### Focused checks

- Invitation-service regression tests for unknown email, token creation,
  intentional resend, cooldown/policy, transaction rollback, and idempotency.
- Membership-acceptance and existing-account-link tests asserting one automatic
  welcome delivery/history record.
- Group transition tests for initial group, same group, move, remove,
  inactive/deleted group, pending activation, and positive assignment deltas.
- Requirement and Learning Content service tests for recipient deltas across
  direct, group, and all-member audiences.
- Existing Notifications service/UI regression tests for welcome/reminders,
  settings, weekly cooldown, new history types, and association isolation.
- Outbox handler/template tests for escaping, text alternatives, CTA safety,
  stale entities, suppression, retry, failure inspection, and idempotency.
- PostgreSQL concurrency tests with simultaneous invite acceptance, group moves,
  and materialization asserting final state, occurrence, outbox, and delivery
  counts.
- Controlled-inbox smoke checks for each notification family and CTA
  authorization. Credentials must be supplied through environment variables and
  never committed or logged.

### Scope gate

- API lint, type-check, focused tests, build, relevant E2E, Prisma migration
  validation, and root gates when shared contracts/message codes change.
- Frontend lint/type-check/build and browser verification when Notifications
  history or CTA routing changes.

## Risks and Decisions

- Risk: sending only on `published` misses later direct/group/activation
  assignments; sending on every materialization spams existing members.
  - Mitigation: event only the committed positive recipient delta.
- Risk: automatic membership confirmation plus the existing welcome action sends
  duplicate messages.
  - Decision: use one consolidated membership/welcome delivery integrated with
    existing welcome eligibility/history.
- Risk: using the reminder cooldown key for assignments suppresses legitimate
  same-week work or conflates unrelated occurrences.
  - Mitigation: use occurrence-based uniqueness for lifecycle/assignment events
    while retaining the existing cooldown for manual reminders.
- Risk: group changes create a burst of assignment mail.
  - Mitigation: bounded outbox fan-out, observable backlog, positive-delta-only
    delivery, and stable occurrence keys. Do not silently collapse distinct
    actionable items unless product approves a digest design.
- Risk: dynamic Learning Content audiences cannot prove a positive delta under
  concurrency.
  - Decision: introduce a durable recipient/occurrence boundary before sending.

## References

- `apps/api/src/modules/association/services/association-member.service.ts`
- `apps/api/src/modules/association/services/association-member-invitation.service.ts`
- `apps/api/src/modules/association/services/association-group.service.ts`
- `apps/api/src/modules/association/services/association-message.service.ts`
- `apps/api/src/modules/association/services/association-requirement-assignment.service.ts`
- `apps/api/src/modules/association/services/association-learning-content.service.ts`
- `apps/api/src/modules/association/application/association-requirement-published.handler.ts`
- `apps/api/src/modules/association/application/association-learning-content-published.handler.ts`
- `apps/api/src/infrastructure/outbox/outbox-processor.service.ts`
- `apps/api/src/modules/mail/mail.service.ts`
