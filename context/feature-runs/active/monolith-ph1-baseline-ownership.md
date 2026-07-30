# Feature Run: Modular Monolith Phase 1 — Architecture Baseline and Domain Ownership

## Metadata

- Spec: `context/features/monolith/monolith-ph1-baseline-ownership.md`
- Owner: Hasan Moosavi
- Branch: `chore/monolith-ph1-baseline-ownership`
- Base branch: `develop`
- Base commit: `c7111a5ef3cf7b131b84f3fdb06d0afedc22705f`
- Created at: 2026-07-29T20:41:35Z
- Updated at: 2026-07-30T08:00:00Z

## Status

Completing

## Goals

- [x] Produce a complete module dependency and Prisma-usage baseline.
- [x] Assign every active module to one bounded context.
- [x] Assign every Prisma model to exactly one proposed write owner.
- [x] Identify every existing cross-domain read, write, transaction, and import.
- [x] Record approved decisions as ADRs and typed manifests.
- [x] Give every temporary violation an owner and removal phase.

## Non-Goals

- Refactoring business services or moving application files.
- Changing the GraphQL schema or frontend contract.
- Adding database models or migrations.
- Enforcing boundaries in CI; that belongs to Phase 2.
- Creating events, an outbox, workers, or microservices.
- Any change to service, resolver, Prisma model, GraphQL operation, or runtime
  behavior.

## Acceptance Criteria

- [x] Every active NestJS feature module has one bounded context.
- [x] All 54 current Prisma models have exactly one proposed owner.
- [x] Every model reader and writer is recorded.
- [x] All cross-domain writes are identified.
- [x] The domain dependency graph is documented.
- [x] Every current violation has a finite exception record.
- [x] ADRs explain why microservices are not being introduced.
- [x] No runtime behavior or public contract changed.
- [x] Common validation gate passes.

### Required deliverables

- [x] `context/modular-monolith-baseline.md`
- [x] `context/architecture/README.md`
- [x] `context/architecture/adr-001-modular-monolith.md`
- [x] `context/architecture/adr-002-domain-boundaries.md`
- [x] `context/architecture/adr-003-cross-domain-communication.md`
- [x] `apps/api/src/architecture/domain-ownership.ts`
- [x] `apps/api/src/architecture/boundary-exceptions.ts`

The baseline report must contain: module dependency matrix; every Prisma model
with its readers/writers; a proposed owner per model; cross-domain transactions;
cross-domain internal imports; exported concrete services; read-model
requirements for `admin` and `landing`; initial exception count; risks and
recommended migration order.

Each exception record must carry a unique ID, source domain, target domain,
exact files, reason, read/write classification, and removal phase. The ownership
manifest must stay framework-free and typed with `as const`.

## Implementation Progress

All seven required deliverables exist, plus one file the spec did not name:
`apps/api/src/architecture/domain-ownership.spec.ts` (26 drift tests). Rationale
in decision D-3.

| Deliverable                                                  | State                                                                    |
| ------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `context/modular-monolith-baseline.md`                       | Written - 12 sections, every spec-required element present               |
| `context/architecture/README.md`                             | Written - ADR index and the rules that follow                            |
| `context/architecture/adr-001-modular-monolith.md`           | Written - includes the "why not microservices" argument                  |
| `context/architecture/adr-002-domain-boundaries.md`          | Written - 9 contexts, 54 owners, the 5 required decisions                |
| `context/architecture/adr-003-cross-domain-communication.md` | Written - 4 mechanisms, one-transaction-one-context rule                 |
| `apps/api/src/architecture/domain-ownership.ts`              | Written - framework-free, `as const`, zero imports                       |
| `apps/api/src/architecture/boundary-exceptions.ts`           | Written - 43 entries, each with ID/source/target/files/reason/kind/phase |
| `apps/api/src/architecture/domain-ownership.spec.ts`         | Added, not in spec - see D-3. 26 tests                                   |

### Measured baseline

| Metric                           | Value                                            |
| -------------------------------- | ------------------------------------------------ |
| Feature modules                  | 14 (plus `app`, `prisma`, `graphql`)             |
| Prisma models                    | 54, each with exactly one owner                  |
| Bounded contexts                 | 9                                                |
| Cross-context service injections | 4                                                |
| `$transaction` call sites        | 25 (13 interactive; 4 cross-context)             |
| Boundary exceptions              | 43 - 12 write, 15 read, 11 import, 5 transaction |
| Models written by a non-owner    | 14                                               |
| Models with no write path at all | 10                                               |
| Dependency cycles                | 1 (`mail` and `auth`)                            |

