import { AssociationRequirementStatus } from "@/lib/graphql/base";

export const REQUIREMENT_WIZARD_STEPS = ["details", "rules", "review"] as const;

export type TRequirementWizardStep = (typeof REQUIREMENT_WIZARD_STEPS)[number];

export type TRequirementProblem = {
  code: string;
  field: string;
  message: string;
};

export type TCategoryAllocationSegment = {
  id: string;
  name: string;
  credits: number;
  isRemainder: boolean;
};

export type TCategoryAllocation = {
  total: number;
  assigned: number;
  overflow: number;
  remainder: number;
  isOverflowing: boolean;
  segments: TCategoryAllocationSegment[];
};

export type TAllocationInput = {
  name: string;
  requiredCredits: unknown;
};

const CATEGORY_FIELD_PREFIX = "categories";

const REQUIREMENT_STATUS_FILTERS = {
  total: undefined,
  published: AssociationRequirementStatus.Published,
  draft: AssociationRequirementStatus.Draft,
} as const;

export type TRequirementStatCard = keyof typeof REQUIREMENT_STATUS_FILTERS;

export const statusForStatCard = (card: TRequirementStatCard) =>
  REQUIREMENT_STATUS_FILTERS[card];

export const problemStep = (field: string): TRequirementWizardStep =>
  field.startsWith(CATEGORY_FIELD_PREFIX) ? "rules" : "details";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readDetails = (error: unknown): Record<string, unknown> | null => {
  if (!isRecord(error)) return null;
  const errors = error.errors;
  if (!Array.isArray(errors) || !errors.length) return null;
  const extensions = isRecord(errors[0]) ? errors[0].extensions : null;
  const details = isRecord(extensions) ? extensions.details : null;
  return isRecord(details) ? details : null;
};

export const extractRequirementProblems = (
  error: unknown,
): TRequirementProblem[] => {
  const problems = readDetails(error)?.problems;
  if (!Array.isArray(problems)) return [];

  return problems.filter(
    (problem): problem is TRequirementProblem =>
      isRecord(problem) &&
      typeof problem.code === "string" &&
      typeof problem.field === "string" &&
      typeof problem.message === "string",
  );
};

const toCreditNumber = (value: unknown) => {
  const parsed = typeof value === "string" ? Number(value) : value;
  return typeof parsed === "number" && Number.isFinite(parsed) ? parsed : 0;
};

export const buildCategoryAllocation = (
  categories: TAllocationInput[],
  total: number,
  remainderLabel: string,
): TCategoryAllocation => {
  const segments = categories.map((category, index) => ({
    id: `category-${index}`,
    name: category.name.trim(),
    credits: Math.max(0, toCreditNumber(category.requiredCredits)),
    isRemainder: false,
  }));

  const assigned = segments.reduce(
    (running, segment) => running + segment.credits,
    0,
  );
  const remainder = Math.max(0, total - assigned);
  const overflow = Math.max(0, assigned - total);

  if (remainder > 0)
    segments.push({
      id: "remainder",
      name: remainderLabel,
      credits: remainder,
      isRemainder: true,
    });

  return {
    total,
    assigned,
    overflow,
    remainder,
    segments,
    isOverflowing: overflow > 0,
  };
};

export const allocationChartRow = (allocation: TCategoryAllocation) =>
  Object.fromEntries(
    allocation.segments.map((segment) => [segment.id, segment.credits]),
  ) as Record<string, number>;

export const toDateInputValue = (value: string | null | undefined) => {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? ""
    : parsed.toISOString().slice(0, 10);
};

export const fromDateInputValue = (value: string | null | undefined) => {
  if (!value) return undefined;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};
