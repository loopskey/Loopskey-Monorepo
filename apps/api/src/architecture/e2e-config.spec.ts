import { createRequire } from "module";

import { API_ROOT } from "./architecture-test-utils";

const localRequire = createRequire(`${API_ROOT}/package.json`);

describe("E2E Jest configuration", () => {
  it("derives every TypeScript alias instead of maintaining a second list", () => {
    const { compilerOptions } = localRequire(`${API_ROOT}/tsconfig.json`) as {
      compilerOptions: { paths: Record<string, string[]> };
    };
    const preset = localRequire(`${API_ROOT}/test/jest-e2e.preset.js`) as {
      moduleNameMapper: Record<string, string>;
    };

    for (const alias of Object.keys(compilerOptions.paths)) {
      if (alias === "@prisma/*") continue;
      expect(
        Object.prototype.hasOwnProperty.call(
          preset.moduleNameMapper,
          `^${alias.replace("*", "(.*)")}$`,
        ),
      ).toBe(true);
    }
    expect(preset.moduleNameMapper["^@prisma/(.*)$"]).toBeUndefined();
    expect(
      preset.moduleNameMapper[
        "^@prisma/(prisma\\.service|prisma\\.module|role-profile-registry\\.service)$"
      ],
    ).toBeDefined();
  });

  it("runs E2E suites one at a time against the shared database", () => {
    // JSON cannot carry the reason, so it lives here. Every E2E suite boots a
    // full application against one PostgreSQL instance, and the concurrency
    // suites deliberately saturate it. Running the suites in parallel exhausts
    // the connection pool and turns real assertions into transaction timeouts,
    // a failure mode that says nothing about the code under test.
    const config = localRequire(`${API_ROOT}/test/jest-e2e.json`) as {
      maxWorkers?: number;
    };
    expect(config.maxWorkers).toBe(1);
  });
});
