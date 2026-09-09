# Verification and rollout

- Scope: `front`
- Branch: `feature/verification-and-rollout`
- Base: `870d27c`
- Status: `Submitted`

Phase 7 of `context/features/course-visual-restoration/07-verification-and-rollout.md`.

## Acceptance

- [x] Layer 1 forbidden-pattern audit is zero on every rule.
- [x] The contrast script re-runs and every pair meets WCAG 2.2.
- [x] Front lint, check-types, build, test and bundle report pass; the
      repository-wide gate passes.
- [x] Chart, calendar, map and animation libraries stay out of the shared shell
      and the tab dynamic imports survive.
- [x] Layer 2 browser verification completes within its 20-check budget with no
      regression.
- [x] Bottom navigation renders on no dashboard viewport.
- [x] Accessibility review passes on the layer 2 pages.
- [x] Grayscale and colour-vision simulation are recorded once for the palette.
- [x] The temporary showcase route is removed.
- [x] Legacy decorative code with zero consumers is removed.
- [x] Backend, GraphQL contract and routes are unchanged.

## Verification

- `npm run lint --workspace front` — pass
- `npm run check-types --workspace front` — pass
- `npm run build --workspace front` — pass
- `npm run test --workspace front` — pass (5 files, 53 tests)
- `npm run bundle-report --workspace front` — pass
- `npm run lint` — pass
- `npm run check-types` — pass
- `npm run build` — pass

### Layer 1 — forbidden patterns

Counted over `apps/front/src`.

| pattern | now |
| --- | ---: |
| `glass-panel` | 0 |
| `glass-card-enter` | 0 |
| `backdrop-blur` | 0 |
| `bg-background/45\|60\|85` | 0 |
| `rounded-[2rem]` and every `rounded-*-[Nrem]` | 0 |
| `shadow-2xl` | 0 |
| `radial-gradient` | 0 |
| `blur-3xl` | 0 |
| `dark:` | 0 |
| `.dark` / `data-theme="dark"` / `prefers-color-scheme` | 0 |
| raw Tailwind colour classes | 0 |
| `--brand-teal` consumers | 0 |
| raw hex in `.ts`/`.tsx` | 14 |

The colour-class sweep was widened to the greys, which the original pattern list
omitted. It found one survivor: `border-neutral-300` on the `Switch` primitive,
now `border-input`.

The 14 hex values are the single sanctioned fallback source — eight in
`utils/constant.ts` (`CHART_COLORS`) and six in `hooks/useChartPalette.ts` —
mirroring the `:root` chart tokens for when a computed style is unavailable.
Phase 3 established that as the one allowed copy. The plan's opening count of 13
was measured over TSX only and never covered these two `.ts` files. Removing the
showcase route took 20 further hex values with it.

### Layer 1 — contrast

The phase 1 script checked the reference hex palette. This phase replaced it with
one that parses the shipped `:root` tokens out of `globals.css`, converts OKLCH
back to sRGB, composites alpha over the canvas and checks the pairs the product
actually renders — 41 pairs, up from 26.

Reading the real tokens found two failures the reference-palette script could not
see, because both involve a token painted on a surface the reference list never
paired it with:

- `muted-foreground` on `muted` was **4.30:1**. Secondary text sits on the muted
  surface in row hover, table headers, skeletons and empty insets, so this is
  ordinary body text below the 4.5 threshold. `--muted-foreground` moved from
  `oklch(0.551 …)` to `oklch(0.535 …)`: 4.60:1 there, and the canvas case
  improves from 4.83:1 to 5.17:1.
- `destructive-soft-foreground` on `destructive-soft` was **4.37:1**. Lightening
  the chip was not an option: `--destructive` clears white by only 4.83:1, so
  even an 8% tint stays under 4.6 while making the chip nearly invisible. The
  text token darkened instead, to `oklch(0.56 …)`, for 4.70:1. This follows the
  `--brand-orange` / `--brand-orange-text` split the rules already establish for
  a colour that has to serve as both a surface and as text.

Result: **41 checks, all pass**. `success-soft` and `warning-soft` pass at
4.53:1 and 4.54:1 and are recorded as thin.

`--info` from the reference palette is not implemented and has no consumer. Its
reference value ships as `--chart-7`, which passes at 5.93:1.

### Layer 1 — colour vision

Machado severity-1.0 simulation of the shipped chart tokens, worst pair by CIE76:

| mode | categorical (8) | semantic (5) |
| --- | ---: | ---: |
| normal | 25.1 | 31.9 |
| protanopia | 4.0 | 11.6 |
| deuteranopia | 1.7 | 4.3 |
| tritanopia | 7.8 | 22.4 |
| grayscale | 0.5 | 0.0 |

Eight brand-constrained hues on white cannot stay separable under dichromacy, and
they do not. That is why the rules require colour never to be the only carrier,
so this phase verified the redundancy rather than repainting the palette. Every
chart identifies its data by text: each series carries an axis label, a legend or
both. One did not — `org-reports-pie-chart` drew slices with percentage labels
but no names, leaving colour and the tooltip as the only way to tell departments
apart — and it gained a legend.

### Layer 1 — bundle

The shared shell is **445.8 KB across 6 chunks**, and none of them contains
recharts, FullCalendar, Leaflet, GSAP or any WebGL signature. Recharts is spread
over 29 lazy chunks, FullCalendar over 1, Leaflet over 2, GSAP over 2. The 70
`dynamic()` call sites and 19 `ssr: false` loaders are intact.

