PHASE 2 — ORGANIZATION APPLICATION SUBMISSION

Using the findings from the previous audit, implement or complete only the Organization application submission workflow.

Do not implement the Admin approval/rejection actions, account activation, email delivery, or mandatory password-change flow in this phase.

Reuse the existing project architecture and do not duplicate working components, services, entities, routes, hooks, or validation schemas.

## Required Flow

1. An Organization applicant opens the existing Organization registration/application form.
2. The applicant completes all required information.
3. The applicant clicks:

Submit Request

4. The frontend validates the form.
5. The backend validates and stores the application.
6. The application receives the appropriate submitted status.
7. The applicant sees a clear confirmation that the request was submitted for Admin review.

## Frontend Requirements

Inspect and reuse:

- Existing React Hook Form setup
- Existing Zod schemas
- Existing form components
- Existing input, select, upload, and date components
- Existing mutation hooks
- Existing toast or notification system
- Existing responsive layout

The form must:

- Clearly mark required fields
- Show field-level validation messages
- Validate the organizational email
- Prevent duplicate submissions
- Disable the submit button while processing
- Preserve form values when a recoverable error occurs
- Display backend errors clearly
- Be responsive and accessible
- Avoid submitting twice through double-clicking

After successful submission:

- Show a success message
- Explain that the request is awaiting Admin review
- Clear or lock the form according to the existing UX pattern
- Do not create an active Organization account yet

## Backend Requirements

Inspect whether an application or registration-request entity already exists.

Reuse and complete it when possible.

The stored application should include the existing form data and appropriate workflow information, such as:

- Organization name
- Organizational email
- Contact person
- Contact information
- Organization details
- Submitted documents, when supported
- Status
- submittedAt
- createdAt
- updatedAt

Do not add duplicate fields when equivalent fields already exist.

## Application Status

Reuse the existing status enum if available.

Otherwise, introduce only the statuses required at this stage, such as:

- DRAFT
- SUBMITTED

Design the status model so later phases can safely add:

- UNDER_REVIEW
- APPROVED
- REJECTED
- ACCOUNT_INVITED
- ACTIVATED

Do not permit the frontend to directly control the stored workflow status.

The backend must assign the correct initial status.

## Duplicate Application Handling

Prevent accidental duplicate pending applications.

Use the strongest existing organization identifiers, such as:

- Organizational email
- Organization registration number
- Organization identifier
- Organization name combined with verified identifying information

Do not rely only on a public email domain.

If a pending application already exists, return a clear business error rather than creating another duplicate record.

## Security

- Validate all data on the backend.
- Do not trust role, status, user ID, or organization ID values supplied by the frontend.
- Do not create an active Organization user before approval.
- Do not expose applications belonging to other applicants.
- Do not expose Admin-only fields.
- Do not store passwords in the application record.

## Testing

Add or update tests for:

- Required field validation
- Invalid email
- Successful application submission
- Initial submitted status
- Duplicate submission prevention
- Double-click protection
- Backend validation
- Unauthorized access to protected application data
- Responsive form behavior where supported

Run:

- Frontend tests
- Backend tests
- TypeScript checks
- Linting
- Database migration validation
- Production build

Fix only errors introduced by this phase.

## Completion Report

At the end, provide:

1. Existing implementation reused
2. Files modified
3. Files created
4. Database changes
5. API changes
6. Validation added
7. Duplicate prevention behavior
8. Tests performed and results
9. Remaining work for the next phase

STOP after completing the Organization application submission workflow.

Do not implement the Admin review workflow yet.
