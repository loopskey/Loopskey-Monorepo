PHASE 4 — MY LEARNING ACTIVITIES PAGE RESTRUCTURE

Restructure the Professional “My Learning Activities” page.

Do not implement the full Activity Details page in this phase. The view icon may link to the route that will be completed in Phase 5.

Reuse the existing table, chart, form, filter, modal, button, tooltip, and query components.

## 1. Remove Existing Elements

Remove the following from My Learning Activities:

- Export CSV button
- Top-level Year selector
- Total PDU Earned card
- Target card
- Progress to Goal card
- Average per Month card
- Quick Actions card

Remove related unused state, calculations, props, imports, and API requests only when they are no longer needed elsewhere on this page.

Do not remove CSV functionality from other parts of the application.

## 2. Page Actions

Keep:

- Refresh
- Add Learning Activity

Place Add Learning Activity beside Refresh in the page action area.

Requirements:

- Refresh must refresh the page data.
- Add Learning Activity must navigate to or open the existing creation flow.
- Preserve current permissions.
- Use loading and disabled states.
- Keep the action layout responsive.

If another table-specific button is currently beside Refresh, move that table-specific control into the search and filter toolbar rather than deleting it.

Do not move Add Learning Activity out of the primary page actions.

## 3. New Summary Cards

Above the Activities table, add two summary cards.

### Total Activities Completed & Logged

Display the total number of activities that:

- Belong to the authenticated Professional user
- Are completed
- Are currently logged in LoopsKey
- Are not deleted

Clearly document whether pending, rejected, or draft activities are included.

Default behavior should count only completed eligible activities.

### Certificates Attached / Evidence Uploaded

Display useful evidence information.

Prefer displaying:

- Number of activities with at least one certificate or evidence file
- Total number of evidence files uploaded

Use clear labels so two different counts are not confused.

Do not double-count the same attachment.

Use the real activity and evidence data model.

## 4. Search and Filter Toolbar

Update the Activities table search area.

The toolbar must include:

- Search input
- Year select
- Type select
- Certificate select
- Any relevant existing table-specific control moved from beside Refresh
- Clear Filters action when filters are active

Requirements:

- Reuse the existing debounce hook for text search.
- Inspect the hooks folder before creating a debounce hook.
- Preserve filters in URL query parameters if that is the existing page pattern.
- Reset pagination when filters change.
- Do not submit an API request for every keystroke.
- Support loading and empty option states.

### Year

Filter activities by the relevant completion or activity date.

Use the project’s existing year behavior.

### Type

Filter by the existing activity-type enum.

Do not hardcode values that conflict with backend enums.

### Certificate

Filter by the user’s linked certificate or CPD/PDU plan association.

Use actual Professional certificate data once implemented.

Until the Certificate API is available, keep the filter integration typed and replaceable rather than hardcoding permanent options.

## 5. Activities Table

Preserve the existing relevant table columns and data.

In the Actions column, replace text buttons with icon-only actions:

- View details — eye icon
- Edit — edit icon
- Delete — trash icon

Requirements:

- Use existing project icons.
- Each icon must be an actual button.
- Add accessible `aria-label` values.
- Add professional tooltips.
- Use visible focus states.
- Do not rely on icon shape alone for screen readers.
- Disable actions during active requests.
- Keep delete confirmation.
- Prevent double deletion.
- Respect permissions.

Suggested accessible labels:

- View activity details
- Edit activity
- Delete activity

## 6. View Details Action

The eye icon must navigate to a dedicated activity-detail route.

Use the route recommended during Phase 1 or the existing project route convention.

Pass only the activity identifier in the route.

Do not pass sensitive activity data through query parameters.

The backend must verify that the activity belongs to the authenticated Professional user.

The detail page itself will be completed in Phase 5.

## 7. Charts Position

Move these existing charts below the Activities table:

- PDUs by Category
- PDUs Over Time

Requirements:

- Reuse the existing chart implementation.
- Keep filters and selected date range consistent with the table where appropriate.
- Do not duplicate data fetching unnecessarily.
- Keep the charts responsive.
- Handle no-data states.
- Use the selected credit type dynamically when the project supports CPD and PDU.

## 8. Layout Order

The page order should be:

1. Page title and primary actions
2. New summary cards
3. Search and filter toolbar
4. Activities table
5. PDUs by Category
6. PDUs Over Time

## Testing

Test:

- Removed elements no longer render
- Refresh behavior
- Add Learning Activity behavior
- Summary-card calculations
- Debounced search
- Year filter
- Type filter
- Certificate filter
- Filter reset
- Pagination reset after filtering
- Icon action accessibility
- Delete confirmation
- Eye-icon navigation
- Charts rendered below the table
- Mobile layout

Run:

- TypeScript checks
- Frontend tests
- Backend tests affected by filters
- Linting
- Production build

Fix only errors introduced by this phase.

## Completion Report

Provide:

1. Elements removed
2. Summary calculations implemented
3. Filter behavior
4. Table action changes
5. Detail route selected
6. Chart layout changes
7. Files modified
8. Tests executed and results

STOP after completing the My Learning Activities page restructure.
