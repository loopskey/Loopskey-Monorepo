# Feature: Replace Footer and Publish Static Information Pages

> Target path: `context/features/website/footer-static-pages.md`

## Status

Draft

## Objective

Replace the existing footer navigation and legacy LoopsKey/email information box with a four-column footer for Solutions, Support, Legal, and Company. Create or update all linked public pages using the supplied LoopsKey static-page content, while preserving unrelated footer behavior and using `loopskey.dev@gmail.com` for all affected visible email addresses and `mailto:` links.

## User Value

As a website visitor, I want a clear footer with complete product, support, legal, and company information so that I can quickly find the right LoopsKey information from any public page.

## Dependencies

- Phase 1 must be completed and approved.
- Canonical routes must be confirmed.
- Existing equivalent pages must be identified before new routes are added.
- Contact Us backend behavior is outside this phase except for preserving the existing submit contract.
- Legal pages require legal approval and final dates before production publication.

## Scope

- Remove the existing `Explorer` footer group.
- Remove the existing `Resources` footer group.
- Remove the existing footer information box containing LoopsKey branding/contact email.
- Add exactly four footer columns:
  - Solutions
  - Support
  - Legal
  - Company
- Add the required links in the approved order.
- Create missing static pages or update existing canonical pages.
- Populate every page from `LoopsKey_Static_Footer_Pages_Content.docx`.
- Replace every affected visible occurrence of `contact@loopskey.com` with `loopskey.dev@gmail.com`.
- Replace every affected `mailto:` target with `mailto:loopskey.dev@gmail.com`.
- Preserve the current Contact Us form submit behavior.
- Preserve unrelated footer bottom-bar, copyright, disclaimer, social-link, analytics, and responsive behavior.
- Add route, content, responsive, and accessibility tests.

## Non-goals

- Do not implement or replace the Contact Us backend.
- Do not add a new email provider.
- Do not create a CMS.
- Do not rewrite, shorten, summarize, or paraphrase the supplied page content.
- Do not invent French or other translations.
- Do not redesign the website header or product dashboard.
- Do not refactor unrelated layout or routing modules.
- Do not change unrelated social links, copyright text, or analytics behavior.

## Footer Information Architecture

| Column | Footer item | Approved route from Phase 1 | Content source section |
| --- | --- | --- | --- |
| Solutions | For Professionals | Phase 1 canonical route | `1.1 For Professionals` |
| Solutions | For Associations | Phase 1 canonical route | `1.2 For Associations` |
| Solutions | For Organizations | Phase 1 canonical route | `1.3 For Organizations` |
| Solutions | For Content Providers | Phase 1 canonical route | `1.4 For Content Providers` |
| Support | Help Center | Phase 1 canonical route | `2.1 Help Center` |
| Support | Contact Us | Phase 1 canonical route | `2.2 Contact Us` |
| Support | Accessibility | Phase 1 canonical route | `2.3 Accessibility` |
| Support | Security & Data Protection | Phase 1 canonical route | `2.4 Security & Data Protection` |
| Legal | Terms of Use | Phase 1 canonical route | `3.1 Terms of Use` |
| Legal | Privacy Policy | Phase 1 canonical route | `Privacy Policy` |
| Legal | Cookie Statement | Phase 1 canonical route | `3.3 Cookie Statement` |
| Company | About LoopsKey | Phase 1 canonical route | `4.1 About LoopsKey` |
| Company | Association Partners | Phase 1 canonical route | `4.2 Association Partners` |
| Company | Content Providers | Phase 1 canonical route | `4.3 Content Providers` |

Fallback routes when no canonical equivalent exists:

- `/solutions/professionals`
- `/solutions/associations`
- `/solutions/organizations`
- `/solutions/content-providers`
- `/support/help-center`
- `/contact-us`
- `/support/accessibility`
- `/support/security-data-protection`
- `/legal/terms-of-use`
- `/legal/privacy-policy`
- `/legal/cookie-statement`
- `/company/about-loopskey`
- `/company/association-partners`
- `/company/content-providers`

