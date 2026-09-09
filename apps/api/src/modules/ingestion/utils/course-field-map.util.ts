import { COURSE_CANONICAL_FIELDS } from "@ingestion/enums/course-ingestion.constant";
import type { CourseCanonicalField } from "@ingestion/types/course-ingestion.types";
import type { CourseFieldMap } from "@ingestion/types/course-ingestion.types";

const canonicalFields = new Set<string>(COURSE_CANONICAL_FIELDS);

export class CourseFieldMapError extends Error {}

export const validateCourseFieldMap = (value: unknown): CourseFieldMap => {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new CourseFieldMapError("The course field map must be an object.");

  const fieldMap: CourseFieldMap = {};
  const targets = new Set<CourseCanonicalField>();
  for (const [sourceField, targetField] of Object.entries(value)) {
    if (!sourceField.trim() || sourceField.length > 128)
      throw new CourseFieldMapError(
        "Every source field name must contain between 1 and 128 characters.",
      );
    if (typeof targetField !== "string" || !canonicalFields.has(targetField))
      throw new CourseFieldMapError(
        `The field map target for ${sourceField} is not canonical.`,
      );
    const canonicalTarget = targetField as CourseCanonicalField;
    if (targets.has(canonicalTarget))
      throw new CourseFieldMapError(
        `The field map targets ${canonicalTarget} more than once.`,
      );
    fieldMap[sourceField] = canonicalTarget;
    targets.add(canonicalTarget);
  }
  return fieldMap;
};
