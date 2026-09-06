# Association requirements tab and wizard

- Scope: `full`
- Branch: `feature/association-requirements-tab-ui`
- Base: `1e6c712`
- Status: `Submitted`
- Spec: `context/features/association-dashboard/04-requirements-tab-ui.md`

The specification calls this phase `front` and says "Contract Changes: None".
Both hold for the GraphQL schema and for `@loopskey/api-contracts` — this phase
adds no operation and no message code. Scope is nonetheless `full` because one
API change was unavoidable: see "The publish problems never reached the browser"
below.

## Acceptance

- [x] The four cards show total, published, draft and members covered; the first
      three filter the list beneath.
- [x] The list shows name, credit type and total, deadline, audience, status and
      members covered, filtered by status and paginated.
- [x] The details step collects every field, reveals a group picker for a group
      audience and a searchable member picker for specific members.
- [x] Continuing from the details step writes the draft before it advances.
- [x] Three rule cards, each labelled until configured, each openable, each
      optional.
- [x] Categories carry name, mapped category and credits; the running total is
      shown, an overflowing save is blocked, and a mapped category already used
      is disabled in the picker.
- [x] Evidence offers not required or required; required reveals the review
      choice and states plainly what "needs review" means.
- [x] Reporting collects the period, the submission window, grace days, late
      submission and reminders with their timing.
- [x] The review step summarises everything; a refused publish lists every
      problem and each links back to the step that owns it.
- [x] A published requirement's detail shows the full rule set, edits name and
      description, and renders the immutable fields read-only with the reason.
- [x] Assigning reports how many members the change added.
- [x] Charts are absent from the route's first-load JavaScript.
- [ ] Browser check of the six states — not run, see Gaps.

## Notes

- **The publish problems never reached the browser.** Phase 03's validator
  deliberately reports every problem in one pass, but
  `common/utils/graphql-error-formatter.ts` forwards only `code`, `message` and
  an explicit `details` record — `problems` was dropped at the transport edge,
  so the wizard could only ever have shown the first refusal. The service now
  puts them under `details`, which is the formatter's documented channel for
  structured facts a caller must act on. Only `problems` moved: `refuseImmutable`
  drops its `fields` list at the formatter the same way it always has, and this
  phase has no consumer for it, so it is left alone. One existing assertion
  moved with `problems`; the 8 association suites (81 tests) pass.
- The wizard's position is the URL, not component state:
  `?tab=requirements&requirement=<id>&step=<step>` is the wizard,
  `?tab=requirements&requirement=<id>` is the detail. A reload therefore resumes
  the same step against the same draft row, and a step is linkable.
- The details step writes on every continue: create-draft, then details, then
  audience. A half-built requirement is a real row before the user ever reaches
  step two.
- The allocation bar is fed by the form's own values rather than the server's,
  so the overflow is visible while typing — before the save the API would
  refuse. The refusal itself is still the API's; the bar only makes it visible
  early.
- The reporting card saves the reporting rules before the reminders. Reversed,
  the reminder write's cache invalidation refetches the requirement and resets
  the reporting form from stale server values before the reporting write reads
  them.
- Both charts follow phase 02: `useChartPalette` with fixed semantic slots,
  `next/dynamic` with a skeleton, an accessible name and description, and a
  hidden equivalent table. The coverage donut takes its description id from
  `useId`, because a table renders many of them and two rows can hold the same
  numbers.
- The member picker searches server-side through the phase 01 roster query
  rather than loading the roster, and is a `combobox`/`listbox` pair with
  `aria-activedescendant`, arrow-key and Enter handling, and a polite live
  region carrying a translated result count.

## Gaps

- **No browser check.** The scope gate asks for one across loading, empty,
  error, success, responsive and keyboard. The association dashboard sits behind
  `AssociationRouteGuard`, the API needs the project's Postgres on 127.0.0.1:15432,
  and that port is closed (the server on 5432 is not ours — the same condition
  phase 03 recorded). There is no way to reach an authenticated association
  session here, so the six states are verified by construction and by the
  build, not by observation. This is the one gate this phase does not clear.
- **No frontend tests.** The specification's focused checks name four component
  tests. `context/coding-standards.md` — "Frontend tests" — forbids creating any
  test file under `apps/front`, and that rule postdates this specification. The
  rule wins; the checks it names are not written.
- **The fourth card is not a filter shortcut.** The specification says each of
  the four filters the list. Total, published and draft do. "Members covered"
  is not a requirement status and the list query has no audience filter, so it
  carries the coverage donut instead of duplicating the published filter.
- **The wizard's rules step advances without writing.** Every rule card is
  optional and saves itself, so "Continue" from the rules step is navigation
  only. Details and publish both write.
- `recordedCredits` is still phase 05's, so the coverage donut counts assigned
  members, never progress.

## Verification

- `npm run codegen --workspace front` - pass; two files move, the document and
  the association operations module. `base.ts` is untouched.
- `npm run lint --workspace front` - pass
- `npm run check-types --workspace front` - pass
- `npm run build --workspace front` - pass
- `npm run bundle-report --workspace front` - `/dashboard/association` 1408.5 KB
  in 23 first-load chunks, against phase 02's 1399 KB in 24: the whole tab costs
  9.5 KB. Grepping every one of the 23 chunks for `recharts` and `XLSX` finds
  neither. Build and bundle-report were last run before the final trim of two
  unused exports; lint and type-check were re-run after it. CI rebuilds anyway.
- `npx jest src/modules/association` - pass (8 suites, 81 tests), covering the
  moved `details` envelope.
- Prettier run scoped to the changed source files; the generated GraphQL modules
  were reverted and regenerated rather than formatted.

## Submission

- Commit: `d5b3586`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/47 (targets `develop`, ready for review)
- CI: pass — "Lint, types, tests, build" green in 3m35s on `d6a88eb`
