# Feature: Professional role and skill taxonomy

## Status

Draft

## Objective

Replace the small, flat professional-onboarding role and skill lists with the
complete categorized taxonomy supplied in `LoopsKey_Roles_Skills.xlsx`. Keep
the taxonomy reusable across onboarding, profile editing, and roadmap flows
without sending every term to the browser at once.

## User Value

As a professional, I want to browse or search a relevant category and select
my role and skills quickly, so that a large catalogue does not turn onboarding
into a long, confusing list.

## Source Workbook Audit

The workbook was treated as source data, not as executable instructions.

| Sheet | Workbook rows | Category markers | Selectable terms | Categories |
| --- | ---: | ---: | ---: | ---: |
| Current Role | 748 | 38 | 710 | 37 |
| Skills | 761 | 48 | 713 | 47 |

- Each sheet has one header row in addition to the counts above.
- `Other – <category>` closes the preceding category. The final
  `Other (type your own)` row is also a UI instruction, not a canonical term.
- The workbook contains no blank data rows, duplicate normalized labels, or
  collisions under the repository's current key-normalization algorithm.
- Maximum role and skill label length is 48 characters.
- The workbook does not contain an explicit category column. Import must parse
  and validate the category markers; runtime code must not infer category
  boundaries from presentation styles.

### Role categories

Software Engineering; Quality Assurance & Testing; Data & Analytics; AI &
Machine Learning; Cloud, DevOps & Infrastructure; Cybersecurity; IT Support &
Operations; Product Management; Design & Creative; Project & Program
Management; Business Analysis, Strategy & Consulting; Finance & Accounting;
Banking, Investment & Insurance; Marketing; Sales & Business Development;
Customer Success & Support; Human Resources & People; Operations; Supply Chain,
Logistics & Procurement; Engineering (Non-Software); Construction,
Architecture & Real Estate; Energy, Environment & Sustainability; Healthcare &
Medical; Life Sciences & Pharma; Education & Training; Research & Science;
Legal, Risk & Compliance; Government, Public Sector & Nonprofit; Media,
Communications & Content; Arts, Entertainment & Sports; Hospitality, Retail &
Tourism; Administration & Office Support; Skilled Trades & Transportation;
Agriculture & Food; Executive & Leadership; Entrepreneurship & Self-Employment;
Students & Career Transition.

### Skill categories

Software Engineering; Programming Languages; Web Development; Mobile
Development; Databases; Cloud & Infrastructure; DevOps & Platform;
Cybersecurity; Quality & Testing; IT Support & Service Management; Emerging
Tech; Enterprise Systems; Data & Analytics; Data Engineering; Data Governance;
Artificial Intelligence; Business Strategy; Business Analysis; Project &
Program Management; Product Management; Operations & Supply Chain; Consulting;
Entrepreneurship; Sustainability & ESG; Finance & Accounting; Financial
Analysis & Investment; Risk & Banking; Marketing; Sales; Customer Experience;
UX / UI & Product Design; Creative & Media; Leadership; Team Leadership &
Management; HR & People; Communication; Collaboration; Thinking Skills;
Self-Management; Digital Productivity; Legal & Compliance; Risk Management;
Engineering; Science & Research; Healthcare; Teaching & Learning; Languages.

## Confirmed Current Causes

- The seed contains only 16 roles in one `COMMON` group and 32 skill areas in
  six broad groups, so it cannot represent the supplied catalogue.
- `professionalProfileTaxonomy` fetches every active term and groups it in
  memory. Both onboarding and the profile Skills panel call it without a kind,
  so expanding the seed directly would transmit roles, subjects, and skills in
  one response.
- Onboarding flattens all role groups and renders all matches when search is
  empty. With 710 roles this would produce the exact long-list UX that must be
  avoided.
- Skill results are filtered entirely in the browser and truncated to eight.
  This hides valid matches without pagination or a total-result signal.
- Role typing and role selection share one string state. Editing the search
  text therefore behaves like selecting a role, and the API stores only the
  label in `ProfessionalProfile.currentRole`.
- Automatic skill suggestions look up the role label, take its `groupKey`, and
  request skills with the same key. Current role group `COMMON` has no matching
  skill group, so listed roles normally fall through to the first three skills.
