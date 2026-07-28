# Monorepo Workspace Foundation

> Source: `context/monorepo-audit.md` — **MONO-01**. Recommended first feature.

## Objective

Make it possible for shared code to exist in this repository at all, and set the
conventions that every future shared package will follow.

Today `package.json:13-15` declares `"workspaces": ["apps/*"]`. A directory
created at `packages/foo` is not linked into `node_modules` and cannot be
imported. Six of the sixteen audit opportunities are blocked behind this.

## Status

Not Started

## Goals

- Widen the workspace glob to `["apps/*", "packages/*"]`.
- Create exactly one package, `packages/api-contracts`, as the pattern-setter.
- Give it a real consumer in both apps so the wiring is proven end to end, not
  assumed.
- Confirm the package resolves under all four toolchains: `next build`,
  `nest build`, `ts-jest`, and `vitest`.
- Record the three convention decisions in `context/project-overview.md`.

## Scope

### In scope

- `package.json` workspace glob.
- A new `packages/api-contracts` with `package.json`, `tsconfig.json`, and
  `src/index.ts`.
- One small, genuinely shared value moved into it to prove the path. Recommended:
  the `ACCESS_TOKEN_COOKIE_DEFAULT` / `REFRESH_TOKEN_COOKIE_DEFAULT` constants,
  which are short, have consumers in both apps, and overlap with MONO-04.
- Whatever `turbo.json` change the new package requires.
- A `npm install` to regenerate the lockfile with the workspace symlink.

### Out of scope

- Migrating the 169 error codes (that is MONO-02).
- Creating `packages/utils`, `packages/typescript-config`, or
  `packages/eslint-config`.
- Any build step for the package.

## Decisions Required Before Starting

These are permanent in practice. Confirm with the human before writing code.

1. **Scope name.** Recommended `@loopskey/*`. The npm organisation does not need
   to exist — packages are `private: true` and never published.
2. **Build strategy.** Recommended: **no build step**. Publish TypeScript source
   through the `exports` field. Next's bundler, `nest build` (via
   `tsconfig-paths`), `ts-jest` and `vitest` all consume TS source directly. This
   avoids adding a `dependsOn: ["^build"]` edge to every task. Reversing this
   later is expensive, so decide deliberately.
3. **Versioning.** Recommended `"version": "0.0.0"`, `"private": true`, and
   consumers referencing `"@loopskey/api-contracts": "*"`.

## Implementation Notes

Suggested package shape:

```jsonc
// packages/api-contracts/package.json
{
  "name": "@loopskey/api-contracts",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": { ".": "./src/index.ts" }
}
```

Consumption checklist — each must be verified, not assumed:

- `apps/front` — Next 16 must transpile the workspace package. If it does not
  resolve out of the box, `transpilePackages` in `next.config.ts` is the fix.
- `apps/api` — `nest build` resolves through `tsconfig-paths`; confirm the
  emitted `dist` does not try to require a TS file at runtime. If it does, that
  is the signal that decision 2 needs revisiting for backend consumers.
- `ts-jest` — the API Jest config must resolve the symlink.
- `vitest` — the frontend config must resolve it too.

The backend case is the one most likely to need attention. Verify it early; if
`nest build` cannot consume TS source, the fallback is a `tsup` build for this
package only, and that changes decision 2.

## Verification

- `npm install` succeeds and `node_modules/@loopskey/api-contracts` is a symlink.
- `npx turbo run build --dry=json` lists three packages, and the new one appears
  in the `dependencies` of any task that consumes it.
- `npm run build`, `npm run lint`, `npm run check-types` all pass.
- `npm run test --workspace api` — 157 passing.
- `npm run test --workspace front` — 112 passing.
- The shared constant is imported and used in both apps, not merely exported.

## Risks

- A wrong build-strategy choice is costly once several packages exist. Mitigated
  by choosing the simplest option first and proving it against all four
  toolchains in this feature.
- `nest build` consuming TypeScript source from a workspace package is the least
  certain part. Verify before committing to the approach.

## Acceptance Criteria

- The workspace glob includes `packages/*`.
- `packages/api-contracts` exists, is private, and exports at least one value.
- That value is imported by `apps/api` **and** `apps/front`, replacing a literal
  in each.
- All four toolchains resolve the package; every gate above passes.
- The three convention decisions are written into
  `context/project-overview.md` so the next package does not re-litigate them.
- No error codes, upload rules, or utilities were migrated — those are separate
  features.

## History

<!-- Keep this updated. Earliest to latest -->
