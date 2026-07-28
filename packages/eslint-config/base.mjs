/**
 * Rules that should hold everywhere, regardless of framework.
 *
 * Kept deliberately small. Framework specifics stay in each app's own config;
 * this exists so a decision made once does not have to be remembered twice.
 */
export const baseRules = {
  // The codebase marks deliberate discards with a leading underscore
  // (`_sort`, `_passwordHash`). This was previously configured only in the API.
  "@typescript-eslint/no-unused-vars": [
    "error",
    {
      argsIgnorePattern: "^_",
      varsIgnorePattern: "^_",
      caughtErrorsIgnorePattern: "^_",
      ignoreRestSiblings: true,
    },
  ],
};

export default [
  {
    rules: baseRules,
  },
];