### Headline findings

1. The module graph is nearly empty; the coupling is at the database. Around 40
   exported services, only 4 cross-context injections. Every other apparent
   dependency is two modules querying the same tables.
2. `User` is written by 4 contexts and read by 6. Phase 5 is the highest-risk
   phase and it touches authentication.
3. **Identity provisions all three role profiles** through nested relation
   writes inside a `User` create, and `organization` does the same for
   `ProfessionalProfile`. Found during verification, not in the first pass.
4. `Organization` is never written by the `organization` module, only by
   `admin`; `ProviderProfile` is never written by `provider`. Two owning
   contexts cannot create their own aggregate.
5. Ten models have no write path at all, so their ownership rests on structure
   rather than usage. Flagged for the exit gate.
6. Exactly one dependency cycle exists, and it is a single import.

## Decisions and Assumptions

- Branch type is `chore/` because the phase produces documentation and typed
  manifests only, with no runtime behavior change.
- The branch `chore/monolith-ph1-baseline-ownership` already existed at exactly
  `origin/develop` (0 ahead, 0 behind) when this run was loaded, so it was reused
  rather than recreated. No run record existed for it.
- `context/architecture/` already existed in the working tree but was empty; the
  README and three ADRs were authored into it.
- The spec's nine target bounded contexts are proposals only. The audit must
  confirm or amend them from actual model usage and business workflows.

### The five decisions the spec required

All five are resolved with evidence in
`context/architecture/adr-002-domain-boundaries.md`. They are proposals until the
exit gate accepts them, which is why the boxes stay open.

| Decision                                      | Resolution                                                                                                                                                                           | Confidence                                      |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------- |
| Final owner of `EventRegistration`            | `learning-catalog` — registration and `Event.attendees` are one invariant                                                                                                            | High: two writers observed, one aggregate       |
| Owner of wishlist, enrollment, reviews, carts | `engagement` — already the sole writer of all five                                                                                                                                   | High: uncontested                               |
| Provider publishing vs catalog content        | Catalog owns content and its lifecycle; provider owns identity, settings, promotions, read models                                                                                    | High: `provider` writes no catalog row          |
| Ownership of payments and roadmaps            | `Payment` → `engagement`; `Roadmap`/`Phase`/`Step` → `learning-catalog`; `RoadmapEnrollment` → `engagement`                                                                          | **Low: no writers exist, so no usage evidence** |
| Legitimate `admin`/`landing` read projections | `landing` is intra-context, so not an exception; admin/provider/professional dashboard reads are legitimate needs but still recorded as exceptions because the mechanism must change | High                                            |

- [ ] Exit gate accepts the `EventRegistration` owner.
- [ ] Exit gate accepts the wishlist/enrollment/review/cart owner.
- [ ] Exit gate accepts the provider/catalog boundary.
- [ ] Exit gate accepts the payment and roadmap owners (the weakest of the five).
- [ ] Exit gate accepts the read-projection classification.
- [ ] Exit gate rules on whether the missing write paths for curriculum,
      schedule and roadmap content are intentional. An owner for data nobody
      writes is a guess.
- [ ] Exit gate decides whether role-profile provisioning stays in Identity or
      moves to each role's own context. This sizes Phase 5, which now carries 16
      of the 32 exceptions.

Ambiguity was not resolved by assigning shared ownership. Every one of the 54
models has exactly one write owner, enforced by test.

### Decisions taken during implementation

- **D-1 - The spec's nine proposed contexts survived the evidence** and were
  confirmed rather than amended. One correction: the proposal put "storage and
  events" in Infrastructure; neither exists yet, so `platform-shared` currently
  holds only the Prisma client, composition root and shared utilities.
- **D-2 - `landing` was placed inside `learning-catalog`.** It owns no model and
  reads only catalog tables, so this makes its sole dependency intra-context and
  avoids four otherwise-spurious cross-domain read exceptions. Its raw SQL is
  recorded as a risk (R-5) rather than an exception.
- **D-3 - Added `domain-ownership.spec.ts`, which the spec did not require.** The
  manifest restates the Prisma model list as string literals because it must stay
  framework-free, which makes it a second source of truth. Project standards
  require a drift test for exactly that situation, with `contract-drift.spec.ts`
  as the precedent. The 20 tests also enforce the exception register's structural
  rules: unique IDs, files that exist, real model names, a removal phase in
  range, and no entry claiming a model its own context already owns. Without
  them the manifests would be prose in a `.ts` file.
