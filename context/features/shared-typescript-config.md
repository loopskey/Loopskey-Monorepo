# Shared TypeScript Configuration

> Source: `context/monorepo-audit.md` — **MONO-06**, finding **D-10**.
> Prerequisite: **MONO-01**.

## Objective

Two independent `tsconfig.json` files with no `extends` anywhere, plus seven dead
aliases and one that shadows an npm scope.

The two apps genuinely need different module systems, targets and libs — a single
config is not the answer. But the settings that *should* be identical are
maintained twice and can drift silently, and there is no shared base on which to
hang a repository-wide decision.

## Status

Not Started

## Goals

- `packages/typescript-config` exporting `base.json`, `nextjs.json` and
  `nestjs.json`.
- Each app's `tsconfig.json` extends the relevant preset and keeps only its
  `paths` and genuine app-specific overrides.
- Delete the seven declared-but-unused aliases from `apps/api/tsconfig.json`.
- Resolve the `@types/*` collision.
- Future packages inherit the house rules by default.

## Evidence

`apps/front/tsconfig.json` — 14 aliases, `strict: true`, `target: ES2017`,
`module: esnext`, `moduleResolution: "bundler"`, `jsx: react-jsx`, DOM libs.

`apps/api/tsconfig.json` — 26 aliases, `strict: true` but
`strictPropertyInitialization: false`, `target: ES2021`, `module: commonjs`,
decorators enabled.

Settings that are identical and duplicated: `strict`, `esModuleInterop`,
`skipLibCheck`, `resolveJsonModule`, `incremental`.

Aliases declared in `apps/api/tsconfig.json` with **zero** importing files:

```text
@config  @dto  @enums  @guards  @entities  @decorators  @types
```

`@types/*` is declared in **both** apps, is used by no file in either, and
**shadows the npm `@types/` scope**. Any runtime `require("@types/...")` would
resolve into `src/common/types`. Nothing does this today, so it is pure downside.

## Scope

### In scope

- The new `packages/typescript-config` package.
- Rewriting both apps' `tsconfig.json` to extend it.
- `apps/api/tsconfig.build.json`, `tsconfig.check.json` and `tsconfig.spec.json`
  — confirm they still resolve correctly through the new inheritance chain.
- Deleting the dead aliases; renaming or removing `@types/*`.

### Out of scope

- Changing strictness. If `strictPropertyInitialization: false` in the API is
  wrong, that is a separate decision with real code impact — keep it as an
  override for now and note it.
- Changing `target` or `lib` for either app.
- The Jest/Vitest alias derivation — that is MONO-07, though the two features
  pair well and MONO-06 should land first so MONO-07 derives from a clean set.

## Design Notes

`paths` must stay in the **app** configs, not the base. Extending a package
config changes how relative paths inside it resolve, and `paths` are resolved
relative to the config file that declares `baseUrl`. Putting them in the base
would silently point every alias at the package directory.

Suggested split:

```text
base.json     strict, esModuleInterop, skipLibCheck, resolveJsonModule,
              forceConsistentCasingInFileNames, incremental
nextjs.json   extends base — bundler resolution, jsx, DOM libs, noEmit, ES2017
nestjs.json   extends base — commonjs, decorators, emitDecoratorMetadata, ES2021
```

For `@types/*`: since no file uses it, the cleanest resolution is deletion. If a
name is wanted for `src/common/types`, use something that cannot collide —
`@apptypes/*`. Do not keep the current name.

## Verification

- `npm run check-types` passes in both apps and produces the **same** result as
  before — this refactor should change nothing about what compiles.
- `npm run build` passes for both apps; `apps/api/dist` and `apps/front/.next`
  are produced as before.
- API Jest 157 passing; frontend Vitest 112 passing.
- `npx tsc --showConfig -p apps/api/tsconfig.json` and the frontend equivalent —
  inspect the resolved config and confirm the effective options match what they
  were before the change. This is the real proof; a build passing does not prove
  a setting was preserved.
- Confirm the deleted aliases are unused: `grep -rn '"@config/' apps/api/src` and
  equivalents return nothing.

## Risks

- Silent option loss. An option dropped during the split may not break the build
  but changes behaviour — `strictPropertyInitialization: false` in particular is
  load-bearing for NestJS DTOs and its loss would produce a wall of errors (loud,
  fine) while a lost `skipLibCheck` would merely slow things down (quiet, worse).
  The `--showConfig` diff above is the mitigation.
- Low value with only two consumers. The payoff arrives with the third package —
  sequence this after MONO-01 has created one, not before.

## Acceptance Criteria

- `packages/typescript-config` exists with three presets.
- Both apps extend it and declare only their own `paths` and overrides.
- `tsc --showConfig` output is equivalent before and after for both apps.
- The seven dead aliases are gone and `@types/*` no longer shadows the npm scope.
- All gates pass.

## History

<!-- Keep this updated. Earliest to latest -->
