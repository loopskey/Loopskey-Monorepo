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
  /(?:^|\s)(?:import|export)[\s\S]*?from\s*["']([^"']+)["']|(?<!typeof\s+)import\s*\(\s*["']([^"']+)["']\s*\)|require\(\s*["']([^"']+)["']\s*\)/g;

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

const collectGraph = (roots, isBoundary = () => false) => {
  const clientFiles = new Set();
  const seenServer = new Set();
  const boundaries = new Set();
  const rootSet = new Set(roots);
  const queue = roots.map((file) => ({ file, isClient: false }));

  while (queue.length > 0) {
    const { file, isClient } = queue.pop();
    if (isClient && clientFiles.has(file)) continue;
    if (!isClient && seenServer.has(file)) continue;

    if (file.endsWith(".json")) {
      if (isClient) clientFiles.add(file);
      else seenServer.add(file);
      continue;
    }

    const source = fs.readFileSync(file, "utf8");
    if (!rootSet.has(file) && isBoundary(source)) {
      boundaries.add(file);
      continue;
    }

    if (isClient) clientFiles.add(file);
    else seenServer.add(file);
    const nowClient = isClient || isClientModule(source);
    if (nowClient && !isClient) {
      clientFiles.add(file);
      seenServer.delete(file);
    }

    for (const next of importsOf(source, file)) {
      queue.push({ file: next, isClient: nowClient });
    }
  }

  return { clientFiles, serverFiles: seenServer, boundaries };
};

const collectClientGraph = () =>
  collectGraph(
    PUBLIC_ROOTS.flatMap((root) => walkFiles(path.join(SRC_DIR, root))).filter(
      (file) => EXTENSIONS.some((extension) => file.endsWith(extension)),
    ),
  ).clientFiles;

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

const STRING_LITERAL_PATTERN =
  /["'`]([a-zA-Z][a-zA-Z0-9_]*(?:\.[a-zA-Z0-9_]+)+)["'`]/g;
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

const namespaces = [
  ...new Set(keyPaths.map((key) => key.split(".")[0])),
].sort();

const SCOPES = JSON.parse(
  fs.readFileSync(path.join(I18N_DIR, "client-scopes.json"), "utf8"),
);
const LAZY_SCOPES = JSON.parse(
  fs.readFileSync(path.join(I18N_DIR, "lazy-scopes.json"), "utf8"),
);
const LAZY_IMPORT_PATTERN = /generated\/scope\.([a-zA-Z]+)\.(?:en|fr)\.json/g;
const SERVER_ONLY_MESSAGES = path.join(I18N_DIR, "public-messages.ts");
const LOCALIZED_DIR = path.join(SRC_DIR, "app", "[locale]", "(localized)");
const ROOT_LAYOUT = path.join(SRC_DIR, "app", "[locale]", "layout.tsx");
const BOUNDARY_FILES = ["layout.tsx", "not-found.tsx", "error.tsx"];
const SCOPE_PATTERN = /<ClientMessages\b[^>]*?\bscope="([a-zA-Z]+)"/g;

const isCovered = (prefixes, keyPath) =>
  prefixes.some(
    (prefix) => keyPath === prefix || keyPath.startsWith(`${prefix}.`),
  );

const importsLazyScope = (source) =>
  /generated\/scope\.[a-zA-Z]+\./.test(source);

const scopesDeclaredIn = (files, pattern) => {
  const declared = new Set();
  for (const file of files) {
    if (file.endsWith(".json")) continue;
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(pattern)) declared.add(match[1]);
  }
  return declared;
};

const boundaryRootsOf = (pageFile) => {
  const roots = [ROOT_LAYOUT];
  let dir = LOCALIZED_DIR;
  const segments = path.relative(LOCALIZED_DIR, path.dirname(pageFile));
  const parts = segments ? segments.split(path.sep) : [];
  for (let index = 0; index <= parts.length; index += 1) {
    for (const name of BOUNDARY_FILES) {
      const candidate = path.join(dir, name);
      if (fs.existsSync(candidate)) roots.push(candidate);
    }
    if (index < parts.length) dir = path.join(dir, parts[index]);
  }
  return roots;
};

const coverageProblems = [];

for (const [scope, prefixes] of [
  ...Object.entries(SCOPES),
  ...Object.entries(LAZY_SCOPES),
]) {
  for (const prefix of prefixes) {
    if (valueAt(reference, prefix) === undefined) {
      coverageProblems.push(
        `scope "${scope}" names ${prefix}, which en.json does not define`,
      );
    }
  }
}

