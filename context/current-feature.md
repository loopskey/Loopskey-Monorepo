# Current Feature: Organization Approval Workflow — Phase 1 (Audit)

Read-only audit of the existing Organization registration, Admin approval,
authentication, password, and email workflows. No code changes in this phase.

## Status

Complete — committed on `feature/org-approval-audit`, not yet merged.

## Goals

- Trace the expected business flow end to end against the current codebase:
  applicant registers → application lands in Admin dashboard → Admin approves or
  rejects (rejection requires a saved reason + email) → approval creates or
  activates the Organization account and emails activation instructions → first
  login forces a password change → dashboard access only after that.
- Inspect the relevant frontend, backend, database, auth, authorization, and
  email files, including: Organization registration form, Organization/Admin
  roles, Admin dashboard, Organization and User models, registration/approval
  request models, status fields and enums, login implementation, password
  reset/change flows, invitation or activation flows, role-based authorization,
  email service, email templates, email provider config, environment variables,
  React Hook Form usage, Zod schemas, API request/mutation hooks, backend
  validation, migrations, audit logging, and existing tests.
- Answer the 13 audit questions in the spec — notably: whether the Organization
  account is created before or after approval, whether application and user
  account are separate entities, whether the password-reset or invitation flow
  can be reused, whether the email service exists but is unconfigured, which
  email provider is intended, whether first-login password change is supported,
  whether backend authorization blocks access before the password change,
  whether approval/rejection APIs already exist, and whether duplicate approval
  or duplicate account creation is possible.
- Produce the audit report with exactly these sections: Existing
  Implementation, Missing or Incomplete Parts, Recommended Architecture,
  Proposed Status Workflow, Proposed Secure Account Activation Method, Proposed
  Implementation Phases, Relevant Files, Risks and Questions.
- Stop after the report. No implementation until the next phase is explicitly
  requested.

## Notes

- Source spec: `context/features/email-org-submit1-spec.md`. This is phase 1 of
  7 (`email-org-submit1-spec.md` … `email-org-submit7-spec.md`); the later specs
  have not been read yet.
- Explicitly read-only: create no files, migrations, endpoints, components, or
  services. The only file this phase writes is the audit report itself.
- Activation preference from the spec: a secure single-use "Set Your Password"
  link, not an emailed permanent password. If the architecture forces temporary
  credentials, explain how to do a one-time temporary password securely.
- Because nothing ships in this phase, the normal build/lint/type gate in
  `context/ai-interaction.md` does not apply; the deliverable is the report.

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
