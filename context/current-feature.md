# Current Feature: Light/Dark Theme with Theme-Aware Background

## Status

In Progress

## Goals

- Deliver a production-ready global Light/Dark theme system that applies
  everywhere, persists across refresh and route changes, updates instantly
  without reload, works on desktop and mobile, avoids hydration mismatch and
  wrong-theme flashing, and follows the priority: saved preference → existing
  authenticated user preference (only if already supported) → OS preference →
  Light fallback. Reuse the existing theme provider rather than adding a
  competing one.
- Complete or create semantic theme tokens (`--background`, `--foreground`,
  `--card`, `--primary`, `--border`, `--input`, `--ring`, etc.) with consistent
  Light and Dark values, replacing theme-sensitive hardcoded colors on shared
  surfaces without redesigning unrelated screens or disturbing brand colors.
- Add one reusable `ThemeToggle` (Sun/Moon) beside the existing language
  switcher in every relevant header (desktop and mobile): instant, persisted,
  keyboard-accessible, visible focus, tooltip, `aria-label`, no layout shift,
  hydration-safe via a mounted-state strategy, without turning whole headers
  into client components.
- Make `ParticlesBackground` theme-aware: Light mode renders a static,
  low-noise white background with a subtle electric-blue tint and no WebGL;
  Dark mode renders the React Bits `FloatingLines` animated WebGL background.
  Never run both at once and never render `FloatingLines` in Light mode.
- Install/inspect the React Bits `FloatingLines` component, use its *actual*
  generated prop API (`linesGradient` vs `gradientStart/Mid/End` — no
  unsupported props, no `any`), reuse `three` if already present, and keep
  static config arrays out of render or memoized.
- Layer the background decoratively behind all content (`aria-hidden`,
  `pointer-events-none`, negative z-index, `isolate`) so header controls,
  language switcher, theme toggle, forms, dropdowns, dialogs, drawers,
  tooltips and mobile nav all stay interactive and above it, with no horizontal
  overflow and interactivity driven from a parent/window pointer listener.
- Guarantee SSR/hydration safety (`"use client"` only where needed, no `window`
  during server render), full WebGL lifecycle cleanup (RAF, ResizeObserver,
  listeners, geometry/material/renderer dispose, no duplicate canvases or loops
  under Strict Mode or repeated theme switches), and performance guards (DPR
  cap ≤2, stable props, no WebGL in Light mode, pause on hidden tab / reduced
  motion).
- Respect `prefers-reduced-motion` (static Dark gradient, no parallax/pointer
  interaction) and provide a static Dark fallback when WebGL is unavailable or
  the context is lost, without surfacing raw WebGL errors.
- Review shared surfaces in both themes for readability (no white-on-white or
  dark-on-dark, correct input/dropdown/dialog/tooltip/chart theming) and fix
  only issues this feature introduces.
- Add/adjust tests for provider init, default resolution, saved restoration,
  Light↔Dark switching, toggle placement/label/tooltip, both headers,
  persistence across refresh and navigation, Light background, Dark
  FloatingLines, no-WebGL-in-Light, no duplicate canvases, cleanup, reduced
  motion, WebGL fallback, foreground clickability, and hydration; then run
  TypeScript checks, ESLint, frontend unit/integration tests, and the
  production build — reporting pre-existing failures separately.
- Produce the specification's 23-point completion report.

## Notes

- Source specification: `context/features/dark-light-theme-floating-spec.md`.
  Frontend-only feature (`apps/front`); no backend or Prisma work expected.
- No target argument was supplied, so Phase 1 must auto-inspect: root layout,
  root providers, main + mobile headers, language switcher, `ParticlesBackground`
  and all its usages, existing theme provider / `next-themes` usage, Tailwind
  dark-mode strategy, shadcn config, `globals.css` tokens, reduced-motion and
  storage utilities, and whether `three`/`FloatingLines`/React Bits already
  exist — before writing any code.
