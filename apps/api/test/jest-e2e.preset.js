const { pathsToModuleNameMapper } = require("ts-jest");

const { compilerOptions } = require("../tsconfig.json");

const derived = pathsToModuleNameMapper(compilerOptions.paths, {
  prefix: "<rootDir>/",
});

// Preserve package resolution for @prisma/client while mapping the two local
// Prisma modules declared behind the otherwise broad tsconfig alias.
delete derived["^@prisma/(.*)$"];

module.exports = {
  moduleNameMapper: {
    "^@prisma/(prisma\\.service|prisma\\.module|role-profile-registry\\.service)$":
      "<rootDir>/src/modules/prisma/$1",
    ...derived,
  },
};
