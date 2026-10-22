# SEO 18 — public accessibility and navigation quality

- Scope: `front` (plus a root diagnostic script and four exported helpers in `scripts/perf-lab.mjs`; no API change)
- Model: `Standard development — bounded semantic, contrast and target-size corrections inside existing public primitives; no auth, locale or data contract changed`
- Branch: `feature/seo-18-public-accessibility`
- Base: `571e5fe4`
- Status: `Submitted` — every required check passes except the bundle budgets, which fail identically on the baseline build; that and three accepted deviations are submitted for review (see "Open decision" and "Accepted deviations")

## Acceptance

- [x] Every scoped finding is tied to an element and resolved with before/after evidence. `reports/a11y/2026-10-19/`: 58 states per run (14 routes × en/fr × 360 and 1350 px, plus the mobile home with the navigation open), axe-core 4.10.3 in Chrome 155. 1,058 findings become 8; the reduced-motion run, 1,052 become the same 8. The spec's production benchmark (`reports/seo/2026-10-13/BENCHMARK.fa.md`) does not exist in this repository, so the representative route matrix is the measurement of record.
- [x] One `main` landmark, coherent headings and valid names/ARIA. The homepage had no `main` (858 `region` nodes); the landing sections are now inside `main` and the shared chrome wraps every public route in `#main-content`. `landmark-one-main`, `region`, `heading-order`, `empty-heading` and `aria-prohibited-attr` are all zero.
- [x] Contrast meets WCAG 2.2 AA for scoped text. `--muted-foreground` and `--warning-soft-foreground` were darkened so they pass on the tinted surfaces they sit on, `--brand-orange-text` so it passes on its own 10 % badge, and the five dark panels that used `bg-muted-foreground` as a surface now use `bg-foreground` with light text. 138 `color-contrast` nodes across 36 states become 0.
- [x] Applicable 24×24 target size and spacing is met. The only `target-size` failures were the carousel dots (8×8 px, 8 px apart); each is now a 24×24 button around the same bar. The remaining under-24 px controls in the per-state counts are footer and in-text links covered by the 2.5.8 spacing exception, which axe's rule implements and reports as passing.
- [x] Keyboard, focus restoration, reduced motion, 200 % zoom and 360 px en/fr navigation work without traps or overflow. Checked in Chrome: Tab order on the catalog at 360 px runs skip link → logo → language → menu → tabs → search → filters → cards with a visible ring at every stop; the mobile menu reports `aria-expanded`, Escape closes it and returns focus to the toggle, and the panel is `inert` while closed; the language menu does the same; every reveal-animated control becomes visible when focused (`revealedOnFocus` in the report); at 640 CSS px (1280 at 200 % zoom) all eleven checked routes have one `main`, one `h1` and no horizontal overflow.
- [x] True 404 status, SSR content and URL behaviour remain intact. `/no-such-page-a11y-probe` and the French detail variants answer 404 in the report's `status` field and render the chrome with the recovery links. No route, redirect, canonical or cache setting was touched.
- [ ] Route bundle targets remain intact. **`bundle-report --check-targets` and `--check-ceilings` already fail on the baseline build on this machine** (`/[locale]/contact` 241.8 KiB against a 200 KiB target; 23 routes past ceilings recorded by SEO-17 on other hardware). Against that same baseline this feature adds 0.3–0.5 KiB gzip per route, and `/[locale]/faq` crosses its target as a result: 200.0 → 200.3 KiB. See "Open decision".
- [x] Evidence recorded without adding any frontend test file. No file under `apps/front` matches `*.test.*`; the diagnostics live in `scripts/a11y-audit.mjs`.

## Accepted deviations

- `landmark-complementary-is-top-level`, 8 nodes: the FAQ and static pages place an `<aside>` beside the article inside `main`. Valid HTML for tangential content, axe best practice rather than WCAG; not changed to satisfy a score.
- The contact page's Leaflet map keeps four controls that stay invisible or unreachable when focused and attribution links about 14 px tall. Third-party markup, recorded in the report rather than patched.
- Text behind the open mobile navigation is measured through its scrim, which lowers its contrast in the `+menu` states.

## Open decision

`/[locale]/faq` is 0.3 KiB gzip over its 200 KiB target because the shared public dictionary carries five new localized labels (skip link, navigation landmark names, carousel controls, catalog recovery). The route was at exactly 200.0 KiB on the baseline build here, and the recorded targets and ceilings do not reproduce on this machine at all, so the number needs a review decision: re-record the budgets on CI hardware, or trim the faq route. Nothing was changed to hide it, and no target or ceiling was edited.

## Verification

- `npm run lint --workspace front` — pass (eslint, i18n placeholders, public slice drift)
- `npx tsc --noEmit -p apps/front` — pass
- `DEPLOYMENT_ENV=ci NEXT_PUBLIC_SITE_URL=https://www.loopskey.com NEXT_PUBLIC_GRAPHQL_URL=http://localhost:5700/graphql npm run build --workspace front` — pass
- `npm run bundle-report --workspace front -- --check-targets --check-ceilings` — fail, and fails identically on the baseline build; same-machine delta +0.3–0.5 KiB gzip per route (`reports/a11y/2026-10-19/bundle-before.json`, `bundle-after.json`)
- `node scripts/a11y-audit.mjs --self-test`, `node scripts/perf-lab.mjs --self-test` — pass
- `node scripts/a11y-audit.mjs --base-url http://localhost:3100 --routes all` on both builds, with and without `--emulate reduced-motion` — four reports in `reports/a11y/2026-10-19/`
- Browser matrix in Chrome 155 at 360×740, 640×512 and 1350×940, en and fr: keyboard order, menu and language-menu open/close with Escape and focus restoration, skip link, reveal-on-focus, 404 recovery links, no horizontal overflow
- No frontend test file added or run

## Submission

- Commit: 4276765a
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/315
- CI: pending

## Develop integration — 2026-10-22

- Model tier: Standard development; bounded conflict resolution in existing public UI and generated translations, without an API or data change.
- Integration base: `origin/develop` at `66ce868e69c6b9e421ea69bd521da2ce329b0a80`.
- Merged develop into the PR branch without rewriting its existing commits.
- Kept the updated logo asset dimensions and responsive sizing from develop, together with the localized accessible name from this PR.
- Kept the new navy, sky and large-text brand tokens alongside the corrected orange small-text contrast.
- Accepted removal of the superseded `LandingContentCarousel`; the replacement Learning Shelf already has localized controls and larger targets. Regenerated the public dictionaries from the merged import graph.
- Preserved all four feature-history entries for PRs #315–#318.
- Fresh checks: frontend lint, TypeScript, public dictionary drift, `next build --webpack` and the accessibility/performance/fixture harness self-tests pass. Playwright/axe checked 14 reduced-motion states with zero violations; keyboard and responsive checks passed in both locales at 360, 640 and 1350px. Evidence and local build limitations: `reports/a11y/2026-10-22/README.md`.
- The measurements under `reports/a11y/2026-10-19/` remain historical evidence against `571e5fe4`; they are not measurements of this integration revision.
