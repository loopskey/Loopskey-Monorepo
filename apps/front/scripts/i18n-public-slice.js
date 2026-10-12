const fs = require("node:fs");
const path = require("node:path");

const FRONT_DIR = path.join(__dirname, "..");
const SRC_DIR = path.join(FRONT_DIR, "src");
const I18N_DIR = path.join(SRC_DIR, "i18n");
const GENERATED_DIR = path.join(I18N_DIR, "generated");

const LOCALES = ["en", "fr"];

const PUBLIC_ROOTS = [
  "app/[locale]/layout.tsx",
  "app/[locale]/not-found.tsx",
  "app/[locale]/[...missing]",
  "app/[locale]/(localized)",
];

const ALIASES = {
  "@/": "",
  "@lib/": "lib/",
  "@types/": "types/",
  "@hooks/": "hooks/",
  "@utils/": "utils/",
  "@actions/": "actions/",
  "@ui/": "components/ui/",
  "@providers/": "providers/",
  "@components/": "components/",
  "@guards/": "components/guards/",
  "@layouts/": "components/layouts/",
  "@modules/": "components/modules/",
  "@elements/": "components/elements/",
  "@templates/": "components/templates/",
};

const EXTENSIONS = [".tsx", ".ts", ".json"];

const args = process.argv.slice(2);
const isWrite = args.includes("--write");

const walkFiles = (target) => {
  if (!fs.existsSync(target)) return [];
  if (!fs.statSync(target).isDirectory()) return [target];
  return fs.readdirSync(target, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(target, entry.name);
    return entry.isDirectory() ? walkFiles(full) : [full];
  });
};

