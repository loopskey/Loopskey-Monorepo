# Modular Monolith Phase 5 — Identity, Organization and Administration

## Status

Not Started

## Depends On

Phase 4 completed.

## Objective

Harden Identity and Access, Organization Management and administrative
orchestration without weakening authentication, authorization or transaction
guarantees.

## Scope

Harden in this order:

1. `user`
2. `auth`
3. `organization`
4. Organization-related `admin` workflows
5. Communications invoked by these workflows

## Goals

- [ ] Make Identity and Organization persistence ownership enforceable.
- [ ] Preserve all authentication, session, OAuth, and cookie behavior.
- [ ] Move administrative coordination behind explicit APIs and workflows.
- [ ] Keep security-critical multi-record changes atomic.
- [ ] Decouple committed business state from email-provider availability.
- [ ] Remove all Phase 5 boundary exceptions.
- [ ] Prove role, ownership, tenant, and secret protections with E2E tests.

## Non-goals

- Replacing the authentication protocol, guards, JWTs, cookies, or OAuth.
- Redesigning registration or organization user interfaces.
- Splitting Identity, Organization, Admin, or Mail into microservices.
- Introducing a new permission model beyond approved feature requirements.
- Refactoring Professional Development internals.

## Security Rules

- Authentication and authorization remain backend-authoritative.
- Guards may be globally registered but must delegate identity/session policy to
  Identity and Access.
- Public contracts must not expose password hashes, tokens, OTPs, OAuth secrets,
  raw cookies or complete session records.
- Cross-domain user projections contain only required identity fields.
- Organization approval cannot bypass organization or identity invariants.
- Admin is an orchestration/read boundary, not an unrestricted persistence
  owner.

## Required Workflows

Make the following boundaries explicit:

- Registration and account activation
- Login, refresh and logout
- OAuth account linking
- Password and email change
- Organization application and review
- Organization approval/denial
- Organization owner activation
- Membership and department management
- Administrative user and organization queries

Critical changes that must be atomic remain synchronous Prisma transactions.
Email is a reaction to a committed business fact and must not determine whether
an otherwise valid approval or registration remains stored.

## Tests

Add E2E coverage for:

- Register/login/refresh/logout
- Expired/revoked session
- Password-change-required guard
- Role rejection
- Organization approval and activation
- Cross-organization access rejection
- Admin-only operations
- Email-provider failure behavior

## Acceptance Criteria

- [ ] Identity-owned records are written only by Identity and Access.
- [ ] Organization-owned records are written only by Organization Management.
- [ ] Admin workflows use public APIs or approved read projections.
- [ ] Global guards have no foreign-domain persistence shortcuts.
- [ ] Secrets are absent from public contracts, events and logs.
- [ ] Email failure cannot corrupt committed identity/organization state.
- [ ] All Phase 5 boundary exceptions are removed.
- [ ] Authentication cookies and GraphQL behavior remain compatible.
- [ ] Security-critical E2E tests pass.
- [ ] Common validation gate passes.

## Exit Gate

Complete a focused security review and record it in
`context/architecture/identity-organization-review.md`. Any unresolved
authorization or transaction regression blocks Phase 6.
