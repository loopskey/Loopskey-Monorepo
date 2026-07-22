PHASE 5 — LEARNING ACTIVITY DETAILS

Implement a complete read-only detail view for each Professional learning activity.

Reuse the existing activity edit page and existing backend activity service.

Do not redesign the activity creation or edit form.

## 1. Route

Implement or complete a route following the project’s routing convention, for example:

/professional/learning-activities/:activityId

Do not use this exact route when the project has a different established pattern.

The eye icon added in Phase 4 must navigate to this route.

## 2. Data Loading

Load activity details by ID.

The backend must verify:

- The authenticated user has the Professional role.
- The activity belongs to the authenticated Professional user.
- The activity is not inaccessible because of deletion or authorization rules.

Do not trust a user ID supplied by the frontend.

Return appropriate responses for:

- Loading
- Not found
- Unauthorized
- Deleted activity
- Backend error

## 3. Activity Details

Display all relevant existing activity information, such as:

- Activity title
- Activity type
- Provider
- Description
- Completion date
- Start and end dates where applicable
- Credits or hours
- Credit type
- Category
- Linked CPD/PDU plan
- Linked certificate
- Learning format
- Status
- Notes
- Evidence files
- Certificate attachments
- Created date
- Updated date

Use only fields supported by the current activity model.

Do not invent and persist unsupported fields.

## 4. Evidence and Attachments

Display attached evidence using the existing file-access architecture.

For each file, show appropriate metadata such as:

- Filename
- File type
- Upload date
- File size

Allow preview or download only when already supported securely.

Do not expose direct private storage URLs.

## 5. Actions

Display two primary actions:

### Cancel

The Cancel button must return the user to My Learning Activities.

Where possible, preserve:

- Search query
- Filters
- Current page
- Sorting

Use route state or existing query parameters.

Avoid relying only on browser history when it may return the user to an unrelated page.

### Edit

The Edit button must navigate to the existing activity edit page.

Do not create a second edit form.

Pass the activity ID using the established route convention.

## 6. Responsive and Accessible Design

Requirements:

- Use existing detail cards or description-list components.
- Keep labels and values clearly associated.
- Ensure long text wraps.
- Avoid horizontal overflow.
- Support keyboard navigation.
- Keep attachment actions accessible.
- Show readable dates and credit values.

## 7. Testing

Test:

- Activity details load
- Correct activity displayed
- Unauthorized activity rejected
- Missing activity state
- Cancel navigation
- Filter preservation
- Edit navigation
- Evidence display
- Mobile layout
- Loading and error states

Run:

- TypeScript checks
- Frontend tests
- Backend authorization tests
- Linting
- Production build

Fix only errors introduced by this phase.

## Completion Report

Provide:

1. Detail route implemented
2. Data and fields displayed
3. Authorization behavior
4. Cancel behavior
5. Edit integration
6. Files modified
7. Tests executed and results

STOP after completing the Activity Details page.
