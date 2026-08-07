# Footer Pages UX Redesign

- Scope: `front`
- Branch: `feature/footer-pages-ux-redesign`
- Base: `2742468ae317ca9047f19e3407995bd8af0dc615`
- Status: `Submitted`

## Acceptance

- [x] Every footer-linked page is visually redesigned and no longer reads as one flat wall of text.
- [x] Long static content is grouped into sections with clear headings and visual separation.
- [x] Long pages provide in-page navigation (on-this-page) to their sections.
- [x] Layout and design language are consistent across all fourteen footer pages.
- [x] Pages are responsive across mobile, tablet, and desktop.
- [x] Accessibility: single `h1` per page, correct heading order, landmarks, keyboard reachable in-page nav, visible focus states.
- [x] Existing content, routes, links, forms, and behavior are unchanged.
- [x] Reusable design-system components are used; new chrome strings are localized in `en`/`fr`.
- [x] Tests cover section grouping, in-page nav, heading levels, and embedded mode.
- [x] Frontend lint, types, tests, and build pass.

## Verification

- `npm run lint --workspace front` — pass
- `npm run check-types --workspace front` — pass
- `npm run test --workspace front` — pass (14 files, 137 tests)
- `npm run build --workspace front` — pass; all 14 footer routes still prerender as static (`○`)
- Built app on `127.0.0.1:3013` — all 14 footer routes return 200
- Rendered HTML scan — exactly one `<h1>` per footer route (was two on the five embedded pages);
  in-page nav present on the 9 standalone pages and absent on the 5 that already own a hero/sidebar
- Browser checks — desktop 1440px, mobile 390px, dark theme, and keyboard focus ring on the
  in-page nav

## Notes

- The specification references `apps/web/app/**/page.tsx`; the actual location is
  `apps/front/src/app/(pages)/**`. No routing or URL changed.
- `StaticInfoPage` rendered a flat list of 19-54 blocks in one card, emitted one `<ul>` per bullet,
  and emitted an `<h1>` even when embedded. It now parses the content into an intro plus one section
  per heading, merges consecutive bullets into a single list, and demotes headings when embedded.
- Section anchors carry a `section-` prefix: several pages number their headings ("1. What Cookies
  Are") and a CSS identifier may not start with a digit. Embedded anchors are additionally
  namespaced by page key so they cannot clash with the host page's own ids.
- On the five pages that embed this content (`/about`, `/contact`, `/faq`, `/terms`,
  `/privacy-policy`) the embedded block moved from above the hero to just before the closing CTA.
  It previously pushed a wall of text ahead of each page's own hero.
- `getStaticInfoMetadata` moved to `static-info-page.utils.ts` so the server `page.tsx` files can
  import it now that the component is a client component (it uses `useI18n` for its chrome strings).
  All 14 routes still prerender as static.

## Submission

- Commit: `5637418`
- PR: https://github.com/loopskey/Loopskey-Monorepo/pull/16 (base `develop`)
- CI: pass on `bdb7481` - https://github.com/loopskey/Loopskey-Monorepo/actions/runs/31194435323
