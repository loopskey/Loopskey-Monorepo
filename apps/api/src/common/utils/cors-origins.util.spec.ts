import { resolveCorsOrigins } from "@utils/cors-origins.util";

const FALLBACK = "https://www.loopskey.com";

describe("resolveCorsOrigins", () => {
  it("returns every origin in a comma-separated list", () => {
    expect(
      resolveCorsOrigins(
        "https://www.loopskey.com,https://loopskey.com",
        FALLBACK,
      ),
    ).toEqual(["https://www.loopskey.com", "https://loopskey.com"]);
  });

  it("keeps the apex origin the single-origin configuration dropped", () => {
    expect(
      resolveCorsOrigins(
        "https://www.loopskey.com,https://loopskey.com",
        FALLBACK,
      ),
    ).toContain("https://loopskey.com");
  });

  it("trims whitespace around each origin", () => {
    expect(
      resolveCorsOrigins(
        " https://www.loopskey.com , https://loopskey.com ",
        FALLBACK,
      ),
    ).toEqual(["https://www.loopskey.com", "https://loopskey.com"]);
  });

  it("drops empty entries from a trailing or doubled separator", () => {
    expect(resolveCorsOrigins("https://www.loopskey.com,,", FALLBACK)).toEqual([
      "https://www.loopskey.com",
    ]);
  });

  it("removes duplicates", () => {
    expect(
      resolveCorsOrigins("https://loopskey.com,https://loopskey.com", FALLBACK),
    ).toEqual(["https://loopskey.com"]);
  });

  it("falls back when the value is undefined", () => {
    expect(resolveCorsOrigins(undefined, FALLBACK)).toEqual([FALLBACK]);
  });

  it("falls back when the value is empty or only separators", () => {
    expect(resolveCorsOrigins("", FALLBACK)).toEqual([FALLBACK]);
    expect(resolveCorsOrigins("   ", FALLBACK)).toEqual([FALLBACK]);
    expect(resolveCorsOrigins(" , , ", FALLBACK)).toEqual([FALLBACK]);
  });

  it("never returns a wildcard, which credentialed requests reject", () => {
    expect(resolveCorsOrigins(undefined, FALLBACK)).not.toContain("*");
  });
});
