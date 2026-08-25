import { PlatformSkillLevel } from "@infrastructure/service-ai/service-ai.port";

export const POOL_PER_TYPE = 100;
export const SUMMARY_MAX_LENGTH = 300;
export const TITLE_MAX_LENGTH = 500;
export const TAGS_MAX_ITEMS = 20;

export const truncate = (value: string, allowed: number) =>
  value.length <= allowed ? value : `${value.slice(0, allowed - 1).trimEnd()}…`;

export const summarise = (value: string | null | undefined): string | null => {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return truncate(trimmed, SUMMARY_MAX_LENGTH);
};

export const tagsOf = (...values: (string | null | undefined)[]): string[] => {
  const seen = new Set<string>();
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) seen.add(trimmed);
  }
  return [...seen].slice(0, TAGS_MAX_ITEMS);
};

export const toPlatformLevel = (level: string): PlatformSkillLevel | null =>
  level === "BEGINNER" || level === "INTERMEDIATE" || level === "ADVANCED"
    ? level
    : null;

export const ROADMAP_GENERATION_EVENT = "roadmap.generation.requested";
export type RoadmapGenerationPayload = { draftId: string };
export const REDUCED_CANDIDATE_CAP = 25;
export const MAX_CONCURRENT_GENERATIONS = 2;
export const LOCAL_CAPACITY_WAIT_SECONDS = 30;
export const round2 = (value: number) => Math.round(value * 100) / 100;
