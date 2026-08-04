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
});
