# Professional Dashboard Modifications — Phase 1 Audit Report

> Read-only audit per `context/features/modify-ui-ph1-spec.md`. No `apps/` code
> was modified, created, or deleted. This report is the phase deliverable.

## Orientation: how the Professional dashboard is built

- The whole Professional dashboard is **one route**,
  [professional/page.tsx](apps/front/src/app/(dashboards)/dashboard/professional/page.tsx),
  rendering [professional-dashboard-shell.tsx](apps/front/src/components/modules/ProfessionalDashboard/parts/professional-dashboard-shell.tsx).
  There are **no nested route segments per tab** — the active tab is chosen from
  the `?tab=` query param and the shell switches on it.
- The sidebar is data-driven from
  [dashboard-nav.config.ts](apps/front/src/utils/dashboard-nav.config.ts)
  (`professionalDashboardTabs`), rendered by the shared dashboard layout. Nav
  **is role-specific** via `getDashboardTabsByRole("PROFESSIONAL")`.
- Each tab = a `Professional*Tab.tsx` component + a `use*` hook (behavior/data) +
  RTK Query endpoints in [professional.api.ts](apps/front/src/lib/rtk/endpoints/professional.api.ts)
  (and `content-interaction.api.ts` for wishlist) + generated GraphQL types.
- Backend feature module is
  [apps/api/src/modules/professional/](apps/api/src/modules/professional/), split
  into resolvers (GraphQL) + two REST controllers (file/avatar upload) + services.

---

## 1. Professional Sidebar — remove "My Courses" and "External Learning"

### Existing functionality

