import type { PlatformContentType } from "@infrastructure/service-ai/service-ai.port";
import type { GenerateData } from "@infrastructure/service-ai/service-ai.port";

export enum RoadmapGenerationViolation {
  EMPTY_PLAN = "EMPTY_PLAN",
  DUPLICATE_CONTENT = "DUPLICATE_CONTENT",
  PAID_UNDER_FREE_ONLY = "PAID_UNDER_FREE_ONLY",
  PHASE_DURATION_MISMATCH = "PHASE_DURATION_MISMATCH",
  UNKNOWN_CONTENT = "UNKNOWN_CONTENT",
  PARTIAL_CONTENT_REFERENCE = "PARTIAL_CONTENT_REFERENCE",
  DUPLICATE_PHASE_ORDER = "DUPLICATE_PHASE_ORDER",
  DUPLICATE_STEP_ORDER = "DUPLICATE_STEP_ORDER",
  TOO_MANY_PHASES = "TOO_MANY_PHASES",
  BLANK_TEXT = "BLANK_TEXT",
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
    }
  | {
      ok: false;
      violation: RoadmapGenerationViolation;
      offending: string | null;
    };

export type CandidateKey = {
  contentId: string;
  contentType: PlatformContentType;
  isFree: boolean;
};

const keyOf = (contentType: PlatformContentType, contentId: string) =>
  `${contentType}:${contentId}`;

const isBlank = (value: string) => value.trim().length === 0;

const reject = (
  violation: RoadmapGenerationViolation,
  offending: string | null = null,
): VerificationResult => ({ ok: false, violation, offending });

export const verifyGeneratedRoadmap = (input: {
  data: GenerateData;
  freeOnly: boolean;
  maxPhases: number;
  candidates: CandidateKey[];
}): VerificationResult => {
  const known = new Map<string, CandidateKey>();
  for (const candidate of input.candidates)
    known.set(keyOf(candidate.contentType, candidate.contentId), candidate);

  const { phases: generatedPhases } = input.data;
  if (isBlank(input.data.title) || isBlank(input.data.description))
    return reject(RoadmapGenerationViolation.BLANK_TEXT, "roadmap");
  if (generatedPhases.length === 0)
    return reject(RoadmapGenerationViolation.EMPTY_PLAN);
  if (generatedPhases.length > input.maxPhases)
    return reject(
      RoadmapGenerationViolation.TOO_MANY_PHASES,
      String(generatedPhases.length),
    );

  const totalWeeks = generatedPhases.reduce(
    (sum, phase) => sum + phase.estimatedWeeks,
    0,
  );
  if (totalWeeks !== input.data.estimatedWeeks)
    return reject(RoadmapGenerationViolation.PHASE_DURATION_MISMATCH);

  const phaseOrders = new Set<number>();
  const usedContent = new Set<string>();
  const phases: VerifiedPhase[] = [];

  for (const phase of generatedPhases) {
    if (isBlank(phase.title) || isBlank(phase.description))
      return reject(
        RoadmapGenerationViolation.BLANK_TEXT,
        `phase ${phase.order}`,
      );
    if (phaseOrders.has(phase.order))
      return reject(
        RoadmapGenerationViolation.DUPLICATE_PHASE_ORDER,
        String(phase.order),
      );
    phaseOrders.add(phase.order);

    const stepOrders = new Set<number>();
    const steps: VerifiedStep[] = [];

    for (const step of phase.steps) {
      if (isBlank(step.title) || isBlank(step.description))
        return reject(
          RoadmapGenerationViolation.BLANK_TEXT,
          `step ${phase.order}.${step.order}`,
        );
      if (stepOrders.has(step.order))
        return reject(
          RoadmapGenerationViolation.DUPLICATE_STEP_ORDER,
          `${phase.order}.${step.order}`,
        );
      stepOrders.add(step.order);

      if (step.contentId === null && step.contentType === null) {
        steps.push({ ...step, contentId: null, contentType: null });
        continue;
      }
      if (step.contentId === null || step.contentType === null)
        return reject(
          RoadmapGenerationViolation.PARTIAL_CONTENT_REFERENCE,
          `${step.contentType ?? "null"}:${step.contentId ?? "null"}`,
        );

      const key = keyOf(step.contentType, step.contentId);
      const candidate = known.get(key);
      if (!candidate)
        return reject(RoadmapGenerationViolation.UNKNOWN_CONTENT, key);
      if (usedContent.has(key))
        return reject(RoadmapGenerationViolation.DUPLICATE_CONTENT, key);
      usedContent.add(key);
      if (input.freeOnly && !candidate.isFree)
        return reject(RoadmapGenerationViolation.PAID_UNDER_FREE_ONLY, key);

      steps.push({
        ...step,
        contentId: candidate.contentId,
        contentType: candidate.contentType,
      });
    }
    phases.push({ ...phase, steps });
  }

  return { ok: true, phases };
};
