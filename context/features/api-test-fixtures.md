# API Test Fixtures

> Source: `context/monorepo-audit.md` — **MONO-15**. Prerequisite: **MONO-07**.
> **Priority: Low. This feature exists to be reassessed, not assumed.**

## Objective

The audit evaluated a cross-application `packages/test-utils` and **recommended
against it**. This file records that reasoning and defines the narrower, app-local
work that may become worthwhile later.

## Status

**Closed without code, 2026-07-27.** Reassessed after MONO-07 landed; still not
justified. See the decision record at the end of this file.

## Why a shared package is not recommended

The two test suites share nothing that could be packaged:

| | `apps/api` | `apps/front` |
| --- | --- | --- |
| Runner | Jest 29 + ts-jest | Vitest 2 |
| Environment | node | jsdom |
| What is mocked | Prisma clients, transactions, services | nothing — mostly pure helpers |
| Fixture shape | database records | none |

The frontend has no use for a Prisma mock; the backend has no use for Testing
Library. A `packages/test-utils` serving both would be two unrelated modules
sharing a directory — and it must never be bundled into production, which adds an
export-boundary concern for no reuse.

## The real, narrower need

Duplication does exist, but only inside `apps/api`, and only in Prisma-mock
construction. Each spec builds its own transaction double —
`professional-certificate.service.spec.ts`,
`admin-org-access-request.service.spec.ts`,
`org-access-request.service.spec.ts`.

The `current-feature.md` history records a `createApprovalTx` factory that was
extracted and shared *within a single spec file*. That is evidence the need is
real and that it is currently local.

## When to revisit

This becomes worth doing when either is true:

1. **MONO-07 has landed** and specs are being written for the ten modules that
   are currently unreachable — `course`, `events`, `podcast`, `youtube`,
   `provider`, `user`, `landing`, `external-learning`, `content-interaction`,
   `app`. Ten new suites each hand-rolling a Prisma mock is the point where a
   factory pays for itself.
2. A second backend service or a second frontend application appears, at which
   point the cross-app question genuinely reopens.

Until then, adding a package would be premature extraction for a benefit that
does not yet exist.

## Recommended shape if and when it proceeds

**`apps/api/src/testing/` — inside the app that uses it, not a workspace
package.**

```text
apps/api/src/testing/
├── prisma-mock.ts       a typed Prisma client double with transaction support
├── factories/           user, organization, certificate, pdu-activity builders
└── index.ts
```

Constraints:

- Must not be imported by any non-spec file. Enforce with a lint rule if
  MONO-08's boundary rules are in place by then, or a naming convention if not.
- Must be excluded from `tsconfig.build.json` so it never reaches `dist`.
- Factories return plain objects, not live database records — these are unit
  tests with no database.

## Goals (when undertaken)

- One typed Prisma mock covering the transaction pattern the existing specs
  hand-roll.
- Record factories for the entities most specs need.
- Reduce the cost of writing a spec for a newly-reachable module.

## Verification (when undertaken)

- API Jest passes at its then-current count, with **no change in the number of
  assertions** — refactoring test infrastructure must not quietly weaken
  coverage. Compare the count before and after.
- Confirm nothing under `src/testing/` appears in `apps/api/dist` after
  `nest build`.
- At least two existing specs migrated to the shared factory, proving it fits
  real usage rather than a hypothetical.

## Risks

- Premature extraction creating a package that must not ship to production, for
  a benefit that does not exist yet. This is precisely why the feature is
  deferred rather than scheduled.
- An over-general mock that is harder to read than the inline doubles it
  replaces. If a factory needs more than a couple of options, the specs probably
  wanted different mocks, not one shared one.

## Acceptance Criteria

If undertaken:

- Shared fixtures live in `apps/api/src/testing/`, not a workspace package.
- They are excluded from the production build, verified.
- At least two specs use them.
- Assertion count is unchanged or higher.

If reassessed and still not justified: record that decision here and close the
feature without code.

## Decision record — 2026-07-27

Reassessed at the point this file names as the trigger: immediately after
MONO-07 made ten previously-unreachable modules testable.

Measured, not assumed:

```text
API spec files                                    19
Specs that hand-roll a Prisma mock                 5
Specs in the 9 newly-reachable modules             0
```

**Still not justified. Closed without code.**

The trigger this file defines is *"specs are being written for the ten modules
that are currently unreachable."* MONO-07 removed the blocker, but no spec has
been written for any of them yet. Five hand-rolled mocks across nineteen suites
is not enough duplication to pay for a fixtures layer, and building one now
would mean designing factories against imagined usage rather than real usage —
exactly the premature extraction this file warns against.

The cross-app question did not reopen either: there is still one backend and one
frontend, and they still share no runner, environment or fixture shape.

**Re-open when** several specs exist in the course/events/podcast/youtube/
provider modules and are visibly repeating the same mock construction. Extract
then to `apps/api/src/testing/`, not a workspace package, for the reasons set
out above.

## History

<!-- Keep this updated. Earliest to latest -->

- 2026-07-27 — Reassessed after MONO-07 landed. Trigger condition not met;
  closed without code.
