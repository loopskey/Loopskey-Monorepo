# Current Feature

## Status

<!-- Not Started | In Progress | Completed -->

## Goals

<!-- Bullet points of what success looks like -->

## Notes

<!-- Additional context, constraints, or details from spec -->

## History

<!-- Keep this updated. Earliest to latest -->

### 2026-07-23 — Professional Dashboard Modifications, Phase 1 (audit) completed

- Read-only audit per `context/features/modify-ui-ph1-spec.md` (Phase 1 of a
  multi-phase effort). Report at `context/features/modify-ui-ph1-audit.md`. No
  `apps/` code was modified, created, or deleted — the audit-only constraint
  held; only the report and this working file changed.
- Structure: the whole Professional dashboard is one route
  (`dashboard/professional`) switching on a `?tab=` query param via
  `professional-dashboard-shell.tsx`; there are no per-tab route segments. The
  sidebar is data-driven from `professionalDashboardTabs` in
  `utils/dashboard-nav.config.ts` and nav is role-specific.
- Sidebar: "My Courses" (`?tab=courses`) and "External Learning"
  (`?tab=external-learning`) are referenced nowhere but the nav config (verified
  by repo-wide search); no Overview card links to them. Removing the two array
  entries is sufficient; underlying tabs/queries/backend stay (and
  `professionalMyCourses` is still used by Overview).
- Overview: charts are Recharts (`@elements/dashboard-charts`). Five of the six
  new cards already have data sources (CPD/PDU progress, roadmap progress —
  `professionalMyRoadmaps` returns rich per-phase progress, upcoming calendar,
  recent activities, certificates). Only "Recommendations for You" is a genuine
  gap (currently a generic course list, not personalized).
- Wishlist: filter state is pure local component state → GraphQL variables (no
  URL params, no Redux), so no stale-URL/query risk; one responsive panel, not
  separate mobile/desktop. Removing Price / Only Rated / Only Available Links /
  Category is a clean frontend-only edit.
- "My Learning Activities" is the CPD/PDU Tracker tab. Every listed element
  exists. A per-activity detail query exists (`professionalPduActivity`) but no
  detail page (view == the edit form). The table's "Certificate" column actually
  shows PDU evidence files; activities have no relation to `Certificate`.
- Certificates (the headline gap): the `Certificate` model exists but is
  seed-only and read-only — no create/edit/delete anywhere (`certificate.create`
  returns nothing repo-wide), resolver exposes only a query. Upload, edit,
  detail, filtering, real status calculation, expiry reminders, and CPD-plan
  linking are all net-new. The reusable precedent is the PDU-evidence upload
  stack (REST controller + multer + local-disk `storageKey` + ownership-scoped
  streaming download + blob cleanup; pdf/jpg/png/doc/docx, 20 MB, max 5).
- Review pass found and fixed one gap in the report itself: tooltip components
  (spec §2/§6) were omitted; added shadcn `@ui/tooltip` + Recharts built-in
  `<Tooltip />` to the reuse inventory.
- Risks flagged, led by the spec-mandated "Link All Active" certificate action,
  which has no target semantics today (no certificate↔plan/activity relation).
  Also flagged: certificate CRUD/storage/schema is genuinely larger than a
  "modify UI" pass and likely Phase 2+; status is stored not derived; no expiry
  scheduler exists; routing-convention decision (`?tab=` vs real segments); and
  local-disk (non-signed-URL) storage.
- No tests were added (audit only). There are currently no tests for any
  Professional dashboard surface — all Phase 2+ tests will be net-new.

### 2026-07-23 — Light/dark theme with theme-aware background completed

- Auto-audit (no target argument): `next-themes` v0.4.6 was present but locked
  with `forcedTheme="dark"` and a hardcoded `<html className="dark">`; the full
  light and dark semantic tokens already existed in `globals.css`; Tailwind 4
  class-based dark mode (`@custom-variant dark`) was already configured; the one
  `Header.tsx` renders the language switcher in both its desktop and mobile
  sections; the live background was a forced-dark NEAT gradient
  (`LearningParticlesBackground`). A complete but unused theme-aware OGL
  `GalaxyBackground` was found — abandoned scaffolding, left untouched by choice.
- Unforced the provider: `attribute="class"`, `defaultTheme="system"`,
  `enableSystem`, `disableTransitionOnChange`, and removed the hardcoded `dark`
  class so next-themes sets it before paint. Priority resolves saved → system →
  light.
- Added one reusable `ThemeToggle` (Sun/Moon) beside the language switcher in
  both header sections: keyboard-operable with a visible focus ring, tooltip,
  `aria-label`, and a mounted-state placeholder that avoids hydration mismatch
  and layout shift. New `theme` i18n keys in `en.json` and `fr.json`.
- Made the background theme-aware in `particles-background.tsx` (preserving the
  `LearningParticlesBackground` public export the layout already imports): light
  mode renders a static electric-white gradient with no WebGL; dark mode renders
  FloatingLines over a near-black base. Only one is ever active; WebGL never
  initializes in light mode.
- Followed the spec's explicit choice to install React Bits FloatingLines. The
  `shadcn add` CLI hung on a prompt, so the registry item was fetched directly
  and vendored into `components/ui/floating-lines.tsx` using its real
  `linesGradient: string[]` API (the spec's `gradientStart/Mid/End` do not
  exist). Local edits, all marked `Loopskey:`: a `"use client"` directive, a
  windowed pointer option so interactivity survives behind pointer-events-none
  content, a hidden-tab render pause, and a WebGL-failure callback. Static
  config arrays are hoisted to module scope and the error callback is memoized
  so the WebGL effect is not recreated on parent renders.
- The background is decorative (`aria-hidden`, `pointer-events-none`, `-z-50`),
  behind all content with no horizontal overflow. Reduced motion and
  unavailable/lost WebGL both fall back to a static dark gradient in the
  `#09090b`/`#e945f5`/`#6f6f6f` family; no raw WebGL error is surfaced. The
  vendored component's existing cleanup (RAF cancel, ResizeObserver disconnect,
  listener removal, geometry/material/renderer dispose, `forceContextLoss`,
  canvas removal, DPR cap ≤2) was kept intact.
- No token changes were needed — both themes were already fully defined. Added
  `three@^0.180.0` and `@types/three`.
- Verification: frontend Vitest 21/21 (8 new — toggle label/switch/keyboard and
  background light/dark/reduced-motion/no-WebGL/decorative), frontend TypeScript
  check, ESLint on every changed/new file, and the production build. Live
  browser (Playwright): toggle sits beside the language switcher in the header,
  theme switches with no reload, light mode shows 0 canvases and dark shows
  exactly 1, the theme persists across navigation and refresh, the canvas count
  tracked the theme across five toggles without leaking, the background is
  `pointer-events:none` at `z-index:-50` with foreground controls clickable
  above it, and there is no horizontal overflow.
