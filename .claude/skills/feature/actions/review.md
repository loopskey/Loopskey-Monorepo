# Review Action

Read `../references/state-machine.md`, `../references/git-policy.md`, and the
project standards.

1. Resolve the run and require status `Verification Passed`, `In Review`, or
   `Changes Requested` after fixes have been re-verified.
2. Set status to `In Review`.
3. Review `base-commit...HEAD` plus all tracked and untracked feature files.
4. Read full surrounding files before reporting a defect.
5. Check:
   - Every goal and acceptance criterion
   - Authorization, ownership, tenant isolation, and secret exposure
   - Transactions, concurrency, idempotency, and failure paths
   - GraphQL, generated-code, Prisma, migration, and shared-contract drift
   - Frontend state, accessibility, translations, and error states
   - Performance regressions and N+1 behavior
   - Tests and verification evidence
   - Coding standards and architecture boundaries
   - Scope creep and unrelated files
6. Report actionable findings by severity: Critical, High, Medium, Low. Include
   file, line, defect, and concrete failure scenario.
7. Record the reviewed commit and verdict:
   - `Changes Requested` if any actionable finding remains
   - `Ready to Complete` only when no actionable finding remains and all
     acceptance criteria have evidence
   - `Blocked` when intent or evidence cannot be established

Review reports only; it does not fix code. Fixes return through
`/feature start`, `/feature verify`, and `/feature review`.
