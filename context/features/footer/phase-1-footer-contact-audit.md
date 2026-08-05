# Feature: Audit Footer, Routes, and Contact Delivery

> Target path: `context/features/website/footer-contact-audit.md`

## Status

Draft

## Objective

Audit the current LoopsKey footer, static-page routes, and Contaact Us implementation before any structural or backend change is made. The outcome must clearly identify the existing frontend and backend components, determine whether the Contact Us backend is complete, partial, or missing, and confirm the canonical routes and final implementation scope for the next phases.

## User Value

As a product and development team, we want a verified view of the current footer and Contact Us architecture so that later changes reuse working components, avoid duplicate routes or APIs, and reduce implementation risk.

## Scope

- Locate the shared footer implementation and all responsive variants.
- Identify where `Explorer`, `Resources`, and the current LoopsKey/email information box are rendered.
- Identify all existing footer links and destination routes.
- Locate any existing static pages equivalent to the required Solutions, Support, Legal, and Company pages.
- Locate the existing Contact Us page and form.
- Locate the existing Contact Us API operation, server action, or backend endpoint.
- Locate the backend owning module, email provider, recipient configuration, spam protection, persistence behavior, and tests.
- Classify the Contact Us backend as:
  - Outcome A: complete
  - Outcome B: incomplete
  - Outcome C: missing
- Confirm whether attachment upload is already supported through an approved secure mechanism.
- Confirm the final application scope for later phases:
  - `front`
  - `api`
  - `full`
- Produce an implementation record that Phase 2 and Phase 3 can rely on.

## Non-goals

- Do not change the visible footer.
- Do not create new static pages.
- Do not change footer routes.
- Do not change the Contact Us recipient.
- Do not add or modify an API operation.
- Do not change the email provider.
- Do not publish legal content.
- Do not refactor unrelated modules.

## Functional Requirements

1. The implementation team can identify the exact frontend component or layout that owns the shared footer.
2. The audit records every current footer group, item, and supporting information block.
3. The audit identifies all current static-page routes related to:
   - Professionals
   - Associations
   - Organizations
   - Content providers
   - Help
   - Contact
   - Accessibility
   - Security
   - Terms
   - Privacy
   - Cookies
   - Company information
4. Existing routes must be marked as:
   - reusable as-is
   - reusable with content update
   - conflicting or duplicate
   - missing
5. The Contact Us frontend route, component, field schema, validation behavior, and submission action must be documented.
6. The backend flow must be traced from form submission to final email delivery.
7. The current delivery recipient must be identified without exposing secrets.
8. The email integration must be classified as complete, partial, or missing based on evidence.
9. The audit must identify existing:
   - rate limiting
   - CAPTCHA or anti-abuse controls
   - validation
   - idempotency or duplicate protection
   - provider error handling
   - logs and metrics
   - automated tests
10. The audit must identify whether contact messages or attachments are persisted and which retention rules apply.
11. The audit must confirm whether the project already has a secure upload flow that can be reused for optional Contact Us attachments.
12. The audit result must recommend one canonical route for each required footer destination.
13. The audit result must state whether Phase 3 should reuse, repair, or implement the Contact Us backend.

## Roles and Permissions

| Actor          | Allowed                                                                  | Forbidden                                                         |
| -------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Developer      | Inspect frontend, API, configuration references, tests, and architecture | Expose secrets or production credentials in the audit record      |
| Reviewer       | Review audit evidence and approve implementation direction               | Approve assumptions that are not supported by repository evidence |
| Public visitor | No new capability in this phase                                          | No behavior changes should be visible                             |

- Authentication: no user-facing authentication change.
- Sensitive data:
  - Do not record SMTP passwords, API keys, private tokens, full message bodies, or personal contact submissions.
  - Configuration should be referenced by environment-variable name only.

## UX Requirements

- No intended visible UX change.
- The existing footer and Contact Us experience must remain unchanged during this phase.
- Manual browser inspection must cover desktop, tablet, and mobile footer variants.
- Existing keyboard and responsive behavior must be documented where relevant.

## Contract Changes

- Transport: none.
- Input: none.
- Output: internal audit record only.
- Compatibility: all current frontend and backend behavior must remain unchanged.

## Data and Domain Rules

- Owning modules: identify during audit.
- Models/relations affected: none.
- Migration/backfill: none.
- Delete/retention behavior: document existing behavior only.

## Dependencies and Side Effects

- Cross-domain interaction: identify existing interaction only.
- External provider: identify existing provider and adapter only.
- Outbox event: identify whether one exists.
- Retry/idempotency: document existing behavior.
- Side effects: none expected.

## Observability and Operations

The audit must record whether the current Contact Us flow has:

- structured logs
- correlation/request IDs
- provider success/failure signals
- rate-limit metrics
- operational retry or recovery path
- redaction of personal data
- deployment configuration for recipient email

No new logs or metrics are required in this phase unless needed to safely verify the existing behavior in a non-production environment.

## Acceptance Criteria

- [ ] The shared footer owner component and all responsive variants are identified.
- [ ] The current `Explorer`, `Resources`, and LoopsKey/email information-box implementations are identified.
- [ ] All required current and proposed footer routes are mapped.
- [ ] Every route is classified as reusable, updateable, conflicting, or missing.
- [ ] The existing Contact Us frontend route, component, fields, validation, and submit action are documented.
- [ ] The backend path from submission to email delivery is documented.
- [ ] The email provider and recipient configuration mechanism are identified without exposing secrets.
- [ ] Existing rate limiting, anti-abuse controls, validation, idempotency, logging, and tests are documented.
- [ ] Attachment support is classified as approved, incomplete, or unavailable.
- [ ] The backend is classified as Outcome A, Outcome B, or Outcome C.
- [ ] Canonical routes for all required footer destinations are approved.
- [ ] Final scope for Phase 2 and Phase 3 is stated.
- [ ] No visible production behavior changes as a result of this phase.
- [ ] Relevant repository checks pass.

## Verification

### Focused checks

- Repository search for the footer component and all footer labels.
- Repository search for existing static-page routes.
- Repository search for Contact Us form components and submit handlers.
- Trace the API/backend flow to the email provider.
- Inspect configuration keys without exposing secret values.
- Inspect existing tests for the contact flow.
- Manual browser inspection of desktop, tablet, and mobile footer variants.
- Non-production test submission only when required to prove the current flow.

### Scope gate

- Front: lint, type-check, tests, build when files are changed.
- API: lint, type-check, tests, build when audit instrumentation or tests are changed.
- Full/shared: root lint, type-check, tests, and build when shared files are changed.

## Risks and Decisions

- Risk: a working Contact Us backend is overlooked and duplicated later.
  - Mitigation: mandatory end-to-end code trace and Outcome A/B/C classification.
- Risk: existing equivalent pages are duplicated under new routes.
  - Mitigation: route inventory and canonical-route approval.
- Risk: audit documentation exposes credentials or personal data.
  - Mitigation: reference environment-variable and module names only.
- Risk: frontend appears complete while email delivery is broken.
  - Mitigation: trace the complete submission path and use a non-production verification when needed.
- Decision needed:
  - Final canonical route map.
  - Outcome A, B, or C for Contact Us.
  - Whether attachments are supported in Phase 3.
  - Final scope of later phases.

## References

- Content source: `LoopsKey_Static_Footer_Pages_Content.docx`
- Parent feature: `context/features/website/footer-static-pages-contact-integration.md`
- Existing footer implementation: to be identified
- Existing Contact Us frontend: to be identified
- Existing Contact Us backend/provider: to be identified