- Pre-existing tooling debt, unchanged: the root `npm run lint` fails because
  the frontend script calls the removed Next 16 `next lint`, so linting was run
  per file with `npx eslint`. The only browser console errors were
  `ERR_CONNECTION_REFUSED` to the API (intentionally stopped) — no theme or
  hydration errors.
- Deliberately not done, pending approval: the NEAT hook/constant
  (`useNeatGradient.ts`, `neat-gradient.constant.ts`) and the `@firecms/neat`
  dependency are now unused by the background, and the unused `GalaxyBackground`
  remains — all left in place rather than deleted without asking. Authenticated
  dashboard surfaces were not visually QA'd in light mode because the API was
  down; they use the same semantic tokens.

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

### 2026-07-23 — Professional sidebar & Overview rebuild (Modify UI Phase 2) completed

- Implemented `context/features/modify-ui-ph2-spec.md` on
  `feature/professional-sidebar-overview`, merged to `main`. Scope held to the
  sidebar and the Overview page; Wishlist, My Learning Activities, and
  Certificates internals were not touched.
- Sidebar: removed the `courses` ("My Courses") and `external-learning`
  ("External Learning") entries from `professionalDashboardTabs` in
  `utils/dashboard-nav.config.ts`. Both the desktop `DashboardSidebar` and mobile
  `DashboardBottomNav` render from the same `getDashboardTabsByRole` source, so
  one edit covers both; no duplicate professional nav config exists. The
  underlying `?tab=courses` / `?tab=external-learning` shell handlers, queries,
  and backend are intact (URL-reachable). Flat list — no orphaned separators.
  Other roles unaffected; active highlighting and native `<Link>` keyboard nav
  preserved.
- Overview rebuilt (`ProfessionalOverviewTab.tsx`) into: three primary cards
  (CPD/PDU Progress, Learning Roadmap Progress, Upcoming Calendar Items) →
  Recommendations for You → Recent Learning Activities (2 cols) + Certificates
  (1 col). The old stat cards / PDU-over-time / by-category / snapshot / active
  courses layout was replaced.
- New self-contained card components under
  `components/modules/ProfessionalDashboard/parts/overview-*` — each owns its own
  RTK query and loading/empty/error/content state, so a partial API failure in
  one card cannot break the page (RTK returns errors as state, not throws). A
  shared `overview-card.tsx` provides the card frame plus loading/error/message
  states. Added a reusable `ProgressDonutChart` to `dashboard-charts.tsx` with a
  Recharts `<Tooltip>` (exact values + credit/step suffix), `role="img"`
  aria-label, and an always-visible text-equivalent summary line under each chart
  (covers keyboard/screen-reader use and "not color-only").
- Pure calculation logic lives in `utils/professional-overview.helper.ts`
  (framework-free, unit tested): CPD earned/remaining/% with zero & missing
  targets, >100% clamped arc + "exceeded by", no negative values; roadmap
  completed vs remaining steps with empty handling; nearest-first calendar
  sorting excluding past/cancelled with a day-count; certificate active /
  expiring-soon (30-day window) / nearest-expiry / recently-added; a
  section-state classifier; and a `PROFESSIONAL_OVERVIEW_LINKS` map.
- Data sources reused: `professionalOverview`, `myCpdPlans` + `cpdPlanProgress`,
  `professionalMyRoadmaps`, `professionalCalendarEvents` + `myCalendarEntries`,
  `courses` (recommendations, the existing recommendation API — kept, with
  enroll action + states preserved, no mock data), `professionalPduActivities`,
  `professionalCertificates`. Nav routes: `?tab=cpd-pdu-progress`, `?tab=roadmap`,
  `?tab=calendar`, `?tab=cpd-pdu-tracker` (My Learning Activities),
  `?tab=certificates`.
- Certificates card is read-only against the existing (seed-only)
  `professionalCertificates` query — no hardcoded counts; empty/error states
  cover the not-yet-writable model gracefully, ready to consume a fuller
  Certificate API in a later phase.
- Added `en`/`fr` keys under `professionalDashboard.overview` (cpdCard,
  roadmapCard, calendarCard, activitiesCard, certificatesCard, states,
  recommendations empty).
- Verification: frontend Vitest 47/47 (26 new across
  `dashboard-nav.config.test.ts` and `professional-overview.helper.test.ts` —
  sidebar removal + other-roles-unaffected; CPD zero/missing/>100%/negatives;
  roadmap incl. empty; calendar sorting + past/cancelled exclusion + limit;
  certificate expiring-soon; section states; nav links), frontend `tsc --noEmit`
  clean, ESLint clean on all changed/new files, and the production build passed.
- Not done: live authenticated browser QA (needs the API up plus a seeded
  Professional account); structure verified but not exercised against real data.
  Pre-existing tooling debt unchanged: root `npm run lint` still fails on the
  removed Next 16 `next lint`, so linting was per-file.
- Left in place rather than deleted without asking (now orphaned by the rebuild):
  `hooks/useProfessionalOverviewTab.ts`, and possibly the `DashboardStatCard` /
  `SnapshotRow` parts.

### 2026-07-23 — Simplify Professional Wishlist filters (Modify UI Phase 3) completed

- Implemented `context/features/modify-ui-ph3-spec.md` on
  `chore/wishlist-filter-simplify`, merged to `main`. Scope held to the Wishlist
  tab; Overview, My Learning Activities, and Certificates untouched.
- Removed four filters — price, "Only Rated Items", "Only Available Links", and
  "Select by Category" — from the filter panel, the saved local filter state
  (`TProfessionalWishlistFilters`), the initial defaults, the active-filter
  derivation (`hasActiveFilters`), the reset behavior, and the GraphQL request
  input. Confirmed no app-code references remain (only the new test's negative
  assertions and the generated schema type).
- The spec's mobile-drawer / active-chips / URL-query-param targets were genuine
  no-ops here, as the Phase-1 audit predicted: Wishlist filters are pure
  `useState` mapped to GraphQL variables in one responsive panel, and the tab
  never reads the URL — so old bookmarked `?price=…`/`?category=…` links cannot
  break the page (guarantee already held; documented, no code needed). The
  `{count} items` badge is an item count, not a filter-count indicator, so it
  was correctly left alone.
