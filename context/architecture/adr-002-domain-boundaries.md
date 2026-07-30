# ADR-002 — Bounded contexts and single write ownership

- Status: Proposed (awaiting the Phase 1 exit-gate review)
- Date: 2026-07-30
- Deciders: Loopskey engineering

## Context

`apps/api/src/modules` holds 14 feature modules with no recorded grouping, and
`schema.prisma` holds 54 models with no recorded owner. The Phase 1 spec
proposed nine bounded contexts and required the audit to confirm or amend them
from actual usage.

The audit measured every Prisma call site and every cross-module import. The
evidence is in `context/modular-monolith-baseline.md`.

## Decision

### The nine contexts, confirmed

The proposed grouping survived the evidence. Every module maps to exactly one
context:

| Context                    | Modules                                                                                    | Models |
| -------------------------- | ------------------------------------------------------------------------------------------ | ------ |
| `identity-access`          | `auth`, `user`                                                                             | 5      |
| `learning-catalog`         | `course`, `events`, `podcast`, `youtube`, `landing`                                        | 13     |
| `professional-development` | `professional`, `external-learning`                                                        | 16     |
| `organization-management`  | `organization`                                                                             | 9      |
| `provider-management`      | `provider`                                                                                 | 3      |
| `engagement`               | `content-interaction`                                                                      | 7      |
| `platform-administration`  | `admin`                                                                                    | 1      |
| `communications`           | `mail`                                                                                     | 0      |
| `platform-shared`          | `prisma`, `app`, `graphql` (modules), plus `src/common`, `src/graphql`, `src/architecture` | 0      |

One amendment to the proposal: it listed Infrastructure as holding "storage and
events". Neither exists yet, so `platform-shared` currently holds the Prisma
client, the composition root and shared utilities only. Storage and events join
it in Phase 7 when they are built.

`platform-shared` is also the only context that owns source outside
`src/modules`. `MODULE_OWNERSHIP` is keyed on module directories and cannot
express `src/common`, `src/graphql` or `src/architecture`, so those are mapped
separately by `SOURCE_PATH_OWNERSHIP` in the same manifest. Without that a Phase
2 path-to-context resolver would return nothing for every file in `src/common` —
including `graphql-error-formatter.ts` and `slug.util.ts` — and would either
exempt them from all boundary rules or fail outright.

`landing` was checked specifically because it owns no model and reads four
catalog tables through raw SQL. It stays inside `learning-catalog`: it is a
public read projection over catalog content and nothing else, so placing it
there makes its only dependency an internal one.

### Every model has exactly one write owner

Ownership is recorded in `apps/api/src/architecture/domain-ownership.ts` and
pinned by `domain-ownership.spec.ts`, which fails if Prisma and the manifest
disagree. Shared ownership is not permitted. Where evidence was ambiguous the
tie was broken by **which context's invariant the model protects**, not by which
module happens to touch it today.

### The five decisions the spec required

**1. `EventRegistration` → `learning-catalog`.**
Written by both `events` and `content-interaction`. The deciding evidence is
that `content-interaction` increments `Event.attendees` in the same operation
that creates the registration — so registration and event capacity are one
invariant, and it belongs to the Event aggregate. Engagement calls into the
catalog instead (EXC-001, removed in Phase 3, which is the events pilot).

**2. Wishlist, enrollment, reviews and carts → `engagement`.**
`WishlistItem`, `ContentEnrollment`, `ContentReview`, `Cart` and `CartItem` are
already written by `content-interaction` alone. No contest; the only coupling is
the derived rating that Engagement writes back onto catalog rows (EXC-002).

**3. Provider publishing vs catalog content.**
The catalog owns all content models and their lifecycle. Provider Management
owns provider identity, settings, promotion requests and provider-facing read
models. The evidence made this easy: `provider` writes only
`EventPromotionRequest` and `ProviderSettings` and writes no catalog row at all.
`course` and `events` already run their own `ensureProviderOrAdmin` checks. The
boundary is therefore almost real already — the residue is read-only
(EXC-013/EXC-014).

**4. Payments and roadmaps.**

- `Payment` → `engagement`. It has **no writer anywhere in the application**;
  it is seeded and read once, by the professional payments overview. It is
  placed with `Cart` and `CartItem` because those three form the commerce
  cluster and a real checkout would write all of them together.
- `Roadmap`, `RoadmapPhase`, `RoadmapStep` → `learning-catalog`. Also
  writer-free. Structurally these mirror `Course`/`CurriculumSection`/
  `CurriculumLesson` — authored content with an ordered hierarchy — and
  `context/project-overview.md` already files roadmaps under the learning
  catalog.
- `RoadmapEnrollment` → `engagement`, by symmetry with `ContentEnrollment`. A
  user-to-content relationship is Engagement's shape, not the catalog's.

These four assignments cost nothing to change: with zero writers, moving them
later is an edit to the manifest. They are called out for the exit-gate review
precisely because they are the least evidence-backed decisions here.

**5. Legitimate cross-domain read projections.**
Accepted as legitimate in intent, but still recorded as exceptions so Phase 2
can distinguish them from new coupling:

- `landing.popularCategories` — raw SQL aggregate over `Course`, `Event`,
  `Podcast`, `YouTubeChannel`. Intra-context, so not an exception at all.
- Admin user directory, organization list/detail, audit log — administration
  legitimately observes the whole platform (EXC-017/018/019).
- Provider analytics and attendee export (EXC-013/014).
- Professional dashboard overview cards (EXC-010/011/012).

"Legitimate" describes the _need_, not the _mechanism_. Each of these should
become a published read model rather than a direct table read, which is why each
still carries a removal phase.

### Dependency direction

```text
platform-administration ──► identity-access
            │       └─────► organization-management
            │
identity-access ─────┐
organization-mgmt ───┼────► communications
                     │
all contexts ────────┴────► platform-shared
```

Rules:

- `platform-shared` is a sink: it depends on nothing.
- `communications` depends only on `platform-shared`. It must not import from
  any domain — the current `mail` → `auth` import (EXC-023) is the one cycle in
  the codebase and Phase 2 removes it.
- No context may depend on `platform-administration`. Administration observes;
  it is never observed.
- `learning-catalog`, `professional-development`, `provider-management` and
  `engagement` depend on nothing but `platform-shared`.

The declared graph is acyclic and a test asserts it. The _implemented_ graph is
not yet — that gap is the exception register.

## Consequences

**Positive**

- 54 models have a named owner, so "who is allowed to write this?" has an answer.
- 43 violations have IDs, owners and removal phases, so progress is countable.
- Phase 2 can enforce mechanically; the manifest is framework-free by design.

**Negative**

- Fourteen models currently have a writer that is not their owner. Until the
  relevant phase lands, the manifest describes intent rather than reality, and
  only the register makes that gap visible.
- Three of the assignments describe aggregates the owning context has no code to
  create: `Organization` is only ever created by `admin`, and `ProviderProfile`
  and `ProfessionalProfile` only by `auth`/`user`. Phase 5 has to build the
  owner's own creation path, not merely move a call.
- `User` is the crowded model: four contexts read it and three write it. Phase 5
  is therefore the highest-risk phase, and it touches authentication.
- Assigning `Payment` to `engagement` will look wrong the moment a payment
  provider integration appears; expect a dedicated commerce context then.

**Neutral**

- Ten models have no write path anywhere, so their assignment rests on structure
  rather than usage. `CurriculumSection`, `CurriculumLesson` and
  `EventScheduleItem` are the starkest: they are read through includes but never
  authored.

## Related

- [ADR-001 — Modular monolith](adr-001-modular-monolith.md)
- [ADR-003 — Cross-domain communication](adr-003-cross-domain-communication.md)
- `apps/api/src/architecture/domain-ownership.ts`
- `apps/api/src/architecture/boundary-exceptions.ts`