## Functional Requirements

1. The shared footer renders exactly four navigation columns:
   - Solutions
   - Support
   - Legal
   - Company
2. The Solutions column contains:
   - For Professionals
   - For Associations
   - For Organizations
   - For Content Providers
3. The Support column contains:
   - Help Center
   - Contact Us
   - Accessibility
   - Security & Data Protection
4. The Legal column contains:
   - Terms of Use
   - Privacy Policy
   - Cookie Statement
5. The Company column contains:
   - About LoopsKey
   - Association Partners
   - Content Providers
6. The current `Explorer` and `Resources` groups are no longer rendered.
7. The current LoopsKey/email information box is no longer rendered.
8. Every footer item uses the canonical route approved in Phase 1.
9. Existing equivalent pages are updated instead of duplicated.
10. Every destination page displays the corresponding source-document content.
11. The supplied content’s headings, paragraphs, lists, CTA labels, warnings, and terminology must be preserved.
12. Every affected visible contact email uses `loopskey.dev@gmail.com`.
13. Every affected clickable email link uses `mailto:loopskey.dev@gmail.com`.
14. `contact@loopskey.com` must not be rendered by the affected footer or static pages.
15. The Contact Us page preserves its existing submission contract until Phase 3.
16. Legal pages must not be published to production with `[Insert Date]` placeholders.
17. Direct navigation and browser refresh must work for every route.
18. Existing sitemap, metadata, route registry, or static-generation mechanisms must be updated where applicable.
19. A broken or missing static-page content source must fail during build/test rather than render an empty page.

## Roles and Permissions

| Actor | Allowed | Forbidden |
| --- | --- | --- |
| Public visitor | Read every footer-linked page and use the existing Contact Us form | Access unpublished internal content or configuration |
| Authenticated user | Access the same public pages | Receive privileged static-page access |
| Content/legal reviewer | Review implementation copy before release | Modify runtime behavior through the public page |

- Authentication: all footer-linked pages are public.
- Sensitive data: no secrets or internal provider information may appear in page content or client bundles.

## UX Requirements

- Entry point: shared site footer on every page that currently renders the footer.
- Footer order:
  1. Solutions
  2. Support
  3. Legal
  4. Company
- Desktop:
  - Four aligned navigation columns.
  - Consistent typography and spacing with the design system.
- Tablet/mobile:
  - Follow the existing stacking or accordion pattern.
  - No horizontal overflow.
  - Do not hide any required link.
- Keyboard:
  - All links reachable in a logical order.
  - Visible focus state.
  - Mobile accordion controls, when present, expose correct ARIA state.
- Semantics:
  - Use `<footer>`, navigation landmarks, headings, lists, and links appropriately.
- Loading:
  - Static copy should use the existing page-rendering approach.
  - Do not add unnecessary remote-loading behavior.
- Empty:
  - Pages must not render as empty due to unavailable CMS content.
- Error:
  - Invalid routes use the existing 404 behavior.
- Accessibility:
  - Preserve readable typography, contrast, responsive behavior, and focus visibility.
  - Static content headings must follow a logical hierarchy.
- Internationalization:
  - Implement the supplied English content.
  - Reuse existing localization infrastructure where applicable.
  - Do not create machine-translated content.
  - Missing translations must follow the existing fallback policy.

## Contract Changes

- Transport: none for static pages.
- Contact Us transport: preserve the existing operation without backend changes.
- Input/output: unchanged.
- Compatibility:
  - Existing Contact Us clients remain valid.
  - Existing canonical URLs remain valid.
  - Redirects may be added only when approved in Phase 1.
  - Generated routing or client files must be updated through the project’s standard generation process.

## Data and Domain Rules

- Owning module: frontend website/static-content area.
- Models/relations affected: none.
- Migration/backfill: none.
- Content storage:
  - Use the project’s existing static-content pattern.
  - Do not introduce a database or CMS.
- Legal content:
  - Production publication requires approved text and final “Last updated” dates.

## Dependencies and Side Effects