- Both are entries in `professionalDashboardTabs`
  ([dashboard-nav.config.ts:30-53](apps/front/src/utils/dashboard-nav.config.ts#L30-L53)):
  `courses` → `?tab=courses`, `external-learning` → `?tab=external-learning`.
- The shell maps them to `ProfessionalCoursesTab` and
  `ProfessionalExternalLearningTab` and both values are in `validTabs`
  ([professional-dashboard-shell.tsx:20-61](apps/front/src/components/modules/ProfessionalDashboard/parts/professional-dashboard-shell.tsx#L20-L61)).
- Underlying stack that stays alive: `ProfessionalCoursesTab` +
  `professionalMyCourses` query + `ProfessionalCoursesResolver/Service`;
  `ProfessionalExternalLearningTab` + `useExternalLearningRedirect` +
  `ExternalLearningConfirmDialog` + `external-learning.api.ts` + the API
  `external-learning` module.

### Findings

- **Nav is role-specific** — removal touches only Professional; other roles are
  unaffected.
- **The two `?tab=` values are referenced nowhere except the nav config.** A
  repo-wide search for `tab=courses` / `tab=external-learning` returns only
  [dashboard-nav.config.ts:33](apps/front/src/utils/dashboard-nav.config.ts#L33)
  and [:51](apps/front/src/utils/dashboard-nav.config.ts#L51). **No Overview card
  or other link points at them.** The Overview "Browse courses" / "Continue"
  buttons link to the public `/courses` and `/courses/[id]` pages, not the tab.
- **Removing the two array entries is sufficient** to remove them from the
  sidebar. The tabs remain reachable only by manually typing the URL (the shell
  still lists them in `validTabs`), which satisfies "do not delete the
  underlying pages."

### Recommendation

- Delete the `courses` and `external-learning` objects from
  `professionalDashboardTabs` only. **Leave** the tab components, hooks,
  endpoints, routes, and backend modules intact (they are not provably unused —
  `professionalMyCourses` is also consumed by the Overview tab).
- Decide deliberately whether to also drop `courses` / `external-learning` from
  the shell `validTabs`. Recommended: **leave them**, so an existing bookmark
  still renders rather than silently falling back to Overview. Note this as a
  product decision, not a technical requirement.

---

## 2. Professional Overview — replace the cards

### Existing functionality
[ProfessionalOverviewTab.tsx](apps/front/src/components/modules/ProfessionalDashboard/ProfessionalOverviewTab.tsx)
+ [useProfessionalOverviewTab.ts](apps/front/src/hooks/useProfessionalOverviewTab.ts).
Today it renders: 4 stat cards (active courses, completed courses, total PDUs,
certificates earned); a PDU-over-time area chart; a goal half-pie; a
PDUs-by-category chart; an upcoming-events list; a learning snapshot; my active
courses; and a "recommended courses" grid.

Data sources already wired in the hook:

| Concern | Query | Location |
| --- | --- | --- |
| Summary counts + goal % | `professionalOverview` | [professional-overview.service.ts](apps/api/src/modules/professional/services/professional-overview.service.ts) |
| PDU over time / by category / targets | `professionalPduReport` | `professional-pdu.service.ts` |
| Registered upcoming events | `professionalCalendarEvents` | `professional-calendar.service.ts` |
| Manual calendar items | `myCalendarEntries` | `professional-calendar.service.ts` |
| My courses | `professionalMyCourses` | `professional-courses.service.ts` |
| "Recommended" | `courses` (generic list, `take:10`) | `course.api.ts` |

Chart primitives live in `@elements/dashboard-charts` (`PduOverTimeChart`,
`GoalHalfPieChart`, `PduByCategoryChart`) — **Recharts**. Cards use
`DashboardStatCard`, `MetricCard`, `GlassCard`, `SnapshotRow`.

### The six new cards and where their data comes from

| New card | Data available today? | Source |
| --- | --- | --- |
| **CPD/PDU Progress** | ✅ Yes | `professionalOverview.yearlyPduGoalProgress` + `professionalPduReport` (`totalPdus`, `progressToGoal`, `targets`, `byCategory`). Also `professionalCpdPlans` if plan-based progress is wanted. |
| **Learning Roadmap Progress** | ✅ Yes | `professionalMyRoadmaps` (`professional-roadmap.service.ts`) — already returns enrollment progress; the Roadmap tab renders it. Not yet fetched by the Overview hook. |
| **Upcoming Calendar Items** | ✅ Yes | Already computed in the hook as `upcomingEvents` (merge of `professionalCalendarEvents` + `myCalendarEntries`). |
| **Recommendations for You** | ⚠️ Partial | Currently the **generic** `courses` list, not personalized. No recommendation engine exists. Reuse the generic list for now, or note a real recommender as out of scope. |
| **Recent Learning Activities** | ✅ Yes | `professionalPduActivities` (already exists, used by the tracker). Not yet fetched by the Overview hook. |
| **Certificates** | ✅ Yes | `professionalCertificates` (already exists). Not yet fetched by the Overview hook. |

### Missing / to add for Overview
- No new backend APIs are strictly required — every card can be sourced from
  existing queries. The Overview hook must additionally call
  `professionalMyRoadmaps`, `professionalPduActivities`, and
  `professionalCertificates` (all already defined and typed).
- **Optional consolidation:** if the six cards are meant to be a single fetch,
  consider extending `ProfessionalOverviewEntity`
  ([professional-overview.entity.ts](apps/api/src/modules/professional/entities/professional-overview.entity.ts))
  with roadmap-progress and recent-activity summaries to avoid six client round
  trips. This is a performance decision, not a capability gap.
- "Recommendations for You" is the only genuine gap and only if true
  personalization is required.

---

## 3. Wishlist — remove Price / Only Rated / Only Available Links / Select by Category

### Existing functionality
[ProfessionalWishlistTab.tsx](apps/front/src/components/modules/ProfessionalDashboard/ProfessionalWishlistTab.tsx)
+ [useProfessionalWishlistTab.ts](apps/front/src/hooks/useProfessionalWishlistTab.ts).
Filters present: search, **category** `select` (`filters.category`), sort,
content-type button row, **price** button row (`filters.price`), **Only with
rating** switch (`filters.onlyWithRating`), **Only with URL** switch
(`filters.onlyWithUrl`).

### Findings
- **Filter state is 100% local component state** (`useState<initialFilters>` in
  the hook), fed into a memoized `queryInput` that becomes GraphQL **variables**
  on `useMyWishlistQuery` ([content-interaction.api.ts:67-80](apps/front/src/lib/rtk/endpoints/content-interaction.api.ts#L67-L80)).
  **No URL query params, no Redux, no persisted state** are involved.
- Therefore **there is no stale-URL or stale-query risk**: removing a control
  removes the field from `queryInput`, and nothing else references it.
- There is **one filter panel**, a responsive `GlassCard` grid — **not** separate
  mobile/desktop implementations. One edit covers both breakpoints.

### Recommendation
Remove, in `ProfessionalWishlistTab.tsx` + `useProfessionalWishlistTab.ts` +
`TProfessionalWishlistFilters` ([hooks.types.ts](apps/front/src/types/hooks.types.ts)):
the price block, both switches, and the category `select`; drop `price`,
`category`, `onlyWithRating`, `onlyWithUrl` from `initialFilters`, `queryInput`,
and `hasActiveFilters`. Keep search, sort, content-type. Backend `myWishlist`
still accepts the removed args (they simply won't be sent) — **leave the backend
untouched** unless the spec later asks to prune the input DTO. Also drop now-unused
constants `priceOptions` and `categories`/`WishlistPriceFilter` imports.

---

## 4. My Learning Activities

**This page is the CPD/PDU Tracker tab**
([ProfessionalCpdPduTrackerTab.tsx](apps/front/src/components/modules/ProfessionalDashboard/ProfessionalCpdPduTrackerTab.tsx),
[useProfessionalCpdPduTracker.ts](apps/front/src/hooks/useProfessionalCpdPduTracker.ts)),
reached at `?tab=cpd-pdu-tracker`. Every element the spec lists exists here:

| Spec element | Where |
| --- | --- |
| Export CSV | `exportCsv()` in the hook — builds CSV client-side, no API |
| Year selector | numeric `<Input value={year}>` → `professionalPduReport({year})` |
| Total PDU Earned / Target / Progress to Goal / Average per Month | 4 `MetricCard`s from `professionalPduReport` (`totalPdus`, `targets`, `progressToGoal`, `averagePerMonth`, `activities`) |
| Quick Actions (Adjust Targets dialog, Add Activity) | `GlassCard` + `TargetForm` dialog + `handleAddActivity` |
| Add Learning Activity | routes to `?tab=add-activity` |
| Refresh | `refetch()` |
| Search toolbar / table filters | [activities-filters.tsx](apps/front/src/components/modules/ProfessionalDashboard/parts/activities-filters.tsx) — **search only** (debounced 350ms) |
| Activities table + edit/delete/download | [activities-table.tsx](apps/front/src/components/modules/ProfessionalDashboard/parts/activities-table.tsx) — 11 columns; edit → `?tab=add-activity&id=`, delete → `ConfirmDialog` + `deleteProfessionalPduActivity`, download → evidence REST |
| PDUs by Category chart | inline `Progress` rows (not a chart) |
| PDUs Over Time chart | `PduOverTimeChart` (Recharts) |

### How the listed data is calculated
- **Total activities completed & logged** — `professionalPduReport.activities`
  (backend `professional-pdu.service.ts`); the table's completion column reads
  `activity.completionStatus` (`COMPLETED`/`INCOMPLETE`).
- **Certificates attached** — there is **no certificate link on an activity**.
  The table's "Certificate" column actually shows **evidence files**
  (`activity.evidenceFiles`, `PDUActivityFile`) via `CertificateCell`. This is a
  naming overload worth flagging (see Risks).
- **Evidence uploaded** — `PDUActivity.evidenceFiles[]` (`PDUActivityFile`
  rows), uploaded through the REST evidence controller.
- **Activity type** — `PDUActivity.source` (`PDUSource` enum).
- **Activity year** — `PDUActivity.reportingYear` (nullable) and/or `date`.
- **Associated certificate** — **not modeled.** `PDUActivity` has
  `relatedCertification: String?` (free text) and `contentType/contentId`, but
  **no relation to `Certificate`.**

### Detail API / route
- **A per-activity detail query already exists:** `professionalPduActivity(id)`
  ([professional.api.ts:189-200](apps/front/src/lib/rtk/endpoints/professional.api.ts#L189-L200)),
  used to hydrate the edit flow.
- **There is no dedicated detail *page/route*** — "view" today means the
  `?tab=add-activity&id=<id>` **edit** form. A read-only "Learning Activity
  detail view" (spec item 5) would be new UI over an existing query.

---

## 5. Certificates

### What exists
- **Data model:** `Certificate`
  ([schema.prisma:1548-1575](apps/api/prisma/schema.prisma#L1548-L1575)) with
  `title, issuer, certificateUrl, verificationCode @unique, contentType/contentId,
  pduEarned, issuedAt, validUntil, status(ACTIVE|EXPIRED|REVOKED)`. `CertificateStatus`
  enum exists.
- **Read API:** `professionalCertificates` query only
  ([professional-certificate.resolver.ts](apps/api/src/modules/professional/resolvers/professional-certificate.resolver.ts) /
  [service](apps/api/src/modules/professional/services/professional-certificate.service.ts)) —
  list + search-by-title + cursor pagination + aggregate counts.
- **Frontend:** the **Certificates tab**
  ([ProfessionalCertificatesTab.tsx](apps/front/src/components/modules/ProfessionalDashboard/ProfessionalCertificatesTab.tsx),
  [useProfessionalCertificate.ts](apps/front/src/hooks/useProfessionalCertificate.ts))
  already exists: stat cards, search, card grid, "Preview/Download" (both just
  open `certificateUrl` in a new tab), and a public verify link.

### What is missing (essentially the entire spec-6/7 certificate feature)
- **No create/upload, edit, or delete mutations** — a repo-wide search for
  `certificate.create` / `upsert` returns **nothing**. The `Certificate` table is
  populated **only by seeders**
  ([professional-dashboard.seed.ts](apps/api/prisma/seeds/professional-dashboard.seed.ts),
  [courses-seed.ts](apps/api/prisma/seeds/courses-seed.ts)); there is no runtime
  path that ever writes a certificate. The tab is effectively **read-only demo
  data** today.
- **No uploaded-file storage for certificates.** `certificateUrl` is a plain
  string; there is no `storageKey`, MIME, or size, and no certificate file
  controller. (The **PDU evidence** upload stack is the reusable precedent — §File
  architecture below.)
- **No CPD-plan linking.** `Certificate` has no relation to `CPDPlan` /
  `CPDPlanCategory` / `PDUActivity`. "Link a certificate to a plan" does not exist.
- **No real status calculation.** `status` is a stored column defaulting to
  `ACTIVE`; nothing recomputes `EXPIRED` from `validUntil`. The tab renders the
  raw stored value.
- **No expiry reminders.** No scheduler, no reminder rows for certificates
  (`CPDReminderTiming` exists only for `CPDPlan`).
- **No detail route, no edit route, no filtering** beyond title search.

### File upload architecture (the reusable precedent — PDU evidence)
[professional-pdu-file.controller.ts](apps/api/src/modules/professional/controllers/professional-pdu-file.controller.ts) +
[service](apps/api/src/modules/professional/services/professional-pdu-file.service.ts) +
[pdu-file.constant.ts](apps/api/src/modules/professional/enums/pdu-file.constant.ts):

- **Transport:** REST (not GraphQL), `@Roles(PROFESSIONAL, ADMIN)`, cookie auth
  under the global guard. Multer `FilesInterceptor` (memory buffer).
- **Supported types:** `pdf, jpg/jpeg, png, doc, docx` (MIME **and** extension
  checked). **Max size:** 20 MB/file, **max 5 files**.
- **Storage provider:** **local disk**, dir `PDU_UPLOAD_DIR` (default
  `uploads/pdu`). Storage name is **server-generated** `randomUUID()+ext`.
- **Private-file access:** download streams with `Content-Disposition: attachment`,
  ownership-scoped by `userId`; path-traversal guarded by `resolveStoragePath`.
  **No signed URLs / no S3** — authenticated streaming only.
- **Cleanup:** delete removes the DB row **and** the blob
  (`removeEvidenceBlobs`). Cascade delete on the activity removes file rows.
- Frontend client: [usePduEvidenceUpload.ts](apps/front/src/hooks/usePduEvidenceUpload.ts)
  (`fetch` with `credentials:"include"`), URL helpers in
  [pdu.constant.ts](apps/front/src/utils/pdu.constant.ts).

A certificate upload feature should **clone this pattern** (a
`CertificateFileController/Service`, `CERT_UPLOAD_DIR`, a `storageKey`/`mimeType`/
`sizeBytes` on a certificate-file model or on `Certificate` itself).

---

## 6. Architecture and Reuse (inventory)

| Need | Reuse |
| --- | --- |
| Dashboard cards | `DashboardStatCard`, `MetricCard`, `GlassCard`, `SnapshotRow` |
| Charts | `@elements/dashboard-charts` (Recharts: over-time, half-pie, by-category) |
| Tooltips | shadcn `@ui/tooltip` (`Tooltip`/`TooltipTrigger`/`TooltipContent`, Radix — used by `ThemeToggle`); charts use Recharts' built-in `<Tooltip />`. No bespoke chart-tooltip component exists. |
| Table | `activities-table.tsx` pattern (desktop table + mobile card fallback) |
| Filters / search | `activities-filters.tsx`; `useDebouncedValue` ([useDebounced.ts](apps/front/src/hooks/useDebounced.ts)) |
| Pagination | `ContentPagination` ([@elements/pagination](apps/front/src/components/elements/pagination.tsx)); cursor-stack pattern in the tracker/certificate hooks |
| Forms | React Hook Form + Zod; existing schemas in `lib/validations` (e.g. `pdu-activity.schema`, `professional-dashboard.ts`); multi-step wizard in `activity-*` parts |
| File upload UI | `activity-evidence-upload.tsx` + `usePduEvidenceUpload` |
| Confirm dialog | `ConfirmDialog` (`@elements/confirm-dialog`) |
| Empty / loading / error states | GlassCard empty blocks + `Loader2` spinners used across every tab |
| Route guards | Role-based dashboard guard (nav via `getDashboardTabsByRole`); API `@Roles()` + global `JwtAuthGuard`/`RolesGuard`/`PasswordChangeGuard` |
| Query/mutation hooks | `professional.api.ts`, `content-interaction.api.ts` (RTK Query, tag invalidation) |
| Toasts | `notify` ([hooks/notify.ts](apps/front/src/hooks/notify.ts)) |
| Secure download | `downloadEvidence` in `usePduEvidenceUpload` (blob fetch → anchor) |
| i18n | `professionalDashboard.*` keys in `en.json`/`fr.json` via `useI18n` |
| Date pickers | No dedicated component found — activities use native inputs. A picker would be new (or reuse native `type="date"`). |

---

## Required audit deliverables

### Relevant files likely to change

**Frontend**
- `utils/dashboard-nav.config.ts` (sidebar removals)
- `components/modules/ProfessionalDashboard/ProfessionalWishlistTab.tsx` +
  `hooks/useProfessionalWishlistTab.ts` + `types/hooks.types.ts` (filter removals)
- `components/modules/ProfessionalDashboard/ProfessionalOverviewTab.tsx` +
  `hooks/useProfessionalOverviewTab.ts` (new six-card layout, extra queries)
- `components/modules/ProfessionalDashboard/ProfessionalCertificatesTab.tsx` +
  `hooks/useProfessionalCertificate.ts` (upload/edit/detail/filter/status/link/download)
- New: certificate upload/edit/detail UI + a certificate-file client hook +
  URL helpers; a Learning Activity detail view; new `lib/validations` schema(s)
- `lib/rtk/endpoints/professional.api.ts` (new certificate mutations/queries)
- `lib/graphql/documents/*.graphql` + regenerated `generated.ts`
- `i18n/en.json`, `i18n/fr.json`
- `components/modules/ProfessionalDashboard/parts/professional-dashboard-shell.tsx`
  (only if detail views become new `?tab=` values)

**Backend**
- `modules/professional/` — new certificate mutations
  (resolver/service/dtos/entities), new certificate **file** controller+service+
  constants (clone of PDU file stack), status recomputation, optional overview
  entity extension.
- `enums/gql-names.enum.ts`, `enums/message-code.enum.ts`, register file.

**Database / storage**
- `apps/api/prisma/schema.prisma` — extend `Certificate` (file metadata:
  `storageKey/mimeType/sizeBytes`, a `source` to distinguish uploaded vs issued,
  maybe `category`/`type`) and add the CPD-plan/activity link relation; **new
  named migration**; regenerate client. New upload dir env var (e.g.
  `CERT_UPLOAD_DIR`).

**Tests**
- **There are no existing tests for any Professional dashboard surface** — the
  only specs cover org-approval/mail/auth/theme (`*.spec.ts` in `modules/{auth,
  mail,organization,admin}`, `*.test.tsx` in front theme/particles). Every test
  here is net-new: certificate upload validation (type/size/ownership),
  status/expiry calculation, plan-linking, wishlist filter removal, Overview card
  rendering states.

### Proposed routes
Given the query-param tab model, prefer `?tab=` values over new route segments
for consistency (decision point — see Risks):
- **Learning Activity detail:** `?tab=activity&id=<id>` (read-only; reuses
  `professionalPduActivity`) — or a real segment `/dashboard/professional/activities/[id]`.
- **Certificate upload:** `?tab=certificates&action=upload` (or a dialog on the
  Certificates tab — recommended, matches the Add-Target dialog pattern).
- **Certificate edit:** `?tab=certificates&id=<id>&action=edit` (or dialog).
- **Certificate detail:** `?tab=certificates&id=<id>` (or dialog) — only if a
  full-page view is wanted beyond the existing card.

### Proposed API changes
- **Reuse:** `professionalCertificates`, `professionalPduActivity`,
  `professionalPduActivities`, `professionalMyRoadmaps`, `professionalPduReport`,
  `professionalOverview`, calendar queries — all already exist.
- **Add (GraphQL):** `createCertificate`, `updateCertificate`,
  `deleteCertificate`, `professionalCertificate(id)` detail, certificate filter
  args (status/date/link); optionally `linkCertificateToPlan` /
  `linkAllActiveCertificates` (see Risks).
- **Add (REST):** certificate file upload/download/delete controller mirroring
  the PDU evidence controller.

### Proposed database changes
- Extend `Certificate` with uploaded-file metadata + an uploaded-vs-issued
  discriminator + optional `category`/`type` for filtering.
- Add a relation `Certificate ↔ CPDPlan` (and/or `CPDPlanCategory` /
  `PDUActivity`) to support linking.
- Consider whether status should be **derived** (`validUntil < now → EXPIRED`) vs
  stored; if stored, a migration/backfill or scheduled recompute is needed.
- New migration + `prisma generate`. Add `@@index` on any new filter columns.

---

## Risks and Ambiguities

1. **"Link All Active" certificate action — undefined.** The spec calls this out
   explicitly and it is the biggest ambiguity. There is **no** certificate↔plan
   (or ↔activity) relation today, so "link all active" has no target semantics.
   Open questions: link *which* certificates (all `status=ACTIVE`?) to *what*
   (the active `CPDPlan`? a category? create `PDUActivity` rows from them?); is
   it idempotent; what happens to already-linked or expired ones; is it one
   mutation or per-item. **Recommend a product decision before design.**
2. **"Certificate" vs "evidence" naming overload.** The activities table's
   "Certificate" column shows PDU **evidence files**, and activities have no real
   certificate relation. If the spec's "associated certificate" means the new
   uploaded certificates, a **new link** must be designed; if it means evidence,
   only a rename is needed. Clarify.
3. **Certificates today are seed-only demo data.** No runtime writes a
   `Certificate`. Building upload/edit turns a display-only tab into a real CRUD
   feature — larger than "modify UI." Confirm scope (Phase 2+ likely).
4. **Status is not computed.** If the spec expects EXPIRED to reflect
   `validUntil`, decide derived-vs-stored + who recomputes (query-time vs cron).
5. **Expiry reminders** need a scheduler that does not exist for certificates.
   Confirm whether reminders are in scope now or deferred.
6. **Routing convention.** Everything is `?tab=` on one page. New detail/upload
   views should either follow that (recommended) or introduce real nested routes
   — a consistency decision to make up front, and it affects the shell + guards.
7. **Overview "Recommendations for You"** is currently a generic course list, not
   personalized. Confirm whether true personalization is required or the generic
   list is acceptable.
8. **Removing wishlist/sidebar UI leaves backend capability in place.** Low risk
   (dead but harmless input args / unreachable-by-nav tabs). Confirm the spec
   wants UI-only removal, not backend/DTO pruning.
9. **File storage is local disk, not object storage.** Fine for dev; certificate
   uploads inherit the same non-durable, non-signed-URL constraint as PDU
   evidence. Flag if production durability is expected.

## STOP
Audit only. No implementation performed, per the Phase 1 spec.
