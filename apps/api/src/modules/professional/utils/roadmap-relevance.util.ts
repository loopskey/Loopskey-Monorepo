export const trigramsOf = (value: string): Set<string> => {
  const cleaned = `  ${value.toLowerCase().replace(/\s+/g, " ").trim()}  `;
  const grams = new Set<string>();
  for (let index = 0; index < cleaned.length - 2; index += 1)
    grams.add(cleaned.slice(index, index + 3));
  return grams;
};

export const trigramSimilarity = (a: string, b: string): number => {
  if (!a.trim() || !b.trim()) return 0;
  const setA = trigramsOf(a);
  const setB = trigramsOf(b);
  if (!setA.size || !setB.size) return 0;
  let shared = 0;
  for (const gram of setA) if (setB.has(gram)) shared += 1;
  return shared / (setA.size + setB.size - shared);
};

export type RankableTerm = {
  id: string;
  label: string;
  groupKey: string;
  groupLabel: string;
};

export type RelevanceContext = {
  selectedIds: readonly string[];
  favoredGroupKeys: readonly string[];
  text: readonly (string | null | undefined)[];
};

const GROUP_BOOST = 0.5;
const GROUP_LABEL_WEIGHT = 0.5;

export const rankTerms = <TTerm extends RankableTerm>(
  terms: readonly TTerm[],
  context: RelevanceContext,
): TTerm[] => {
  const favored = new Set(context.favoredGroupKeys);
  const selected = new Set(context.selectedIds);
  const text = context.text.filter((value): value is string =>
    Boolean(value?.trim()),
  );

  const score = (term: TTerm): number => {
    if (!text.length) return favored.has(term.groupKey) ? GROUP_BOOST : 0;
    const best = Math.max(
      ...text.map((value) => trigramSimilarity(term.label, value)),
    );
    const groupTextSim =
      GROUP_LABEL_WEIGHT *
      Math.max(
        ...text.map((value) => trigramSimilarity(term.groupLabel, value)),
      );
    const groupBoost = favored.has(term.groupKey) ? GROUP_BOOST : 0;
    return best + groupTextSim + groupBoost;
  };

  return [...terms].sort((a, b) => {
    const aSelected = selected.has(a.id);
    const bSelected = selected.has(b.id);
    if (aSelected !== bSelected) return aSelected ? -1 : 1;
    return score(b) - score(a);
  });
};

const TEXT_MATCH_THRESHOLD = 0.3;

export const groupKeysMatching = (
  text: string | null | undefined,
  terms: readonly RankableTerm[],
): string[] => {
  if (!text?.trim()) return [];
  const matches = new Set<string>();
  for (const term of terms)
    if (trigramSimilarity(term.label, text) >= TEXT_MATCH_THRESHOLD)
      matches.add(term.groupKey);
  return [...matches];
};
