import type { CodegenConfig } from "@graphql-codegen/cli";
import dotenv from "dotenv";

dotenv.config();

const config: CodegenConfig = {
  schema: process.env.NEXT_PUBLIC_GRAPHQL_URL || "",
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