- **D-4 - Exceptions are recorded for legitimate read projections too.** The
  admin and provider dashboards have a genuine need to read across contexts, but
  the mechanism - direct table access - is still what Phase 2 must be able to
  tell apart from new coupling. "Legitimate" describes the need, not the
  mechanism.
- **D-5 - The four writer-free ownership assignments are the weakest.**
  `Payment` to engagement; `Roadmap`, `RoadmapPhase`, `RoadmapStep` to
  learning-catalog; `RoadmapEnrollment` to engagement. With zero writers there is
  no usage evidence, so these rest on structural symmetry. They cost nothing to
  reassign and are called out explicitly in the exit gate.

### Assumption

- "Record approved decisions" is read as _record decisions for approval_. All
  three ADRs carry `Status: Proposed`. The exit gate is the approval step, and
  Phase 2 must not start until it happens.

### Review fixes applied (2026-07-30, round 2)

All six review findings resolved, plus the two follow-ups the review asked for.

**H-1 — EXC-024 source corrected, split seven ways.** The single entry claiming
`source: "platform-shared"` while listing twelve foreign directories is gone.
EXC-024 now covers only what platform-shared genuinely does — `app.module.ts`
registering the three global guards — and EXC-033 to EXC-038 record the same
violation for `learning-catalog`, `professional-development`,
`organization-management`, `platform-administration`, `engagement` and
`provider-management`. A real correction fell out of the split:
`user/resolvers/user.resolver.ts` imports the same decorators but `user` is
itself `identity-access`, so that import is intra-context and now has no entry at
all.

**M-1 — directories replaced with exact files.** All 32 files behind the
decorator violation are now listed individually. The register references 58
distinct files across 89 references, and no entry names a directory.

**M-2 — non-module source directories classified.** `SOURCE_PATH_OWNERSHIP` maps
`src/common`, `src/graphql` and `src/architecture` to `platform-shared`, and
ADR-002 states why `MODULE_OWNERSHIP` alone cannot. A new test fails if any
directory under `src/` other than `modules` is left unclassified.

**L-1 — unused exports removed or given a consumer.** `OwnedModule` and
`OwnedModel` deleted. `BOUNDARY_EXCEPTION_COUNT` kept and pinned by a test
asserting 43, which turns the register's size into a number that can only change
deliberately — exactly what the roadmap's monotonic-decrease rule needs.

**L-2 — `import` and `transaction` ratified.** The spec's exception schema now
defines four classifications instead of two, ADR-003 maps each to a replacement
mechanism, and the type carries the reasoning. Supporting `transaction` without
using it would have been the speculative-export problem again, so the five real
cross-context transactions found in the audit are now recorded as EXC-039 to
EXC-043. They do not restate the `write` entries: a transaction entry records the
atomicity coupling, which is removed by different work and forces an explicit
decision about what replaces the guarantee.

**L-3 — vague evidence replaced.** Fifteen rows in the model table that read
"_via relation include_" now name the exact reader and writer files.

**Counts regenerated from the register, not maintained beside it.** The kind,
phase-retirement and source-context tables in the baseline report, and the
figures quoted in ADR-001, ADR-002 and ADR-003, were all produced by reading
`boundary-exceptions.ts` and pasting the output. 32 -> 43 exceptions; Phase 2
now retires 10 and Phase 5 retires 19.

**New regression tests (20 -> 26).**

- every exception path is a file, never a directory (M-1)
- every exception's `source` matches the context owning each of its files (H-1)
- every listed file resolves to a known context, so the check above cannot pass
  by silently skipping
- every non-module source directory is classified (M-2)
- every mapped source directory still exists
- `BOUNDARY_EXCEPTION_COUNT` is pinned (L-1)

## Verification

Baseline captured before any edit, and the same gate re-run afterwards. All from
the repository root on `chore/monolith-ph1-baseline-ownership`.

| Timestamp         | Revision              | Command/behavior            | Result                                                                       |
| ----------------- | --------------------- | --------------------------- | ---------------------------------------------------------------------------- |
| 2026-07-29T20:53Z | `c7111a5`, clean tree | `git diff --check`          | pass (baseline)                                                              |
| 2026-07-29T20:53Z | `c7111a5`, clean tree | `npm run lint`              | pass, 3 tasks (baseline)                                                     |
| 2026-07-29T20:53Z | `c7111a5`, clean tree | `npm run check-types`       | pass, 4 tasks (baseline)                                                     |
| 2026-07-29T20:55Z | `c7111a5`, clean tree | `npm run test`              | pass - API 188 in 20 suites, front 112 in 11 files (baseline)                |
| 2026-07-29T20:57Z | `c7111a5`, clean tree | `npm run build`             | pass, 3 tasks (baseline)                                                     |
| 2026-07-29T22:40Z | `c7111a5` + worktree  | `npx jest src/architecture` | pass - 20/20 new tests                                                       |
| 2026-07-29T23:15Z | `c7111a5` + worktree  | `git diff --check`          | pass                                                                         |
| 2026-07-29T23:15Z | `c7111a5` + worktree  | `npm run lint`              | pass, 3 tasks                                                                |
| 2026-07-29T23:16Z | `c7111a5` + worktree  | `npm run check-types`       | pass, 4 tasks                                                                |
| 2026-07-29T23:17Z | `c7111a5` + worktree  | `npm run test`              | pass - **API 208 in 21 suites** (+20 tests, +1 suite), front 112 in 11 files |
| 2026-07-29T23:19Z | `c7111a5` + worktree  | `npm run build`             | pass, 3 tasks                                                                |
| 2026-07-29T23:20Z | `c7111a5` + worktree  | `git status --porcelain`    | only `context/` and `apps/api/src/architecture/` touched                     |

**No pre-existing failures were found.** The three failures recorded in older
project history - the removed `next lint`, the missing API ESLint flat config,
and the undefined root `check-types` - are all resolved on this commit, and the
gate was green before any edit. `npm run test:e2e --workspace api` remains
broken, pointing at `apps/api/test/` which has never existed; it was not run.

Deliberately not verified: nothing was exercised against the running API or the
database, because Phase 1 changes no runtime behavior. The claim that behavior is
unchanged rests on the diff containing no runtime file - confirmed by
`git status --porcelain` - an unchanged `schema.gql`, and all 188 pre-existing
tests still passing.

### Verification pass (2026-07-30)

Three things were exercised beyond re-running the gate.

**1. The drift guards were proven to fire.** The manifest was broken six ways and
the suite re-run each time: dropping a model, inventing a model Prisma does not
have, introducing a dependency cycle, duplicating an exception ID, pointing an
entry at a deleted file, and claiming a model the source context already owns.
All six were caught, and both files were restored byte-for-byte (asserted by the
probe itself). A guard never seen to fail is not known to work.

**2. Register completeness was checked in the opposite direction.** Every
cross-context Prisma access was recomputed from source and matched against the
register. This found real gaps and is the reason the exception count moved from
25 to 32 - see the corrections below.

**3. The API was booted from `dist` and `/graphql` answered.** All modules
initialised, every REST route mapped, `Nest application successfully started`,
and a `__schema` introspection returned 200. That is what supports the
"no runtime behavior changed" claim; the build alone would not.

### Defects found in my own Phase 1 output, and fixed

Verification found five errors in the work `/feature start` produced. They are
recorded rather than quietly patched, because the method failure behind them
matters for Phase 2.

- **Nested relation writes were invisible to the audit.** A
  `professionalProfile: { create: … }` inside a `user.create` produces no
  `prisma.professionalProfile.create` call, so the accessor scan missed it
  entirely. Seven real cross-domain violations were absent from the register:
  Identity creating `ProfessionalProfile`, `ProviderProfile` and
  `OrganizationProfile`, Organization creating `ProfessionalProfile`, and the
  three matching reads through the shared user select. Added as EXC-026 to
  EXC-032. This is now risk R-10, and it directly constrains the Phase 2 rule.
- **"`CPDPlanCategory` is unreferenced" was wrong.** It is written through
  `categories: { create: … }` in `professional-cpd-plan.service.ts` and read
  through an include. The original grep searched for `planCategories` and
  `cPDPlanCategory`; the relation field is plain `categories`. The claim, the
  matching risk R-8 and the exit-gate question were all retracted.
- **"Six models written by a non-owner" was a miscount.** The report's own table
  listed twelve, and the true figure with nested writes included is fourteen.
- **The writer-free list was wrong in both directions.** It named
  `ProviderProfile` (which is written, nested) and omitted `ProfileTaxonomyTerm`,
  `CurriculumSection`, `CurriculumLesson` and `EventScheduleItem`. Corrected to
  ten, and the observation that curriculum and schedule content has no authoring
  path at all is now a finding in its own right.
