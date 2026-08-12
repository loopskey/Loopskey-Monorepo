# Performance: shared shell cost

- Scope: `front`
- Branch: `feature/performance-shell-hydration`
- Base: `b72bcb7`
- Status: `Submitted`

Spec: `context/features/performance-optimization.md`.

Continues what PR #18 left open. That run cut first-load JavaScript through
bundling changes and recorded the remaining problem: the shared shell is a
fully client-rendered tree, so a static text page such as `/cookies` still
downloaded the whole GraphQL surface and the whole i18n dictionary, and the
landing headline was invisible until hydration finished.

## Measurement

`npm run bundle-report --workspace front` on a clean production build of each
tree.

| Metric                   | Base `b72bcb7` | This branch | Change |
| ------------------------ | -------------- | ----------- | ------ |
| Worst route              | 1586.6 KB      | 1452.5 KB   | −8.5%  |
| Median route             | 1275.4 KB      | 1117.5 KB   | −12.4% |
| `/` (landing)            | 1505.9 KB      | 1273.7 KB   | −15.4% |
| `/cookies` (static text) | 1267.9 KB      | 1110.0 KB   | −12.5% |

Where the weight went:

- **GraphQL, ~158 KB off every route.** `/cookies` shipped 214 operations —
  the entire admin, organization and professional surface — for a page that
  issues one query. It now ships the 18 auth operations the shell actually
  uses. Three separate things caused it, and all three had to go:
  - `generated.ts` was a single 580 KB module, so the bundler could only take
    it whole. Codegen now writes `base.ts` (schema types and enums) plus one
    module per document file, behind a `generated.ts` barrel that keeps the
    old import path working.
  - every document was `new TypedDocumentString(...)`, a constructor call the
    bundler must assume has side effects. `scripts/graphql-postprocess.js`
    marks them `/*#__PURE__*/`.
  - `types/element.types.ts` imported an enum with a plain `import` for a
    type annotation, and the root layout reaches it through
    `particles-background`. That one edge pulled the barrel into every route.
- **GSAP, ~70 KB off the landing route**, and out of first-load JS entirely.

## Largest Contentful Paint

`SplitText` rendered the hero `<h1>` at `opacity: 0` server-side and only
revealed it once hydration, `document.fonts.ready` and the tween had all
finished, which is what made LCP 11.6 s with 11.1 s of render delay. The text
is now ordinary server-rendered markup and the animation is a decoration
loaded afterwards, so the headline paints with the document. Reduced-motion
visitors never download `gsap` at all.

Measured against `next start` on this branch, unthrottled, so these are not
comparable to the mobile Lighthouse numbers in PR #18 — they confirm the shape
of the fix, not a score:

| Metric      | Value                                     |
| ----------- | ----------------------------------------- |
| FCP         | 356 ms                                    |
| LCP         | 1072 ms                                   |
| LCP element | hero subtitle — no longer the gated `<h1>` |

Verified in a browser that the hero still animates and that the gradient line
(`inheritGradient`) renders, since that path moved modules.

## Acceptance

- [x] A route only downloads the GraphQL operations it uses
- [x] The landing hero paints its headline without waiting for hydration
- [x] `gsap` is out of first-load JavaScript
- [x] No behavior change: lint, types, tests and build pass
- [x] Codegen regenerated and the artifact committed

## Verification

- `npm run lint --workspace front` — pass
- `npm run check-types --workspace front` — pass
- `npm run test --workspace front` — pass (42 tests, 5 files)
- `npm run build --workspace front` — pass
- `npm run codegen --workspace front` — pass, regenerated artifact committed
- `npm run bundle-report --workspace front` — pass
- Browser check of `/` and `/cookies` against `next start`

## Not done

- **The i18n dictionary is still 165 KB on every route**, now the single
  largest addressable item in the shared floor and larger than react-dom's
  222 KB is compressible. `en.json` is one module, so `/cookies` downloads
  `professionalDashboard` (36 KB), `adminDashboard`, `providerDashboard` and
  the rest. Splitting it per namespace and loading namespaces by route would
  take roughly 140 KB off the static pages. It was left out of this run
  because a wrong route-to-namespace mapping renders blank text rather than
  failing a check, so it needs its own run with per-route verification.
- **`RevealOnScroll` renders its children hidden server-side** (`useState(false)`
  plus an opacity/translate class), and it wraps most of the content on the
  static pages. Same class of bug as the hero headline, not yet fixed.
- Lighthouse was not re-run. PR #18 measured 36 on `/` with mobile throttling;
  this run removes two of the three causes it attributed (shell weight and the
  GSAP hero) but the shell is still a fully client-rendered tree, so the score
  should be re-measured rather than assumed.
- `import * as L from "lucide-react"` remains in ~90 files. It did not show up
  in the shared floor, so it was left alone rather than churned.

## Submission

- Commit: `321db87`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/22
- CI: pass — "Lint, types, tests, build" on `8ee1411` (1m48s)
