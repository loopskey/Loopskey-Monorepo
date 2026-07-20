# Current Feature: Organization Approval Workflow — Phase 2 (Application Submission Planning)

Plan the Organization application submission workflow only. Admin
approval/rejection, account activation, email delivery, and the mandatory
password-change flow are explicitly out of scope for this phase.

## Status

Specification prepared; implementation has not started. The phase 1 audit and
phase 2–7 specification commit are merged into `main`.
Scope decisions: backend (Jest) tests only, frontend Vitest harness deferred.

## Goals

- Deliver the submission flow end to end: applicant opens the existing form →
  completes required fields → clicks Submit Request → frontend validates →
  backend validates and stores → the record gets its backend-assigned submitted
  status → the applicant sees clear confirmation that the request is awaiting
  Admin review. No active Organization account is created.
- Harden the form against the specific failure modes the spec names: required
  fields marked, field-level validation messages, organizational email
  validated, submit disabled while in flight, double-click cannot submit twice,
  form values preserved on recoverable errors, backend errors surfaced clearly,
  responsive and accessible.
- Confirm or complete the backend record: organization name, organizational
  email, contact person and contact details, organization details, status, and
  the created/updated timestamps. Add no field that an existing field already
  covers.
- Keep workflow status server-controlled. The frontend must not be able to set
  or influence the stored status; the backend assigns the initial value.
- Strengthen duplicate-application prevention beyond a bare email match where
  the existing identifiers allow it, and return a clear business error rather
  than writing a second pending record.
- Enforce the security rules: all validation server-side; never trust
  client-supplied role, status, user ID, or organization ID; no active
  Organization user before approval; no cross-applicant data exposure; no
  Admin-only fields leaked; no password stored on the application record.
- Add tests for required-field validation, invalid email, successful
  submission, initial status, duplicate prevention, double-click protection,
  backend validation, and unauthorized access to protected application data.
- Run frontend tests, backend tests, TypeScript checks, lint, migration
  validation, and a production build. Fix only errors this phase introduces.
- Produce the 9-part completion report: implementation reused, files modified,
  files created, database changes, API changes, validation added, duplicate
  prevention behavior, tests and results, remaining work for phase 3.

## Notes

- Source spec: `context/features/email-org-submit2-spec.md` (phase 2 of 7).
  Phase 1 audit findings are in `context/features/email-org-submit1-audit.md`
  and should be treated as the starting map.
- **Much of this already works.** Per the phase 1 audit, `submitRequest`
  ([org-access-request.service.ts:37](apps/api/src/modules/organization/services/org-access-request.service.ts#L37))
  already normalizes the email, rejects an existing user, rejects a second
  PENDING request, and creates the record with a server-assigned status. The
  public mutation, DTO, entity, form, and Zod schema all exist. Expect this
  phase to be verification plus gap-closing, not new construction.
- **Status enum tension.** The spec proposes `DRAFT`/`SUBMITTED`, but the spec
  also says to reuse the existing enum when one is available.
  `OrganizationAccessRequestStatus` is `PENDING | APPROVED | REJECTED` and
  `PENDING` already is the submitted state. Reusing it avoids a migration and a
  frontend enum change; introducing `DRAFT`/`SUBMITTED` would require renaming
  a value every later phase depends on. Default to reuse unless the user wants
  otherwise.
- **`submittedAt` is likely a duplicate field.** `createdAt` already records
  submission time, and the spec forbids adding equivalent fields. Do not add it
  without a reason it must differ from `createdAt`.
- **Document upload is conditional** — the spec says "when supported". The
  request model has no document relation today, and the upload pattern in this
  repo is REST multipart, not GraphQL. Treat as out of scope unless asked.
- **Stronger duplicate identifiers may not exist.** The spec suggests
  registration number or organization identifier; `OrganizationAccessRequest`
  has neither. The realistic strengthening is normalized organization name plus
  email, or a database-level partial unique index on pending records. Flag
  rather than invent a new identifier field.
- **There is no test infrastructure.** The phase 1 audit found zero test files
  outside `node_modules`. The spec's testing section therefore implies standing
  up the harness (Jest for the API, Vitest for the frontend) before any test
  can be written. This is the largest unscoped item in the phase — confirm
  before building it out.
- **`npm run check-types` does not exist** as a workspace script; the
  equivalent is `npx tsc --noEmit -p apps/{api,front}/tsconfig.json`. The gate
  in `ai-interaction.md` names a script the repo does not expose.
- Phase 1 and the phase 2–7 specifications are merged into `main`. New
  implementation work should branch from `main`.

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
