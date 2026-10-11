# seo-11-public-page-performance

- Scope: `front`
- Model: `Standard development — measured frontend delivery work inside the established public-route patterns, with no contract, caching or routing change; escalates to High reasoning only if evidence forces one.`
- Branch: `feature/seo-11-public-page-performance`
- Base: `9683fbb16ffdcf22cf4af063df2627e8d3fb101f`
- Status: `Blocked`

Implementation is complete and the JavaScript-delivery half of the
specification is measured and reproducible. Three required gate items could not
run in this workspace — the full production build, the browser check and the
mobile lab traces — for the environmental reasons recorded under "Gate status"
and "Not measured here".

CI carries the build gate. The browser check, the mobile lab traces and the
budget amendment remain open and still need a reviewer.

## Acceptance

- [x] Reproducible before/after baseline exists for every representative template
      **for first-load JavaScript**. Not satisfied for server timing and the
      mobile lab trace on the API-backed templates — see "Not measured here".
- [ ] Route JS budgets are met or an explicit reviewed budget amendment is
      recorded before the feature is marked accepted. **Budgets are not met.**
      No budget was changed. The targets stand, the gap is printed on every
      report run, and the amendment proposal below is submitted for review.
- [x] Heavy unused libraries are absent from the measured public route chunks.
- [ ] Recorded mobile lab LCP/CLS targets pass without unexplained >5%
      regression. Measured on the static template only; the API-backed
      templates could not be traced here.
- [ ] Primary content, images and layout remain correct through
      hydration/errors — browser verification outstanding.
- [x] No publication/locale/privacy regression or unsafe caching is introduced.
      No cache header, revalidation value or `no-store` decision was touched,
      and no personal state was moved into a shared cache.
- [ ] Responsive/keyboard/reduced-motion behavior passes browser verification —
      outstanding.
- [x] Field metrics are reported separately; missing field data is not marked
      pass. There is no field telemetry in this repository yet; feature 12 owns
      it, and nothing here infers field LCP, INP or CLS from a lab run.

## Measurement profile

- Hardware: Apple M1, 8 cores, 8 GB RAM, macOS 26.4.1
- Node 25.9.0, npm 11.12.1, Next.js 16.2.4 (Turbopack)
- Build env: `DEPLOYMENT_ENV=ci`,
  `NEXT_PUBLIC_SITE_URL=https://www.loopskey.com`, the rest from
  `apps/front/.env.local`
- Compression: gzip level 9 over the emitted chunks, the form `compress: true`
  delivers
- Baseline commit: `9683fbb` (origin/develop). Both measurements come from a
  clean `rm -rf .next` production build under the identical profile.

## First-load JavaScript, before and after

gzip KiB, each shared chunk counted once, `noModule` polyfills excluded.

| Route | Before | After | Change |
| --- | --- | --- | --- |
| `/[locale]` homepage | 448.2 | 348.7 | −99.5 |
| `/[locale]/content` | 419.8 | 320.3 | −99.5 |
| `/[locale]/courses/[slug]` | 512.0 | 398.9 | −113.1 |
| `/[locale]/events/[slug]` | 514.9 | 401.8 | −113.1 |
| `/[locale]/podcasts/[slug]` | 512.2 | 399.7 | −112.5 |
| `/[locale]/youtube/[slug]` | 512.2 | 399.7 | −112.5 |
| `/[locale]/about` static page | 413.7 | 314.3 | −99.4 |
| `/[locale]/contact` | 489.6 | 389.2 | −100.4 |
| `/[locale]/faq` | 428.0 | 328.6 | −99.4 |
| every other static information page | 414.8 | 314.4 | −100.4 |

Dashboard and auth routes are unbudgeted and also improved, by about 21 KiB
each, because two of the fixes were in shared type modules.

A measurement correction landed first and is separate from the improvements
above: the core-js chunk carries `noModule`, so a module-capable browser never
downloads it. The previous report counted it as first-load JavaScript and
overstated every route by 38.5 KiB gzip. The "before" column already has it
removed, so the table shows real change, not the correction.

## What the measurement found

Four demonstrated costs, in the order they mattered:

1. **Both full dictionaries on every public route — 149.6 KiB gzip**, about a
   third of a static page's first-load JavaScript. Three separate leaks caused
   it, two of them the exact runtime edge the standards warn about:
   `types/providers.types.ts` value-imported `@/i18n/dictionaries`,
   `types/element.types.ts` value-imported `lucide-react` for a `typeof Eye`,
   and `utils/static-info-page.utils.ts` mixed server metadata helpers that
   read the full dictionary with helpers that client components import.
   After: 58.5 KiB, a generated public slice holding only the key paths the
   public client graph can reach.
2. **The completion dialog on every content detail page.** It renders only for
   a signed-in professional, yet every anonymous visitor downloaded it together
   with its CPD endpoints, evidence upload and form schema. Now behind
   `next/dynamic`, mounted on first open.
3. **`sonner` on every route — 16.7 KiB gzip.** `hooks/notify.ts` imported it
   statically and the public header imports `notify`, so a visit that raised no
   toast still paid for the toast surface. `notify` now publishes to a queue
   with no reference to `sonner`, and `AppToaster` loads the surface on the
   first request and replays the queue.
4. **An unmeasured image preload.** The header logo carried `priority` on every
   route, preloading an 8-pixel-tall SVG ahead of the real LCP candidate.

