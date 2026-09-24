import {
  groupKeysMatching,
  rankTerms,
  trigramSimilarity,
  type RankableTerm,
} from "./roadmap-relevance.util";

const term = (
  id: string,
  label: string,
  groupKey: string,
  groupLabel: string,
): RankableTerm => ({ id, label, groupKey, groupLabel });

const TECH_CLOUD = term(
  "t-cloud",
  "Cloud & Infrastructure",
  "TECHNOLOGY",
  "Technology",
);
const TECH_SECURITY = term(
  "t-security",
  "Cybersecurity",
  "TECHNOLOGY",
  "Technology",
);
const HEALTH_CLINICAL = term(
  "t-clinical",
  "Clinical Practice",
  "HEALTHCARE",
  "Healthcare",
);
const HEALTH_SAFETY = term(
  "t-safety",
  "Patient Safety",
  "HEALTHCARE",
  "Healthcare",
);

describe("trigramSimilarity", () => {
  it("scores identical text at its maximum", () => {
    expect(trigramSimilarity("cloud computing", "cloud computing")).toBe(1);
  });

  it("scores unrelated text at zero", () => {
    expect(trigramSimilarity("cloud computing", "xyz")).toBe(0);
  });

  it("treats blank input as no match rather than throwing", () => {
    expect(trigramSimilarity("", "cloud")).toBe(0);
    expect(trigramSimilarity("cloud", "   ")).toBe(0);
  });

  it("scores a close match above a distant one", () => {
    const close = trigramSimilarity("cloud architecture", "cloud architect");
    const distant = trigramSimilarity("cloud architecture", "nursing");
    expect(close).toBeGreaterThan(distant);
  });
});

describe("rankTerms", () => {
  it("ranks a software-engineering goal's technology terms above healthcare terms", () => {
    const ranked = rankTerms(
      [HEALTH_CLINICAL, TECH_CLOUD, HEALTH_SAFETY, TECH_SECURITY],
      {
        text: ["I want to move into cloud architecture and security"],
        favoredGroupKeys: [],
        selectedIds: [],
      },
    );

    const techRank = ranked.findIndex((t) => t.groupKey === "TECHNOLOGY");
    const healthRank = ranked.findIndex((t) => t.groupKey === "HEALTHCARE");
    expect(ranked[0].groupKey).toBe("TECHNOLOGY");
    expect(techRank).toBeLessThan(healthRank);
  });

  it("boosts every term in a favored group over an equally-unmatched one", () => {
    const ranked = rankTerms([HEALTH_CLINICAL, TECH_CLOUD], {
      text: [],
      favoredGroupKeys: ["TECHNOLOGY"],
      selectedIds: [],
    });

    expect(ranked[0]).toBe(TECH_CLOUD);
  });

  it("always sorts an already-selected term first, even with no relevance signal", () => {
    const ranked = rankTerms([TECH_CLOUD, TECH_SECURITY, HEALTH_CLINICAL], {
      text: ["nothing to do with any of these"],
      favoredGroupKeys: [],
      selectedIds: ["t-clinical"],
    });

    expect(ranked[0].id).toBe("t-clinical");
  });

  it("is a stable ranking over the same input, so a widget's chip order does not flicker", () => {
    const context = {
      text: ["become a cloud security lead"],
      favoredGroupKeys: ["TECHNOLOGY"],
      selectedIds: [],
    };
    const first = rankTerms(
      [TECH_CLOUD, TECH_SECURITY, HEALTH_CLINICAL],
      context,
    );
    const second = rankTerms(
      [TECH_CLOUD, TECH_SECURITY, HEALTH_CLINICAL],
      context,
    );
    expect(first.map((t) => t.id)).toEqual(second.map((t) => t.id));
  });
});

describe("groupKeysMatching", () => {
  it("finds the group of a term whose label closely matches the text", () => {
    const groups = groupKeysMatching("Software Engineer", [
      term("r-swe", "Software Engineer", "COMMON", "Common roles"),
      term("r-nurse", "Nurse", "COMMON", "Common roles"),
    ]);
    expect(groups).toContain("COMMON");
  });

  it("returns nothing for blank text", () => {
    expect(groupKeysMatching(null, [TECH_CLOUD])).toEqual([]);
    expect(groupKeysMatching("   ", [TECH_CLOUD])).toEqual([]);
  });

  it("returns nothing when nothing matches closely enough", () => {
    expect(
      groupKeysMatching("completely unrelated text", [TECH_CLOUD]),
    ).toEqual([]);
  });
});
