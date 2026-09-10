/**
 * A field map renames a crawler's own field names onto this platform's
 * canonical field names for one kind. It may only rename and pick: every
 * target must be a canonical field, and no target may appear twice. Anything
 * that looks like a transformation (an expression, a duplicate target) is
 * rejected when the source is saved, not at ingest time.
 */
export class CanonicalFieldMapError extends Error {}

export const validateCanonicalFieldMap = (
  value: unknown,
  canonicalFields: readonly string[],
  label: string,
): Record<string, string> => {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new CanonicalFieldMapError(
      `The ${label} field map must be an object.`,
    );

  const allowed = new Set<string>(canonicalFields);
  const fieldMap: Record<string, string> = {};
  const usedTargets = new Set<string>();

  for (const [sourceField, targetField] of Object.entries(value)) {
    if (!sourceField.trim() || sourceField.length > 128)
      throw new CanonicalFieldMapError(
        "Every source field name must contain between 1 and 128 characters.",
      );
    if (typeof targetField !== "string" || !allowed.has(targetField))
      throw new CanonicalFieldMapError(
        `The field map target for ${sourceField} is not a canonical ${label} field.`,
      );
    if (usedTargets.has(targetField))
      throw new CanonicalFieldMapError(
        `The field map targets ${targetField} more than once.`,
      );
    fieldMap[sourceField] = targetField;
    usedTargets.add(targetField);
  }

  return fieldMap;
};
