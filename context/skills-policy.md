# Skills Policy

Which installed skill applies to which task, and where this repository
overrides a skill. The skills are development policy, not optional reading:
when a row below matches the task, load that skill before editing.

Several of these skills are installed locally and git-ignored (see
`.gitignore`). If one is missing on your machine, restore it with
`npx skills add <owner/repo> -s <skill> -a claude-code --copy -y`, using the
sources in the table. A missing skill never blocks work; the rules in this file
and in `coding-standards.md` still apply.

## Precedence

1. `CLAUDE.md`, `context/project-overview.md`, `context/coding-standards.md`.
2. This file.
3. The skill's own instructions.

A skill may only tighten a repository rule, never loosen it. Where a skill says
otherwise, the overrides below win.

## Selection

Use the skill the task matches. Do not load all of them for a small change.
Design and UI skills (the frontend row and everything below it in this table)
never load for backend, API, database, or other non-UI work.

| Task                                                        | Load, in order                                                         |
| ------------------------------------------------------------ | ----------------------------------------------------------------------- |
| Any non-trivial code change                                 | `ponytail`                                                              |
| Cross-module change, unfamiliar area, architecture work      | `graphify` (query first), then `ponytail`                              |
| Frontend page, component, layout, or styling change          | `ui-ux-pro-max`, `design-system`, `ui-styling`, then `frontend-design` |
| A screenshot, mockup, Figma export, or reference image was supplied | `image-to-code`, then the frontend row to implement it           |
| Public landing page or marketing surface                    | the frontend row, plus `design-taste-frontend`                         |
| Redesign explicitly requested                                | the frontend row, plus `design-taste-frontend` section 11              |
| Finishing any UI feature or component, before calling it done | `web-design-guidelines` as a review step; fix what it reports        |
| Code touching auth, permissions, uploads, input, files       | `security-review` before finishing                                     |
| Authorized pentest of a running instance                    | `web-app-penetration-testing`                                          |
| Trivial edit (copy, one class, rename)                       | none                                                                    |

Sources: `design-taste-frontend` is `leonxlnx/taste-skill`, `frontend-design` is
`anthropics/skills`, `image-to-code` is `leonxlnx/imagegen-skills`,
`web-design-guidelines` is `vercel-labs/agent-skills`, `ponytail` is
`dietrichgebert/ponytail`, `graphify` is `graphify-labs/graphify`,
`web-app-penetration-testing` is `usestrix/strix`. `security-review` is built
into Claude Code as `/security-review`.

`image-to-code` expects to be able to generate its own reference images first;
nothing in this project connects an image-generation tool, so that step is
skipped and the skill goes straight to analyzing the image you supplied.

When UI rules conflict: your explicit instructions first, then `DESIGN.md`,
then `web-design-guidelines` (correctness and accessibility), then
`design-taste-frontend` or `frontend-design` (aesthetics) — and the repository
overrides below always win over any of them.

## Repository overrides

These apply even where a skill instructs the opposite.

- **No comments.** Ignore the `ponytail:` comment convention and any "label
  borrowed inspiration in comments" advice. Name the constant or function
  instead.
- **No frontend tests.** Ignore ponytail's "leave one runnable check behind" for
  `apps/front`. The frontend gate is lint, type-check, build,
  `bundle-report`, and a browser check. Backend work still adds Jest suites.
- **Preserve the product identity.** The palette, radius scale, and type in
  `globals.css` are the identity. `frontend-design` ("aesthetic risk") and
  `design-taste-frontend` (dials, anti-default palettes) apply to new
  public-facing surfaces and explicit redesigns only, never to dashboards, and
  never by replacing existing tokens.
- **Keep the stack.** Icons stay `lucide-react` and animation stays GSAP, even
  though `design-taste-frontend` discourages the first and prefers another
  library for the second. Do not add a design system, icon family, or animation
  library from a skill's install list. Package changes need explicit approval.
- **Ponytail is not always-on.** It guides how much to build. It does not
  shorten reports the feature workflow requires, and it never justifies
  skipping validation, authorization, or accessibility.
- **Graphify output is local.** Do not commit `graphify-out/`. Do not regenerate
  the graph for a small change; query an existing one, or read the code.

## Design system

One system, already in place. Extend it; never add a second.

- `DESIGN.md` at the repo root (currently modeled on Linear) is aesthetic
  inspiration, read before new UI work for direction on hierarchy, density, and
  restraint. It is not a token source: map anything it suggests onto the real
  tokens below instead of hard-coding one of its colors, and where the two
  disagree, this project's tokens win.
- Tokens: `apps/front/src/app/globals.css`. Colors are CSS variables in
  `:root` (oklch), exposed to Tailwind through `@theme inline`. Radius derives
  from `--radius`. Semantic families exist for success, warning, destructive,
  premium, content-type (`ct-*`), and charts.
- Components: `apps/front/src/components/ui` (shadcn, `new-york` style, config
  in `apps/front/components.json`), composed with `class-variance-authority`.
- Search for an existing token or component before adding one. Do not duplicate
  a token under a new name.
- Prefer standard Tailwind utilities and semantic tokens. An arbitrary value
  needs a reason that a named token or standard utility cannot meet. Do not
  rewrite existing arbitrary values unless the task is already changing that
  line.
- Typography has no font configured: the app renders the Tailwind default sans
  stack, and `layout.tsx` has no `next/font`. Do not change the family without
  explicit instruction. If one is chosen, load it with `next/font` in
  `layout.tsx` and expose it through `@theme inline`.
- There is no dark mode today (no `.dark` block, no `dark:` variants). Do not
  introduce it as a side effect of another change.
- Locales are English and French. There is no RTL or Persian support; do not add
  RTL handling unless a locale is added.

## Security work

- Run `/security-review` on changes to authentication, authorization,
  permissions, GraphQL resolvers, queries, uploads, file access, cookies,
  sessions, or secrets. Fixes must preserve existing behavior and contracts.
- Active testing is limited to `localhost`, a development or staging
  environment, or a domain the owner has confirmed in writing. Never run it
  against production or against third-party systems, and never with destructive
  payloads against real data.
- `web-app-penetration-testing` drives Strix, which needs Docker and an LLM
  provider key and sends exploit traffic and potentially source to that
  provider. Confirm target, scope, and test credentials with the user before
  every run. Never commit keys or `strix_runs/` output.
