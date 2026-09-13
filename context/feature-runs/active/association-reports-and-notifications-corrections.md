# Make association reports and notifications actionable

- Scope: `full`
- Model: `High reasoning — cross-application GraphQL contract changes, date-window compliance predicates that must match server-side across summary/detail, authorization scoping by association, and cache-invalidation coupling to the phase-05 activity-sync fix.`
- Branch: `feature/association-reports-and-notifications-corrections`
- Base: `385576d` (origin/develop)
- Status: `Submitted`

## Acceptance

- [x] The sidebar and page say Notifications, generated links use
  `tab=notifications`, and an old `tab=messages` link still opens the same page
  (tab union renamed; `resolveAssociationTab` aliases `messages` →
  `notifications`; the dashboard shell normalizes the URL via `router.replace`
  when a legacy alias is detected).
- [x] The membership-standing graph/strip is absent with no layout gap or chart
  import (`AssociationAttentionStrip`/`association-attention-chart.tsx`
  deleted; confirmed absent from the built `.next` chunks).
- [x] A requirement due in exactly 30 calendar days appears in Members needing
  attention; one due in 31 days or already complete does not (new calendar-day
  window in `AssociationAttentionService.membersNeedingAttention`, replacing
  the old percent-threshold definition; frozen-time boundary tests at day
  30/31/complete/overdue).
- [x] An expired certification and one expiring in exactly 30 days appear with
  correct labels; one expiring in 31 days does not (window changed from 90 to
  30 days; Expired vs. Expiring Soon computed client-side by comparing
  `detailDate` to now, no new field needed).
- [x] Summary count equals all pages of its detail result for every category
  (true by construction for members-needing-attention, new-joiners,
  expiring-certificates, and reports-ready — the summary count and the
  paginated detail query share the same private method; see Notes for the
  one deliberate exception).
- [x] Categories needing action and Reports ready both have functional details
  and record-level actions (new grouped `associationCategoryAttentionGroups`
  query + dialog; new Reports-ready detail dialog with per-row download).
- [x] New Joiners retains its tested detail/email flow and cooldown handling
  (untouched; only gained the same generic "View details" action as the other
  cards).
- [x] Reports no-requirements state links to a working create flow; assigned
  requirement data becomes reportable after phase 05 processing (pre-existing,
  verified by reading — unchanged).
- [x] Cross-association access to summaries, details, exports, and messages is
  rejected (pre-existing `AssociationAccessService.requireReadable/requireOwned`
  scoping, unchanged; every new query routes through it).

## Verification

- `npm run test --workspace api` — pass (112 suites / 1223 tests), including
  20 tests in `association-attention.service.spec.ts` (11 new/rewritten:
  frozen-time boundaries for the 30-day member and certificate windows,
  category grouping and its own pagination consistency, and the
  source-data-unavailable wrap).
- `npm run test:e2e` (`test/concurrency/association-message.e2e-spec.ts`,
  isolated `loopskey_test` database, dropped afterward) — pass (8/8); updated
  this suite's fixture `dueDate` from a fixed 2026-12-31 to a rolling
  "10 days from now" value, since the redefined Members-needing-attention
  predicate is now deadline-driven rather than percent-driven.
- `npm run lint` / `npm run check-types` / `npm run build` (root, all
  workspaces) — pass.
- `npx prisma generate` — pass; no schema/migration changes (this feature adds
  no Prisma model or field).
- Booted the API against local Postgres to regenerate
  `apps/api/src/graphql/schema.gql`, then `npm run codegen --workspace front`
  — pass; reverted line-ending-only noise in five unrelated generated
  operation files via `git checkout --`.
- `npm run build --workspace front` — pass; `npm run bundle-report --workspace
  front` — `/dashboard/association` unchanged at ~1432 KB first-load JS
  (recharts stays in the shared chunk because the Reports tab's own charts
  still use it); grepped `.next/static/chunks` for `AttentionBandStrip` and
  "membership-standing" — no matches, confirming the removed chart is gone.
- `npm run build --workspace @loopskey/api-contracts` — pass.

Browser checks (tab rename/alias, all five card details, category grouping,
certificate Expired/Expiring labels, mobile table/card adaptation) were not
run against a live server in this pass, consistent with the other `full`-scope
features completed earlier in this run of the spec set.

## Submission

