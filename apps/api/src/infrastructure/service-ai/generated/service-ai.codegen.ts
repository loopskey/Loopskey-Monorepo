import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

export type JsonSchema = {
  $ref?: string;
  type?: string;
  enum?: string[];
  items?: JsonSchema;
  anyOf?: JsonSchema[];
  pattern?: string;
  required?: string[];
  maxLength?: number;
  maxItems?: number;
  minItems?: number;
  maximum?: number;
  minimum?: number;
  default?: number;
  properties?: Record<string, JsonSchema>;
  additionalProperties?: boolean | JsonSchema;
};

export type OpenApiDocument = {
  info: { version: string };
  components: { schemas: Record<string, JsonSchema> };
};

export const OPENAPI_DOCUMENT_PATH = resolve(
  __dirname,
  "../../../../contracts/roadmap-ai/roadmap-openapi.json",
);

export const GENERATED_TYPES_PATH = resolve(__dirname, "service-ai.types.ts");

const typeName = (schemaName: string) => `Provider${schemaName}`;

const PRIMITIVES: Record<string, string> = {
  string: "string",
  number: "number",
  integer: "number",
  boolean: "boolean",
  null: "null",
};

const unsupported = (schema: JsonSchema): never => {
  throw new Error(
    `Unsupported construct in the vendored contract: ${JSON.stringify(schema)}`,
  );
};

const isIdentifier = (name: string) => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name);

const render = (schema: JsonSchema, indent: string): string => {
  if (schema.$ref) {
    const referenced = schema.$ref.replace("#/components/schemas/", "");
    if (referenced.includes("/")) return unsupported(schema);
    return typeName(referenced);
  }

  if (schema.anyOf)
    return schema.anyOf.map((member) => render(member, indent)).join(" | ");

  if (schema.enum)
    return schema.enum.map((value) => JSON.stringify(value)).join(" | ");

  if (schema.type === "array") {
    if (!schema.items) return unsupported(schema);
    const item = render(schema.items, indent);
    return item.includes(" ") ? `(${item})[]` : `${item}[]`;
  }

  if (schema.type === "object") {
    if (!schema.properties) {
      const value = schema.additionalProperties;
      if (!value || typeof value === "boolean") return unsupported(schema);
      return `Record<string, ${render(value, indent)}>`;
    }
    const required = new Set(schema.required ?? []);
    const inner = `${indent}  `;
    const members = Object.entries(schema.properties).map(
      ([name, property]) => {
        const key = isIdentifier(name) ? name : JSON.stringify(name);
        const optional = required.has(name) ? "" : "?";
        return `${inner}${key}${optional}: ${render(property, inner)};`;
      },
    );
    return `{\n${members.join("\n")}\n${indent}}`;
  }

  const primitive = schema.type ? PRIMITIVES[schema.type] : undefined;
  return primitive ?? unsupported(schema);
};

type Constraint =
  | "maxItems"
  | "minItems"
  | "maxLength"
  | "maximum"
  | "minimum"
  | "default";

const constraintReader = (schemas: Record<string, JsonSchema>) => {
  const property = (schemaName: string, propertyName: string): JsonSchema => {
    const found = schemas[schemaName]?.properties?.[propertyName];
    if (!found)
      throw new Error(
        `The vendored contract no longer declares ${schemaName}.${propertyName}.`,
      );
    return found;
  };

  return (
    schemaName: string,
    propertyName: string,
    key: Constraint,
  ): number => {
    const schema = property(schemaName, propertyName);
    const value = [schema, ...(schema.anyOf ?? [])]
      .map((candidate) => candidate[key])
      .find((candidate) => candidate !== undefined);
    if (value === undefined)
      throw new Error(
        `The vendored contract no longer bounds ${schemaName}.${propertyName} by ${key}.`,
      );
    return value;
  };
};

const renderLimits = (schemas: Record<string, JsonSchema>) => {
  const at = constraintReader(schemas);
  const limits: Record<string, number> = {
    historyMaxItems: at("ChatTurnRequest", "history", "maxItems"),
    historyMessageMaxLength: at("ChatMessage", "content", "maxLength"),
    userMessageMaxLength: at("ChatTurnRequest", "user_message", "maxLength"),
    subjectOptionsMaxItems: at(
      "ChatTurnRequest",
      "subject_options",
      "maxItems",
    ),
    candidatesMaxItems: at("GenerateRequest", "candidates", "maxItems"),
    candidatesMinItems: at("GenerateRequest", "candidates", "minItems"),
    maxPhasesMaximum: at("GenerateRequest", "max_phases", "maximum"),
    maxPhasesMinimum: at("GenerateRequest", "max_phases", "minimum"),
    maxPhasesDefault: at("GenerateRequest", "max_phases", "default"),
    subjectsMaxItems: at("DraftState", "subjects", "maxItems"),
    formatsMaxItems: at("DraftState", "formats", "maxItems"),
    contentTypesMaxItems: at("DraftState", "content_types", "maxItems"),
    goalMaxLength: at("DraftState", "goal", "maxLength"),
    targetRoleMaxLength: at("DraftState", "target_role", "maxLength"),
    goalReasonMaxLength: at("DraftState", "goal_reason", "maxLength"),
    contextMaxLength: at("DraftState", "context", "maxLength"),
    certificationNameMaxLength: at(
      "DraftState",
      "certification_name",
      "maxLength",
    ),
    subjectOptionIdMaxLength: at("SubjectOption", "id", "maxLength"),
    subjectOptionLabelMaxLength: at("SubjectOption", "label", "maxLength"),
  };

  const entries = Object.entries(limits)
    .map(([name, value]) => `  ${name}: ${value},`)
    .join("\n");

  const creditPattern = schemas.ContentCandidate?.properties?.credits?.anyOf
    ?.map((member) => member.pattern)
    .find((pattern) => pattern !== undefined);
  if (!creditPattern)
    throw new Error(
      "The vendored contract no longer constrains ContentCandidate.credits by pattern.",
    );

  return [
    `export const SERVICE_AI_LIMITS = {\n${entries}\n} as const;\n`,
    "/** The provider's own decimal-string rule for every credit field. */",
    `export const SERVICE_AI_CREDIT_PATTERN = ${JSON.stringify(creditPattern)};\n`,
  ].join("\n");
};

const HEADER = [
  "/* eslint-disable */",
  "/**",
  " * GENERATED FILE — do not edit by hand.",
  " *",
  " * Source: contracts/roadmap-ai/roadmap-openapi.json",
  " * Regenerate: npm run codegen --workspace api",
  " *",
  " * service-ai.types-drift.spec.ts fails when regeneration produces a diff, so",
  " * a provider-side contract change cannot land without this file changing.",
  " */",
  "",
].join("\n");

export const generateServiceAiTypes = (document: OpenApiDocument): string => {
  const schemas = document.components.schemas;
  const declarations = Object.entries(schemas).map(
    ([name, schema]) =>
      `export type ${typeName(name)} = ${render(schema, "")};`,
  );

  return [
    HEADER,
    "/** The contract version these types were generated from. */",
    `export const SERVICE_AI_CONTRACT_VERSION = ${JSON.stringify(document.info.version)};\n`,
    renderLimits(schemas),
    ...declarations.map((declaration) => `${declaration}\n`),
  ].join("\n");
};

export const readOpenApiDocument = (): OpenApiDocument =>
  JSON.parse(readFileSync(OPENAPI_DOCUMENT_PATH, "utf8")) as OpenApiDocument;

export const renderServiceAiTypes = () =>
  generateServiceAiTypes(readOpenApiDocument());

if (require.main === module) {
  writeFileSync(GENERATED_TYPES_PATH, renderServiceAiTypes(), "utf8");
  process.stdout.write(`Wrote ${GENERATED_TYPES_PATH}\n`);
}
