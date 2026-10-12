import {
  assertSubstantiveTopicHubCopy,
  cleanTopicHubCategory,
  cleanTopicHubCopy,
  sectionsFromJson,
  snippetOf,
} from "./topic-hub-copy.util";

const copy = {
  title: "  Leadership   basics ",
  introduction: "A short introduction.\r\n\r\n\r\n\r\nSecond paragraph.",
  guidance: "Guidance text.",
};

describe("cleanTopicHubCopy", () => {
  it("trims, normalises line breaks and keeps paragraphs", () => {
    expect(cleanTopicHubCopy(copy)).toEqual({
      title: "Leadership basics",
      introduction: "A short introduction.\n\nSecond paragraph.",
      guidance: "Guidance text.",
      sections: [],
    });
  });

  it("strips control characters", () => {
    expect(
      cleanTopicHubCopy({ ...copy, title: "Lead\u0000er\u0007ship" }).title,
    ).toBe("Lead er ship");
  });

  it.each([
    ["markup in the title", { title: "A <b>bold</b> title" }],
    ["markup in the guidance", { guidance: "See <script>x</script>" }],
    ["an empty title", { title: "  " }],
    ["an oversize title", { title: "a".repeat(121) }],
    ["an oversize introduction", { introduction: "a".repeat(1501) }],
    ["an oversize guidance", { guidance: "a".repeat(6001) }],
    ["an empty section body", { sections: [{ heading: "Head", body: " " }] }],
    [
      "too many sections",
      {
        sections: Array.from({ length: 9 }, () => ({
          heading: "Head",
          body: "Body",
        })),
      },
    ],
  ])("rejects %s", (_name, overrides) => {
    expect(() => cleanTopicHubCopy({ ...copy, ...overrides })).toThrow();
  });
});

describe("assertSubstantiveTopicHubCopy", () => {
  it("requires a real introduction and guidance", () => {
    const enough = {
      title: "Title",
      introduction: "i".repeat(80),
      guidance: "g".repeat(160),
      sections: [],
    };
    expect(() => assertSubstantiveTopicHubCopy(enough)).not.toThrow();
    expect(() =>
      assertSubstantiveTopicHubCopy({ ...enough, introduction: "short" }),
    ).toThrow();
    expect(() =>
      assertSubstantiveTopicHubCopy({ ...enough, guidance: "short" }),
    ).toThrow();
  });
});

describe("cleanTopicHubCategory", () => {
  it("accepts a shared catalog category in any case and clears empties", () => {
    expect(cleanTopicHubCategory("leadership")).toBe("LEADERSHIP");
    expect(cleanTopicHubCategory("  ")).toBeNull();
    expect(cleanTopicHubCategory(null)).toBeNull();
    expect(cleanTopicHubCategory(undefined)).toBeNull();
  });

  it("rejects an unknown category", () => {
    expect(() => cleanTopicHubCategory("EVERYTHING")).toThrow();
  });
});

describe("sectionsFromJson", () => {
  it("keeps only well-formed sections", () => {
    expect(
      sectionsFromJson([
        { heading: "A", body: "B" },
        { heading: 1, body: "B" },
        null,
        "text",
      ]),
    ).toEqual([{ heading: "A", body: "B" }]);
    expect(sectionsFromJson("nope")).toEqual([]);
  });
});

describe("snippetOf", () => {
  it("collapses whitespace and truncates with an ellipsis", () => {
    expect(snippetOf("one   two\nthree", 50)).toBe("one two three");
    expect(snippetOf("abcdefghij", 5)).toBe("abcd…");
  });
});
