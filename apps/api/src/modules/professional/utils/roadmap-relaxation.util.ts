export type RoadmapMatchTier = "EXACT" | "SIMILAR" | "RELATED" | "BROAD";

export const TIER_ORDER: readonly RoadmapMatchTier[] = [
  "EXACT",
  "SIMILAR",
  "RELATED",
  "BROAD",
];

export const MIN_CANDIDATE_POOL_SIZE = 6;

const TIER_SEVERITY: Record<RoadmapMatchTier, number> = {
  EXACT: 0,
  SIMILAR: 1,
  RELATED: 2,
  BROAD: 3,
};

export type RelaxationResult<T> = {
  items: T[];
  tier: RoadmapMatchTier;
};

export const selectByRelaxation = async <T>(
  queryTier: (tier: RoadmapMatchTier) => Promise<T[]>,
  minPoolSize: number = MIN_CANDIDATE_POOL_SIZE,
): Promise<RelaxationResult<T>> => {
  let last: RelaxationResult<T> = { items: [], tier: "BROAD" };
  for (const tier of TIER_ORDER) {
    const items = await queryTier(tier);
    last = { items, tier };
    if (items.length >= minPoolSize || tier === "BROAD") return last;
  }
  return last;
};

export const worstTier = (
  tiers: readonly RoadmapMatchTier[],
): RoadmapMatchTier | null => {
  if (tiers.length === 0) return null;
  return tiers.reduce((worst, tier) =>
    TIER_SEVERITY[tier] > TIER_SEVERITY[worst] ? tier : worst,
  );
};