- Reuse-first, no duplication: exactly one theme provider, one `ThemeToggle`,
  one `FloatingLines`, one `three`. Do not modify unrelated business logic or
  redesign unrelated screens. Frontend path aliases (`@/*`, `@ui`, `@elements`,
  `@components`, etc.) and the existing `cn` helper are the conventions to
  follow.
- Known project tooling debt that affects this feature's gate: the frontend
  `lint` script calls the removed Next 16 `next lint`, so lint must be run per
  file with `npx eslint <paths>` rather than `npm run lint`. `check-types` is
  `npx tsc --noEmit -p apps/front/tsconfig.json`. Frontend tests are Vitest
  (`npm run test --workspace front`).
- The spec's `FloatingLines` example lists props (`gradientStart/Mid/End`) that
  may not match the generated type; the installed component's real API governs.
  Dark fallback color family: `#09090b`, `#e945f5`, `#6f6f6f`, `#6a6a6a`.
- Spec ends with "Implement the feature completely, then stop." after the
  23-point report.

## History

<!-- Keep this updated. Earliest to latest -->

### 2026-07-22 — Phase 7 end-to-end onboarding review completed

- Exercised the whole workflow against the live API and configured Neon
  database with realistic data: 5 applications submitted, 1 rejected, 3
  approved (2 concurrently), 1 account activated, then signed in and opened the
  Organization dashboard. 179 live assertions ran across submission, Admin
  review, rejection, approval, activation, authorization, resend, concurrency
  and audit. Every test record was deleted afterwards (6 requests, 3 users,
  3 organizations, 8 OTP rows, 10 audit rows; verified zero remaining).
- Found and fixed the review's headline defect: a Nest `HttpException` built
  with an object payload — the `{ code, message }` shape every service in this
  workflow throws — reached the browser as a bare `INTERNAL_SERVER_ERROR` with
  the domain code dropped. `REQUEST_ALREADY_EXISTS`, `ACTIVATION_TOKEN_EXPIRED`,
  `ACTIVATION_TOKEN_USED`, `CHANGE_PASSWORD_REQUIRED` and every review conflict
  were indistinguishable from a server crash. Unmapped failures were worse:
  a Prisma error returned its raw text, naming the database host and the
  server's absolute source paths, to anonymous callers.
- Added `formatGraphQLError` (`@utils/graphql-error-formatter`) to the GraphQL
  module. It publishes the domain code and HTTP status for handled exceptions,
  drops stack traces, and replaces anything unrecognised with a generic
  message. Guard and ValidationPipe error shapes are unchanged, so the existing
  single-flight token refresh keeps working. Covered by 8 unit tests.
- Closed the audit gaps the specification lists. Added
  `ORG_ACCESS_REQUEST_SUBMITTED` (written in the same transaction as the
  application), `ORGANIZATION_ACCOUNT_CREATED` (only when approval really
  creates an account, not when it links an existing one), and
  `ORGANIZATION_NOTIFICATION_FAILED` (a retried failure leaves no trace in the
  request column alone).
- Added the missing `OtpCode(codeHash, purpose)` index: activation resolves a
  link from its hashed token with no user or destination to narrow the search.
- Bounded `ActivateOrganizationAccountInput` token and password length so an
  anonymous caller cannot hand argon2 an arbitrarily large string.
- Frontend activation now reads the newly-exposed error code: a link that
  lapses between opening the page and submitting it moves the user to the
  matching expired/used/invalid screen, which is where the resend form lives.
  Previously it showed a generic toast with no way forward.
- Everything else the specification asks for was already correct and is now
  proven live rather than by inspection: single-winner concurrent reviews,
  `Organization.ownerId @unique` making duplicate organizations impossible,
  argon2 password storage, SHA-256 token hashing with sibling invalidation,
  resend cooldown and identical answers for unknown addresses, cross-role and
  cross-organization refusal, session-derived identity, and no secret in any
  log, audit row or email.