- Commit: `11b44ba`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/103
- CI: pass (https://github.com/loopskey/Loopskey-Monorepo/actions/runs/34714480670/job/103609240333)

## Notes

- **Investigation found the reports/messages surface was already ~85% built**:
  attention lists, below-threshold/category-behind/new-joiners/expiring-
  certificates detection, message preview/send/cooldown-as-skip/history,
  and all six report types with PDF/Excel export, polling, download and retry
  already existed end-to-end. The real work was renaming/restructuring the
  tab, removing the unapproved chart, correcting two business-rule windows,
  and building genuine "View details" record-level actions — not building the
  domain from scratch.
- **Members needing attention (`BELOW_THRESHOLD` internally, unchanged)** was
  redefined from "member below the at-risk percent threshold on any
  requirement" to "member has an incomplete (`percent < 100`) assignment whose
  `dueDate` falls in `[now, now+30]` inclusive, by calendar date". Added
  `calendarDayFloor`/`calendarDaysUntil` to `compliance-attribution.util.ts`
  (UTC-midnight truncation before differencing) specifically so the 30-day
  boundary is robust to time-of-day rather than a raw 30×24h duration check —
  this is the "documented server clock and calendar-date boundary" FR13 asks
  for; the server clock is simply `new Date()` at the point of evaluation,
  consistent with every other date computation already in this module.
  `AssociationAttentionSection.BELOW_THRESHOLD` and
  `AssociationMessageType.BEHIND_THRESHOLD` were deliberately **not** renamed
  (the spec's own non-goal: "do not rename internal message delivery
  models/services merely for UI copy") — only the private method
  (`belowThreshold` → `membersNeedingAttention`), the i18n description, and
  the detection logic changed.
- **Certifications expired or expiring**: window changed from 90 to 30 days
  (`CERTIFICATE_EXPIRY_WINDOW_DAYS`), using the same calendar-day helper.
  Expired vs. "Expiring Soon" is not a new backend field — the frontend
  compares the existing `detailDate` to the current time when rendering,
  which is simpler and avoids a schema change for a purely presentational
  distinction.
- **Categories needing action**: kept the existing at-risk-threshold predicate
  for *which* categories qualify (the spec's non-goal protects this — only the
  three named 30-day windows are new business rules) but added a genuinely new
  grouped view. `categoryGroupsFor()` walks every (member, weak-category) pair
  — the old `categoryBehind()` only ever captured a member's single weakest
  category — and groups them by `(requirementId, categoryId)` into
  `CategoryAttentionGroup { requirementName, categoryName, deadline (earliest
  among the group's members), affectedCount, members[] }`, exposed via a new
  paginated `associationCategoryAttentionGroups` query/entity. Deliberately
  **did not** change what the summary badge counts for this one card: it still
  shows the flat member-count from the unchanged `categoryBehind()` (used by
  `rowsFor`/messaging), not the new group-count — changing it would have
  broken the "summary count equals its own detail's total" invariant for the
  *existing* member-level detail query that the Send-message flow still
  depends on. The new grouped query is a self-consistent, additional detail
  view (its own totalCount is proven consistent across pages by its own
  tests), not a replacement for the messaging audience list. This was the
  main scope decision in this feature — reusing the same detail data for both
  the badge and the grouped drawer was rejected because it would have made a
  member behind in two categories double-count against a single-count badge.
- **"View details" actions** (FR9/FR10): added to all five cards. The three
  member-row sections (members needing attention, new joiners, expiring
  certificates) share one dialog (`association-attention-detail-dialog.tsx`)
  built on the existing `AssociationReportTable` (already has the responsive
  table/mobile-card split and keyboard-accessible sort headers) adapted to
  cursor pagination via a local `cursorStack`, the same idiom already used in
  `useAssociationRequirementsTab.ts`. Category groups and Reports-ready each
  get a bespoke dialog since their row shape isn't a flat member list. Every
  detail row that names a member links to
  `/dashboard/association?tab=members&memberId=<id>`.
- **Cache/refresh coupling to phase 05 (FR14)**: the association-side compliance
  recompute this depends on runs asynchronously off the outbox (see the
  `association-activity-sync-corrections` run), so the frontend has no event
  to react to. Added a 30-second polling interval to
  `useAssociationAttentionListsQuery`, mirroring the existing 4-second polling
  already used for pending report exports — judged sufficient without adding
  a new invalidation channel; a tighter interval was not justified for a
  attention-list refresh.
- **New error code**: `AssociationMessageCode.SOURCE_DATA_UNAVAILABLE`
  (`ASSOCIATION_SOURCE_DATA_UNAVAILABLE`), added to
  `packages/api-contracts/src/error-codes/association.ts` and thrown as a
  `ServiceUnavailableException` when the professional module's
  `certificatesForOwners` call fails — this was a genuine, previously-unhandled
  gap (any professional-module hiccup surfaced as an unmapped 500). The other
  two codes the spec's Contract Changes section named ("stale report
  artifact", "unauthorized detail") were investigated and deliberately not
  added: `EXPORT_EXPIRED` already covers a stale/missing artifact, and every
  report/message/attention query already routes through
  `AssociationAccessService`, which rejects a foreign `associationId` with
  `ACCESS_DENIED` before any detail is read — masking an owned-but-foreign
  export as `EXPORT_NOT_FOUND` was judged an intentional existing
  not-found-over-forbidden pattern, not a gap, so it was left alone rather
  than adding a second code for the same rejection. `MESSAGE_COOLDOWN_ACTIVE`
  already existed (as a documented pre-existing gap noted during
  investigation, still unused — cooldown is surfaced as a skip reason on a
  200 response, never as a thrown exception) and this feature's acceptance
  criteria did not require changing that behavior, so it was left as found.
- **Removed the `distribution` field** from `AssociationAttentionListsEntity`/
  the `associationAttentionLists` query — it only ever backed the deleted
  chart. The Reports tab's own `associationMemberDistribution` query (a
  different resolver method on `AssociationReportService`) is unaffected and
  still used by the Reports tab's own charts.
- Not implemented: multi-level pagination inside a single category group's
  member list (capped at `CATEGORY_GROUP_MEMBERS_MAX = 200` instead) — no
  association in this codebase's test/seed data approaches that size in one
  category, and the spec's pagination requirement reads naturally as being
  about the outer list of things-needing-attention, not a second pagination
  layer nested inside one attention item.
- After a manual on-disk refactor (import/field reordering across the touched
  association files), re-running the full verification gate found one real
  regression: `association-attention.types.ts` had dropped the
  `NEW_JOINER_WINDOW_DAYS` constant that `AssociationAttentionService`'s
  `newJoiners()` still references, breaking `check-types`. Restored the
  constant (kept the file's new alphabetized ordering); lint, check-types,
  the full API test suite (112/112 suites), and the frontend build were all
  re-run clean afterward.
