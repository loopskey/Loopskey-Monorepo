# Codegen From the Committed Schema File

> Source: `context/monorepo-audit.md` — **MONO-05**, findings **D-15** and
> **D-16**. No prerequisite.

## Objective

Make GraphQL code generation hermetic.

`apps/front/codegen.ts:7` points at a **running server**:

```ts
schema: process.env.NEXT_PUBLIC_GRAPHQL_URL || "",
```

Meanwhile `apps/api/src/graphql/schema.gql` is generated *and committed to git* —
and `apps/front` never references it. Nothing in the frontend mentions
`schema.gql`.

This is the one place where the monorepo layout should obviously pay off — one
workspace reading another's committed artifact — and it reaches for the network
instead.

## Status

Not Started

## Goals

- Point codegen at `../api/src/graphql/schema.gql`.
- Declare `codegen` as a Turbo task with the schema file as a declared input.
- Declare `@graphql-codegen/typed-document-node`, which is used but undeclared.
- Move `dotenv` from `dependencies` to `devDependencies` (or drop it — it becomes
  unnecessary once the URL is gone).
- Add a CI-runnable check that regenerating produces no diff.

## Evidence

```text
$ git ls-files apps/api/src/graphql/
apps/api/src/graphql/schema.gql

$ grep -rn "schema.gql" apps/front --include=*.ts --include=*.mjs --include=*.json
(no reference — codegen uses the live URL)
```

`apps/front/codegen.ts:11` requests three plugins:

```ts
plugins: ["typescript", "typescript-operations", "typed-document-node"],
```

`apps/front/package.json` declares the first two. It does **not** declare
`@graphql-codegen/typed-document-node`. It resolves only because npm hoisted it
into the root `node_modules` as a transitive dependency of
`@graphql-codegen/cli`. A dedupe, a CLI upgrade, or a stricter installer breaks
codegen with no source change.

The friction this causes is already recorded in `context/current-feature.md`:
Phase 6 booted the API purely to regenerate the schema; Phase 4 notes "re-ran
codegen against the live API".

## Scope

### In scope

- `apps/front/codegen.ts`.
- `apps/front/package.json` dependency declarations.
- `turbo.json` — a new `codegen` task.
- A no-diff verification script.

### Out of scope

- Regenerating `generated.ts` with different options. The output should be
  **byte-identical** after this change; if it is not, that is a signal the
  committed schema is stale and must be investigated before proceeding.
- Changing how the backend generates `schema.gql`.
- Adding CI itself — that is MONO-13. This feature makes the check *possible*.

## Design Notes

The Turbo task should depend on the **file**, not on `api#build`:

```jsonc
"codegen": {
  "inputs": ["src/lib/graphql/documents/**/*.graphql", "../api/src/graphql/schema.gql"],
  "outputs": ["src/lib/graphql/generated.ts"]
}
```

Depending on `api#build` would serialise the two builds for no reason — the
schema file is already committed, so it is available without building anything.

Note that Turbo inputs outside the package directory need care; if a relative
`../api/...` input is not honoured, the alternative is a `globalDependencies`
entry in `turbo.json`. Verify which works rather than assuming.

## The staleness risk, and its mitigation

Pointing at a committed file introduces a new failure mode: a developer changes a
resolver, does not boot the API, and commits a stale `schema.gql`. The frontend
then generates against yesterday's schema and everything looks fine.

The mitigation ships with this feature: a check that regenerates and fails on a
diff. Two things are worth checking, and both should be scripted even though CI
comes later:

1. Regenerating `generated.ts` from the committed schema produces no diff.
2. Regenerating `schema.gql` from the API produces no diff. This one needs the
   API to boot, so it may need to stay a local/manual step until MONO-13 decides
   how much CI infrastructure is available.

At minimum, ship (1).

## Verification

- `npm run codegen --workspace front` succeeds **with the API stopped and no
  database reachable**. This is the headline proof.
- `git diff apps/front/src/lib/graphql/generated.ts` is empty after
  regeneration — the output must be byte-identical to what the live URL produced.
- `npm run check-types`, `npm run lint`, `npm run build` pass.
- Both test suites pass (157 / 112).
- `npx turbo run codegen` reports a cache hit on a second consecutive run.
- Delete `node_modules/@graphql-codegen/typed-document-node`, run
  `npm install --workspace front`, and confirm codegen still works — proving the
  dependency is now genuinely declared.

## Risks

- **If regenerated output differs**, the committed `schema.gql` is stale relative
  to whatever server the environment variable pointed at. Stop and reconcile
  before continuing; do not commit a "fixed" `generated.ts` that quietly changes
  the frontend's view of the API.
- A relative Turbo input crossing a package boundary may not behave as expected.
  Verify the cache actually invalidates when `schema.gql` changes — a task that
  never invalidates is worse than no task.

## Acceptance Criteria

- `npm run codegen --workspace front` runs with no server and no database.
- `generated.ts` is unchanged by the migration.
- `@graphql-codegen/typed-document-node` is declared; `dotenv` is a devDependency
  or removed.
- A `codegen` Turbo task exists, caches, and invalidates when `schema.gql`
  changes.
- A no-diff check script exists and passes.
- All gates pass.

## History

<!-- Keep this updated. Earliest to latest -->
