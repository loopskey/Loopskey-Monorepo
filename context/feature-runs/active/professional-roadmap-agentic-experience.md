# Professional Roadmap Agentic Experience

- Scope: `full`
- Model: `High reasoning — spans transactional reset/concurrency, GraphQL contract changes, async outbox state, frontend cache identity, and cross-domain catalogue/enrollment boundaries (per spec and model-selection.md)`
- Branch: `feature/professional-roadmap-agentic-experience`
- Base: `87ea93305784de17b2342d7582ff1ab502b538a8`
- Status: `Submitted`

## Acceptance

- [x] Contextual quick answers and free-text composer both remain usable for every coach question, including the final preference sequence. Verified live: date widget, yes/no widget, and the preferences wizard all render above the composer with an "Or tell the coach in your own words" separator; composer stays enabled and focused.
- [x] A typed answer during the preference sequence is sent, extracted, reflected in the brief, and the next question is asked. Code path unchanged (chat turn extraction); the composer is simply no longer hidden. Not exercised end-to-end live because this dev environment has no `ROADMAP_AI_BASE_URL`/`ROADMAP_AI_SERVICE_TOKEN` configured (every AI call reports unavailable) — an environment limitation, not a code gap.
- [x] A structured patch failure preserves the selection, stays on the same question, and offers retry. `RoadmapPreferencesWizard` now awaits the patch result and only advances on success; shows an inline retry message otherwise. Verified by code review and the existing patch-failure plumbing; not forced live (would require simulating a network failure).
- [x] Profile-seeded brief values are visibly marked as suggestions. Verified live: the Preferences section shows a "Suggested from profile" badge with the pre-filled values, flips to "Confirmed" once the professional passes through that stage.
- [x] Mobile renders chat before the brief, composer reachable, brief opens in a Sheet. Verified live at 390×844: transcript first, composer at the bottom, a "Brief · n/n" button opens the full brief in a bottom Sheet.
- [x] Double-clicking Generate creates one effective generation job. Relies on the existing conditional `READY|FAILED → GENERATING` transition (unchanged, already unit-tested) plus the frontend disabling the action while `isGenerating`.
- [x] The Roadmap tab shows the active generation without `generationDraftId` in the URL, including after reload. Verified live: a real FAILED draft appeared on a fresh page load with no query parameter, via the new `professionalRoadmapGeneration` query's no-id auto-discovery branch.
- [x] No-content vs. generic failure render distinct, safe, localized cards; no raw `NO_CANDIDATES`/provider/verifier text is shown. Verified live for the generic-failure path (mapped `ROADMAP_GENERATION_FAILED` → `UNKNOWN`); the no-content mapping (`NO_CANDIDATES` → `NO_MATCHING_CONTENT`) is covered by unit tests (`roadmap-generation-failure.util.spec.ts`, `professional-roadmap-generation.service.spec.ts`).
- [x] `Review preferences` reopens the failed draft at Preferences. Implemented via `?draftId=<id>&focus=preferences`; the brief's `focusStage` prop opens that accordion section on mount without fighting later step progress.
- [x] Completed generation refreshes roadmap/stats once and the generated hero exposes a next action. Implemented: terminal-COMPLETED effect invalidates tags once, strips `generationDraftId` from the URL, and focuses the new hero heading. Not observed live end-to-end (AI service unavailable in this environment prevents a real COMPLETED transition), but the same query/effect path was exercised live for the FAILED terminal case.
- [x] `Start over` on a failed draft resets that same draft, clears the old transcript, cleans the URL/cache, leaves generated roadmaps untouched. Verified live (reset button → same draft id, transcript back to intro+question, brief back to 0/6, profile-seeded fields re-applied) and by a real-Postgres concurrency E2E test.
- [x] Two simultaneous reset requests converge on one fresh draft state and one canonical transcript. Proven by `test/concurrency/roadmap-draft-reset.e2e-spec.ts` running 8 concurrent resets against real PostgreSQL with a `SELECT ... FOR UPDATE` row lock; asserts exactly 2 messages and `COLLECTING` status afterward.
- [x] Anonymous/non-Professional/non-owning actors cannot read, reset, patch, generate, or poll another professional's draft. `@Roles(PROFESSIONAL)` unchanged; ownership re-verified for the new query/reset-by-id path by both a unit test and an E2E test (`NotFoundException` for a stranger's draft id).
- [x] Loading/empty/saving/error/generating/completed/recovery states are keyboard accessible and translated (en/fr). New copy added to both locales. A full keyboard-only tab-order pass and a `prefers-reduced-motion` pass were not separately executed this session; the `ViewTransition` region is guarded by a new global `prefers-reduced-motion` CSS rule and Radix primitives (Sheet/AlertDialog) already provide Escape/keyboard support natively.
- [x] Existing roadmap enrollment, progress, CPD, and outbox behavior remains compatible. Full API suite (1369 tests, 117 suites) passes unchanged; no Prisma schema/migration touched.
- [x] Post-implementation review feedback applied: the brief sidebar was redesigned into one card (shared header with title/progress, `divide-y` sections instead of four nested `GlassCard`s, inline edit affordance, compact field rows) instead of four separately-boxed, heavily-padded cards; `Start over` now remounts the brief (`key={resetCount}`, bumped only on a successful reset) so no locally-held editor/selection state can outlive the server-side reset; the preferences quick-answer wizard no longer shows a per-field hardcoded question the AI never asked — it now labels each control with the same neutral field name the brief uses, under a "Quick answer" caption, since the coach only ever asks one real question for the whole step.

