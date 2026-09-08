# Dashboard tabs

- Scope: `front`
- Branch: `feature/dashboard-tabs`
- Base: `f3a9cc4`
- Status: `Ready`

Phase 5 of `context/features/course-visual-restoration/05-dashboard-tabs.md`.

## Acceptance

- [x] Every dashboard tab renders on the white canvas with bordered cards and
      the contract radii.
- [x] No glass, backdrop blur, translucent surface or oversized radius remains
      in any dashboard module.
- [x] Gradient button variants are gone from the dashboards.
- [x] Raw Tailwind colour classes are replaced by semantic tokens.
- [x] Chart tooltips follow the shared contract.
- [x] Data, links, refetch, mutation and empty/error behaviour are unchanged.
- [x] No horizontal overflow on any checked tab.

## Verification

- `npm run lint --workspace front` - pass
- `npm run check-types --workspace front` - pass
- `npm run build --workspace front` - pass

Text audit over `src/components/modules`:

| pattern | before | after |
| --- | ---: | ---: |
| `backdrop-blur` | 54 | 0 |
| `rounded-[2rem]` | 27 | 0 |
| `rounded-3xl` | 124 | 0 |
| `rounded-2xl` | 392 | 0 |
| `bg-background/NN` | 244 | 0 |
| `shadow-2xl` | 2 | 0 |
| `glass-border` | 267 | 0 |
| `variant="brand"` | 138 | 0 |
| `variant="glass"` | 222 | 0 |

Raw Tailwind colour classes across `apps/front/src`, excluding the dev
showcase: **0**, down from 77 at the phase 0 baseline.

Browser verification against the running stack: **22 tabs across all five
roles**, each at 1440 and again at 375 - Professional (courses, certificates,
payments, settings, wishlist), Provider (my-events, attendees, analytics,
create-event, settings), Organization (members, assignments, reports,
settings), Admin (users, org-access-requests, associations, settings) and
Association (members, requirements, reports, settings).

Every tab at both widths: zero backdrop-blur nodes, zero translucent surfaces,
zero elements over a 16px radius, a pure white `main`, and no horizontal
overflow.

## Notes

The migration was mechanical and applied uniformly: `glass-border` to the
standard border, translucent washes dropped on bordered surfaces and replaced
by a light neutral elsewhere, `rounded-3xl` and `rounded-[2rem]` to 12px,
`rounded-2xl` to 8px, and backdrop blur removed. 258 files changed.

Arbitrary radius values needed a second pass. The first sweep missed
`rounded-[1.5rem]`, `rounded-[1.8rem]` and `rounded-[2.5rem]` because the
pattern list only named the values seen in earlier phases; browser verification
caught the survivor on the Professional payments tab. All arbitrary rem radii
now resolve to 8px or 12px by size.

Raw Tailwind colours were mapped by meaning rather than by hue: emerald to the
success pair, amber and yellow to warning, red to destructive, blue to primary,
cyan, teal and violet to their categorical chart slots, and slate to the
neutral foreground. The `Badge` `cyan` and `orange` variants were fixed
centrally in the primitive rather than at their call sites.

Scope decisions:

- `variant="brand"`, `brandSoft`, `brandOutline` and `glass` were migrated to
  the contract variants at every dashboard call site. The variants and their
  gradient CSS remain defined because auth and the public pages still use them;
  phase 6 retires them.
- Three gradient text treatments remain in `not-found`, `AuthFeaturePanel` and
  `LandingHero`. They are public and auth surfaces, which phase 6 owns.
- Everything still matching the audit patterns lives outside the dashboards:
  auth routes, header, footer, landing, static templates and two shared
  elements. `src/components/modules` is clean.

## Submission

- Commit:
- PR:
- CI:
