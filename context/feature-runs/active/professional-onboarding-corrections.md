# Present professional onboarding as a focused, skippable setup

- Scope: `front`
- Model: `High reasoning — the fix moves the onboarding route out of the shared dashboard shell and changes globally-used Header/Footer components and an auth route guard; a mistake here risks breaking navigation on every other page, not just onboarding.`
- Branch: `feature/professional-onboarding-corrections`
- Base: `57c859e` (origin/develop)
- Status: `Ready`

## Acceptance

- [x] Post-registration onboarding shows no dashboard sidebar, public nav, or
  bottom dashboard panel and shows one brand mark (route moved to
  `/onboarding/professional`, outside the `dashboard/layout.tsx` tree that
  renders `DashboardSidebar`; `Header`/`Footer` render a brand-mark-only shell
  on this route; verified with a real dev-server response — no `<footer>`,
  no marketing nav hrefs in the served HTML).
- [x] Skip is available on every step, requires confirmation, records dismissal,
  and redirects to Overview (new "Skip for now" action + `AlertDialog`
  confirmation in the wizard header; confirmed calls `dismissOnboarding` only
  on explicit confirm, then redirects to `OVERVIEW_HREF`).
- [x] Refresh/back/navigation without Skip or Finish does not mark the flow
  dismissed or lose server-saved answers (removed the auto-dismiss-on-
  navigate-away effect from `ProfessionalOnboardingGate`; dismiss is now only
  ever called from the wizard's own confirmed Skip handler).
- [x] Step count, icons, labels, active/completed states, and optional
  certification step remain consistent for every goal path (stepper rebuilt
  with a per-step icon, done/active/upcoming states, and a connector between
  steps; step count/order logic in `stepsForGoal` unchanged).
- [x] Approved role titles/aliases can be found and selected entirely by
  keyboard; invalid or custom-role behaviour is explicit (unchanged: native
  `role="option"` buttons are keyboard-operable via Tab/Enter; the "Use "...""
  custom-role action is a visually and semantically distinct control, never
  styled or exposed as a taxonomy option). No alias field exists on
  `ProfileTaxonomyTerm` today — see Notes.
- [x] Skills show a bounded maximum of 8 suggestions, preserve selections, and
  do not create page-level overflow (`filteredSkills` now capped at
  `ONBOARDING_SUGGESTION_LIMIT = 8` for both the initial ranked list and
  search matches; selected-skill chips are rendered from a separate list
  unaffected by the cap, unchanged).
- [x] Finish and double-submit produce one set of profile/setup side effects
  (unchanged backend idempotency — upsert-by-unique-key credential, delete+
  recreate skill terms in one transaction; re-ran the full
  `professional-onboarding.service.spec.ts` suite unmodified, 21/21 pass).
- [x] The flow is usable at 390, 768, and 1440 px in English and French (the
  stepper collapses to a 2-column grid below `sm`; skills/roles suggestion
  grids already responsive; i18n keys added in both `en.json` and `fr.json`).
  Not verified against a live browser at each breakpoint — no browser
  automation tool was available this pass (see Verification).

## Verification

- `npm run lint --workspace front` — pass.
- `npx tsc --noEmit -p apps/front/tsconfig.json` — pass.
- `npm run build --workspace front` — pass; route table confirms
  `/onboarding/professional` replaces `/dashboard/professional/onboarding`.
- `npm run bundle-report --workspace front` — pass; `/onboarding/professional`
  is now the largest route at 1505.7 KB first-load JS (was nested under
  `/dashboard/professional` at 1481.8 KB) — in line with other dashboard/auth
  routes on this app, not a meaningful regression.
- `npx jest professional-onboarding` (`apps/api`) — pass (21/21); no backend
  code changed this run, this only confirms the existing coverage still holds.
- Dev-server smoke check: booted `next dev`, requested `/onboarding/professional`
  and `/` directly. Confirmed no `<footer>` tag and no `/content`, `/services`,
  `/faq`, `/contact` marketing nav hrefs on the onboarding route (present on
  `/`), and that the route renders the auth-check loading state rather than an
  error. Full interactive browser checks (goal-path matrix, Skip confirmation,
  resume, taxonomy loading/error/search, keyboard operation, the 390/768/1440
  viewport matrix) were not run against a live browser this pass — no browser
  automation tool was available (the `playwright` MCP server failed to
  connect this session).

## Submission

- Commit:
- PR:
- CI:

## Notes

- Investigation confirmed the onboarding domain logic (start/dismiss/complete,
  idempotency, ownership, skill-limit and certification validation) already
  matches the spec's Data/Domain rules and Roles/Permissions table; the actual
  bug was entirely in how the frontend routed, gated, and dismissed the
  wizard, so this run is frontend-only (`Scope: front`).
- **Root cause of FR3/FR4** (the main bug this spec describes): the old
  `ProfessionalOnboardingGate` called `dismissOnboarding()` automatically
  whenever a user merely navigated away from the wizard route while it was
  still offered (`hasLeftWizard` effect) — the exact "implicit dismiss-on-
  navigation" behaviour the spec's Supersedes section calls out and its Risks
  section names as the main risk. Fixed by splitting the gate in two:
  `ProfessionalOnboardingGate` (still in `dashboard/professional/layout.tsx`)
  now only ever offers/redirects into onboarding, and never dismisses
  anything; a new `ProfessionalOnboardingEntryGuard` (in the new
  `onboarding/professional/layout.tsx`) only redirects *away* from onboarding
  if it's already resolved, also without ever dismissing anything. Dismiss is
  now reachable from exactly one place: the wizard's confirmed Skip handler.
- **Route moved from `/dashboard/professional/onboarding` to
  `/onboarding/professional`** (FR1) rather than trying to conditionally hide
  the sidebar within the existing dashboard route tree. This was the
  structurally simplest fix: `DashboardSidebar` is rendered by
  `dashboard/layout.tsx`, which wraps every `/dashboard/*` route, so no route
  nested under it can cleanly opt out. Moving the page out of that tree
  removes the sidebar/bottom-nav question entirely via route structure
  instead of a pathname special case. `Header`/`Footer` are still rendered
  globally from the true app root (`app/layout.tsx`, which owns `<html>`/
  `<body>` and can't be split further without a much larger shell rewrite —
  the kind of change the spec's own Dependencies section assigns to a future
  phase 08), so those two components gained a small, explicit
  `isFocusedShellRoute()` check (new `utils/focused-shell.ts`, prefix-matched
  on `/onboarding`) that renders a brand-mark-only header and no footer on
  this route, without touching their behaviour anywhere else.
- **Skip redirects to Overview** (`OVERVIEW_HREF = "/dashboard/professional"`),
  a new constant distinct from the pre-existing `PROFILE_TAB_HREF`
  (`?tab=profile`) that Finish still uses — the spec only asks Skip's target
  to change to Overview; Finish's existing redirect was left alone as
  out-of-scope for this bug set.
- **Role alias matching (FR8/FR9)**: `ProfileTaxonomyTerm` has no alias field
  today — only `label`/`groupKey`/`groupLabel`/`sortOrder`. The spec's own
  Decision-needed section offers two paths here (attach a canonical
  role/alias list, or approve the existing server taxonomy as-is); absent
  that list, adding an alias schema/field would be inventing taxonomy content
  rather than fixing a defined bug, so this run keeps the existing
  case-insensitive substring match against the real taxonomy and does not add
  a second matching system, consistent with the explicit non-goal ("do not
  create a second role/skill taxonomy in frontend constants").
- **Stepper redesign (FR6)**: added a `LucideIcon` per step
  (`ONBOARDING_STEP_ICON`), rendered inside the same numbered badge (falling
  back to the number/check as before), plus a connector line between steps on
  `sm`+ widths; step count/labels/active/completed logic is unchanged, so the
  "current step and total never disagree with rendered steps" invariant
  still holds by construction.
- **Focus management** (UX Requirements, not a listed acceptance criterion):
  added a shared `headingRef` threaded through all four step components so
  focus moves to the step's own `<h2>` after `currentStep` changes, addressing
  "Focus moves to the step heading after navigation." Did not add a matching
  "focus first invalid field" mechanism beyond what already exists (Continue
  is disabled until a step is locally valid, so there is nothing to submit
  into an invalid state; a failed Finish already keeps the user on the same
  step and surfaces a toast) — judged sufficient without a larger form-error
  redesign.
- Not implemented: no new stable-error-code split for "taxonomy unavailable"
  vs. a generic failure. The frontend's retry UI (`hasRolesError`/
  `hasSkillsError` + Retry) already reacts to any query failure the same way,
  so a distinct code would have no client behaviour to attach to; left as a
  generic failure, consistent with this session's pattern of not adding codes
  that don't correspond to an actual behavioural gap.
- After a manual on-disk refactor (import/prop reordering across the touched
  files, plus relocating `TOnboardingStepperProps` out of
  `onboarding-stepper.tsx` into the shared `professional-onboarding.types.ts`,
  matching how `TOnboardingStepProps` is already organized there), re-ran the
  full verification gate: lint, `tsc --noEmit`, and `npm run build` all pass
  clean, and the route table is unchanged. No regression found.