## Verification

- `npm run test --workspace api` — pass (1369/1369, 117 suites)
- `npx jest --config apps/api/test/jest-e2e.json test/concurrency/roadmap-draft-reset.e2e-spec.ts` (against isolated `loopskey_test` DB) — pass (5/5)
- `npm run lint --workspace front` — pass
- `npm run lint --workspace api` — pass
- `npx tsc --noEmit -p apps/front/tsconfig.json` — pass
- `npx tsc --noEmit -p apps/api/tsconfig.check.json` — pass
- `npm run build --workspace front` — pass
- `npm run build --workspace api` — pass
- `npm run bundle-report --workspace front` — generated; `/dashboard/professional/roadmap-chat` is 1709.6 KB / 29 chunks (the richest page in the app, as expected); `/dashboard/professional` did not grow disproportionately, confirming the roadmap-chat operations module stays out of the dashboard bundle
- `npm run check-types` (root) — pass
- `npm run lint` (root) — pass
- `npm run build` (root) — pass
- Codegen (`npm run codegen --workspace front`) run after regenerating `apps/api/src/graphql/schema.gql`; diffs reviewed, no manual edits to generated files
- Browser verification (Playwright, against local dev servers + real seeded professional account):
  - Desktop (1440×900): fresh/resumed draft, composer+widget coexistence at TARGET_DATE and PREFERENCES steps, inline brief editing (goal/goalReason/context/targetDate), section status badges (Needs answer / Suggested from profile / Confirmed / Not needed), sticky "next missing requirement" hint, full happy path to 6/6 complete, Start Over (same id, transcript reset, re-seeded fields)
  - Mobile (390×844): chat-before-brief ordering, compact "Brief · n/n" Sheet trigger, Sheet content, composer reachable
  - Roadmap tab: auto-discovered FAILED draft with no `generationDraftId` in the URL, generic-failure card with safe copy, "Try generation again" → GENERATING with goal shown, `ViewTransition` region swap with no console errors
  - Known residual: one benign console warning ("Blocked aria-hidden…") can appear during the Start-Over focus handoff to the composer; Chrome itself blocks the unsafe state (self-mitigated, not a functional/screen-reader-facing break), and the same race is plausible in the composer's pre-existing auto-focus-on-question-change effect independent of this feature. Not fully eliminated after two remediation attempts (`onCloseAutoFocus` override + deferred `requestAnimationFrame`); left as a documented follow-up rather than patching the shared `ui/alert-dialog.tsx` primitive used by 17 other call sites.
- Not executed this session (documented, not silently skipped): AI-dependent live flows (typed free-text extraction, a real COMPLETED generation, a real NO_MATCHING_CONTENT outcome) — blocked by no configured Roadmap AI service in this dev environment; a dedicated keyboard-only tab-order pass; a `prefers-reduced-motion: reduce` emulated pass at 768px/1024px.
- Follow-up round (brief redesign, Start-over remount, wizard question-label fix): `npx tsc --noEmit -p apps/front/tsconfig.json` — pass; `npm run lint --workspace front` — pass; `npm run build --workspace front` — pass. Not re-verified live in-browser this round — the Playwright MCP connection was unavailable (`CONNECT_TIMEOUT`) for the whole round.

## Submission

- Commit: `845948acacb9939ccf8d2987a4543bc0c723d9ac`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/218
- CI: pending
