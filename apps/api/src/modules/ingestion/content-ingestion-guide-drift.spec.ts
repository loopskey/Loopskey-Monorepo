import { readFileSync } from "node:fs";
import { join } from "node:path";

import { IngestionMessageCode } from "@ingestion/enums/message-code.enum";
import {
  KIND_INGESTION_COMPRESSED_BODY_LIMIT_BYTES,
  KIND_INGESTION_IDEMPOTENCY_KEY_LIMIT,
  KIND_INGESTION_ITEM_LIMIT,
} from "@ingestion/enums/kind-ingestion.constant";

/**
 * The crawler integration guide restates the ingestion contract in prose. This
 * is the drift standard the repository applies to anything written down twice:
 * the guide's error-code table must name exactly the codes the package defines,
 * and the caps and rate limit it publishes must be the shipped values.
 */
const API_ROOT = join(__dirname, "..", "..", "..");
const GUIDE = readFileSync(
  join(API_ROOT, "docs", "content-ingestion.md"),
  "utf8",
);
const SCHEMA_PRISMA = readFileSync(
  join(API_ROOT, "prisma", "schema.prisma"),
  "utf8",
);

/** The "### Code table" region of section 13. */
const codeTable = (() => {
  const start = GUIDE.indexOf("### Code table");
  const end = GUIDE.indexOf("## 14. Rate limits");
  expect(start).toBeGreaterThan(-1);
  expect(end).toBeGreaterThan(start);
  return GUIDE.slice(start, end);
})();

const documentedCodes = new Set(codeTable.match(/INGESTION_[A-Z_]+/g) ?? []);

const prismaIntDefault = (field: string) => {
  const match = SCHEMA_PRISMA.match(
    new RegExp(`${field}\\s+Int\\s+@default\\((\\d+)\\)`),
  );
  expect(match).not.toBeNull();
  return Number(match![1]);
};

describe("content-ingestion.md drift", () => {
  it("names every ingestion message code and no code that does not exist", () => {
    const packageCodes = Object.values(IngestionMessageCode).sort();
    expect([...documentedCodes].sort()).toEqual(packageCodes);
  });

  it("publishes the shipped item cap", () => {
    const match = GUIDE.match(/Items per batch \| \*\*(\d+)\*\*/);
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBe(KIND_INGESTION_ITEM_LIMIT);
  });

  it("publishes the shipped compressed-body cap in bytes", () => {
    const match = GUIDE.match(/Compressed request body \| \*\*(\d+) bytes/);
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBe(KIND_INGESTION_COMPRESSED_BODY_LIMIT_BYTES);
  });

  it("publishes the shipped idempotency-key length cap", () => {
    const match = GUIDE.match(
      /`Idempotency-Key` length \| \*\*(\d+)\*\* characters/,
    );
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBe(KIND_INGESTION_IDEMPOTENCY_KEY_LIMIT);
  });

  it("publishes the shipped default rate allowance", () => {
    const match = GUIDE.match(/\*\*(\d+) requests per (\d+)-second/);
    expect(match).not.toBeNull();
    expect(Number(match![1])).toBe(prismaIntDefault("rateLimit"));
    expect(Number(match![2])).toBe(prismaIntDefault("rateWindowSeconds"));
  });
});
