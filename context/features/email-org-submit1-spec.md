PHASE 1 — AUDIT THE EXISTING ORGANIZATION APPROVAL WORKFLOW

Inspect the existing codebase and analyze the current Organization registration, Admin approval, authentication, password, and email workflows.

Do not implement or modify any code in this phase.

The expected business flow is:

1. An Organization applicant completes the existing registration/application form.
2. The applicant submits the request.
3. The application appears in the Admin dashboard.
4. An Admin reviews the submitted information.
5. The Admin can approve or reject the application.
6. When rejected:
   - A rejection reason is required.
   - The reason is saved.
   - A rejection email is sent to the organizational email used during registration.
7. When approved:
   - An Organization account is created or activated.
   - Secure login or account activation instructions are emailed to the organization.
8. On first login:
   - The Organization user must set or change their password.
   - They must not access the Organization dashboard until this is completed.
9. After changing the password:
   - The user can access the Organization dashboard normally.

Inspect all relevant frontend, backend, database, authentication, authorization, and email files.

Specifically inspect:

- Organization registration/application form
- Existing Organization role
- Existing Admin role
- Admin dashboard
- Organization and User models
- Registration or approval request models
- Application status fields or enums
- Authentication and login implementation
- Password reset and password change flows
- Account invitation or activation flows
- Role-based authorization
- Existing email service
- Existing email templates
- Email provider configuration
- Environment variables
- React Hook Form usage
- Zod schemas
- API request and mutation hooks
- Backend validation
- Database migrations
- Audit logging
- Existing tests

Determine:

1. Which parts are already fully implemented
2. Which parts are partially implemented
3. Which parts are missing
4. Which existing components and services should be reused
5. Whether an Organization account is created before or after approval
6. Whether the application and user account are currently separate entities
7. Whether a password reset or account invitation flow can be reused
8. Whether the email service exists but is not configured
9. Which email provider the project appears intended to use
10. Whether first-login password change is currently supported
11. Whether backend authorization prevents access before password change
12. Whether Admin approval and rejection APIs already exist
13. Whether duplicate approval or duplicate account creation is possible

Do not create files, migrations, endpoints, components, or services in this phase.

At the end, provide:

## Existing Implementation

Describe what already works.

## Missing or Incomplete Parts

Describe exactly what must be completed.

## Recommended Architecture

Explain which existing architecture should be reused.

## Proposed Status Workflow

Recommend the application statuses and valid transitions.

## Proposed Secure Account Activation Method

Prefer a secure single-use “Set Your Password” link instead of emailing a permanent password.

If the current architecture requires temporary credentials, explain how a one-time temporary password can be implemented securely.

## Proposed Implementation Phases

Provide a short plan for the remaining phases.

## Relevant Files

List the frontend, backend, database, configuration, authentication, and email files that will likely be changed.

## Risks and Questions

List any uncertain product or architectural decisions.

STOP after producing the audit report.

Do not begin implementation until the next phase is explicitly requested.
