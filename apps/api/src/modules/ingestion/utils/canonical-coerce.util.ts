import {
  normalizeCourseBoolean,
  normalizeCourseDate,
  normalizeCourseNumber,
  normalizeCourseStringList,
} from "@common/utils/course-normalizer.util";

/**
 * The scalar coercers phase 03's course pipeline uses, lifted out so the
 * event, podcast and YouTube pipelines share exactly one implementation of
 * "turn a loosely-typed crawler value into a string / number / boolean / ISO
 * date". Course keeps its own inline copies untouched.
 */
export const toText = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  if (["string", "number", "boolean"].includes(typeof value))
    return String(value);
  return null;
};

export const toNumber = (value: unknown): number | null => {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  return normalizeCourseNumber(toText(value));
};

export const toInteger = (value: unknown): number | null => {
  const parsed = toNumber(value);
  if (parsed === null) return null;
  return Math.trunc(parsed);
};

export const toBoolean = (value: unknown): boolean | null => {
  if (typeof value === "boolean") return value;
  return normalizeCourseBoolean(toText(value));
};

export const toDate = (value: unknown): string | null => {
  const parsed =
    value instanceof Date
      ? value
      : typeof value === "number"
        ? new Date(value)
        : normalizeCourseDate(toText(value));
  if (!parsed || Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
};

export const toStringList = (value: unknown): string[] => {
  if (Array.isArray(value))
    return value.map(toText).filter((entry): entry is string => entry !== null);
  return normalizeCourseStringList(toText(value));
};
