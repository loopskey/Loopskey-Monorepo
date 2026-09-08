# Shared dashboard components

- Scope: `front`
- Branch: `feature/shared-dashboard-components`
- Base: `6301248`
- Status: `Submitted`

Phase 3 of
`context/features/course-visual-restoration/03-shared-dashboard-components.md`.

## Acceptance

- [x] `GlassCard` keeps its name, props and every import while its appearance
      becomes a plain white card.
- [x] `Card`, `Button`, `Dialog` and the form primitives follow the phase 1
      radius and surface contract.
- [x] `AnimatedTabs`, `ContentPagination` and `ConfirmDialog` lose the glass,
      conic gradient and floating-panel treatment.
- [x] No new parallel wrapper component was created.
- [x] Chart colour has a single source: `CHART_COLORS` mirrors the `:root`
      tokens and is only a fallback.
- [x] Status colour comes from a semantic key, never from an array index.
- [x] No raw hex remains in application TSX.
- [x] Decorative CSS is removed only where consumers reached zero.
- [x] Props, events, refs, loading behaviour and accessibility are unchanged.

## Verification

- `npm run lint --workspace front` — pass
- `npm run check-types --workspace front` — pass
- `npm run build --workspace front` — pass
- `npm run bundle-report --workspace front` — pass

Audit over `apps/front/src`:

| check | before | after |
| --- | ---: | ---: |
| raw hex in application TSX | 13 | 0 |
| `backdrop-blur` in `ui` and `elements` | 4 | 0 |
| `rounded-3xl` / `rounded-[2rem]` in `ui` and `elements` | 3 | 0 |
| `shadow-2xl` in `ui` and `elements` | 2 | 0 |
| independent chart colour sources | 2 | 1 |

Browser verification against the running stack at 1440, one page per archetype
across four roles — Professional certificates (table), Professional CPD/PDU
progress (chart), Professional settings (form), Association reports (semantic
chart) and Organization overview:

- Translucent surfaces inside the dashboard: **0** on every page.
- `main` background: pure white on every page.
- Horizontal overflow: none on any page.
- The three remaining `backdrop-blur` nodes are the global header overlay, the
  mobile menu panel and the footer. All sit outside `main` and belong to
  phase 6.
- Three elements inside `main` still exceed a 20px radius. All are
  feature-local overrides (`rounded-[1.75rem]`, `rounded-[2rem]`, and an input
  with a local radius class), which phases 4 to 6 clean up role by role. The
  primitives themselves are on contract.

## Notes

The semantic chart migration was the substantial part. `CHART_SEMANTIC_SLOTS`
mapped each status to an index into the categorical palette, so re-ordering a
series changed what a colour meant. Semantics now resolve from the dedicated
`--chart-semantic-*` tokens through `useChartSemantics`, independent of the
categorical array. TypeScript located all 20 call sites across 11 files; the
`palette` prop then became dead in the charts that were purely semantic and was
removed from those components.

`radius="xl"` on `Button` had 463 call sites rendering at 24px. Rather than edit
463 files, the variant now resolves to the 8px button contract, following the
same compatibility approach as `GlassCard`. The prop is effectively a no-op for
those consumers and can be removed in a later cleanup.

Scope decisions:

- `glass-panel`, `glass-card-enter` and `btn-gradient-motion` were deleted from
  `globals.css` after `rg` proved zero consumers. `glass-dialog` still has 21
  consumers, so the class stays and was simplified centrally instead, which
  reaches all 21 dialogs without touching them. The `btn-gradient-*` variants
  likewise stay until their consumers migrate in phases 4 to 6.
- `Button` gained `max-md:min-h-11` so touch targets clear 44px on mobile.
- The phase 1 showcase route was not re-rendered: the running dev server was
  started without `NEXT_PUBLIC_ENABLE_DESIGN_SHOWCASE`, and restarting it would
  have interrupted a server in use. Five real dashboard pages across four roles
  were verified instead, which exercises the same primitives against real data.
- Pre-existing and untouched: `{value}% engagement` on the Organization
  overview is an unresolved i18n placeholder, unrelated to this phase.

## Submission

- Commit: `0710776`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/75
- CI: `Lint, types, tests, build` — pass (run 34191269071)
