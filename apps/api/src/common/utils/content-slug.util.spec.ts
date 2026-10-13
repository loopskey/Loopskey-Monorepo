import {
  isWellFormedContentSlug,
  normalizeContentSlug,
} from "./content-slug.util";
import { slugify } from "./slug.util";

describe("normalizeContentSlug", () => {
  it.each([
    ["applied-ml", "applied-ml"],
    ["  Applied-ML  ", "applied-ml"],
    ["a", "a"],
    ["2026-summit", "2026-summit"],
    ["a".repeat(200), "a".repeat(200)],
  ])("accepts %j", (raw, expected) => {
    expect(normalizeContentSlug(raw)).toBe(expected);
  });

  it.each([
    "",
    "   ",
    "../secret",
    "a/b",
    "a\\b",
    "a%2Fb",
    "a%2fb",
    "a b",
    "a_b",
    "a.b",
    "-edge",
    "edge-",
    "edge--case",
    "bad\u0000slug",
    "bad\nslug",
    "café",
    "İstanbul",
    "https://evil.test",
    "//evil.test",
    "new",
    "api",
    "FR",
    "a".repeat(201),
  ])("rejects %j", (raw) => {
    expect(() => normalizeContentSlug(raw)).toThrow();
  });

  it("only returns values the slug utility would leave unchanged", () => {
    for (const raw of ["Applied-ML", "x-1", "ABC-123-def"]) {
      const slug = normalizeContentSlug(raw);
      expect(slugify(slug)).toBe(slug);
    }
  });
});

describe("isWellFormedContentSlug", () => {
  it("is false for empty and over-long values and true for stored slugs", () => {
    expect(isWellFormedContentSlug("")).toBe(false);
    expect(isWellFormedContentSlug("a".repeat(201))).toBe(false);
    expect(isWellFormedContentSlug("coursera-ml-101")).toBe(true);
  });
});
