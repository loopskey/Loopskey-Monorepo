import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * Generated from the schema the API commits, not from a running server.
 *
 * Reading `NEXT_PUBLIC_GRAPHQL_URL` meant codegen needed a live API and a
 * reachable database, could not run in CI, and could silently generate against
 * a deployed schema. The sibling workspace already commits the artifact, so
 * this is the one dependency a monorepo should make trivial.
 */

/**
 * One module per document file, so a route only pays for the operations it
 * uses. A single `generated.ts` holding every operation was one bundler module
 * whose 350 documents could not be split, so a static page such as `/cookies`
 * downloaded the entire admin, organization and professional GraphQL surface.
 *
 * Each name matches a file in `src/lib/graphql/documents/`. Every fragment
 * spread resolves inside its own document file, which is what makes the split
 * safe; `scripts/graphql-postprocess.js` fails the run if that stops holding.
 */
const DOMAINS = [
  "admin-dashboard",
  "auth",
  "content-interaction",
  "course",
  "cpd-plan",
  "event",
  "external-learning",
  "landing",
  "org-dashboard",
  "podcast",
  "professional",
  "provider",
  "support",
  "user",
  "youtube",
] as const;

const scalars = {
  DateTime: "string",
  Date: "string",
};

/** Shared by the base types and every operation module. */
const commonConfig = {
  avoidOptionals: false,
  maybeValue: "T | null",
  scalars,
  enumsAsTypes: false,
};

const operationOutputs = Object.fromEntries(
  DOMAINS.map((domain) => [
    `src/lib/graphql/operations/${domain}.ts`,
    {
      documents: [`src/lib/graphql/documents/${domain}.graphql`],
      plugins: [
        // Operation types reference schema types (inputs, enums, scalars).
        // They are read from the single base module rather than re-emitted
        // per domain. `TypedDocumentString` has a private field, so it is
        // nominally typed: every module must use the one declaration or
        // documents stop being assignable to each other.
        {
          add: {
            content: [
              `import * as Types from "@/lib/graphql/base";`,
              `import { TypedDocumentString } from "@/lib/graphql/base";`,
            ].join("\n"),
          },
        },
        "typescript-operations",
        "typed-document-node",
      ],
      config: {
        ...commonConfig,
        namespacedImportName: "Types",
        // Emit each operation as its query string rather than a serialized
        // AST. The AST form made the generated module ~1 MB of JSON that every
        // route downloaded, and forced `graphql`'s printer into the browser
        // bundle purely to turn it back into the string the transport sends.
        documentMode: "string",
      },
    },
  ]),
);

const config: CodegenConfig = {
  schema: "../api/src/graphql/schema.gql",
  // Deliberately no root-level `documents`: it is merged into every output
  // rather than overridden by one, which would give each domain module all 350
  // operations and undo the split.
  generates: {
    // Schema types and enums only. No operations, so importing an enum does
    // not drag a single query string into the chunk.
    "src/lib/graphql/base.ts": {
      plugins: ["typescript"],
      config: commonConfig,
    },

    ...operationOutputs,

    // The import surface the application uses. Keeping this barrel means the
    // split above is invisible to callers: `@/lib/graphql/generated` still
    // exports every type, enum and document.
    "src/lib/graphql/generated.ts": {
      documents: [],
      plugins: [
        {
          add: {
            content: [
              "/* Barrel over the split GraphQL modules. Generated: do not edit. */",
              'export * from "@/lib/graphql/base";',
              ...DOMAINS.map(
                (domain) => `export * from "@/lib/graphql/operations/${domain}";`,
              ),
            ].join("\n"),
          },
        },
      ],
    },
  },
  hooks: {
    afterAllFileWrite: ["node scripts/graphql-postprocess.js"],
  },
};

export default config;
