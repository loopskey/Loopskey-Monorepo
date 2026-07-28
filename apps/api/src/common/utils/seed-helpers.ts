import { faker } from "@faker-js/faker";

// Re-exported so seeds produce slugs identical to the ones the services
// generate at runtime. The implementation lives in `slug.util`.
export { slugify } from "@utils/slug.util";

export const safeUnique = <T>(arr: T[]): T[] => Array.from(new Set(arr));

export const pickRandomEnumValue = <T extends Record<string, string>>(
  enumObject: T,
): T[keyof T] => {
  const values = Object.values(enumObject) as T[keyof T][];
  return faker.helpers.arrayElement(values);
};

export const toTitle = (value: string) => {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
