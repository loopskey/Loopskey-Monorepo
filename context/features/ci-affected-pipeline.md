# CI With Affected Execution

> Source: `context/monorepo-audit.md` — **MONO-13**. Prerequisite: **MONO-09**.

## Objective

There is no CI. No `.github/` directory exists, and no CI configuration of any
kind is present.

Every quality gate in this repository runs only when a developer remembers to run
it. `ai-interaction.md` requires build, lint and check-types before committing,
and nothing enforces that. The green baseline recorded in the audit is a property
of one machine at one moment.

This is also where Turborepo's remaining value is concentrated: caching and
`--affected` matter most on a shared runner, and both are unused there because
there is no there.

## Status

Not Started

## Goals

- A GitHub Actions workflow running `lint`, `check-types`, `test` and `build` on
  pull requests to `main`.
- `--affected` against the merge base, so a frontend-only change does not rebuild
  the API.
- `.turbo` cached between runs.
- The codegen no-diff check from MONO-05, if that feature has landed.

## Evidence

```text
$ ls -a .github
(no .github)

$ npx turbo run build --affected --dry=json
affected packages: ["//"]
scm base: {"type":"git","sha":"8f66b6e...","branch":"chore/monorepo-shared-packages-audit"}

$ npm run lint
• Remote caching disabled
```

`--affected` works correctly when invoked by hand. Nothing invokes it.

Measured timings to size the runner budget: cold build **3m42s**, warm cache hit
**37s**. Lint cold 14.9s, check-types cold 12.5s. API tests 17.8s, frontend tests
5.8s.

## Scope

### In scope

- `.github/workflows/ci.yml`.
- Node and npm setup matching `packageManager: npm@10.8.1`.
- `actions/cache` for `.turbo`.
- Branch protection guidance (documented; applying it is a repository-settings
  action for the human).

### Out of scope

- **Deployment.** Getting verification green and trusted is a complete unit of
  work. The repository records no hosting information — no Dockerfile, no
  `vercel.json`, no deploy config — so CD cannot be specified yet. See the
  decision below.
- Remote caching, unless the decision below says yes.
- Database-backed integration tests. The current 269 tests are unit tests with
  mocked Prisma and need no database, which is why this workflow can be simple.

## Design Notes

`--affected` needs full git history and a correct base ref:

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0
```

Without `fetch-depth: 0`, Turbo cannot compute the merge base and will either
fail or — worse — silently treat nothing as affected and report green.

Suggested job shape: one job running the four tasks in order, since Turbo already
parallelises within each. Splitting into four jobs would quadruple the install
cost for no gain at this size.

Cache key should include the lockfile hash so a dependency change invalidates it.

Note `.prettierrc.json` sets `endOfLine: "auto"`, so Windows-developed code
should not trip line-ending checks on a Linux runner — but the first run will
confirm.

## Decisions required

1. **Deployment target.** Where do these apps actually run? Answering this
   determines whether a follow-up CD feature is worth specifying.
2. **Remote caching.** Vercel Remote Cache is free on the Hobby tier and roughly
   a 15-minute setup, but it sends build artifacts to a third party. Acceptable
   for this codebase? If yes, add it here; if no, `actions/cache` on `.turbo`
   still gets most of the benefit within a single repository.

## Verification

The critical verification is not that CI passes — it is that CI **can fail**.

- Push a commit with a deliberate type error. Confirm the workflow fails at
  `check-types`. Revert.
- Push a commit with a deliberately failing test. Confirm the workflow fails at
  `test`. Revert.
- Push a documentation-only commit. Confirm `--affected` skips both app builds
  and the run is fast.
- Push a frontend-only change. Confirm the API build is skipped and the frontend
  build runs.
- Confirm the second run of an unchanged branch reports Turbo cache hits.

## Risks

- **A wrong base ref silently skips everything and reports green.** This is the
  failure mode that makes CI worse than useless, because it manufactures
  confidence. The deliberate-failure tests above exist specifically to rule it
  out and must not be skipped.
- Caching `.turbo` across runs can replay a stale result if the cache key is too
  coarse. Include the lockfile hash.
- First run may surface environment differences — the audit's baseline was
  measured on Windows; CI will be Linux.

## Acceptance Criteria

- A workflow runs on every pull request to `main`.
- It runs lint, check-types, test and build, using `--affected`.
- A deliberately broken commit is proven to fail the workflow.
- A docs-only commit is proven to skip the app tasks.
- `.turbo` caching demonstrably reduces the second run.
- The two decisions above are recorded.

## History

<!-- Keep this updated. Earliest to latest -->
