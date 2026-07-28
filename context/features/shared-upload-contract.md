# Shared Upload Contract

> Source: `context/monorepo-audit.md` — **MONO-03**, findings **D-3** and **D-4**.
> Prerequisite: **MONO-01**.

## Objective

Multipart upload is the one production surface the GraphQL contract does not
cover, and it is therefore the one surface where frontend and backend rules can
diverge without any generated artifact noticing.

The same five-entry MIME allowlist, the same 5-file cap and the same 20 MB limit
are written out **four times** — twice in each application. REST route paths are
hardcoded on both sides.

## Status

Not Started

## Goals

- One definition of the accepted MIME types, extension map, file-count cap and
  byte cap.
- One definition of the REST paths for PDU evidence and certificate evidence.
- Derive each side's specific shape (backend pairing map, frontend `accept`
  attribute) from the shared allowlist rather than restating it.
- Keep the backend independently authoritative — the package supplies values, not
  enforcement.

## Evidence

Four files carrying the same rules:

```text
apps/api/src/modules/professional/enums/pdu-file.constant.ts:3-19
apps/api/src/modules/professional/enums/certificate-file.constant.ts:3-23
apps/front/src/utils/pdu.constant.ts:118-131
apps/front/src/utils/certificate.constant.ts:3-14
```

The allowlist, identical in all four:

```text
application/pdf, image/jpeg, image/png, application/msword,
application/vnd.openxmlformats-officedocument.wordprocessingml.document
```

Route strings duplicated across the boundary:

```text
apps/api/.../professional-certificate-file.controller.ts:19  @Controller("professional/certificates")
apps/api/.../professional-pdu-file.controller.ts:19          @Controller("professional/pdu-activities")
apps/front/src/utils/certificate.constant.ts:22,27
apps/front/src/utils/pdu.constant.ts:176,179
```

And the origin is derived by regex:

```ts
// apps/front/src/utils/pdu.constant.ts:173
export const PDU_API_ORIGIN = graphqlUrl.replace(/\/graphql\/?$/, "");
```

This silently assumes REST and GraphQL are always co-hosted and that the GraphQL
URL always ends in `/graphql`.

Values agree today. Nothing enforces that they continue to. If the backend widens
the allowlist, the frontend's Zod schema keeps rejecting the new type; if the
frontend widens it, users hit a server 400 after a completed upload.

## Scope

### In scope

- `packages/api-contracts/src/upload/` with `mime.ts`, `limits.ts`, `routes.ts`.
- Rewiring the two backend constant files, two controllers and two services.
- Rewiring the two frontend constant files,
  `apps/front/src/lib/validations/certificate.schema.ts`, and the evidence
  upload/download hooks.

### Out of scope

- Changing any limit's value.
- Moving upload from REST to GraphQL.
- The avatar upload path, unless it shares the same constants (check
  `apps/api/src/modules/professional/enums/profile-avatar.constant.ts` — it has a
  different 5 MB cap, so it is probably separate).

## Design Notes

PDU and certificate limits are identical today but are **conceptually separate
policies**. Share the defaults and let each domain name its own constants from
them:

```ts
export const DOCUMENT_UPLOAD_DEFAULTS = {
  maxFiles: 5,
  maxFileSizeBytes: 20 * 1024 * 1024,
  mimeTypes: { /* mime -> extensions */ },
} as const;
```

so that a future decision to allow larger certificates is a one-line override
rather than a breaking change to PDU.

Derive rather than restate:

- Backend needs `Record<mime, ext[]>` for MIME/extension pairing — that is the
  canonical shape; keep it in the package.
- Frontend needs a flat `readonly string[]` of MIME types and an `accept`
  attribute string. Both are computed from the canonical map.

For routes, export path builders rather than strings, and take the origin as an
argument so the regex assumption can be replaced with explicit configuration:

```ts
export const certificateFilesPath = (certificateId: string) => ...
```

Consider whether the REST origin should become its own environment variable
rather than a regex over the GraphQL URL. If so, note it — but do not change
deployment configuration inside this feature without agreement.

## Verification

- `npm run check-types`, `npm run lint`, `npm run build` all pass.
- API Jest 157 passing — the certificate and PDU file-service suites already
  cover type/size/count validation and must stay green.
- Frontend Vitest 112 passing — `certificate.schema.test.ts` covers file type,
  size, empty and limit rules.
- **Live**: upload a valid PDF to a certificate and download it back. Confirm a
  `.txt` is rejected, a 21 MB file is rejected, and a sixth file is rejected.
- **Negative test:** add a MIME type to the shared allowlist and confirm both the
  backend validator and the frontend Zod schema accept it without any other
  change. Revert.

## Risks

- Sharing one symbol between two domains that only coincidentally agree. Mitigated
  by the defaults-plus-override shape above.
- The frontend derives a `readonly string[]` while the backend uses a
  `Record<string, string[]>`. Getting the derivation wrong silently narrows or
  widens what the browser accepts — cover it with a unit test asserting the two
  shapes describe the same set.

## Acceptance Criteria

- Exactly one definition of the MIME allowlist, file cap and byte cap exists in
  the repository.
- Both REST route strings exist in exactly one place.
- No limit value changed.
- The negative test above demonstrably works.
- All gates pass and the live upload/download round trip succeeds.

## History

<!-- Keep this updated. Earliest to latest -->
