import { faker } from "@faker-js/faker";

export const slugify = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

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
