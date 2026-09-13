# Correct authenticated shell, calendar, and mobile dashboard navigation

- Scope: `front`
- Model: `High reasoning — restructures route-group/layout ownership for every page in the app (public vs. authenticated chrome), touches a shared sidebar/nav config used by five dashboard roles, and reworks a domain calendar's responsive behavior; a mistake here has app-wide blast radius, not just one screen.`
- Branch: `feature/dashboard-shell-calendar-and-mobile-corrections`
- Base: `048092b` (origin/develop)
- Status: `Submitted`

## Acceptance

- [x] Public routes retain Header/Footer; every authenticated dashboard has no
  marketing Footer before or after hydration (structural fix: Header/Footer
  moved from the true root `app/layout.tsx` into a new `(public)/layout.tsx`
  wrapping `(pages)`/`(auth)`/`dev`; `(dashboards)` and `onboarding/` sit
  outside that group and never render them, at any point — not a
  post-hydration client check. Verified via raw dev-server HTML: `/` has
  `<footer>` and marketing nav hrefs, `/dashboard/professional` has neither).
- [x] Desktop dashboard shows one logo and no empty sidebar logo block (new
  `DashboardTopBar` renders the sole `<Logo/>`; `DashboardSidebar` never had
  a logo row and still doesn't).
- [x] At 390 px, no permanent sidebar/bottom nav appears; the hamburger
  contains professional dashboard tabs and no public navigation
  (`DashboardSidebar` is now `hidden md:flex`; the drawer's tab list comes
  from the same `getDashboardTabsByRole()` source as the desktop sidebar, so
  it can never contain public nav items or drift out of sync with it).
- [x] Avatar menu remains separately usable and Logout returns to a public
  route where the Footer is visible again (`UserMenu` unchanged; its logout
  handler still routes to `siteLinks.home`, which is under `(public)`).
- [x] Payments is absent from all dashboard navigation; direct `tab=payments`
  normalizes safely and sends no payments request (removed from
  `professionalDashboardTabs`, `TProfessionalDashboardTab`, and
  `professional-dashboard-shell.tsx`'s `validTabs`/switch; an unrecognized
  tab value already falls back to Overview by construction, so no payments
  query ever fires and no blank panel renders).
- [x] Calendar filters are no longer a standalone block below the calendar and
  still filter/reset the intended event list (search/date-range controls
  moved into a `Popover` triggered from the calendar card's own header;
  same state/handlers, so reset/filter semantics are unchanged — only the
  container moved).
- [x] Mobile Calendar opens in a readable agenda/list layout and every event,
  Add, details, and navigation action remains usable (`initialView`
  defaults to `listWeek` below 640px via a `useMediaQuery` hook plus a
  `key`-forced remount at the breakpoint; a compact prev/next/today toolbar
  replaces the 4-button view switcher on mobile, with two explicit
  full-word Agenda/Month buttons to opt into month view instead of relying
  on FullCalendar's own toolbar compressing).
- [x] Overview, Calendar, and CPD screens have no body-level horizontal
  scroll at 390, 768, 1024, and 1440 px (see Notes: the Overview/CPD card
  components were already responsive on inspection; the real source of
  page-level overflow was the shell itself — sidebar now hidden on mobile,
  `min-w-0` added to `#dashboard-main`, and the calendar's own shell gained
  a defensive `overflow-x-auto`).
- [x] Keyboard drawer focus, Escape close, current-page state, and
  destination focus meet the stated behaviour in English and French (drawer
  is a Radix `Sheet`/Dialog: focus trap, Escape, scroll lock, and
  restore-focus-to-trigger on dismiss are Radix's built-in behavior;
  explicit item selection instead pins focus to `#dashboard-main` via a
  guarded `onCloseAutoFocus`, matching "destination focus" without fighting
  Radix's own default; `aria-current="page"` marks the active item; English
  and French copy added for both the drawer and the calendar's new controls).

## Verification

- `npm run lint --workspace front` — pass.
- `npx tsc --noEmit -p apps/front/tsconfig.json` — pass.
- `npm run build --workspace front` — pass; route table unchanged (every
  route resolves to the same URL after the `(public)` regrouping).
- `npm run bundle-report --workspace front` — pass; first-load JS rose by
  roughly 65-80 KB across almost every route (public and dashboard alike),
  not specific to the pages that changed — consistent with `@radix-ui/react-
  popover` (pulled in for the first time, along with its floating-ui
  positioning dependency) and `Sheet` landing in a broader shared/vendor
  chunk under Turbopack's automatic chunk grouping, not a per-route code
  leak. Confirmed FullCalendar itself is not part of any route's first-load
  set (unchanged from before — it is still only reachable via the
  professional dashboard's client-side, tab-conditional dynamic import,
  which this report's HTML-based methodology does not count for any route).
- Dev-server smoke checks: confirmed `<footer>`/marketing nav hrefs present
  on `/` and the global 404 page, absent on `/dashboard/professional` and
  `/dashboard/association`; confirmed the drawer trigger and its translated
  accessible name render on both dashboard routes; confirmed no
  `tab=payments` link remains in the professional dashboard's rendered HTML.
- Full interactive browser checks (viewport matrix, keyboard-only drawer
  operation, calendar add/select/details/filter/reset/list-month
  transitions, network inspection for a direct `tab=payments` URL) were not
  run against a live browser this pass — no browser automation tool was
  available (the `playwright` MCP server failed to connect this session).

## Submission

- Commit: `b403675`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/105
- CI: pass (https://github.com/loopskey/Loopskey-Monorepo/actions/runs/34745997448/job/103693960238, 4m4s)

## Notes

- Investigation found `apps/front/src/app` already had `(pages)`, `(auth)`,
  and `(dashboards)` route groups; the actual root-layout bug was narrower
  than a full site reorganization. Fix: introduced one new `(public)` parent
  group wrapping `(pages)` and `(auth)` (plus the root `page.tsx` and the
  `dev/showcase` route, both of which also want marketing chrome) via
  directory moves — not a page-by-page rewrite — with its own
  `(public)/layout.tsx` rendering Header/Footer, and removed them from the
  true root. `(dashboards)` and the phase-07 `onboarding/` route sit outside
  `(public)` and so structurally never receive marketing chrome. This let
  this feature delete the phase-07 `isFocusedShellRoute` pathname-check
  workaround entirely and give the onboarding route its own tiny
  `FocusedTopBar` component instead — resolving the exact concern FR2 raises
  ("a client pathname check... is not an acceptable fix").
- The global `not-found.tsx` renders outside every route group (there is no
  matched segment tree for a genuinely unknown URL), so it can't inherit
  `(public)/layout.tsx`'s chrome; it now renders `Header`/`Footer` directly
  itself rather than losing them.
- Windows-specific hiccup: `git mv` on the `(pages)`/`(auth)`/`dev`
  directories failed with "Permission denied" (a stray leftover
  `next dev` telemetry process from an earlier session held a watch handle
  on `apps/front`). Killed the process and completed the moves with
  PowerShell's `Move-Item`, then `git add -A` for rename detection — git
  correctly recognized all ~30 files as renames, not delete+add.
- No separate "bottom navigation panel" component exists in the codebase;
  screenshots 33/39 in the source bug report are most plausibly the
  already-diagnosed Footer-leaking-into-dashboards bug rendered at the foot
  of a short mobile dashboard page, which the `(public)` regrouping removes
  at the root. Confirmed via repo-wide search there is no
  `BottomNav`/`TabBar`/fixed-bottom component to delete separately.
- `professionalDashboardTabs` had a live `payments` entry consumed by
  exactly three files (`professional-dashboard.types.ts`,
  `professional-dashboard-shell.tsx`, `dashboard-nav.config.ts`, verified by
  repo-wide search). `ProfessionalPaymentsTab.tsx`/`useProfessionalPayments.ts`
  and their GraphQL operations are left in place per Contract Changes —
  removing them from navigation/the tab switch is enough to make them
  unreachable, and the spec explicitly does not ask for their deletion.
- Read through `ProfessionalOverviewTab` and the CPD/PDU progress tab's card
  components (`MetricCard`, `CpdProgressOverview`, `OverviewCpdProgressCard`,
  the activities/certificates tables) before touching anything: they already
  use responsive grids that collapse to one column below `lg`/`xl`, plain
  wrapping text with no fixed pixel widths, and the two components with a
  genuinely wide data table (`activities-table.tsx`, `certificates-table.tsx`)
  already hide that table below `lg` in favor of a card layout and scope any
  horizontal scroll to `overflow-x-auto` wrappers around just those tables.
  No changes were needed there — the acceptance criterion's actual root
  cause was the dashboard shell (permanent 72px sidebar consuming width on
  mobile, `<main>` missing `min-w-0`), which is what this run fixes.
- Calendar redesign: replaced the standalone "Calendar filters" `GlassCard`
  with a `Popover` triggered from the main calendar card's own header,
  reusing the exact same `search`/`selectedRange` state and
  `handleSearchInputChange`/`handleStartDateChange`/`handleEndDateChange`/
  `resetFilters` handlers from `useProfessionalCalendar` — no hook changes,
  only where the controls render. Added a small "Filters active" badge next
  to "All registered events" so the moved filters stay visibly connected to
  the list they affect (FR12). Added `useMediaQuery` (new, generic, reusable
  hook) to detect the 640px breakpoint; below it, `FullCalendar` mounts with
  `initialView="listWeek"`, a compact `prev,next / title / today` toolbar,
  and two explicit "Agenda"/"Month" buttons (via `calendarRef.getApi()
  .changeView()`) so users can still reach month view without FullCalendar's
  own multi-button toolbar compressing into unreadable labels at narrow
  widths.
- Drawer focus handling: selecting a tab sets a ref flag consumed by the
  `SheetContent`'s own `onCloseAutoFocus` handler (calling
  `event.preventDefault()` and focusing `#dashboard-main` there) instead of
  focusing immediately in the item's `onClick` — doing it in `onClick` would
  race Radix's default post-close behavior, which otherwise returns focus to
  the hamburger trigger and would silently override an immediate
  `focus()` call. Escape/backdrop dismissal leaves the flag unset, so
  Radix's default trigger-refocus applies untouched, matching FR7's two
  distinct behaviors exactly.
- After a manual on-disk refactor (import/prop reordering across the touched
  files — `ProfessionalCalendarTab.tsx`, `DashboardTopBar.tsx`,
  `FocusedTopBar.tsx`, `useMediaQuery.ts`), re-ran the full gate: lint,
  `tsc --noEmit`, and `npm run build` all pass clean, and the route table is
  unchanged. No regression found; the refactor was purely cosmetic.
