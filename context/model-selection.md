# AI model selection

Choose the developer model before implementing or reviewing a feature. Size is
not the deciding factor: choose from the risk of a wrong change, the number of
boundaries it crosses, and how novel the work is. When uncertain, start one
tier higher.

| Tier | Use for | Examples | Codex / Claude examples |
| --- | --- | --- | --- |
| High reasoning | Security, data integrity, concurrency, cross-application contracts, difficult debugging, unfamiliar architecture, or production incidents | auth and authorization, Prisma migrations, payments, transactional/outbox work, schema and GraphQL contract changes, cross-module refactors | GPT-6 Astra / Claude Opus, or the highest-reasoning model available |
| Standard development | A bounded feature in an established pattern with ordinary frontend or backend risk | a dashboard view, a CRUD endpoint, a validated form, an existing module extension | GPT-5.6 Terra / Claude Sonnet, or the standard coding model available |
| Fast utility | Isolated, reversible, easily verified work that cannot weaken a security or data invariant | documentation, translation copy, formatting, narrow mechanical edits with a clear expected diff | GPT-5.6 Luna / Claude Haiku, or the fast utility model available |

## Guardrails

- Select the highest tier involved when a feature spans several categories. A
  small migration or authorization edit is high reasoning work.
- Do not use the fast tier for access control, secrets, personal data, money,
  migrations, Prisma queries that change state, concurrency, generated API
  contracts, or cross-module boundary changes.
- Escalate from standard to high reasoning when the existing pattern is unclear,
  a verification check fails unexpectedly, or the solution changes an invariant.
- A faster model may prepare research or mechanical work, but a high-risk result
  still needs high-reasoning implementation or review before it is accepted.
- State the selected tier and one-sentence reason in the feature run record or
  implementation handoff.

This document is a routing rule, not a runtime model switch. `AGENTS.md` and
`CLAUDE.md` can instruct an agent which tier to request, but the Codex or Claude
client, its launch configuration, or an explicit user choice ultimately selects
the actual model.