- **Two register entries were incomplete.** EXC-009 omitted the
  `EventRegistration` read; EXC-018 omitted `OrganizationDepartment`.

Consequences carried through the report, all three ADRs and the metrics above:
32 exceptions, Phase 5 now carrying 16 of them, and two new exit-gate questions.

### Verification commands

| Timestamp         | Revision             | Command/behavior                                                               | Result                                                                          |
| ----------------- | -------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| 2026-07-30T04:05Z | `c7111a5` + worktree | Negative probe, 6 manifest mutations                                           | all 6 caught; files restored byte-for-byte                                      |
| 2026-07-30T04:20Z | `c7111a5` + worktree | Register completeness recomputed from source                                   | 1 gap found (EXC-009), fixed                                                    |
| 2026-07-30T04:35Z | `c7111a5` + worktree | Nested relation-write scan + hand confirmation                                 | 7 missing violations found, added                                               |
| 2026-07-30T04:50Z | `c7111a5` + worktree | Register completeness, re-run                                                  | COMPLETE - every access covered                                                 |
| 2026-07-30T04:55Z | `c7111a5` + worktree | `git diff --check`                                                             | pass                                                                            |
| 2026-07-30T04:56Z | `c7111a5` + worktree | `npm run lint`                                                                 | pass, 3 tasks                                                                   |
| 2026-07-30T04:57Z | `c7111a5` + worktree | `npm run check-types`                                                          | pass, 4 tasks                                                                   |
| 2026-07-30T04:58Z | `c7111a5` + worktree | `npm run test`                                                                 | pass - API 208 in 21 suites, front 112 in 11 files                              |
| 2026-07-30T05:00Z | `c7111a5` + worktree | `npm run build`                                                                | pass, 3 tasks                                                                   |
| 2026-07-30T05:01Z | `c7111a5` + worktree | `npm run codegen` then `git diff --exit-code` on `schema.gql` + `generated.ts` | pass - zero drift, so no GraphQL contract change                                |
| 2026-07-30T05:02Z | `c7111a5` + worktree | `node dist/src/main`, then POST `/graphql`                                     | boots clean; `Nest application successfully started`; introspection returns 200 |
| 2026-07-30T05:04Z | `c7111a5` + worktree | `npx jest src/architecture`                                                    | 20/20 pass                                                                      |
| 2026-07-30T05:05Z | `c7111a5` + worktree | `git status --porcelain`                                                       | only this run's files                                                           |

Booting the API rewrote `schema.gql` and `generated.ts` with CRLF line endings.
`git diff --ignore-cr-at-eol` confirmed both were content-identical, and both
were restored with `git checkout --` so the worktree carries no incidental
change.

### Still not verified

- No GraphQL operation was executed against real data and no authorization case
  was exercised. Phase 1 adds no operation and changes no guard, and the 208
  existing tests cover those paths; the boot check confirms only that the
  application still starts and serves its schema.
- The exception register is proven complete for accessor calls by recomputation.
  The nested relation-write class was found by a scan whose hits were confirmed
  by hand, but generic relation field names produce false positives, so that
  class is verified by reading rather than exhaustively by tool. A relation named
  in a way the scan did not surface could still be missing.

### Verification pass 2 (2026-07-30, after the review fixes)

Re-run in full because the review fixes changed the register's structure, not
just its contents.

**Negative probe extended from 6 mutations to 10.** The four new probes target
the four new guards, so none of the review fixes rests on an unexercised test:
pointing an entry at a directory (M-1), giving an entry a source that does not
own its files (H-1), leaving a source directory unclassified (M-2), and silently
changing the size of the register (L-1). All 10 were caught; both manifests were
restored byte-for-byte.

**Register completeness re-checked, both directions.**

- Accessor access: COMPLETE — every cross-context Prisma call is covered.
- Transaction entries: all 5 confirmed against source. Each named file really
  contains a `$transaction`, really writes a model the target owns, and every
  model listed is owned by the declared target.
- Import entries: all 38 file references confirmed to import from the target
  context. The reverse direction was also checked — of the 32 files outside
  identity-access that import `@auth/decorators/*` or `@auth/guards/*`, **none is
  missing from the register**.

**Runtime re-verified.** The API was rebuilt and booted from `dist`;
`Nest application successfully started`, `/graphql` returned 200. The guard probe
was repeated properly this time: anonymous `currentUser` returns
`UNAUTHENTICATED` with a 401, so the global guard chain is intact.

