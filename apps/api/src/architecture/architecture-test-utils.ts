import { existsSync, readFileSync, readdirSync } from "fs";
import { dirname, relative, resolve } from "path";

import ts from "typescript";

import {
  MODEL_OWNERSHIP,
  MODULE_OWNERSHIP,
  SOURCE_PATH_OWNERSHIP,
  type BoundedContext,
} from "./domain-ownership";

export const REPO_ROOT = resolve(__dirname, "../../../..");
export const API_ROOT = resolve(REPO_ROOT, "apps/api");
export const API_SRC = resolve(API_ROOT, "src");

export const repoPath = (path: string) =>
  relative(REPO_ROOT, path).replaceAll("\\", "/");

export const walkTypeScript = (directory = API_SRC): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) return walkTypeScript(path);
    if (entry.isFile() && entry.name.endsWith(".ts")) return [path];
    return [];
  });

export const contextOfFile = (
  absolutePath: string,
): BoundedContext | undefined => {
  const path = relative(API_ROOT, absolutePath).replaceAll("\\", "/");
  const moduleMatch = /^src\/modules\/([^/]+)(?:\/|$)/.exec(path);
  if (moduleMatch) {
    return MODULE_OWNERSHIP[moduleMatch[1] as keyof typeof MODULE_OWNERSHIP];
  }

  const prefix = Object.keys(SOURCE_PATH_OWNERSHIP)
    .filter(
      (candidate) => path === candidate || path.startsWith(`${candidate}/`),
    )
    .sort((left, right) => right.length - left.length)[0];

  return prefix
    ? SOURCE_PATH_OWNERSHIP[prefix as keyof typeof SOURCE_PATH_OWNERSHIP]
    : undefined;
};

const tsconfig = JSON.parse(
  readFileSync(resolve(API_ROOT, "tsconfig.json"), "utf8"),
) as { compilerOptions: { paths: Record<string, string[]> } };

const aliasEntries = Object.entries(tsconfig.compilerOptions.paths).map(
  ([alias, targets]) => ({
    prefix: alias.replace(/\*$/, ""),
    target: targets[0].replace(/\*$/, ""),
  }),
);

const withTypeScriptExtension = (path: string): string | undefined => {
  const candidates = [path, `${path}.ts`, resolve(path, "index.ts")];
  return candidates.find(existsSync);
};

export const resolveLocalImport = (
  sourceFile: string,
  specifier: string,
): string | undefined => {
  if (specifier.startsWith(".")) {
    return withTypeScriptExtension(resolve(dirname(sourceFile), specifier));
  }

  const alias = aliasEntries.find(({ prefix }) => specifier.startsWith(prefix));
  if (!alias) return undefined;
  return withTypeScriptExtension(
    resolve(API_ROOT, alias.target, specifier.slice(alias.prefix.length)),
  );
};

export type LocalImport = {
  sourceFile: string;
  targetFile: string;
  specifier: string;
};

export const collectLocalImports = (): LocalImport[] =>
  walkTypeScript()
    .filter((file) => !file.endsWith(".spec.ts"))
    .flatMap((sourceFile) => {
      const source = ts.createSourceFile(
        sourceFile,
        readFileSync(sourceFile, "utf8"),
        ts.ScriptTarget.Latest,
        true,
      );
      const imports: LocalImport[] = [];
      const visit = (node: ts.Node) => {
        const literal =
          (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
          node.moduleSpecifier &&
          ts.isStringLiteral(node.moduleSpecifier)
            ? node.moduleSpecifier
            : ts.isCallExpression(node) &&
                node.expression.kind === ts.SyntaxKind.ImportKeyword &&
                node.arguments.length === 1 &&
                ts.isStringLiteral(node.arguments[0])
              ? node.arguments[0]
              : undefined;
        if (literal) {
          const targetFile = resolveLocalImport(sourceFile, literal.text);
          if (targetFile)
            imports.push({ sourceFile, targetFile, specifier: literal.text });
        }
        ts.forEachChild(node, visit);
      };
      visit(source);
      return imports;
    });

export const collectForbiddenPublicContractImports = (
  file: string,
  content: string,
): string[] => {
  const source = ts.createSourceFile(
    file,
    content,
    ts.ScriptTarget.Latest,
    true,
  );
  const forbidden: string[] = [];
  const visit = (node: ts.Node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const value = node.moduleSpecifier.text;
      const target = resolveLocalImport(file, value);
      const targetPath = target ? repoPath(target) : "";
      if (
        value === "@prisma/client" ||
        value === "@nestjs/graphql" ||
        /\/(?:entities|dtos)\//.test(targetPath)
      )
        forbidden.push(value);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return forbidden;
};

const prismaPropertyToModel = new Map(
  Object.keys(MODEL_OWNERSHIP).map((model) => [
    `${model[0].toLowerCase()}${model.slice(1)}`,
    model,
  ]),
);

export type ForeignPrismaAccess = {
  file: string;
  source: BoundedContext;
  target: BoundedContext;
  model: string;
};

const propertyName = (node: ts.Node): string | undefined => {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node)) return node.text;
  return undefined;
};

/** Detect model delegates even when Prisma clients are aliased or indexed. */
export const collectForeignPrismaAccessesFromSource = (
  file: string,
  content: string,
  sourceContext: BoundedContext,
): ForeignPrismaAccess[] => {
  const source = ts.createSourceFile(
    file,
    content,
    ts.ScriptTarget.Latest,
    true,
  );
  const prismaReceivers = new Set<string>(["prisma", "this.prisma"]);
  const delegateAliases = new Map<string, string>();
  const accesses: ForeignPrismaAccess[] = [];

  const expressionText = (node: ts.Expression) => node.getText(source);
  const modelForAccess = (node: ts.Expression): string | undefined => {
    if (ts.isPropertyAccessExpression(node)) {
      return prismaReceivers.has(expressionText(node.expression))
        ? prismaPropertyToModel.get(node.name.text)
        : undefined;
    }
    if (ts.isElementAccessExpression(node) && node.argumentExpression) {
      return prismaReceivers.has(expressionText(node.expression))
        ? prismaPropertyToModel.get(propertyName(node.argumentExpression) ?? "")
        : undefined;
    }
    return undefined;
  };

  // Reach a fixed point so aliases declared before/after other aliases behave
  // identically and transaction callback parameters are treated as clients.
  let changed = true;
  while (changed) {
    changed = false;
    const discover = (node: ts.Node) => {
      if (
        ts.isVariableDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        node.initializer &&
        prismaReceivers.has(expressionText(node.initializer)) &&
        !prismaReceivers.has(node.name.text)
      ) {
        prismaReceivers.add(node.name.text);
        changed = true;
      }
      if (ts.isVariableDeclaration(node) && node.initializer) {
        const model = modelForAccess(node.initializer);
        if (model && ts.isIdentifier(node.name))
          delegateAliases.set(node.name.text, model);
        if (
          ts.isObjectBindingPattern(node.name) &&
          prismaReceivers.has(expressionText(node.initializer))
        ) {
          for (const element of node.name.elements) {
            const key = propertyName(element.propertyName ?? element.name);
            const alias = ts.isIdentifier(element.name)
              ? element.name.text
              : undefined;
            const model = key ? prismaPropertyToModel.get(key) : undefined;
            if (alias && model) delegateAliases.set(alias, model);
          }
        }
      }
      if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.name.text === "$transaction" &&
        prismaReceivers.has(expressionText(node.expression.expression))
      ) {
        for (const argument of node.arguments) {
          if (
            (ts.isArrowFunction(argument) ||
              ts.isFunctionExpression(argument)) &&
            argument.parameters[0] &&
            ts.isIdentifier(argument.parameters[0].name)
          ) {
            const name = argument.parameters[0].name.text;
            if (!prismaReceivers.has(name)) {
              prismaReceivers.add(name);
              changed = true;
            }
          }
        }
      }
      ts.forEachChild(node, discover);
    };
    discover(source);
  }

  const record = (model: string) => {
    const target = MODEL_OWNERSHIP[model as keyof typeof MODEL_OWNERSHIP];
    if (target !== sourceContext)
      accesses.push({
        file: repoPath(file),
        source: sourceContext,
        target,
        model,
      });
  };
  const visit = (node: ts.Node) => {
    if (
      ts.isPropertyAccessExpression(node) ||
      ts.isElementAccessExpression(node)
    ) {
      const model = modelForAccess(node);
      if (model) record(model);
      else if (
        (ts.isPropertyAccessExpression(node) ||
          ts.isElementAccessExpression(node)) &&
        delegateAliases.has(expressionText(node.expression))
      ) {
        record(delegateAliases.get(expressionText(node.expression))!);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return accesses;
};

export const collectForeignPrismaAccesses = (): ForeignPrismaAccess[] => {
  const accesses: ForeignPrismaAccess[] = [];
  for (const file of walkTypeScript().filter(
    (path) => !path.endsWith(".spec.ts"),
  )) {
    const sourceContext = contextOfFile(file);
    if (!sourceContext) continue;
    accesses.push(
      ...collectForeignPrismaAccessesFromSource(
        file,
        readFileSync(file, "utf8"),
        sourceContext,
      ),
    );
  }
  return accesses;
};
