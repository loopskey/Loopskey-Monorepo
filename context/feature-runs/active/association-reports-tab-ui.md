# Association reports tab, charts and drill-downs

- Scope: `front`
- Branch: `feature/association-reports-tab-ui`
- Base: `0d2538a`
- Status: `Submitted`
- Spec: `context/features/association-dashboard/09-reports-tab-ui.md`

Phase 08 merged, so every query this tab reads is on `develop`. No contract
change: this phase adds GraphQL documents and runs codegen.

## Decisions

- **The tab reads one document, not five.** `AssociationReportsOverview` asks
  for the summary, the distribution, compliance by group, progress by category
  and the trend in a single query. The specification's "all five cards and all
  four charts reflect that same filter" and "never leave two charts on
  different periods" then hold by construction: there is one filter, one
  request, one cache entry, and nothing to leave out of step. Five separate
  queries would have made that a timing property to hope for.
- **The URL is the filter.** `readAssociationReportView` parses the query
  string into the whole view — report, period, range, group, requirement,
  include-inactive, band, sort, direction, page — and
  `associationReportHref` writes it back. There is no filter state in React at
  all, so a shared link reproduces a view exactly, and returning from a member
  restores the filter because the URL never lost it.
- **Nothing is computed in the browser beyond formatting and ordering.** Every
  percentage, share, band and total on screen is a field phase 08 decided. The
  summary strips read `summary` and `distribution` rather than summing rows, so
  a strip cannot disagree with the cards above it. What the browser does is
  order rows, pick extremes, and format numbers and dates for the locale.
- **Two chart modules, both dynamically imported.** Recharts is the weight, not
  the eight small components around it, so splitting them across eight modules
  would have bought about two kilobytes and eight files. The four tab charts
  live in `association-report-charts.tsx`, the drill-down charts in
  `association-report-drilldown-charts.tsx`, and every use goes through
  `next/dynamic` with a fixed-height skeleton. Verified rather than assumed:
  recharts appears in no first-load chunk of `/dashboard/association`.
- **Each drill-down is its own module, loaded on demand.** The six report
  bodies are dynamically imported by `association-report-view.tsx`, so opening
  the reports tab does not pull the five reports you did not open.
- **Band colour has one home.** `association-compliance-bands.ts` now owns the
  band order, the chart-semantic mapping and the badge variants, and the phase
  06 member header imports them instead of keeping its own copies. That is what
  makes "each band keeps the same colour it has in every other tab" a fact
  about the code rather than a coincidence between two files.
- **A bounded fetch with local ordering, not server paging.** The three
  paginated reports fetch the API maximum of two hundred rows once and then
  sort and page in the browser. The alternative — cursor paging with a sort that
  only reorders the current page — would have made every column header lie.
  Phase 08 orders members by completion ascending, so the rows that fit are the
  ones furthest behind: when there are more, the tab says so, names both
  numbers, and asks for a narrower filter. The members it cannot show are the
  ones doing best, which is the least harmful truncation a compliance report
  could have.
- **The heatmap asks per group, because the API has no group-by-category
  query.** Each row is its own component issuing one `progressByCategory`
  filtered to that group, capped at the twelve largest. Members with no group
  are left out and the caption says why: a category breakdown can only be
  filtered to a named group. This is the one place the UI pays for a missing
  query rather than a missing screen. See Gaps.
- **The group drill-down's chart is groups by band, not groups by category.**
  The heatmap answers "which group is weak in which category" with numbers in
  cells; a grouped bar with one series per category would have restated it
  less legibly and needed the same fan-out. The chart shows the band split per
  group from the single group-progress query.
- **Missing evidence has no chart, deliberately.** The specification's own
  reasoning: the list is the finding.

## Notes

- The empty state keys off published requirements, not member count: an
  association with members but nothing published sees one explanatory card with
  a link to requirements, rather than five zeroed cards and four empty charts.
- A custom period with only one date set does not query at all. Every report is
  skipped and the tab asks for the missing date, so a half-typed range never
  produces a refusal from the API.
- Scroll position is restored from `sessionStorage`, keyed by the exact report
  URL, and only after the report's data has settled — restoring before the rows
  exist would scroll a short page. Every read and write is wrapped, because a
  browser refusing session storage should cost the scroll offset and nothing
  else.
- `computedAt` staleness is a fifteen-minute threshold in one constant. Past it
  the tab states when the figures were computed instead of implying they are
  live.
- Each chart carries `role="img"`, an accessible name, a description and a
  visually hidden table of the same numbers. The readiness chart's equivalent
  is its visible legend list, which already carries every segment's label,
  count and share.
- Sortable columns are buttons inside `th` elements carrying `aria-sort`, so
  the sort state is announced rather than only drawn.

## Gaps

- **No association login page exists yet.** `/auth/organization` refuses an
  association account with `INVALID_ROLE`, and no route passes `Role.Association`
  to the login form, so the browser check had to establish its session through
  the API's own login mutation. This is pre-existing and outside this phase, but
  it means no association owner can currently reach this tab through the UI. It
  belongs to whichever phase owns association authentication.
- **Sorting and paging cover the fetched rows, not the whole membership.** The
  API maximum is two hundred rows and offers no sort argument, so the three
  paginated reports sort and page what they fetched. The UI says so, and phase
  08's ascending order means the rows that fit are the ones furthest behind. A
  sort argument and deeper paging on the report queries would remove the
  limitation; phase 10's exports will meet the same cap.
- **The heatmap issues one query per group.** Capped at the twelve largest, and
  ungrouped members cannot be broken down by category at all, because the filter
  only accepts a named group. A `groupCategoryMatrix` query would replace the
  fan-out with one read.
- **The two chart `onClick` paths are unverified in the browser.** Clicking a
  bar in compliance by group, and a segment in the member-distribution donut,
  should open the drill-down filtered to that group or band. The payload
  extraction from recharts is the only part not covered by the checks above,
  and Docker stopped before it could be exercised. It is the first thing to
  click when the environment is next up.
- **The fixture is throwaway.** The seed script lives in the session scratchpad,
  not the repository, so it is not part of this manifest. A local PostgreSQL
  container named `loopskey-dev-db` was created on the port the dev environment
  expects; the Docker daemon has since stopped, so remove the container with
  `docker rm -f loopskey-dev-db` once Docker is running again.

## Acceptance

- [x] One filter drives all five cards and all four charts: they read one
      document, so there is nothing to fall out of step.
- [x] A chart click opens its drill-down filtered, and the URL reflects it —
      **partly verified.** What the browser exercised is the state the click
      produces: `&band=AT_RISK` showed only at-risk rows, and a header click
      wrote `&sort=percent&dir=desc`. The bar and donut-segment `onClick`
      handlers themselves were not exercised before the environment came down;
      they call the same `openReport` the "View full report" buttons call,
      differing only in reading `groupId` or the band off the recharts payload.
      See Gaps.
- [x] Back from a member returns the report with its filter and scroll intact.
      Verified: opening Member 16 from a row at scroll 1400 and pressing back
      returned to the same URL, the band filter still applied, scroll exactly
      1400, and the stored offset consumed.
- [x] An association with no requirements sees one explanatory state. Verified
      by unpublishing the fixture's requirements: one card, zero charts.
- [x] Chart colours come from theme tokens; a band keeps one colour everywhere.
      Verified in both themes; the band maps have one home.
- [x] Every chart exposes a name, a description and an equivalent table.
- [x] `bundle-report` shows recharts outside the dashboard shell: recharts
      appears in none of the twenty-three first-load chunks of
      `/dashboard/association`.
- [x] A stale `computedAt` is stated rather than implied live. Verified: the
      fixture's assignments carry a three-hour-old `computedAt` and the tab
      reads "Figures computed 4 Sept 2026".
- [x] Scope gate passes.

## Verification

- `npm run lint --workspace front` - pass
- `npm run check-types --workspace front` - pass
- `npm run build --workspace front` - pass, thirty-four static pages
- `npm run codegen --workspace front` - pass; the document gains 207 lines and
  `operations/association-dashboard.ts` 365, `base.ts` unchanged because phase
  08 already put every report type there
- `npm run bundle-report --workspace front` - pass; `/dashboard/association`
  is 1417.4 KB across 23 chunks, the same as the organization, provider and
  admin dashboards, so the tab added nothing to the shared shell. Checked
  rather than inferred: none of those 23 chunks contains recharts
- i18n parity: 145 report keys in `en.json`, 145 in `fr.json`, no key on one
  side only; every literal key used by a component resolves

### Browser check

Done for real this time, unlike phases 06 to 08. Docker was available, so the
run brought up PostgreSQL on the port `apps/api/.env` expects, applied all
migrations, seeded a throwaway association in the scratchpad (24 members, 3
groups plus an ungrouped cohort, 2 published requirements, 48 assignments, 121
credit attributions, one deactivated member, `computedAt` three hours old), and
drove Chromium against the real API.

- **Tab, light and dark, 1440px**: five cards with counts, shares and change
  lines; compliance by group as horizontal bars with the on-track threshold
  drawn as a dashed reference line and a muted member count beside each bar;
  progress by category as required against average earned, widest gap first;
  member distribution as a donut with the total in the centre and a percentage
  on each segment; the compliance trend as a stacked area by month; the report
  library with all six reports.
- **Group progress drill-down**: back action, title, answer, filter chips,
  summary strip, the band split per group, the sortable table, and the
  group-by-category heatmap — colour carrying the value with the number in
  every cell, and the note that ungrouped members are left out.
- **Member progress drill-down**: the furthest-ahead and furthest-behind
  strips, the band select, and the table.
- **Empty state**: verified by unpublishing the requirements.
- **Mobile, 390px**: no horizontal page overflow (document 375px against a
  390px viewport), the table becomes a sixteen-item card list, and the charts
  reflow to one column.
- **Keyboard and announcement**: a column header is a focusable button labelled
  "Sort by Completion", its `th` moves from `aria-sort="none"` to
  `"descending"`, and the URL gains the sort so the state is shareable.
- **Console**: zero errors on the tab and on every drill-down after the fixes
  below.

Two defects the browser found and this run fixed:

- **Duplicate React keys in the trend table.** Phase 08 clamps the last trend
  point to the period end, so two points can land in the same month and the
  formatted label was not unique. The table now keys by the point's instant.
- **Green bars for low completion.** Compliance by group painted every bar the
  renewal-ready green, which read as "these groups are ready" for a group at
  forty-four percent and diluted the band colour language. Average completion
  is not a band, so both average-completion bars now use a neutral palette slot
  and band colours keep their single meaning.

One thing worth knowing about capturing this surface: a full-page screenshot
resizes the viewport, which makes `ResponsiveContainer` re-measure and blank
every chart. The marks are there — verified by reading their geometry out of
the DOM — but they photograph empty. Viewport screenshots show them correctly.

## Submission

- Commit: `d5dfadc`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/52 (targets `develop`, ready for review)
- CI: see the PR checks on the final commit
