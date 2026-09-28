import { ProfileTaxonomyKind } from "@prisma/client";
import { createHash } from "crypto";
import { readFileSync } from "fs";

import * as ExcelJS from "exceljs";

export type TImportedTaxonomyKind =
  | typeof ProfileTaxonomyKind.ROLE
  | typeof ProfileTaxonomyKind.SKILL_AREA;

export type TCatalogTerm = { key: string; label: string; sortOrder: number };

export type TCatalogGroup = {
  key: string;
  label: string;
  sortOrder: number;
  terms: TCatalogTerm[];
};

export type TProfileTaxonomyCatalog = {
  version: number;
  source: { file: string; sha256: string };
  roles: TCatalogGroup[];
  skills: TCatalogGroup[];
};

export const PROFILE_TAXONOMY_CATALOG_VERSION = 1;

export const TAXONOMY_WORKBOOK_FILE = "LoopsKey_Roles_Skills.xlsx";

export const TAXONOMY_SHEETS = {
  [ProfileTaxonomyKind.ROLE]: { sheet: "Current Role", header: "Current Role" },
  [ProfileTaxonomyKind.SKILL_AREA]: { sheet: "Skills", header: "Skill" },
} as const satisfies Record<
  TImportedTaxonomyKind,
  { sheet: string; header: string }
>;

export const EXPECTED_TAXONOMY_TOTALS = {
  [ProfileTaxonomyKind.ROLE]: { groups: 37, terms: 710 },
  [ProfileTaxonomyKind.SKILL_AREA]: { groups: 47, terms: 713 },
} as const satisfies Record<
  TImportedTaxonomyKind,
  { groups: number; terms: number }
>;

export const TAXONOMY_LABEL_MAX_LENGTH = 120;

export const TERM_SORT_STRIDE = 1000;

const CATEGORY_MARKER = /^Other – (.+)$/;

const CUSTOM_ENTRY_MARKER = "Other (type your own)";

const UNICODE_SPACE = /[\s​‌‍⁠﻿]+/g;

export class TaxonomyImportError extends Error {
  constructor(
    readonly kind: TImportedTaxonomyKind,
    readonly row: number | null,
    message: string,
  ) {
    super(`${kind}${row === null ? "" : ` row ${row}`}: ${message}`);
    this.name = "TaxonomyImportError";
  }
}

export const normalizeTaxonomyLabel = (value: string) =>
  value.replace(UNICODE_SPACE, " ").trim();

export const toTaxonomyKey = (label: string) =>
  label
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

export const parseTaxonomySheet = (
  kind: TImportedTaxonomyKind,
  rows: readonly string[],
): TCatalogGroup[] => {
  const { header } = TAXONOMY_SHEETS[kind];
  const fail = (row: number | null, message: string): never => {
    throw new TaxonomyImportError(kind, row, message);
  };

  if (normalizeTaxonomyLabel(rows[0] ?? "") !== header)
    fail(1, `expected the header "${header}"`);

  const groups: TCatalogGroup[] = [];
  const groupKeys = new Set<string>();
  const termKeys = new Map<string, string>();
  const termLabels = new Set<string>();
  let pending: { label: string; row: number }[] = [];
  let closed = false;

  rows.slice(1).forEach((raw, index) => {
    const row = index + 2;
    const label = normalizeTaxonomyLabel(raw);

    if (closed) fail(row, "data after the custom-entry marker");
    if (!label) fail(row, "blank row");
    if (label.length > TAXONOMY_LABEL_MAX_LENGTH)
      fail(row, `label longer than ${TAXONOMY_LABEL_MAX_LENGTH} characters`);

    if (label === CUSTOM_ENTRY_MARKER) {
      if (pending.length) fail(row, "terms after the last category marker");
      closed = true;
      return;
    }

    const marker = CATEGORY_MARKER.exec(label);
    if (marker) {
      const groupLabel = normalizeTaxonomyLabel(marker[1]);
      const groupKey = toTaxonomyKey(groupLabel);
      if (!pending.length) fail(row, `category "${groupLabel}" has no terms`);
      if (!groupKey) fail(row, `category "${groupLabel}" has no usable key`);
      if (groupKeys.has(groupKey))
        fail(row, `duplicate category key ${groupKey}`);
      groupKeys.add(groupKey);

      const groupIndex = groups.length;
      groups.push({
        key: groupKey,
        label: groupLabel,
        sortOrder: groupIndex,
        terms: pending.map((term, termIndex) => ({
          key: toTaxonomyKey(term.label),
          label: term.label,
          sortOrder: groupIndex * TERM_SORT_STRIDE + termIndex,
        })),
      });
      pending = [];
      return;
    }

    if (/^other\b/i.test(label)) fail(row, `unrecognised marker "${label}"`);

    const key = toTaxonomyKey(label);
    const normalized = label.toLowerCase();
    if (!key) fail(row, `"${label}" has no usable key`);
    if (termLabels.has(normalized)) fail(row, `duplicate label "${label}"`);
    const owner = termKeys.get(key);
    if (owner) fail(row, `key ${key} collides with "${owner}"`);
    termLabels.add(normalized);
    termKeys.set(key, label);
    pending.push({ label, row });
  });

  if (!closed) fail(null, `missing the "${CUSTOM_ENTRY_MARKER}" marker`);
  return groups;
};

export const assertTaxonomyTotals = (
  kind: TImportedTaxonomyKind,
  groups: readonly TCatalogGroup[],
) => {
  const expected = EXPECTED_TAXONOMY_TOTALS[kind];
  const terms = groups.reduce((total, group) => total + group.terms.length, 0);
  if (groups.length !== expected.groups || terms !== expected.terms)
    throw new TaxonomyImportError(
      kind,
      null,
      `expected ${expected.groups} categories and ${expected.terms} terms, found ${groups.length} and ${terms}`,
    );
};

const sheetRows = (workbook: ExcelJS.Workbook, kind: TImportedTaxonomyKind) => {
  const { sheet } = TAXONOMY_SHEETS[kind];
  const worksheet = workbook.getWorksheet(sheet);
  if (!worksheet)
    throw new TaxonomyImportError(kind, null, `missing sheet "${sheet}"`);
  if (worksheet.actualColumnCount > 1)
    throw new TaxonomyImportError(kind, null, "expected a single column");
  const rows: string[] = [];
  for (let index = 1; index <= worksheet.rowCount; index += 1)
    rows.push(worksheet.getRow(index).getCell(1).text ?? "");
  return rows;
};

export const buildTaxonomyCatalog = async (
  workbookPath: string,
): Promise<TProfileTaxonomyCatalog> => {
  const buffer = readFileSync(workbookPath);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const roles = parseTaxonomySheet(
    ProfileTaxonomyKind.ROLE,
    sheetRows(workbook, ProfileTaxonomyKind.ROLE),
  );
  const skills = parseTaxonomySheet(
    ProfileTaxonomyKind.SKILL_AREA,
    sheetRows(workbook, ProfileTaxonomyKind.SKILL_AREA),
  );
  assertTaxonomyTotals(ProfileTaxonomyKind.ROLE, roles);
  assertTaxonomyTotals(ProfileTaxonomyKind.SKILL_AREA, skills);

  return {
    version: PROFILE_TAXONOMY_CATALOG_VERSION,
    source: {
      file: TAXONOMY_WORKBOOK_FILE,
      sha256: createHash("sha256").update(buffer).digest("hex"),
    },
    roles,
    skills,
  };
};
