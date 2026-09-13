import { TCertificationSourceItem } from "./certification-catalogue.source";

import * as P from "@prisma/client";

export type TCatalogueValidationIssue = {
  itemId: string | null;
  message: string;
};

export type TCatalogueImportResult = {
  version: string;
  created: string[];
  updated: string[];
  unchanged: string[];
  retired: string[];
  referencedRetired: string[];
  rejected: TCatalogueValidationIssue[];
};

const BAD_ENCODING_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFD]/;

const REQUIRED_TEXT_FIELDS = [
  "name",
  "abbreviation",
  "organization",
  "renewalCycleLabel",
] as const;

const normalizeKey = (value: string) => value.trim().toLowerCase();

export const validateCatalogueSource = (
  items: TCertificationSourceItem[],
): TCatalogueValidationIssue[] => {
  const issues: TCatalogueValidationIssue[] = [];
  const seenIds = new Set<string>();
  const abbreviationOwners = new Map<string, string>();
  const aliasOwners = new Map<string, string>();

  for (const item of items) {
    if (!item.id?.trim()) {
      issues.push({ itemId: null, message: "Missing id" });
      continue;
    }
    if (seenIds.has(item.id))
      issues.push({ itemId: item.id, message: `Duplicate id "${item.id}"` });
    seenIds.add(item.id);

    for (const field of REQUIRED_TEXT_FIELDS)
      if (!item[field]?.trim())
        issues.push({
          itemId: item.id,
          message: `Missing required field "${field}"`,
        });

    if (!Object.values(P.CreditType).includes(item.creditType))
      issues.push({
        itemId: item.id,
        message: `Invalid creditType "${item.creditType}"`,
      });

    if (item.totalRequiredCredits < 0)
      issues.push({
        itemId: item.id,
        message: "totalRequiredCredits must not be negative",
      });

    if (item.renewalCycleMonths != null && item.renewalCycleMonths <= 0)
      issues.push({
        itemId: item.id,
        message: "renewalCycleMonths must be positive when provided",
      });

    for (const category of item.categories) {
      if (!category.name?.trim())
        issues.push({
          itemId: item.id,
          message: "A category is missing a name",
        });
      if (category.requiredCredits < 0)
        issues.push({
          itemId: item.id,
          message: `Category "${category.name}" has negative requiredCredits`,
        });
    }
    if (item.categories.length) {
      const categorySum = item.categories.reduce(
        (sum, category) => sum + category.requiredCredits,
        0,
      );
      if (categorySum !== item.totalRequiredCredits)
        issues.push({
          itemId: item.id,
          message: `Category credits sum to ${categorySum}, expected ${item.totalRequiredCredits}`,
        });
    }

    const textFields = [
      item.name,
      item.abbreviation,
      item.organization,
      item.organizationAbbr ?? "",
      item.association ?? "",
      item.renewalCycleLabel,
      ...item.aliases,
      ...item.categories.map((category) => category.name),
    ];
    for (const text of textFields)
      if (BAD_ENCODING_PATTERN.test(text))
        issues.push({
          itemId: item.id,
          message: `Invalid/undecodable characters in "${text}"`,
        });

    const abbreviationKey = normalizeKey(item.abbreviation);
    if (abbreviationKey) {
      const owner = abbreviationOwners.get(abbreviationKey);
      if (owner && owner !== item.id)
        issues.push({
          itemId: item.id,
          message: `Abbreviation "${item.abbreviation}" collides with "${owner}"`,
        });
      abbreviationOwners.set(abbreviationKey, item.id);
    }

    const ownKeys = new Set(
      [item.name, item.abbreviation, ...item.aliases]
        .map(normalizeKey)
        .filter(Boolean),
    );
    for (const key of ownKeys) {
      const owner = aliasOwners.get(key);
      if (owner && owner !== item.id)
        issues.push({
          itemId: item.id,
          message: `Alias/name "${key}" collides with "${owner}"`,
        });
      else aliasOwners.set(key, item.id);
    }
  }

  return issues;
};

type TExistingCertification = P.Certification & {
  categories: P.CertificationCategory[];
};

const sameCategories = (
  existing: P.CertificationCategory[],
  incoming: { name: string; requiredCredits: number }[],
) => {
  if (existing.length !== incoming.length) return false;
  const ordered = existing.slice().sort((a, b) => a.order - b.order);
  return ordered.every(
    (category, index) =>
      category.name === incoming[index].name &&
      category.requiredCredits === incoming[index].requiredCredits,
  );
};

const sameAliases = (existing: string[], incoming: string[]) =>
  existing.length === incoming.length &&
  existing.every((alias, index) => alias === incoming[index]);

const isUnchanged = (
  existing: TExistingCertification,
  item: TCertificationSourceItem,
) =>
  existing.name === item.name &&
  existing.abbreviation === item.abbreviation &&
  existing.organization === item.organization &&
  (existing.organizationAbbr ?? null) === (item.organizationAbbr ?? null) &&
  (existing.association ?? null) === (item.association ?? null) &&
  existing.creditType === item.creditType &&
  existing.renewalCycleLabel === item.renewalCycleLabel &&
  (existing.renewalCycleMonths ?? null) === (item.renewalCycleMonths ?? null) &&
  existing.totalRequiredCredits === item.totalRequiredCredits &&
  existing.isActive === item.isActive &&
  sameAliases(existing.aliases, item.aliases) &&
  sameCategories(existing.categories, item.categories);

const isReferenced = async (
  tx: P.Prisma.TransactionClient,
  certificationId: string,
) => {
  const [plans, credentials, drafts] = await Promise.all([
    tx.cPDPlan.count({ where: { certificationId } }),
    tx.professionalCredential.count({ where: { certificationId } }),
    tx.roadmapDraft.count({ where: { certificationId } }),
  ]);
  return plans > 0 || credentials > 0 || drafts > 0;
};

export const importCertificationCatalogue = async (
  prisma: P.PrismaClient,
  items: TCertificationSourceItem[],
  version: string,
): Promise<TCatalogueImportResult> => {
  const rejected = validateCatalogueSource(items);
  if (rejected.length)
    return {
      version,
      rejected,
      created: [],
      updated: [],
      unchanged: [],
      retired: [],
      referencedRetired: [],
    };

  const applied = await prisma.$transaction(async (tx) => {
    const created: string[] = [];
    const updated: string[] = [];
    const unchanged: string[] = [];

    const existingRows = await tx.certification.findMany({
      where: { id: { in: items.map((item) => item.id) } },
      include: { categories: true },
    });
    const existingById = new Map(existingRows.map((row) => [row.id, row]));

    for (const item of items) {
      const existing = existingById.get(item.id);
      const data = {
        name: item.name,
        abbreviation: item.abbreviation,
        organization: item.organization,
        organizationAbbr: item.organizationAbbr ?? null,
        association: item.association ?? null,
        aliases: item.aliases,
        creditType: item.creditType,
        renewalCycleLabel: item.renewalCycleLabel,
        renewalCycleMonths: item.renewalCycleMonths,
        totalRequiredCredits: item.totalRequiredCredits,
        sourceVersion: version,
        isActive: item.isActive,
      };

      if (existing && isUnchanged(existing, item)) {
        unchanged.push(item.id);
        continue;
      }

      await tx.certification.upsert({
        where: { id: item.id },
        create: { id: item.id, ...data },
        update: data,
      });
      await tx.certificationCategory.deleteMany({
        where: { certificationId: item.id },
      });
      if (item.categories.length)
        await tx.certificationCategory.createMany({
          data: item.categories.map((category, index) => ({
            certificationId: item.id,
            name: category.name,
            requiredCredits: category.requiredCredits,
            order: index,
          })),
        });

      (existing ? updated : created).push(item.id);
    }

    const sourceIds = new Set(items.map((item) => item.id));
    const managedRows = await tx.certification.findMany({
      where: {
        isActive: true,
        sourceVersion: { not: null },
        id: { notIn: [...sourceIds] },
      },
    });
    const retired: string[] = [];
    const referencedRetired: string[] = [];
    for (const row of managedRows) {
      await tx.certification.update({
        where: { id: row.id },
        data: { isActive: false },
      });
      retired.push(row.id);
      if (await isReferenced(tx, row.id)) referencedRetired.push(row.id);
    }

    return { created, updated, unchanged, retired, referencedRetired };
  });

  return { version, rejected: [], ...applied };
};