**One further miscount found and fixed.** The fixes claimed 33 files behind the
decorator violation; the register holds 32 (1 + 6 + 14 + 6 + 2 + 2 + 1).
Corrected in the report and above.

| Timestamp         | Revision             | Command/behavior                            | Result                                                            |
| ----------------- | -------------------- | ------------------------------------------- | ----------------------------------------------------------------- |
| 2026-07-30T06:40Z | `c7111a5` + worktree | Negative probe, 10 manifest mutations       | all 10 caught; files restored byte-for-byte                       |
| 2026-07-30T06:45Z | `c7111a5` + worktree | Accessor completeness recomputed            | COMPLETE                                                          |
| 2026-07-30T06:47Z | `c7111a5` + worktree | Transaction entries verified against source | 5/5 confirmed                                                     |
| 2026-07-30T06:49Z | `c7111a5` + worktree | Import entries verified, both directions    | 38/38 confirmed; 0 of 32 decorator files missing                  |
| 2026-07-30T06:50Z | `c7111a5` + worktree | `git diff --check`                          | pass                                                              |
| 2026-07-30T06:51Z | `c7111a5` + worktree | `npm run lint`                              | pass, 3 tasks                                                     |
| 2026-07-30T06:52Z | `c7111a5` + worktree | `npm run check-types`                       | pass, 4 tasks                                                     |
| 2026-07-30T06:54Z | `c7111a5` + worktree | `npm run test`                              | pass - **API 214 in 21 suites** (+6), front 112 in 11 files       |
| 2026-07-30T06:56Z | `c7111a5` + worktree | `npm run build`                             | pass, 3 tasks                                                     |
| 2026-07-30T06:57Z | `c7111a5` + worktree | `npm run codegen` + drift check             | zero drift                                                        |
| 2026-07-30T06:58Z | `c7111a5` + worktree | `node dist/src/main`, POST `/graphql`       | boots clean; 200; anonymous `currentUser` → 401 `UNAUTHENTICATED` |
| 2026-07-30T07:00Z | `c7111a5` + worktree | `git status --porcelain`                    | only this run's files                                             |
| 2026-07-30T07:00Z | `c7111a5` + worktree | `npx prettier --check` on all touched files | clean                                                             |

### Still not verified (unchanged from pass 1)

- No GraphQL operation exercised against real data beyond introspection and the
  anonymous guard probe. Phase 1 adds no operation and changes no guard.
- The nested relation-write class is verified by scan plus hand-reading, not
  exhaustively by tool, because generic relation field names produce false
  positives. A relation named in a way the scan did not surface could still be
  missing. The decorator-import class, by contrast, is now verified exhaustively
  in both directions.

## Review

- Verdict: **Approved**
- Reviewed revision: base `c7111a5` + working tree (uncommitted), 2026-07-30T07:35Z
- Previous verdict: Changes Requested (2026-07-30T05:40Z) — **superseded**; all six
  findings verified as resolved below.

### Previous findings, re-checked at this revision

| Finding                       | Status       | Evidence                                                                                                                                                                                                                            |
| ----------------------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H-1 EXC-024 wrong source      | **Resolved** | Split into 7 per-source entries. All 38 import file-references confirmed to import from their target; all 32 decorator/guard importers outside identity-access are in the register, none missing; 0 source/file-context mismatches. |
| M-1 directories not files     | **Resolved** | 89 paths, 0 directories, 0 missing. Enforced by a test proven to fail on a directory.                                                                                                                                               |
| M-2 `src/common` unclassified | **Resolved** | `SOURCE_PATH_OWNERSHIP` maps `src/common`, `src/graphql`, `src/architecture`. Test fails if any non-module directory under `src/` is unmapped.                                                                                      |
| L-1 unused exports            | **Resolved** | `OwnedModule`/`OwnedModel` deleted; `BOUNDARY_EXCEPTION_COUNT` now consumed by the count-pin test.                                                                                                                                  |
| L-2 unratified kinds          | **Resolved** | Spec defines all four classifications; ADR-003 maps each to a mechanism. `transaction` is used by 5 real entries, all confirmed against source.                                                                                     |
| L-3 vague evidence            | **Resolved** | 0 occurrences of "via relation include" remain; 15 rows now name exact files.                                                                                                                                                       |

### Consistency audit

Every published number was recomputed from `boundary-exceptions.ts` and compared
against the prose. All agree: headline total and per-kind counts; the kind table;
the phase table including every "remaining after" figure; the by-source-context
table; 58 distinct files across 89 references; the 32-file decorator count in
both the report and this record; all seven per-exception counts in the breakdown
table; the ADR-001/002/003 totals; and the count pin in the drift test.

