import type { CodegenConfig } from "@graphql-codegen/cli";

/**
 * Generated from the schema the API commits, not from a running server.
 *
 * Reading `NEXT_PUBLIC_GRAPHQL_URL` meant codegen needed a live API and a
 * reachable database, could not run in CI, and could silently generate against
 * a deployed schema. The sibling workspace already commits the artifact, so
 * this is the one dependency a monorepo should make trivial.
 */
const config: CodegenConfig = {
  schema: "../api/src/graphql/schema.gql",
  documents: ["src/lib/graphql/documents/**/*.graphql"],
  generates: {
    "src/lib/graphql/generated.ts": {
      plugins: ["typescript", "typescript-operations", "typed-document-node"],
      config: {
        avoidOptionals: false,
        maybeValue: "T | null",
        scalars: {
          DateTime: "string",
          Date: "string",
        },
        enumsAsTypes: false,
      },
    },
  },
};

export default config;
