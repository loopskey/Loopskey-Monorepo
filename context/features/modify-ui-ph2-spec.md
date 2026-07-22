PHASE 2 — PROFESSIONAL SIDEBAR AND OVERVIEW

Using the Phase 1 audit, implement the Professional sidebar and Overview page changes.

Do not modify Wishlist, My Learning Activities, Learning Activity details, or Certificates in this phase.

Reuse the existing project design system, chart library, API hooks, routing, responsive layout, and components.

## 1. Professional Sidebar

Remove these items from the Professional dashboard sidebar:

- My Courses
- External Learning

Requirements:

- Remove them from desktop and mobile navigation.
- Remove them only for the Professional role.
- Do not delete their underlying routes or business logic.
- Remove related separators or empty navigation groups.
- Ensure keyboard navigation remains correct.
- Ensure active-route highlighting still works.
- Ensure no broken sidebar links remain.
- Do not affect other roles.

Search the codebase for duplicate Professional navigation configurations and update all relevant implementations.

## 2. Replace Existing Overview Cards

Remove all existing summary cards currently displayed at the top of the Professional Overview page.

Replace them with these three primary dashboard cards:

1. CPD/PDU Progress
2. Learning Roadmap Progress
3. Upcoming Calendar Items

Below these cards, preserve or implement:

4. Recommendations for You

Below Recommendations for You, display:

5. Recent Learning Activities
6. Certificates

Do not remove unrelated Overview content unless it is part of the old card layout being replaced.

## 3. CPD/PDU Progress Card

Create a professional and responsive CPD/PDU progress card.

Display:

- Selected or primary CPD/PDU plan
- Earned credits
- Remaining credits
- Total required credits
- Completion percentage
- Compliance or progress status
- Reporting deadline when available

Use a pie or donut chart from the project’s existing chart library.

The chart must:

- Show earned versus remaining credits
- Include accessible tooltips
- Display exact values in the tooltip
- Include a text equivalent
- Handle zero and missing targets
- Handle progress above 100%
- Avoid misleading negative values
- Be responsive

Add a link such as:

View CPD/PDU Progress

The link must navigate to the existing Professional CPD/PDU Progress tab.

Preserve the selected plan when the application already supports multiple plans.

## 4. Learning Roadmap Progress Card

Create a responsive Learning Roadmap Progress card.

Display available information such as:

- Completed roadmap steps or activities
- Remaining roadmap steps or activities
- Total roadmap items
- Progress percentage
- Current phase or next recommended step
- Roadmap status

Use a pie or donut chart with professional tooltips and an accessible text equivalent.

Add a link such as:

View Learning Roadmap

The link must navigate to the appropriate Professional Learning Roadmap tab.

Do not invent random progress data.

If no roadmap exists, display an appropriate empty state and action.

## 5. Upcoming Calendar Items Card

Create an Upcoming Calendar Items card.

Display the nearest relevant upcoming calendar items, for example:

- Event title
- Date
- Time
- Event type
- Location or online status
- Number of days remaining

Use the existing calendar data and date utilities.

Requirements:

- Show a sensible limited number of upcoming items.
- Sort by the nearest upcoming date.
- Exclude past or cancelled items.
- Handle no upcoming items.
- Display dates in the project’s existing locale and timezone format.
- Avoid horizontal overflow on mobile.

Add a link such as:

View Calendar

The link must navigate to the Professional Calendar tab.

## 6. Recommendations for You

Keep the existing Recommendations for You section below the three primary cards.

Reuse the existing recommendation API and card components.

Do not replace real recommendation data with mock data.

Preserve:

- Loading states
- Empty states
- Error states
- Existing recommendation actions

## 7. Recent Learning Activities

Below Recommendations for You, add or preserve a Recent Learning Activities card.

Display a limited number of recent activities with relevant information such as:

- Activity title
- Activity type
- Completion date
- Credits or learning hours
- Status
- Evidence indicator

Add a link such as:

View All Learning Activities

Navigate to My Learning Activities.

## 8. Certificates

Beside or below Recent Learning Activities, based on responsive space, display a Certificates card.

Show useful certificate information such as:

- Active certificate count
- Expiring-soon count
- Nearest expiry date
- Recently uploaded certificate

Add a link such as:

View Certificates

Navigate to the Professional Certificates tab.

If certificate data is not implemented yet, create the UI integration in a way that can consume the Certificate API implemented in later phases.

Do not permanently hardcode fake certificate counts.

## 9. Loading and Error States

Each section must independently support:

- Loading
- Empty
- Error
- Successful data
- Partial API failure

A failure in one card must not prevent the rest of the Overview page from rendering.

Use existing skeleton and error components.

## 10. Responsive Layout

Verify the Overview on:

- Desktop
- Tablet
- Mobile

Requirements:

- Charts must resize correctly.
- Cards must not overflow.
- Links and buttons must remain accessible.
- Tooltips must work with pointer and keyboard interaction.
- Do not rely only on color to communicate progress.

## Testing

Add or update tests for:

- Professional sidebar items removed
- Other roles unaffected
- CPD/PDU progress calculations
- CPD/PDU navigation link
- Learning Roadmap progress
- Roadmap empty state
- Upcoming Calendar sorting
- Past events excluded
- Recent Learning Activities navigation
- Certificates navigation
- Loading and error states
- Responsive layout where supported

Run:

- TypeScript checks
- Frontend tests
- Linting
- Production build

Fix only errors introduced by this phase.

## Completion Report

Provide:

1. Sidebar files changed
2. Overview components reused
3. New Overview components created
4. Data sources used
5. Navigation routes used
6. Tests executed and results
7. Remaining work

STOP after completing this phase.
