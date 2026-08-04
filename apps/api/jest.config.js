const { pathsToModuleNameMapper } = require("ts-jest");

const { compilerOptions } = require("./tsconfig.json");

/**
 * Alias resolution is derived from `tsconfig.json` rather than restated.
 *
 * The hand-written map this replaces covered 10 of the 26 declared aliases, so
 * any spec touching `@course`, `@events`, `@podcast`, `@youtube`, `@provider`,
 * `@user`, `@landing`, `@ext`, `@contentAction` or `@app` failed to run with a
 * misleading "Cannot find module" — 130 source files across 10 of 17 modules.
 *
 * Plain CommonJS on purpose: a `jest.config.ts` needs `ts-node` resolvable from
 * Jest's own nested `jest-config`, which npm hoisting does not guarantee here.
 */
const derived = pathsToModuleNameMapper(compilerOptions.paths, {
  prefix: "<rootDir>/../",
});

/**
 * `@prisma/*` must stay narrow.
 *
 * tsconfig maps `@prisma/*` to `src/modules/prisma/*`, but only two modules
 * live there. The derived catch-all would swallow `@prisma/client` and break
 * every spec that touches the database, so it is dropped in favour of the
 * specific rule declared below.
 */
delete derived["^@prisma/(.*)$"];

module.exports = {
  moduleFileExtensions: ["js", "json", "ts"],
  rootDir: "src",
  testRegex: ".*\\.spec\\.ts$",
  // TypeScript only. Workspace packages ship compiled CommonJS that Jest runs
  // natively; routing it through ts-jest only produces `allowJs` warnings.
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "<rootDir>/../tsconfig.spec.json" }],
  },
  moduleNameMapper: {
    "^@prisma/(prisma\\.service|prisma\\.module|role-profile-registry\\.service)$":
      "<rootDir>/modules/prisma/$1",
    ...derived,
  },
  collectCoverageFrom: ["**/*.(t|j)s"],
  coverageDirectory: "../coverage",
  testEnvironment: "node",
};
