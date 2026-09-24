import { selectByRelaxation, worstTier } from "./roadmap-relaxation.util";

describe("selectByRelaxation", () => {
  it("stops at the first tier that reaches the minimum pool size", async () => {
    const seen: string[] = [];
    const result = await selectByRelaxation(async (tier) => {
      seen.push(tier);
      if (tier === "EXACT") return [1, 2, 3, 4, 5, 6];
      return [];
    });

    expect(result).toEqual({ items: [1, 2, 3, 4, 5, 6], tier: "EXACT" });
    expect(seen).toEqual(["EXACT"]);
  });

  it("escalates through tiers in order until the pool is large enough", async () => {
    const seen: string[] = [];
    const result = await selectByRelaxation(async (tier) => {
      seen.push(tier);
      if (tier === "EXACT") return [1];
      if (tier === "SIMILAR") return [1, 2, 3, 4, 5, 6, 7];
      return [];
    });

    expect(result.tier).toBe("SIMILAR");
    expect(result.items).toHaveLength(7);
    expect(seen).toEqual(["EXACT", "SIMILAR"]);
  });

  it("uses BROAD's own result even when it is still below the minimum", async () => {
    const result = await selectByRelaxation(async (tier) => {
      if (tier === "BROAD") return [1, 2];
      return [];
    });

    expect(result).toEqual({ items: [1, 2], tier: "BROAD" });
  });

  it("returns an empty pool at BROAD when the catalogue is truly empty", async () => {
    const result = await selectByRelaxation(async () => []);

    expect(result).toEqual({ items: [], tier: "BROAD" });
  });

  it("respects a custom minimum pool size", async () => {
    const seen: string[] = [];
    const result = await selectByRelaxation(async (tier) => {
      seen.push(tier);
      if (tier === "EXACT") return [1, 2];
      return [];
    }, 2);

    expect(result).toEqual({ items: [1, 2], tier: "EXACT" });
    expect(seen).toEqual(["EXACT"]);
  });
});

describe("worstTier", () => {
  it("returns null for an empty list", () => {
    expect(worstTier([])).toBeNull();
  });

  it("returns the single tier given", () => {
    expect(worstTier(["SIMILAR"])).toBe("SIMILAR");
  });

  it("picks the loosest tier among a mix", () => {
    expect(worstTier(["EXACT", "RELATED", "SIMILAR"])).toBe("RELATED");
  });

  it("treats EXACT as strictest and BROAD as loosest", () => {
    expect(worstTier(["EXACT", "EXACT"])).toBe("EXACT");
    expect(worstTier(["BROAD", "EXACT"])).toBe("BROAD");
  });
});
