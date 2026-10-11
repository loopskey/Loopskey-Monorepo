import type { CodegenConfig } from "@graphql-codegen/cli";

const DOMAINS = [
  "auth",
  "user",
  "event",
  "course",
  "landing",
  "podcast",
  "support",
  "youtube",
  "cpd-plan",
  "provider",
  "ingestion",
  "discovery",
  "content-seo",
  "content-url",
  "professional",
  "roadmap-chat",
  "org-dashboard",
  "admin-dashboard",
  "external-learning",
  "content-interaction",
  "association-dashboard",
] as const;

const scalars = {
  DateTime: "string",
  Date: "string",
};

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
        documentMode: "string",
      },
    },
  ]),
);

const config: CodegenConfig = {
  schema: "../api/src/graphql/schema.gql",
  generates: {
    "src/lib/graphql/base.ts": {
      plugins: ["typescript"],
      config: commonConfig,
    },

    ...operationOutputs,

    "src/lib/graphql/generated.ts": {
      documents: [],
      plugins: [
        {
          add: {
            content: [
              "/* Barrel over the split GraphQL modules. Generated: do not edit. */",
              'export * from "@/lib/graphql/base";',
              ...DOMAINS.map(
                (domain) =>
                  `export * from "@/lib/graphql/operations/${domain}";`,
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
