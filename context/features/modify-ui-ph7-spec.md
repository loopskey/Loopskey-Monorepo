PHASE 7 — PROFESSIONAL CERTIFICATES TAB

Implement the complete Professional Certificates tab using the backend completed in Phase 6.

This must be fully functional and must not use permanent fake certificate data.

Reuse existing project components, forms, date pickers, file upload, tables, cards, filters, dialogs, icons, tooltips, React Hook Form, Zod, query hooks, and mutation hooks.

## 1. Professional Navigation

Add or complete the Professional sidebar item:

Certificates

Ensure:

- Correct role visibility
- Correct active state
- Desktop and mobile navigation
- Accessible keyboard navigation
- No duplicate navigation item

## 2. Page Header

Use a clear page title:

Certificates

Add a primary action:

Upload Certificate

The action must open the certificate creation page or the project’s appropriate full-screen form pattern.

## 3. Certificate Summary Cards

Create professional responsive summary cards.

### Active Certificates

Display the number of Active certificates.

The requested action was described as:

Link All Active

Inspect the product architecture before implementing this action.

If bulk-linking active certificates to a CPD/PDU plan is already supported or clearly required:

- Implement a secure bulk-link flow.
- Require the user to select the destination CPD/PDU plan.
- Do not overwrite existing links without confirmation.
- Show a result summary.

If bulk linking is not supported by the domain model, do not invent misleading behavior.

In that case, use:

View All Active

and document this decision in the completion report.

### Expiring Soon

Display certificates expiring within 90 days.

Show:

- Count
- Nearest expiry date where available

Add:

View Expiring

This action should filter the table to Expiring Soon.

The user mentioned a one-week threshold in one part of the requirement but later explicitly defined Expiring Soon as within 90 days.

Use the backend’s 90-day status rule for consistency.

Optionally highlight certificates within seven days as urgent, but do not redefine the main Expiring Soon status.

### Certificate Status

Display a status breakdown:

- Active
- Expiring Soon
- Expired

Add:

View All Certificates

This action clears certificate status filters.

Use real backend summary counts.

## 4. Upload Certificate Form

When the user clicks Upload Certificate, open a dedicated page or established full-screen form pattern.

Fields:

### Certificate / Licence

- Required text input

### Issuer

- Required text input

### Certification ID

- Optional text input

### Issue Date

- Required date field

### Expiry / Renewal Date

- Required date field
- Must not be before Issue Date

### Linked to CPD Plan

- Optional select
- Load only the authenticated Professional user’s plans
- Allow no plan
- Show appropriate empty state

### Evidence File

- Required file input
- Display selected filename
- Display upload validation errors
- Follow backend size and type rules
- Allow removing and replacing the selected file before submission

Actions:

- Save Certificate
- Cancel

### Save Certificate

On success:

- Persist the certificate.
- Upload the file securely.
- Return to Certificates.
- Refresh summary cards and table.
- Select or highlight the newly created certificate when appropriate.
- Show a success notification.

Prevent duplicate submissions.

### Cancel

Return to the Certificates page without saving.

If the form has changes, use the project’s existing unsaved-changes confirmation pattern.

## 5. Certificate Edit

Add an edit action for every certificate.

Reuse the same certificate form component.

The edit form must:

- Load existing data
- Show current evidence filename
- Allow keeping the existing evidence
- Allow replacing the evidence
- Validate ownership
- Allow linking or unlinking a CPD/PDU plan
- Recalculate status after changing the expiry date

Do not create a separate duplicated edit form.

## 6. Filter and Search Area

Above the table, add a filter toolbar.

Include appropriate filters such as:

- Search
- Status
- Issuer
- Linked CPD Plan
- Expiry period where useful
- Clear Filters

Search should cover:

- Certificate or Licence
- Issuer
- Certification ID

Use the existing debounce hook.

Requirements:

- Reset pagination when filters change.
- Keep filter state consistent with the project’s URL-query pattern.
- Support mobile layout.
- Show loading states for async options.

## 7. Certificate Table

Display these columns:

- Certificate / Licence
- Issuer
- Issue Date
- Expiry Date
- Status
- Linked To
- Actions

Requirements:

- Use the project’s existing table.
- Support pagination.
- Support sorting where available.
- Use consistent date formatting.
- Display status with text and accessible visual treatment.
- Do not rely only on color.

### Actions Column

Add an icon-only edit action.

Use:

- Tooltip
- Accessible aria-label
- Keyboard focus state

Add other actions only when supported by the existing product, such as delete.

Do not add destructive behavior without confirmation.

## 8. Row Selection and Side Detail Card

When the user selects a table row, display that certificate’s details in a card beside the table on desktop.

On smaller screens, display the details:

- Below the table
- In a drawer
- Or in the project’s established responsive detail pattern

The selected detail card should display:

- Certificate / Licence
- Issuer
- Certification ID
- Issue Date
- Expiry / Renewal Date
- Status
- Linked CPD/PDU plan
- Evidence filename
- Upload date
- Created date
- Updated date

Clearly highlight the selected row.

Support direct data refresh when the selected certificate is edited.

## 9. Download Certificate

Add a button in the detail card:

Download Certificate

This button must securely download the uploaded evidence file.

Requirements:

- Use the authenticated backend download endpoint.
- Preserve the original filename when safe.
- Show loading state.
- Handle unavailable or deleted files.
- Handle unauthorized responses.
- Do not expose a permanent private-storage URL.
- Do not create a fake generated certificate.

If the project has a separate generated certificate-summary format, keep it as a different clearly labeled action.

## 10. Empty and Error States

Provide complete states for:

- No certificates
- No filtered results
- Loading
- Backend error
- Missing evidence
- Expired download link
- No CPD plans available
- Certificate deleted while selected

## 11. Refresh Other Features

After certificate creation or edit, ensure related areas refresh where applicable:

- Certificates summary cards
- Certificates table
- Overview Certificates card
- My Learning Activities Certificate filter
- CPD/PDU plan-linked data

Use query invalidation rather than full browser reload when supported.

## 12. Testing

Test:

- Certificates tab navigation
- Summary counts
- Active filter
- Expiring Soon filter
- Expired filter
- View all
- Upload form validation
- Issue and expiry date validation
- Optional Certification ID
- Optional CPD plan
- Evidence file validation
- Successful creation
- Cancel behavior
- Unsaved changes
- Edit
- Evidence replacement
- Search debounce
- Status filtering
- Pagination
- Row selection
- Side detail card
- Responsive detail layout
- Secure download
- Unauthorized certificate access
- Overview refresh
- Learning Activity Certificate filter refresh

Run:

- Frontend tests
- Backend integration tests
- TypeScript checks
- Linting
- Production frontend build
- Production backend build

Fix only errors introduced by this phase.

## Completion Report

Provide:

1. Certificate navigation
2. Summary cards
3. Meaning selected for “Link All Active”
4. Upload and edit forms
5. Table and filters
6. Detail-card behavior
7. Download behavior
8. Cross-page query invalidation
9. Files modified
10. Tests executed and results
11. Assumptions or limitations

STOP after completing the Certificates frontend.