Separately verified: the report's model table holds all 54 models exactly once
with no duplicates and no owner-column mismatch against the manifest; ADR-002's
context/module table matches `MODULE_OWNERSHIP` for all nine contexts; and
ADR-002's per-context model counts (5/13/16/9/3/7/1/0/0) match the manifest.

### Non-blocking follow-ups

None is a defect in the requested scope; recorded so they are not lost.

- **F-1 — `apps/api/src/main.ts` has no context.** The new directory test
  enumerates directories only, so a top-level source file is invisible to it.
  Same class as M-2, outside what the fix was asked to cover. Fold into Phase 2.
- **F-2 — Phase 2 must match exceptions per file, not per
  (source, target, kind).** EXC-025 and EXC-036 share that triple, so a rule
  matching only on it would act as a blanket permit for any future
  admin-to-identity import. The register already carries `files`, so the data
  supports the stricter match; the rule has to use it.
- **F-3 — wording.** The report calls all ten Phase 2 exceptions "relocations";
  EXC-022 is a de-duplication rather than a move.

### Scope

`git status` shows only this run's files plus the intended edit to
`context/features/monolith/monolith-ph1-baseline-ownership.md` (+22/-4), which is
the spec ratification of the `import` and `transaction` kinds. No runtime file,
Prisma model, migration or GraphQL operation touched; codegen drift is zero.

- Reviewed revision: base `c7111a5` + working tree (uncommitted), 2026-07-30T05:40Z
- Reviewer scope: all 9 new/changed files, both manifests read in full, every
  acceptance criterion checked against evidence, plus a mechanical audit of the
  register against the module map.

No security, authorization, transaction, migration, GraphQL-contract or
frontend concern applies: the change adds no runtime code path. `git status`
confirms no `apps/**` runtime file was touched, and codegen produces zero drift.

### High

**H-1 — EXC-024 records the wrong source, so the register does not grandfather
what it exists to grandfather.**
`apps/api/src/architecture/boundary-exceptions.ts`, EXC-024.

The entry sets `source: "platform-shared"`, but all twelve paths it lists belong
to seven _other_ contexts (`course` is learning-catalog, `admin` is
platform-administration, and so on). A mechanical check found 12 file/source
mismatches, all in this one entry; every other entry is consistent.

The `source` field is what Phase 2 enforcement matches on. Concrete failure:
Phase 2 adds the ADR-002 rule "learning-catalog may not import identity-access".
`apps/api/src/modules/course/resolvers/course.resolver.ts` imports
`@auth/decorators/roles.decorator`. The rule looks for an exception with
`source: learning-catalog, target: identity-access, kind: import`, finds none —
EXC-024 claims platform-shared — and fails the build on the exact import EXC-024
was written to permit. The same happens for `events`, `podcast`, `youtube`,
`landing`, `admin`, `organization`, `professional`, `provider`, `user` and
`content-interaction`. Phase 2 then either stalls or someone adds entries to
silence it, which is precisely the allowlist decay R-6 warns about.

It also skews the published numbers: the baseline's "by source context" table
credits `platform-shared` with 1 exception and `learning-catalog` with 0, when
learning-catalog is the largest single source of this violation.

_Fix:_ split EXC-024 into one entry per real source context (seven entries), or
introduce an explicit all-contexts source whose enforcement semantics are
documented in the type. Either way the count moves and the tables in the
baseline report and ADR-001/002 must move with it.

### Medium

**M-1 — EXC-024 lists directories where the spec requires exact files.**
Same entry. The spec's exception schema requires "Exact files"; twelve directory
paths stand in for roughly sixty. `existsSync` returns true for a directory, so
the drift spec's "points at files that exist" check passes vacuously.

_Failure:_ if eleven of the twelve modules drop the decorator import, the entry
still looks fully justified and nobody notices the exception is nearly dead —
the register stops measuring progress, which is its main job.

_Fix:_ enumerate the files, and add an assertion that every path resolves to a
file rather than a directory.

**M-2 — `apps/api/src/common` has no context, and ADR-002 says it does.**
`context/architecture/adr-002-domain-boundaries.md` line 34 lists `common` among
`platform-shared`'s modules. `MODULE_OWNERSHIP` is keyed on directories under
`apps/api/src/modules/`, and there is no `modules/common` — the real directory is
`apps/api/src/common`, holding twelve files including
`graphql-error-formatter.ts`, `slug.util.ts` and `oauth-roles.constant.ts`.

