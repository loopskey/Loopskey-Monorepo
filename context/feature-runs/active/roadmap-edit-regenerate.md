# Roadmap Continue and Edit actions

- Scope: `full` (front roadmap tab and coach; API roadmap draft, generation and enrollment ports; association learning-content and requirement sync between the association and professional dashboards; two Prisma migrations)
- Model: `High reasoning — editing regenerates a roadmap through the draft state machine and replaces an enrollment while carrying step progress, so concurrency, a partial unique index, a schema migration and two published module ports are involved`
- Branch: `feature/roadmap-edit-regenerate`
- Base: `1d1384c`
- Status: `Ready`

## Acceptance

- [x] Every roadmap in the Roadmap tab (each tile in the roadmap switcher and the workspace header) has two buttons: Continue and Edit.
- [x] Continue selects that roadmap and moves focus to its next-step card, where Start, Mark complete and View content live; it does not start a step or open content by itself. A finished roadmap shows Review in its place.
- [x] Edit is available for roadmaps the user generated; it opens the roadmap coach on a copy of the saved brief, where goal, subjects, preferences and CPD setup can be changed.
- [x] Regenerating an edited roadmap replaces the old one: step progress on content that is still in the new roadmap carries over, the old enrollment is unenrolled in the same transaction, and the old roadmap stays untouched if generation fails.
- [x] One open edit per roadmap, enforced by a partial unique index; starting an edit twice, or at the same instant, returns the same draft.
- [x] An edit draft never appears in the new-roadmap coach, and a new-roadmap draft never turns into an edit.
- [x] The coach shows which roadmap is being edited, the generate button says regenerate, and the user can discard the edit.
- [x] A failed regeneration says the current roadmap is unchanged and links back to the edit (implemented; not exercised in a browser).
- [x] English and French copy exist, Edit shows a spinner and a toast on failure, and the 390 px layout has no overflow. Keyboard-only use and the French copy were not exercised in a browser.

### Association learning content and requirement sync

- [x] A professional can complete only a learning item their association offered them; the server checks a professional-owned link table that the association module keeps in step with audience, status and requirement changes.
- [x] An item counts toward the requirement it is linked to; a completion that names a different requirement is refused.
- [x] A published item that members have completed cannot move to another requirement; before that it moves together with the member links.
- [x] Submitting a completion again returns the activity to pending review, so an approved or rejected activity cannot keep its old decision.
- [x] One external-content activity per member per item, enforced by a partial unique index; existing duplicates are merged by the migration.
- [x] Both dashboards read the completion date, submission date, credited amount, review state and late flag; "Completed" shows Counted, Awaiting review or Rejected.
- [x] The association's engagement numbers count only active audience members and exclude rejected activities, and cover external items.
- [x] The reporting start of a published requirement is locked; changing the reporting end, grace period or late policy recomputes every assignment.
- [x] Future completion dates are refused by the server and the forms, and the reporting year is taken from the date as entered.
- [ ] Not changed: late is still judged by the completion date, the submission window is still not enforced, and a course can still be completed once per member (decisions left open).

## Verification

Final run on the branch rebased onto `origin/develop` (`1d1384c`), after the author's refactor:

- `npx prisma generate`, `npm run build` in `packages/api-contracts`, `npx eslint src` and `tsc --noEmit -p tsconfig.check.json` (apps/api) — pass
- `npx jest` (apps/api) — 171 suites, 2,484 tests pass
- `npx prisma migrate deploy` on a fresh throwaway PostgreSQL 17 (UTC) — all 77 migrations apply, including `20261020100000_roadmap_edit_drafts` and `20261020120000_association_content_sync`
- `jest --config ./test/jest-e2e.json` — 51 suites, 832 tests pass against that database, including `roadmap-edit` (15) and `association-content-sync` (17)
- `npm run codegen` and `npm run i18n-slice` (apps/front) — no drift
- `npx tsc --noEmit`, `npm run lint`, `npm run build` (with `NEXT_PUBLIC_SITE_URL` set) and `npm run bundle-report -- --check-targets --check-ceilings` (apps/front) — pass; home 222.7 KiB gzip (target 300, ceiling 237)

Earlier evidence that still applies:

- Migration `20261020120000_association_content_sync` rehearsed against seeded duplicates — the newer activity won, its evidence file followed it, the loser's attribution was removed, withdrawn and inactive recipients were not backfilled; `prisma migrate diff` shows no drift beyond the existing unmanaged indexes
- `roadmap-edit` e2e: one open edit under eight simultaneous starts, replacement with progress carry-over, completed carry-over, duplicate content, an already-unenrolled old enrollment, another professional's enrollment untouched
- `association-content-sync` e2e: links for the active audience only, completion refused for an item never offered, requirement mismatch refused, withdrawal and deactivation drop the links, eight simultaneous completions converge on one activity, the database refuses a second external activity, a rejected activity returns to pending, the move is refused after a completion, a completion racing a move never ends under the wrong requirement, dates and credit read back on both sides, engagement counts, reporting start lock, recompute on reporting end change
- Browser (Chrome, mocked GraphQL, dev server), roadmap tab only: Continue and Edit on every tile and in the header; Continue selects the roadmap and focuses the next-step card; Edit sends the roadmap id and opens the coach as "Edit roadmap" with the banner and "Regenerate roadmap"; 390 px has no overflow and no target under 40 px
- The scratch cluster must run in UTC; in local time four unrelated suites fail on expiry arithmetic

Not run:

- The new completion badges and dates on either dashboard, the future-date limit on the date inputs and the new error messages, in a browser in English and French
- The real AI regeneration (the AI port is faked in tests), discard and failed-regeneration screens in a browser, keyboard-only use, a screen reader pass

## Submission

- Commit:
- PR:
- CI:
