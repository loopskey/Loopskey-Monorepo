import { ASSOCIATION_MEMBER_LIMITS } from "@loopskey/api-contracts/validation";
import { normalizeText } from "@utils/constant";

import type { BulkInviteAssociationMemberRowInput } from "@/lib/graphql/base";

export const ASSOCIATION_IMPORT_COLUMNS = [
  "firstName",
  "lastName",
  "email",
  "memberNumber",
  "group",
] as const;

export type TAssociationImportColumn =
  (typeof ASSOCIATION_IMPORT_COLUMNS)[number];

const COLUMN_ALIASES: Record<TAssociationImportColumn, string[]> = {
  firstName: ["firstname", "first name", "first_name", "given name"],
  lastName: ["lastname", "last name", "last_name", "surname", "family name"],
  email: ["email", "e-mail", "email address", "mail"],
  memberNumber: [
    "membernumber",
    "member number",
    "member_number",
    "member no",
    "membership number",
  ],
  group: ["group", "group title", "grouptitle", "chapter", "section"],
};

export type TAssociationImportRow = {
  row: number;
  email: string;
  group: string;
  lastName: string;
  firstName: string;
  memberNumber: string;
  errorKeys: string[];
};

export type TAssociationImportPreview = {
  rows: TAssociationImportRow[];
  validCount: number;
  invalidCount: number;
  isTruncated: boolean;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const readCell = (
  raw: Record<string, unknown>,
  column: TAssociationImportColumn,
): string => {
  const aliases = COLUMN_ALIASES[column];
  for (const [key, value] of Object.entries(raw)) {
    if (aliases.includes(key.trim().toLowerCase())) {
      const text = normalizeText(value);
      if (text) return text;
    }
  }
  return "";
};

export const toImportRow = (
  raw: Record<string, unknown>,
  index: number,
): TAssociationImportRow => {
  const email = readCell(raw, "email").toLowerCase();
  const firstName = readCell(raw, "firstName");
  const lastName = readCell(raw, "lastName");
  const memberNumber = readCell(raw, "memberNumber");
  const group = readCell(raw, "group");

  const errorKeys: string[] = [];
  if (!email) errorKeys.push("emailMissing");
  else if (!EMAIL_PATTERN.test(email)) errorKeys.push("emailInvalid");
  if (!firstName && !lastName) errorKeys.push("nameMissing");
  if (memberNumber.length > ASSOCIATION_MEMBER_LIMITS.memberNumberMax) {
    errorKeys.push("memberNumberTooLong");
  }

  return {
    email,
    group,
    lastName,
    firstName,
    memberNumber,
    errorKeys,
    row: index + 1,
  };
};

export const buildImportPreview = (
  rawRows: Record<string, unknown>[],
): TAssociationImportPreview => {
  const isTruncated = rawRows.length > ASSOCIATION_MEMBER_LIMITS.bulkRowsMax;
  const rows = rawRows
    .slice(0, ASSOCIATION_MEMBER_LIMITS.bulkRowsMax)
    .map(toImportRow)
    .filter(
      (row) =>
        row.email ||
        row.firstName ||
        row.lastName ||
        row.memberNumber ||
        row.group,
    );

  const invalidCount = rows.filter((row) => row.errorKeys.length > 0).length;

  return {
    rows,
    isTruncated,
    invalidCount,
    validCount: rows.length - invalidCount,
  };
};

export const toBulkInviteRows = (
  rows: TAssociationImportRow[],
): BulkInviteAssociationMemberRowInput[] =>
  rows
    .filter((row) => row.errorKeys.length === 0)
    .map((row) => ({
      email: row.email,
      firstName: row.firstName || undefined,
      lastName: row.lastName || undefined,
      memberNumber: row.memberNumber || undefined,
      groupTitle: row.group || undefined,
    }));

const escapeCsvCell = (value: string) =>
  /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;

export const buildImportTemplateCsv = (
  headers: Record<TAssociationImportColumn, string>,
  example: Record<TAssociationImportColumn, string>,
): string =>
  [
    ASSOCIATION_IMPORT_COLUMNS.map((column) =>
      escapeCsvCell(headers[column]),
    ).join(","),
    ASSOCIATION_IMPORT_COLUMNS.map((column) =>
      escapeCsvCell(example[column]),
    ).join(","),
  ].join("\n");