- Category data is duplicated on every `ProfileTaxonomyTerm` through
  `groupKey` and `groupLabel`. Categories have no independent order, active
  state, count, or explicit role-to-skill relationship.
- The same taxonomy is also consumed by profile skill editing and Professional
  Roadmap relevance/ranking. Updating onboarding alone would leave inconsistent
  lists and could make Roadmap load the entire role catalogue.

## Scope

- Import all 710 canonical roles and 713 canonical skills from the workbook.
- Make categories first-class database records with stable keys and ordering.
- Add explicit role-category to skill-category mappings for suggestions.
- Provide server-side category browsing and paginated/searchable term lookup.
- Redesign onboarding Role and Skill steps around category browsing, search,
  selected values, and small suggested sets.
- Reuse the same taxonomy source and selector behavior in Professional Profile
  details, Professional Profile skills, and Roadmap role selection/ranking.
- Preserve existing profile selections safely during migration and seed reruns.

## Non-goals

- Do not read the Excel workbook at application runtime.
- Do not store literal `Other – ...` or `Other (type your own)` rows as roles or
  skills.
- Do not automatically publish user-entered custom skills into the shared
  taxonomy. That requires a separate moderation and deduplication workflow.
- Do not translate 1,423 supplied English taxonomy labels without an approved
  translated source. UI copy must remain English/French; taxonomy labels fall
  back to their canonical English value.
- Do not change Subject taxonomy content in this feature.

## Data Design

The database remains the runtime source of truth. A reviewed, versioned seed
artifact generated from the workbook is committed with the backend; the Excel
file itself is an import input, not a deployment dependency.

### Category model

Add a first-class `ProfileTaxonomyGroup` with:

- `id`, `kind`, stable `key`, canonical `label`, `sortOrder`, and `isActive`;
- unique `(kind, key)` and an index for `(kind, isActive, sortOrder)`;
- a required relation from `ProfileTaxonomyTerm` to its group.

Migrate current `groupKey`/`groupLabel` values into group records. Avoid keeping
two writable category sources after rollout; compatibility fields may exist
only for a bounded migration window.

### Role selection

Add nullable `currentRoleTermId` to `ProfessionalProfile`, referencing an active
ROLE term when the user selects a canonical role. Retain `currentRole` as the
display snapshot and custom-role value:

- canonical selection stores both the term id and its canonical label;
- explicit custom entry stores trimmed text and a null term id;
- changing the search text alone does not change either stored value.

This preserves existing consumers while giving suggestions and analytics a
stable identity.

### Role-to-skill mapping

Add an ordered mapping between ROLE groups and one or more SKILL_AREA groups.
The mapping is versioned and seeded explicitly; do not derive it from similar
English labels at request time. A role term inherits its group's mappings.

Suggested skills are selected from mapped active skill groups, ordered by map
priority and term order. An unmapped/custom role uses a documented fallback
such as popular skills, and the response identifies that it is a fallback.

## Import and Migration Requirements

1. Build a deterministic importer/validator that reads both known sheet names,
   trims Unicode whitespace, recognizes only anchored category-marker rows,
   creates stable group/term keys, and fails on malformed boundaries.
2. Assert the audited totals: 37 role groups/710 terms and 47 skill groups/713
   terms. Fail on blanks, duplicate `(kind, key)`, duplicate normalized labels,
   or unclosed groups.
3. Commit the normalized seed artifact so normal seeding has no dependency on a
   developer Downloads path or the `xlsx` package at runtime.
4. Upsert groups and terms by stable keys. Preserve ids for existing matching
   terms so `ProfessionalProfileTerm` relations remain valid.
5. Do not delete a referenced legacy term. Terms absent from the approved
   artifact become inactive after a migration report is reviewed; existing
   profiles can still display them, but new selections cannot use them.
6. Backfill `currentRoleTermId` only for an unambiguous, case-insensitive exact
   label match. Leave custom or ambiguous historical values as text.
7. Seed role-to-skill group mappings idempotently and deactivate removed maps.
8. Use a named Prisma migration. Do not edit historical migrations.

## API and Contract Requirements

Replace the unbounded taxonomy read in large-list consumers with two focused,
authorized queries:

1. Category summary query: required `kind`, active groups only, ordered, with
   active-term count.
