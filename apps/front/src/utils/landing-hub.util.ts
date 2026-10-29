import type { TContentCardItem } from "@/types/content-module.types";

export const pickRecommendedItems = (
  candidates: TContentCardItem[],
  excludedIds: ReadonlySet<string>,
  size: number,
) => {
  const seen = new Set(excludedIds);
  const picked: TContentCardItem[] = [];
  for (const item of candidates) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    picked.push(item);
    if (picked.length === size) break;
  }
  return picked;
};
