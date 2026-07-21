# Current Feature: Organization Notifications and Secure Activation — Phase 5

## Status

In Progress

## Goals

- Reuse and complete the project’s intended email provider and notification
  architecture without coupling Organization workflow logic to a provider SDK.
- Send branded application-submitted, rejection, approval/activation, and
  password-changed emails with the correct recipient and safe public content.
- Implement secure, hashed, expiring, single-use Organization activation tokens
  that invalidate prior active invitations and never log or persist raw tokens.
- Generate approval emails containing a secure set-password URL, expiry,
  Organization login URL, support information, and no permanent password.
- Persist delivery success or failure independently from valid application
  status changes and log failures without sensitive values.
- Add authorized, state-aware resend actions with duplicate-delivery protection
  for approval, rejection, and activation notifications.
- Update environment examples, validation, and setup documentation using the
  project’s existing configuration conventions and no real credentials.
- Test templates, recipients, token security and lifecycle, provider outcomes,
  delivery persistence, resend behavior, configuration errors, and logging.

## Notes

- Source specification: `context/features/email-org-submit5-spec.md`.
- Inspect the existing mail provider, templates, notification abstraction,
  queues, and outbox patterns before adding new infrastructure.
- Use an existing queue/outbox if present; otherwise keep delivery replaceable
  and future-queue-compatible without introducing large infrastructure.
- A successful approval or rejection must not normally be rolled back solely
  because email delivery fails; persist the failure and warn the Admin instead.
- Rejection emails may include the applicant-facing rejection reason but must
  never include internal Admin notes.
- Real provider credentials remain manual environment setup and must not be
  committed.
- The complete first-login password-change UI is explicitly out of scope until
  Phase 6.
- Completion requires the specification’s ten-part report.
- Implementation selected the existing Resend `MailService`, the existing
  `OtpCode` table with a new `ORGANIZATION_ACTIVATION` purpose, SHA-256 token
  hashes, and durable notification delivery fields on the application record.
- The migration is intentionally not applied to the configured shared database:
  migration status reports two pre-existing remote migrations that are missing
  locally and must be reconciled before deployment.
- A second completeness audit added Admin failure warnings, explicit resend
  confirmation for every reviewed state, activation-link configuration,
  Organization ownership checks, and coverage for duplicate/in-flight sends,
  missing configuration, and sensitive logging.
- Review identified and corrected a delivery-state collision by separating
  application-submission notification state from approval/rejection state.

## History

<!-- Keep this updated. Earliest to latest -->

### 2026-07-17 — Initial setup

- Established the AI context system: `CLAUDE.md` plus `context/`
  (`project-overview.md`, `coding-standards.md`, `ai-interaction.md`,
  `current-feature.md`). Scaffolding committed in `ea51c98`; contents filled in
  afterwards.
- Adapted `ai-interaction.md` from a generic template to this repo: merge target
  corrected to `develop` (`main` is a vestigial 3-commit stub), review moved ahead
  of commit/merge, `feature/*` branch naming adopted for new work, verification
  split by app (browser for `front`, `/graphql` for `api`), build gate extended to
  `lint` and `check-types`, and no Claude attribution in commit messages.
- Frontend RTK Query data layer (`apps/front/src/stores/`) removed in `ea51c98`.
  Backend integration is to be rebuilt; TanStack Query is installed and
  provider-wired.

### 2026-07-20 — Organization approval workflow, Phase 1 (audit)

- Read-only audit of the Organization registration → Admin approval → activation
  → first-login password change flow, per
  `context/features/email-org-submit1-spec.md` (phase 1 of 7). Report at
  `context/features/email-org-submit1-audit.md`. No `apps/` code changed.
- Headline: approval succeeds but produces an unusable account in production.
  The temporary password is generated, hashed, stored, then discarded — its only
  exit is a `console.log` skipped when `NODE_ENV === "production"`. No approval
  or rejection email is sent anywhere; neither `OrganizationModule` nor
  `AdminDashboardModule` imports `MailModule`.
- Also found: two divergent approval implementations (the UI-reachable admin one
  lacks a status-transition guard; the unreachable org one uses `Math.random()`
  for passwords and logs them in every environment); `forcePasswordChange`
  enforced nowhere on the backend, so the first-login gate is client-side and
  dismissible; rejection reason required only in the browser.
- Data model needs nothing — `forcePasswordChange`, `rejectReason`, `OtpCode`,
  and `AuditLog` all already exist, and Resend is configured and live. This is a
  wiring problem, not a build-from-scratch one.
- Recommended: keep the admin path, delete the org one, replace temporary
  passwords with single-use activation links built on `OtpCode`.
- Landed as a commit on `feature/org-approval-audit` only. Not merged: the
  `/feature complete` action merges to `main`, which `ai-interaction.md`
  forbids, and the `develop` branch it names does not exist. Merge target
  unresolved — see Risks item 7 in the report.

### 2026-07-20 — Workflow specifications merged

- Added the phase 2–7 workflow specification files. Despite the original commit
  message saying the phases were implemented, that commit contains planning
  documents only; application implementation remains outstanding.
- Merged `feature/org-approval-audit` and
  `feature/org-application-submission` into `main` at `50d301e`, resolving
  `context/current-feature.md` in favor of the newer phase 2 planning document.

### 2026-07-20 — Organization application submission completed

- Reused the public GraphQL submission mutation, React Hook Form, Zod schema,
  RTK Query endpoint, notification system, Prisma request model, and existing
  `PENDING` workflow status.
- Added frontend and backend whitespace normalization, lowercase organizational
  email normalization, explicit required-field indicators, clear backend error
  messages, Admin-review success copy, disabled in-flight submission, and a
  synchronous re-entry guard for double-click protection.
- Added a PostgreSQL partial unique index for one `PENDING` request per
  normalized work email and mapped uniqueness races to the existing
  `REQUEST_ALREADY_EXISTS` business conflict.
- Added nine backend Jest assertions covering required/invalid input,
  normalization, successful submission, server-assigned status, duplicate and
  existing-user prevention, public submission, and Admin-only request reads.
- Verification passed: API tests (8/8), API/frontend TypeScript checks,
  frontend changed-file lint, Prisma schema validation, migration status, and
  API/frontend production builds. API lint remains unavailable because the API
  workspace has no ESLint 9 flat configuration; this is pre-existing tooling
  debt. Frontend interaction tests remain deferred per the phase scope decision.
- No active organization account, Admin review action, email delivery, or
  password-change behavior was added. Phase 3 remains the next workflow phase.

### 2026-07-20 — Admin Organization Requests dashboard completed

- Reused the Admin navigation, table/detail design, cursor pagination, RTK
  Query, GraphQL documents, `useDebouncedValue`, status badges, role route
  guard, and backend `@Roles(ADMIN)` boundary.
- Completed bounded server-side search, status filtering, ascending/descending
  submission-date sorting, cursor pagination, a dedicated Admin-only detail
  query, and reviewer display without exposing internal approval-user fields.
- Added distinct loading, empty, no-results, error, unauthorized, and detail
  error states. Removed functional approval/rejection wiring from the Phase 3
  UI and replaced it with disabled controls that identify Phase 4.
- Added five backend Jest tests for list pagination, filtering/search/sorting,
  detail lookup, missing detail, and non-Admin rejection. Added seven frontend
  Vitest assertions for debounce timing and all list-state classifications.
- Verification passed: API tests (14/14), frontend tests (7/7), API/frontend
  TypeScript checks, frontend changed-file lint, GraphQL regeneration, and both
  production builds. API lint remains unavailable because the API workspace has
  no ESLint 9 flat configuration.
- No `UNDER_REVIEW` transition was added because the existing status enum does
  not support it. Approval, rejection, account creation, email delivery, and
  password activation remain Phase 4+ work.

### 2026-07-21 — Organization approval and rejection completed

- Added transactional Admin-only `PENDING -> APPROVED | REJECTED` transitions
  with conditional claims that reject repeated or concurrent reviews.
- Approval validates the application, creates a pending Organization user
  without a password, provisions the Organization, profile, settings, and
  owner membership, and records the reviewer and audit data atomically.
- Rejection requires a bounded reason, records reviewer and timestamp
  atomically, and preserves the reason for later email delivery.
- Existing users are never overwritten or silently promoted; conflicts require
  manual intervention. The legacy divergent review mutation was removed.
- Added pending approval/rejection notification intents without claiming
  delivery, plus confirmation dialogs, localized copy, cache refresh, and
  success/error notifications.
- Verification passed: backend review tests (10/10), frontend tests (7/7), API
  build, frontend TypeScript and production build, GraphQL regeneration, and
  whitespace checks. The repository's pre-existing `next lint` command is
  incompatible with Next 16.
- Real email delivery, activation tokens, account activation, and mandatory
  first-login password-change UI remain for later phases.

### 2026-07-21 — Organization approval workflow, Phase 4 closed

- Audited both `email-org-submit3-spec.md` and `email-org-submit4-spec.md`
  against the code. Phase 3 was already complete; Phase 4 was complete except
  for two gaps, both now closed.
- Approval no longer rejects every existing account for the work email. It
  inspects the account and links an `ORGANIZATION` user that owns no
  organization as the owner. A different role returns `UserRoleConflict`, an
  account that already owns an organization returns
  `OrganizationAlreadyExists`, and a soft-deleted account returns
  `UserAlreadyExists`. Existing accounts are never overwritten or promoted.
- `organizationProfile.create` became an `upsert` with a no-op `update` because
  `OrganizationProfile.userId` is unique and a linked account may already hold a
  profile. Audit metadata now records `linkedExistingUser`. All conflicts throw
  after the status claim inside the transaction, so a refused approval rolls
  back to `PENDING` and stays reviewable.
- Added the two tests the specification required and the phase had missing:
  existing-user conflict (three branches) and rollback on account-creation
  failure. The existing approval test now shares a `createApprovalTx` factory.
- Verification: API tests 24/24, `tsc --noEmit` clean, `nest build` clean,
  Prettier applied. Not verified against a live `/graphql` session; the database
  still holds two `PENDING` requests if an end-to-end check is wanted.
- `UNDER_REVIEW` remains unsupported by the status enum, so the Phase 3
  under-review transition stays out of scope. Real email delivery, activation
  tokens, and the mandatory first-login password-change UI remain Phase 5+ work.
- Merged to `main`, matching every prior phase and the repository's actual
  integration branch. `ai-interaction.md` was corrected in the same commit: it
  had named a `develop` branch that has never existed.
