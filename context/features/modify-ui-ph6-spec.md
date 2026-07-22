PHASE 6 — CERTIFICATE DOMAIN, BACKEND, DATABASE, AND FILE STORAGE

Implement or complete the backend foundation for the Professional Certificates feature.

Do not build the complete Certificates dashboard UI in this phase.

Reuse existing entities, APIs, file-storage services, CPD/PDU plan relations, authorization, and validation patterns.

## 1. Certificate Data Model

Inspect whether an equivalent Certificate or Professional Credential entity already exists.

Reuse it where possible.

The Certificate record must support:

- ID
- Authenticated Professional user ownership
- Certificate or Licence name
- Issuer
- Certification ID, optional
- Issue date
- Expiry or renewal date
- Linked CPD/PDU plan, optional
- Evidence file metadata
- Status
- Created date
- Updated date

Do not create duplicate fields when equivalent fields already exist.

## 2. Field Requirements

Unless existing product rules define otherwise:

Required:

- Certificate / Licence
- Issuer
- Issue Date
- Expiry / Renewal Date
- Evidence File

Optional:

- Certification ID
- Linked CPD Plan

Validate all fields on the backend.

## 3. Certificate Status

Implement a reusable backend status calculation.

Required statuses:

- ACTIVE
- EXPIRING_SOON
- EXPIRED

Default rules:

- `EXPIRED`: expiry date is before the current date
- `EXPIRING_SOON`: expiry date is between today and 90 days from today
- `ACTIVE`: expiry date is more than 90 days away

Use a consistent timezone and date boundary.

Keep status calculation outside UI components.

Determine whether status should be:

- Calculated dynamically
- Persisted and updated by a job
- Persisted with a recalculation strategy

Prefer a deterministic approach that cannot become stale.

## 4. CPD/PDU Plan Linking

Allow the certificate to optionally link to one of the authenticated Professional user’s CPD/PDU plans.

Requirements:

- Verify ownership of the selected plan.
- Reject plans belonging to another user.
- Allow unlinking during edit.
- Do not delete a CPD plan when a certificate is deleted.
- Define appropriate foreign-key behavior.

## 5. Evidence File Upload

Reuse the project’s existing secure file-upload service.

Validate:

- Allowed file types
- Maximum file size
- Empty file
- Malicious or invalid file metadata
- Authenticated ownership

Use the project’s supported document formats.

Suitable temporary defaults, only when the project has no rules, may include:

- PDF
- PNG
- JPG
- JPEG

Do not store file binary data directly in the database unless that is the existing architecture.

Store secure metadata such as:

- Storage key
- Original filename
- MIME type
- File size
- Uploaded timestamp

Do not expose private storage URLs.

## 6. Secure Download

Implement or complete an authenticated file-download endpoint.

Before returning a certificate file, verify:

- The user is authenticated.
- The certificate belongs to the user.
- The evidence file belongs to the certificate.
- The file is available.

Use:

- Authenticated streaming
- Short-lived signed URL
- Existing secure project file-access pattern

Do not return permanent public storage URLs.

## 7. Required APIs

Follow the project’s existing API naming conventions.

Implement or complete APIs for:

- Create certificate
- List authenticated user certificates
- Get certificate details
- Update certificate
- Delete certificate, only if required by existing product rules
- Download certificate evidence
- Get certificate summary counts
- Filter certificates
- List certificates eligible for activity filtering
- Link or unlink a certificate to a CPD/PDU plan

Support appropriate:

- Pagination
- Sorting
- Search
- Status filtering

## 8. Search and Filtering

Search relevant fields such as:

- Certificate or licence name
- Issuer
- Certification ID

Reuse the current backend search pattern.

Do not introduce an inefficient new search architecture if the project already has one.

## 9. Ownership and Authorization

A Professional user must never be able to:

- View another user’s certificates
- Edit another user’s certificates
- Download another user’s files
- Link another user’s CPD plan
- Delete another user’s certificates

Resolve ownership from the authenticated session.

Do not trust frontend-provided user IDs.

## 10. Database Migration

Add safe migrations and indexes.

Potential indexes include:

- Professional user ID
- Expiry date
- Status, if persisted
- Linked CPD plan
- Certificate name
- Issuer

Follow the project’s naming and migration conventions.

## 11. Tests

Test:

- Create certificate
- Required validation
- Optional fields
- Date validation
- Expiry before issue date rejected
- Status: active
- Status: expiring soon
- Status: expired
- 90-day boundary
- CPD plan ownership
- File validation
- Secure download
- Unauthorized access
- List filters
- Search
- Update certificate
- Evidence replacement
- File cleanup behavior
- Database migration

Run:

- Backend tests
- Integration tests
- Authorization tests
- Migration validation
- TypeScript or backend compilation
- Linting
- Production backend build

Fix only errors introduced by this phase.

## Completion Report

Provide:

1. Existing certificate functionality reused
2. Data model
3. Database migration
4. Status rules
5. APIs
6. File storage and download behavior
7. CPD plan linking
8. Authorization protections
9. Tests executed and results
10. Work remaining for the frontend

STOP after completing the Certificate backend foundation.
