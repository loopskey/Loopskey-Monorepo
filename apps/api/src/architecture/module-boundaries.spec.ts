import { createHash } from "crypto";
import {
  BOUNDARY_EXCEPTIONS,
  IMPORT_EXCEPTION_FINGERPRINTS,
} from "./boundary-exceptions";
import { DOMAIN_DEPENDENCIES } from "./domain-ownership";
import {
  collectLocalImports,
  collectForbiddenPublicContractImports,
  contextOfFile,
  repoPath,
  walkTypeScript,
} from "./architecture-test-utils";
import { readFileSync } from "fs";

const importExceptions = BOUNDARY_EXCEPTIONS.filter(
  (exception) => exception.kind === "import",
);

const localImports = collectLocalImports();
const violations = localImports.flatMap((entry) => {
  const source = contextOfFile(entry.sourceFile);
  const target = contextOfFile(entry.targetFile);
  if (
    !source ||
    !target ||
    source === target ||
    target === "platform-shared" ||
    target === "communications"
  ) {
    return [];
  }

  const sourcePath = repoPath(entry.sourceFile);
  const targetPath = repoPath(entry.targetFile);
  const isCompositionModuleImport =
    sourcePath.endsWith("/modules/app/app.module.ts") &&
    targetPath.endsWith(".module.ts");
  const isApprovedModuleWiring =
    sourcePath.endsWith(".module.ts") &&
    targetPath.endsWith(".module.ts") &&
    (DOMAIN_DEPENDENCIES[source] as readonly string[]).includes(target);
  const isPublicContract =
    targetPath.includes("/public/") &&
    (DOMAIN_DEPENDENCIES[source] as readonly string[]).includes(target);
  if (isCompositionModuleImport || isApprovedModuleWiring || isPublicContract) {
    return [];
  }

  return [{ source, target, file: sourcePath, specifier: entry.specifier }];
});

describe("module boundaries", () => {
  it("pins every import exception to its exact import set", () => {
    const actual: Record<string, string> = {};
    for (const exception of importExceptions) {
      for (const file of exception.files) {
        const specifiers = localImports
          .filter(
            (entry) =>
              repoPath(entry.sourceFile) === file &&
              contextOfFile(entry.targetFile) === exception.target,
          )
          .map((entry) => entry.specifier)
          .sort();
        actual[`${exception.id}:${file}`] = createHash("sha256")
          .update([...new Set(specifiers)].join("\n"))
          .digest("hex");
      }
    }
    expect(actual).toEqual(IMPORT_EXCEPTION_FINGERPRINTS);
  });

  it("permits every existing cross-context internal import only by exception", () => {
    const undocumented = violations.filter(
      (violation) =>
        !importExceptions.some(
          (exception) =>
            exception.source === violation.source &&
            exception.target === violation.target &&
            (exception.files as readonly string[]).includes(violation.file),
        ),
    );

    expect(undocumented).toEqual([]);
  });

  it("does not retain an import exception after its violation disappears", () => {
    const stale = importExceptions.filter(
      (exception) =>
        !exception.files.every((file) =>
          violations.some(
            (violation) =>
              violation.file === file &&
              violation.source === exception.source &&
              violation.target === exception.target,
          ),
        ),
    );

    expect(stale).toEqual([]);
  });

  it("keeps public contracts free of persistence and transport types", () => {
    const violations = walkTypeScript()
      .filter((file) => repoPath(file).includes("/public/"))
      .flatMap((file) =>
        collectForbiddenPublicContractImports(file, readFileSync(file, "utf8")),
      );
    expect(violations).toEqual([]);
  });

  it.each([
    'export { User } from "@prisma/client"',
    'export { ObjectType } from "@nestjs/graphql"',
    'export { UserEntity } from "@user/entities/user.entity"',
    'export { Input } from "@org/dtos/org-pagination.input"',
  ])("rejects a leaking public contract: %s", (source) => {
    expect(
      collectForbiddenPublicContractImports(
        `${process.cwd()}/src/modules/course/public/example.ts`,
        source,
      ),
    ).not.toEqual([]);
  });
});
