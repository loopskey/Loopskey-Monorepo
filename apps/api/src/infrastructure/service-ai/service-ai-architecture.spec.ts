import {
  collectLocalImports,
  repoPath,
} from "../../architecture/architecture-test-utils";

/**
 * Consumers depend on the interface, never on the HTTP implementation.
 *
 * `src/infrastructure` is platform-shared, so the boundary tests that police
 * domain-to-domain imports let anything through here. This is the rule they
 * cannot express: a domain module may inject `SERVICE_AI_PORT` and nothing
 * else, so error translation, timeouts and the provider's vocabulary stay in
 * one place instead of leaking into resolvers and outbox handlers.
 */
const SERVICE_AI_DIRECTORY = "apps/api/src/infrastructure/service-ai/";

/** The port itself, plus the module a consumer imports to wire it up. */
const PERMITTED = new Set([
  `${SERVICE_AI_DIRECTORY}service-ai.port.ts`,
  `${SERVICE_AI_DIRECTORY}service-ai.module.ts`,
]);

const reaches = collectLocalImports()
  .filter((entry) => repoPath(entry.sourceFile).includes("/src/modules/"))
  .map((entry) => ({
    source: repoPath(entry.sourceFile),
    target: repoPath(entry.targetFile),
  }))
  .filter((entry) => entry.target.startsWith(SERVICE_AI_DIRECTORY));

describe("Roadmap AI client boundary", () => {
  it("lets no domain module import anything but the port or the module", () => {
    expect(reaches.filter((entry) => !PERMITTED.has(entry.target))).toEqual([]);
  });

  it("lets only a Nest module import the module that wires the client", () => {
    expect(
      reaches.filter(
        (entry) =>
          entry.target.endsWith("service-ai.module.ts") &&
          !entry.source.endsWith(".module.ts"),
      ),
    ).toEqual([]);
  });

  it("keeps the generated provider types out of every domain module", () => {
    // Provider vocabulary crossing into a domain module is the failure this
    // whole phase exists to prevent.
    expect(
      reaches.filter((entry) => entry.target.includes("/generated/")),
    ).toEqual([]);
  });

  it("keeps Prisma out of the client", () => {
    const prismaImports = collectLocalImports()
      .filter((entry) =>
        repoPath(entry.sourceFile).startsWith(SERVICE_AI_DIRECTORY),
      )
      .filter((entry) =>
        repoPath(entry.targetFile).includes("/modules/prisma/"),
      );

    expect(prismaImports).toEqual([]);
  });
});
