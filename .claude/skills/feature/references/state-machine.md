# Feature State Machine

## States

| State                 | Meaning                                                     |
| --------------------- | ----------------------------------------------------------- |
| `Draft`               | Specification exists but has not been loaded                |
| `Loaded`              | Run record and branch exist; implementation has not started |
| `In Progress`         | Implementation or approved fixes are underway               |
| `Verification Passed` | Required behavior and gates passed for current worktree     |
| `Verification Failed` | A feature-caused verification failure remains               |
| `In Review`           | Current verified revision is being reviewed                 |
| `Changes Requested`   | Review found actionable issues                              |
| `Ready to Complete`   | Verified revision has a clean review                        |
| `Completing`          | Approved submission is in progress                          |
| `Complete`            | Merge and completion record are verified                    |
| `Blocked`             | Progress requires a decision, authority, or external change |
| `Cancelled`           | Work intentionally ended without completion                 |

## Allowed Transitions

```text
Draft -> Loaded
Loaded -> In Progress
In Progress -> Verification Passed | Verification Failed | Blocked
Verification Failed -> In Progress
Verification Passed -> In Review
In Review -> Changes Requested | Ready to Complete | Blocked
Changes Requested -> In Progress
Ready to Complete -> Completing
Completing -> Complete | Verification Failed | Blocked
Blocked -> prior actionable state | Cancelled
any non-complete state -> Cancelled
```

Any code change after `Verification Passed` invalidates verification. Any code
change after `Ready to Complete` invalidates both verification and review.

Record state transitions with timestamp and reason. Do not skip states to make a
feature appear complete.
