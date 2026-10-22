# SEO-18 accessibility evidence, 2026-10-19

Baseline: `origin/develop` at `571e5fe4`, built before any SEO-18 edit. After:
the `feature/seo-18-public-accessibility` working tree. Both were built with
`DEPLOYMENT_ENV=ci NEXT_PUBLIC_SITE_URL=https://www.loopskey.com
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:5700/graphql next build`, served by
`next start` against `scripts/perf-fixture-api.mjs`, and audited with
`scripts/a11y-audit.mjs` (axe-core 4.10.3 in Chrome 155, headless). The visitor
is anonymous with deterministic fixture data; no production host was contacted.

A state is one route at one viewport in one locale: 14 routes × en/fr ×
360×740 and 1350×940, plus the mobile home with the navigation panel open — 58
states per run. Finite CSS animations and transitions are fast-forwarded to
their end state before axe runs, so each measurement is of the settled page.

| File | What it is |
| --- | --- |
| `axe-before.json`, `axe-after.json` | The comparison of record: every axe violation, with the element, plus landmarks, heading outline, tabbable controls that are invisible or under 24 px, document status and horizontal overflow |
| `axe-before-reduced-motion.json`, `axe-after-reduced-motion.json` | The same runs with `prefers-reduced-motion: reduce` emulated, which renders every scroll-revealed section at once |
| `bundle-before.json`, `bundle-after.json` | `bundle-report --json` of both builds |
| `*.png` | Sanitized screenshots of the skip link, the open mobile menu, the rebuilt organization panel, an unavailable language and the missing-page recovery link |

## Result

`node scripts/a11y-audit.mjs --compare axe-before.json --after axe-after.json`:

| Rule | Before | After | States |
| --- | --- | --- | --- |
| `region` (content outside landmarks) | 858 | 0 | 6 → 0 |
| `color-contrast` | 138 | 0 | 36 → 0 |
| `target-size` | 30 | 0 | 6 → 0 |
| `heading-order` | 8 | 0 | 8 → 0 |
| `aria-prohibited-attr` | 6 | 0 | 2 → 0 |
| `landmark-one-main` | 4 | 0 | 4 → 0 |
| `scrollable-region-focusable` | 4 | 0 | 4 → 0 |
| `empty-heading` | 2 | 0 | 2 → 0 |
| `landmark-complementary-is-top-level` | 8 | 8 | 8 → 8 |

1,058 findings in all become 8. The reduced-motion run reports the same
picture: 1,052 findings before, the same 8 `aside` findings after.

Each resolved rule and the element behind it:

- **`region` and `landmark-one-main`** — the homepage rendered no `main`
  element, so every node on it sat outside a landmark. The landing sections are
  now inside `main`, and the shared chrome wraps all public children in
  `#main-content`, which a new skip link targets.
- **`color-contrast`** — `--muted-foreground` (#6b7280) reached only 4.1–4.4
  against the tinted surfaces it is used on (`bg-muted`, `bg-primary/5`,
  `bg-warning-soft`), and `--warning-soft-foreground` (#af5700) 4.25. Both were
  darkened. The reduced-motion run exposed a second group the first run could
  not see, because the text was still inside an unrevealed section: the
  organization panel and the four static-page call-to-action panels used
  `bg-muted-foreground` as a *surface* with `text-brand-orange-text` (1.1:1),
  `text-muted-foreground` (1.7:1 — invisible) and white at 55–70 % on top. Those
  panels now use `bg-foreground` with light text at 70 % or more.
- **`target-size`** — the landing carousel dots were 8×8 CSS px with 8 px gaps.
  Each dot is now a 24×24 button around the same visual bar.
- **`aria-prohibited-attr`** — GSAP's SplitText put `aria-label` on the `span`
  it splits, which is prohibited on a generic element. The animated spans are
  now `aria-hidden` and the hero `h1` carries the heading text as its name.
- **`scrollable-region-focusable`** — the About timeline scrolls horizontally
  and had no keyboard access. It is now a labelled, focusable region.
- **`heading-order` and `empty-heading`** — podcast, YouTube and event detail
  lists jumped from `h2` to `h4`, the FAQ from `h1` to `h3`, and the event
  schedule section rendered an empty `h2` because `contentDetails.tabs.schedule`
  did not exist in either locale file. Levels corrected; the missing label
  added as `contentDetails.event.schedule`.

## Accepted deviations

- **`landmark-complementary-is-top-level`, 8 nodes.** The FAQ and static pages
  put an `<aside>` beside the article inside `main`. That is valid HTML for
  tangential content and the rule is axe best practice, not WCAG. Left as is
  rather than changed to satisfy a score.
- **The contact page's Leaflet map.** Four of its own controls stay invisible
  or unreachable when focused, and its attribution links are about 14 px tall.
  They are third-party markup; they are recorded in `axe-after.json` under
  `invisibleFocusable` with `revealedOnFocus: false`.
- **Controls under 24 px in the per-state counts** are almost all footer and
  in-text links that the 2.5.8 spacing exception covers; axe's `target-size`
  rule, which implements that exception, reports none.

## Bundle

`bundle-report --check-targets` and `--check-ceilings` both **fail on the
baseline build on this machine**: `/[locale]/contact` is 241.8 KiB gzip against
its 200 KiB target and 23 routes are past the ceilings recorded by SEO-17 on
different hardware and a different Node version. Measured against that same
baseline, this feature adds **0.3–0.5 KiB gzip per route** (framework chunk
unchanged at 129.3 KiB). One route crosses a target as a result: `/[locale]/faq`
moves 200.0 → 200.3 KiB against its 200 KiB target.

## What this does not establish

An axe pass over these states is not a complete accessibility assessment and no
compliance claim is made. Keyboard order, focus restoration, 200 % zoom and the
rendered semantics were checked by hand in Chrome and are recorded in the run
record; screen-reader testing with a real assistive technology was not done.
