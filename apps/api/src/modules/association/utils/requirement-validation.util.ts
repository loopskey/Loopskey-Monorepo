import { AssociationMessageCode } from "@association/enums/association-message-code.enum";
import { AssociationReportingCycle } from "@prisma/client";

export type RequirementProblem = {
  field: string;
  message: string;
  code: AssociationMessageCode;
};

export type CategoryShape = {
  name: string;
  mappedCategory: string | null | undefined;
  requiredCredits: number | null | undefined;
};

export type CycleShape = {
  cycleLengthYears?: number | null;
  reportingCycle: AssociationReportingCycle;
};

export type RequirementShape = CycleShape & {
  name: string;
  deadline: Date | null;
  categories: CategoryShape[];
  totalRequiredCredits: number;
};

const problem = (
  field: string,
  code: AssociationMessageCode,
  message: string,
): RequirementProblem => ({ field, code, message });

export const validateCycle = (cycle: CycleShape): RequirementProblem[] => {
  const isMultiYear =
    cycle.reportingCycle === AssociationReportingCycle.MULTI_YEAR;
  const length = cycle.cycleLengthYears ?? null;

  if (isMultiYear && (length === null || length < 1))
    return [
      problem(
        "cycleLengthYears",
        AssociationMessageCode.CYCLE_LENGTH_REQUIRED,
        "A multi-year cycle needs a length in years.",
      ),
    ];

  if (!isMultiYear && length !== null)
    return [
      problem(
        "cycleLengthYears",
        AssociationMessageCode.CYCLE_LENGTH_NOT_ALLOWED,
        "Only a multi-year cycle carries a cycle length.",
      ),
    ];

  return [];
};

export const validateCategories = (
  categories: CategoryShape[],
  totalRequiredCredits: number,
): RequirementProblem[] => {
  if (categories.length === 0) return [];

  const problems: RequirementProblem[] = [];
  const names = new Set<string>();
  const mappings = new Set<string>();
  let sum = 0;

  categories.forEach((category, index) => {
    const field = `categories[${index}]`;
    const name = category.name?.trim() ?? "";
    const credits = category.requiredCredits ?? null;

    if (!name || !category.mappedCategory || credits === null || credits <= 0)
      problems.push(
        problem(
          field,
          AssociationMessageCode.CATEGORY_INCOMPLETE,
          "A category needs a name, a mapped category and a credit value.",
        ),
      );

    const key = name.toLowerCase();
    if (key && names.has(key))
      problems.push(
        problem(
          field,
          AssociationMessageCode.CATEGORY_NAME_DUPLICATE,
          `Two categories are both called "${name}".`,
        ),
      );
    names.add(key);

    if (category.mappedCategory && mappings.has(category.mappedCategory))
      problems.push(
        problem(
          field,
          AssociationMessageCode.CATEGORY_MAPPING_DUPLICATE,
          `Two categories both map to ${category.mappedCategory}.`,
        ),
      );
    if (category.mappedCategory) mappings.add(category.mappedCategory);

    sum += credits ?? 0;
  });

  if (sum > totalRequiredCredits)
    problems.push(
      problem(
        "categories",
        AssociationMessageCode.CATEGORY_CREDITS_EXCEED_TOTAL,
        `Category credits total ${sum}, above the requirement's ${totalRequiredCredits}.`,
      ),
    );

  return problems;
};

export const validateForPublish = (
  requirement: RequirementShape,
): RequirementProblem[] => [
  ...(requirement.name?.trim()
    ? []
    : [
        problem(
          "name",
          AssociationMessageCode.PUBLISH_VALIDATION_FAILED,
          "A requirement needs a name.",
        ),
      ]),
  ...(requirement.totalRequiredCredits > 0
    ? []
    : [
        problem(
          "totalRequiredCredits",
          AssociationMessageCode.PUBLISH_VALIDATION_FAILED,
          "A requirement needs a credit total above zero.",
        ),
      ]),
  ...(requirement.deadline
    ? []
    : [
        problem(
          "deadline",
          AssociationMessageCode.PUBLISH_VALIDATION_FAILED,
          "A requirement needs a deadline.",
        ),
      ]),
  ...validateCycle(requirement),
  ...validateCategories(
    requirement.categories,
    requirement.totalRequiredCredits,
  ),
];

export const PUBLISHED_IMMUTABLE_FIELDS = [
  "totalRequiredCredits",
  "creditType",
  "deadline",
  "reportingCycle",
  "cycleLengthYears",
  "evidencePolicy",
] as const;

export type PublishedImmutableField =
  (typeof PUBLISHED_IMMUTABLE_FIELDS)[number];

export const immutableFieldsTouched = (
  patch: Record<string, unknown>,
): PublishedImmutableField[] =>
  PUBLISHED_IMMUTABLE_FIELDS.filter(
    (field) => patch[field] !== undefined && patch[field] !== null,
  );
