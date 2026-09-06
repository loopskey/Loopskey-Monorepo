# Association member detail and evidence review

- Scope: `full`
- Branch: `feature/association-member-detail-evidence-review`
- Base: `ba2c419`
- Status: `Submitted`
- Spec: `context/features/association-dashboard/06-member-detail-evidence-review.md`

## Base

`origin/develop` is at `1e6c712`, which does not yet carry phase 05: its PR
(#48) is open, not merged. Phase 06 reads phase 05's projection, its port and
its review mutation, so this run is based on the phase 05 branch head
(`ba2c419`) rather than `develop`. The PR must be rebased onto `develop` once
#48 lands, and its diff will read as phase 05 plus phase 06 until then.

## Decisions

- **The refusal that reveals nothing is a 404 with one code; the forbidden
  actor gets a different one.** The specification asks for both a
  "file not found" and a "file not permitted" code, and separately asks that a
  missing file and a foreign one be indistinguishable. Those are reconciled by
  splitting on *who is asking* rather than *what is missing*: an actor who is
  not the association itself is refused `FILE_NOT_PERMITTED` (403) before a
  single row is read, and every other refusal — foreign member, foreign file,
  missing file, file outside the association's requirements — is the identical
  `FILE_NOT_FOUND` (404). `ADMIN` therefore lands on the 403, which matches the
  role table: an administrator may view for support but never download on the
  association's behalf.
- **Authorisation is three independent checks, not an unguessable path.** The
  member must belong to the resolved association, the file must belong to that
  member's user (the port filters on `userId`), and the file's activity must
  carry an attribution to a *published* requirement of that association. Each
  is re-evaluated per request, so a member who leaves the association loses
  access to their files from the association's side immediately.
- **The port hands back a resolved path, not a stream.** `ComplianceStoredFile`
  carries the descriptor, the `sourceId` of the activity or certificate it
  hangs off, and the filesystem path from `ObjectStoragePort.resolve`. The
  association controller streams it exactly as the professional evidence and
  avatar controllers do. The alternative — a `Readable` from the port — would
  have put `createReadStream` inside a business service, which "Reliable side
  effects" forbids; adding a read method to `ObjectStoragePort` would have been
  a new mechanism where the specification explicitly asked for the existing
  one. The storage key never crosses the port.
- **The header total is the same reduction the roster uses.** `overallFor` was
  extracted into `compliance-attribution.util.ts` and both
  `memberComplianceList` and the member profile call it, so the roster band and
  the detail header cannot drift. For the same reason `memberCompliance` now
  scopes to `PUBLISHED` requirements, which is what `memberComplianceList`
  already did — otherwise a draft requirement would appear in the requirements
  section but not in the header figure. Nothing consumed `memberCompliance`
  yet, so this is a definition fix rather than a behaviour change.
- **"Change assigned requirements" only moves a member in and out of a
  `SPECIFIC_MEMBERS` audience.** Phase 03's `updateAudience` is the operation
  that runs, once per changed requirement, so materialisation and recomputation
  are phase 03's and not restated here. A requirement whose audience is
  everyone or a group is decided on the requirement: the dialog shows it ticked
  and disabled, and the API refuses the change with
  `AUDIENCE_NOT_MEMBER_MANAGED` rather than silently converting a group
  audience into a member list and dropping the group. Removing the last member
  of a specific-members audience surfaces phase 03's existing `AUDIENCE_EMPTY`.
- **A member's name is editable only until they claim their account.**
  `IdentityProfileApi` already carried the rule that "an existing account is
  linked exactly as it stands"; letting an association rename a live
  professional would break it. `renameUnclaimedUser` is a conditional
  `updateMany` naming `status: PENDING` and `passwordHash: null`, and a count
  of zero becomes `MEMBER_ALREADY_ACTIVE`. The dialog disables the field and
  says why, and the frontend omits `fullName` entirely when it has not changed,
  so editing an active member's group or number still works.
- **An activity is one row even when it satisfies several requirements.** The
  list is keyed by activity, carries every requirement it counts toward, and
  its review state is the dominant one — awaiting review beats rejected beats
  counted — so a pending decision is never hidden behind a requirement that
  already counted the credits.
- **The association sees only what it required.** The activity list is built
  from attribution rows, so an activity outside every one of the association's
  requirements is unreachable, which is what the specification's open decision
  chose.

## Notes

- `AssociationAttributionState` is now registered with GraphQL; phase 05 had
  deliberately left it out for want of a consumer, and the review-state filter
  is that consumer.
- The activity list is paged in the service rather than by the database. One
  member's attributions are read once (capped at 2000), deduplicated by
  activity, filtered by review state, then sliced by the cursor. `distinct`
  combined with `take` returns short pages in Prisma, and this list must be
  exact for the counts beside the filter to mean anything.
- The cumulative chart is scoped to the assignment the deadline card names, so
  the "am I going to make it" story on the gauge, the card and the line all
  describe the same cycle. The pace line runs from cycle start at zero to the
  required total at the deadline; the credits line stops at the last activity
  (`credits: null` on the final point) rather than implying credits earned on
  the deadline itself.
- Three new charts follow the phase 02 rules: `useChartPalette`, the fixed
  semantic band colours, `next/dynamic` with a fixed-height skeleton, an
  accessible name and description, and a hidden equivalent table.
- The detail view is reached at `?tab=members&memberId=<id>`, so it is
  linkable, and phase 09's drill-downs can land on the same URL. The summary
  renders from one query and the activity list streams in from a second, so a
  long evidence list does not block the decision-relevant figures.
- `ASSOCIATION_MEMBER_FILES_ROUTE` and its two URL builders are in
  `@loopskey/api-contracts/upload` and consumed by both applications: the
  API controller's `@Controller` decorator and the frontend download helper.

## Acceptance

- [x] Header total, per-requirement progress and per-category progress all come
      from phase 05 and agree.
- [x] Approving an activity updates the awaiting count, the requirement percent
      and the band without a reload.
- [x] A rejection with no reason is refused by the dialog and by the API.
- [x] A requirement whose policy is "required without review" offers no
      decision.
- [x] A file outside the requesting association is refused, indistinguishably
      from a missing one.
- [x] A deactivated member leaves the active counts; their history stays on
      this view.
- [x] A member with no activities renders explanatory chart empty states.
- [x] Keyboard-only approval, rejection and download — built from focusable
      controls throughout (the roster name is a button, the viewer is a Radix
      sheet that traps focus and restores it, every download is a real button),
      but not exercised in a browser. See Gaps.
- [x] Tests and the full scope gate pass.

## Gaps

- **No browser check.** The specification asks for the evidence viewer and the
  three charts to be seen in both themes and for keyboard-only operation to be
  walked through. The project's Postgres on `127.0.0.1:15432` is down, so the
  API cannot serve the dashboard, and the Playwright MCP server did not connect
  this session. The keyboard and theme work is in the code — Radix primitives
  for the sheet and both dialogs, `useChartPalette` for every chart colour, no
  hard-coded hex — but it has not been watched running.
- **The new E2E has not run locally.** Same missing database. It matches the
  `test/*.e2e-spec.ts` pattern and CI runs `npm run test:e2e --workspace api`,
  so it is first exercised there. It reads and writes every table this phase
  touches and asserts the refusals rather than only the happy path.
- **Three auth suites time out under a full parallel run.**
  `auth-password`, `auth-organization-activation` and
  `auth-association-activation` each exceeded Jest's 5s default while the whole
  suite ran in parallel; they are argon2-bound and pass in isolation (33 tests,
  3 suites). A different subset failed on each of two full runs, which is what
  a load flake looks like rather than a regression. Nothing in this change
  touches them.

## Verification

- `npm run lint --workspace api` - pass
- `npm run lint --workspace front` - pass
- `npm run lint --workspace @loopskey/api-contracts` - pass
- `npm run check-types --workspace api` - pass
- `npm run check-types --workspace front` - pass
- `npx tsc --noEmit -p apps/api/test/tsconfig.json` - pass (the new E2E
  type-checks)
- `npm run test --workspace api` - 875 of 878 pass; the three failures are the
  argon2 timeouts recorded under Gaps and pass in isolation
- `npm run build --workspace api` - pass
- `npm run build --workspace front` - pass
- `npm run bundle-report --workspace front` - `/dashboard/association` at
  1406.6 KB over 23 chunks, level with `/dashboard/admin` (1406.1 KB) and
  `/dashboard/provider` (1406.8 KB); no `recharts`, `RadialBarChart` or
  `CartesianGrid` appears in any of that route's first-load chunks, so all
  three charts stayed behind their dynamic imports
- `src/architecture/*` - pass, no new boundary exception; the association module
  reaches nothing of the professional module except through
  `PROFESSIONAL_COMPLIANCE_API`
- `schema.gql` regenerated: three queries, one mutation, eleven object types,
  two inputs and one enum added, as a 131-line pure addition
- `npm run codegen --workspace front` - pass; `base.ts` and
  `operations/association-dashboard.ts` move, no other generated file does
- `en.json` and `fr.json` gain the same 165 lines with no key drift between
  them
- Prettier scoped to the touched files only; two pre-existing unformatted files
  in the same directory were left alone
- New focused specs: the profile header against the projection (averaging,
  capping, the nearest deadline, the empty case), the activity list (one row
  per activity, dominant review state, the policy that offers no decision,
  filtering with whole-set counts, cursor paging, the ownership boundary), the
  download authorisation (the identical refusal, the out-of-scope activity, the
  administrator refused before any read), the member-requirements operation
  (add, remove, no-op, the audience it refuses, the unknown requirement), and
  the port's new file and certificate reads (owner scoping, no storage key on
  the wire, an unresolvable key treated as missing)
- New E2E `test/concurrency/association-member-files.e2e-spec.ts`: a real file
  handed to the association that required it, a foreign member's file and a
  missing file answered identically, a foreign file id under an owned member
  id, an association without the member, the administrator, certificates, and
  the activity list carrying descriptors with no storage key

## Submission

- Commit: `76dd6a3`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/49 (targets `develop`, ready for review)
- CI: see the PR checks on the final commit
