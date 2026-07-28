# Turbo Pipeline Completion

> Source: `context/monorepo-audit.md` — **MONO-09**. No prerequisite.
> Cheapest high-value item in the roadmap.

## Objective

The repository has 269 passing tests and the pipeline cannot run any of them.

```text
$ npm test
npm error Missing script: "test"
```

`turbo.json` defines `build`, `lint`, `check-types` and `dev`. There is no `test`
task and no root `test` script — yet `ai-interaction.md` makes the root gate a
precondition for committing. A developer can run the full documented gate, get
green, and have every test failing.

## Status

Not Started

## Goals

- Add a `test` task to `turbo.json` and a `test` script to the root
  `package.json`.
- Add the `codegen` task (shared with MONO-05; whichever feature lands first
  should add it).
- Split the over-broad `build` outputs so each app declares only what it produces.
- Leave the documented commit gate meaning what it says.

## Evidence

Both workspaces already define a test script:

```text
apps/api/package.json:17     "test": "jest"        → 157 passing, 17 suites
apps/front/package.json:9    "test": "vitest run"  → 112 passing, 11 files
```

Neither is reachable from the root.

Both build tasks declare the union of both apps' outputs:

```text
api#build   | outputs: [".next/**","dist/**"]
front#build | outputs: [".next/**","dist/**"]
```

`apps/api` never produces `.next`; `apps/front` never produces `dist`.

Measured build timings for reference: cold `--force` **3m42s**, warm cache hit
**37s**.

## Scope

### In scope

- `turbo.json` — add `test`, add `codegen`, correct `build` outputs.
- Root `package.json` — add `"test": "turbo run test"`.

### Out of scope

- Writing tests.
- Fixing `test:e2e` — it points at `apps/api/test`, a directory that has never
  existed. Either delete the script or create the directory; deciding that is a
  separate call and should not be smuggled in here. Record whichever is chosen.
- CI (MONO-13).

## Design Notes

Suggested task shape:

```jsonc
"test": {
  "dependsOn": ["^build"],
  "outputs": []
}
```

`outputs: []` because unit tests produce no artifact; Turbo will still cache the
pass/fail result and the logs, so an unchanged package skips its suite.

`dependsOn: ["^build"]` is a no-op today (the graph is flat) but becomes correct
once `packages/*` exists and a package must be built before a consumer's tests
run — under MONO-01's recommended source-only strategy it stays a no-op, which is
fine either way.

For the build outputs, split them per package. Turborepo resolves `outputs`
per-task, so `api#build` should declare `["dist/**"]` and `front#build`
`[".next/**", "!.next/cache/**"]`. Task-specific overrides in `turbo.json` handle
this.

## Verification

- `npm test` at the root runs both suites: 157 + 112 = **269 passing**.
- A second consecutive `npm test` reports `>>> FULL TURBO`.
- Deliberately break one frontend test, run `npm test`, confirm it fails and that
  only the frontend task re-runs. Revert.
- `npm run build` still produces working output for both apps — confirm
  `apps/api/dist/src/main.js` and `apps/front/.next/` both exist after the
  outputs change, and that a cache restore recreates them.
- `npm run lint` and `npm run check-types` unaffected.

## Risks

- **Caching test results means a flaky-but-passing run gets replayed.** Acceptable
  for these deterministic unit suites; revisit if integration tests with external
  dependencies are added.
- Narrowing `build` outputs risks under-declaring: if a build artifact is not
  listed, a cache restore produces an incomplete build that appears successful.
  The verification step above exists specifically to catch this — do not skip it.

## Acceptance Criteria

- `npm test` at the root runs and passes 269 tests.
- Turbo caches and replays test results correctly.
- Each build task declares only its own outputs, and a cache-restored build is
  complete and runnable.
- A decision on `test:e2e` is recorded, even if the decision is "delete it".

## History

<!-- Keep this updated. Earliest to latest -->
