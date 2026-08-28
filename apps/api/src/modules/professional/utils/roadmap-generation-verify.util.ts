import type { PlatformContentType } from "@infrastructure/service-ai/service-ai.port";
import type { GenerateData } from "@infrastructure/service-ai/service-ai.port";

export enum RoadmapGenerationViolation {
  EMPTY_PLAN = "EMPTY_PLAN",
  DUPLICATE_CONTENT = "DUPLICATE_CONTENT",
  PAID_UNDER_FREE_ONLY = "PAID_UNDER_FREE_ONLY",
  PHASE_DURATION_MISMATCH = "PHASE_DURATION_MISMATCH",
}

export type VerifiedStep = {
  order: number;
  title: string;
  description: string;
  contentId: string | null;
  estimatedMinutes: number | null;
  contentType: PlatformContentType | null;
};

export type VerifiedPhase = {
  order: number;
  title: string;
  description: string;
  steps: VerifiedStep[];
  estimatedWeeks: number;
};

export type VerificationResult =
  | {
      ok: true;
      phases: VerifiedPhase[];
      droppedContentIds: string[];
    }
  | { ok: false; violation: RoadmapGenerationViolation };

export type CandidateKey = {
  contentId: string;
  contentType: PlatformContentType;
  isFree: boolean;
};

const keyOf = (contentType: PlatformContentType, contentId: string) =>
  `${contentType}:${contentId}`;

export const verifyGeneratedRoadmap = (input: {
  data: GenerateData;
  freeOnly: boolean;
  candidates: CandidateKey[];
}): VerificationResult => {
  const known = new Map<string, CandidateKey>();
  for (const candidate of input.candidates)
    known.set(keyOf(candidate.contentType, candidate.contentId), candidate);
  if (input.data.phases.length === 0)
    return { ok: false, violation: RoadmapGenerationViolation.EMPTY_PLAN };

  const totalWeeks = input.data.phases.reduce(
    (sum, phase) => sum + phase.estimatedWeeks,
    0,
  );
  if (totalWeeks !== input.data.estimatedWeeks)
    return {
      ok: false,
      violation: RoadmapGenerationViolation.PHASE_DURATION_MISMATCH,
    };

  const seen = new Set<string>();
  const dropped: string[] = [];
  const phases: VerifiedPhase[] = [];

  for (const phase of input.data.phases) {
    const steps: VerifiedStep[] = [];
    for (const step of phase.steps) {
      if (step.contentId === null || step.contentType === null) {
        steps.push({ ...step, contentId: null, contentType: null });
        continue;
      }

      const key = keyOf(step.contentType, step.contentId);
      if (seen.has(key))
        return {
          ok: false,
          violation: RoadmapGenerationViolation.DUPLICATE_CONTENT,
        };
      seen.add(key);

      const candidate = known.get(key);
      if (!candidate) {
        dropped.push(step.contentId);
        steps.push({ ...step, contentId: null, contentType: null });
        continue;
      }
      if (input.freeOnly && !candidate.isFree)
        return {
          ok: false,
          violation: RoadmapGenerationViolation.PAID_UNDER_FREE_ONLY,
        };

      steps.push(step);
    }
    phases.push({ ...phase, steps });
  }

  return { ok: true, phases, droppedContentIds: dropped };
};
