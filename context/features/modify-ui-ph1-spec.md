PHASE 1 — AUDIT THE PROFESSIONAL DASHBOARD

Inspect the existing LoopsKey codebase and prepare a detailed implementation plan for the requested Professional dashboard changes.

Do not modify, create, delete, or format any files in this phase.

The requested changes affect:

1. Professional dashboard sidebar
2. Professional dashboard Overview page
3. Wishlist filters
4. My Learning Activities page
5. Learning Activity detail view
6. Certificates tab
7. Certificate upload, edit, detail, filtering, status, linking, and download functionality

Inspect the relevant frontend, backend, database, storage, API, authentication, routing, and test files.

## 1. Professional Sidebar

Inspect the current sidebar implementation and locate these items:

- My Courses
- External Learning

Determine:

- Where they are defined
- Whether navigation is role-specific
- Whether these routes are used elsewhere
- Whether removing them from the sidebar is sufficient
- Whether any Overview cards or links still point to these routes

The request is to remove these items from the Professional sidebar for now.

Do not delete their underlying pages, routes, backend logic, or database entities unless they are completely unused and removal is explicitly justified.

## 2. Professional Overview

Inspect the current Professional Overview page and identify:

- Existing summary cards
- Current API calls
- Existing chart library
- Existing tooltip components
- Existing recommendation section
- Existing recent-learning-activity components
- Existing certificate components
- Current calendar API or event hooks
- CPD/PDU progress data sources
- Learning Roadmap progress data sources

The existing Overview cards will be replaced by:

- CPD/PDU Progress
- Learning Roadmap Progress
- Upcoming Calendar Items
- Recommendations for You
- Recent Learning Activities
- Certificates

Determine which data is already available and which APIs or calculations are missing.

## 3. Wishlist

Inspect the current Wishlist filter panel.

Locate these filters:

- Price filters
- Only Rated Items
- Only Available Links
- Select by Category

Determine:

- Whether filter state is stored in local state, query parameters, global state, or backend requests
- Whether removing the UI also requires removing query parameters
- Whether stale filters may remain in the URL or API request
- Whether mobile and desktop filter panels are separate implementations

## 4. My Learning Activities

Inspect the current page and locate:

- Export CSV
- Year selector
- Total PDU Earned card
- Target card
- Progress to Goal card
- Average per Month card
- Quick Actions card
- Add Learning Activity button
- Refresh button
- Search toolbar
- Activities table
- PDUs by Category chart
- PDUs Over Time chart
- Existing table filters
- Edit and delete actions
- Existing activity edit page
- Existing activity detail page, if any

Determine how the following data is calculated:

- Total activities completed and logged
- Certificates attached
- Evidence uploaded
- Activity type
- Activity year
- Associated certificate

Inspect whether activities already have a detail API and route.

## 5. Certificates

Inspect whether a Certificates tab already exists.

Determine whether the project already contains:

- Certificate entity or table
- Certificate frontend types
- Certificate API endpoints
- Certificate upload functionality
- Secure file storage
- Evidence file metadata
- CPD plan linking
- Certificate status calculation
- Certificate expiry reminders
- Certificate edit functionality
- Certificate download functionality
- Certificate filtering
- Existing certificate-related components

Inspect the existing file upload architecture and determine:

- Supported file types
- Maximum file size
- Storage provider
- Private-file access rules
- Signed URL or authenticated download behavior
- Existing file cleanup behavior

## 6. Architecture and Reuse

Inspect and identify reusable:

- Dashboard cards
- Chart components
- Tooltip components
- Table components
- Filter components
- Search hooks
- Debounce hooks
- React Hook Form setup
- Zod schemas
- Date pickers
- File upload components
- Confirmation dialogs
- Empty states
- Loading skeletons
- Pagination
- Route guards
- Query and mutation hooks
- Toast notifications
- Secure file download utilities

## Required Audit Report

Provide:

### Existing Functionality

Describe what is already implemented.

### Missing Functionality

Describe what is missing or incomplete.

### Relevant Files

List frontend, backend, database, storage, and test files likely to be modified.

### Data Sources

Explain where each new Overview card will obtain its data.

### Certificate Architecture

Explain whether the Certificate feature already exists and what must be added.

### Proposed Routes

Recommend routes for:

- Learning Activity details
- Certificate upload
- Certificate edit
- Certificate details, if needed

### Proposed API Changes

List APIs that should be reused or added.

### Proposed Database Changes

List entities, fields, relations, indexes, or migrations that may be required.

### Risks and Ambiguities

Explicitly identify any unclear requirements, including the requested “Link All Active” certificate action.

STOP after the audit report.

Do not implement any changes in this phase.
