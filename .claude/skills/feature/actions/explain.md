# Explain Action

This action is read-only.

1. Resolve the active run and its registered base commit.
2. Read the specification and goals.
3. Inspect `base-commit...HEAD`, staged, unstaged, and feature-owned untracked
   files.
4. For each changed file, state whether it is new, modified, generated, or a
   migration and explain its responsibility in one or two sentences.
5. Explain the end-to-end data/control flow.
6. Map changed files to goals and call out unrelated or unexplained files.
7. State migrations, configuration, generated artifacts, and verification
   requirements separately.

Do not assume `main` is the base branch and do not modify files.
