# Landing v10 — responsive redesign with reusable components and legacy cleanup

- Scope: `front`
- Model: `Standard development — a bounded public-page redesign in established frontend patterns; no auth, data, contract or backend change.`
- Branch: `feature/landing-v10-responsive-redesign`
- Base: `209e17ee6f1b7c0720e52084b6f1353081fcbfb3` (rebased onto `15b40c5c` before submission; lint, check-types, i18n slices and codegen re-run clean)
- Status: `Submitted`
- Spec: `context/features/landing-v10-responsive-redesign/landing-v10-responsive-redesign.md` (reference images in `baseline/`, SHA-256 verified)

## Acceptance

- [x] FR-01 order on `/` and `/fr`: Hero, highlights, Suggested (unchanged), steps, services, roadmap, associations/organizations, audiences, FAQ, final CTA. One DOM per section, one `main`, one `h1` (checked in SSR HTML and the browser).
- [x] Hero: two-tone heading (foreground + primary), account CTA then Explore learning, plan note, `hero.png` with a non-interactive Sample credit card. Search, explorer, results unchanged.
- [x] Highlights strip shows "Learning catalog" text, not `60,000+`; "4 formats" names the four existing types.
- [x] 3 steps, 4 services, 3 audience cards (DOM counts).
- [x] One roadmap introduction (`LandingNewFeature` removed) and one shared associations/organizations section.
- [x] Previews carry a visible Sample / Sample data label; sample values are typed constants and internally consistent (51% = 18/35, on-track stat = status share). No dashboard query on home for any role.
- [x] FAQ: six IDs in spec order from `faqPage.items` (no landing copy), first open, single + collapsible, ArrowDown/Enter/Space work, triggers 64 px.
- [x] Final CTA before footer; one resolver (`utils/landing-actions.ts`) drives Hero, steps, roadmap and final CTA.
- [x] Session matrix (fixtures): checking → aria-hidden fixed-size placeholder, no auth link in SSR; anonymous → `/auth/professional`; Professional → `/dashboard/professional`, roadmap → `?tab=roadmap`; Association/Organization/Provider/Admin → own dashboard via `getDashboardPath`, roadmap → `/solutions/professionals`. No role switch.
- [x] Mobile menu: closed panel `inert`, Escape closes and returns focus to the toggle. Home shows inline EN/FR (`aria-current` on the active one); other pages keep the language menu; detail pages unchanged (`isDetailPath` branch untouched).
- [x] 320/360/390/768/1024/1280/1440 in EN and FR: no page-level horizontal scroll. Fixed a French header overflow at 1024 (nav `mx-1 px-2` until `xl`, `whitespace-nowrap`).
- [x] FR at 320 with reduced motion: no clipped text or controls. No new animations; the placeholder pulse is `motion-reduce:animate-none`; hero results animation is `motion-safe`.
- [x] Section `aria-labelledby` landmarks, h1 → h2 → h3 order; search input and clear button gained accessible names.
- [x] `LandingFeatured` and Learning Shelf files untouched; no Most popular row; no card changes.
- [x] Hero search: result, empty, failure (existing "no matching content" fallback), slow (skeletons), min length, clear, category select/switch/clear.
- [x] Legacy cleanup complete (evidence below).
- [x] `/faq`, `/fr/faq`, `/services`, `/fr/services`, four solutions, `/contact`, `/fr/contact`, `/about`, `/company/content-providers` → 200; `/en` → 308; unknown path → 404.
- [x] Static sections are server components; client islands are Hero, session action, FAQ accordion. No dependency added.
- [x] lint, check-types, build, i18n drift, `git diff --check` pass. Bundle check: see Verification.
- [x] Before/after screenshots taken; no frontend test file added.

## Cleanup evidence

`rg` over the repo (excluding `context/`, `apps/api`, generated `base.ts`) for every removed name, hook, type, constant, CSS keyframe, dictionary namespace and GraphQL operation: only two historical a11y reports mention SplitText.

- Deleted (sole consumer was the home page or another deleted file): `LandingNewFeature`, `LandingPopularCategories`, `LandingTestimonial`, `LandingTopicGuides`, `LandingOrgShowcaseView`, `organization-live-showcase`, `LandingProviderSection`, `LandingProviderSectionView`, `provider-live-showcase`, `useLandingOrgShowcase`, `useLandingProvider`, `split-text`, `split-text-animation`.
- Rewritten in place: `LandingHero`, `LandingServices`, `LandingRoadmapShowcase`, `LandingOrgShowcase` (now a server component).
- Removed exports: `milestones`, `benefits`, `statusConfig`, `fallbackStats/Compliance/Features`, `HERO_SPLIT_*`, `formatNumber`, `formatPercent` (org-showcase only), `TSplitTextProps`, `hero-float` keyframes.
- GraphQL: `PopularCategories` query, fragment, RTK endpoint and tag removed; codegen changed only `operations/landing.ts`; backend `popularCategories` untouched.
- Dictionary: `landing.newFeature`, `popularCategories`, `provider`, `testimonials`, `topicGuides`, old services/organization/roadmap/hero copy removed in EN and FR; shared, FAQ, services/solutions and `learningHub` keys kept. Client slice now ships only `landing.actions/hero/learningHub/sample`.
- Kept on purpose: `getPublicTopicHubSummaries` (shared reader; now has no consumer); `org-dashboard.api` and `provider.api` (real dashboards); `hero.png` and all shared assets.
- `gsap` now has no consumer in `apps/front`; the manifest is unchanged per spec rule 7. Removing it needs separate approval.

## Verification

- Baseline: dev server on base, API offline (Suggested shows its error state): desktop 1440×1000 (page 7389 px), mobile 390×844 (page 16099 px).
- After: production build, same conditions: desktop 7136 px, mobile 11317 px.
- `npm run i18n-slice --workspace front` — pass (408 key paths, 19 namespaces)
- `npm run lint --workspace front` — pass
- `npm run check-types --workspace front` — pass (after `npm run build --workspace packages/api-contracts`; stale local `dist` caused unrelated errors)
- `npm run build --workspace front` — pass
- `npm run bundle-report --workspace front -- --check-targets --check-ceilings` — fail locally, identically on the untouched base: `/contact` over target, 22 routes over ceiling. Same-machine comparison of 43 routes: no route grows more than 0.1 KiB; home 230.9 → 230.7 KiB (target 300, ceiling 237); dashboards −1.8 KiB. CI is the authoritative gate.
- `npm run codegen --workspace front` — idempotent
- `git diff --check` — pass
- Browser: Playwright against dev and production builds. Session, catalog search and failure states via local request interception (no production data).

## Notes for review

- Home is now prerendered static. On the base it rendered on demand because `LandingTopicGuides` fetched topic hubs; removing that block (as the spec requires) made the page static. Session-dependent actions stay client-side.
- Copy claims: "Create free account" and "Core features are free for individual professionals" rest on the existing shared FAQ answer `platform-free-plan`. Step 3 avoids "automatic" credit claims. Product should confirm.
- For non-professional roles the roadmap section shows "Roadmaps for professionals" and "Learn more", both to `/solutions/professionals`, as the spec table requires.
- Header nav spacing below `xl` changed on every page (prevents French overflow at 1024); no behavior change.
- Not exercised: real sign-in (fixtures used), dashboard smoke tests and detail-page language switching (API offline; `/topics/<slug>` returns 500 without the API), the `/faq` category filter after this change (search was checked), browser zoom at 200% (covered by the 320–768 width matrix). The `web-design-guidelines` and design skills are not installed locally; accessibility was checked by hand.

## Submission

- Commit: `5327d771` feat(front): redesign landing page to v10 and remove legacy sections
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/326
- CI: pending
