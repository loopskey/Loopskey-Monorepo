# Unified Path Aliases (and repairing Jest resolution)

> Source: `context/monorepo-audit.md` — **MONO-07**, findings **D-10** and
> **D-11**. No hard prerequisite; cleaner after **MONO-06**.

## Objective

Ten of seventeen backend modules cannot be unit tested today, and the reason is a
configuration mismatch nobody has noticed because no test has tried.

`apps/api/tsconfig.json` declares **26** path aliases. The Jest
`moduleNameMapper` in `apps/api/package.json:117-128` maps **10**. **130 source
files** import through the 16 that are unmapped.

## Status

Not Started

## Goals

- Derive Jest and Vitest alias mappings from the tsconfig `paths` instead of
  restating them by hand.
- Make every module in `apps/api` unit-testable.
- Delete the seven declared-but-unused aliases.
- Rename or remove `@types/*`, which shadows the npm `@types/` scope in both apps.

## Evidence — proven, not inferred

Unmapped aliases, with the number of source files importing through each:

```text
@provider       21 files      @user            15 files
@course         17            @podcast         15
@contentAction  16            @youtube         15
@events         14            @ext             10
@landing         6            @app              1
@config @dto @enums @guards @entities @decorators    0 files (declared, unused)
```

A temporary spec was written during the audit at
`apps/api/src/modules/course/services/__alias-probe.spec.ts`:

```ts
import { CourseService } from "@course/services/course.service";
```

Result:

```text
FAIL src/modules/course/services/__alias-probe.spec.ts
  ● Test suite failed to run
    Cannot find module '@course/services/course.service'
      from 'modules/course/services/__alias-probe.spec.ts'
```

The identical import type-checks cleanly under `tsc`. The failure is Jest-only.
The probe file was deleted immediately after the run.

Configuration restated in four places:

| Source | Alias count |
| --- | --- |
| `apps/api/tsconfig.json:26-55` | 26 |
| `apps/api/package.json:117-128` (Jest) | 10 |
| `apps/front/tsconfig.json:21-36` | 14 |
| `apps/front/vitest.config.mjs:5-21` | 14 |

The frontend pair is in sync, and `vitest.config.mjs` says so in a comment —
"Mirrors the tsconfig path aliases" — which is an admission that the duplication
is known and manual.

## Scope

### In scope

- Moving the API Jest config out of `package.json` into `jest.config.ts` so it
  can read the tsconfig.
- Using `ts-jest`'s `pathsToModuleNameMapper`.
- Making `apps/front/vitest.config.mjs` read the tsconfig rather than mirror it.
- Deleting the seven dead aliases from `apps/api/tsconfig.json`.
- Resolving the `@types/*` collision in both apps.
- **One new spec in a previously unreachable module**, to prove the repair.

### Out of scope

- Writing comprehensive tests for the ten newly-testable modules. That is normal
  feature work; this feature only unblocks it.
- Changing any alias that is in use.

## Critical implementation detail

The `@prisma/*` mapping is **deliberately narrow**:

```jsonc
"^@prisma/(prisma\\.service|prisma\\.module)$": "<rootDir>/modules/prisma/$1"
```

It maps only `@prisma/prisma.service` and `@prisma/prisma.module` so that
`@prisma/client` still resolves to the real npm package. A naive derived mapping
from tsconfig's `"@prisma/*": ["src/modules/prisma/*"]` would capture
`@prisma/client` and break every spec that touches the database.

**This special case must be preserved explicitly** — derive the rest, then
override `@prisma`. This is the single highest-risk detail in the feature.

## Verification

- API Jest: **157 passing before, 157+ after**. Run before and after; the
  existing 17 suites are the regression net.
- Frontend Vitest: 112 passing.
- The new spec in a previously-unreachable module passes. Recommended: a small
  `CourseService` test, since `@course` has 17 importing files and was the proven
  failure case.
- Spot-check that `@prisma/client` still resolves — any spec constructing a
  Prisma mock proves it.
- `npm run check-types`, `npm run lint`, `npm run build` pass.
- Confirm the seven deleted aliases are genuinely unused:
  `grep -rn '"@config/' apps/api/src` and equivalents return nothing.

## Risks

- `pathsToModuleNameMapper` needs the correct `prefix` for `rootDir: "src"`. A
  wrong prefix breaks **all** resolution rather than some, which is at least loud
  rather than silent.
- The `@prisma` override above. Get it wrong and every database-touching spec
  fails.
- Moving Jest config out of `package.json` changes how `npm run test` resolves
  it; confirm the script still finds the config.

## Acceptance Criteria

- A spec importing `@course/...` runs successfully.
- Jest and Vitest alias mappings are derived from a single source, not restated.
- The seven dead aliases are gone.
- `@types/*` no longer shadows the npm scope in either app.
- `@prisma/client` still resolves to the real package.
- All 157 API and 112 frontend tests pass, plus the new one.

## History

<!-- Keep this updated. Earliest to latest -->
