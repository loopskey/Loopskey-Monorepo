# Feature: Complete and Verify Contact Us Email Delivery

> Target path: `context/features/support/contact-us-email-delivery.md`

## Status

Draft

## Objective

Ensure the existing Contact Us form has a complete, secure, observable server-side delivery path and sends accepted inquiries to `loopskey.dev@gmail.com`. Reuse the existing backend when it is complete, repair only missing parts when it is partial, or implement the smallest approved backend flow when no backend exists.

## User Value

As a website visitor, I want my Contact Us submission to be securely delivered and confirmed so that I know LoopsKey has received my inquiry and I have a safe recovery path when delivery fails.

## Dependencies

- Phase 1 audit must be complete and approved.
- Phase 1 must classify the backend as Outcome A, B, or C.
- Phase 2 must preserve or publish the final Contact Us page and approved form copy.
- The production recipient must be approved as `loopskey.dev@gmail.com`.
- Attachment support depends on an existing approved secure upload mechanism.

## Scope

- Reuse the current Contact Us backend when complete.
- Repair only missing backend parts when partial.
- Implement a new backend flow only when no equivalent exists.
- Set the server-side recipient configuration to `loopskey.dev@gmail.com`.
- Validate Contact Us inputs on the server.
- Preserve or align the frontend contract with the approved backend operation.
- Add spam and abuse protection using existing project standards.
- Add safe provider failure handling.
- Add retry/idempotency or duplicate-protection behavior.
- Add structured logging and metrics with personal-data redaction.
- Add frontend, backend, integration, and end-to-end tests.
- Verify delivery in a non-production environment.
- Support optional attachment only when the project already has an approved secure upload flow.

## Non-goals

- Do not add a duplicate endpoint, mutation, queue, or email adapter.
- Do not replace the project’s email provider without an architecture decision.
- Do not send email directly from browser code.
- Do not hard-code Gmail credentials.
- Do not store provider secrets in source control.
- Do not persist contact messages unless required by existing product or operational rules.
- Do not create a new file-upload system solely for this form.
- Do not redesign unrelated support workflows.
- Do not modify unrelated footer static pages.

## Functional Requirements

1. The Contact Us form supports:
   - Full name
   - Email address
   - Organization, optional
   - Inquiry type
   - Message
   - Attachment, optional only when approved
2. Inquiry types must support:
   - General question
   - Technical support
   - Account support
   - CPD/PDU tracking question
   - Association partnership
   - Organization solution
   - Content provider inquiry
   - Privacy request
   - Accessibility feedback
   - Security concern
   - Other
3. Client-side validation may improve UX, but server-side validation is mandatory.
4. Required text fields must be trimmed and validated against reasonable length limits.
5. Email must be normalized and validated.
6. Empty optional organization values must be treated as absent.
7. The backend must resolve the recipient from server-side configuration.
8. Production recipient configuration must resolve to `loopskey.dev@gmail.com`.
9. Provider credentials must never be exposed to the client.
10. A valid submission must request delivery through the approved email provider/adapter.
11. The user receives a success state only after the backend accepts the request for delivery.
12. The form resets only after confirmed success.
13. Invalid input must not create persistence or request delivery.
14. Provider failure must return a stable, safe error without infrastructure details.
15. The frontend must preserve entered form values where safe after a recoverable failure.
16. A failure message must provide a retry path and display the direct contact email.
17. Repeated submit clicks and network retries must not create uncontrolled duplicate emails.
18. Public rate limiting or equivalent anti-abuse controls must be applied.
19. Message bodies, attachment contents, provider secrets, and unnecessary personal data must not be written to standard logs.
20. Authorized operators must be able to identify failed delivery attempts by correlation/reference ID.
21. If Outcome A applies:
   - reuse the existing operation and provider
   - update recipient configuration
   - add missing tests only
22. If Outcome B applies:
   - preserve the current public contract when safe
   - implement only missing validation, anti-abuse, delivery, error, observability, or test behavior
23. If Outcome C applies:
   - add a dedicated contact-inquiry use case
   - expose it through the project-standard API transport
   - use the approved email provider port
   - avoid persistence by default
24. Attachments must be rejected or hidden when no approved secure upload path exists.
25. A production rollout must not proceed until a non-production end-to-end delivery test passes.

## Roles and Permissions

| Actor | Allowed | Forbidden |
| --- | --- | --- |
| Public visitor | Submit a contact inquiry and receive a safe status | Access delivery configuration, provider details, logs, or other submissions |
| Authenticated user | Submit through the same public workflow | Bypass validation or rate limiting |
| Operations/support staff | Inspect authorized delivery status using correlation/reference IDs | View secrets or unnecessary full payloads |
| Backend service | Validate and deliver through the approved provider | Expose provider credentials or send from the browser |

