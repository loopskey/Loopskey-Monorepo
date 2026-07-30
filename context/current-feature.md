# Current Feature (Compatibility Pointer)

This file is a pointer only. It is not shared workflow state and must never hold
implementation history. Each feature owns an independent record under
`context/feature-runs/active/`, so parallel developers cannot overwrite one
another.

## Active runs

| Run record                                                       | Branch                                  | Status     |
| ---------------------------------------------------------------- | --------------------------------------- | ---------- |
| `context/feature-runs/active/ci-develop-pr-gate.md`              | `fix/ci-develop-pr-gate`                | Completing |
| `context/feature-runs/active/monolith-ph1-baseline-ownership.md` | `chore/monolith-ph1-baseline-ownership` | Completing |

Completed records move to `context/feature-runs/completed/` and are indexed in
`context/feature-history.md`.

The pre-migration history that used to live in this file is preserved verbatim at
`context/feature-runs/legacy-current-feature-archive.md`.
