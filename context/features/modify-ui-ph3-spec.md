PHASE 3 — SIMPLIFY PROFESSIONAL WISHLIST FILTERS

Using the previous audit, simplify the filter interface in the Professional Wishlist tab.

Do not modify the Overview, My Learning Activities, or Certificates in this phase.

## Remove These Filters

Remove:

- All price-related filters
- Only Rated Items
- Only Available Links
- Select by Category

Remove them from:

- Desktop filter panel
- Mobile filter drawer
- Active filter chips
- Filter-count indicators
- Saved filter state
- URL query parameters
- API request construction
- Reset-filter behavior

Do not remove unrelated supported filters.

## Cleanup Requirements

After removing the filters:

- Remove obsolete frontend state.
- Remove unused form fields.
- Remove obsolete Zod fields if applicable.
- Remove unused types and constants.
- Remove unused API query parameters.
- Remove stale default values.
- Remove unused imports.
- Remove empty filter sections and separators.
- Ensure Clear Filters still works correctly.
- Ensure old bookmarked URLs with removed query parameters do not break the page.
- Ignore or safely clean unsupported legacy query parameters.

Do not modify the backend when removed query parameters are still used by other pages.

Only remove backend parameters if they are exclusive to Wishlist and confirmed unused elsewhere.

## Preserve Existing Functionality

Preserve:

- Wishlist search
- Sorting
- Pagination
- Remaining valid filters
- Loading states
- Empty states
- Error states
- Wishlist item actions
- Responsive behavior

## Testing

Test:

- Removed filters are not rendered.
- Mobile and desktop filters match.
- Remaining filters still work.
- Clear Filters works.
- Old URL parameters do not break the page.
- API requests no longer include removed Wishlist parameters.
- Search, sorting, and pagination still work.

Run:

- TypeScript checks
- Frontend tests
- Linting
- Production build

Fix only errors introduced by this phase.

## Completion Report

Provide:

1. Filters removed
2. State and query parameters removed
3. Files modified
4. Remaining Wishlist filters
5. Tests executed and results

STOP after completing the Wishlist filter changes.
