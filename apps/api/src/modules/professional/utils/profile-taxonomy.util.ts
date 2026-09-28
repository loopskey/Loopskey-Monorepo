import { Prisma } from "@prisma/client";

export const TAXONOMY_TERM_SELECT = {
  id: true,
  kind: true,
  key: true,
  label: true,
  sortOrder: true,
  isActive: true,
  group: { select: { id: true, key: true, label: true } },
} satisfies Prisma.ProfileTaxonomyTermSelect;

export type TaxonomyTermRow = Prisma.ProfileTaxonomyTermGetPayload<{
  select: typeof TAXONOMY_TERM_SELECT;
}>;

export const TAXONOMY_TERM_ORDER = [
  { sortOrder: "asc" },
  { label: "asc" },
  { id: "asc" },
] satisfies Prisma.ProfileTaxonomyTermOrderByWithRelationInput[];

export const toTaxonomyTerm = ({ group, ...term }: TaxonomyTermRow) => ({
  ...term,
  groupId: group.id,
  groupKey: group.key,
  groupLabel: group.label,
});

export type TaxonomyTerm = ReturnType<typeof toTaxonomyTerm>;

export const normalizeTaxonomySearch = (value: string | null | undefined) =>
  (value ?? "").replace(/\s+/g, " ").trim();
