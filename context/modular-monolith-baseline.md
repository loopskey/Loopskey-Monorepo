# Modular Monolith — Architecture Baseline (Phase 1)

> Measured on 2026-07-30 against commit `c7111a5` on
> `chore/monolith-ph1-baseline-ownership`. Every figure below comes from a scan
> of the working tree, not from prior documentation. Where this report and
> `context/project-overview.md` disagree, this report is newer; where this
> report and the code disagree, the code wins.

Phase 1 changes no runtime behavior. It produces four things: a measured
baseline (this file), three ADRs, a typed ownership manifest, and a register of
every violation that exists today.

## Contents

1. [Headline findings](#headline-findings)
2. [Scope of the scan](#scope-of-the-scan)
3. [Module dependency matrix](#module-dependency-matrix)
4. [Exported services](#exported-services)
5. [Prisma model ownership and access](#prisma-model-ownership-and-access)
6. [Cross-domain transactions](#cross-domain-transactions)
7. [Cross-domain internal imports](#cross-domain-internal-imports)
8. [Read-model requirements](#read-model-requirements)
9. [Exception baseline](#exception-baseline)
10. [Risks](#risks)
11. [Recommended migration order](#recommended-migration-order)
12. [Validation](#validation)

---

## Headline findings

**1. The module graph is almost empty; the coupling is in the database.**
Fourteen feature modules export roughly 40 concrete services between them. Only
**four cross-context service injections exist in the entire application**:
`MailService` into `auth`, `organization` and `admin`, and
`AuthOrganizationActivationService` into `admin`. Everything else that looks
like coupling is two modules reaching into the same PostgreSQL tables through
the shared `PrismaService`.

This reframes the whole programme. The problem is not that modules call each
other badly — they barely call each other at all. It is that **14 models are
written by a context that does not own them**, so no context owns the invariant.

**2. `User` is the contested model.** Four contexts write it (`auth`, `admin`,
`organization`, `professional`) and six read it. Three separate code paths can
create a user account. This makes Phase 5 the highest-risk phase in the
roadmap, because it touches authentication.

**3. Identity provisions all three role profiles.** `ProfessionalProfile`,
`ProviderProfile` and `OrganizationProfile` are created as **nested relation
writes** inside a `User` create, in `auth/services/auth-registration.service.ts`
and `user/services/user.service.ts`. `organization` does the same for
`ProfessionalProfile` when it adds a member. So Identity — not Professional
Development, Provider Management or Organization Management — decides what an
empty role profile looks like, and three contexts can create the same profile.

This finding was **missed by the first pass of the audit** and caught during
verification. A nested `professionalProfile: { create: … }` never appears as a
top-level `prisma.professionalProfile.create` call, so a scan for accessor calls
does not see it. Any Phase 2 lint rule has the same blind spot and must inspect
relation fields, not just accessor calls. See risk R-10.

**4. Ten models have no write path at all.** `ProfileTaxonomyTerm`,
`CurriculumSection`, `CurriculumLesson`, `EventScheduleItem`, `Certification`,
`Payment`, `Roadmap`, `RoadmapPhase`, `RoadmapStep` and `RoadmapEnrollment` are
never created or updated anywhere — not directly and not through a relation.
They are seed-only read surfaces. Their ownership was therefore decided on
structural grounds and is the least evidence-backed part of ADR-002.

Notably `CurriculumSection`, `CurriculumLesson` and `EventScheduleItem` appear
only inside `include` blocks: the curriculum and schedule editors that the
GraphQL contract implies **do not exist on the backend**.

**5. There is exactly one dependency cycle, and it is small.**
`mail/mail.service.ts` imports `AuthMessageCode` from
`@auth/enums/message-code.enum`, while `AuthModule` imports `MailModule`. One
import removal in Phase 2 makes the implemented graph acyclic.

**6. Provider Management is already almost clean.** `provider` writes no catalog
row at all — only `EventPromotionRequest` and `ProviderSettings`. Its remaining
violations are read-only, which makes it the cheapest boundary to close.

**Initial exception count: 43** — 12 writes, 15 reads, 11 imports, 5 transactions.

---

## Scope of the scan

| Dimension                        | Value                                                              |
| -------------------------------- | ------------------------------------------------------------------ |
| Feature modules                  | 14 (plus `app`, `prisma`, `graphql` as composition/infrastructure) |
| Prisma models                    | 54                                                                 |
| Bounded contexts                 | 9                                                                  |
| Cross-context service injections | 4                                                                  |
| `$transaction` call sites        | 25 (13 interactive, 12 batch/array)                                |
| Raw SQL call sites               | 1 (`landing`)                                                      |
| Cross-context Prisma call sites  | 108, across 38 distinct access patterns                            |

Method: every non-spec `.ts` file under `apps/api/src/modules` was scanned for
Prisma accessor calls (`prismaService|prisma|tx|db` followed by a model and an
operation), for `@<module>/…` alias imports, and for constructor injections of
another module's service. Spec files were excluded so the baseline measures
production coupling.

**Accessor scanning alone is not sufficient**, and the first pass of this audit
was wrong because of it. Prisma lets a model be written through a parent's
relation field — `professionalProfile: { create: … }` inside a `user.create` —
which produces no `prisma.professionalProfile.*` call anywhere. A second pass
resolved every relation field name from `schema.prisma` back to its target model
and re-scanned; that is what produced findings 3 and 4 and seven of the
exceptions. Relation-field hits were then confirmed by reading each call site,
because generic field names (`items`, `categories`, `user`) also occur in
GraphQL entities and plain objects and produce false positives.

Completeness was then checked in the opposite direction: every cross-context
access recomputed from source was matched against the register, and the register
is complete for all accessor-call access. The two nested-access classes are
covered by exceptions verified individually by hand.

---

## Module dependency matrix

Compile-time imports between modules. `D` = decorators/guards only (the
cross-cutting auth metadata every module needs), `S` = service injection,
`T` = type/DTO/entity import. Blank = no dependency.

| From ↓ / To → | auth | user | course | events | podcast | youtube | landing | professional | ext | org | provider | content | admin | mail |
| ------------- | ---- | ---- | ------ | ------ | ------- | ------- | ------- | ------------ | --- | --- | -------- | ------- | ----- | ---- |
| auth          | —    |      |        |        |         |         |         |              |     |     |          |         |       | S    |
| user          | D    | —    |        |        |         |         |         |              |     |     |          |         |       |      |
| course        | D    |      | —      |        |         |         |         |              |     |     |          |         |       |      |
| events        | D    |      |        | —      |         |         |         |              |     |     |          |         |       |      |
| podcast       | D    |      |        |        | —       |         |         |              |     |     |          |         |       |      |
| youtube       | D    |      |        |        |         | —       |         |              |     |     |          |         |       |      |
| landing       | D    |      |        |        |         |         | —       |              |     |     |          |         |       |      |
| professional  | D    |      |        |        |         |         |         | —            |     |     |          |         |       |      |
| ext           | D+T  |      |        |        |         |         |         |              | —   | T   |          |         |       |      |
| org           | D    |      |        |        |         |         |         |              |     | —   |          |         |       | S    |
| provider      | D    |      |        |        |         |         |         |              |     |     | —        |         |       |      |
| content       | D    |      |        |        |         |         |         |              |     |     |          | —       |       |      |
| admin         | D+S  |      |        |        |         |         |         |              |     | T   |          |         | —     | S    |
| mail          | T    |      |        |        |         |         |         |              |     |     |          |         |       | —    |

Reading the matrix:

- The `auth` column is dense because of decorators, not because of domain
  coupling. Twelve modules import `@auth/decorators/*` or `@auth/guards/*`
  (EXC-024). This is a misplaced shared kernel, not a design failure.
- The `mail` column is the only real fan-in: three contexts send email.
- **`mail` → `auth` (row `mail`, column `auth`) closes a cycle** with
  `auth` → `mail`. It is the only cycle in the codebase (EXC-023).
- `ext` → `org` and `admin` → `org` are type-only imports of a pagination shape
  and two GraphQL entities (EXC-021, EXC-022).
- Every remaining cell is empty. The catalog modules, `professional`,
  `provider` and `content-interaction` import nothing from each other.

At context level, after removing the decorator noise:

```text
platform-administration ──► identity-access  (service)
platform-administration ──► organization-management (types)
platform-administration ──► communications (service)
identity-access        ──► communications (service)
organization-management ─► communications (service)
professional-development ► organization-management (types)
communications         ──► identity-access (types)   ◄── the cycle
```

---

## Exported services

Every module exports concrete service classes. No module exports an interface or
a port.

| Module                | Exports                                            | Consumed by another context?                            |
| --------------------- | -------------------------------------------------- | ------------------------------------------------------- |
| `auth`                | `AuthService`, `AuthOrganizationActivationService` | **Yes** — `AuthOrganizationActivationService` → `admin` |
| `mail`                | `MailService`                                      | **Yes** — → `auth`, `organization`, `admin`             |
| `admin`               | `AdminDashboardService`, `AdminOrgService`         | No                                                      |
| `organization`        | 6 services                                         | No                                                      |
| `professional`        | 15 services                                        | No                                                      |
| `content-interaction` | 2 services                                         | No                                                      |
| `course`              | `CourseService`, `CourseImportService`             | No                                                      |
| `events`              | `EventService`                                     | No                                                      |
| `podcast`             | `PodcastService`                                   | No                                                      |
| `youtube`             | `YouTubeService`                                   | No                                                      |
| `landing`             | `LandingService`                                   | No                                                      |
| `provider`            | `ProviderService`                                  | No                                                      |
| `user`                | `UserService`                                      | No                                                      |
| `external-learning`   | `ExternalLearningService`                          | No                                                      |

Two observations:

1. **Roughly 36 of 40 exports have no cross-module consumer.** They are exported
   by habit. This is harmless today but it means the `exports` array does not
   currently communicate a public contract — everything is public, so nothing is.
2. The two that _are_ consumed are concrete classes. `admin` receives Identity's
   entire activation service rather than the one operation it needs (EXC-025).
   `MailService` is a legitimate infrastructure capability and is the closest
   thing the codebase already has to a published port.

---

## Prisma model ownership and access

All 54 models. **Bold** marks a module whose context is not the model's owner —
that is, a cross-domain access. Owner assignments and their rationale are in
[ADR-002](architecture/adr-002-domain-boundaries.md); the machine-readable form
is `apps/api/src/architecture/domain-ownership.ts`.

| Model                             | Owner                    | Writers                                                                                                                                                                                                                        | Readers                                                                                                                           |
| --------------------------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `User`                            | identity-access          | **admin**, auth, **organization**, **professional**, user                                                                                                                                                                      | **admin**, auth, **organization**, **professional**, **provider**, user                                                           |
| `AuthAccount`                     | identity-access          | auth                                                                                                                                                                                                                           | auth                                                                                                                              |
| `AuthSession`                     | identity-access          | auth                                                                                                                                                                                                                           | auth, **professional**                                                                                                            |
| `OtpCode`                         | identity-access          | auth                                                                                                                                                                                                                           | auth                                                                                                                              |
| `PendingRegistration`             | identity-access          | auth                                                                                                                                                                                                                           | auth                                                                                                                              |
| `ProfessionalProfile`             | professional-development | professional/services/professional-profile.service.ts; **auth/services/auth-registration.service.ts** (nested); **user/services/user.service.ts** (nested); **organization/services/org-dashboard-member.service.ts** (nested) | professional/services/professional-profile.service.ts; **user/services/user.service.ts**                                          |
| `ProfileTaxonomyTerm`             | professional-development | _none_                                                                                                                                                                                                                         | professional/services/professional-profile.service.ts                                                                             |
| `ProfessionalProfileTerm`         | professional-development | professional/services/professional-profile.service.ts                                                                                                                                                                          | professional/services/professional-profile.service.ts                                                                             |
| `ProfessionalCredential`          | professional-development | professional                                                                                                                                                                                                                   | professional                                                                                                                      |
| `ProviderProfile`                 | provider-management      | **auth/services/auth-registration.service.ts** (nested); **user/services/user.service.ts** (nested)                                                                                                                            | **admin/services/admin.service.ts**; **professional/services/professional-courses.service.ts**; **user/services/user.service.ts** |
| `OrganizationProfile`             | organization-management  | **admin/services/admin.service.ts**; **user/services/user.service.ts** (nested)                                                                                                                                                | **admin/services/admin.service.ts**; **auth/services/auth-organization-activation.service.ts**; **user/services/user.service.ts** |
| `OrganizationAccessRequest`       | organization-management  | **admin**, organization                                                                                                                                                                                                        | **admin**, organization                                                                                                           |
| `Course`                          | learning-catalog         | **content-interaction**, course                                                                                                                                                                                                | **content-interaction**, course, **organization**, **professional**, landing                                                      |
| `CurriculumSection`               | learning-catalog         | _none_                                                                                                                                                                                                                         | course/services/course.service.ts (include only)                                                                                  |
| `CurriculumLesson`                | learning-catalog         | _none_                                                                                                                                                                                                                         | course/services/course.service.ts (include only)                                                                                  |
| `Event`                           | learning-catalog         | **content-interaction**, events                                                                                                                                                                                                | **content-interaction**, events, **organization**, **provider**, landing                                                          |
| `EventRegistration`               | learning-catalog         | **content-interaction**, events                                                                                                                                                                                                | **content-interaction**, events, **professional**, **provider**                                                                   |
| `EventScheduleItem`               | learning-catalog         | _none_                                                                                                                                                                                                                         | events/services/event.service.ts (include only)                                                                                   |
| `CalendarEvent`                   | professional-development | professional                                                                                                                                                                                                                   | professional                                                                                                                      |
| `Podcast`                         | learning-catalog         | **content-interaction**, podcast                                                                                                                                                                                               | **content-interaction**, podcast, landing                                                                                         |
| `PodcastEpisode`                  | learning-catalog         | podcast                                                                                                                                                                                                                        | podcast                                                                                                                           |
| `YouTubeChannel`                  | learning-catalog         | **content-interaction**, youtube                                                                                                                                                                                               | **content-interaction**, youtube, landing                                                                                         |
| `YouTubeVideo`                    | learning-catalog         | youtube                                                                                                                                                                                                                        | youtube                                                                                                                           |
| `WishlistItem`                    | engagement               | content-interaction                                                                                                                                                                                                            | content-interaction                                                                                                               |
| `ContentEnrollment`               | engagement               | content-interaction                                                                                                                                                                                                            | content-interaction, **professional**                                                                                             |
| `ContentReview`                   | engagement               | content-interaction                                                                                                                                                                                                            | content-interaction                                                                                                               |
| `Cart`                            | engagement               | content-interaction                                                                                                                                                                                                            | content-interaction                                                                                                               |
| `CartItem`                        | engagement               | content-interaction                                                                                                                                                                                                            | content-interaction                                                                                                               |
| `ProviderSettings`                | provider-management      | provider/services/provider.service.ts                                                                                                                                                                                          | provider/services/provider.service.ts                                                                                             |
| `EventPromotionRequest`           | provider-management      | provider                                                                                                                                                                                                                       | provider                                                                                                                          |
| `ProfessionalSettings`            | professional-development | professional/services/professional-settings.service.ts                                                                                                                                                                         | professional/services/professional-settings.service.ts                                                                            |
| `PDUTarget`                       | professional-development | professional                                                                                                                                                                                                                   | professional                                                                                                                      |
| `PDUActivity`                     | professional-development | professional                                                                                                                                                                                                                   | professional                                                                                                                      |
| `PDUActivityFile`                 | professional-development | professional                                                                                                                                                                                                                   | professional                                                                                                                      |
| `Certification`                   | professional-development | _none_                                                                                                                                                                                                                         | professional                                                                                                                      |
| `CertificationCategory`           | professional-development | professional/services/professional-cpd-plan.service.ts (nested)                                                                                                                                                                | professional/services/professional-cpd-plan.service.ts                                                                            |
| `CPDPlan`                         | professional-development | professional                                                                                                                                                                                                                   | professional                                                                                                                      |
| `CPDPlanCategory`                 | professional-development | professional/services/professional-cpd-plan.service.ts (nested)                                                                                                                                                                | professional/services/professional-cpd-plan.service.ts; professional/utils/cpd-progress.util.ts                                   |
| `Certificate`                     | professional-development | professional                                                                                                                                                                                                                   | professional                                                                                                                      |
| `CertificateFile`                 | professional-development | professional                                                                                                                                                                                                                   | professional                                                                                                                      |
| `Payment`                         | engagement               | _none_                                                                                                                                                                                                                         | **professional**                                                                                                                  |
| `Roadmap`                         | learning-catalog         | _none_                                                                                                                                                                                                                         | **professional**                                                                                                                  |
| `RoadmapPhase`                    | learning-catalog         | _none_                                                                                                                                                                                                                         | **professional/services/professional-roadmap.service.ts** (include only)                                                          |
| `RoadmapStep`                     | learning-catalog         | _none_                                                                                                                                                                                                                         | **professional/services/professional-roadmap.service.ts** (include only)                                                          |
| `RoadmapEnrollment`               | engagement               | _none_                                                                                                                                                                                                                         | **professional**                                                                                                                  |
| `Organization`                    | organization-management  | **admin**                                                                                                                                                                                                                      | **admin**, organization                                                                                                           |
| `OrganizationSettings`            | organization-management  | **admin**, organization                                                                                                                                                                                                        | organization                                                                                                                      |
| `OrganizationDepartment`          | organization-management  | organization                                                                                                                                                                                                                   | organization                                                                                                                      |
| `OrganizationMember`              | organization-management  | **admin**, organization                                                                                                                                                                                                        | **admin**, organization                                                                                                           |
| `OrganizationCPDCategory`         | organization-management  | organization                                                                                                                                                                                                                   | organization                                                                                                                      |
| `OrganizationAssignment`          | organization-management  | organization                                                                                                                                                                                                                   | organization                                                                                                                      |
| `OrganizationAssignmentRecipient` | organization-management  | organization/services/org-dashboard-assignment.service.ts                                                                                                                                                                      | organization/services/org-dashboard-assignment.service.ts; organization/services/org-dashboard.service.ts                         |
| `AuditLog`                        | platform-administration  | admin, **auth**, **organization**                                                                                                                                                                                              | admin                                                                                                                             |
| `ExternalLearningActivity`        | professional-development | external-learning                                                                                                                                                                                                              | external-learning                                                                                                                 |

### Models written by a context that does not own them

These 14 are the substance of the migration. "Nested" means the write happens
through a parent's relation field rather than a direct accessor call.

| Model                                   | Owner                    | Foreign writer                                            | Exception                 |
| --------------------------------------- | ------------------------ | --------------------------------------------------------- | ------------------------- |
| `User`                                  | identity-access          | `admin`, `organization`, `professional`                   | EXC-003, EXC-005, EXC-006 |
| `Organization`                          | organization-management  | `admin`                                                   | EXC-004                   |
| `OrganizationProfile`                   | organization-management  | `admin`, `user` (nested)                                  | EXC-004, EXC-028          |
| `OrganizationSettings`                  | organization-management  | `admin`                                                   | EXC-004                   |
| `OrganizationMember`                    | organization-management  | `admin`                                                   | EXC-004                   |
| `OrganizationAccessRequest`             | organization-management  | `admin`                                                   | EXC-004                   |
| `Event`                                 | learning-catalog         | `content-interaction`                                     | EXC-001, EXC-002          |
| `EventRegistration`                     | learning-catalog         | `content-interaction`                                     | EXC-001                   |
| `Course` / `Podcast` / `YouTubeChannel` | learning-catalog         | `content-interaction`                                     | EXC-002                   |
| `ProfessionalProfile`                   | professional-development | `auth` (nested), `user` (nested), `organization` (nested) | EXC-026, EXC-029          |
| `ProviderProfile`                       | provider-management      | `auth` (nested), `user` (nested)                          | EXC-027                   |
| `AuditLog`                              | platform-administration  | `auth`, `organization`                                    | EXC-007, EXC-008          |

Two of these deserve a specific note.

**`Organization` is never written by the `organization` module.** Organizations
are created exclusively by the admin approval workflow, so the owning context, as
assigned, cannot currently create its own root aggregate.

**`ProviderProfile` is never written by `provider`.** Provider profiles are
created only during registration and admin user creation, both in Identity. The
provider context owns a profile it has no code to create.

---

## Cross-domain transactions

25 `$transaction` call sites. Twelve are read-only array batches used for
`[items, totalCount]` pagination and are architecturally uninteresting. Of the
thirteen interactive transactions, **four span more than one bounded context**.
Each is recorded in the register with `kind: "transaction"`; T-1 spans three
contexts and therefore needs two entries, one per target.

### T-1 — Organization approval (the big one) — EXC-039, EXC-040

`apps/api/src/modules/admin/services/admin.service.ts:349`

Models written in one transaction:

```text
OrganizationAccessRequest  (organization-management)   claim + status
User                       (identity-access)           owner account
Organization               (organization-management)
OrganizationProfile        (organization-management)
OrganizationSettings       (organization-management)
OrganizationMember         (organization-management)   owner membership
AuditLog                   (platform-administration)
```

**Three contexts, seven models, one atomic unit.** It also calls
`AuthOrganizationActivationService` for the activation token. Two real
guarantees depend on this atomicity:

1. Approval either provisions the whole organization or leaves the request
   `PENDING`.
2. The conditional status claim means exactly one reviewer wins a concurrent
   review.

Splitting this is the single hardest task in the roadmap. Phase 5 must state
explicitly what replaces each guarantee — see
[ADR-003](architecture/adr-003-cross-domain-communication.md).

### T-2 — Organization member add — EXC-041

`apps/api/src/modules/organization/services/org-dashboard-member.service.ts:330`
— writes `User` (identity-access) and `OrganizationMember`
(organization-management). Two contexts.

### T-3 — Professional basic profile update — EXC-042

`apps/api/src/modules/professional/services/professional-profile.service.ts:185`
— writes `User.fullName` (identity-access) and `ProfessionalProfile`
(professional-development). Two contexts. The root cause is field placement:
`fullName` and `avatarUrl` live on `User` but are edited from the professional
profile screen.

### T-4 — Access request submission — EXC-043

`apps/api/src/modules/organization/services/org-access-request.service.ts:81`
— writes `OrganizationAccessRequest` (organization-management) and `AuditLog`
(platform-administration). Two contexts; the audit row is the only foreign
write, which is exactly the case the Phase 7 outbox is for.

### Single-context interactive transactions

`auth` ×6 (registration, OAuth link, email change, password reset, activation
×2 — all within identity-access plus the T-4-style audit write), `events` ×2,
`podcast` ×2, `youtube` ×2, `professional` ×1 (taxonomy terms), `admin` ×1
(rejection). These need no change.

---

## Cross-domain internal imports

Eleven compile-time couplings across contexts, none of which touch the database.
Seven of them are one problem with seven different sources, so they are grouped
here and recorded separately in the register — `source` is what Phase 2 matches
on, and a single entry naming one source would fail to permit the other six.

| #   | Import                                                                                   | Exception             | Files                                                        | Why it exists                                                        |
| --- | ---------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------ | -------------------------------------------------------------------- |
| 1   | `mail` → `@auth/enums/message-code.enum`                                                 | EXC-023               | `mail/mail.service.ts`                                       | Mail throws an auth-flavoured error code. **Closes the only cycle.** |
| 2   | `external-learning` → `@org/dtos/org-pagination.input`, `@org/entities/page-info.entity` | EXC-021               | 3 files                                                      | Pagination shape reuse                                               |
| 3   | `admin` → `@org/entities/org-settings.entity`, `@org/entities/org-department.entity`     | EXC-022               | `admin/entities/admin-org-detail.entity.ts`                  | Embeds Organization's GraphQL entities in the admin contract         |
| 4   | Seven contexts → `@auth/decorators/*`, `@auth/guards/*`                                  | EXC-024, EXC-033..038 | 32 files                                                     | Cross-cutting auth metadata                                          |
| 5   | `admin` → `AuthOrganizationActivationService` (concrete class)                           | EXC-025               | `admin/services/organization-review-notification.service.ts` | Real service dependency, but not through a port                      |

Row 4 broken out by source context, because that is the unit Phase 2 enforces on:

| Exception | Source context             | Files | Where                                                                       |
| --------- | -------------------------- | ----- | --------------------------------------------------------------------------- |
| EXC-034   | `professional-development` | 14    | Every professional resolver and upload controller, plus `external-learning` |
| EXC-035   | `organization-management`  | 6     | All six organization resolvers                                              |
| EXC-033   | `learning-catalog`         | 6     | `course` (×2), `events`, `landing`, `podcast`, `youtube`                    |
| EXC-036   | `platform-administration`  | 2     | Both admin resolvers                                                        |
| EXC-037   | `engagement`               | 2     | Both content-interaction resolvers                                          |
| EXC-038   | `provider-management`      | 1     | `provider/resolvers/provider.resolver.ts`                                   |
| EXC-024   | `platform-shared`          | 1     | `app/app.module.ts`, registering the three global guards                    |

`user/resolvers/user.resolver.ts` imports the same decorators and is deliberately
**not** listed: `user` is itself `identity-access`, so that import is
intra-context and not a violation at all.

Items 1, 2 and 4 are all the same underlying problem: **there is no
`platform-shared` location**, so shared things end up living inside whichever
domain first needed them. Item 3 is different and more dangerous — a change to
an Organization GraphQL entity silently reshapes the admin API contract.

Item 4 is the largest by file count but the least severe: it is a relocation,
not a redesign. It is also why Phase 2 carries ten exceptions while carrying
almost no risk.

---

## Read-model requirements

Four surfaces read across contexts to render one screen. Each needs a published
read model rather than direct table access.

### `landing` — public catalog aggregate

`landing/services/landing.service.ts` runs a **raw SQL** `$queryRaw` union over
`"Course"`, `"Event"`, `"Podcast"` and `"YouTubeChannel"` to produce popular
categories.

Because `landing` sits inside `learning-catalog` (ADR-002), this is an
_intra_-context read and **not** a boundary violation. It is still worth
flagging: raw SQL names physical table names, so it bypasses every guarantee
Prisma's types give and no boundary tool can see it. Treat it as a maintenance
risk, not an exception.

Requirement: a `CatalogPopularityReadModel` published by `learning-catalog`.

### `admin` — platform-wide observation

| Screen                   | Reads across                                                                           | Exception        |
| ------------------------ | -------------------------------------------------------------------------------------- | ---------------- |
| User directory           | `User`, `ProviderProfile`                                                              | EXC-017, EXC-019 |
| Organization list/detail | `Organization`, `OrganizationMember`, `OrganizationSettings`, `OrganizationDepartment` | EXC-018          |
| Access requests          | `OrganizationAccessRequest`                                                            | EXC-018          |
| Audit log                | `AuditLog` (owned)                                                                     | —                |
| Overview charts          | `User`, `Organization`, `OrganizationAccessRequest`                                    | EXC-017, EXC-018 |

Administration legitimately observes everything; ADR-002 grants it a dependency
on `identity-access` and `organization-management` for that reason. What it must
not keep is _writing_ through those reads (EXC-003, EXC-004).

Requirement: `IdentityDirectoryReadModel` and `OrganizationDirectoryReadModel`.

### `provider` — provider analytics

Reads `Event`, `EventRegistration` (learning-catalog) and `User`
(identity-access) for the events list, analytics and the attendees CSV export.
Writes nothing foreign. **Cheapest boundary in the codebase to close.**

Requirement: `ProviderEventPerformanceReadModel`, `EventAttendeeReadModel`.

### `professional` — dashboard overview

The widest reader: `Course`, `Roadmap*`, `EventRegistration` (learning-catalog),
`ContentEnrollment`, `RoadmapEnrollment`, `Payment` (engagement), `User`,
`AuthSession` (identity-access), `ProviderProfile` (provider-management). Five
contexts for one dashboard.

`user` is a second, quieter case of the same thing: its shared select projects
`ProfessionalProfile`, `ProviderProfile` and `OrganizationProfile` in full, so
every user read in Identity returns three other contexts' tables
(EXC-030/031/032).

Requirement: `LearnerProgressReadModel`, plus a decision in Phase 6 about
whether the overview is composed in the resolver or materialized.

---

## Exception baseline

**43 exceptions.** The authoritative, typed list is
`apps/api/src/architecture/boundary-exceptions.ts`; it is validated by
`domain-ownership.spec.ts`, which fails if an entry names a missing file, a
directory instead of a file, a source context that does not match its own files,
an unknown model, a self-violation, or a model the source already owns. Every
table in this section is derived from that file, not maintained alongside it.

They reference 58 distinct files across 89 file references.

| Kind          | Count |
| ------------- | ----- |
| `write`       | 12    |
| `read`        | 15    |
| `import`      | 11    |
| `transaction` | 5     |

`import` and `transaction` extend the read/write classification the Phase 1
specification originally named. Both were added because the codebase contains
violations that are genuinely neither: a compile-time dependency with no
database access, and a `$transaction` whose atomicity spans two contexts. A
`transaction` entry does not restate the underlying `write` entries — it records
the coupling that actually blocks the split.

By removal phase:

| Phase                                      | Exceptions                                                                                        | Remaining after |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------- | --------------- |
| 2 — Boundary enforcement                   | EXC-021, 022, 023, 024, 033, 034, 035, 036, 037, 038                                              | 33              |
| 3 — Events pilot                           | EXC-001                                                                                           | 32              |
| 4 — Catalog and engagement                 | EXC-002, 009, 013, 015                                                                            | 28              |
| 5 — Identity, organization, administration | EXC-003, 004, 005, 014, 016, 017, 018, 019, 025, 026, 027, 028, 029, 030, 031, 032, 039, 040, 041 | 9               |
| 6 — Professional development               | EXC-006, 010, 011, 012, 020, 042                                                                  | 3               |
| 7 — Reliability and operations             | EXC-007, 008, 043                                                                                 | **0**           |

By source context:

| Context                    | Exceptions |
| -------------------------- | ---------- |
| `platform-administration`  | 10         |
| `organization-management`  | 8          |
| `professional-development` | 8          |
| `identity-access`          | 7          |
| `engagement`               | 4          |
| `provider-management`      | 3          |
| `communications`           | 1          |
| `learning-catalog`         | 1          |
| `platform-shared`          | 1          |

Phase 5 carries 19 of the 43, and Phase 2 carries 10. Phase 5's weight is the
direct consequence of finding 3 — role-profile provisioning, account creation and
the approval workflow are one cluster, and they all land there. If the programme
needs rebalancing, splitting Phase 5 is the place to look. Phase 2's ten are all
relocations with no behavior change, so its count overstates its risk.

---

## Risks

**R-1 — Splitting the organization approval transaction (high).**
T-1 spans three contexts and protects two guarantees that users depend on.
Getting it wrong produces orphaned organizations or duplicate owner accounts,
in a security-sensitive flow. _Mitigation:_ Phase 5 must specify the
compensation path before any code moves; the concurrent-review test must exist
before the refactor, not after.

**R-2 — `User` has four writers (high).**
Consolidating account creation behind one Identity port touches registration,
OAuth, admin approval, organization member add and professional profile edit
simultaneously. _Mitigation:_ introduce the port and migrate callers one at a
time; keep the direct writes working until the last caller moves.

**R-3 — Field placement forces cross-domain writes (medium).**
`User.fullName` and `User.avatarUrl` are edited by `professional`. This is not a
code problem — the schema puts display fields on the identity aggregate. Phase 6
must decide between an Identity port and moving the fields, and moving them
means a migration plus a GraphQL contract change. _Mitigation:_ decide early;
this is the one place where Phase 1's "no schema change" rule defers a real
schema question.

**R-4 — Nine writer-free models make ownership guesswork (medium).**
`Payment`, the roadmap family, the certification family and `ProviderProfile`
have no write path, so the evidence that normally decides ownership is absent.
_Mitigation:_ they are flagged in ADR-002 as cheap to reassign; revisit when a
write path appears — especially `Payment`, which will likely justify a
dedicated commerce context.

**R-5 — Raw SQL is invisible to boundary tooling (medium).**
`landing`'s `$queryRaw` names physical tables. A Phase 2 lint rule that inspects
Prisma accessor calls will not see it, and a table rename will not break the
build. _Mitigation:_ Phase 2 should add a rule for `$queryRaw`/`$executeRaw`
call sites specifically.

**R-6 — The exception register decays into an allowlist (medium).**
The failure mode of every such register is that entries get added to silence new
violations. _Mitigation:_ the roadmap already requires the count to fall
monotonically; the drift spec enforces structure, and the count is recorded here
so a review can compare.

**R-7 — Enforcement is advisory until Phase 2 (medium).**
Nothing prevents a new violation between now and then. _Mitigation:_ start Phase
2 immediately after this exit gate.

**R-8 — Curriculum and schedule content has no write path (low).**
`CurriculumSection`, `CurriculumLesson` and `EventScheduleItem` are read through
`include` blocks but never created or updated. Either the authoring surface was
never built or it lives outside this codebase. _Mitigation:_ confirm intent
before Phase 4 assigns them a meaningful owner; an owner for data nobody writes
is a guess.

**R-10 — Nested relation writes are invisible to accessor-based tooling (high).**
This is the defect that made the first pass of this audit wrong. Prisma writes a
child model through a parent's relation field, producing no
`prisma.<model>.create` call, so seven real cross-domain writes were missed —
including the whole role-profile provisioning cluster. _Mitigation:_ the Phase 2
rule must resolve relation field names from `schema.prisma` and inspect nested
`create`/`connectOrCreate`/`deleteMany` blocks, not only accessor calls. A rule
that checks accessors alone would certify this codebase as clean while three
contexts create each other's aggregates.

**R-9 — The nine contexts are a proposal validated on today's code (low).**
`communications` and `platform-shared` own no models, and `platform-administration`
owns one. _Mitigation:_ they are still worth separating — each has a distinct
dependency rule — but expect `platform-shared` to grow in Phase 7.

---

## Recommended migration order

The roadmap's existing order is confirmed by the evidence, with one observation:
Phase 4 could be started before Phase 3 without harm, because catalog and
engagement have no dependency on the events pilot. Keeping the roadmap order is
still recommended — the pilot exists to prove the internal structure on a small
module before it is applied to a large one.

| Phase                                          | Why it is next                                                                                                                                                                 | Exceptions removed |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| **2 — Boundary enforcement**                   | Nothing else is safe while new violations can land silently. All four of its exceptions are relocations with no behavior change, so it is also the lowest-risk phase.          | 4                  |
| **3 — Events pilot**                           | `events` is small, owns a clear aggregate, and has exactly one foreign writer. Proving the internal structure here costs little if it turns out wrong.                         | 1                  |
| **4 — Catalog and engagement**                 | The rating write-back and the polymorphic content reads are self-contained and touch no security surface.                                                                      | 4                  |
| **5 — Identity, organization, administration** | Half the register. Account creation, role-profile provisioning and the approval workflow are one cluster; deliberately attempted only after the pattern is proven three times. | 16                 |
| **6 — Professional development**               | The biggest module (15 services, 16 models) and the widest reader. Benefits most from read models existing already.                                                            | 5                  |
| **7 — Reliability and operations**             | The outbox is the prerequisite for removing the last two audit-log writes, so it must come last.                                                                               | 2                  |

Suggested first move inside Phase 2, in order of increasing effort: create
`platform-shared`, relocate the auth decorators (EXC-024), relocate the
pagination shapes (EXC-021), break the `mail` → `auth` import (EXC-023), then
give `admin` its own organization-detail entity (EXC-022). That sequence makes
the implemented dependency graph acyclic before any enforcement rule is turned
on, which avoids having to grandfather the cycle.

---

## Validation

Phase 1 changes no runtime behavior. The verification that matters is that the
baseline gate is still green and the new manifests are self-consistent.

| Check                             | Result                                     |
| --------------------------------- | ------------------------------------------ |
| `git diff --check`                | pass                                       |
| `npm run lint`                    | pass (3 tasks)                             |
| `npm run check-types`             | pass (4 tasks)                             |
| `npm run test`                    | pass — 208 API (21 suites), 112 frontend   |
| `npm run build`                   | pass (3 tasks)                             |
| `npx jest src/architecture`       | 20 new tests, pass                         |
| Negative probe, 6 mutations       | all 6 caught; files restored byte-for-byte |
| Register completeness, recomputed | every cross-context access covered         |

The drift tests were verified by breaking the manifest six ways — dropping a
model, inventing one, introducing a cycle, duplicating an exception ID, pointing
at a deleted file, and claiming a self-owned model — and confirming each one
fails the suite. A guard never seen to fire is not known to work.

No `apps/**` runtime file, Prisma model, migration or GraphQL operation was
changed. The only additions under `apps/` are three files in
`apps/api/src/architecture/`, which nothing imports at runtime.

## Exit gate

ADR-001, ADR-002 and ADR-003 are **Proposed**. Phase 2 treats them as
enforceable architecture, so the following need explicit human acceptance before
Phase 2 starts:

1. The nine bounded contexts and the module map.
2. The 54 model-owner assignments — in particular the five decisions ADR-002
   resolves, and the four writer-free assignments (`Payment`, `Roadmap*`,
   `RoadmapEnrollment`) that rest on structure rather than usage.
3. The allowed dependency direction, including "nothing depends on
   `platform-administration`".
4. The 43 exceptions and their removal phases, and whether Phase 5 should be
   split now that it carries 19 of them.
5. Whether the missing write paths for curriculum, schedule and roadmap content
   are intentional (R-8), since an owner for data nobody writes is a guess.
6. Whether role-profile provisioning should stay in Identity or move to each
   role's own context (finding 3). This is the decision that sizes Phase 5.
