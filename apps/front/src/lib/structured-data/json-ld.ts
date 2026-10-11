export type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | JsonLdValue[]
  | { [key: string]: JsonLdValue };

export type JsonLdNode = { [key: string]: JsonLdValue };

const SCHEMA_CONTEXT = "https://schema.org";

const BACKSLASH = String.fromCharCode(92);

const LINE_SEPARATOR = String.fromCharCode(0x2028);

const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

const UNSAFE_CHARACTERS = new RegExp(
  `[<>&${LINE_SEPARATOR}${PARAGRAPH_SEPARATOR}]`,
  "g",
);

const escapeCharacter = (character: string) =>
  `${BACKSLASH}u${character.charCodeAt(0).toString(16).padStart(4, "0")}`;

const prune = (value: JsonLdValue): JsonLdValue => {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "string") return value.length > 0 ? value : undefined;
  if (Array.isArray(value)) {
    const items = value.map(prune).filter((item) => item !== undefined);
    return items.length > 0 ? items : undefined;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value)
      .map(([key, entry]) => [key, prune(entry)] as const)
      .filter(([, entry]) => entry !== undefined);
    return entries.length > 0 ? Object.fromEntries(entries) : undefined;
  }
  return value;
};

export const serializeJsonLd = (nodes: readonly JsonLdNode[]): string =>
  JSON.stringify({
    "@context": SCHEMA_CONTEXT,
    "@graph": prune(nodes.map((node) => ({ ...node }))),
  }).replace(UNSAFE_CHARACTERS, escapeCharacter);
