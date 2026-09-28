# Professional role and skill taxonomy

Roles and skills live in PostgreSQL: `ProfileTaxonomyGroup` (categories),
`ProfileTaxonomyTerm` (selectable terms) and `ProfileTaxonomyGroupMapping`
(which skill categories a role category suggests). The application never reads
the workbook at runtime.

## Where the data comes from

| File | Role |
| --- | --- |
| `prisma/seeds/data/LoopsKey_Roles_Skills.xlsx` | Approved source workbook (`Current Role` and `Skills` sheets) |
| `prisma/seeds/profile-taxonomy-import.ts` | Strict parser: anchored `Other – <category>` markers close a category, `Other (type your own)` ends the sheet, and blanks, duplicates, key collisions or unclosed categories fail the import |
| `prisma/seeds/data/profile-taxonomy.catalog.json` | Normalised catalogue generated from the workbook and committed |
| `prisma/seeds/profile-taxonomy-mapping.ts` | Versioned role-category to skill-category mapping, in priority order |
| `prisma/seeds/profile-taxonomy.seed.ts` | Idempotent seed that applies the catalogue and mapping |

Production applies migrations, not seeds, so each approved catalogue also ships
as data in a migration (`20260927120000_profile_taxonomy_catalogue` for
version 1). `profile-taxonomy-import.spec.ts` fails if the committed catalogue
no longer matches the workbook, if the mapping names an unknown category, or if
the migration is missing a catalogue row.

## Changing the catalogue

1. Replace the workbook and run `npm run taxonomy:import --workspace api`. The
   import stops with the offending row if the workbook is malformed.
2. Update `EXPECTED_TAXONOMY_TOTALS` only when the new totals are the approved
   ones, and bump `PROFILE_TAXONOMY_CATALOG_VERSION`.
3. Review the catalogue diff. Keys derive from labels, so renaming a label
   creates a new term; existing selections keep pointing at the old one.
4. Author a new migration that upserts the changed groups and terms by
   `(kind, key)` and deactivates removed ones. Never delete a term: profiles
   that chose it still display it, but it can no longer be selected.
5. Update the mapping for new role categories and bump
   `ROLE_SKILL_MAPPING_VERSION`.

## Search

Term search is `ILIKE '%term%'` on `label`, backed by the unmanaged
`ProfileTaxonomyTerm_label_trgm_idx` GIN index. At today's volume (about 1,500
terms) PostgreSQL correctly prefers a sequential scan of roughly 33 buffers;
with `enable_seqscan = off`, and at about 100,000 rows without it, the plan is a
Bitmap Index Scan on that index.
