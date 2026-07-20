# Phase 1 Audit — Organization Approval Workflow

Read-only audit against `email-org-submit1-spec.md`. No application code was
changed in this phase.

**Headline finding:** approval works, but in production it produces an account
nobody can log into. The temporary password is generated, hashed, stored, and
then discarded — it is only ever revealed through a `console.log` that is
explicitly skipped when `NODE_ENV === "production"`. No email is sent on
approval or rejection anywhere in the workflow.

---

## Existing Implementation

### Data model — complete

`apps/api/prisma/schema.prisma` already carries the entire shape this feature
needs. Nothing is missing at the persistence layer.

- `OrganizationAccessRequest` (line 455) holds every submitted field plus
  `status`, `reviewedById`, `reviewedAt`, `rejectReason`, and `approvedUserId`.
- `OrganizationAccessRequestStatus` (line 439) is `PENDING | APPROVED | REJECTED`.
- `User.forcePasswordChange` (line 64) exists and defaults to `false`.
- `OtpCode` (line 168) supports hashed codes, expiry, attempt limits, and
  resend cooldown, with a `RESET_PASSWORD` purpose already in `OtpPurpose`.
- `AuditLog` (line 1906) plus `AuditAction.ORG_ACCESS_REQUEST_APPROVED` /
  `ORG_ACCESS_REQUEST_REJECTED`.

### Submission — working

`submitOrganizationAccessRequest` is `@Public()` and validated
([org-access-request.resolver.ts:23](apps/api/src/modules/organization/resolvers/org-access-request.resolver.ts#L23)).
The service normalizes the email, rejects duplicate users, and rejects a second
PENDING request for the same address
([org-access-request.service.ts:37](apps/api/src/modules/organization/services/org-access-request.service.ts#L37)).
The frontend form is [OrgAccessForm.tsx](apps/front/src/components/modules/Auth/OrgAccessForm.tsx)
with a Zod schema in [auth-form.schema.ts](apps/front/src/lib/validations/auth-form.schema.ts).

### Admin review — working, with gaps

Admin listing, filtering, cursor pagination, and detail view all exist and are
`@Roles(Role.ADMIN)` guarded. The review UI is
[admin-request-review.tsx](apps/front/src/components/modules/AdminDashboard/parts/admin-request-review.tsx)
driven by [useAdminAccessRequestsTab.ts](apps/front/src/hooks/useAdminAccessRequestsTab.ts).

Approval via `AdminService.approveOrgAccessRequest`
([admin.service.ts:305](apps/api/src/modules/admin/services/admin.service.ts#L305))
does a genuinely thorough job inside one transaction: creates the `User` with
`role: ORGANIZATION`, `status: ACTIVE`, `emailVerifiedAt`, and
`forcePasswordChange: true`; creates the `Organization`; upserts
`OrganizationProfile`, `OrganizationSettings`, and the owner's
`OrganizationMember`; stamps the request; and writes an audit log.

### Password change — working

`changePassword` verifies the current password and clears
`forcePasswordChange` in the same update
([auth-password.service.ts:200](apps/api/src/modules/auth/services/auth-password.service.ts#L200)).
The OTP-based forgot/reset flow is complete and revokes all active sessions on
reset ([auth-password.service.ts:132](apps/api/src/modules/auth/services/auth-password.service.ts#L132)).

### Email infrastructure — exists and is configured

`MailService` wraps Resend and throws at construction if `RESEND_API_KEY` or
`EMAIL_FROM` are absent ([mail.service.ts:15](apps/api/src/modules/mail/mail.service.ts#L15)).
Both keys are present in `apps/api/.env`, so the provider is live, not stubbed.
One template exists: [otp-email.template.ts](apps/api/src/modules/mail/otp-email.template.ts),
used through `AuthCommonService.sendOtpEmail`.

---

## Missing or Incomplete Parts

### 1. No email is ever sent for approval or rejection — blocking

`OrganizationModule` does not import `MailModule`
([org.module.ts:19](apps/api/src/modules/organization/org.module.ts#L19)), and
neither does `AdminDashboardModule` — it imports `PrismaModule` only
([admin.module.ts:11](apps/api/src/modules/admin/admin.module.ts#L11)). Neither
approval path can send mail. Both "notify the organization" steps in the spec
are absent, and there are no approval/rejection templates.

### 2. The temporary password is unreachable in production — blocking

`logOrganizationTemporaryPassword` returns early when
`NODE_ENV === "production"`
([admin.service.ts:562](apps/api/src/modules/admin/services/admin.service.ts#L562)).
Since nothing emails it, an approved organization in production has an account
with a password that exists only as an argon2 hash. The account is unusable.
In development the password is printed to the server console in plaintext,
which the coding standards explicitly forbid ("Never log passwords, OTPs,
tokens").

### 3. Two competing approval implementations — must be resolved

There are two independent, divergent approval code paths:

| | `OrgAccessRequestService.reviewRequest` | `AdminService.approveOrgAccessRequest` |
|---|---|---|
| GraphQL | `reviewOrganizationAccessRequest` | `approveAdminOrgAccessRequest` |
| Reached by UI components | **No** (endpoint wired but unused) | **Yes** |
| Password RNG | `Math.random()` — insecure | `randomBytes` — secure |
| Creates `Organization` | No — profile only | Yes |
| Creates settings/member | No | Yes |
| Audit log | No | Yes |
| Re-review guard | Yes | **No** |
| Logs password in prod | **Yes** | No |

The org-module path is unreachable from the UI but is not dead code: it has a
`.graphql` document ([admin-dashboard.graphql:517](apps/front/src/lib/graphql/documents/admin-dashboard.graphql#L517)),
a generated type, and an exported RTK hook
`useReviewOrganizationAccessRequestMutation`
([admin.api.ts:110](apps/front/src/lib/rtk/endpoints/admin.api.ts#L110)) that no
component consumes. The mutation itself is live and `@Roles(ADMIN)`-reachable.
Removing it therefore means deleting the document and endpoint and regenerating
`generated.ts`, not just deleting backend code. It generates its temporary
password with
`Math.random()`
([org-access-request.service.ts:305](apps/api/src/modules/organization/services/org-access-request.service.ts#L305)),
which is not cryptographically secure and is predictable from a few observed
outputs. It also `console.log`s the password unconditionally, in every
environment ([org-access-request.service.ts:269](apps/api/src/modules/organization/services/org-access-request.service.ts#L269)),
and creates only an `OrganizationProfile` — no `Organization` row — so an
account approved through it lands in a half-built state the org dashboard does
not expect.

### 4. No status-transition guard on the path the UI uses

`approveOrgAccessRequest` and `rejectOrgAccessRequest` both look the request up
with `findFirst({ where: { id: requestId } })` and never check `status`. So:

- An already-`APPROVED` request can be approved again.
- A `REJECTED` request can be approved, and an `APPROVED` request rejected —
  the latter flips the request to `REJECTED` while leaving the user account,
  organization, and membership fully active.

The upserts make a repeat approval mostly idempotent, and the second run will
not mint a new password (`temporaryPassword` stays `null` because the user now
exists), so the duplicate-approval risk is a stale-state and audit-integrity
problem rather than duplicate account creation. The org-module path *does*
guard this correctly at
[org-access-request.service.ts:199](apps/api/src/modules/organization/services/org-access-request.service.ts#L199)
— the wrong path has the right check.

### 5. Rejection reason is not required by the backend

On the path the UI uses, `reason` is a bare nullable scalar arg with no
`class-validator` constraints
([admin.resolver.ts:134](apps/api/src/modules/admin/resolvers/admin.resolver.ts#L134))
and an optional service parameter. The requirement is enforced only in the
browser, in `useAdminAccessRequestsTab.reject`
([useAdminAccessRequestsTab.ts:119](apps/front/src/hooks/useAdminAccessRequestsTab.ts#L119)).
Any direct GraphQL call rejects without a reason.

The org-module DTO does better — `@ValidateIf` + `@IsString` + `@MaxLength`
([review-org-access-request.input.ts:18](apps/api/src/modules/organization/dtos/review-org-access-request.input.ts#L18))
— though it still admits an empty string.

### 6. First-login password change is not enforced anywhere on the backend

This is the most security-relevant gap after the email problem. Nothing on the
server consults `forcePasswordChange` when authorizing an operation:

- `JwtAuthGuard` checks only `@Public()` and token validity.
- `RolesGuard` checks only role membership
  ([roles.guard.ts:26](apps/api/src/modules/auth/guards/roles.guard.ts#L26)).

The entire gate is client-side and soft:

- `useLoginForm` *redirects* to `?tab=settings&forcePassword=true`
  ([useLoginForm.ts:65](apps/front/src/hooks/useLoginForm.ts#L65)) — a redirect,
  not a block.
- `RoleRouteGuard` checks role only and never reads `forcePasswordChange`
  ([role-route-guards.tsx:24](apps/front/src/components/guards/role-route-guards.tsx#L24)).
- The dialog lives on the settings tab and is dismissible via
  `setForceDialogDismissed`
  ([useOrgSettingsTab.ts:208](apps/front/src/hooks/useOrgSettingsTab.ts#L208)).

So an organization user holding a temporary password can navigate directly to
`/dashboard/organization`, or call any `@Roles(ORGANIZATION)` mutation, without
ever changing it. Spec requirement 8 ("must not access the Organization
dashboard until this is completed") is not met.

### 7. Debug logging left in submission

`submitRequest` prints a five-line banner on every public submission
([org-access-request.service.ts:79](apps/api/src/modules/organization/services/org-access-request.service.ts#L79)).
No secrets, but it is unstructured `console.log` in a service that should be
using Nest's logger, and it is reachable by anonymous users.

### 8. No tests, no `.env.example`

`Get-ChildItem -Include *.spec.ts,*.test.ts` matches only files inside
`node_modules`. There is no test coverage for any part of this workflow. There
are also no `.env.example` files, only real `apps/api/.env` and
`apps/front/.env` — the sanitized examples the project overview says should
exist are absent.

---

## Answers to the Spec's 13 Questions

1. **Fully implemented** — data model, submission, admin listing/detail,
   approval transaction, audit logging, password change, OTP reset, Resend
   integration.
2. **Partially implemented** — rejection (persists, but no email and no
   required reason); first-login password change (flag and clearing work,
   enforcement does not); approval (creates everything correctly but the
   credential never reaches the user).
3. **Missing** — all approval/rejection email, both templates, backend
   `forcePasswordChange` enforcement, status-transition guards, single-use
   activation tokens, tests.
4. **Reuse** — `MailService`, `buildOtpEmailTemplate` as the template pattern,
   `OtpCode` for single-use token storage, `AuthPasswordService.changePassword`,
   `AdminService.createAudit`, the existing `@Roles`/`@Public` guard stack.
5. **Account is created on approval**, not before. Confirmed at
   [admin.service.ts:333](apps/api/src/modules/admin/services/admin.service.ts#L333).
6. **Yes, separate entities.** `OrganizationAccessRequest` is standalone and
   links to the created user only by the loose `approvedUserId` string — no
   foreign key, no relation.
7. **Yes.** The `OtpCode` model plus the forgot/reset flow is a near-exact fit
   for a single-use activation token; it already has hashing, expiry, attempt
   limits, and consumption tracking.
8. **No — the email service exists and is configured.** Resend keys are present
   in `apps/api/.env`, and OTP mail already sends through it. The gap is wiring,
   not configuration.
9. **Resend** (`resend` package, `RESEND_API_KEY`, `EMAIL_FROM`).
10. **Partially.** The flag is set on approval and cleared on change, but
    nothing forces the change.
11. **No.** Neither guard reads `forcePasswordChange`. See gap 6.
12. **Yes — twice.** Two divergent implementations; only the admin-module pair
    is wired to the UI. See gap 3.
13. **Duplicate account creation: no** — the `User.email` unique constraint and
    the in-transaction upserts prevent it. **Duplicate/invalid approval
    transitions: yes** — no status check on the live path. See gap 4.

---

## Recommended Architecture

Keep the admin-module path and delete the org-module review path. `AdminService`
already creates the full object graph, uses secure randomness, and writes audit
logs; `OrgAccessRequestService.reviewRequest` does none of that. Retiring the
duplicate also removes the `Math.random()` password and the unconditional
production password log in one step.

Retain `OrgAccessRequestService.submitRequest` — public submission is fine where
it is.

For email, follow the shape `AuthCommonService` already establishes: a
`build*EmailTemplate` function per message returning `{ subject, html, text }`,
called through `MailService.sendEmail`. Import `MailModule` into `AdminModule`.

Send email **after** the transaction commits, not inside it. A Resend timeout
must not roll back an approval that already created the account. Log the send
failure and surface a retry path rather than failing the mutation.

---

## Proposed Status Workflow

Keep the existing three-value enum — it is sufficient and adding values means a
migration plus frontend changes for no real gain.

```
PENDING ──approve──> APPROVED   (terminal)
   │
   └────reject───> REJECTED     (terminal)
```

Enforce in the service:

- Only `PENDING` may be reviewed; anything else raises a conflict with the
  existing `REQUEST_ALREADY_REVIEWED` code.
- Read-and-update the request in one transaction so two concurrent approvals
  cannot both pass the check. A conditional update
  (`updateMany` on `{ id, status: PENDING }`, then assert `count === 1`) is the
  simplest correct form and needs no new constraint.
- `rejectReason` required and non-empty when transitioning to `REJECTED`.

---

## Proposed Secure Account Activation Method

**Recommended: single-use "Set Your Password" link.** Drop temporary passwords
entirely.

On approval, inside the existing transaction, create the user with
`passwordHash: null` and `status: PENDING`, then issue an activation token:

- 32 bytes from `crypto.randomBytes`, base64url-encoded.
- Store only `argon2.hash(token)` in an `OtpCode` row with `userId`,
  `destination: workEmail`, and a new `OtpPurpose.ACCOUNT_ACTIVATION` value
  (one enum addition, one migration).
- Expiry 48–72 hours; `consumedAt` enforces single use.
- Email `${FRONTEND_URL}/auth/organization/activate?token=…&email=…`.

Activation sets the password, sets `status: ACTIVE` and `emailVerifiedAt`,
stamps `consumedAt`, and leaves `forcePasswordChange: false` — the user has just
chosen their own password, so there is nothing left to force. A resend action on
the admin request detail view covers expired links.

This is strictly better than the current design: no secret is ever transmitted
in a form that persists in a mailbox as a working credential, and the token is
already unusable the moment it is consumed.

**If temporary credentials are mandated instead**, the minimum bar is:
`randomBytes`-derived, never logged in any environment, emailed once,
short-lived (store an expiry and reject login after it), `forcePasswordChange`
enforced server-side per gap 6, and all sessions revoked on the change. Note
this still leaves a working password sitting in an inbox indefinitely.

---

## Proposed Implementation Phases

The remaining spec files (`email-org-submit2` … `7`) have not been read, so this
is a suggested decomposition, not a claim about what they contain.

1. **Consolidate** — delete the org-module review path; add status-transition
   guard and required `rejectReason` on the admin path.
2. **Enforce first-login** — server-side `forcePasswordChange` check plus a
   frontend route guard.
3. **Activation tokens** — `OtpPurpose.ACCOUNT_ACTIVATION`, migration, issue and
   consume services, activation page.
4. **Email** — wire `MailModule` into `AdminModule`; approval and rejection
   templates; post-commit sends with failure logging.
5. **Resend + hardening** — admin resend action, remove debug `console.log`s,
   `.env.example` files.
6. **Tests** — role/ownership matrix, transition guards, transaction rollback,
   activation single-use, email failure isolation.

Phases 1 and 2 are independently shippable and fix real security gaps, so they
should not wait on the email work.

---

## Relevant Files

**Backend — will change**

- [admin.service.ts](apps/api/src/modules/admin/services/admin.service.ts) — approve/reject; remove password logging
- [admin.resolver.ts](apps/api/src/modules/admin/resolvers/admin.resolver.ts) — require reason via a DTO
- [admin.module.ts](apps/api/src/modules/admin/admin.module.ts) — `AdminDashboardModule` must import `MailModule`
- [org-access-request.service.ts](apps/api/src/modules/organization/services/org-access-request.service.ts) — delete review path, remove logging
- [org-access-request.resolver.ts](apps/api/src/modules/organization/resolvers/org-access-request.resolver.ts) — remove review mutation
- [roles.guard.ts](apps/api/src/modules/auth/guards/roles.guard.ts) or a new guard — `forcePasswordChange` enforcement
- [auth-password.service.ts](apps/api/src/modules/auth/services/auth-password.service.ts) — activation consumption
- `apps/api/src/modules/mail/` — new approval/rejection/activation templates
- [schema.prisma](apps/api/prisma/schema.prisma) — `OtpPurpose.ACCOUNT_ACTIVATION` + migration

**Frontend — will change**

- [role-route-guards.tsx](apps/front/src/components/guards/role-route-guards.tsx) — block on `forcePasswordChange`
- [useLoginForm.ts](apps/front/src/hooks/useLoginForm.ts) — route to activation/change
- [useAdminAccessRequestsTab.ts](apps/front/src/hooks/useAdminAccessRequestsTab.ts) — resend action
- [admin-request-review.tsx](apps/front/src/components/modules/AdminDashboard/parts/admin-request-review.tsx) — resend UI
- [admin-dashboard.graphql](apps/front/src/lib/graphql/documents/admin-dashboard.graphql) — drop the dead `reviewOrganizationAccessRequest` document, then regenerate `generated.ts`
- [admin.api.ts](apps/front/src/lib/rtk/endpoints/admin.api.ts) — remove the matching unused endpoint and hook
- `src/i18n/en.json` and `fr.json` — new copy
- New activation route under `src/app/(auth)/`

---

## Risks and Questions

1. **Are there approved organizations in any real database right now?** If so,
   they hold accounts whose passwords were only ever printed to a dev console.
   Consolidation should come with a one-off remediation (force re-activation),
   not just a code change.
2. **Temporary password vs. activation link** — the spec states a preference but
   frames it as open. This is the single decision that shapes phases 3–4.
3. **Should rejection be reversible?** The proposed workflow makes `REJECTED`
   terminal. If admins need to reverse a mistaken rejection, that needs either a
   re-open transition or a documented "ask them to resubmit" answer — and
   `submitRequest` currently only blocks duplicate *PENDING* requests, so
   resubmission after rejection already works.
4. **What happens to the account if an approval is later revoked?** Nothing
   today deactivates the user, organization, or membership.
5. **Email deliverability is a hard dependency.** Once activation links replace
   console output, a Resend outage means no organization can be onboarded.
   Worth deciding whether admins get a manual fallback.
6. **Is the org-module review mutation used by anything outside this repo?**
   No component in this frontend calls it — though a document, generated type,
   and RTK hook all exist for it — but removing a GraphQL mutation is a breaking
   API change if any external consumer exists.
7. **Doc drift, unrelated but blocking the stated workflow:**
   `context/ai-interaction.md` says to branch from and merge to `develop` and
   calls `main` a "vestigial 3-commit stub." Neither is true — `develop` does
   not exist locally or on the remote, `origin/HEAD` points at `main`, and
   `main` carries the recent feature commits. The `/feature complete` action
   also merges to `main`, contradicting the same doc. This should be reconciled
   before anything merges.
