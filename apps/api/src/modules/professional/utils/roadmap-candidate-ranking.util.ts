import type { PlatformContentType } from "@infrastructure/service-ai/service-ai.port";
import type { PlatformSkillLevel } from "@infrastructure/service-ai/service-ai.port";

export type RankableCandidate = {
  title: string;
  tags: string[];
  rating: number;
  isFree: boolean;
  audience: number;
  contentId: string;
  ratingCount: number;
  isFeatured: boolean;
  summary: string | null;
  credits: number | null;
  durationMinutes: number | null;
  contentType: PlatformContentType;
  level: PlatformSkillLevel | null;
};

export type CandidateSelectionInput = {
  cap: number;
  freeOnly: boolean;
  subjects: string[];
  creditsNeeded: boolean;
  pool: RankableCandidate[];
  level: PlatformSkillLevel | null;
  requestedTypes: PlatformContentType[];
};

const RATING_CONFIDENCE_FLOOR = 20;

const CPD_RESERVED_SLOTS = 15;

const WEIGHTS = {
  subject: 3,
  level: 2,
  quality: 1.5,
  popularity: 0.5,
  featured: 0.25,
} as const;

const LEVEL_RANK: Record<PlatformSkillLevel, number> = {
  BEGINNER: 0,
  INTERMEDIATE: 1,
  ADVANCED: 2,
  EXPERT: 3,
};

const LEVEL_FIT_BY_DISTANCE = [1, 0.55, 0.2, 0] as const;

const UNKNOWN_LEVEL_FIT = 0.6;

const normalise = (value: string) => value.toLowerCase().trim();

const scoreSubjects = (
  candidate: RankableCandidate,
  subjects: string[],
): number => {
  if (subjects.length === 0) return 0.5;
  const haystack = normalise(
    [candidate.title, candidate.summary ?? "", ...candidate.tags].join(" "),
  );
  const matched = subjects.filter((subject) => {
    const needle = normalise(subject);
    return needle.length > 0 && haystack.includes(needle);
  });
  return matched.length / subjects.length;
};

const scoreLevel = (
  candidate: RankableCandidate,
  level: PlatformSkillLevel | null,
): number => {
  if (level === null || candidate.level === null) return UNKNOWN_LEVEL_FIT;
  const distance = Math.abs(LEVEL_RANK[level] - LEVEL_RANK[candidate.level]);
  return LEVEL_FIT_BY_DISTANCE[distance] ?? 0;
};

const scoreQuality = (candidate: RankableCandidate): number => {
  const confidence = Math.min(
    candidate.ratingCount / RATING_CONFIDENCE_FLOOR,
    1,
  );
  return (Math.max(candidate.rating, 0) / 5) * confidence;
};

const scorePopularity = (candidate: RankableCandidate): number =>
  Math.min(Math.log10(1 + Math.max(candidate.audience, 0)) / 5, 1);

export const scoreCandidate = (
  candidate: RankableCandidate,
  input: Pick<CandidateSelectionInput, "subjects" | "level">,
): number =>
  scoreSubjects(candidate, input.subjects) * WEIGHTS.subject +
  scoreLevel(candidate, input.level) * WEIGHTS.level +
  scoreQuality(candidate) * WEIGHTS.quality +
  scorePopularity(candidate) * WEIGHTS.popularity +
  (candidate.isFeatured ? WEIGHTS.featured : 0);

const keyOf = (candidate: RankableCandidate) =>
  `${candidate.contentType}:${candidate.contentId}`;

type Scored = { candidate: RankableCandidate; score: number };

const byScore = (left: Scored, right: Scored) =>
  right.score - left.score ||
  left.candidate.contentType.localeCompare(right.candidate.contentType) ||
  left.candidate.contentId.localeCompare(right.candidate.contentId);

export const selectCandidates = (
  input: CandidateSelectionInput,
): RankableCandidate[] => {
  const types =
    input.requestedTypes.length > 0
      ? input.requestedTypes
      : (["COURSE", "EVENT", "PODCAST", "YOUTUBE"] as PlatformContentType[]);

  const seen = new Set<string>();
  const eligible: Scored[] = [];
  for (const candidate of input.pool) {
    if (!types.includes(candidate.contentType)) continue;
    if (input.freeOnly && !candidate.isFree) continue;
    const key = keyOf(candidate);
    if (seen.has(key)) continue;
    seen.add(key);
    eligible.push({ candidate, score: scoreCandidate(candidate, input) });
  }
  eligible.sort(byScore);

  const chosen = new Set<string>();
  const picked: Scored[] = [];
  const take = (entry: Scored) => {
    if (picked.length >= input.cap) return false;
    if (chosen.has(keyOf(entry.candidate))) return false;
    chosen.add(keyOf(entry.candidate));
    picked.push(entry);
    return true;
  };

  if (input.creditsNeeded && types.includes("EVENT")) {
    const creditBearing = eligible
      .filter(
        (entry) =>
          entry.candidate.contentType === "EVENT" &&
          (entry.candidate.credits ?? 0) > 0,
      )
      .sort(
        (left, right) =>
          (right.candidate.credits ?? 0) - (left.candidate.credits ?? 0) ||
          byScore(left, right),
      )
      .slice(0, Math.min(CPD_RESERVED_SLOTS, input.cap));
    for (const entry of creditBearing) take(entry);
  }

  const remaining = input.cap - picked.length;
  if (remaining > 0) {
    const share = Math.floor(remaining / types.length);
    if (share > 0)
      for (const type of types) {
        let filled = 0;
        for (const entry of eligible) {
          if (filled >= share) break;
          if (entry.candidate.contentType !== type) continue;
          if (take(entry)) filled += 1;
        }
      }
  }

  for (const entry of eligible) {
    if (picked.length >= input.cap) break;
    take(entry);
  }

  picked.sort(byScore);
  return picked.map((entry) => entry.candidate);
};
