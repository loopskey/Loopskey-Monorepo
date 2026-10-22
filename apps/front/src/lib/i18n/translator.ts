import type { I18nContextValue } from "@/types/providers.types";

type TTranslator = Pick<I18nContextValue, "t" | "ta" | "traw">;

export const getByKey = (source: unknown, key: string): unknown =>
  key.split(".").reduce<unknown>((current, part) => {
    if (typeof current !== "object" || current === null) return undefined;
    return (current as Record<string, unknown>)[part];
  }, source);

export const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

export const createTranslator = (
  lookup: (key: string) => unknown,
): TTranslator => ({
  t: (key, params = {}, fallback = "") => {
    const rawValue = lookup(key);
    if (typeof rawValue !== "string") return fallback;
    let text = rawValue;
    Object.entries(params).forEach(([paramKey, paramValue]) => {
      text = text.replaceAll(`{{${paramKey}}}`, String(paramValue));
    });
    return text;
  },
  ta: (key) => {
    const rawValue = lookup(key);
    return isStringArray(rawValue) ? rawValue : [];
  },
  traw: (key, fallback) => {
    const rawValue = lookup(key);
    return rawValue === undefined ? (fallback as never) : (rawValue as never);
  },
});

export const translatorFor = (dictionary: unknown) =>
  createTranslator((key) => getByKey(dictionary, key));

export const pickMessages = (
  dictionary: unknown,
  paths: readonly string[],
): Record<string, unknown> => {
  const picked: Record<string, unknown> = {};
  for (const path of paths) {
    const value = getByKey(dictionary, path);
    if (value === undefined) continue;
    const segments = path.split(".");
    let target = picked;
    for (const segment of segments.slice(0, -1)) {
      target[segment] = (target[segment] as Record<string, unknown>) ?? {};
      target = target[segment] as Record<string, unknown>;
    }
    target[segments[segments.length - 1]] = value;
  }
  return picked;
};