Heavy libraries were checked against the emitted chunks rather than the import
syntax: `@fullcalendar/*`, `recharts`, `xlsx`, `leaflet`, `react-leaflet`,
`gsap` and `html-to-image` are absent from every public route's first-load
chunks. `leaflet` is behind `next/dynamic` on `/contact`, `gsap` behind a
deferred `import()`. `lucide-react` is present at 9.4 KiB gzip; the
`import * as L` form used across the codebase is tree-shaken, so it is not the
cost it looks like and was left alone.

Fonts and third-party scripts needed no work: the app loads no web font and no
external script. That is a recorded finding, not an omission.

Request memoization asked for by the specification was already in place from
feature 03/04 — `lib/server/public-content.ts` wraps every public read in React
`cache`, and `generateMetadata` and the page body share one upstream read.

## Budget amendment proposal

Not a budget change. The targets in `scripts/bundle-report.js` are unchanged and
every run prints the remaining gap. This records why the gap exists and what
would close it, for review.

The floor is 129.3 KiB gzip of framework — react-dom, the App Router runtime and
the Turbopack runtime — on every route. A 200 KiB static-page budget therefore
allows 70.7 KiB of application code; a static information page now carries
185.1 KiB. The three remaining costs are structural, not incidental:

- **The second locale's dictionary slice, about 29 KiB gzip.** `/[locale]` is a
  dynamic segment, so one route entry serves both locales and the layout
  references both locale providers. Shipping only the active locale needs the
  locale to become separate route entries, which is a routing change that would
  touch feature 06's design and needs High reasoning review.
- **Redux Toolkit and RTK Query, 28.4 KiB gzip.** The public header resolves the
  signed-in user through `useCurrentUserQuery`. The frontend has no server-side
  session reader, and the static information pages are prerendered, so auth
  state cannot move to the server without making them dynamic — which would cost
  more than it saves and risks personal state in a shared cache.
- **About 57 KiB of client shell beyond that.** `Header`, `Footer` and every
  landing and static page template are client components. Reaching the target
  needs them converted to server components with small client islands, which is
  a re-architecture rather than a delivery fix.

Proposed for review, in preference order: keep the targets and treat them as the
goal for a follow-up that does the server-component conversion; meanwhile the
recorded per-route ceilings block regression. If review prefers budgets that are
currently achievable, the evidence supports 330 KiB for a static information
page, 330 for catalog, 360 for homepage and 410 for detail, and `/contact` needs
its own 400 because of the deferred map and the contact form.

Until review decides, `npm run bundle-report --workspace front --check` enforces
the per-route ceilings, so no change may quietly make a public route heavier.

## Not measured here

Stated as insufficient evidence rather than folded into a pass:

- **Server timing and the mobile lab trace for `/content` and the four detail
  templates.** Both are `force-dynamic` and need the API. This workspace has no
  `apps/api/.env`, so the API cannot be started and no database is seeded. No
  number was estimated for them.
- **Homepage lab trace.** The shell is prerendered but its content sections load
  through RTK Query, so a trace here would measure skeletons, not the real LCP
  candidate.
- **Field metrics.** No field telemetry exists in the repository; feature 12
  owns it.

## Verification

- `npm run check-types --workspace front` — pass
- `npm run lint --workspace front` — pass, including the new public-slice drift
  and reachability check (519 key paths across 21 namespaces, all reachable in
  both emitted slices)
- `npm run bundle-report --workspace front` — pass against the recorded
  ceilings; prints the remaining gap to the target budgets
- `npm run bundle-report --workspace front -- --check` — exit 0. Negative test:
  lowering one route's ceiling in a copy of the script made it exit 1 and name
  that route, so the guard is known to fire rather than assumed to.
- Reproducibility: two independent `rm -rf .next` production compiles under the
  identical profile produced byte-identical per-route figures, to the tenth of a
  KiB, including the 129.3 KiB framework floor and the 2606.3 KiB total.
- Cross-check of the measurement method: for a prerendered route, the union of
  `entryJSFiles` and `rootMainFiles` equals the chunk set in that route's HTML
  exactly — 21 shared files, 0 discrepancies on `/en/contact` — which is what
  licenses using the manifests for the dynamic routes the HTML cannot cover.

## Gate status

Not run, with the reason:

- **Full production build — did not complete here, after four attempts.** The
  compile phase succeeds in 23–37 s and emits every chunk and route manifest, so
  the first-load measurement above is from real build output and reproduced
  byte-identically twice. Past that point the build stalls on this 8 GB machine,
  where unrelated local Docker containers hold roughly 180% CPU and most of the
  RAM: twice the TypeScript worker was killed and respawned until no progress
  was made, and on the final attempt the build sat at 0% CPU for eighteen
  minutes without compiling at all. No `BUILD_ID` was ever written, so the
  prerender phase never ran.

  Two things keep this from being a verdict on the code. Standalone
  `npm run check-types` passes on the same tree — the same compiler over the
  same files — and `9683fbb` itself built end to end earlier in this session
  under the same profile, before the machine degraded. One of the four stalls
  was self-inflicted: killing a competing `tsc` left a truncated
  `tsconfig.tsbuildinfo`, and removing it restored real progress for a while.
  The remaining stalls were not, so this is an environment limit rather than
  only my own mistake.
- **Browser check — not run.** It needs `next start`, which needs the completed
  build above.
- **Mobile lab traces — not run.** Same dependency, plus the API dependency
  below. A harness was written and verified to drive real Chrome 151 with 4×
  CPU throttling and a Slow-4G profile over five cold runs per route; it was
  never run against the application, so no LCP, CLS or blocking-time figure is
  claimed anywhere in this record.

These three must run in CI or on a machine with free memory before the feature
can be accepted. Nothing in the measured section depends on them.

## Submission

- Commit:
- PR:
- CI:
