/**
 * `class-validator` `@Transform` callbacks.
 *
 * Single home for what used to be two byte-identical `trimToNull` definitions
 * in files one character apart — `common/utils/functions-helper.ts` and
 * `professional/utils/function-helper.ts`. Non-strings pass through untouched
 * so a transform never changes a value's type.
 */
export const trim = ({ value }: { value: unknown }): unknown =>
  typeof value === "string" ? value.trim() : value;

export const trimToNull = ({ value }: { value: unknown }): unknown => {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};
