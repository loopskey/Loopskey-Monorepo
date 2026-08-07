# Performance Optimization Standard

- Scope: `front`
- Branch: `feature/performance-optimization`
- Base: `fa487af`
- Status: `Submitted`

Spec: `context/features/performance/performance-optimization.md`.

`develop` had been deleted on the remote after PR #17 merged it into `main`. It
was recreated at `main` and this branch rebased onto it; the base tree is
unchanged from `7ae7faf`, so the baseline numbers below still hold.

## Measurement

`npm run bundle-report --workspace front` (added by this run) reports first-load
JavaScript per prerendered route, derived from the scripts each prerendered page
references. Both numbers below come from a clean production build.

| Metric                          | Base `7ae7faf` | This branch | Change |
| ------------------------------- | -------------- | ----------- | ------ |
| Worst route (`/contact`)         | 3480.4 KB      | 1572.2 KB   | −55%   |
| Median route                     | 2175.6 KB      | 1279.4 KB   | −41%   |
| `/dashboard/professional`        | 3480.4 KB      | 1504.7 KB   | −57%   |
| `/` (landing)                    | 2364.1 KB      | 1468.0 KB   | −38%   |

Where the removed weight went:

- generated GraphQL module 443 KB → 175 KB, and `graphql`'s printer left the
  browser bundle entirely (codegen now emits query strings, not ASTs)
- dashboard tabs, `recharts`, `@fullcalendar/*`, `xlsx`, `three` moved out of
  initial route JS into chunks fetched when used
- i18n dictionaries 215 KB → 131 KB (French no longer preloaded)

## Acceptance

- [x] Dashboard shells code-split per tab instead of statically importing every tab
- [x] `three`/WebGL background loaded only when it is actually rendered
- [x] `xlsx`, `@fullcalendar/*`, `recharts` kept out of initial route JS
- [x] `leaflet` CSS no longer render-blocking on every route
- [x] French dictionary no longer in the initial client bundle
- [x] Unused runtime dependencies removed from `apps/front/package.json`
- [x] Image/caching/compression config applied in `next.config.ts`
- [x] `fill` images all declare `sizes`
- [x] Repeatable bundle report committed and documented
- [x] No behavior change: existing tests, lint, types, and build pass

## Verification

- `npm run lint --workspace front` — pass
- `npm run check-types --workspace front` — pass
- `npm run test --workspace front` — pass (140 tests, 15 files)
- `npm run build --workspace front` — pass
- `npm run codegen --workspace front` — pass, regenerated artifact committed
- `node apps/front/scripts/bundle-report.js` — pass

## Not done

- Splitting `src/lib/graphql/generated.ts` per operation (codegen
  `near-operation-file` preset) would take the remaining 175 KB off routes that
  do not use those operations, but it moves every generated operation type and
  touches most of the frontend. Left as a follow-up.
- The English dictionary (131 KB) is still in the initial bundle; splitting it
  per route needs server-side i18n rather than a client provider.
- **Lighthouse is still ~36 on `/`.** Measured with Lighthouse 12 (mobile
  preset, simulated throttling) against `next start` on this branch. The
  spec's 90+ target is not met and bundle size alone will not reach it.

  | Audit | Value |
  | ----- | ----- |
  | Performance score | 36 |
  | TTFB | 10 ms |
  | FCP | 1.0 s |
  | CLS | 0 |
  | LCP | 11.6 s (render delay 11.1 s; load delay and load time both 0) |
  | TBT | 14,210 ms |

  Network and server are not the problem — the score is entirely main-thread
  JavaScript. Attribution, each measured by re-running Lighthouse with one
  thing disabled:

  - shared shell hydration ≈ 10 s TBT, paid on every route. `/cookies`, a
    static text page with no data, no charts and no animation, still scores 50
    with 12.2 s TBT.
  - the GSAP `SplitText` hero ≈ 5.3 s TBT and ≈ 5.2 s LCP (measured with
    `--force-prefers-reduced-motion`, which short-circuits it). It also renders
    the `<h1>` with inline `opacity: 0` server-side, so the headline is
    invisible until hydration, `document.fonts.ready` and the tween all finish.
  - the WebGL background ≈ 2.3 s TBT for dark-mode visitors (measured by
    blocking its chunk). Light mode never loads it after this branch's change.

  Reaching 90 needs the shell to stop being a fully client-rendered tree —
  `/cookies` should not ship Redux, the GraphQL document module or the i18n
  dictionary. That is an architecture change, not a bundling one.

## Submission

- Commit: `a45b3a8`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/18
- CI:
