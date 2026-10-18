# Public page performance

Engineering budgets and the measurement they rest on. These are this
repository's own budgets, not a search-engine requirement. Nothing here may be
relaxed by editing a number without recording the evidence and the review that
accepted it.

## Targets and ceilings

First-load JavaScript per public route, gzip level 9, each shared chunk counted
once, `noModule` polyfills excluded:

| Route class                                                                                 | Target  |
| ------------------------------------------------------------------------------------------- | ------- |
| Homepage                                                                                    | 300 KiB |
| Catalog, content detail, topic hub and provider profile                                     | 250 KiB |
| Static information page (about, contact, FAQ, services, legal, solutions, company, support) | 200 KiB |

The targets are authoritative. Every budgeted public route meets its target
since SEO-17; the measured values are in "Current measurement" below.

Each route also has a **recorded ceiling**: its measured value plus about two
per cent. A ceiling is a regression guard and never stands in for a target.
Lower a ceiling after an improvement; raising one needs the same evidence and
review a budget change needs.

`bundle-report` has two check modes, and CI runs both after the build:

- `--check-targets` fails when a budgeted route is above its target.
- `--check-ceilings` fails when a budgeted route is above its ceiling or has
  no ceiling recorded.

Outside every budget, and printed separately:

- The `noModule` core-js chunk, which module-capable browsers never fetch.
- Chunks outside every route's first load: dynamic imports fetched on demand
  (the toast surface, the signed-in user menu, the completion and calendar
  dialogs, the contact map, the standalone 404 view) or after hydration (the
  web-vitals reporter when telemetry is allowed). Their total is printed so a
  smaller first-load number cannot hide a larger early cost; the lab harness
  measures which of them a real visit actually downloads.

## Reproducing the measurement

```bash
DEPLOYMENT_ENV=ci NEXT_PUBLIC_SITE_URL=https://www.loopskey.com \
  npm run build --workspace front
npm run bundle-report --workspace front -- --check-targets --check-ceilings
```

`bundle-report` reads each route's client reference manifest and unions its
`entryJSFiles` with `rootMainFiles` from `build-manifest.json`; for a
prerendered route that union equals the script set of its HTML. `--json` prints
machine output and `--next-dir <path>` measures another build directory, which
is how a baseline build is compared with the same method.

The `html KiB` column is the gzip size of the prerendered English document. It
carries the server-rendered markup and the RSC payload, which now includes the
client messages of the page (see below). Routes rendered on demand show `—`; the
lab harness measures their documents.

## How the public shell stays small

The bundler keeps a module whole: importing one export of a module ships all
of it. Measured with source maps, that rule explained most of the cost, so the
work below is about import edges, not micro-optimisation.

- **Client messages come from the server.** `(localized)/layout.tsx` passes the
  active locale's `shell` messages to `RouteLanguageProvider`, and a page whose
  client islands need more wraps them in `<ClientMessages scope="…">`. Scopes
  are listed in `src/i18n/client-scopes.json` and picked from the generated
  public slices, so only strings the client graph can reach are serialised, and
  only for the active locale. Before, both locales' slices (57.6 KiB gzip) were
  JavaScript on every route. `npm run lint` fails when a page's client graph
  needs a key that neither the shell nor its declared scope provides, when a
  scope names a missing key, or when client code reaches
  `src/i18n/public-messages.ts`.
- **Server components where nothing is interactive.** The footer, the static
  information template (nine pages), the homepage's new-feature, services,
  roadmap and testimonial sections render on the server with `loadTranslator`.
  The static page's section navigation stays a small client island.
- **Redux only where RTK Query is used.** The store is provided by the `(app)`
  layout and by the homepage and content-detail pages. The public header reads
  the visitor through `lib/session/public-session.ts`, which calls the same
  `executeWithRefresh` the RTK base query delegates to; it never serialises the
  session into shared HTML. The contact form submits through the same function.
- **Lazy where it is conditional.** The user menu (signed-in visitors only), the
  add-to-calendar dialog (signed-in professionals, on first open) and the 404
  body load on demand. The language switcher is a small disclosure instead of a
  Radix dropdown, and the contact inquiry type is a native `select`.
- **GraphQL modules.** Generated operation modules import `TypedDocumentString`
  from `src/lib/graphql/document.ts`, so a document import no longer loads every
  schema enum in `base.ts`. Enums are generated as `const` objects. The session
  operations live in their own document. Shell modules import from small
  modules (`utils/site-navigation.ts`, `utils/path.util.ts`,
  `utils/contact-inquiry.constant.ts`) and use type-only enum imports with
  literal values checked by the type, instead of `utils/constant.ts` and the
  enum module.
