# roadmap-tab-redesign

- Scope: `front`
- Model: `Standard development — a frontend redesign of one dashboard tab inside existing element, Radix and Tailwind patterns; it removes an unused query but changes no contract the API serves.`
- Branch: `feature/roadmap-tab-redesign`
- Base: `d4b8f44e3026e39681ad5f6c87fe5590aaced780`
- Status: `Submitted`

## Acceptance

- [x] The Roadmap tab is one working column (roadmap header, next step, then the learning path) beside a sticky summary rail, with Recommended and Explore behind tabs.
- [x] Enrolled roadmaps are compact tiles that switch the workspace without scrolling; the row is hidden when there is one roadmap, search appears from seven roadmaps, and pagination only when there is more than one page.
- [x] The next step has the single primary action (Start, then Mark complete) and a link to its content; a finished roadmap shows a completion card.
- [x] Journey timeline and learning path are one vertical timeline; each step has Open and a menu for start, complete and details.
- [x] The summary rail holds progress, phases, duration, target date with overdue state, steps done this week, streak, CPD credits and the coverage note.
- [x] Unenroll moved to the roadmap menu and still asks for confirmation.
- [x] Mobile: no horizontal scroll and no control overlapping a step title.
- [x] Loading, empty, load-error (with retry) and no-search-match states exist.
- [x] Category artwork is redrawn as square tiles and used for roadmap tiles, the roadmap header and the explore list.
- [x] Removed what the redesign made unused: the stats strip and overall-progress section with the `ProfessionalRoadmapStats` query, endpoint and cache tag; `RoadmapCard`, `RoadmapHero`, `RoadmapJourneyTimeline`, `RoadmapRecommendationsCard`; the step deep-link helpers; 45 translation keys in English and French.
- [x] Roadmap coach is one fixed-height workspace: only the conversation scrolls and the composer stays docked (the page no longer scrolls under a 55vh transcript box).
- [x] Four stages (Goal, Preferences, CPD setup, Review) with progress run above the conversation; the coach has an avatar and name; system notes are chips; quick answers sit under the question they answer.
- [x] The composer is one auto-growing field with the send button inside; the correction hint moved into the placeholder.
- [x] The brief is an always-open checklist (answered, asking now, not answered; required fields marked) with per-field inline editing and the CPD setup inside its group; Generate lists every missing answer as a link to that field.
- [x] On phones the brief opens from a progress pill in the header as a bottom sheet.
- [x] The sidebar highlights Roadmap, not Overview, on the coach page.
- [x] Coach keys the old layout used (subtitle, correction and divider hints, section badges, fix actions, missing messages) removed from English and French.

- [x] Dashboard sidebar (all roles): items grouped under small headings, hover no longer looks like the active tab, Help & Support and a collapse button replace the raw role label, and the collapsed 76px rail shows tooltips on hover or keyboard focus only; the choice is remembered per browser.
- [x] The top bar spans the full width with the logo above the sidebar, and the dashboard no longer scrolls by 1px.
- [x] On phones the same labelled sidebar opens as a drawer that pushes the page aside from a menu button in the top bar; the hamburger-and-title bar, the icon-only drawer and its automatic tooltips are gone. The drawer closes on navigation, tap outside, the close button or Escape, moves focus in and back, and locks page scroll.
- [x] The sidebar no longer flashes its skeleton when the current user refetches.
- [x] "CDP Categories" corrected to "CPD Categories" (English and French); unused shell keys removed.

## Verification

- `npm run codegen` (apps/front) — pass, only `operations/professional.ts` changed
- `npx tsc --noEmit` (apps/front) — pass
- `npm run lint` (apps/front, includes i18n checks) — pass
- `npx prettier --check` on the touched files — pass
- `npm run build` (apps/front, development environment values) — pass
- `npm run bundle-report` (apps/front) — pass, budgeted public routes unchanged
- Browser check of the real tab on the dev server with mocked GraphQL responses, 1440px: in-progress, not-started (overdue, CPD) and completed roadmaps; tile switching; tabs; start and complete from the next-step card and the step menu; step details; description toggle; unenroll dialog; empty state; load error and retry — pass
- Browser check at 390px: no horizontal scroll, no overlapping controls — pass
- Single-roadmap layout (tile row hidden), pagination, search and the French copy in the browser — not run
- Roadmap coach on the dev server with mocked GraphQL, 1440px: answer by chip, multi-select with confirm, typed answer, thinking state, stage progress, brief updates, inline edit of a single-choice field, text editor open and cancel, CPD setup group, Generate enabled and navigating to the Roadmap tab, sidebar active item — pass
- Roadmap coach at 390px: no page scroll, no horizontal scroll, brief sheet, composer growth — pass
- Roadmap coach failed send and retry, rate-limit countdown, Start over, load error, date widget and suggestion sheet in the browser — not run
- Dashboard navigation on the dev server with mocked GraphQL: professional at 1440 (groups, hover, collapse, tooltip, collapse kept after reload) and 1920 (logo above sidebar, no page scroll); admin at 1440x800 (11 items scroll without a scrollbar); professional and admin drawer at 390 (open, keyboard focus, navigate, tap outside, Escape, focus return, no horizontal scroll) — pass
- Provider, organization and association sidebars, and tablet widths (768-1023), in the browser — not run
- Check against a running API — not run, no API or database in this workspace

## Submission

- Commit: `8457a51`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/305
- CI: pending
