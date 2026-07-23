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
