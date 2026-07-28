import { slugify } from "@utils/slug.util";

/**
 * The five private `slugify` methods this replaces, reproduced verbatim.
 *
 * Slugs are stored and already indexed as public URLs, so the consolidation is
 * only safe if output is identical for every input. Comparing against a copy
 * of the original is the only way to assert that rather than assume it.
 */
const originalImplementation = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const INPUTS = [
  "Introduction to Project Management",
  "  leading and trailing whitespace  ",
  "It's a Developer's Guide",
  'Quoted "Title" Here',
  "Multiple   Internal   Spaces",
  "Punctuation!@#$%^&*()Everywhere",
  "---already-hyphenated---",
  "CAPS LOCK COURSE",
  "café naïve résumé",
  "日本語のコース",
  "Mixed 123 Numbers 456",
  "trailing-symbols!!!",
  "!!!leading-symbols",
  "",
  "     ",
  "!!!",
  "a",
  "A-B_C.D/E",
  "2026 CPD & PDU Tracker (v2)",
  "under_scores_and-hyphens",
];

describe("slugify", () => {
  it.each(INPUTS)("matches the original implementation for %j", (input) => {
    expect(slugify(input)).toBe(originalImplementation(input));
  });

  it("produces the expected slug for a typical title", () => {
    expect(slugify("Introduction to Project Management")).toBe(
      "introduction-to-project-management",
    );
  });

  it("strips quotes rather than replacing them with a separator", () => {
    expect(slugify("It's a Developer's Guide")).toBe("its-a-developers-guide");
  });

  it("returns an empty string when nothing survives", () => {
    expect(slugify("!!!")).toBe("");
    expect(slugify("   ")).toBe("");
    expect(slugify("")).toBe("");
  });

  it("collapses runs of separators and trims them from both ends", () => {
    expect(slugify("---already-hyphenated---")).toBe("already-hyphenated");
    expect(slugify("Multiple   Internal   Spaces")).toBe(
      "multiple-internal-spaces",
    );
  });
});