_Failure:_ Phase 2's path-to-context resolver returns `undefined` for
`apps/api/src/common/**`, so those files are either silently exempt from every
boundary rule or blow up the resolver. The drift spec cannot catch this because
`maps every module directory to a context` only reads `src/modules`.
`src/architecture` and `src/graphql` have the same gap.

_Fix:_ map the non-module source directories explicitly, and widen the drift test
to every code directory under `src/`, not just `src/modules`.

### Low

**L-1 — Three exports have no consumer.** `OwnedModule` and `OwnedModel`
(`domain-ownership.ts`), `BOUNDARY_EXCEPTION_COUNT` (`boundary-exceptions.ts`).
`context/coding-standards.md` forbids speculative exports and the Definition of
Done requires every new shared export to have a consumer. That rule is written
for `packages/`, but these files are explicitly a shared contract for Phase 2
tooling, so it applies in spirit. _Fix:_ delete them, or give
`BOUNDARY_EXCEPTION_COUNT` a consumer — pinning it in the drift spec would make
the register's size a deliberate, reviewable number.

**L-2 — `import` is a third classification the spec did not authorise.** The spec
says each exception carries a "Read or write classification"; the register uses
`read | write | import`. The addition is defensible — a compile-time import is
neither a read nor a write — and it is documented on the type, but it is a
deviation and the exit gate should ratify it rather than inherit it.

**L-3 — Four model rows do not name the reading module.**
`ProfessionalProfileTerm`, `ProviderSettings`, `ProfessionalSettings` and
`OrganizationAssignmentRecipient` say only "_via relation include_". All four
were checked and are read solely by their own owning context, so no violation is
hidden, but the acceptance criterion "every model reader and writer is recorded"
is thinner for these four than for the other fifty.

### Checked and clean

- All 6 goals, all 9 acceptance criteria and all 7 deliverables have evidence.
- 54 models, one owner each, asserted against `Prisma.ModelName`.
- Register completeness re-verified: every cross-context accessor access covered.
- Declared dependency graph is acyclic and asserted.
- No `any`, no unused imports, no debug output, no secrets, no magic values.
- Framework-free manifest: `domain-ownership.ts` has zero imports;
  `boundary-exceptions.ts` imports only a type from its sibling.
- Naming, kebab-case filenames, double quotes, trailing commas, import order and
  `import type` usage all match `context/coding-standards.md`; Prettier clean.
- Scope: no runtime file, Prisma model, migration or GraphQL operation touched.
  The three deliberate additions beyond the spec (the drift spec, the
  `current-feature.md` pointer, the legacy-history archive) are each recorded
  with rationale in Decisions.
- No unrelated files staged or modified.

### Route back

H-1, M-1 and M-2 are all edits to the manifests plus the counts they feed. Fix
through `/feature start`, then `/feature verify` (the register-completeness and
negative probes must both be re-run, since H-1 changes entry structure), then
`/feature review`.

## Blockers

None.

## Exit Gate

The bounded-context map, ownership manifest, and violation list require human
review before Phase 2. Unresolved ownership questions block progression.

## State History

- 2026-07-29T20:41:35Z — Loaded
- 2026-07-29T22:05:00Z — In Progress (baseline gate green, implementation started)
- 2026-07-30T05:05:00Z — Verification Passed (full gate green; 5 self-inflicted defects found and fixed; exceptions 25 → 32)
- 2026-07-30T05:35:00Z — In Review
- 2026-07-30T05:40:00Z — Changes Requested (1 High, 2 Medium, 3 Low; all in the exception register and the module map)
- 2026-07-30T06:30:00Z — In Progress (all 6 findings fixed; exceptions 32 → 43; drift tests 20 → 26). Verification invalidated by the code change and must be re-run.
- 2026-07-30T07:00:00Z — Verification Passed (10/10 negative probes; completeness confirmed both directions; full gate green; 1 further miscount fixed)
- 2026-07-30T07:20:00Z — In Review
- 2026-07-30T07:35:00Z — Ready to Complete (Approved; all 6 prior findings resolved; 3 non-blocking follow-ups recorded)
- 2026-07-30T08:00:00Z — Completing (approved to commit, push and open a PR to develop; merge and branch deletion deliberately NOT authorised — the exit-gate review happens on the PR)

## Completion

- Commit:
- Pull request:
- Merge commit:
- Completed at:
- Branch deleted:
