# Footer, Static Routes, and Contact Delivery Audit

## Status and scope

- Audit date: 2026-08-05
- Repository base: `fe06e53f88cdb6a9c19b124bf5fc30300bba8085` (`origin/develop`)
- Outcome: **C — Contact Us backend is missing**
- Phase 2 scope: **front**
- Phase 3 scope: **full** (frontend and API)
- Source copy: `context/features/footer/LoopsKey_Static.docx` in the requesting workspace

This phase changes documentation only. It introduces no visible behavior, API contract, provider configuration, or data changes.

## Shared footer inventory

The global owner is `apps/front/src/components/layouts/Footer.tsx`. It is mounted once by `apps/front/src/app/layout.tsx`, after the page content, so it appears on every route using the root layout. `apps/front/src/components/layouts/parts/footer-column.tsx` renders each navigation heading and list.

There are no separate desktop, tablet, or mobile footer components and no accordion behavior. One responsive CSS grid supplies all variants:

- Mobile: a single stacked column.
- Medium viewport: two columns (`md:grid-cols-2`).
- Large viewport: a 12-column grid (`lg:grid-cols-12`) with widths 4/2/3/3.

Current content is:

| Area | Items or content | Destination/source |
| --- | --- | --- |
| Brand | LoopsKey logo, brand description, LinkedIn, X, Facebook, YouTube | `Logo`, `footer.brandDescription`, and `socialLinks` |
| Explore | Courses, Services, Contact, About | `/content`, `/services`, `/contact`, `/about` |
| Resources | an untranslated/invalid `footer.` key, Be Professional, Be Professional, Be Organization | `/faq`, `/auth/provider`, `/auth/professional`, `/auth/organization` |
| Contact information box | email card and LoopsKey/location card | `companyEmail` (`Loopskey.dev@gmail.com`) and `footer.builtFor` |
| Bottom bar | dynamic copyright, all-rights-reserved text, Privacy Policy, Terms of Service | `/privacy-policy`, `/terms` |

The first Resources label is a defect: the link points to `/faq`, but its translation lookup is `t("footer.")`. The provider link is also labelled “Be Professional” in the English translation. These observations are recorded for Phase 2; this audit does not correct them.

Semantic and keyboard behavior is structurally sound: the owner uses `<footer>`, columns use headings plus `<ul>/<li>`, and destinations are native links. Focus styling is inherited from existing link/button styles. All required future links must remain visible because there is no collapsed mobile state.

## Route audit and canonical decisions

`apps/front/src/app/(pages)` currently contains public pages for `/about`, `/contact`, `/content`, `/faq`, `/privacy-policy`, `/services`, and `/terms` (plus content-detail routes). The `siteLinks` registry also declares `/cookies`, but no page implements that route.

The supplied DOCX has distinct copy for every required destination. Generic `/services` is not an equivalent substitute for four independently linkable Solution pages, and authentication routes are not public information-page equivalents.

| Required destination | Existing route/evidence | Classification | Approved canonical route |
| --- | --- | --- | --- |
| For Professionals | generic `/services`; `/auth/professional` is sign-in | missing | `/solutions/professionals` |
| For Associations | no public equivalent | missing | `/solutions/associations` |
| For Organizations | generic `/services`; `/auth/organization` is sign-in | missing | `/solutions/organizations` |
| For Content Providers | generic `/services`; `/auth/provider` is sign-in | missing | `/solutions/content-providers` |
| Help Center | `/faq` | reusable with content update | `/faq` |
| Contact Us | `/contact` | reusable with content and form update | `/contact` |
| Accessibility | no equivalent | missing | `/support/accessibility` |
| Security & Data Protection | no equivalent | missing | `/support/security-data-protection` |
| Terms of Use | `/terms` | reusable with content update | `/terms` |
| Privacy Policy | `/privacy-policy` | reusable with content update | `/privacy-policy` |
| Cookie Statement | `/cookies` is registered but unimplemented | missing (reserved route) | `/cookies` |
| About LoopsKey | `/about` | reusable with content update | `/about` |
| Association Partners | no equivalent | missing | `/company/association-partners` |
| Company Content Providers | no equivalent | missing | `/company/content-providers` |

No conflicting or duplicate implemented pages were found. Phase 2 should preserve the five established public URLs above and create the nine missing destinations. `/services` may remain as an unrelated overview page; it should not be repurposed as four canonical destinations.

## Contact Us frontend

- Route/page: `apps/front/src/app/(pages)/contact/page.tsx` at `/contact`.
- Form controller: `apps/front/src/hooks/useContact.ts` using React Hook Form, Zod, and `mode: "onChange"`.
- Current fields: `fullName`, `workEmail`, `company`, and `message`. All four are required.
- Validation: trimmed full name and company require at least 2 characters; email must be syntactically valid; trimmed message requires at least 10 characters. No maximum lengths are defined.
- Missing fields from supplied content: inquiry type and optional attachment. The supplied content says organization and attachment are optional, while the current `company` field is mandatory.
- Submission: `submitContactForm` does not call a server action, REST endpoint, GraphQL operation, or RTK Query mutation. The only intended call is commented out. Valid input immediately triggers a success notification and resets the form; the error branch cannot be reached through current code.
- Loading: `isSubmitting` comes from React Hook Form and disables the button while the local handler runs.
- Contact detail display: email, phone, and office values come from i18n. The English email is `loopskey.dev@gmail.com`.
- Tests: no Contact page, `useContactPage`, form-submission, or footer tests were found.

## Backend and delivery trace

There is no Contact Us resolver, controller, mutation, endpoint, service, DTO/input, persistence model, queue event, or provider template. Accordingly, there is no form-to-delivery path and no current delivery recipient configuration for Contact Us.

The API does contain a reusable mail subsystem:

1. `MailService.sendEmail` appends a `mail.delivery.requested` event to the transactional outbox.
2. The outbox processor invokes `MailService.deliver`.
3. `deliver` sends through Resend using server-only `RESEND_API_KEY` and `EMAIL_FROM` configuration.
4. Provider failures are logged without message content and mapped to the safe `EmailSendFailed` response.

That subsystem currently serves other domains; it is not evidence of a Contact backend. `SUPPORT_EMAIL` exists in `.env.example`, but no Contact flow consumes it and its example value must not be treated as the production recipient. Phase 3 should add a server-only `CONTACT_RECIPIENT_EMAIL` and set the deployed value to `loopskey.dev@gmail.com`.

### Control matrix

| Control | Current Contact flow | Evidence/consequence |
| --- | --- | --- |
| Server validation | absent | no server operation exists |
| Rate limiting | absent | no Contact endpoint or Contact-specific guard |
| CAPTCHA/anti-abuse | absent | no UI or server integration found |
| Idempotency/deduplication | absent | no submission identifier or delivery operation |
| Provider error handling | absent for Contact | generic mail delivery maps Resend failure, but Contact never calls it |
| Structured logs/correlation ID | absent for Contact | generic mail events carry request correlation IDs and redact provider errors |
| Metrics | absent | no Contact counters or delivery signals found |
| Persistence/retention | none | messages and attachments are not submitted or stored |
| Automated tests | absent | no Contact frontend/API/provider tests found |

Classification is therefore **Outcome C — missing**, not partial: the apparent successful UI submission is a client-only stub and cannot deliver a message.

## Attachment assessment

The project has authenticated upload flows for professional avatars, PDU evidence, and certificate evidence. Certificate/PDU files use size/count allowlists, MIME-plus-extension checks, randomized storage keys, owner checks, authenticated role guards, database metadata, and local object storage. Deletion is owner-bound.

These flows are **unavailable for Contact Us reuse as currently designed**:

- they require an authenticated professional/admin and an owned domain record;
- storage namespaces and persistence belong to professional evidence, not public support;
- validation trusts the client-reported MIME type plus extension and no malware-scanning/quarantine control was found;
- no public-upload authorization, Contact retention policy, or cleanup workflow exists.

Phase 3 must omit attachments unless a separately approved public upload design provides malware scanning, content verification, authorization, size/count limits, retention/deletion, and safe linkage to an inquiry. Existing evidence endpoints must not be exposed or repurposed.

## Phase decisions

### Phase 2 — front

- Replace footer navigation with the four specified groups in the supplied order.
- Remove Explore, Resources, and the contact/location information box while retaining brand/social and bottom-bar behavior.
- Update the five reusable pages and create nine missing canonical routes.
- Use the DOCX verbatim, replacing affected `contact@loopskey.com` display and `mailto:` values with `loopskey.dev@gmail.com`.
- Preserve `/contact` submission behavior until Phase 3, despite its known stub state.
- Do not publish legal pages while `[Insert Date]` remains unresolved; legal approval/date is an external release gate.
- Implement English content only and use the existing locale fallback rather than inventing French translations.

### Phase 3 — full

- Implement one public Contact operation; do not duplicate the existing mail adapter or outbox.
- Add server validation, stable result codes, rate limiting/anti-abuse, narrow duplicate protection, redacted structured events, correlation/reference IDs, and tests.
- Resolve the recipient only from server configuration (`CONTACT_RECIPIENT_EMAIL`).
- Treat organization as optional and add the approved inquiry-type enum.
- Omit attachment support under current evidence; revisit only after a secure public-upload mechanism is approved.
- Report success only after the server accepts the delivery request, preserve values after failure, and reset only after confirmed success.

## Verification evidence

- Searched the frontend route tree, shared layout, footer owner/column, link registry, English/French translations, Contact page/hook, RTK and GraphQL documents, and tests.
- Searched API modules, GraphQL schema, controllers, services, mail/outbox infrastructure, environment-key names, persistence schema, upload/storage flows, and tests.
- Extracted the supplied DOCX directly and confirmed all 14 destination sections and the requested contact fields.
- No secrets, credentials, personal submissions, or message bodies are recorded here.
