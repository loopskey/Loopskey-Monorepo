# Feature specifications

Feature specifications describe **what** must be delivered. Execution state
(branch, base commit, verification results, commit and PR) belongs in the
branch-specific run record created by the feature skill under
`context/feature-runs/active/<slug>.md`.

## Starting a feature

1. Copy `feature-template.md` into the most relevant domain folder:
   `context/features/<domain>/<slug>.md`.
2. Replace the examples and remove optional sections that do not apply.
3. Make every acceptance criterion observable and independently checkable.
4. Start the repository workflow with:

   ```text
   /feature start context/features/<domain>/<slug>.md
   ```

The feature skill determines `front`, `api`, or `full` scope, creates
`feature/<slug>` from `origin/develop`, implements the specification, runs the
scope gate, and maintains the active run record. Use `/feature review` for an
optional concise review and `/feature complete` only when the work is ready to
commit, push, and submit as a PR to `develop`.

## What a useful specification contains

The template separates required sections from conditional ones:

- Required: status, objective, user value, scope, non-goals, requirements,
  acceptance criteria, and verification.
- Conditional: roles and permissions, UX states, API/GraphQL contracts, data
  changes, cross-domain dependencies, side effects, observability, migration,
  and rollout.
- References: related issues, designs, ADRs, or existing implementations. Link
  only material that is needed to implement the feature.

Do not put progress logs, timestamps, changed-file lists, test results, commit
SHAs, or PR URLs in the specification. Those are mutable execution details and
belong in the run record.

## Project alignment checklist

Before considering a specification ready:

- Keep the request inside existing app and domain boundaries; identify the
  owning backend module when persistence is involved.
- Prefer existing components, hooks, GraphQL operations, DTOs, enums, and
  utilities over parallel implementations.
- State authentication, role, ownership, and sensitive-data behavior
  explicitly.
- Include loading, empty, error, success, responsive, keyboard, and translated
  states for user-facing frontend work when relevant.
- Identify GraphQL codegen, Prisma migration/generation, E2E, outbox, external
  provider, or object-storage work when the feature affects them.
- Put a shared value in `@loopskey/api-contracts` only when both apps consume it
  and the GraphQL schema cannot represent it.
- Avoid implementation detail unless it is an architectural constraint or a
  compatibility requirement.
