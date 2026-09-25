/**
 * Guards the locale files against raw placeholders.
 *
 * `t()` in `src/providers/language-provider.tsx` only replaces `{{name}}`.
 * A `{name}` placeholder renders literally in the UI instead of the value, so
 * this fails the build when one slips back in, and when the two locales do
 * not define the same placeholder names for the same key.
 *
 * Run standalone with `npm run check-i18n --workspace front`. Wired into
 * `lint` so CI catches it.
 */

const fs = require("node:fs");
const path = require("node:path");

const LOCALE_DIR = path.join(__dirname, "..", "src", "i18n");
const LOCALES = ["en.json", "fr.json"];

const DOUBLE_BRACE = /\{\{([a-zA-Z_][a-zA-Z0-9_]*)\}\}/g;
const ANY_BRACE = /\{[a-zA-Z_][a-zA-Z0-9_]*\}/g;

const collectStrings = (node, keyPath, out) => {
  if (typeof node === "string") {
    out.set(keyPath, node);
    return;
  }
  if (Array.isArray(node)) {
    node.forEach((item, index) => collectStrings(item, `${keyPath}[${index}]`, out));
    return;
  }
  if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node)) {
      collectStrings(value, keyPath ? `${keyPath}.${key}` : key, out);
    }
  }
};

const placeholderNames = (value) => {
  const names = new Set();
  for (const match of value.matchAll(DOUBLE_BRACE)) names.add(match[1]);
  return names;
};

const sameSet = (a, b) => a.size === b.size && [...a].every((name) => b.has(name));

const locales = LOCALES.map((file) => {
  const filePath = path.join(LOCALE_DIR, file);
  const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const strings = new Map();
  collectStrings(json, "", strings);
  return { file, filePath, strings };
});

const errors = [];

for (const { file, strings } of locales) {
  for (const [keyPath, value] of strings) {
    const withoutDoubleBrace = value.replace(DOUBLE_BRACE, "");
    const stray = withoutDoubleBrace.match(ANY_BRACE);
    if (stray) {
      errors.push(
        `${file}: "${keyPath}" has a single-brace placeholder (${stray.join(", ")}). Use {{name}}.`,
      );
    }
  }
}

const [base, ...rest] = locales;
for (const other of rest) {
  const allKeys = new Set([...base.strings.keys(), ...other.strings.keys()]);
  for (const keyPath of allKeys) {
    const baseValue = base.strings.get(keyPath);
    const otherValue = other.strings.get(keyPath);
    if (baseValue === undefined || otherValue === undefined) continue;
    const baseNames = placeholderNames(baseValue);
    const otherNames = placeholderNames(otherValue);
    if (!sameSet(baseNames, otherNames)) {
      errors.push(
        `"${keyPath}" has different placeholders in ${base.file} ({${[...baseNames].join(", ")}}) ` +
          `and ${other.file} ({${[...otherNames].join(", ")}}).`,
      );
    }
  }
}

if (errors.length) {
  console.error(`i18n placeholder check failed (${errors.length}):\n`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

console.log(`i18n placeholder check passed (${LOCALES.join(", ")}).`);