if (clientFiles.has(SERVER_ONLY_MESSAGES)) {
  coverageProblems.push(
    "src/i18n/public-messages.ts is reachable from client code; it must stay on the server",
  );
}

for (const pageFile of walkFiles(LOCALIZED_DIR).filter((file) =>
  file.endsWith(`${path.sep}page.tsx`),
)) {
  const page = path.relative(SRC_DIR, pageFile).split(path.sep).join("/");
  const boundary = collectGraph(boundaryRootsOf(pageFile));
  const pageGraph = collectGraph([pageFile], importsLazyScope);
  const declared = scopesDeclaredIn(
    [...boundary.serverFiles, ...pageGraph.serverFiles],
    SCOPE_PATTERN,
  );

  for (const scope of declared) {
    if (!SCOPES[scope])
      coverageProblems.push(`${page} uses unknown scope "${scope}"`);
  }

  const shell = SCOPES.shell ?? [];
  const provided = [
    ...shell,
    ...[...declared].flatMap((scope) => SCOPES[scope] ?? []),
  ];

  for (const lazyModule of pageGraph.boundaries) {
    const lazy = scopesDeclaredIn([lazyModule], LAZY_IMPORT_PATTERN);
    const name = path.relative(SRC_DIR, lazyModule).split(path.sep).join("/");
    for (const scope of lazy) {
      if (!LAZY_SCOPES[scope])
        coverageProblems.push(`${name} imports unknown lazy scope "${scope}"`);
    }
    const lazyProvided = [
      ...provided,
      ...[...lazy].flatMap((scope) => LAZY_SCOPES[scope] ?? []),
    ];
    const missingFromLazy = pruneRedundant(
      collectRequiredPaths(collectGraph([lazyModule]).clientFiles, reference),
    ).filter((keyPath) => !isCovered(lazyProvided, keyPath));
    if (missingFromLazy.length > 0) {
      coverageProblems.push(
        `${page} via ${name}: no scope provides ${missingFromLazy.join(", ")}`,
      );
    }
  }

  const missingFromShell = pruneRedundant(
    collectRequiredPaths(boundary.clientFiles, reference),
  ).filter((keyPath) => !isCovered(shell, keyPath));
  const missingFromPage = pruneRedundant(
    collectRequiredPaths(pageGraph.clientFiles, reference),
  ).filter((keyPath) => !isCovered(provided, keyPath));

  if (missingFromShell.length > 0) {
    coverageProblems.push(
      `${page}: the shell scope does not provide ${missingFromShell.join(", ")}`,
    );
  }
  if (missingFromPage.length > 0) {
    coverageProblems.push(
      `${page}: no ClientMessages scope provides ${missingFromPage.join(", ")}`,
    );
  }
}

if (coverageProblems.length > 0) {
  console.error(
    `client message scopes do not cover the public client graph:\n  ${coverageProblems.join("\n  ")}`,
  );
  process.exitCode = 1;
}

let hasDrift = false;

const emit = (name, value, fullSize) => {
  const serialized = `${JSON.stringify(value, null, 2)}\n`;
  const target = path.join(GENERATED_DIR, name);
  const current = fs.existsSync(target)
    ? fs.readFileSync(target, "utf8")
    : null;

  if (isWrite) {
    fs.mkdirSync(GENERATED_DIR, { recursive: true });
    fs.writeFileSync(target, serialized);
    console.log(
      `wrote src/i18n/generated/${name} — ${Math.round(serialized.length / 1024)} KiB of ${Math.round(fullSize / 1024)} KiB`,
    );
  } else if (current !== serialized) {
    hasDrift = true;
    console.error(
      `src/i18n/generated/${name} is stale. Run \`npm run i18n-slice --workspace front\`.`,
    );
  }
};

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
  const full = fs.statSync(path.join(I18N_DIR, `${locale}.json`)).size;
  emit(`public.${locale}.json`, slice, full);

  for (const [scope, prefixes] of Object.entries(LAZY_SCOPES)) {
    const scoped = present.filter((keyPath) => isCovered(prefixes, keyPath));
    emit(
      `scope.${scope}.${locale}.json`,
      sortedDeep(sliceOf(dictionary, scoped)),
      full,
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