- **No prefetch out of the public site.** On public pages, `localized-link`
  does not prefetch links into the signed-in application (`/auth`, `/dashboard`),
  whose route bundle carries the full dictionary; those load on navigation.

## Rendering and the LCP candidate

- `RevealOnScroll` hides only content that starts below the fold, after
  hydration, and animates it in when it scrolls into view. Content in the first
  viewport is painted visible from the server HTML. Before, every revealed block
  was transparent until JavaScript ran, so the About page's LCP was the header
  logo.
- The homepage hero keeps its slide-in but no longer fades from transparent,
  which had delayed LCP by the 700 ms animation.
- The hero's per-letter title animation (gsap) runs only at 1024 px and wider
  without reduced motion; on phones the title is static text and gsap is never
  downloaded.
- `priority` stays only on the measured LCP image (the homepage hero artwork).

## Lab measurement

`scripts/perf-lab.mjs` drives Chrome over the DevTools protocol, with no extra
dependency. Each sample is a new headless Chrome with an empty profile, so every
visit is cold and isolated. Profiles live in `scripts/perf-lab.config.json`:

- mobile: 412×823 at DPR 1.75, 4× CPU slowdown, 150 ms RTT, 1.6 Mbps down,
  750 Kbps up;
- desktop: 1350×940, no CPU slowdown, 40 ms RTT, 10 Mbps.

The API-backed templates run against `scripts/perf-fixture-api.mjs`, which
executes every operation against the real API schema with deterministic values
and an anonymous visitor; `--latency-ms` simulates a slow upstream. No database,
production host or credential is involved.

```bash
# apps/front
DEPLOYMENT_ENV=ci NEXT_PUBLIC_SITE_URL=https://www.loopskey.com \
  NEXT_PUBLIC_GRAPHQL_URL=http://localhost:5700/graphql npx next build
# repository root
node scripts/perf-fixture-api.mjs --port 5700
# apps/front
DEPLOYMENT_ENV=ci NEXT_PUBLIC_SITE_URL=https://www.loopskey.com \
  GRAPHQL_SERVER_URL=http://127.0.0.1:5700/graphql npx next start --port 3217
# repository root
node scripts/perf-lab.mjs --base-url http://127.0.0.1:3217 --profile mobile \
  --runs 5 --out reports/perf/<date>/lab-mobile.json
```

The browser calls the GraphQL URL inlined at build time. `.env.production`
sets `NEXT_PUBLIC_GRAPHQL_URL` to an empty value and wins over `.env` in a
production build, so pass the fixture URL in the build command's environment;
otherwise every client-side query is silently skipped and the lab measures
pages without their client data. `--visitor PROFESSIONAL` signs the fixture in
as that role to check signed-in states.

The harness rejects and repeats a sample whose document is not a 200 or that
transferred no first-load script, and the report keeps every rejected attempt.

Every sample is kept in the report with its TTFB, FCP, LCP and its element, CLS,
TBT, the five longest tasks and transfer bytes split into first-load scripts,
deferred scripts, prefetch, API calls and the rest. TBT is computed from long
tasks between FCP and a long-task TTI; it approximates Lighthouse TBT and is
not INP. The report also records the machine's unthrottled Lighthouse-style
benchmark index, because a fixed 4× slowdown means different things on
different machines.

## Current measurement

Recorded on 2026-10-18 for SEO-17. All evidence is in `reports/perf/2026-10-18/`:
`bundle-before.json` and `bundle-after.json` for bytes, the `lab-*-paired.json`
files for timings. The baseline is `origin/develop` at `7671090`, built before
any edit; the after build is the SEO-17 branch. Both were built with the same
environment and command.

### First-load JavaScript

Gzip KiB, `bundle-report` method above.

| Route                                 | Target | Before | After | Ceiling now |
| ------------------------------------- | ------ | ------ | ----- | ----------- |
| `/`                                   | 300    | 341.8  | 229.7 | 237         |
| `/courses/[slug]`                     | 250    | 361.7  | 209.9 | 214         |
| `/events/[slug]`                      | 250    | 364.6  | 213.2 | 218         |
| `/podcasts/[slug]`, `/youtube/[slug]` | 250    | 362    | 210.1 | 214         |
| `/content`                            | 250    | 315.2  | 179.1 | 183         |
| `/topics/[slug]`, `/providers/[slug]` | 250    | 310.5  | 165.4 | 169         |
| `/contact`                            | 200    | 353.6  | 199.6 | 200         |
| `/faq`                                | 200    | 324.7  | 189.0 | 193         |
| `/about`, `/services`                 | 200    | 310.9  | 168.7 | 172         |
| `/terms`, `/privacy-policy`           | 200    | 311.7  | 166.8 | 170         |
| nine static information pages         | 200    | 311.0  | 163.7 | 167         |

The framework floor is 129.2 KiB on every route. `/contact` passes with 0.4 KiB
to spare: any addition to that page has to be paid for elsewhere.

What moved out of first load has to be accounted for:

- **The document grew.** Prerendered documents are 3–6 KiB gzip larger on
  static pages and about 12 KiB larger on the homepage, because the server now
  renders those sections and the active locale's client messages travel in the
  RSC payload instead of in JavaScript.
- **Deferred chunks grew** from 1,410 to 1,591 KiB in total. These are fetched
  only on demand: the standalone 404 view carries both public slices, and the
  user menu and the dialogs are separate chunks. The lab's transfer split shows
  what a real visit fetches.

### Lab timings

Each table pairs the two builds. Both were served by `next start` at the same
time and measured alternately, route by route, in five cold samples each, with
the fixture API (anonymous visitor). This laptop's speed drifted by more than 2×
during the day (benchmark index 4,600–27,000 across runs), which made
back-to-back runs of the two builds incomparable. The paired runs below are the
comparison of record. Absolute values are slower than on a normal machine,
because two servers and Chrome shared a throttled laptop. Medians in ms with
the full range in brackets; every sample is kept in the JSON.

#### Mobile, fixture API 0 ms

| Route    | LCP before       | LCP after        | Δ    | TBT before        | TBT after        | Δ    | CLS after | LCP ≤ 2.5 s | TBT ≤ 200 ms |
| -------- | ---------------- | ---------------- | ---- | ----------------- | ---------------- | ---- | --------- | ----------- | ------------ |
| home     | 3896 (3240–5480) | 2968 (2628–5204) | -24% | 4179 (1833–11615) | 2839 (1128–4675) | -32% | 0         | no          | no           |
| catalog  | 2784 (2632–2936) | 3064 (2612–3580) | 10%  | 1638 (1380–1984)  | 1095 (655–1396)  | -33% | 0         | no          | no           |
| course   | 2552 (2420–2864) | 2364 (2256–3008) | -7%  | 1607 (1461–1750)  | 1307 (966–3258)  | -19% | 0         | yes         | no           |
| about    | 2960 (2844–3124) | 2260 (2204–2288) | -24% | 1687 (1488–1743)  | 944 (832–1143)   | -44% | 0         | yes         | no           |
| event    | 2516 (2452–3228) | 2516 (2356–3224) | 0%   | 2247 (1580–2381)  | 1254 (1068–1457) | -44% | 0         | no          | no           |
| podcast  | 2500 (2340–2592) | 2564 (2308–2816) | 3%   | 1548 (1433–1623)  | 1120 (1094–1317) | -28% | 0         | no          | no           |
| youtube  | 2516 (2360–2720) | 2492 (2316–2628) | -1%  | 1673 (1183–1880)  | 1179 (996–1241)  | -30% | 0         | yes         | no           |
| topic    | 1904 (1840–2024) | 2120 (1744–2412) | 11%  | 1360 (1276–1507)  | 909 (676–1748)   | -33% | 0         | yes         | no           |
| provider | 2668 (2160–2880) | 2136 (2112–2456) | -20% | 1384 (1289–2120)  | 826 (705–1202)   | -40% | 0         | yes         | no           |
| static   | 2744 (2696–3184) | 2072 (1968–2112) | -24% | 1528 (988–1554)   | 754 (670–941)    | -51% | 0         | yes         | no           |
| contact  | 2756 (2596–3696) | 2412 (2060–2764) | -12% | 2267 (1978–2699)  | 1640 (1598–1749) | -28% | 0         | yes         | no           |
| home-fr  | 4524 (3768–8912) | 4048 (3316–6104) | -11% | 5119 (3232–10428) | 4952 (3095–6261) | -3%  | 0         | no          | no           |

Benchmark index across all samples: 6048–15546. Rejected and repeated samples: 0. Chrome Chrome/155.0.8059.80, 11th Gen Intel(R) Core(TM) i5-1145G7 @ 2.60GHz, 8 threads, 16 GiB.

#### Desktop, fixture API 0 ms

| Route   | LCP before       | LCP after        | Δ    | TBT before   | TBT after    | Δ     | CLS after | LCP ≤ 2.5 s | TBT ≤ 200 ms |
| ------- | ---------------- | ---------------- | ---- | ------------ | ------------ | ----- | --------- | ----------- | ------------ |
| home    | 912 (776–1628)   | 1212 (1120–1576) | 33%  | 120 (90–344) | 100 (53–274) | -17%  | 0         | yes         | yes          |
| catalog | 1908 (1556–2224) | 1856 (1520–2172) | -3%  | 0 (0–87)     | 0 (0–0)      | —     | 0         | yes         | yes          |
| course  | 960 (808–2624)   | 828 (772–956)    | -14% | 0 (0–545)    | 0 (0–0)      | —     | 0         | yes         | yes          |
| about   | 852 (768–1080)   | 904 (860–1136)   | 6%   | 6 (0–21)     | 0 (0–0)      | -100% | 0         | yes         | yes          |

Benchmark index across all samples: 4590–10018. Rejected and repeated samples: 0. Chrome Chrome/155.0.8059.80, 11th Gen Intel(R) Core(TM) i5-1145G7 @ 2.60GHz, 8 threads, 16 GiB.

#### Mobile, fixture API +800 ms per request

| Route   | LCP before       | LCP after        | Δ    | TBT before       | TBT after        | Δ    | CLS after | LCP ≤ 2.5 s | TBT ≤ 200 ms |
| ------- | ---------------- | ---------------- | ---- | ---------------- | ---------------- | ---- | --------- | ----------- | ------------ |
| home    | 4692 (4208–5724) | 3892 (3828–4436) | -17% | 4116 (4049–4511) | 3072 (2836–3080) | -25% | 0         | no          | no           |
| catalog | 3776 (3336–4040) | 3584 (3424–3676) | -5%  | 1841 (1537–1882) | 1098 (816–1121)  | -40% | 0         | no          | no           |
| course  | 4004 (3772–4324) | 4100 (4024–4336) | 2%   | 1461 (1117–1617) | 1224 (837–1395)  | -16% | 0         | no          | no           |

Benchmark index across all samples: 6934–10202. Rejected and repeated samples: 0. Chrome Chrome/155.0.8059.80, 11th Gen Intel(R) Core(TM) i5-1145G7 @ 2.60GHz, 8 threads, 16 GiB.

### What the lab says

- **TBT improved on every mobile route, by 19–51 %, but no route meets 200 ms.**
  In every sample the largest single task is the evaluation of the framework
  chunk (react-dom and the App Router runtime, 129 KiB gzip). Under a fixed 4×
  slowdown on this machine it takes 300–430 ms on its own. The 200 ms target is
  therefore out of reach for any page that hydrates React on this profile and
  hardware. This is recorded as a miss, not reinterpreted: the profile was not
  changed to pass.
- **LCP meets 2.5 s on mobile** for course, About, YouTube, topic, provider,
  static and contact pages in the paired run. It does not for home
  (2,968 ms), catalog (3,064 ms), event (2,516 ms), podcast (2,564 ms) or the
  French homepage. In the earlier back-to-back run on a faster machine state,
  home measured 2,552 ms and catalog, course and event were under 2.2 s.
- **CLS is 0** on every sample.
- **Regressions to review:** mobile catalog LCP +10 %, topic +11 %, podcast
  +3 %, and desktop homepage LCP +33 %. On these routes LCP equals FCP, and FCP
  moved about 100 ms later. Traces of both builds under the same throttling
  show the cause: the larger document and the fewer, larger chunks let an
  async script finish downloading and run before the first frame. On the
  desktop homepage the LCP element also changed. Before, the hero image was
  transparent during its fade-in, so Chrome reported the heading; now the image
  is painted visible, and it is the real LCP candidate. These are explained
  trade-offs, not unexplained regressions, but they exceed 5 % and need a review
  decision.
- **Slow upstream (+800 ms per API request):** home LCP improved 17 % and catalog
  5 %; course is unchanged within noise. TBT fell 16–40 %.

How to make the TBT target reachable is a separate decision: less hydration on
the homepage and detail pages (more server components), or a reviewed profile
calibrated to the benchmark index. Neither is part of this change.

### Measurements that did not count

Recorded so they are not mistaken for evidence:

- Every lab run before the final builds was made with an empty
  `NEXT_PUBLIC_GRAPHQL_URL`, which `.env.production` sets. Client queries were
  skipped, so those runs under-measured hydration work. They were discarded.
- One run was disturbed by a second lab process and produced error pages; the
  harness now rejects such samples.

## Field metrics

Field p75 LCP, INP and CLS come from the telemetry of feature 12 and are kept
apart from every lab number here. No field sample has been read for this work,
so field performance is recorded as insufficient evidence, not as a pass.
