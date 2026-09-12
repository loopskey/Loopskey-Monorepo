# Make CPD progress and activity evidence internally consistent

- Scope: `full`
- Model: `High reasoning — credit/decimal aggregation correctness, an idempotent transactional evidence-upload workflow, and a cross-domain outbox event contract.`
- Branch: `feature/cpd-activity-corrections`
- Base: `9aa9da1` (origin/develop)
- Status: `Submitted`

## Decision recorded

Product decision (via user): "Continue Without Files" is **never** offered after
an evidence-upload failure. Retry is the only path forward; the activity
remains visibly incomplete until upload succeeds or the user cancels/deletes.

## Acceptance

- [x] With no qualifying activities and 22 starting credits, Earned is 0,
  Remaining equals the full requirement, counted activities is 0, the donut is
  0%, and starting credits are shown separately.
- [x] Qualifying activity create/update/delete changes every progress surface to
  the same values without a page reload (all PDU/CPD-plan RTK Query endpoints
  share the `ProfessionalPdu`/`ProfessionalCpdPlan` tags already; activity and
  evidence mutations invalidate them).
- [x] Rejected, out-of-window, and mismatched-credit activities never increase
  Earned (unchanged `eligibleActivityWhere` filter; earned is now the activity
  aggregate alone, asserted by `professional-cpd-plan.service.spec.ts`).
- [x] When activity save succeeds and file upload fails, the activity is not
  duplicated, the file selection remains, failure is explicit, and Retry can
  complete the workflow.
- [x] Retrying the same upload request twice produces one evidence row
  (client upload key + `@@unique([activityId, uploadKey])`, with a pre-check
  and a P2002 recovery path; covered by
  `professional-pdu-file.service.spec.ts`).
- [x] Learning Activities no longer renders either removed chart section.
- [x] Add Learning Activity uses a bounded content width (`max-w-3xl`) and
  tighter title spacing; no other overflow-prone elements were found in the
  wizard's step components (all use `min-w-0`/`truncate`/`break-words`). Not
  verified in a live browser at the 390/768/1440 matrix.
- [ ] A non-owner cannot upload, read, or delete evidence for the activity —
  unchanged pre-existing behavior (ownership already derived from
  `userId`-scoped lookups), not modified by this feature; not re-verified
  end-to-end in this pass.

## Verification

- `npm run build --workspace @loopskey/api-contracts` — pass
- `npx prisma migrate deploy` / `npx prisma generate` (local dev DB) — pass
- `npm run check-types --workspace api` — pass
- `npm run lint --workspace api` — pass
- `npm run test --workspace api` — pass (110 suites / 1178 tests, including new
  specs for `cpd-progress.util`, `ProfessionalCpdPlanService.progress`, and
  `ProfessionalPduFileService`)
- `npm run build --workspace api` — pass
- `npm run check-types --workspace front` — pass
- `npm run lint --workspace front` — pass
- `npm run build --workspace front` — pass
- `npm run bundle-report --workspace front` — pass (no regression; one route's
  first-load JS shrank slightly after removing the PDUs-over-time chart import)
- `npm run codegen --workspace front` — regenerated `startingCredits` field
- `npm run lint` / `npm run check-types` (root/turbo) — pass

Browser checks (loading/empty/error/success, responsive, keyboard, the 390 px
overflow claim) were not run against a live server in this pass.

## Submission

- Commit: `3ba88f2`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/97
- CI: pass (https://github.com/loopskey/Loopskey-Monorepo/actions/runs/34686340154/job/103533890139)

## Notes

- `earnedCredits` in `ProfessionalCpdPlanService.computeProgress` is now the
  activity aggregate alone (previously `initialCompletedCredits +
  activityCredits`). A new `startingCredits` field (mirrors
  `initialCompletedCredits`, kept for a deprecation window) is returned
  separately and rendered as its own line in `cpd-progress-overview.tsx`,
  never folded into Earned/Remaining/the donut/compliance.
- Added `computeProgressPercent` (clamped 0–100, 0 for a zero total) and used
  it in place of the old unclamped division.
- New `PDUActivityFile.uploadKey` column (migration
  `20260912100000_pdu_activity_file_upload_key`), nullable, with
  `@@unique([activityId, uploadKey])`. Existing rows keep `uploadKey = null`
  and are never backfilled or deduplicated against each other. The frontend
  (`usePduEvidenceUpload.ts`) assigns each `File` a stable key via a
  `WeakMap<File, string>` the first time it's seen, so a retry of the same
  in-memory file reuses the same key.
- `useProfessionalAddActivity.ts` now models the workflow as an explicit
  `idle | saving | uploading | complete | upload-failed` stage. On upload
  failure the created/updated activity id, selected files, form values, and
  step are all retained; the normal submit button is disabled while
  `upload-failed` (to prevent a duplicate `createActivity` call) and a
  dedicated Retry button re-attempts only the upload.
- Evidence upload/delete now announce `LEARNING_ACTIVITY_RECORDED_EVENT`
  (`ProfessionalPduService.announceEvidenceChange`) so association-facing
  outbox consumers see evidence changes the same way they see activity edits.
- Removed the "PDUs by Category" and "PDUs over Time" sections from
  `ProfessionalCpdPduTrackerTab.tsx` and the now-dead `professionalPduReport`
  usage from `useProfessionalCpdPduTracker.ts` (the query itself, and its
  backend resolver/service, remain — they're still used by the Overview tab
  and the PDU target form).
- Product decision captured above via `AskUserQuestion`; the "Decision
  needed" note in the spec's Risks section is resolved by it.
