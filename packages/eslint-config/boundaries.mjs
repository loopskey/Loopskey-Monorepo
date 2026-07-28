/**
 * Dependency-direction rules for the workspace.
 *
 * The boundary is clean today by discipline, not tooling — the audit found no
 * cross-application import anywhere. These rules exist so it stays that way now
 * that shared packages give the imports somewhere new to go.
 *
 * Direction:
 *
 *   apps/front -> packages/*
 *   apps/api   -> packages/*
 *   packages/* -> (nothing)
 *
 * The one intentional exception is a build input, not a module import:
 * `apps/front` reads `apps/api/src/graphql/schema.gql` through codegen, which
 * is declared in `turbo.json` and invisible to ESLint.
 */

const noCrossApp = (self, other) => ({
  files: [`apps/${self}/**/*`],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: [`**/apps/${other}/**`, `@/../../${other}/**`],
            message:
              `apps/${self} must not import from apps/${other}. ` +
              "Share the value through packages/api-contracts instead.",
          },
        ],
      },
    ],
  },
});

/**
 * Applied inside `packages/*`. A shared package that reaches for Prisma, Nest,
 * React or Next stops being shareable — that is the whole constraint.
 */
export const packageBoundaryRules = {
  files: ["packages/**/*.{ts,tsx,mts,cts}"],
  rules: {
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["**/apps/**"],
            message:
              "A shared package must not import from an application. " +
              "Dependencies point from apps to packages, never back.",
          },
          {
            group: [
              "@prisma/client",
              "@nestjs/*",
              "next",
              "next/*",
              "react",
              "react-dom",
            ],
            message:
              "A shared package must stay framework-free. Keep Prisma, Nest, " +
              "React and Next inside the application that owns them.",
          },
        ],
      },
    ],
  },
};

export default [
  noCrossApp("api", "front"),
  noCrossApp("front", "api"),
  packageBoundaryRules,
];
