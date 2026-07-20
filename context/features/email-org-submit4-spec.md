PHASE 4 — ADMIN APPROVAL AND REJECTION BUSINESS LOGIC

Implement the complete backend and frontend approval and rejection workflow for Organization applications.

Do not configure the real email provider or mandatory first-login password-change UI in this phase.

The workflow must be secure, transactional where appropriate, idempotent, and protected against conflicting Admin actions.

## Rejection Flow

When an authorized Admin clicks Reject:

1. Open a confirmation dialog.
2. Clearly identify the Organization application.
3. Require a rejection reason.
4. Validate the reason.
5. Save the rejection reason.
6. Save the reviewing Admin.
7. Save the review timestamp.
8. Change the application status to `REJECTED`.
9. Refresh the Admin view.
10. Show a success notification.

The rejection reason must:

- Be required
- Have a sensible maximum length
- Not contain internal-only Admin notes
- Be available later for the rejection email
- Be visible in the Admin application detail view

Do not allow an already approved application to be rejected unless an explicit business rule permits it.

## Approval Flow

When an authorized Admin clicks Approve:

1. Open a confirmation dialog.
2. Clearly identify the Organization.
3. Validate that all required application information exists.
4. Update the application status.
5. Create or activate the related Organization entity.
6. Create the Organization user account if it does not already exist.
7. Assign the correct Organization role.
8. Link the user to the correct Organization.
9. Keep the account in an invitation-pending or password-setup-required state.
10. Save the approving Admin.
11. Save the approval timestamp.
12. Refresh the Admin dashboard.
13. Show a success notification.

Do not grant normal Organization dashboard access yet.

## Account Creation Security

Preferred behavior:

- Create the Organization user using the registered organizational email.
- Mark the account as pending activation or requiring initial password setup.
- Do not generate or store a permanent plain-text password.
- Prepare the account for a secure one-time activation token in the next phase.

If the current authentication architecture requires a temporary password:

- Generate a cryptographically strong one-time temporary password.
- Store only the password hash.
- Mark the account as requiring a password change.
- Add a temporary-password expiry.
- Never log or return the password after creation.

Document which approach was selected.

## Existing User Conflict

If a user with the organizational email already exists:

- Do not overwrite the user.
- Do not silently grant the Organization role.
- Inspect whether the existing user can safely be linked.
- Detect role conflicts.
- Return a clear Admin-facing error if manual intervention is required.

## Status Transitions

Reuse the project’s existing status enum where possible.

Enforce valid transitions in a backend service.

Suggested transitions:

- SUBMITTED → UNDER_REVIEW
- SUBMITTED → APPROVED
- SUBMITTED → REJECTED
- UNDER_REVIEW → APPROVED
- UNDER_REVIEW → REJECTED

Do not permit:

- APPROVED → REJECTED
- REJECTED → APPROVED

unless explicitly supported by the project’s business rules.

## Concurrency

Handle two Admin users reviewing the same application.

Example:

- Admin A approves the application.
- Admin B tries to reject the same application afterward.

The second request must fail with a clear conflict response.

Use transactions, conditional updates, optimistic locking, or another method consistent with the backend architecture.

## Idempotency

Repeated approval requests must not create duplicate:

- Organization records
- User records
- Role assignments
- Organization-user relationships
- Activation requests

Repeated rejection requests must not create duplicate review events.

## Email Preparation

Do not configure actual email delivery yet.

However, after approval or rejection, create the appropriate email-notification request, domain event, outbox event, or service call required by the current architecture.

If no notification architecture exists, create a clean service abstraction that Phase 5 can implement.

Do not mark an email as sent when no provider has delivered it.

## Authorization

Ensure:

- Only authorized Admin users can approve.
- Only authorized Admin users can reject.
- Organization applicants cannot review their own request.
- Organization users cannot call review endpoints.
- The backend determines the Admin identity from the authenticated session.
- The frontend cannot provide a trusted reviewer ID.

## Testing

Add or update tests for:

- Successful approval
- Successful rejection
- Rejection reason required
- Invalid status transition
- Concurrent Admin review
- Duplicate approval
- Duplicate rejection
- Organization creation
- Organization user creation
- Correct role assignment
- Correct Organization relationship
- Existing-user conflict
- Non-Admin approval attempt
- Non-Admin rejection attempt
- Transaction rollback on account-creation failure

Run:

- Frontend tests
- Backend tests
- Database tests
- Migration validation
- TypeScript checks
- Linting
- Production build

Fix only issues introduced by this phase.

## Completion Report

At the end, provide:

1. Approval flow implemented
2. Rejection flow implemented
3. Status transitions
4. Organization creation behavior
5. Organization user creation behavior
6. Existing-user conflict behavior
7. Idempotency implementation
8. Concurrency protection
9. Email event or abstraction prepared
10. Files changed
11. Tests performed and results
12. Work remaining for email and account activation

STOP after completing approval and rejection logic.

Do not configure the real email provider or mandatory password-change UI yet.
