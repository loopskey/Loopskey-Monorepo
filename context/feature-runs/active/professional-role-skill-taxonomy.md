# professional-role-skill-taxonomy

- Spec: `context/features/professional-role-skill-taxonomy.md`
- Scope: `full`
- Model: `High reasoning — taxonomy data migration with backfill, indexed search, new GraphQL contract and three consumers (onboarding, profile, roadmap).`
- Branch: `feature/professional-role-skill-taxonomy`
- Base: `295bcb8ebaafd7031cab8654f8845369d7bd82e7`
- Status: `Ready`

## Acceptance

- [x] The normalized seed contains exactly 37 role groups/710 roles and 47 skill groups/713 skills from the workbook.
- [x] No `Other – ...` or `Other (type your own)` marker is stored as a selectable term.
- [x] Opening either onboarding step does not download or render the full role and skill catalogues.
- [x] A user can browse by category, search globally, paginate/load more, select, clear, and retry failed reads with keyboard or pointer.
- [x] Search text is not persisted as a role until a canonical result or explicit custom-role action is confirmed.
- [x] Canonical role completion stores a valid ROLE id and label snapshot; custom role completion stores text with a null term id.
- [x] Skill suggestions come from explicit mapped skill groups; current `COMMON`-group fallback behavior is removed.
- [x] The combined skills-to-improve selection cannot exceed three and inactive/wrong-kind ids are rejected atomically.
- [x] Profile Details, Profile Skills, Onboarding, and Roadmap use the same database taxonomy source without unbounded all-kind reads.
- [x] Existing referenced terms and custom current-role text remain readable after migration and repeated seeds are idempotent.
- [x] English and French UI states are complete; canonical taxonomy labels use documented English fallback.

## Decisions

- The workbook is committed as the importer's input under `apps/api/prisma/seeds/data/` (not `apps/front/public`): the spec forbids runtime reads, and a public copy would be downloadable by anyone. The committed `profile-taxonomy.catalog.json` is generated from it; a spec fails if they diverge.
- Production runs `migrate deploy` only, so the catalogue ships as data inside migration `20260927120000_profile_taxonomy_catalogue` (hand-written; `migrate diff` wanted to drop 40 trigram indexes). The seed applies the same rows idempotently; seeding after the migration changes nothing.
- `groupKey`/`groupLabel` are dropped from `ProfileTaxonomyTerm`; categories are `ProfileTaxonomyGroup` rows. The GraphQL term still exposes `groupKey`/`groupLabel`, now read from the group.
- Migration report: all 16 legacy roles and 17 of 32 legacy skills map onto catalogue keys and keep their ids. 15 legacy skills (Software Engineering, Data & Analytics, Cloud & Infrastructure, Cybersecurity, Artificial Intelligence, Quality & Testing, Finance & Accounting, Operations, Agile Delivery, Budgeting & Cost Control, Scheduling, Health & Safety, Privacy & Data Protection, Professional Ethics, UX Research) become inactive; 4 legacy skill groups and the `COMMON` role group become inactive. Nothing is deleted.
- `currentRoleTermId` is backfilled only for a unique case-insensitive exact match, and the label is normalised to the canonical one.
- Role-to-skill mapping v1 is explicit (145 links, 3–5 skill categories per role category). Suggestions interleave the mapped categories in priority order; unmapped or custom roles get popular skills with `isFallback: true`.
- `professionalProfileTaxonomy` now requires `kind` and serves `SUBJECT` only; roles and skills go through `professionalTaxonomyCategories`, `professionalTaxonomyTerms` (cursor, max 50), `professionalTaxonomyTermsByIds` (max 50, inactive included) and `professionalSkillSuggestions`.
- Roadmap ranks a bounded role candidate set (trigram similarity + containment on the target role, the current role's category, the three categories most mapped from the professional's skills, and any id the AI proposes) instead of loading all roles; its role search uses the server query.
- Queries live on the existing `ProfessionalProfileResolver` rather than a new resolver, so the module-boundary exception list is not widened.
- The skill selector toggles through the owner's current state (`onToggle`), not a rendered array: the browser check caught rapid clicks keeping only the last pick in the first version.

## Verification

- `npm run taxonomy:import --workspace api` — pass (37/710 roles, 47/713 skills)
- Migration on a pre-feature database with legacy seed data and sample profiles — pass (terms, groups, 145 mappings, exact-match backfill, retired terms still referenced); `migrate diff` residual drift only the three pre-existing hand-written indexes
- Seed after migration produced an identical state; a second seed changed nothing — pass
- `npm run test --workspace api` — pass (133 suites, 1605 tests)
- `npm run test:e2e --workspace api` on isolated PostgreSQL 16 — pass (26 suites, 191 tests), including the new `professional-taxonomy` suite
- `EXPLAIN (ANALYZE, BUFFERS)`: at real volume (1,467 rows) the planner picks a 33-buffer seq scan (1.2 ms); with `enable_seqscan = off` and at ~104,000 rows it uses a Bitmap Index Scan on `ProfileTaxonomyTerm_label_trgm_idx` (3.1 ms)
- `npm run lint` — pass; `npm run check-types` — pass; `npm run build` — pass; `npm run codegen --workspace front` — pass
- `npm run bundle-report --workspace front` — pass; `/onboarding/professional` +11.8 KB, `/dashboard/professional` +3.4 KB
- Browser (Chrome, local API + isolated DB, FR and EN): category browse, lazy load and load-more (20 → 40 of 49), global search with highlighting, too-short hint, no-result copy, keyboard selection with focus kept, custom-role validation, mapped suggestions, three-skill limit, completion saved as canonical id + label, profile role switch to custom text, profile skills hydration and save, error then retry with the API stopped and restarted, 375 px without horizontal overflow or sub-36 px targets; category payload 5.7 KB
- Not covered: other browsers and zoom levels; a forced stale-response race in the browser (guarded by per-request tickets, not reproduced); server-side caching of category summaries (no existing API cache convention; RTK caches on the client)

## Submission

- Commit:
- PR:
- CI:
