PHASE 8 — PROFESSIONAL DASHBOARD END-TO-END REVIEW

Perform a complete end-to-end review of all Professional dashboard changes completed in the previous phases.

Do not add unrelated features or redesign working pages.

Review:

1. Professional sidebar
2. Professional Overview
3. Wishlist filters
4. My Learning Activities
5. Learning Activity details
6. Certificates
7. Certificate file access
8. Cross-page data updates

## 1. Sidebar Verification

Verify:

- My Courses is removed from the Professional sidebar.
- External Learning is removed from the Professional sidebar.
- Mobile and desktop navigation match.
- Other roles are unaffected.
- No broken links or empty navigation sections remain.

## 2. Overview Verification

Verify:

- Old Overview cards are removed.
- CPD/PDU Progress displays correct data.
- CPD/PDU chart tooltips work.
- Learning Roadmap Progress displays correct data.
- Upcoming Calendar Items are sorted correctly.
- Recommendations for You remains functional.
- Recent Learning Activities works.
- Certificates card works.
- All links navigate to the correct tabs.
- Independent loading and error states work.

## 3. Wishlist Verification

Verify:

- Price filters are removed.
- Only Rated Items is removed.
- Only Available Links is removed.
- Category filter is removed.
- Legacy URL parameters do not break the page.
- Remaining filters, search, sorting, and pagination work.

## 4. My Learning Activities Verification

Verify:

- Export CSV is removed from this page.
- Top-level Year selector is removed.
- Old summary cards are removed.
- Quick Actions is removed.
- Refresh works.
- Add Learning Activity works.
- New activity and evidence summary cards are correct.
- Search and filters work.
- Year, Type, and Certificate filters work.
- Table action icons are accessible.
- View, Edit, and Delete work.
- Charts appear below the table.
- Detail page Cancel and Edit actions work.
- Filters are preserved after returning from details.

## 5. Certificates Verification

Verify:

- Certificate creation
- Certificate edit
- Secure file upload
- Secure download
- Status calculation
- Active summary
- Expiring Soon summary
- Expired summary
- Table filtering
- Search
- Pagination
- Row selection
- Detail card
- CPD plan linking
- Overview integration
- Learning Activity Certificate filter integration

## 6. Certificate Date Boundaries

Verify status behavior for:

- Expired yesterday
- Expires today
- Expires in 1 day
- Expires in 7 days
- Expires in 89 days
- Expires in 90 days
- Expires in 91 days

Use one consistent timezone and document the exact boundary.

## 7. Security Review

Verify that:

- Professional users cannot access another user’s activities.
- Professional users cannot access another user’s certificates.
- Professional users cannot download another user’s evidence.
- CPD plans belonging to another user cannot be linked.
- User IDs from the frontend are not trusted.
- Private storage URLs are not exposed.
- File validation is enforced on the backend.
- Deleted or replaced files are handled according to project policy.

## 8. Accessibility Review

Verify:

- Icon-only buttons have accessible labels.
- Tooltips are keyboard accessible.
- Charts have text equivalents.
- Status is not communicated only through color.
- Forms have labels and errors.
- Focus order is logical.
- Side detail cards work on mobile.
- Dialogs manage focus correctly.

## 9. Performance Review

Verify:

- Duplicate API requests are avoided.
- Overview cards do not fetch the same data repeatedly.
- Searches are debounced.
- Pagination is server-side when required.
- Query invalidation is targeted.
- Large evidence files are not loaded into memory unnecessarily.
- Table rendering remains responsive.

## 10. Required Commands

Run all relevant:

- Frontend unit tests
- Frontend integration tests
- Backend unit tests
- Backend integration tests
- Authorization tests
- File upload and download tests
- Database migration validation
- TypeScript checks
- Linting
- Production frontend build
- Production backend build

Clearly distinguish:

- Tests executed successfully
- Tests that failed because of this work
- Pre-existing failures
- Commands that could not be executed

Do not claim a test passed unless it was executed successfully.

## 11. Final Report

Provide:

1. Sidebar changes
2. Overview changes
3. Wishlist changes
4. My Learning Activities changes
5. Activity Details implementation
6. Certificate data model
7. Certificate status rules
8. Certificate upload and storage
9. Secure download behavior
10. CPD plan linking
11. Authorization protections
12. Accessibility improvements
13. Tests executed and results
14. Pre-existing failures
15. Required environment or storage configuration
16. Remaining assumptions or limitations

Fix only issues directly related to these Professional dashboard changes.

STOP after the final review and report.
