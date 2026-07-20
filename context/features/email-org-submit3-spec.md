PHASE 3 — ADMIN ORGANIZATION REQUESTS DASHBOARD

Implement or complete the Admin interface for viewing and reviewing submitted Organization applications.

Do not implement the final approval, rejection, account creation, email delivery, or password activation behavior in this phase.

Reuse the project’s existing Admin dashboard, design system, routing, table components, cards, filters, pagination, hooks, and authorization patterns.

## Admin Navigation

Add or complete an Admin dashboard section named:

Organization Requests

Only authorized Admin users may access this section.

## Organization Requests List

Display submitted Organization applications in a responsive table or card layout.

Each item should show relevant information such as:

- Organization name
- Organizational email
- Contact person
- Submission date
- Current status
- Review date, when available
- Reviewing Admin, when available
- View Details action

Support the following states:

- Loading
- Empty
- Error
- Unauthorized
- No search results

## Filters

Provide appropriate status filters based on the statuses currently supported, such as:

- All
- Submitted
- Under Review
- Approved
- Rejected

Do not display filters for statuses that do not exist yet unless the architecture supports them.

## Search and Sorting

Allow Admin users to search by relevant values, such as:

- Organization name
- Organizational email
- Contact person

Reuse the existing debounce hook.

Inspect the hooks folder before creating a new debounce implementation.

Use backend search, sorting, and pagination if that is the current project pattern.

Do not load an unlimited number of applications into the browser.

## Application Detail View

When the Admin selects an application, open the project’s appropriate detail pattern:

- Dedicated page
- Modal
- Drawer

Display all submitted applicant information, including:

- Organization details
- Organizational email
- Contact details
- Submitted form fields
- Uploaded documents, when supported
- Submission date
- Current application status
- Review information
- Rejection reason, if one already exists

Do not expose sensitive system fields unnecessarily.

## Review State

If the project supports an `UNDER_REVIEW` status, allow an authorized Admin to mark a submitted application as under review when opening or starting the review.

This transition must be controlled by the backend.

Do not create conflicting status updates when multiple Admin users open the same request.

## Placeholder Actions

The detail view may visually include:

- Approve
- Reject

However, in this phase:

- Do not perform account creation.
- Do not send emails.
- Do not complete approval or rejection business logic.

Either keep the actions disabled with a clear development note or connect them only after Phase 4.

Do not leave buttons that appear functional but silently do nothing.

## Authorization

Ensure:

- Only Admin users can list applications.
- Only Admin users can view application details.
- Organization users cannot access these APIs.
- Applicants cannot access Admin review data.
- Role validation is enforced on the backend, not only the frontend.

## Testing

Add or update tests for:

- Admin application list
- Pagination
- Filtering
- Searching
- Debounced search behavior
- Application detail view
- Loading state
- Empty state
- Unauthorized access
- Non-Admin access rejection
- Under-review transition, if implemented

Run:

- Frontend tests
- Backend tests
- TypeScript checks
- Linting
- Production build

Fix only errors introduced by this phase.

## Completion Report

At the end, provide:

1. Admin dashboard functionality implemented
2. Existing components reused
3. Files modified
4. Files created
5. APIs added or updated
6. Authorization added
7. Search and pagination implementation
8. Tests performed and results
9. Remaining approval and rejection work

STOP after completing the Admin application list and detail workflow.

Do not implement account creation, rejection emails, approval emails, or password activation yet.