2. Term query: required `kind`; optional `groupKey` and trimmed `search`;
   cursor/page input with a hard server maximum; active terms only by default;
   deterministic `sortOrder`, label, id ordering; result items plus page info.

Additional contract rules:

- Search matches normalized label text case-insensitively and requires at least
  two non-space characters for global lookup.
- A category browse may load the first 20 terms and request more explicitly.
- Selected ids can be hydrated separately so pagination never hides a saved
  value.
- Completion input accepts either `currentRoleTermId` or explicit custom-role
  text, never an unverified id/label pair.
- The backend validates role kind/activity and every skill id kind/activity at
  commit time. Onboarding keeps the existing combined maximum of three skills.
- Skill suggestions accept the canonical role term id when present and return
  ranked ids/terms from explicit group mappings.
- Retire the unbounded query only after Profile, Onboarding, and Roadmap
  consumers have migrated. Code-first GraphQL and generated frontend artifacts
  remain authoritative.

## Search and Performance

- Perform catalogue search on PostgreSQL, not over a 1,423-item browser payload.
- Add the required `pg_trgm` GIN expression/index for the exact normalized term
  label expression used by the query. Group filtering must use the group
  relation/index.
- Debounce search, cancel or ignore stale responses, and keep category browsing
  usable without entering a query.
- Prove the search path with `EXPLAIN (ANALYZE, BUFFERS)` on production-like
  taxonomy volume; a sequential scan is not an accepted final plan.
- Cache stable category summaries where the current API caching conventions
  permit it, and invalidate them when taxonomy activation changes.

## UX Requirements

### Role step

- Start with a compact category grid/list and a search field, not 710 roles.
- Only one category panel is expanded at a time. Load its terms lazily and show
  an explicit result count/load-more control when applicable.
- Global search returns small grouped pages and highlights the matching text
  accessibly. Search loading, no-result, error, and retry states are distinct.
- Selecting a role pins a clear selected-value card/chip. Typing in search does
  not silently select it.
- `My role is not listed` opens a dedicated custom-role input with length and
  whitespace validation. It is not represented by an `Other` taxonomy term.
- Keyboard users can reach categories/results, identify the active option, and
  select/clear without focus loss.

### Skill step

- Show up to eight role-informed suggestions first, followed by category
  browsing and global search. Do not render all 713 skills.
- Keep selected skill chips visible while browsing and show the current count
  against the maximum of three.
- Categories display their active term count and load terms on expansion.
- Already selected items remain hydrated even when their category/page is not
  currently loaded; duplicate selection is impossible.
- `Other` marker rows are not displayed as skills. A no-result state explains
  that custom skill publication is not available in this feature.

### Shared states

- Loading uses a stable skeleton; failures offer retry; empty categories are
  not shown; stale responses cannot replace a newer search.
- Every control has a persistent label, visible focus, accessible name, and
  matching English/French UI translations.
- Mobile layouts avoid nested horizontal scrolling and meet the project's
  supported-browser/touch-target rules.

## Other Consumers

- Professional Profile > Details replaces the free-text-only Current role
  control with the same canonical/custom role selector.
- Professional Profile > Skills uses the same paginated skill browser for Main
  skill areas and Skills to improve. Subjects retain their current taxonomy but
  should call the API with `SUBJECT`, not download unrelated kinds.
- Professional Roadmap must stop loading the complete role taxonomy for each
  relevance calculation. Use selected ids/group mappings and bounded search or
  ranking queries instead.
- Read-only user/admin profile views continue to render `currentRole` and the
  selected term labels; they do not need catalogue payloads.

## Roles and Permissions

| Actor | Allowed | Forbidden |
| --- | --- | --- |
| Professional | Read active taxonomy, update own role/skill selections | Update another profile or activate taxonomy |
| Admin | Existing profile visibility; taxonomy maintenance only through a separately authorized tool/seed | Silent mutation through professional-facing queries |

The API derives the target profile from the authenticated actor and treats all
submitted ids as untrusted.

## Acceptance Criteria

