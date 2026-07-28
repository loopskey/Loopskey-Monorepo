# Status Action

This action is read-only.

1. Resolve the active run from the current branch, an optional slug argument, or
   the compatibility pointer.
2. Read the run record and specification.
3. Inspect Git without fetching or changing state.
4. Report:
   - Feature and spec
   - Owner
   - Status
   - Branch and base branch
   - Base commit and current HEAD
   - Ahead/behind information when available locally
   - Completed and remaining goals
   - Last verification commands and results
   - Review verdict and reviewed commit
   - Blockers and next permitted action
   - Dirty/untracked file summary

Clearly distinguish recorded evidence from current observations.