const resolveImport = (specifier, fromFile) => {
  let relative = null;

  if (specifier.startsWith(".")) {
    relative = path.relative(
      SRC_DIR,
      path.resolve(path.dirname(fromFile), specifier),
    );
  } else {
    const alias = Object.keys(ALIASES).find((prefix) =>
      specifier.startsWith(prefix),
    );
    if (!alias) return null;
    relative = ALIASES[alias] + specifier.slice(alias.length);
  }

  const base = path.join(SRC_DIR, relative);
  for (const candidate of [
    base,
    ...EXTENSIONS.map((extension) => base + extension),
    ...EXTENSIONS.map((extension) => path.join(base, `index${extension}`)),
  ]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
};

const IMPORT_PATTERN =
  /(?:^|\s)(?:import|export)[\s\S]*?from\s*["']([^"']+)["']|import\s*\(\s*["']([^"']+)["']\s*\)|require\(\s*["']([^"']+)["']\s*\)/g;

const TYPE_ONLY_PATTERN = /^\s*(?:import|export)\s+type\b/;

const importsOf = (source, file) => {
  const found = new Set();
  for (const line of source.split("\n")) {
    if (TYPE_ONLY_PATTERN.test(line)) continue;
    IMPORT_PATTERN.lastIndex = 0;
    let match;
    while ((match = IMPORT_PATTERN.exec(line))) {
      const specifier = match[1] ?? match[2] ?? match[3];
      if (!specifier) continue;
      const resolved = resolveImport(specifier, file);
      if (resolved) found.add(resolved);
    }
  }

  IMPORT_PATTERN.lastIndex = 0;
  let match;
  while ((match = IMPORT_PATTERN.exec(source))) {
    const specifier = match[1] ?? match[2] ?? match[3];
    if (!specifier) continue;
    const resolved = resolveImport(specifier, file);
    if (resolved) found.add(resolved);
  }

  return found;
};

const isClientModule = (source) => /^\s*["']use client["']/.test(source);

const collectClientGraph = () => {
  const roots = PUBLIC_ROOTS.flatMap((root) =>
    walkFiles(path.join(SRC_DIR, root)),
  ).filter((file) => EXTENSIONS.some((extension) => file.endsWith(extension)));

  const clientFiles = new Set();
  const seenServer = new Set();
  const queue = roots.map((file) => ({ file, isClient: false }));

  while (queue.length > 0) {
    const { file, isClient } = queue.pop();
    if (isClient && clientFiles.has(file)) continue;
    if (!isClient && seenServer.has(file)) continue;
    if (isClient) clientFiles.add(file);
    else seenServer.add(file);

    if (file.endsWith(".json")) continue;

    const source = fs.readFileSync(file, "utf8");
    const nowClient = isClient || isClientModule(source);
    if (nowClient && !isClient) {
      clientFiles.add(file);
      seenServer.delete(file);
    }

    for (const next of importsOf(source, file)) {
      queue.push({ file: next, isClient: nowClient });
    }
  }

  return clientFiles;
};

const dictionaryFor = (locale) =>
  JSON.parse(fs.readFileSync(path.join(I18N_DIR, `${locale}.json`), "utf8"));

const valueAt = (dictionary, keyPath) => {
  let node = dictionary;
  for (const segment of keyPath.split(".")) {
    if (node === null || typeof node !== "object" || Array.isArray(node)) {
      return undefined;
    }
    node = node[segment];
    if (node === undefined) return undefined;
  }
  return node;
};

const STRING_LITERAL_PATTERN = /["'`]([a-zA-Z][a-zA-Z0-9_]*(?:\.[a-zA-Z0-9_]+)+)["'`]/g;
const TEMPLATE_PREFIX_PATTERN =
  /[`]([a-zA-Z][a-zA-Z0-9_]*(?:\.[a-zA-Z0-9_]+)*)\.?\$\{/g;

const collectRequiredPaths = (clientFiles, dictionary) => {
  const required = new Set();

  const consider = (candidate) => {
    if (!candidate) return;
    if (valueAt(dictionary, candidate) === undefined) return;
    required.add(candidate);
  };

  for (const file of clientFiles) {
    if (file.endsWith(".json")) continue;
    const source = fs.readFileSync(file, "utf8");

    STRING_LITERAL_PATTERN.lastIndex = 0;
    let match;
    while ((match = STRING_LITERAL_PATTERN.exec(source))) consider(match[1]);

    TEMPLATE_PREFIX_PATTERN.lastIndex = 0;
    while ((match = TEMPLATE_PREFIX_PATTERN.exec(source))) consider(match[1]);
  }

  return required;
};

const pruneRedundant = (paths) =>
  [...paths]
    .sort()
    .filter(
      (candidate) =>
        ![...paths].some(
          (other) => other !== candidate && candidate.startsWith(`${other}.`),
        ),
    );

const sliceOf = (dictionary, keyPaths) => {
  const slice = {};
  for (const keyPath of keyPaths) {
    const segments = keyPath.split(".");
    let source = dictionary;
    let target = slice;
    for (const segment of segments.slice(0, -1)) {
      source = source[segment];
      target[segment] = target[segment] ?? {};
      target = target[segment];
    }
    const last = segments[segments.length - 1];
    target[last] = source[last];
  }
  return slice;
};

const sortedDeep = (value) => {
  if (Array.isArray(value)) return value.map(sortedDeep);
  if (value === null || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, sortedDeep(value[key])]),
  );
};

const clientFiles = collectClientGraph();
const reference = dictionaryFor("en");
const required = collectRequiredPaths(clientFiles, reference);
const keyPaths = pruneRedundant(required);

const namespaces = [...new Set(keyPaths.map((key) => key.split(".")[0]))].sort();

let hasDrift = false;

for (const locale of LOCALES) {
  const dictionary = dictionaryFor(locale);
  const missing = keyPaths.filter(
    (keyPath) => valueAt(dictionary, keyPath) === undefined,
  );
  if (missing.length > 0) {
    console.error(
      `${locale}.json is missing ${missing.length} public key path(s): ${missing.slice(0, 5).join(", ")}`,
    );
    process.exitCode = 1;
  }

  const present = keyPaths.filter(
    (keyPath) => valueAt(dictionary, keyPath) !== undefined,
  );
  const slice = sortedDeep(sliceOf(dictionary, present));

  const unreachable = present.filter(
    (keyPath) => valueAt(slice, keyPath) === undefined,
  );
  if (unreachable.length > 0) {
    console.error(
      `the ${locale} slice does not expose ${unreachable.length} required key path(s): ${unreachable.slice(0, 5).join(", ")}`,
    );
    process.exitCode = 1;
  }
  const serialized = `${JSON.stringify(slice, null, 2)}\n`;
  const target = path.join(GENERATED_DIR, `public.${locale}.json`);

  const current = fs.existsSync(target) ? fs.readFileSync(target, "utf8") : null;

  if (isWrite) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
    fs.writeFileSync(target, serialized);
    const full = fs.statSync(path.join(I18N_DIR, `${locale}.json`)).size;
    console.log(
      `wrote src/i18n/generated/public.${locale}.json — ${Math.round(serialized.length / 1024)} KiB of ${Math.round(full / 1024)} KiB`,
    );
  } else if (current !== serialized) {
    hasDrift = true;
    console.error(
      `src/i18n/generated/public.${locale}.json is stale. Run \`npm run i18n-slice --workspace front\`.`,
    );
  }
}

if (isWrite) {
  console.log(
    `public client graph: ${clientFiles.size} modules, ${keyPaths.length} key paths, namespaces: ${namespaces.join(", ")}`,
  );
} else if (!hasDrift && process.exitCode !== 1) {
  console.log(
    `public i18n slices are current — ${keyPaths.length} key paths across ${namespaces.length} namespaces`,
  );
}

if (hasDrift) process.exitCode = 1;
