# Design foundation and white canvas

- Scope: `front`
- Branch: `feature/design-foundation-white-canvas`
- Base: `d0e51b3`
- Status: `Submitted`

Phase 1 of
`context/features/course-visual-restoration/01-design-foundation-white-canvas.md`.

## Acceptance

- [x] No token carries a `--dashboard-` prefix and no parallel dashboard theme
      scope exists.
- [x] Background, card and popover are pure white.
- [x] `--accent` stays neutral and the brand orange has its own tokens.
- [x] `--ring-on-primary` exists and is visible on the blue sidebar surface.
- [x] Warning is `#B45309` everywhere, so a badge and a chart slice agree.
- [x] `--brand-teal` is marked deprecated but not removed while consumers remain.
- [x] Input border and focus ring keep their contrast.
- [x] Content-type and chart tokens are preserved.
- [x] Categorical and semantic chart palettes are separate and defined only in
      `:root`.
- [x] No theme selector, colour-scheme query or dark chart token was added.
- [x] No new raw colour entered a feature.
- [x] The contrast script passes for the whole palette.
- [x] A showcase covers Button, Input, Card, Tabs, Dialog, table, status and the
      chart palette across default, hover, focus, disabled and error.

## Verification

- `npm run lint --workspace front` — pass
- `npm run check-types --workspace front` — pass
- `npm run build --workspace front` — pass
- `npm run bundle-report --workspace front` — pass
- Contrast script — 26/26 pass. Verified ratios: foreground 10.05:1,
  muted-foreground 4.83:1, primary 12.77:1, brand-orange-text 5.02:1,
  brand-orange-foreground on orange 6.29:1, success/warning 5.02:1,
  destructive 4.83:1, ring-on-primary on primary 12.77:1, and every
  categorical chart slot at or above 4.17:1 against white.
- Audit regexes over `apps/front/src`: zero theme selectors or colour-scheme
  queries, zero `--dashboard-` tokens, zero glass/blur/large-radius patterns in
  the changed files, and the raw Tailwind colour count unchanged at 77.
- Raw hex in application TSX unchanged at 13, still confined to the four chart
  files queued for phase 3.

Scope decisions:

- `--brand-orange` is deliberately excluded from the 3:1 non-text check. At
  2.82:1 on white it cannot be a lone essential indicator, which is why the
  tokens split: orange is a filled surface carrying `--brand-orange-foreground`,
  and orange text is `--brand-orange-text`. Both pairings are checked.
- No `--info` token was added. Nothing consumes an info semantic today, and
  `@theme inline` is meant to expose only tokens in real use. `#0369A1` is
  already available as `--chart-7` when a consumer appears.
- `--radius` moved from `0.875rem` to `0.75rem`, which puts cards on
  `--radius-lg` (12px) and buttons and inputs on `--radius-md` (8px). `Card`
  still uses `rounded-xl` (18px) and moves to `rounded-lg` in phase 3, which
  owns the primitives.
- The showcase prints reference hex values as visible labels, which the hex
  audit regex matches. They are text, not colours, and the route is removed in
  the phase 7 cleanup.
- `--ct-*`, `--premium*` and the gradient button variants are untouched. They
  belong to phase 3 and phase 6, which retire them only after their consumers
  reach zero.

Running the showcase: set `NEXT_PUBLIC_ENABLE_DESIGN_SHOWCASE=true` and start
the dev server, then open `/dev/showcase`. The flag is inlined at build time, so
a production build without it prerenders a 404.

## Submission

- Commit: `1d7378f`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/73
- CI:
