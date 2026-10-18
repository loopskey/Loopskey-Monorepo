# SEO 17 — mobile rendering and JavaScript budgets

- Scope: `front` (plus root measurement tooling, CI and one `exports` entry in `@loopskey/api-contracts`; no API change)
- Model: `High reasoning — the public shell's auth state, the server/client locale boundary and visibility-safe delivery must be preserved while restructuring shared rendering`
- Branch: `feature/seo-17-mobile-performance`
- Base: `7671090`
- Status: `Ready` — implementation and every required check pass. Two acceptance items fail on evidence; the user chose to submit with them recorded as an open review decision (see "Open decision")

## Acceptance

- [x] A reproducible same-method before/after baseline exists for bytes and mobile lab timings. `reports/perf/2026-10-18/`: bundle reports of both builds, and paired lab runs (`--compare-url`) where both builds are served at once and sampled alternately, because this laptop's speed drifted more than 2× during the day.
- [x] Every scoped public template meets its existing gzip target. `bundle-report --check-targets --check-ceilings` passes on a CI-equivalent build: home 229.7/300, details 209.9–213.2/250, catalog 179.1/250, topic/provider 165.4/250, static pages 163.7–189.0/200, contact 199.3/200. CI now runs both checks; both fail against the baseline build.
- [ ] Five controlled runs per representative template meet median LCP/CLS/TBT targets with every sample retained. Every sample is retained and CLS is 0 everywhere. **TBT misses 200 ms on every mobile route** (paired medians 754–2,839 ms, down 19–51 % from baseline). The framework chunk alone evaluates in 300–430 ms under the fixed 4× slowdown on this machine. **LCP misses on mobile home (2,968 ms) and catalog (3,064 ms)** in the paired run; it meets 2.5 s for course, About, static, contact, topic, provider and YouTube.
- [ ] Desktop and other templates show no unexplained >5 % regression on comparable runs. Paired runs show mobile catalog LCP +10 %, topic +11 % and desktop home +33 %. Traces explain them: LCP equals FCP there, and FCP moved about 100 ms later because the larger document and fewer, larger chunks let an async script run before the first frame. On desktop home the LCP element changed from the heading to the hero image, which used to be transparent during its fade. They are explained but exceed 5 % and need review.
- [x] SSR content, locale, private state, fresh publication and existing user actions remain correct. Checked in Chrome at 412 and 1350 px against the production build (en and fr): every public route renders server text in the right language, with no hidden above-the-fold text and no horizontal overflow; 404s render inside the chrome; a signed-in professional sees the user menu, and both detail dialogs open fully translated; the language menu closes on Escape and returns focus; contact validation is unchanged. No cache, revalidation or `force-dynamic` setting changed, and no session reaches shared HTML. The logout flow was not exercised end to end.
- [x] Field metrics are separate and honestly insufficient (no field sample was read); bundle, slice, scope-coverage, lint, type and build gates pass.

## Open decision

TBT ≤ 200 ms cannot be met on this profile and hardware by any page that hydrates React; the floor is the framework's own evaluation. Options for review: more server components on home and details to cut hydration, or a reviewed profile calibrated to the benchmark index. The LCP trade-offs above also need a decision. Neither change was made here; no target or profile was changed to pass.

## Verification

- `npm run lint --workspace front` — pass (eslint, i18n placeholders, public slice drift, scope coverage including lazy scopes)
- `npx tsc --noEmit -p apps/front` — pass
- `DEPLOYMENT_ENV=ci NEXT_PUBLIC_SITE_URL=https://ci.loopskey.invalid npm run build --workspace front` — pass
- `npm run bundle-report --workspace front -- --check-targets --check-ceilings` — pass; same command against the baseline build exits 1 for both checks
- `npm run codegen --workspace front` twice — identical output (CI drift check)
- `node scripts/perf-lab.mjs --self-test`, `node scripts/perf-fixture-api.mjs --self-test`, `node scripts/seo-audit.mjs --self-test`, `node scripts/check-deployment-config.mjs --self-test` — pass
- `npm run check-types --workspace @loopskey/api-contracts` and `build` — pass
- Temporary instrumented build logging every missing translation key, crawled over all public routes in both locales and signed in: only keys absent from `en.json` itself remain (`landing.provider.stats.*`, `landing.provider.funnel.promote`, `landing.provider.dashboard.fallbackProvider`, `contentDetails.tabs.schedule`) — pre-existing, reported, not fixed (needs product copy)
- Lab: `reports/perf/2026-10-18/lab-*-paired.json`, mobile and desktop, fixture API at 0 ms and +800 ms

## Submission

- Commit:
- PR:
- CI:
