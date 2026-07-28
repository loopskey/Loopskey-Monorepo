// @ts-check
import { packageBoundaryRules } from "@loopskey/eslint-config/boundaries";
import { baseRules } from "@loopskey/eslint-config/base";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/**", "node_modules/**", "eslint.config.mjs"] },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      ...baseRules,
      // The reason this package can be shared at all: no application imports,
      // no Prisma, no Nest, no React, no Next.
      ...packageBoundaryRules.rules,
    },
  },
);