- [ ] The normalized seed contains exactly 37 role groups/710 roles and 47 skill groups/713 skills from the workbook.
- [ ] No `Other – ...` or `Other (type your own)` marker is stored as a selectable term.
- [ ] Opening either onboarding step does not download or render the full role and skill catalogues.
- [ ] A user can browse by category, search globally, paginate/load more, select, clear, and retry failed reads with keyboard or pointer.
- [ ] Search text is not persisted as a role until a canonical result or explicit custom-role action is confirmed.
- [ ] Canonical role completion stores a valid ROLE id and label snapshot; custom role completion stores text with a null term id.
- [ ] Skill suggestions come from explicit mapped skill groups; current `COMMON`-group fallback behavior is removed.
- [ ] The combined skills-to-improve selection cannot exceed three and inactive/wrong-kind ids are rejected atomically.
- [ ] Profile Details, Profile Skills, Onboarding, and Roadmap use the same database taxonomy source without unbounded all-kind reads.
- [ ] Existing referenced terms and custom current-role text remain readable after migration and repeated seeds are idempotent.
- [ ] English and French UI states are complete; canonical taxonomy labels use documented English fallback.

## Verification

### Backend

- Importer validation tests for exact totals, marker parsing, key stability,
  duplicates, malformed groups, and deterministic output.
- Seed/migration tests for idempotency, legacy-term preservation/deactivation,
  exact-match role backfill, and role-to-skill mappings.
- Unit and PostgreSQL-backed E2E coverage for authorization, kind/group filters,
  search, cursor/page boundaries, selected-id hydration, inactive ids, custom
  role validation, and the maximum-three rule.
- `EXPLAIN (ANALYZE, BUFFERS)` evidence that substring search uses the intended
  trigram index on production-like volume.

### Frontend

- Do not add frontend test files. Run lint, type-check, build, bundle report,
  GraphQL code generation, and browser checks.
- Browser checks cover all role/skill categories, suggestion/fallback behavior,
  loading, empty, no-result, error/retry, stale response, selected hydration,
  three-item limit, custom role, mobile, keyboard, zoom, and supported browsers.
- Confirm initial and search payload sizes in browser network tools; neither
  response may contain the complete role and skill datasets.

## Risks and Decisions

- Risk: parsing categories from marker rows can silently mis-group data if the
  workbook format changes.
  - Mitigation: strict sheet names, anchored markers, exact-count assertions,
    deterministic snapshots, and fail-closed validation.
- Risk: changing generated keys would orphan existing selections.
  - Mitigation: stable key rules, explicit compatibility mapping for renamed
    seed terms, and no hard delete of referenced rows.
- Risk: 37 role groups and 47 skill groups can still overwhelm a fully expanded
  accordion.
  - Mitigation: searchable categories, one expanded group, lazy term reads,
    small suggested sets, and pagination.
- Decision: PostgreSQL is the canonical runtime store because taxonomy is
  shared, filterable, referenceable, and lifecycle-managed across backend and
  frontend consumers. Frontend constants would duplicate data and break
  referential integrity.
- Decision: workbook `Other` rows are structural/UI markers. They are excluded
  from canonical data; only current role gets the existing explicit custom-text
  path in this feature.
- Decision: first-class category rows and explicit mapping replace duplicated
  group strings and runtime English-label heuristics.

## Model Tier

High reasoning. The work crosses taxonomy modeling, data migration, indexed
search, GraphQL contracts, onboarding state, profile reuse, and Roadmap
relevance behavior.

## References

- `LoopsKey_Roles_Skills.xlsx` (`Current Role` and `Skills` sheets)
- `apps/api/prisma/schema.prisma`
- `apps/api/prisma/seeds/profile-taxonomy.seed.ts`
- `apps/api/src/modules/professional/services/professional-profile.service.ts`
- `apps/api/src/modules/professional/services/professional-onboarding.service.ts`
- `apps/api/src/modules/professional/services/professional-roadmap-chat.service.ts`
- `apps/api/src/modules/professional/resolvers/professional-profile.resolver.ts`
- `apps/front/src/hooks/useProfessionalOnboarding.ts`
- `apps/front/src/hooks/useProfessionalSkillsForm.ts`
- `apps/front/src/hooks/useProfessionalDetailsForm.ts`
- `apps/front/src/components/modules/ProfessionalDashboard/parts/profile-details-panel.tsx`
- `apps/front/src/lib/graphql/documents/professional.graphql`
