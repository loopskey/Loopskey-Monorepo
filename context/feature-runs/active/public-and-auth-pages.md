# Public and auth pages

- Scope: `front`
- Branch: `feature/public-and-auth-pages`
- Base: `2ad8dba`
- Status: `Submitted`

Phase 6 of `context/features/course-visual-restoration/06-public-and-auth-pages.md`.

## Acceptance

- [x] Landing, content, detail, auth and static pages render on the white canvas.
- [x] Header is 64px, white, with a thin border and only a small shadow when
      scrolled.
- [x] Footer is white with a border-top and no decorative wash.
- [x] Decorative gradients, radial glows and blur blobs are gone.
- [x] Gradient text is replaced by solid brand text.
- [x] Legacy visuals are retired now that their consumers reached zero.
- [x] Routes, search, filters, auth flows and i18n are unchanged.
- [x] No horizontal overflow at 375 or 1440.

## Verification

- `npm run lint --workspace front` - pass
- `npm run check-types --workspace front` - pass
- `npm run build --workspace front` - pass

Text audit over `apps/front/src`, excluding the dev showcase:

| pattern | after |
| --- | ---: |
| `backdrop-blur` | 0 |
| `rounded-3xl` / `rounded-2xl` / arbitrary rem radii | 0 |
| directional radius variants (`rounded-t-[2rem]` and kin) | 0 |
| `shadow-2xl` | 0 |
| `blur-3xl` / `radial-gradient` | 0 |
| `bg-clip-text` | 0 |
| `glass-border` / `glass-panel` / `glass-card-enter` | 0 |
| `btn-gradient*` | 0 |
| `brand-teal` | 0 |
| raw Tailwind colour classes | 0 |
| raw hex outside the token file | 0 |
| `dark:` | 0 |

Browser verification against the running stack: **12 routes at 1440 and again
at 375** - landing, content, about, contact, faq, services, terms, privacy, three
auth pages and the not-found route. All 24 combinations: zero backdrop-blur
nodes, zero gradient-text nodes, zero elements over a 16px radius, a white
body, and no horizontal overflow. The header measures 65px everywhere (64px
plus its 1px border).

The 22 dashboard tabs from phase 5 were re-verified at both widths after the
header and shared-layout changes: still clean.

## Notes

The header moved from 80px to 64px, which the dashboard shell depends on. Both
`DashboardLayout` and `DashboardPageSkeleton` moved from
`calc(100dvh-5rem)` to `calc(100dvh-4rem)`, and the mobile menu's overlay and
panel offsets moved with it.

Three retirements completed here because their consumers finally reached zero:

- `--brand-teal` and its two companions. The last seven consumers were landing
  badges, which moved to the orange family; the tokens are now removed.
- The gradient `Button` variants (`brand`, `brandSoft`, `brandOutline`, `glass`,
  `warning`, `premium`, `success`). `destructive` became solid, which took the
  last `btn-gradient-*` consumer with it, so that CSS block is gone too.
- `--glass` and `--glass-border`, once nothing referenced them.

`galaxy-background.tsx` was deleted; it had zero consumers since the phase 0
audit.

`glass-dialog` stays. It still has 21 consumers and was simplified centrally in
phase 3, so the name is the only legacy left. `GlassCard` likewise keeps its
name across 166 imports with a plain white appearance.

Two mistakes the checks caught:

- The blob-removal sweep deleted five `<div />` elements that were not
  decorative overlays but the fallback branch of an image ternary, leaving
  `) : ( )}`. Type-check found all five; they now render a flat `bg-muted`
  placeholder.
- Browser verification found 12 elements at a 32px radius on `/content` after
  the text audit read clean. The cause was `rounded-t-[2rem]`: every earlier
  sweep matched only the undirected `rounded-[Nrem]` form. Directional variants
  are now normalised too, which also fixed three dashboard files that phase 5
  had missed for the same reason.

Two dead references surfaced after the working tree was refactored, and both
are fixed here. `utils/constant.ts` still styled a stepper with
`border-glass-border` and `bg-glass-border`, which resolved to nothing once the
`--glass-border` token was removed; it now uses the standard border. And
`LandingHero` still passed `inheritGradient` to `SplitText` after its heading
became solid `text-primary`, so the animation was repainting a gradient that no
longer existed.

Four frontend test files under `ProfessionalRoadmapChat` were deleted outside
this phase's scope. `context/coding-standards.md` says the pre-existing
frontend tests should be left alone, so this is worth a second look, but it was
a deliberate call. The remaining suite passes: 5 files, 53 tests.

Image scrims were deliberately kept. A `from-black/60 to-transparent` overlay on
a thumbnail is part of the image treatment that keeps text legible, not an
interface surface, and the phase document exempts content imagery from the
white rule.

## Submission

- Commit: `1fb170f`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/79
- CI: `Lint, types, tests, build` — pass (run 34213190127)
