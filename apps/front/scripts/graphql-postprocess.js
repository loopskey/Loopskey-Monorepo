/**
 * Post-processing for `npm run codegen --workspace front`.
 *
 * Runs from codegen's `afterAllFileWrite` hook, so its output is part of the
 * generated artifact and should never be edited by hand.
 *
 * Three jobs, all of them about letting the bundler drop operations a route
 * does not use:
 *
 * 1. Verify every fragment spread resolves inside its own document file. The
 *    per-domain split in `codegen.ts` is only correct while that holds, and a
 *    cross-file spread would otherwise fail later as a confusing type error.
 * 2. Mark each `new TypedDocumentString(...)` pure. A bare constructor call is
 *    a side effect as far as the bundler is concerned, so without this every
 *    document in a module is retained even when nothing imports it.
 * 3. Move `TypedDocumentString` into `base.ts` and delete the copy the
 *    `typed-document-node` plugin writes into every operation module. The
 *    class has a private field, so it is nominally typed: fifteen identical
 *    declarations are fifteen incompatible types, and a document from one
 *    module would not be assignable to a signature naming another's.
 */

const fs = require("node:fs");
const path = require("node:path");

const SRC = path.join(__dirname, "..", "src", "lib", "graphql");
const DOCUMENTS_DIR = path.join(SRC, "documents");
const OPERATIONS_DIR = path.join(SRC, "operations");
const BASE_FILE = path.join(SRC, "base.ts");

const fail = (message) => {
  console.error(`graphql-postprocess: ${message}`);
  process.exit(1);
};

// ---- 1. fragment spreads stay inside their own document file ----------------

const documentFiles = fs
  .readdirSync(DOCUMENTS_DIR)
  .filter((file) => file.endsWith(".graphql"));

const defined = {};
const spread = {};
for (const file of documentFiles) {
  const source = fs.readFileSync(path.join(DOCUMENTS_DIR, file), "utf8");
  defined[file] = new Set(
    [...source.matchAll(/^fragment (\w+)/gm)].map((match) => match[1]),
  );
  spread[file] = new Set(
    [...source.matchAll(/\.\.\.(\w+)/g)].map((match) => match[1]),
  );
}

const crossFile = [];
for (const file of documentFiles) {
  for (const name of spread[file]) {
    if (defined[file].has(name)) continue;
    const owner =
      documentFiles.find((other) => defined[other].has(name)) ?? "nowhere";
    crossFile.push(`${file} spreads ${name}, defined in ${owner}`);
  }
}
if (crossFile.length) {
  fail(
    `fragment spreads cross document files, so the per-domain split in codegen.ts is no longer safe:\n  ${crossFile.join(
      "\n  ",
    )}`,
  );
}

// ---- 2 & 3. pure-annotate documents, de-duplicate the class ----------------

const CLASS_START = "export class TypedDocumentString";
const DECORATION_IMPORT =
  "import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';";

const operationFiles = fs
  .readdirSync(OPERATIONS_DIR)
  .filter((file) => file.endsWith(".ts"))
  .map((file) => path.join(OPERATIONS_DIR, file));

if (!operationFiles.length) fail(`no operation modules found in ${OPERATIONS_DIR}`);

/** The emitted class declaration, captured so `base.ts` can own it. */
let classSource = null;

for (const file of operationFiles) {
  let source = fs.readFileSync(file, "utf8");

  const start = source.indexOf(CLASS_START);
  if (start === -1) fail(`${path.basename(file)} has no TypedDocumentString class`);

  // The class ends at the first line that is exactly "}" after its start.
  const end = source.indexOf("\n}\n", start);
  if (end === -1) fail(`cannot find the end of TypedDocumentString in ${file}`);

  if (classSource === null) classSource = source.slice(start, end + 3);

  // Drop the local copy; the `add` plugin already imports the real one.
  source = source.slice(0, start) + source.slice(end + 3);

  // That copy was the only thing referencing this import.
  const withoutImport = source.replace(`${DECORATION_IMPORT}\n`, "");
  if (!withoutImport.includes("DocumentTypeDecoration")) source = withoutImport;

  source = source.replaceAll(
    "= new TypedDocumentString(",
    "= /*#__PURE__*/ new TypedDocumentString(",
  );

  fs.writeFileSync(file, source);
}

let base = fs.readFileSync(BASE_FILE, "utf8");
if (!base.includes(CLASS_START)) {
  if (!base.includes(DECORATION_IMPORT)) base = `${DECORATION_IMPORT}\n${base}`;
  base += `\n${classSource}`;
  fs.writeFileSync(BASE_FILE, base);
}

const totalDocuments = operationFiles.reduce(
  (total, file) =>
    total + (fs.readFileSync(file, "utf8").match(/__PURE__/g) ?? []).length,
  0,
);

console.log(
  `graphql-postprocess: ${operationFiles.length} operation modules, ` +
    `${totalDocuments} documents marked pure, class exported from base.ts`,
);
