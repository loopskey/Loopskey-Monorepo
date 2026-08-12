import { baseRules } from "@loopskey/eslint-config/base";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // GraphQL Code Generator output is never hand-edited, so linting it only
  // produces unfixable errors. Codegen writes the barrel, the shared schema
  // types and one module per document file.
  {
    ignores: [
      "src/lib/graphql/generated.ts",
      "src/lib/graphql/base.ts",
      "src/lib/graphql/operations/**",
      ".next/**",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      ...baseRules,
      // apps/front must never reach into apps/api. The schema file codegen
      // reads is a build input declared in turbo.json, not a module import.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/apps/api/**", "**/api/src/**"],
              message:
                "apps/front must not import from apps/api. Share the value " +
                "through @loopskey/api-contracts instead.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
