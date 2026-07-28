// @ts-check
import { baseRules } from "@loopskey/eslint-config/base";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import eslint from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["eslint.config.mjs", "dist/**", "node_modules/**", "prisma/**"],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: "commonjs",
    },
  },
  {
    rules: {
      ...baseRules,
      // apps/api must never reach into apps/front. Nothing does today; this
      // keeps it that way now that shared packages exist as an alternative.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/apps/front/**", "**/front/src/**"],
              message:
                "apps/api must not import from apps/front. Share the value " +
                "through @loopskey/api-contracts instead.",
            },
          ],
        },
      ],
    },
  },
);
