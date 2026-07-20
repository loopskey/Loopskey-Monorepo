PHASE 5 — EMAIL SERVICE AND ORGANIZATION NOTIFICATIONS

Inspect the project’s existing email and notification architecture, then complete the email service required for the Organization application workflow.

Do not implement unrelated email features.

Reuse the email provider and architecture already intended by the project.

Before creating a new implementation, inspect for:

- SMTP configuration
- Nodemailer
- Resend
- SendGrid
- Postmark
- Mailgun
- AWS SES
- Spring Mail
- Quarkus Mailer
- Existing notification service
- Existing queue
- Existing outbox pattern
- Existing email templates

## Provider Selection

If an email provider is already partially configured, complete and reuse it.

If no provider exists, implement a replaceable email-provider abstraction.

Suggested architecture:

- Email service interface
- Provider-specific implementation
- Template renderer
- Organization application notification service
- Test or development provider

Do not tightly couple Organization approval logic directly to a provider SDK.

## Required Emails

Implement the following templates:

### Application Submitted Confirmation

Send after successful Organization application submission if this is consistent with the existing product behavior.

Include:

- Organization name
- Confirmation that the request was received
- Explanation that the application is waiting for Admin review
- Support contact information

### Application Rejected

Send after Admin rejection.

Include:

- Organization name
- Confirmation that the application was reviewed
- Rejected status
- Rejection reason
- Resubmission or support instructions, when supported
- LoopsKey branding
- Support contact information

Do not include internal Admin notes.

### Application Approved and Account Activation

Send after Admin approval.

Preferred content:

- Organization name
- Confirmation that the application was approved
- Username, normally the registered organizational email
- Secure single-use account activation or Set Your Password link
- Activation-link expiry
- Login URL
- Support contact information
- Security warning not to share the link

Do not email a permanent password.

### Password Changed Confirmation

Prepare or implement the confirmation email sent after the Organization user successfully sets or changes the initial password.

## Secure Activation Token

Implement or complete a secure activation-token mechanism if it does not already exist.

Requirements:

- Cryptographically secure random token
- Single-use token
- Limited expiration time
- Store only a secure hash of the token when possible
- Never store the raw token
- Never log the raw token
- Invalidate the token after use
- Invalidate previous active tokens when a new invitation is created
- Associate the token with the correct user and Organization

The raw token may appear only in the secure activation URL sent to the recipient.

## Environment Configuration

Use environment variables following the project’s conventions.

Configuration may include:

- EMAIL_PROVIDER
- SMTP_HOST
- SMTP_PORT
- SMTP_USERNAME
- SMTP_PASSWORD
- EMAIL_FROM_ADDRESS
- EMAIL_FROM_NAME
- APPLICATION_BASE_URL
- ORGANIZATION_LOGIN_URL
- ORGANIZATION_ACTIVATION_URL
- SUPPORT_EMAIL
- ACTIVATION_TOKEN_EXPIRY_MINUTES

Do not introduce different names when equivalent variables already exist.

Update:

- `.env.example`
- Configuration validation
- Development setup documentation
- Deployment documentation where appropriate

Do not commit real credentials.

## Email Failure Handling

When the application status is successfully updated but email delivery fails:

- Do not roll back the valid approval or rejection automatically unless the existing transaction architecture explicitly requires it.
- Save the delivery failure status.
- Log a structured error without sensitive values.
- Show an Admin warning.
- Allow an authorized Admin to resend the email.
- Prevent accidental duplicate deliveries.

Provide Admin actions where appropriate:

- Resend Approval Email
- Resend Rejection Email
- Resend Activation Invitation

Only show valid resend actions for the current application state.

## Background Delivery

If the project already has a queue or outbox system, use it.

If no queue exists, do not introduce large infrastructure unnecessarily.

Keep the email service abstraction compatible with future queue-based processing.

## Testing

Add or update tests for:

- Correct template selection
- Correct recipient email
- Rejection reason included
- Internal Admin notes excluded
- Approval instructions included
- Activation URL generation
- Token hash storage
- Token expiry
- Token single-use behavior
- Provider success
- Provider failure
- Delivery status persistence
- Resend behavior
- Duplicate-email prevention
- Missing email configuration
- Sensitive information not written to logs

Run:

- Email service tests
- Backend tests
- Integration tests
- Configuration validation
- TypeScript checks
- Linting
- Production build

Fix only errors introduced by this phase.

## Completion Report

At the end, provide:

1. Existing email architecture found
2. Email provider selected
3. Provider configuration
4. Email templates added
5. Activation-token behavior
6. Failure and resend behavior
7. Environment variables required
8. Files modified
9. Tests performed and results
10. Manual provider setup still required

STOP after completing email delivery and secure activation-token support.

Do not implement the complete first-login password-change UI until the next phase.