- Authentication: public by default.
- Ownership rule: the API does not expose stored submissions to the public.
- Sensitive data:
  - name
  - email
  - organization
  - inquiry message
  - attachment
  - IP address
  - provider metadata
- Redaction:
  - never log message body
  - never log attachment content
  - never log provider secrets
  - minimize personal data in operational events

## UX Requirements

- Entry point: the existing public Contact Us page.
- Loading:
  - Disable or protect repeated submission while the request is pending.
  - Show a clear submission-in-progress state.
- Empty:
  - Required fields display clear validation.
  - Optional organization remains optional.
- Error:
  - Field errors are associated with fields.
  - Provider or server errors use a safe general message.
  - Entered values remain available when safe.
  - Provide retry and `loopskey.dev@gmail.com` as a direct fallback.
- Success:
  - Show a clear confirmation after backend acceptance.
  - Reset the form only after success.
- Accessibility:
  - All fields have visible labels.
  - Validation messages are programmatically associated.
  - Success and error states are announced to assistive technology.
  - Focus moves to the relevant status or invalid field where appropriate.
- Keyboard:
  - Complete form submission is possible without a pointer device.
- Internationalization:
  - Reuse existing English keys and current fallback behavior.
  - Do not invent translations.

## Contract Changes

- Transport:
  - Reuse the existing operation when available.
  - If missing, use the project-standard GraphQL mutation.
  - Use REST only when the existing architecture already defines it as the approved contact transport.
- Proposed GraphQL operation when no equivalent exists:
  - `submitContactInquiry(input: SubmitContactInquiryInput!): SubmitContactInquiryPayload!`
- Input:
  - `fullName`: required, trimmed, bounded length.
  - `email`: required, normalized, valid format.
  - `organization`: optional, trimmed, empty becomes absent.
  - `inquiryType`: required enum.
  - `message`: required, trimmed, bounded length.
  - `attachment`: optional only through the approved upload contract.
  - `idempotencyKey`: follow the existing public-form convention.
- Output:
  - `success`
  - stable message/error code
  - optional non-sensitive reference ID
- Stable codes when equivalent codes do not exist:
  - `CONTACT_INQUIRY_SUBMITTED`
  - `CONTACT_INQUIRY_INVALID`
  - `CONTACT_INQUIRY_RATE_LIMITED`
  - `CONTACT_INQUIRY_DELIVERY_FAILED`
- Compatibility:
  - Preserve the current operation when safe.
  - Existing clients must remain valid.
  - Do not hand-edit generated GraphQL schema or generated clients.
  - Shared error/message codes must be added through the approved package and codegen flow.

## Data and Domain Rules

- Owning module:
  - reuse the existing contact/support module
  - otherwise use the approved public-support domain
- Models/relations:
  - none by default
  - preserve an existing contact-inquiry model when one already exists
- Persistence:
  - not required by default
  - add no new persistence without a documented operational or product need
- Validation:
  - mandatory on the server
- Attachment:
  - reuse approved upload, storage, malware scanning, MIME, size, retention, and authorization controls
  - reject or omit attachment support when no approved mechanism exists
- Retention:
  - follow existing support and privacy rules
  - avoid duplicate payload retention
- Concurrency:
  - duplicate submit actions and retries must not produce uncontrolled duplicate delivery
- Migration/backfill:
  - none unless an existing persisted recipient/configuration model requires a named migration
- Delete behavior:
  - follow existing support/privacy retention rules for any persisted submission or attachment

## Dependencies and Side Effects

- Cross-domain interaction:
  - Contact use case calls a public email/notification port.
  - UI and domain code must not import provider-specific implementation directly.
- External provider:
  - reuse the existing approved provider.
  - the Gmail address is a recipient only.
- Configuration:
  - use a server-side variable such as `CONTACT_RECIPIENT_EMAIL`.
  - production value: `loopskey.dev@gmail.com`.
- Delivery failure:
  - map provider errors to stable safe codes.
  - log only non-sensitive metadata and correlation ID.
- Retry/idempotency:
  - follow the existing convention.
  - when none exists, implement narrowly scoped deduplication for repeated submissions.
- Outbox:
  - reuse an existing outbox workflow when already used.
  - do not add a new outbox solely for this feature without architectural need.
- Email content:
  - include inquiry type and submitted fields required by support.
  - safely encode or escape user-provided content.
  - do not trust attachment names or MIME metadata from the client.

## Observability and Operations

