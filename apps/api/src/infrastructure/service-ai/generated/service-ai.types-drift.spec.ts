import { readFileSync } from "fs";

import {
  GENERATED_TYPES_PATH,
  generateServiceAiTypes,
  readOpenApiDocument,
  renderServiceAiTypes,
} from "./service-ai.codegen";
import { SERVICE_AI_CONTRACT_VERSION } from "./service-ai.types";

/**
 * The Roadmap AI Service is operated by another team. This is what stops one of
 * their contract changes from reaching production as a runtime surprise: the
 * vendored document and the committed types have to move together, in one diff.
 */
describe("Roadmap AI generated types", () => {
  /**
   * Compared by content, not by bytes. `core.autocrlf` rewrites line endings on
   * checkout for Windows contributors, and a CRLF working copy of a file the
   * generator writes with LF is not drift.
   */
  const normalise = (value: string) => value.replaceAll("\r\n", "\n");

  it("matches what the vendored contract generates today", () => {
    expect(normalise(readFileSync(GENERATED_TYPES_PATH, "utf8"))).toBe(
      normalise(renderServiceAiTypes()),
    );
  });

  it("records the contract version the vendored document declares", () => {
    expect(SERVICE_AI_CONTRACT_VERSION).toBe(
      readOpenApiDocument().info.version,
    );
  });

  it("fails when the contract changes but the committed types do not", () => {
    const document = readOpenApiDocument();
    document.components.schemas.SkillLevel.enum = [
      "BEGINNER",
      "INTERMEDIATE",
      "ADVANCED",
      "MASTER",
    ];

    expect(normalise(generateServiceAiTypes(document))).not.toBe(
      normalise(readFileSync(GENERATED_TYPES_PATH, "utf8")),
    );
  });

  it("refuses to generate from a construct it does not understand", () => {
    const document = readOpenApiDocument();
    document.components.schemas.SubjectOption.properties = {
      id: { type: "geography" },
    };

    expect(() => generateServiceAiTypes(document)).toThrow(
      /Unsupported construct/,
    );
  });

  it("stops rather than guessing when a documented limit disappears", () => {
    const document = readOpenApiDocument();
    delete document.components.schemas.GenerateRequest.properties?.candidates
      .maxItems;

    expect(() => generateServiceAiTypes(document)).toThrow(
      /no longer bounds GenerateRequest.candidates by maxItems/,
    );
  });
});