- Cross-domain interaction: shared layout, routing, SEO metadata, sitemap, and localization only.
- External provider: none.
- Outbox event: none.
- Retry/idempotency: not applicable.
- Side effects:
  - Navigation labels and destination pages change.
  - Existing unrelated footer analytics events must remain compatible or be updated consistently.

## Observability and Operations

- Existing page-error and route-error monitoring should continue to cover the new routes.
- Broken route or build failures must be visible through the current CI/deployment pipeline.
- No personal data should be logged by static pages.
- Contact Us observability remains unchanged until Phase 3.
- Release checks must include:
  - no deprecated footer groups
  - no deprecated email in affected modules
  - no unresolved legal date placeholder
  - no broken footer route

## Acceptance Criteria

- [ ] The footer renders exactly Solutions, Support, Legal, and Company as navigation groups.
- [ ] The Solutions links and order match the approved specification.
- [ ] The Support links and order match the approved specification.
- [ ] The Legal links and order match the approved specification.
- [ ] The Company links and order match the approved specification.
- [ ] `Explorer` is not rendered.
- [ ] `Resources` is not rendered.
- [ ] The legacy LoopsKey/email information box is not rendered.
- [ ] Every link opens the correct canonical page.
- [ ] Every route supports direct navigation and browser refresh.
- [ ] Every page contains the corresponding supplied source content.
- [ ] Source headings, body text, lists, CTA labels, and disclaimers are preserved.
- [ ] No page renders as empty or placeholder-only.
- [ ] Every affected visible email is `loopskey.dev@gmail.com`.
- [ ] Every affected email link is `mailto:loopskey.dev@gmail.com`.
- [ ] `contact@loopskey.com` is absent from the affected rendered pages and source modules.
- [ ] Existing Contact Us submission behavior remains compatible.
- [ ] Existing footer bottom-bar, social links, analytics, and unrelated content remain compatible.
- [ ] Footer layout has no horizontal overflow at supported viewport sizes.
- [ ] Footer links and responsive controls are keyboard accessible.
- [ ] Legal pages are not released with unresolved `[Insert Date]` values.
- [ ] Relevant automated tests and scope verification gates pass.

## Verification

### Focused checks

- Footer component test for exact heading labels.
- Footer component test for exact link labels and order.
- Negative test for `Explorer`, `Resources`, legacy info box, and deprecated email.
- Route test for all fourteen destinations.
- Content-presence tests using stable headings from each source section.
- `mailto:` target tests.
- Responsive browser tests at supported breakpoints.
- Keyboard and automated accessibility checks.
- Direct-route refresh test.
- Sitemap/metadata test when applicable.
- Repository search in affected modules for `contact@loopskey.com`.
- Release check for `[Insert Date]`.

### Scope gate

- Front:
  - lint
  - type-check
  - tests
  - build
  - browser checks
  - codegen when affected
- API:
  - no change expected
- Full/shared:
  - root checks only if shared packages or route contracts are affected

## Risks and Decisions

- Risk: existing pages are duplicated.
  - Mitigation: use the Phase 1 canonical-route map.
- Risk: source content is shortened or reworded during implementation.
  - Mitigation: source-document sections are mapped explicitly and verified by content tests.
- Risk: legal drafts are published prematurely.
  - Mitigation: legal approval and final dates are release gates.
- Risk: responsive footer loses required links.
  - Mitigation: mobile/tablet browser tests and exact-link assertions.
- Risk: Contact Us breaks because route or form code changes.
  - Mitigation: preserve the existing submit contract and test the current workflow.
- Decision needed:
  - Legal approval and final dates.
  - Final canonical routes from Phase 1.
  - Existing localization fallback behavior.

## References

- Content source: `LoopsKey_Static_Footer_Pages_Content.docx`
- Parent feature: `context/features/website/footer-static-pages-contact-integration.md`
- Dependency: `context/features/website/footer-contact-audit.md`
- Existing footer implementation: from Phase 1 audit
- Existing route registry: from Phase 1 audit