- Review pass produced three further changes: collapsed a duplicated error
  toast in the activation hook, made `TOKEN_ERROR_CODES` `as const`, and pinned
  the one app-wide consumer that matches on an error message
  (`useCpdPduProgress` looks for `CPD_PLAN_DUPLICATE`, thrown as a bare string
  payload) with a formatter regression test.
- The formatter is registered on `GraphQLModule`, so it changes the
  client-visible error shape for every operation, not only this workflow. That
  breadth was raised explicitly at review and approved: it is the only place
  the fix can live, and guard, ValidationPipe and token-refresh shapes are
  unchanged and covered by tests.
- Verification: API Jest 79/79 (12 suites, up from 68), frontend Vitest 13/13,
  API and frontend TypeScript checks, both production builds, Prisma validate,
  `migrate status` up to date, GraphQL codegen re-run, Prettier, ESLint on
  changed frontend files, and `git diff --check`.
- Known follow-up, pre-existing and not introduced here: the delivery-failure
  catch block in `OrganizationReviewNotificationService` performs database
  writes that are themselves unguarded, so a database fault while handling a
  failed send would surface as an error on an approval that already committed.
- Pre-existing tooling debt, unchanged and not caused by this work: the root
  `lint` gate fails because the frontend script calls the removed Next 16
  `next lint` and the API workspace has no ESLint 9 flat config, and
  `test:e2e` points at an `apps/api/test` directory that has never existed.
- `UNDER_REVIEW` remains unsupported by `OrganizationAccessRequestStatus`, so
  the specification's "under-review state" check is reported rather than built.
- The legacy CPD migration-history caveat has resolved on its own: Prisma now
  reports "Database schema is up to date!" with all 10 migrations applied.

### 2026-07-22 — Phase 6 re-audit and live verification completed

- Re-audited the loaded Phase 6 implementation without finding a code or schema
  gap. The live database schema matches `schema.prisma`, every local migration
  has a completed database row with the same SHA-256 checksum, and the
  `ORGANIZATION_ACTIVATION` enum value and account-activation columns are
  present.
- Exercised `organizationActivationStatus` against the running GraphQL API and
  live configured database. An unknown token returned the intended secure
  `INVALID` result; the previously recorded PostgreSQL enum error no longer
  occurs.
- Prisma migration status remains misleading because the database contains two
  completed legacy CPD migrations (`20260717120000_add_cpe_credit_type` and
  `20260717120100_cpd_plans`) whose source directories are absent locally. This
  is migration-history provenance debt, not Phase 6 drift: a live-schema diff
  is empty and Phase 6's applied checksum exactly matches the repository file.
  No migration rows were rewritten and no database DDL was applied.
- Verification passed: API Jest 67/67, frontend Vitest 13/13, focused activation
  and password-guard Jest 28/28, API/frontend TypeScript checks, API production
  build, frontend production build, and `git diff --check`.
- The root lint gate still cannot run because the frontend script invokes the
  removed Next 16 `next lint` command. This is existing tooling debt documented
  by the project and was not changed in this re-audit.

### 2026-07-22 — Completion review findings resolved

- Enforced the mandatory-password rule on the backend: `changePassword` now
  rejects a new password equal to the current temporary password and cannot
  clear `forcePasswordChange` in that case. Added a focused regression test.
- Made public activation resend throttling concurrency-safe. Resend now obtains
  a transaction-scoped PostgreSQL advisory lock per Organization user, then
  rechecks the cooldown and daily cap before atomically invalidating the prior
  invitation, issuing the replacement, and recording its audit event.
- Updated the stale Phase 6 notes to reflect successful live verification while
  retaining the separate legacy CPD migration-history caveat.
- Completion verification passed: API Jest 68/68, focused regression Jest
  24/24, API TypeScript check, API production build, and whitespace validation.
  The frontend tests and production build remained green from the immediately
  preceding re-audit; no frontend application code changed during review fixes.

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

### 2026-07-21 — Organization notifications and secure activation completed

- Reused the existing Resend mail service and added branded application
  submitted, rejection, approval/activation, and password-changed templates.
- Added SHA-256-hashed, expiring, single-use activation tokens that invalidate
  prior active invitations; raw tokens are neither persisted nor logged.
- Persisted independent submission and review delivery states so one successful
  notification cannot suppress another, including retry and failure metadata.
- Added Admin-authorized, terminal-state resend actions with explicit UI
  confirmation, failure warnings, and duplicate/in-flight delivery guards.
- Added public account activation with Organization ownership and pending-account
  checks, Argon2 password setup, activation, and email verification.
- Verification passed: API tests (37/37), frontend tests (7/7), API and frontend
  production builds, Prisma generation/validation, and whitespace checks.
- The migration remains unapplied because the configured database reports two
  pre-existing remote migrations missing locally. Real Resend delivery requires
  deployment credentials; the mandatory first-login UI remains Phase 6 scope.

### 2026-07-21 — Organization account activation and mandatory password setup completed

- Consolidated activation-token issue/validate/consume and the public resend
  into `AuthOrganizationActivationService`. The Admin approval email now mints
  its link through the same service, so one invitation always supersedes the
  last and tokens are created in exactly one place.
- Added the public `organizationActivationStatus` query and
  `resendOrganizationActivation` mutation, and moved
  `activateOrganizationAccount` out of `AuthPasswordService`. Activation
  distinguishes used, expired, superseded, and unknown tokens, rejects a
  password equal to the email or organization name, and commits the password,
  status change, token consumption, sibling-token invalidation, session
  revocation, and audit row in one transaction.
- Closed the Phase 1 finding that `forcePasswordChange` was enforced only in the
  browser. `PasswordChangeGuard` is registered globally after `RolesGuard` and
  covers GraphQL and the REST controllers; only `currentUser`, `changePassword`,
  and `logout` carry `@AllowPasswordChangeRequired()`.
- Added `/auth/organization/activate` with checking, form, expired, used, and
  invalid states plus a resend form. `RoleRouteGuard` renders a blocking
  `PasswordChangeRequired` screen in place instead of redirecting, so no loop is
  possible, refresh is safe, and logout stays reachable. The dismissible
  force-password dialog in Organization settings was removed as unreachable.
- Resend is rate limited by a 120s `resendAfter` cooldown and a five-per-day cap
  built on the existing `OtpCode` fields; no throttling infrastructure was
  added. It answers identically for unknown, throttled, and eligible addresses.
- Prisma gained `User.passwordChangedAt` and two `AuditAction` values in
  migration `20260721180000_organization_account_activation`.
- Two review passes produced ten confirmed findings, all fixed. The two that
  mattered most: a superseded token told users their account was already active
  and offered no recovery, and `resetPassword` never cleared
  `forcePasswordChange`, which would have locked legacy accounts out
  permanently once the new guard landed.
- Verification passed: API tests (67/67), frontend tests (13/13), TypeScript
  checks and production builds for both apps, Prettier, and ESLint on changed
  frontend files. Vitest gained the tsconfig path aliases so tests can import
  the way application code does.
- Not verified end to end. The configured database still reports drift, so a
  live `organizationActivationStatus` call fails with
  `invalid input value for enum "OtpPurpose": "ORGANIZATION_ACTIVATION"`.
  Resolvers were confirmed reachable against a local `/graphql` and the resend
  returned its generic payload for an unknown address, but no activation has
  been exercised against real data. Reconciling the migration history is the
  first task of any follow-up work, and it blocks Phase 7.
- `apps/front/src/components/modules/Auth/OAuthBridgeClient.tsx` was found to be
  dead code; nothing imports it and the live path is `useOAuthBridge`. Left in
  place rather than deleted without asking.
