import { readFileSync } from "node:fs";
import { join, relative } from "node:path";

import ts from "typescript";

const apiRoot = join(__dirname, "../../..");
const eventsRoot = join(apiRoot, "src/modules/events");

describe("Events vertical-slice boundaries", () => {
  it("keeps PrismaService access inside Event persistence infrastructure", () => {
    const config = ts.readConfigFile(
      join(apiRoot, "tsconfig.json"),
      ts.sys.readFile,
    );
    const parsed = ts.parseJsonConfigFileContent(
      config.config,
      ts.sys,
      apiRoot,
    );
    const violations = parsed.fileNames
      .filter(
        (file) =>
          file.startsWith(eventsRoot) &&
          file.endsWith(".ts") &&
          !file.endsWith(".spec.ts"),
      )
      .filter((file) => readFileSync(file, "utf8").includes("PrismaService"))
      .map((file) => relative(apiRoot, file).replaceAll("\\", "/"))
      .filter(
        (file) =>
          file !==
          "src/modules/events/infrastructure/persistence/event.repository.ts",
      );

    expect(violations).toEqual([]);
  });

  it("exports only the public API token from the Nest module", () => {
    const moduleSource = readFileSync(
      join(eventsRoot, "events.module.ts"),
      "utf8",
    );
    expect(moduleSource).toContain("exports: [EVENTS_API]");
    expect(moduleSource).not.toContain("exports: [EventService]");
  });
});