First-load JS is unchanged by the dependency removals, and the build output shows
why: no chunk contains `WebGLRenderer`, `BufferGeometry`, `gl_FragColor` or the
galaxy's own uniform names. Nothing imported `galaxy.tsx` or `floating-lines.tsx`,
so tree-shaking had already excluded `three` and `ogl` from the client bundle.
The gain is install size, dependency surface and 1,019 lines of dead code, not
transferred bytes.

Worst first-load route is 1495.7 KB (`/dashboard/professional/onboarding`),
median 1221.8 KB over 34 prerendered routes.

### Layer 2 — browser, 20 checks

Measured from the live DOM against the running stack. Every row: 0 blur, 0
translucent surface, pure white canvas, no horizontal overflow, exactly one
`h1`, no heading skip, 0 unlabelled fields, 0 unnamed controls, and no bottom
navigation on any dashboard viewport.

| check | viewport | notes |
| --- | --- | --- |
| Professional, Provider, Organization, Admin, Association overviews | 375 and 1440 | 10 checks, rail 72px then 256px |
| list, form, chart, settings, dialog archetypes | 1440 | 5 checks |
| sidebar | 767 and 768 | icon-only then labelled |
| landing, auth | 375 | clean session |
| French long text | 1440 | no overflow |

Two rows needed explanation rather than a fix:

- At 768 the audit counts 20 elements over a 16px radius. All 20 are the
  sidebar arc items at 30px, inside `aside` and outside `main`. That geometry is
  the Course sidebar being restored, not a content surface, so it is expected.
  They do not appear at 375 or 767 only because the 72px rail makes each item
  narrower than the 200px the audit filters on.
- The landing page reports 43 gradients. None is a decorative surface: they are
  white-to-transparent legibility scrims over content thumbnails, two carousel
  edge masks and a 1px accent hairline. The rules exempt content imagery from
  the white rule. The three that were decorative — `from-primary/20 to-accent/20`
  on the testimonial avatar tiles — are now flat `bg-primary/10`.

### Layer 2 — accessibility

- Focus on the blue rail: every focusable, including the logo, renders a
  `lab(100 0 0)` ring at 4px over a `#1F1F8E` 2px offset — `--ring-on-primary`
  as specified.
- Dialog: opens with focus trapped inside, carries an accessible name, is opaque
  white at 12px radius with no blur, closes on Escape, and returns focus to the
  trigger.
- Reduced motion: 0 elements animate or transition beyond 100ms under
  `prefers-reduced-motion: reduce`.
- `aria-current="page"` is present on exactly one navigation item on every
  dashboard page.

## Notes

Four defects were found by measurement and fixed in this phase.

**Reduced motion was declared but not delivered.** The `prefers-reduced-motion`
block covered `.sidebar-item` only, so 265 elements still animated on the landing
page alone. It now neutralises animation, transition and scroll behaviour
globally, keeping the 0.01ms duration that lets Radix's animation-end handlers
still fire. The GSAP path already checked the query itself and was untouched.

**Eleven switches had no accessible name.** Radix renders `<button role="switch">`
with no label of its own, so a screen reader announced "switch, on" with no
subject on the Admin, Organization, Professional and Provider settings panels.
Each now carries `aria-label` built from the translation key already rendered
beside it, so no new i18n strings were introduced. The Association switches
already did this and were the model.

**Dialogs did not return focus on close.** 14 of the 17 dialogs are controlled
and have no `DialogTrigger`, so Radix had no element to hand focus back to and it
fell to `body`. `DialogContent` now tracks the last element focused outside the
dialog and restores it in `onCloseAutoFocus`, which fixes all of them centrally.
Two earlier attempts are worth recording because they looked correct and were
not: a layout effect runs after Radix has already pulled focus inside, and a
first-render read latches `body` at page load, since the wrapper renders on every
parent render whether or not the dialog is open.

**The auth pages skipped a heading level.** `AuthFeaturePanel` went from `h1`
straight to `h3` for its feature cards; they are now `h2`.

Rollout cleanup:

- The temporary showcase route is deleted. Nothing outside it referenced
  `NEXT_PUBLIC_ENABLE_DESIGN_SHOWCASE`, and `/dev/showcase` is gone from the
  build's route table.
- `galaxy.tsx`, `useGalaxyBackground.ts`, `galaxy.constant.ts`,
  `floating-lines.tsx` and the galaxy types are deleted after `rg` proved zero
  consumers — 1,019 lines. `ogl`, `three` and `@gsap/react` left `package.json`
  with them. `gsap` itself stays; `SplitText` still uses it.

Intentional differences from Course, and why:

- `GlassCard` keeps its name across 166 imports. The rules state plainly that the
  name is never a failure; only the glass appearance is. Renaming belongs in its
  own PR.
- `radius="xl"` on `Button` stays as a prop that resolves to the 8px contract,
  rather than editing 463 call sites.
- The categorical chart palette is not CVD-separable, as recorded above. The
  redundancy requirement is met instead.
- `--info` is not implemented; nothing consumes it.
- The landing image scrims and the carousel edge masks stay, as gradients over
  content imagery rather than interface surfaces.

Backend, GraphQL contract and routes are unchanged: the diff touches
`apps/front` and `package-lock.json` only. No Prisma model, resolver, schema or
API route is in it, and the only route removed is the dev-only showcase this
phase was required to delete.

Still open, outside this phase: `.tmp/` and `.playwright-mcp/` remain untracked
local tool artifacts. A `chore/ignore-local-tool-artifacts` branch that
gitignores them exists locally and has never been pushed.

## Submission

- Commit: `ffdb422`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/80
- CI: `Lint, types, tests, build` — pass (run 34317207501)
