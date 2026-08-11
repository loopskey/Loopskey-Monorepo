# Footer & Informational Pages Content Normalization

- Scope: `front`
- Branch: `feature/footer-content-normalization`
- Base: `4d8834d86fdd863bdfb3bba64f243326dec2c602`
- Status: `Ready`

## Acceptance

- [x] All 14 affected pages load visible copy through `src/i18n/{en,fr}.json`;
      `src/content/footer-static-pages.json` is deleted and no page-specific content file remains.
- [x] Every new string has an `en` and an `fr` value; language switching updates all of it.
- [x] The five pages with their own approved design (`/about`, `/contact`, `/faq`, `/terms`,
      `/privacy-policy`) no longer render a second embedded document; that content is merged into
      their existing sections.
- [x] "On this page" sidebars stay stuck while the main column scrolls, clear the header, stay
      inside their container, and fall back to non-sticky below `xl`.
- [x] Sidebar links scroll to unique, stable, selector-safe anchors.
- [x] New FAQ content appears only as categorized accordion items; nothing duplicated below.
- [x] FAQ accordion is keyboard operable and exposes `aria-expanded`/`aria-controls`.
- [x] Contact Us has one form and one info block; new inquiry-type/response copy merged in.
- [x] Terms, Privacy, Cookies, Accessibility, Security hold one canonical version of each clause.
- [x] No duplicate page titles, headings, intros, FAQ questions, or CTAs.
- [x] Frontend lint, types, tests, and build pass; all 14 routes still prerender.

## Verification

- `npm run lint --workspace front` — pass
- `npm run check-types --workspace front` — pass
- `npm run test --workspace front` — pass (16 files, 154 tests; was 137)
- `npm run build --workspace front` — pass; all 14 footer routes still prerender as static (`○`)
- Served the production build on `127.0.0.1:3013` and drove headless Chrome over CDP:
  - all 14 routes 200, exactly one `<h1>` each, page titles byte-identical to before
  - every sidebar anchor resolves; no duplicate element ids; no duplicate `h2`/`h3` text
  - 1440×900: sidebar `position: sticky` settles at exactly 96px against an 81px header on all
    12 sidebar routes, stays inside its grid container, anchors land at ~113px (below the header)
  - 390×844: sidebar computes to `position: static`; horizontal overflow 0 on every route
  - `app_language=fr`: `<html lang="fr">`, zero English dictionary prose left on any of the 14
    routes, zero raw translation keys rendered

## Notes

- Root cause of the broken sticky sidebar: every affected page wrapped its content in
  `<main className="overflow-hidden">`. An ancestor with `overflow: hidden` becomes the sticky
  element's scrollport, so `position: sticky` never engaged against the viewport. Fixed with
  `overflow-x-clip`, which still clips horizontally but does not create a scroll container.
- Second sticky bug on `/privacy-policy` and `/terms`: the `<aside>` carried `xl:sticky` but was
  wrapped in a transformed `RevealOnScroll` div that was the real grid item, so the sidebar could
  only stick inside a wrapper exactly its own height. Sticky now sits on the grid child, and all
  sidebars share one offset (`xl:top-24`) instead of drifting between `top-24` and `top-28`.
- Content moved from `src/content/footer-static-pages.json` into `staticPages` in both locale
  dictionaries. `buildStaticInfoOutline` now takes page content rather than a key, so the outline
  rebuilds per locale; `useStaticInfoPage` reads it through `traw` and resets the active section
  when the ids change under a language switch.
- The nine template-driven pages keep `StaticInfoPage`. The `embedded` mode is gone — it existed
  only to append a second copy of a document beneath five pages that already had their own.
- Beyond the specified scope, three pre-existing localization defects on affected pages were
  fixed because they broke the same requirement: the footer column titles and all 14 link labels
  were hard-coded English, the French Contact Us dictionary was missing all 11 inquiry types plus
  the submission/validation strings, and `fr.contactPage.info.email.value` was
  `loopskey.dev.gmail.com` (no `@`).

## Decisions

- The Contact Us content lists "Attachment, optional" under *recommended* form fields. Not added:
  the specification's Dependencies section states no external provider/object storage is
  introduced by this feature, and an upload field cannot be delivered without one. Every other
  listed field (full name, email, organization, inquiry type, message) and all eleven inquiry
  types already existed and matched exactly, so no contract change was needed. Flagged for a
  follow-up if the field is genuinely wanted.
- New Terms/Privacy copy states LoopsKey is owned by Nexel Chain Inc., a Canadian company. Where
  that directly contradicted old copy ("LoopsKey Ltd.") the new content wins, and the two
  placeholder London postal addresses were dropped in favour of the canonical email.
  **For legal review:** the Terms governing-law clause still reads "laws of England and Wales /
  courts of London". The revised content does not address governing law, so it was left as-is
  rather than rewritten — but it now sits beside a Canadian owner and should be confirmed.
- "Suggested CTA: <label>" lines were authoring notes being printed as body text. They now drive
  a real CTA button at the end of the page (`cta: { label, href }` on the page content).
- Help Center guidance became five new FAQ accordion items in existing categories
  (`account-login`, `professional-profile` → PLATFORM; `roadmap-personalization` → AI;
  `cpd-progress-section`, `learning-activities` → CPD). Three topics already had a question
  (`cert-storage`, `platform-calendar`, `platform-support`), so those answers were extended
  rather than duplicated. No new category was needed.

## Submission

- Commit:
- PR:
- CI:
