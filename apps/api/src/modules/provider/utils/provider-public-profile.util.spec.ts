import {
  assertSubmittableProfile,
  cleanBiography,
  cleanDisplayName,
  cleanLinks,
  cleanReviewNote,
  cleanWebsiteUrl,
  linksFromJson,
} from "./provider-public-profile.util";

describe("cleanWebsiteUrl", () => {
  it.each([
    ["https://studio.example.com/about", "https://studio.example.com/about"],
    ["http://example.org", "http://example.org/"],
    ["  https://example.com/a#section  ", "https://example.com/a"],
  ])("accepts %s", (raw, expected) => {
    expect(cleanWebsiteUrl(raw)).toBe(expected);
  });

  it.each([
    "javascript:alert(1)",
    "data:text/html,boom",
    "ftp://files.example.com",
    "//example.com",
    "https://user:pass@example.com",
    "http://localhost:3000",
    "http://10.0.0.5/admin",
    "https://exa mple.com",
    `https://${"a".repeat(300)}.com`,
  ])("rejects %s", (raw) => {
    expect(() => cleanWebsiteUrl(raw)).toThrow();
  });

  it("treats blank input as no website", () => {
    expect(cleanWebsiteUrl("   ")).toBeNull();
    expect(cleanWebsiteUrl(null)).toBeNull();
    expect(cleanWebsiteUrl(undefined)).toBeNull();
  });
});

describe("text fields", () => {
  it("normalises the display name to one line and rejects markup or blanks", () => {
    expect(cleanDisplayName("  Studio \n  North ")).toBe("Studio North");
    expect(() => cleanDisplayName("<b>x</b>")).toThrow();
    expect(() => cleanDisplayName("  ")).toThrow();
    expect(() => cleanDisplayName("a".repeat(121))).toThrow();
  });

  it("keeps biography paragraphs and rejects markup or oversize text", () => {
    expect(cleanBiography("One.\r\n\r\nTwo.")).toBe("One.\n\nTwo.");
    expect(cleanBiography("   ")).toBeNull();
    expect(() => cleanBiography("<script>x</script>")).toThrow();
    expect(() => cleanBiography("a".repeat(2501))).toThrow();
  });

  it("bounds review notes", () => {
    expect(cleanReviewNote("  Needs more detail ")).toBe("Needs more detail");
    expect(cleanReviewNote(null)).toBeNull();
    expect(() => cleanReviewNote("a".repeat(1001))).toThrow();
  });
});

describe("cleanLinks", () => {
  it("validates every link and caps the list", () => {
    expect(
      cleanLinks([{ label: " Profile ", url: "https://a.example.com" }]),
    ).toEqual([{ label: "Profile", url: "https://a.example.com/" }]);
    expect(() =>
      cleanLinks([{ label: "x", url: "javascript:alert(1)" }]),
    ).toThrow();
    expect(() =>
      cleanLinks(
        Array.from({ length: 6 }, (_, index) => ({
          label: `L${index}`,
          url: `https://l${index}.example.com`,
        })),
      ),
    ).toThrow();
    expect(cleanLinks(undefined)).toEqual([]);
  });
});

describe("assertSubmittableProfile", () => {
  const draft = {
    displayName: "Studio",
    biography: "b".repeat(80),
    websiteUrl: null,
    links: [],
  };

  it("needs a name and a substantive biography", () => {
    expect(() => assertSubmittableProfile(draft)).not.toThrow();
    expect(() =>
      assertSubmittableProfile({ ...draft, displayName: null }),
    ).toThrow();
    expect(() =>
      assertSubmittableProfile({ ...draft, biography: "short" }),
    ).toThrow();
    expect(() =>
      assertSubmittableProfile({ ...draft, biography: null }),
    ).toThrow();
  });
});

describe("linksFromJson", () => {
  it("ignores malformed stored links", () => {
    expect(
      linksFromJson([
        { label: "A", url: "https://a.example.com" },
        { label: 1 },
      ]),
    ).toEqual([{ label: "A", url: "https://a.example.com" }]);
    expect(linksFromJson(undefined)).toEqual([]);
  });
});
