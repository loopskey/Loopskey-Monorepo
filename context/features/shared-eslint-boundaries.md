# Shared ESLint Config and Dependency Boundaries

> Source: `context/monorepo-audit.md` — **MONO-08**. Prerequisite: **MONO-01**
> (boundary rules need packages to bound).

## Objective

Two overlapping-but-different lint contracts, and no mechanism to enforce
dependency direction once shared packages exist.

The dependency boundary in this repository is currently clean — no cross-app
imports, no Prisma in the frontend, no React in the backend — but that is the
product of discipline, not tooling. It will not survive the first shared package
without help.

## Status

Not Started

## Goals

- `packages/eslint-config` exporting `base`, `next` and `nest` configs.
- Encode the audit's dependency direction as `no-restricted-imports` rules.
- Align `eslint-config-next` with the installed Next major.
- Keep the existing `_`-prefix unused-vars convention, promoted to the shared
  base.

## Evidence

`apps/front/eslint.config.mjs` — `FlatCompat` extending `next/core-web-vitals`
and `next/typescript`, ignoring `src/lib/graphql/generated.ts` and `.next/**`.

`apps/api/eslint.config.mjs` — `typescript-eslint` recommended plus
`eslint-plugin-prettier/recommended`, with a custom `no-unused-vars` rule
honouring the leading-underscore convention (`_sort`, `_passwordHash`).

That underscore convention exists **only** in the API config. `prettier` is
declared only in `apps/api`. `eslint-config-next` is pinned at `15.3.5` while
`next` is `^16.2.4`.

Neither config configures `no-restricted-imports`,
`eslint-plugin-boundaries`, or any import-graph rule.

## The direction to enforce

From the audit's "Dependency Direction" section:

```text
apps/front  -> packages/api-contracts, packages/utils
apps/api    -> packages/api-contracts, packages/utils
packages/*  -> (nothing)
```

Invariants:

- No package may import from `apps/*`.
- No package may import `@prisma/client`, `@nestjs/*`, `next`, or `react`.
- `packages/api-contracts` and `packages/utils` must not import each other —
  keeping both leaf-level means either can be adopted first.
- `apps/api` and `apps/front` must never import each other. **This holds today**
  and should be locked in before packages create new import paths.

The one intentional exception: `apps/front` reads
`apps/api/src/graphql/schema.gql` as a **build input** under MONO-05. That is a
file dependency declared in `turbo.json`, not a module import, and no lint rule
should see it.

## Scope

### In scope

- The new `packages/eslint-config` package with three exports.
- Moving the `_`-prefix rule into the shared base.
- `no-restricted-imports` rules encoding the above.
- Bumping `eslint-config-next` to match Next 16.
- Rewiring both apps' `eslint.config.mjs`.

### Out of scope

- Installing `dependency-cruiser`, `madge`, or a graph tool. The audit explicitly
  argues against this: with two apps and a handful of packages the graph is
  trivially small, and ESLint rules give enforcement at the point of authorship
  rather than a report after the fact.
- Adding new stylistic rules beyond unifying what already exists.

## Implementation approach

Unifying two rule sets will surface existing violations. Land the config with any
newly-introduced rule at `warn`, fix the violations, then promote to `error` in a
follow-up commit. Otherwise this feature becomes an unbounded cleanup and stalls.

Bump `eslint-config-next` from 15 to 16 as its **own commit** inside the feature,
so it can be reverted alone if it brings unexpected rules.

## Verification

- `npm run lint` passes for both apps.
- **Negative tests — the point of the feature, and each must be demonstrated:**
  - Add `import { PrismaClient } from "@prisma/client"` to a file in
    `packages/api-contracts`. Confirm lint fails. Revert.
  - Add an import from `apps/api` into a package. Confirm lint fails. Revert.
  - Add an import from `apps/front` into `apps/api`. Confirm lint fails. Revert.
- `npm run check-types` and `npm run build` pass.
- Both test suites pass (157 / 112).
- Confirm `generated.ts` is still ignored — it is 6,640 lines of generated code
  and linting it produces only unfixable errors.

## Risks

- Unifying rule sets surfaces existing violations. Mitigated by the warn-then-
  error sequence above.
- `eslint-config-next` 16 may introduce rules that fail on existing code.
  Separate commit.
- Over-restrictive boundary rules block legitimate imports and get disabled
  wholesale, which is worse than having none. Start with the four invariants
  above and nothing more.

## Acceptance Criteria

- `packages/eslint-config` exists with base, next and nest presets.
- Both apps consume it; the `_`-prefix convention applies to both.
- All four boundary invariants are enforced and each is proven by a negative
  test.
- `eslint-config-next` matches the installed Next major.
- All gates pass with no rule left at `warn` that was intended as `error`.

## History

<!-- Keep this updated. Earliest to latest -->