- Preserved: search, content-type, and sort filters (including the price/rating
  *sorts*, which are sorting not filtering), pagination, loading/empty/
  no-results/error states, the remove-item action, refresh, and the responsive
  layout. "Clear Filters" still resets to the trimmed initial state and only
  appears when a remaining filter is active.
- Extracted the filter logic into a pure, unit-tested
  `utils/wishlist-filters.helper.ts` (`WISHLIST_INITIAL_FILTERS`,
  `buildWishlistQueryInput`, `hasActiveWishlistFilters`) so the removed
  parameters can never leak back into an API request. A formatter/dedup pass
  also replaced the hook's inlined debounce with the shared
  `@/hooks/useDebounced` `useDebouncedValue` (behaviorally identical, already
  unit-tested) — a net removal of duplication.
- Cleanup: deleted the now-unused `TProfessionalWishlistPriceFilter` type, the
  `priceOptions` constant, the `Switch` / `WishlistPriceFilter` / `priceOptions`
  imports, the `categories` value from the hook, the empty price/switch grid
  section, and the orphaned wishlist i18n keys in `en.json`/`fr.json`
  (`category`, `allCategories`, `price`, `onlyWithRating(+Hint)`,
  `onlyWithUrl(+Hint)`), with `filtersDescription` reworded.
- Backend intentionally untouched: the four params are Wishlist-exclusive but
  remain optional on `MyWishlistInput` server-side, so omitting them from the
  frontend request is safe and needs no schema/codegen churn — the conservative
  reading of the spec's backend-caution rule.
- Verification: frontend Vitest 56/56 (9 new in
  `wishlist-filters.helper.test.ts` — initial-filter shape, built input excludes
  every removed key, remaining filters pass through, empty search / "ALL" content
  type omitted, and `hasActiveWishlistFilters` for search/content-type/sort incl.
  whitespace-only search), frontend `tsc --noEmit` clean, ESLint clean on all
  changed files, and the production build passed. Re-verified green after an
  external formatter reformat touched the hook's imports.
- Item cards still display price/rating badges (that is content display, not a
  filter, and out of scope). `filtersTitle` still reads "Advanced filters" — left
  as-is (cosmetic only). Pre-existing dead wishlist helpers in
  `function-helper.ts` (`getContentPrice` etc.) were already unused before this
  phase and were left untouched as out-of-scope. Root `npm run lint` still fails
  on the removed Next 16 `next lint`, so lint was per-file.

### 2026-07-24 — My Learning Activities page restructure (Modify UI Phase 4) completed

- Implemented `context/features/modify-ui-ph4-spec.md` on
  `feature/learning-activities-restructure`, merged to `main`. Scope held to the
  CPD/PDU Tracker tab (= "My Learning Activities"); Overview, Wishlist, and
  Certificates untouched. First full-stack modify-ui phase.
- Removed from the page: Export CSV button, the top Year `<Input>`, the four PDU
  MetricCards (Total PDU Earned / Target / Progress to Goal / Average per Month),
  and the Quick Actions card — plus the now-dead hook state/calcs (`exportCsv`,
  `year`/`handleYearChange`, target dialog + `handleTargetSubmit`, the metric
  math). CSV elsewhere preserved: `CsvCell` stays because `utils/cpd-summary.ts`
  (CPD Progress tab's "Generate CPD Summary") still uses it; Provider CSV
  separate.
- Primary actions kept: Refresh (refetches report + activities + summary, spinner
  + disabled while fetching) and Add Learning Activity, side-by-side, responsive.
  The Year control effectively moved from beside Refresh into the toolbar.
- Two new summary cards backed by a **new user-scoped backend query**
  `professionalPduActivitySummary` (no existing aggregate covered evidence-file
  counts): `completedActivities` (completed + not-rejected), `activitiesWithEvidence`,
  and `evidenceFilesCount` (from `PDUActivityFile`, no double-count). All counts
  scoped to `userId`; documented that rejected are excluded and completed requires
  `completionStatus = COMPLETED`. Skeleton + `isSummaryError` "—" fallback that
  never breaks the page.
- Toolbar (`activities-filters.tsx`): debounced search (existing
  `useDebouncedValue`), Year select (drives both table `reportingYear` and the
  report/charts `year`), Type select (options from the `PduSource` backend enum),
  Certificate select (Any/Has/No → `hasCertificate` evidence presence, kept as a
  typed `TPduActivityCertificateFilter` union since activities have no
  `Certificate` relation), and Clear Filters when active. Pagination resets on
  every filter change. No URL params (consistent with Phases 2–3; verified). All
  three filters were **already supported by the backend where-clause, scoped to
  the user** — no backend filter change needed.
- Table row actions replaced with icon-only View (eye) / Edit (pencil) / Delete
  (trash): real `<button>`s (shadcn `@ui/tooltip` + `aria-label` + visible
  `focus-visible` ring + `aria-hidden` icons), disabled during any active delete,
  `ConfirmDialog` kept, double-delete prevented by a per-row `deletingActivityId`
  guard in the hook.
- View route: `/dashboard/professional?tab=activity-detail&id=<id>` (existing
  `?tab=` convention; id only, no sensitive data). Backend ownership already
  enforced by `findOwnedActivity` (`professionalPduActivity`). Added
  `activity-detail` to the tab type + shell `validTabs` + a minimal
  `ProfessionalActivityDetailTab` placeholder so the eye icon resolves instead of
  falling back to Overview — the **full detail page is Phase 5**.
- Charts (PDUs by Category, then PDUs Over Time) moved below the table; same
  implementations, single year-scoped report query (no duplicate fetching),
  skeleton + no-data states preserved. Final order: title/actions → 2 summary
  cards → toolbar + table → by-category → over-time.
- Filter/summary logic extracted to pure, tested
  `utils/learning-activities.helper.ts` (`createActivityFilters`,
  `buildActivityYearOptions`, `ACTIVITY_TYPE_OPTIONS`, `buildActivityFilterInput`,
  `hasActiveActivityFilters`). Added `professionalPduActivitySummary` fragment +
  query to `professional.graphql`, RTK endpoint, and re-ran codegen against the
  live API (schema.gql regenerated).
- Known choice flagged at review: the table filters on the activity's
  `reportingYear` field while the charts use the report's date-window `year`, so
  an activity whose completion date and reporting year differ could sit in
  different years across the two views. Spec allows "consistent … where
  appropriate"; both are legitimate year reads. Summary cards are overall totals
  (not year-scoped), matching "Total Activities Completed & Logged".
- Verification: API Jest 83/83 (4 new — summary counts/scoping/forbidden + filter
  where-clause for year/type/certificate), frontend Vitest 68/68 (12 new in
  `learning-activities.helper.test.ts`), `tsc --noEmit` clean (both apps), ESLint
  clean on changed files, API + frontend production builds, codegen re-run.
  Re-verified green after an external formatter reformat.
- Not done: live authenticated browser QA (needs API up + a seeded Professional
  account). Root `npm run lint` still fails on the removed Next 16 `next lint`, so
  lint was per-file. The full Activity Details page is Phase 5.

### 2026-07-24 — Learning Activity Details page (Modify UI Phase 5) completed

- Implemented `context/features/modify-ui-ph5-spec.md` on
  `feature/learning-activity-details`, merged to `main`. Built the read-only
  Activity Details view that fills the `?tab=activity-detail&id=<id>` tab Phase 4
  reserved (the placeholder is gone). Scope held to the detail page; the CPD/PDU
  tracker was touched only to wire Cancel-filter preservation.
- Route: used the established `?tab=` convention on the single
  `dashboard/professional` route, not the spec's example
  `/professional/learning-activities/:activityId` (the spec explicitly allows the
  project's pattern). No new route file; the shell already dispatches
  `activity-detail` to `ProfessionalActivityDetailTab`.
- Data + authorization: reuses the existing `professionalPduActivity` query and
  `useProfessionalPduActivityQuery` (already exported). **No backend logic change
  was needed** — the service already asserts `PROFESSIONAL`/`ADMIN` then scopes
  `findFirst({ id, userId })` via `findOwnedActivity`, so a foreign or deleted
  activity returns 404 and only the id crosses the wire. Added backend tests only
  (owned lookup scoped by userId + includes evidence files; 404 on
  missing/deleted/foreign; forbidden before any lookup for non-professionals).
- New `useProfessionalActivityDetail` hook classifies states from the RTK error
  `status`: loading, not-found (404 — covers deleted/foreign), unauthorized
  (401/403, defensive — foreign activities are 404 by design so it's effectively
  unreachable), and generic (with a retry). A missing/blank `id` short-circuits
  to not-found and skips the query.
- Fields: `activity-detail-view.tsx` renders only real model fields grouped into
  Overview / CPD-PDU details / Description & notes / Evidence & attachments /
  Record — type, provider, completion date, reporting year, approval status
  (`PDUStatus`) + completion status, credit value/type, category, sub-category,
  issuing org, related certification, description, learning outcome, file notes,
  external evidence link, linked platform content (`contentType` badge, shown
  only when a `contentId` exists), created/updated timestamps. Deliberately
  omitted the spec's start/end dates, learning-format, and CPD-plan/certificate
  *relations* — none exist on the model (the "certificate" the UI has is evidence
  files + the `relatedCertification` text field). No invented/persisted fields.
- Evidence: rendered via the existing ownership-scoped credentialed download
  (`usePduEvidenceUpload.downloadEvidence`) — filename, MIME type, size
  (`formatFileSize`), upload date; per-file download button with spinner/disable
  during an active download; no storage keys/URLs exposed; preview intentionally
  not offered (not securely supported).
- Actions: **Cancel** returns to My Learning Activities preserving
  search/type/year/certificate filters **and** the cursor page. Implemented via a
  URL round-trip — the eye icon now encodes the live list state (incl. the cursor
  stack) into the detail URL, and the tracker hook seeds its filters/cursors/page
  from the URL once on mount (Phase 4's deliberate no-continuous-URL-sync choice
  preserved). **Edit** opens the existing add/edit form by id
  (`?tab=add-activity&id=`) — no second form. There is no sort control on the
  tracker, so "sort preservation" is N/A.
- Extracted list-state URL logic into pure, tested helpers in
  `utils/learning-activities.helper.ts` (`TActivityListState`,
  `readActivityListState`, `activityListStateToSearchParams`,
  `buildActivityDetailHref`, `buildTrackerReturnHref`, `buildActivityEditHref`),
  with enum/int validation so a hand-edited URL can't inject bad filter values.
- Accessibility/responsive: `dl`/`dt`/`dd` description lists, `sm:grid-cols-2`,
  `break-words`/`whitespace-pre-wrap`, evidence rows stack on mobile (no
  fixed-width table), aria-labels on downloads, visible focus rings,
  `rel="noopener noreferrer"` on the external link. i18n added under
  `cpdPduTracker.detail.*` (replacing the coming-soon placeholder keys) plus
  `cpdPduTracker.statuses.*` (APPROVED/PENDING/REJECTED) in en.json and fr.json.
- Verification: API `tsc` clean, `nest build` clean, Jest **86/86** (+3 —
  pduActivity owned/not-found/forbidden). Frontend `tsc` clean, `next build`
  clean, Vitest **77/77** (+9 — list-state decode/encode/round-trip + edit href),
  ESLint clean on all changed files, both i18n JSON validated. Re-verified green
  after an external formatter reformat touched the new files (stripped inline
  comments, switched the helper to `import * as T`).
- Not done: live authenticated browser QA (needs API up + a seeded Professional
  account) — structure verified, not exercised against real data. Root
  `npm run lint` still fails on the removed Next 16 `next lint`, so lint was
  per-file. STOP point reached: nothing beyond the Activity Details page was
  built.

### 2026-07-24 — Certificate backend foundation (Modify UI Phase 6) completed

- Implemented `context/features/modify-ui-ph6-spec.md` on
  `feature/certificate-backend-foundation`, merged to `main`. Backend-only:
  the Certificates dashboard UI was deliberately not built.

**1. Existing certificate functionality reused.** The spec asks to inspect
whether a `Certificate` *or* `ProfessionalCredential` entity already exists.
Both do, and they are different things. `ProfessionalCredential` is a
profile-section entity that links to `PDUTarget`, has no status and no evidence
files. `Certificate` is what the Certificates tab and the `professionalCertificates`
query actually read — seed-only and read-only per the Phase 1 audit. `Certificate`
was therefore extended rather than duplicated. The PDU-evidence stack (multer +
local-disk `storageKey` + ownership-scoped streaming + blob cleanup) was mirrored
for certificate evidence, and the existing `ProfessionalActionResponseEntity`,
`ProfessionalPaginationInput`, `ProfessionalSearchInput`, cursor pagination and
`@Roles` boundary were all reused.

**2. Data model.** Purely additive — no column dropped, renamed or made nullable.
`Certificate` gained `certificateNumber` (the optional free-text "Certification
ID", named to avoid collision with the `Certification` catalogue relation) and
`cpdPlanId` → `CPDPlan`. New `CertificateFile` model mirrors `PDUActivityFile`
(`fileName`, `storageKey`, `mimeType`, `sizeBytes`, `createdAt`, cascade on
certificate and user). `CertificateStatus` gained `EXPIRING_SOON`. Existing
`title`/`issuer`/`issuedAt`/`validUntil`/`status`/timestamps were reused as
name/issuer/issue date/expiry — no duplicate fields. `verificationCode` was
deliberately left required and is generated server-side (`USR-<uuid>`) for
user-created rows: making it nullable would have changed a non-null field the
frontend already selects.

**3. Database migration.** Two migrations, both applied to the live Neon database
and recorded; `migrate status` reports 12 applied and `migrate diff` reports an
empty migration (zero drift). `20260724120000_certificate_domain` adds the enum
value, the two columns, the `CertificateFile` table and the FKs.
`20260724130000_certificate_index_tuning` corrects the index set (see below).
`prisma migrate dev` could not be used: its shadow-database replay fails on the
pre-existing `20260713101500_professional_profile_redesign` migration
("column occupation does not exist"), unrelated to this work — so the SQL was
generated with `migrate diff`, applied with `db execute`, and recorded with
`migrate resolve`.

**4. Status rules.** Derived on read, never persisted, so it cannot go stale.
`utils/certificate-status.util.ts` computes `EXPIRED` (expiry before today),
`EXPIRING_SOON` (today through today+90 inclusive) and `ACTIVE` (beyond 90 days,
or no expiry) on UTC day boundaries, so time-of-day and caller timezone cannot
shift a result. A stored `REVOKED` still wins. `certificateStatusWhere` returns
the equivalent `validUntil` range so database filtering and displayed status can
never disagree; both sides share one `now` per request.

**5. APIs.** Queries `professionalCertificate`, `professionalCertificateSummary`
(total/active/expiringSoon/expired) and `professionalCertificateOptions`
(certificates eligible for activity filtering, capped at 200); mutations
`createProfessionalCertificate`, `updateProfessionalCertificate`,
`deleteProfessionalCertificate` and `setProfessionalCertificateCpdPlan` (a null
plan id unlinks). The existing `professionalCertificates` query kept its exact
signature and gained optional `status` and `sort` arguments, so the frontend's
query and fragment stayed valid — verified in the regenerated `schema.gql`.
Pagination, sorting (recent/oldest/expiry-soonest/name), status filtering and
search over title, issuer and certificate number are all supported.

**6. File storage and download.** Evidence upload/download/delete live on
`professional/certificates` REST routes, matching the PDU controller. Uploads
validate MIME+extension pairing, per-file size (20 MB), empty files, the
per-certificate count, and certificate ownership; storage names are generated
server-side as `<uuid><ext>` and every path is re-resolved and checked to stay
inside the upload directory. Only metadata is stored in the database; storage
keys are never exposed through GraphQL. Download streams the file after
verifying the file row belongs to the authenticated user. Deleting a certificate
cascades the file rows and best-effort removes the blobs.

**7. CPD plan linking.** Optional, verified against `CPDPlan` scoped to the
authenticated user before any link, and rejected as
`CERTIFICATE_CPD_PLAN_NOT_FOUND` otherwise. `onDelete: SetNull` means deleting
the plan only clears the link, and deleting a certificate never touches the plan.
Unlink is supported by passing a null plan id. Plan linking is intentionally
absent from the update input (and proven so by test), so the ambiguity between
"field omitted" and "explicitly cleared" cannot arise.

**8. Authorization protections.** Identity always comes from the authenticated
session; no client-supplied user id is trusted anywhere. Every read and write
resolves through `findFirst({ id, userId })` or a `userId`-scoped count, so a
foreign certificate is a 404 rather than a leak. `@Roles(PROFESSIONAL, ADMIN)`
guards the resolver and controller, and each service method re-asserts the role
before touching the database. Cross-user view, edit, download, link and delete
are each covered by a test.

**9. Tests executed and results.** API Jest **132/132, 17 suites** (up from
86/13 — 46 new across three new suites plus a DTO suite). Covers create with and
without optional fields, required-field and date validation, expiry-before-issue,
all three statuses and the exact 90-day boundary, the UTC day-boundary rule,
REVOKED override, CPD plan ownership on both create and link, unlink without an
ownership check, file type/empty/limit validation, secure download, path
traversal, evidence replacement, blob cleanup, list filters, search, sort,
update field scoping and unauthorized access. Also run: `prisma validate`,
`migrate status`, zero-drift `migrate diff`, API `tsc --noEmit`, `nest build`,
frontend `tsc --noEmit` and `next build`.

**10. Work remaining for the frontend.** Nothing in `apps/front` was built. The
Certificates tab is still the Phase 2 read-only card. A later phase needs: the
certificates list with search/status/sort/pagination wired to the new arguments;
create and edit forms; a detail view; the evidence uploader and download button
against the REST routes (mirroring `usePduEvidenceUpload`); the summary counts;
the CPD-plan selector using `professionalCertificateOptions` and
`setProfessionalCertificateCpdPlan`; delete confirmation; status badges for
`EXPIRING_SOON`; new `.graphql` documents and RTK endpoints; and en/fr i18n keys.
The generated frontend types were refreshed so the new schema is already
available to that work.

- Known limitation, flagged at review and unresolved by design: certificate
  creation is GraphQL while evidence upload is multipart REST — the two-transport
  pattern this phase was told to reuse — so the spec's "Evidence File required"
  cannot be enforced atomically at create. The backend validates every uploaded
  file strictly; requiring one belongs to the frontend create flow.
- Review corrected one of its own findings: trigram GIN indexes were first
  recommended for the name/issuer search, then rejected on closer analysis
  because certificate reads are always narrowed by owner first, making per-user
  cardinality tiny and three GIN indexes pure write overhead. The second
  migration instead drops the standalone `title`/`issuer`/`validUntil` btree
  indexes — which could never serve an `ILIKE` `contains` search — and adds the
  composite `(userId, validUntil)` that status filtering and the summary counts
  actually use.
- Two other review findings fixed: `professionalCertificateOptions` was unbounded
  and is now capped, and the missing DTO-validation and evidence-replacement
  tests were added.
- Tooling notes: `prisma generate` was blocked for much of the phase by a running
  API server (`apps/api/dist/src/main`) holding the Windows query-engine DLL.
  It was generated with `--no-engine` to unblock type-checking, then fully
  regenerated with the engine once the process was stopped, and the API was
  booted to confirm the engine works and to regenerate `schema.gql`.
- Not done: live authenticated QA of the new endpoints against seeded data — the
  API was booted only to regenerate the schema, and no certificate was created,
  uploaded or downloaded end to end. Root `npm run lint` still fails on the
  removed Next 16 `next lint`, and the API workspace still has no ESLint 9 flat
  config, so no lint gate was run for this phase. `context/features/auth-flow-chart.svg`
  was left untracked and uncommitted — it is unrelated to this work.

### 2026-07-24 — Professional Certificates tab (Modify UI Phase 7) completed

- Implemented `context/features/modify-ui-ph7-spec.md` on
  `feature/professional-certificates-tab`, merged to `main`. Builds the
  Certificates dashboard UI that Phase 6 deliberately left unbuilt, closing the
  headline gap the Phase 1 audit identified.

**1. Certificate navigation.** The sidebar item already existed and is
role-scoped, single, and rendered by the shared `getDashboardTabsByRole` source
for both `DashboardSidebar` and `DashboardBottomNav` — no duplicate was added.
What was missing is an active state for the new form sub-tab, so
`DASHBOARD_TAB_PARENTS` + `isDashboardTabActive` were added to
`dashboard-nav.config.ts` and used by both navs: `?tab=certificate-form` keeps
**Certificates** highlighted. Verified live that exactly one nav item is active
on the form screen. Only `certificate-form` is mapped; the pre-existing
`add-activity` / `activity-detail` sub-tabs have the same gap and were left
alone as out of scope.

**2. Summary cards.** Three responsive cards driven entirely by
`professionalCertificateSummary` — no hardcoded numbers. Active certificates,
Expiring soon (count + nearest expiry), and an Active / Expiring soon / Expired /
Total status breakdown. A failed summary degrades to an em dash per figure and
never blanks the page, because the table runs on its own query.

**3. "Link All Active" → "View All Active".** Taken by inspection, as the spec
requires. Bulk linking is not supported by the domain model: Phase 6 added only
the single-certificate `setProfessionalCertificateCpdPlan` mutation, and the
Phase 1 audit had already flagged the action as having no target semantics.
Looping that mutation from the browser would be non-atomic, unbounded and
partially-failing — misleading behaviour the spec explicitly forbids inventing.
The card therefore filters the table to `ACTIVE`, matching "View Expiring" and
"View All Certificates".

**4. Upload and edit forms.** One `CertificateFormFields` component serves both,
rendered by a new `ProfessionalCertificateFormTab` at
`?tab=certificate-form[&id=]` (the established `?tab=` convention, not a new
route segment). Fields: Certificate/Licence, Issuer, Certification ID
(optional), Issue date, Expiry date, Linked CPD plan (optional, from
`myCpdPlans`, with loading and no-plans states) and Evidence file. `Cancel` uses
the existing `ConfirmDialog` unsaved-changes pattern; `isSaving` blocks
duplicate submission. Edit loads existing data, shows the stored evidence
filename, and allows keeping, removing or replacing it. Plan link/unlink goes
through the separate mutation and only fires when the value actually changed, so
"omitted" can never be confused with "cleared". The evidence uploader is the
existing `ActivityEvidenceUpload` component reused as-is — its limits (5 files,
20 MB, same MIME set) are identical to the certificate rules — with its props
widened to a structural `TEvidenceFileLike` so both file models fit.

**5. Table and filters.** Toolbar: debounced search (existing
`useDebouncedValue`), Status, Issuer, Linked CPD plan, Sort, and Clear Filters
when anything is active. Pagination resets on every filter change, and filter +
cursor + selection state round-trips through the URL so the form can return the
user exactly where they were. Table columns are Certificate/Licence, Issuer,
Issue date, Expiry date, Status, Linked to and Actions, with cursor pagination
and four sort orders. Status is never colour-only: each badge carries an icon and
the translated status name. Row actions are icon-only Edit and Delete with
tooltips, `aria-label`s and visible focus rings; Delete goes through
`ConfirmDialog` and a per-row guard prevents a double delete.

**6. Detail card.** Selecting a row shows the certificate beside the table from
`xl` up and below it on smaller screens (the grid collapses; no separate mobile
implementation). It lists name, issuer, certification ID, issue date, expiry,
status, linked plan, evidence filename, upload date, and created/updated
timestamps. It is derived from the list query, so an edit refreshes it through
the same tag invalidation that refreshes the table. A certificate deleted while
selected gets its own distinct message rather than silently emptying.

**7. Download.** `useCertificateEvidence.downloadEvidence` streams from the
authenticated REST route with `credentials: "include"`, keeps the original
filename, and hands the browser a revoked object URL, so no private storage
location is ever exposed. `CertificateFileError` distinguishes unauthorized,
missing/deleted and generic failures, each with its own message. Nothing is
generated or fabricated; when a certificate has no evidence the button is
disabled and the card says so.

**8. Cross-page query invalidation.** Every certificate write invalidates
`CERTIFICATE_TAGS` (`ProfessionalCertificates`, `ProfessionalOverview`,
`ProfessionalCpdPlan`, `Professional`), which covers the summary cards, the
table, the issuer options and the Overview Certificates card. The spec also
lists the My Learning Activities certificate filter; that filter reads PDU
**evidence-file presence**, not `Certificate` rows (Phase 4's own note), so it
has no dependency on this data and is deliberately not invalidated rather than
given a pointless refetch.

**9. Files.** New: `ProfessionalCertificateFormTab.tsx`; parts
`certificate-summary-cards`, `certificates-filters`, `certificates-table`,
`certificate-detail-card`, `certificate-status-badge`, `certificate-form-fields`;
hooks `useCertificateEvidence`, `useProfessionalCertificateForm`;
`utils/certificate.constant.ts`, `utils/certificates.helper.ts`,
`lib/validations/certificate.schema.ts` and two test files. Modified:
`ProfessionalCertificatesTab.tsx`, `useProfessionalCertificate.ts`,
`professional-dashboard-shell.tsx`, `dashboard-nav.config.ts`, both nav parts,
`professional-dashboard.types.ts`, `professional.api.ts`, `professional.graphql`,
`generated.ts`, `en.json`/`fr.json`; API certificate resolver, service, entity,
types, constants, gql-names and service spec; `schema.gql`.

**10. Tests executed and results.** API Jest **143/143, 17 suites** (up from
132 — 11 new: issuer/plan/unlinked filter where-clauses, user scoping, forbidden
callers, the distinct-issuer query, and the owner-wide nearest-expiry read).
Frontend Vitest **112/112** (up from 77 — 35 new across
`certificates.helper.test.ts` and `certificate.schema.test.ts`: filter defaults,
built request variables incl. the unlinked sentinel, URL encode/decode round
trip with hand-edited-value rejection, navigation hrefs, issuer options, and
every form rule incl. expiry-before-issue, required evidence, file type/size/
empty/limit). Also run: both `tsc --noEmit`, both production builds, ESLint on
every changed frontend file, codegen, `prisma validate` and `migrate status`
(12 applied, no drift). Live against the running API and Neon database: created
a certificate, exercised the issuer/plan/status/sort/search filters, uploaded
evidence, downloaded it (200 owner, **401 anonymous, 404 cross-user**), proved
cross-user read/delete/download are all refused, changed the expiry and watched
status recalculate `ACTIVE` → `EXPIRING_SOON`, then deleted everything and
confirmed the summary, issuer list and upload directory returned to their
starting state. Live browser (Playwright): the tab renders real seeded data,
summary counts and async issuer options load, "View Expiring" filters to a
distinct no-results state, row selection fills the detail card, and the form
shows all five required-field errors plus both cross-field rules.

- **Scope note — this phase was framed frontend-only but touched the backend.**
  The spec names Issuer and Linked-CPD-Plan filters, and Phase 6 supported
  neither; filtering a server-paginated list in the browser would only filter the
  current page, which is a defect rather than a feature. Three optional
  `professionalCertificates` arguments (`issuer`, `cpdPlanId`, `unlinkedOnly`)
  and a `professionalCertificateIssuers` query were added instead. A later review
  added `nearestExpiry` to the summary for the same reason — the card was pairing
  a global count with a page-local date and could render "Expiring soon: 0"
  beside a real expiry date. All additions are additive, `userId`-scoped and
  tested; **no Prisma schema or migration change**. Raised at review and
  approved.
- Review found and fixed three defects: an external formatter pass had relocated
  a props type and rewritten an API import, leaving five compile errors; the
  summary card mixed global and page-local scopes (fixed at the source rather
  than by relabelling); and row selection used `aria-selected` on a plain table
  row while a focusable row swallowed Enter from the buttons inside it, with the
  mobile card nesting real buttons in a `role="button"` div. Selection is now a
  real `<button aria-pressed>` on the certificate name in both layouts.
- Deliberate omissions, both allowed by the spec's own wording: no separate
  expiry-period filter (Status already offers Expiring soon and Expired — "where
  useful"), and no Issuer *text* filter beyond the select, because §6's search
  requirement already covers issuer.
- Known limitation carried from Phase 6 and still unresolved by design: creation
  is GraphQL while evidence upload is multipart REST, so "Evidence file required"
  is enforced by the form's Zod schema, not atomically at the API. If the upload
  fails after the certificate is created, the user is told the certificate saved
  but the file did not, instead of being shown a false success.
- **Not done:** the create flow was never submitted end to end *through the
  browser form* — live QA reached validation and file selection, and the same
  path is fully proven at the API layer, but the final submit click was not
  performed. Worth exercising once by hand. Root `npm run lint` still fails on
  the removed Next 16 `next lint`, so lint was per-file, and the API workspace
  still has no ESLint 9 flat config.

### 2026-07-24 — Professional Dashboard end-to-end review (Modify UI Phase 8) completed

- Implemented `context/features/modify-ui-ph8-spec.md` on
  `chore/professional-dashboard-e2e-review`, merged to `main`. Closing review of
  the seven-phase effort. Two defects found and fixed, both introduced by
  Phase 7; everything else verified and left alone.

**1. Sidebar changes.** Verified, no change needed. `courses` and
`external-learning` are absent from `professionalDashboardTabs`, which leaves ten
entries. Desktop `DashboardSidebar` and mobile `DashboardBottomNav` both render
from the single `getDashboardTabsByRole` source and now share one
`isDashboardTabActive` helper, so they cannot drift. Provider, Organization and
Admin lists are untouched (8/7/5 entries). Both removed tabs remain in the shell's
`validTabs` and still resolve by URL, so no link anywhere is broken and no empty
section is left behind. `dashboard-nav.config.test.ts` already pins the removal
and the other-roles guarantee.

**2. Overview changes.** Verified, no change needed. Seven card components under
`parts/overview-*`, each owning a distinct RTK query — certificates, CPD plans +
plan progress, roadmaps, calendar events + entries, courses, PDU activities — so
no card refetches another's data. Charts carry `role="img"` with a translated
`aria-label`, a Recharts `<Tooltip>`, a visible `centerLabel`, and a text summary
line plus a `dl`/`dd` breakdown beneath, so nothing is conveyed by the graphic
alone. Each card classifies its own loading/empty/error state, so one failing
query cannot blank the page.

**3. Wishlist changes.** Verified, no change needed. The filter state is exactly
`{ search, contentType, sortBy }` — price, only-rated, only-available-links and
category are gone from the state, the helper and the request. The tab never reads
`useSearchParams`, so legacy `?price=` / `?category=` links are inert rather than
broken. The remaining `price` and `category` references in the tab are item-card
*display* (a category badge and a price label), which is content, not filtering.

**4. My Learning Activities changes.** Verified, no change needed. Export CSV,
`exportCsv`, the top-level Year control, `handleYearChange`, the old PDU metric
cards and the Quick Actions card are all absent. Exactly two `MetricCard` usages
remain, and they are the new completed-activities and evidence summary cards.
Page order is title/actions → summary cards → toolbar + table → PDUs by Category
→ PDUs Over Time. Row actions are real buttons with `aria-label`, tooltip,
`focus-visible` ring and `aria-hidden` icons. Filter preservation on the return
trip from details is covered by the Phase 5 helper tests.

**5. Activity Details implementation.** Verified, no change needed. Reached at
`?tab=activity-detail&id=`, backed by the existing ownership-scoped
`professionalPduActivity` query, with Cancel restoring filters and the cursor page
through the URL round trip and Edit reusing the add/edit form.

**6. Certificate data model.** Unchanged this phase and confirmed sound:
`Certificate` extended additively with `certificateNumber` and `cpdPlanId`, plus a
`CertificateFile` model mirroring `PDUActivityFile`. `prisma validate` passes,
`migrate status` reports 12 applied and up to date, and `migrate diff` reports no
difference — zero drift.

**7. Certificate status rules — the exact boundary, in UTC.** Status is derived on
read and never persisted. Proven twice, by unit test and live against the
configured Neon database, at all seven offsets the specification lists:

| Offset from today (UTC) | Status |
| --- | --- |
| −1 day | `EXPIRED` |
| 0 (today) | `EXPIRING_SOON` |
| +1 day | `EXPIRING_SOON` |
| +7 days | `EXPIRING_SOON` |
| +89 days | `EXPIRING_SOON` |
| **+90 days** | **`EXPIRING_SOON`** (last day in the window) |
| **+91 days** | **`ACTIVE`** (first day outside it) |

So: `EXPIRED` below today, `EXPIRING_SOON` from today through today+90
**inclusive**, `ACTIVE` from today+91 or when there is no expiry; a stored
`REVOKED` still wins. Live, the status filter partitioned all twelve certificates
into exactly one bucket each (1 expired + 5 expiring + 6 active = 12), and
`nearestExpiry` returned the day-0 certificate.
Added the missing +1/+7/+89 cases and, more importantly, a property test that was
absent: the displayed status normalises `validUntil` to a UTC day while
`certificateStatusWhere` compares the raw timestamp against day-aligned bounds.
That equivalence is the whole "badge and database can never disagree" guarantee
and nothing asserted it. It now holds for every offset at midnight, 00:01, midday
and 23:59:59.999.

**8. Certificate upload and storage.** Verified live. Uploads go to the
`professional/certificates` REST routes; storage names are server-generated
`<uuid><ext>` under the configurable upload directory, and only metadata reaches
the database. Rejected as expected: a `.txt`/`text/plain` file and an `.exe`
payload claiming `application/pdf` (both `CERTIFICATE_FILE_INVALID_TYPE`), an
empty file (`CERTIFICATE_FILE_EMPTY`), and a 21 MB file (413). A filename of
`../../../../evil.pdf` was stored as the basename `evil.pdf` in metadata only;
the on-disk name was a UUID and a filesystem search confirmed nothing was written
outside the upload directory.

**9. Secure download behavior.** Verified live: owner 200 with
`application/pdf`, a different Professional 404, anonymous 401, cross-user delete
404 and cross-user upload into someone else's certificate 404. The file streams
through `StreamableFile(createReadStream(...))` rather than being read into
memory. `storageKey` is absent from the `ProfessionalCertificateFile` GraphQL
type, so no private storage location is exposed.

**10. CPD plan linking.** Verified live with a plan created for a second
professional: linking it to the first user's certificate was refused with
`CERTIFICATE_CPD_PLAN_NOT_FOUND`, and so was creating a certificate that named it
— ownership is checked on both paths, not just one.

**11. Authorization protections.** Cross-user access refused on every surface
tested: certificate read, delete, upload, download, and activity read. No
Professional GraphQL input accepts a `userId` — the only three inputs that do are
Admin-only, which is correct. Every professional resolver and controller takes
identity from `@CurrentUser()`.

**12. Accessibility improvements.** One real defect found and fixed: the
certificate form's "Evidence file" `<label for>` pointed at
`_r_v_-form-item`, an id no element carried. shadcn's `FormLabel` emits
`htmlFor={formItemId}` and relies on a `FormControl` to place that id on a
control, but the uploader is a composite (a button plus a file list) with no
single control, so the association dangled. Replaced with
`role="group"` + `aria-labelledby` pointing at a heading, which is the correct
pattern for a composite. Verified in the browser: zero dangling labels remain and
the group name resolves. Everything else held — icon-only buttons in both tables
carry `aria-label`, a keyboard-reachable shadcn tooltip, a visible focus ring and
`aria-hidden` icons; `ConfirmDialog` is a Radix `AlertDialog`, which manages
focus; charts have text equivalents; certificate status is icon + text, never
colour alone.

**13. Tests executed and results.** API Jest **157/157, 17 suites** (up from 143;
14 new boundary and equivalence cases). Frontend Vitest **112/112, 11 files**.
Also executed successfully: `tsc --noEmit` for both apps, `nest build`,
`next build`, ESLint on the changed frontend files, `prisma validate`,
`prisma migrate status`, a zero-drift `prisma migrate diff`, and
`git diff --check`. Live exercises against the running API and Neon database are
listed in sections 7–11; every probe record (7 boundary certificates, a CPD plan,
and the uploaded evidence) was deleted afterwards and the summary, issuer list and
upload directory were confirmed back to their starting state.

**14. Pre-existing failures.** All three were run and confirmed, none caused by
this work and none fixed here:
- `npm run lint` at the root fails because the frontend script calls `next lint`,
  removed in Next 16. Linting was done per file with `npx eslint`.
- `npx eslint src` in `apps/api` exits 2 — the workspace still has no ESLint 9
  flat config.
- `npm run test:e2e --workspace api` fails because it points at
  `./test/jest-e2e.json` and `apps/api/test` has never existed.
Could not be executed: `check-types` — Turbo declares the task but no workspace
defines the script.

**15. Required environment or storage configuration.** `DATABASE_URL` must be
present for any Prisma command (they fail with P1012 without it; the repository's
`apps/api/.env` supplies it). Certificate evidence is stored on local disk at
`CERTIFICATE_UPLOAD_DIR`, defaulting to `<cwd>/uploads/certificate`, with PDU
evidence in its own directory — both need to be writable and, in any real
deployment, persistent and backed up, since the database stores only metadata.
`NEXT_PUBLIC_GRAPHQL_URL` drives both the frontend GraphQL client and the derived
REST origin used for evidence upload and download, so the two must stay on the
same host.

**16. Remaining assumptions and limitations.**
- **Not done: the certificate create flow was never submitted end to end through
  the browser form.** The run was stopped twice and the browser session expired
  partway through. The same path is proven at the API layer (create → upload →
  download → delete) and the form's validation was verified live, but the final
  submit click through the UI remains unexercised. This is the one item carried
  over from Phase 7 and it is still open.
- Evidence is served from local disk rather than signed object-storage URLs. That
  is the established project pattern, but it ties the API to a stateful volume.
- Certificate creation is GraphQL while evidence upload is multipart REST, so a
  failed upload leaves a saved certificate. The UI reports that honestly instead
  of showing a false success, but the two cannot be made atomic without changing
  the transport.
- Phase 4's known year mismatch stands by design: the activities table filters on
  the activity's `reportingYear` while the charts use the report's date window.
- Cosmetic, left alone as out of scope: the "Add Learning Activity" button still
  reads from the `quickActions.*` i18n namespace after that card was removed, and
  Recharts logs `width(-1) height(-1)` warnings for charts rendered into
  zero-size containers on Overview.
- Orphaned code earlier phases deliberately left rather than deleting without
  approval, still present and still unused: `hooks/useProfessionalOverviewTab.ts`,
  the `DashboardStatCard` / `SnapshotRow` parts, `useNeatGradient.ts` +
  `neat-gradient.constant.ts` + the `@firecms/neat` dependency,
  `GalaxyBackground`, `Auth/OAuthBridgeClient.tsx`, and the dead wishlist helpers
  in `function-helper.ts`. Worth a dedicated cleanup pass.
