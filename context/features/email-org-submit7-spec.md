PHASE 7 — END-TO-END ORGANIZATION ONBOARDING REVIEW

Perform a complete end-to-end review of the Organization application, Admin review, approval/rejection, email, account activation, and password setup workflow implemented in the previous phases.

Do not redesign or rewrite working functionality.

Do not add unrelated features.

The complete expected workflow is:

1. Organization applicant submits the application.
2. The application is stored with the correct status.
3. Admin can view the application.
4. Admin can reject it with a required reason.
5. Rejected Organization receives the correct email.
6. Admin can approve a valid application.
7. Organization and Organization user records are safely created or linked.
8. Approved Organization receives secure activation instructions.
9. The user sets the initial password.
10. The account becomes active.
11. The user can access the Organization dashboard.
12. Unauthorized users cannot access any Admin or Organization resources.

## End-to-End Testing

Test the full workflow using realistic test data.

### Submission

Verify:

- Required fields
- Invalid values
- Successful submission
- Duplicate pending request
- Double submission
- Correct initial status

### Admin Review

Verify:

- Admin list
- Search
- Filtering
- Pagination
- Detail page
- Authorization
- Under-review state
- Concurrent Admin access

### Rejection

Verify:

- Rejection reason required
- Status update
- Reviewer stored
- Timestamp stored
- Rejection email content
- Internal notes excluded
- Email failure handling
- Resend behavior

### Approval

Verify:

- Status update
- Organization creation
- Organization user creation
- Role assignment
- Organization relationship
- Existing-user conflict
- Duplicate approval
- Transaction failure
- Approval email
- Activation-link creation

### Activation

Verify:

- Valid token
- Expired token
- Used token
- Invalid token
- Password validation
- Password hashing
- Account activation
- Token invalidation
- Dashboard access after activation

### Authorization

Verify:

- Applicant cannot access Admin APIs
- Organization user cannot access Admin APIs
- Organization user cannot access another Organization
- Non-activated Organization user cannot access protected Organization APIs
- Active Organization user can access only authorized Organization resources
- Admin identity is always taken from the authenticated session
- Frontend-provided user IDs are not trusted

### Email Security

Verify that logs and database records do not contain:

- Plain-text passwords
- Raw activation tokens
- SMTP credentials
- Authentication secrets

### Concurrency and Idempotency

Verify:

- Two Admin users cannot perform conflicting reviews.
- Repeated approval does not create duplicate users.
- Repeated approval does not create duplicate organizations.
- Repeated email requests do not create unintended duplicates.
- Resending activation invalidates older tokens.
- Retrying failed network requests is safe.

## Audit Logging

Verify that appropriate audit events exist for:

- Application submitted
- Review started, if supported
- Application approved
- Application rejected
- Account created
- Approval email requested
- Rejection email requested
- Email failed
- Invitation resent
- Account activated
- Initial password set

Ensure audit logs do not contain sensitive secrets.

## Code Quality Review

Review the modified code for:

- Duplicate components
- Duplicate services
- Large UI components containing business logic
- Missing TypeScript types
- Weak backend validation
- Frontend-only authorization
- Hardcoded IDs
- Hardcoded credentials
- Hardcoded production URLs
- Unhandled errors
- Missing loading states
- Missing database indexes
- Unsafe status transitions
- Missing transactions
- Accessibility issues
- Mobile responsiveness issues

Fix issues directly related to this workflow.

Do not refactor unrelated project areas.

## Required Commands

Run all relevant project commands, including:

- Frontend unit tests
- Frontend integration tests
- Backend unit tests
- Backend integration tests
- Authentication tests
- Authorization tests
- Email service tests
- Database migration validation
- TypeScript checks
- Linting
- Production frontend build
- Production backend build

Clearly report any pre-existing failures separately from failures introduced by this work.

## Final Report

Provide a concise final report containing:

1. Complete workflow implemented
2. Existing functionality reused
3. Frontend changes
4. Backend changes
5. Database changes
6. Status model and transitions
7. Admin approval behavior
8. Admin rejection behavior
9. Email provider and templates
10. Account activation method
11. Password setup enforcement
12. Authorization protections
13. Idempotency protections
14. Concurrency protections
15. Audit logging
16. Environment variables required
17. Tests run and results
18. Pre-existing test failures
19. Manual deployment steps
20. Remaining assumptions or limitations

Do not claim that a test passed unless it was actually executed successfully.

STOP after completing the end-to-end review and final report.