- Structured events:
  - contact inquiry accepted
  - validation rejected
  - rate limit triggered
  - delivery requested
  - delivery succeeded
  - delivery failed
- Metadata:
  - correlation/request ID
  - non-sensitive inquiry type
  - provider outcome/code
  - timestamp
- Redaction:
  - no full message
  - no attachment content
  - no provider credentials
  - no unnecessary personal payload
- Metrics:
  - submission attempts
  - validation failures
  - rate-limit rejections
  - successful deliveries
  - provider failures
- Operational recovery:
  - authorized operators can inspect failed attempts by reference ID
  - use existing provider retry or support process
- Rollout:
  - configure and test in non-production
  - run sandbox/mock provider tests
  - run one approved end-to-end test
  - verify production recipient configuration before release

## Acceptance Criteria

- [ ] Phase 1 Outcome A, B, or C is recorded and followed.
- [ ] No duplicate contact endpoint, mutation, queue, or provider adapter is added.
- [ ] The production recipient resolves to `loopskey.dev@gmail.com`.
- [ ] Recipient and provider credentials are server-side only.
- [ ] All required form fields are supported.
- [ ] All approved inquiry types are supported.
- [ ] Optional organization is handled correctly.
- [ ] Optional attachment is enabled only through an approved secure flow.
- [ ] Valid input is accepted and submitted through the approved provider path.
- [ ] Invalid input returns safe field-level validation and does not request delivery.
- [ ] Provider failure returns a stable safe error.
- [ ] The user receives a retry path and direct contact email after recoverable failure.
- [ ] Form values are preserved where safe after failure.
- [ ] The form resets only after confirmed success.
- [ ] Repeated clicks or retries do not create uncontrolled duplicate emails.
- [ ] Rate limiting or approved anti-abuse protection is active.
- [ ] Logs do not contain message body, attachment content, or secrets.
- [ ] Failed delivery attempts are traceable through correlation/reference ID.
- [ ] Frontend and backend contracts remain compatible.
- [ ] Non-production end-to-end delivery verification passes.
- [ ] Relevant automated tests and scope verification gates pass.

## Verification

### Focused checks

- Frontend component tests for loading, success, validation, and provider-failure states.
- Accessibility test for labels, errors, status announcement, and keyboard operation.
- Backend unit tests for:
  - trimming
  - email normalization
  - required fields
  - inquiry-type validation
  - length limits
  - recipient resolution
  - rate limiting
  - redaction
  - provider error mapping
  - duplicate protection
- Integration test using provider mock or sandbox.
- Test proving recipient resolves to `loopskey.dev@gmail.com`.
- Test proving provider credentials are absent from client output.
- Test proving no email is requested for invalid input.
- Test proving repeated idempotent submission does not duplicate delivery.
- Attachment security tests when attachment support is enabled.
- End-to-end browser test for successful submission.
- End-to-end browser test for recoverable failure.
- Non-production delivery verification with authorized recipient confirmation.

### Scope gate

- Front:
  - lint
  - type-check
  - tests
  - build
  - browser checks
  - codegen when affected
- API:
  - lint
  - type-check
  - tests
  - build
  - E2E/provider integration checks
  - GraphQL/codegen checks
  - Prisma checks only when affected
- Full/shared:
  - root lint
  - root type-check
  - root tests
  - root build
  - all relevant front and API checks

## Risks and Decisions

- Risk: existing backend is duplicated.
  - Mitigation: Phase 1 classification is mandatory and controls implementation.
- Risk: frontend reports success without real provider acceptance.
  - Mitigation: success only after server-side acceptance and provider-path verification.
- Risk: public endpoint is abused.
  - Mitigation: validation, rate limiting, anti-abuse controls, and duplicate protection.
- Risk: personal data leaks through logs.
  - Mitigation: metadata-only logging and explicit redaction tests.
- Risk: unsafe attachment upload.
  - Mitigation: enable attachment only through the existing approved upload workflow.
- Risk: provider configuration is exposed or hard-coded.
  - Mitigation: environment/secret configuration and client-bundle checks.
- Risk: legitimate retries produce multiple emails.
  - Mitigation: idempotency/deduplication tests.
- Decision needed:
  - Final attachment support based on Phase 1.
  - Existing provider and retry strategy.
  - Whether persistence is required by current operational rules.
  - Exact rate-limit policy according to the project standard.

## References

- Content source: `LoopsKey_Static_Footer_Pages_Content.docx`
- Parent feature: `context/features/website/footer-static-pages-contact-integration.md`
- Dependency: `context/features/website/footer-contact-audit.md`
- Dependency: `context/features/website/footer-static-pages.md`
- Existing Contact Us frontend/backend/provider: from Phase 1 audit
