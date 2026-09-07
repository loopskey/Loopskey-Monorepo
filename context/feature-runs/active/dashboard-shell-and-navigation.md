# Dashboard shell and responsive navigation

- Scope: `front`
- Branch: `feature/dashboard-shell-and-navigation`
- Base: `0251d86`
- Status: `Ready`

Phase 2 of
`context/features/course-visual-restoration/02-dashboard-shell-and-navigation.md`.

## Acceptance

- [x] All five roles keep a permanent vertical sidebar at every viewport.
- [x] Below `md` the rail is 72px and icon-only; from `md` it is 256px with
      icon and label.
- [x] No bottom navigation, More button or More sheet renders in the dashboard.
- [x] Hover and the active route both show the Course concave white joint.
- [x] Each tab is a single semantic `Link` inside an `li`, with no nested
      interactive element.
- [x] Labels stay in the accessible name below `md`, with a translated tooltip.
- [x] `aria-current="page"` marks the active route.
- [x] Focus inside the blue rail is visible via `--ring-on-primary`.
- [x] The nav scrolls on a short viewport and no tab is unreachable.
- [x] Direct URLs keep the correct active state, including a parent-mapped tab.
- [x] Main and every content surface stay pure white.

## Verification

- `npm run lint --workspace front` — pass
- `npm run check-types --workspace front` — pass
- `npm run build --workspace front` — pass

Browser verification against the running stack (Postgres, API and the frontend
dev server), measured from the live DOM on the Professional dashboard at
`?tab=certificates`, at 375, 767, 768 and 1440:

| metric | 375 | 767 | 768 | 1440 |
| --- | ---: | ---: | ---: | ---: |
| rail width | 72 | 72 | 256 | 256 |
| active item height | 56 | 56 | 60 | 60 |
| arc opacity | 1 | 1 | 1 | 1 |
| label visible | no | no | yes | yes |
| tabs rendered | 10 | 10 | 10 | 10 |
| bottom navigation | 0 | 0 | 0 | 0 |

At every width: `aria-current="page"` on the active tab, the accessible name
("Certificates") is present even where the label is visually hidden, the nav
container is `overflow-y: auto`, the rail is fully visible inside the viewport,
`main` scrolls independently, `main` is pure white, and there is no horizontal
overflow. No item contains a nested interactive element.

The concave joint resolves to the Course geometry: `28px 28px 0 8px` of the
canvas colour below `md` and `35px 35px 0 10px` from `md`, with
`pointer-events: none` so it cannot steal a neighbouring tab's click.

Defect found and fixed during browser verification: the shell was `h-screen`
while the global sticky header is `h-20`, so the page itself scrolled and the
rail's role summary fell below the fold. The shell is now
`h-[calc(100dvh-5rem)]` and the rail is `h-full`, which restores the
independent content scroll the phase requires.

This branch also strips the comments phase 1 left in `globals.css`. They
violated the "Write no comments" rule in `context/coding-standards.md` and had
already merged. Only comments were removed: every OKLCH token value is
byte-identical, and the file was reformatted with Prettier afterwards.

Scope decisions:

- `DashboardBottomNav.tsx` was deleted only after `rg` proved zero consumers,
  and `DashboardBottomNavSkeleton` went with it.
- `Logo` gained a `variant` prop rather than a second component: the rail needs
  the light mark (`Loopskey.svg`) against blue, and the header keeps the dark
  one. Two real consumers, one component.
- The global header and footer are untouched, as the phase requires. The
  floating support widget overlaps the rail's role summary slightly; it is a
  pre-existing global element and out of scope here.
- Tab counts match the config exactly and nothing is filtered out of the rail:
  Professional 10, Provider 8, Organization 7, Association 7, Admin 6.
- Verified on the Professional role; the rail is one shared component and the
  other four roles differ only by their config list.
- No RTL work: the product ships EN and FR, both LTR.

## Submission

- Commit:
- PR:
- CI:
