PHASE 6 — ORGANIZATION ACCOUNT ACTIVATION AND MANDATORY PASSWORD SETUP

Implement or complete the Organization account activation and mandatory initial password setup workflow.

Use the secure activation mechanism created in the previous phase.

Do not email or expose permanent plain-text passwords.

## Expected Flow

1. Admin approves the Organization application.
2. The Organization receives an approval email with a secure activation or Set Your Password link.
3. The Organization user opens the link.
4. The system validates the activation token.
5. The user creates a new password.
6. The token is invalidated.
7. The Organization account becomes active.
8. The user is redirected to login or authenticated according to the current architecture.
9. The user can access the Organization dashboard.

If the current architecture uses a temporary password instead of an activation link:

1. The Organization logs in using the temporary password.
2. The account is recognized as requiring a password change.
3. The user is redirected to the mandatory password-change page.
4. All Organization dashboard access remains blocked until the password is changed.
5. After the change, the temporary password is invalidated.

Prefer the activation-link flow unless the existing authentication system makes it impractical.

## Activation Page

Create or complete a responsive page such as:

Set Your Password

Suggested description:

Your organization account has been approved. Create a secure password to activate your account.

Fields:

- New Password
- Confirm New Password

If the temporary-password approach is used, include:

- Current Temporary Password
- New Password
- Confirm New Password

Use:

- React Hook Form
- Zod
- Existing password input components
- Existing password policy
- Existing toast system
- Existing authentication hooks

## Password Validation

Validate:

- Required password
- Confirmation match
- Minimum password length
- Current project complexity requirements
- Password not equal to the temporary password, when applicable
- Password not equal to obvious user or organization information where supported
- Expired activation token
- Invalid activation token
- Already-used activation token

Display clear but secure error messages.

Do not reveal whether unrelated user accounts exist.

## Backend Activation

The backend must:

1. Validate the activation token.
2. Compare the token using its stored secure hash.
3. Confirm that the token belongs to the correct pending Organization user.
4. Confirm that the token has not expired.
5. Confirm that the token has not already been used.
6. Hash the new password using the project’s existing password-hashing implementation.
7. Save the new password hash.
8. Mark the activation token as used or remove it.
9. Mark the account as active.
10. Clear `mustChangePassword` or equivalent flags.
11. Save `passwordChangedAt` or `activatedAt`.
12. Optionally revoke existing sessions.
13. Record an audit event.
14. Send the password-change or activation confirmation email.

The operation should be transactional where appropriate.

## Mandatory Access Restriction

Do not enforce the password requirement only in the frontend.

Before activation or mandatory password setup is complete:

The user must not be able to access:

- Organization dashboard
- Organization management APIs
- Organization member APIs
- Organization reports
- Other protected Organization resources

The user may access only the endpoints required for:

- Activation
- Initial password setup
- Current authentication status
- Logout
- Requesting a new activation invitation, when supported

Implement the restriction using the project’s backend middleware, guards, policies, filters, or authorization annotations.

## Frontend Route Protection

When a logged-in user has a password-change-required or activation-required status:

- Redirect them to the activation/password page.
- Prevent navigating to the dashboard.
- Prevent redirect loops.
- Allow logout.
- Handle browser refresh correctly.
- Handle expired sessions correctly.

After successful password setup:

- Refresh the authenticated user state.
- Redirect to the Organization dashboard or login page according to the current architecture.
- Show a success notification.

## Expired and Used Links

For an expired link:

- Show an appropriate message.
- Allow requesting a new activation email when permitted.

For an already-used link:

- Explain that the account may already be activated.
- Provide a link to the login page.
- Do not allow the token to be reused.

## Resend Activation

Allow an eligible Organization user or authorized Admin to request a new activation email.

Requirements:

- Invalidate previous unused tokens.
- Apply rate limiting.
- Avoid revealing account existence publicly.
- Record the resend event.
- Prevent excessive emails.

## Testing

Add or update tests for:

- Valid activation token
- Invalid token
- Expired token
- Already-used token
- Password confirmation mismatch
- Weak password
- Successful password setup
- Token invalidation after use
- Account activation
- Organization dashboard blocked before activation
- Backend APIs blocked before activation
- Dashboard access after activation
- Logout before activation
- Resend invitation
- Previous token invalidated after resend
- Rate limiting
- Password hash storage
- Sensitive values not logged
- Confirmation email request

Run:

- Frontend tests
- Backend authentication tests
- Integration tests
- Authorization tests
- TypeScript checks
- Linting
- Production build

Fix only errors introduced by this phase.

## Completion Report

At the end, provide:

1. Activation flow implemented
2. Password setup UI
3. Password validation
4. Token validation and invalidation
5. Account-status changes
6. Frontend route protection
7. Backend access protection
8. Resend behavior
9. Audit events
10. Files modified
11. Tests performed and results
12. Any remaining integration issues

STOP after completing the activation and mandatory password setup workflow.
