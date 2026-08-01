import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, relative, resolve } from "node:path";

import ts from "typescript";

const apiRoot = dirname(
  new URL(import.meta.url).pathname.replace(/^\/(.:)/, "$1"),
);
const repoRoot = resolve(apiRoot, "../..");
const normalize = (path) => path.replaceAll("\\", "/");
const unwrap = (node) => {
  while (
    ts.isAsExpression(node) ||
    ts.isSatisfiesExpression(node) ||
    ts.isParenthesizedExpression(node)
  ) {
    node = node.expression;
  }
  return node;
};

const ownershipSource = ts.createSourceFile(
  "domain-ownership.ts",
  readFileSync(
    resolve(apiRoot, "src/architecture/domain-ownership.ts"),
    "utf8",
  ),
  ts.ScriptTarget.Latest,
  true,
);
const exceptionSource = ts.createSourceFile(
  "boundary-exceptions.ts",
  readFileSync(
    resolve(apiRoot, "src/architecture/boundary-exceptions.ts"),
    "utf8",
  ),
  ts.ScriptTarget.Latest,
  true,
);
const tsconfig = JSON.parse(
  readFileSync(resolve(apiRoot, "tsconfig.json"), "utf8"),
);

const variableInitializer = (source, name) => {
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    const declaration = statement.declarationList.declarations.find(
      (item) => ts.isIdentifier(item.name) && item.name.text === name,
    );
    if (declaration?.initializer) {
      return unwrap(declaration.initializer);
    }
  }
  throw new Error(`Architecture manifest is missing ${name}.`);
};

const contextConstants = Object.fromEntries(
  variableInitializer(ownershipSource, "BOUNDED_CONTEXTS").properties.map(
    (property) => [property.name.text, property.initializer.text],
  ),
);
const moduleOwnership = Object.fromEntries(
  variableInitializer(ownershipSource, "MODULE_OWNERSHIP").properties.map(
    (property) => [
      property.name.text,
      contextConstants[property.initializer.name.text],
    ],
  ),
);
const domainDependencies = Object.fromEntries(
  variableInitializer(ownershipSource, "DOMAIN_DEPENDENCIES").properties.map(
    (property) => [
      property.name.text,
      property.initializer.elements.map((entry) => entry.text),
    ],
  ),
);
const fingerprints = Object.fromEntries(
  variableInitializer(
    exceptionSource,
    "IMPORT_EXCEPTION_FINGERPRINTS",
  ).properties.map((property) => [
    property.name.text,
    property.initializer.text,
  ]),
);
const exceptions = variableInitializer(exceptionSource, "BOUNDARY_EXCEPTIONS")
  .elements.filter(ts.isObjectLiteralExpression)
  .filter((entry) => {
    const kind = entry.properties.find(
      (property) => property.name?.text === "kind",
    );
    return kind?.initializer?.text === "import";
  })
  .flatMap((entry) => {
    const value = (name) =>
      entry.properties.find((property) => property.name?.text === name)
        ?.initializer;
    const files = value("files");
    return files.elements.map((file) => ({
      id: value("id").text,
      source: value("source").text,
      target: value("target").text,
      file: file.text,
    }));
  });

const aliases = Object.entries(tsconfig.compilerOptions.paths).map(
  ([alias, targets]) => ({
    prefix: alias.replace(/\*$/, ""),
    target: targets[0].replace(/\*$/, ""),
  }),
);
const resolveImport = (sourceFile, specifier) => {
  const base = specifier.startsWith(".")
    ? resolve(dirname(sourceFile), specifier)
    : (() => {
        const alias = aliases.find((entry) =>
          specifier.startsWith(entry.prefix),
        );
        return alias
          ? resolve(apiRoot, alias.target, specifier.slice(alias.prefix.length))
          : undefined;
      })();
  if (!base) return undefined;
  return [base, `${base}.ts`, resolve(base, "index.ts")].find(existsSync);
};
const contextOf = (file) => {
  const match = /^src\/modules\/([^/]+)(?:\/|$)/.exec(
    normalize(relative(apiRoot, file)),
  );
  return match ? moduleOwnership[match[1]] : "platform-shared";
};

export const moduleBoundariesPlugin = {
  rules: {
    "internal-imports": {
      meta: {
        type: "problem",
        schema: [],
        messages: {
          boundary:
            "{{source}} cannot import {{target}} internals ({{specifier}}). Use an explicit public/ contract.",
          publicLeak:
            "A public/ contract cannot expose persistence, GraphQL, entity, or DTO internals ({{specifier}}).",
        },
      },
      create(context) {
        const sourceFile = context.filename;
        if (sourceFile.endsWith(".spec.ts")) return {};
        const sourceContext = contextOf(sourceFile);
        const sourcePath = normalize(relative(repoRoot, sourceFile));
        const fileImports = context.sourceCode.ast.body
          .map((node) => node.source?.value)
          .filter((value) => typeof value === "string");
        const exceptionIsExact = (entry) => {
          const targetSpecifiers = [
            ...new Set(
              fileImports.filter((specifier) => {
                const target = resolveImport(sourceFile, specifier);
                return target && contextOf(target) === entry.target;
              }),
            ),
          ].sort();
          const actual = createHash("sha256")
            .update(targetSpecifiers.join("\n"))
            .digest("hex");
          return fingerprints[`${entry.id}:${entry.file}`] === actual;
        };
        const inspect = (node) => {
          const specifier = node.source?.value;
          if (typeof specifier !== "string") return;
          if (
            sourcePath.includes("/public/") &&
            (specifier === "@prisma/client" || specifier === "@nestjs/graphql")
          ) {
            context.report({
              node,
              messageId: "publicLeak",
              data: { specifier },
            });
            return;
          }
          const targetFile = resolveImport(sourceFile, specifier);
          if (!targetFile) return;
          const targetContext = contextOf(targetFile);
          const targetPath = normalize(relative(repoRoot, targetFile));
          if (
            sourcePath.includes("/public/") &&
            /\/(?:entities|dtos)\//.test(targetPath)
          ) {
            context.report({
              node,
              messageId: "publicLeak",
              data: { specifier },
            });
            return;
          }
          if (
            sourceContext === targetContext ||
            targetContext === "platform-shared" ||
            targetContext === "communications"
          )
            return;
          const moduleWiring =
            sourcePath.endsWith(".module.ts") &&
            targetPath.endsWith(".module.ts");
          const publicContract =
            targetPath.includes("/public/") &&
            domainDependencies[sourceContext]?.includes(targetContext) &&
            !targetPath.includes("/entities/") &&
            !targetPath.includes("/dtos/");
          const excepted = exceptions.some(
            (entry) =>
              entry.source === sourceContext &&
              entry.target === targetContext &&
              entry.file === sourcePath &&
              exceptionIsExact(entry),
          );
          if (moduleWiring || publicContract || excepted) return;
          context.report({
            node,
            messageId: "boundary",
            data: { source: sourceContext, target: targetContext, specifier },
          });
        };
        return { ImportDeclaration: inspect, ExportNamedDeclaration: inspect };
      },
    },
  },
};
