# Feature Run Record

Store active runs at:

```text
context/feature-runs/active/<slug>.md
```

Move completed records to:

```text
context/feature-runs/completed/<slug>.md
```

Use this schema:

```markdown
# Feature Run: <name>

## Metadata

- Spec: `<path>`
- Owner: <name or Unassigned>
- Branch: `<type/slug>`
- Base branch: `develop`
- Base commit: `<sha>`
- Created at: <ISO-8601>
- Updated at: <ISO-8601>

## Status

Loaded

## Goals

- [ ] Goal

## Non-Goals

- Item

## Acceptance Criteria

- [ ] Criterion

## Implementation Progress

## Decisions and Assumptions

## Verification

| Timestamp | Revision | Command/behavior | Result |
| --------- | -------- | ---------------- | ------ |

## Review

- Verdict: Not Reviewed
- Reviewed revision:
- Findings:

## Blockers

None.

## State History

- <timestamp> — Loaded

## Completion

- Commit:
- Pull request:
- CI status:
- Submitted at:
- Merge commit:
- Completed at:
- Branch deleted:
```

The workflow fills submission fields and leaves merge/completion/branch-deletion
fields blank. Those fields may be recorded later only after the repository owner
manually merges and cleans up the branch.

Do not rewrite state history. Do not store secrets, environment values, or
private user data.
