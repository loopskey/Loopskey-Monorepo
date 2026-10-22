import type { RoadmapStepCarryOver } from "@contentAction/public/professional-engagement-api";

export type CarryOverStep = {
  readonly id: string;
  readonly contentId: string | null;
  readonly contentType: string | null;
};

const contentKey = (step: CarryOverStep) =>
  step.contentId && step.contentType
    ? `${step.contentType}:${step.contentId}`
    : null;

export const mapCarriedSteps = (
  previous: readonly CarryOverStep[],
  next: readonly CarryOverStep[],
): RoadmapStepCarryOver[] => {
  const nextByContent = new Map<string, string>();
  for (const step of next) {
    const key = contentKey(step);
    if (key && !nextByContent.has(key)) nextByContent.set(key, step.id);
  }

  return previous.flatMap((step) => {
    const key = contentKey(step);
    const toStepId = key ? nextByContent.get(key) : undefined;
    return toStepId ? [{ fromStepId: step.id, toStepId }] : [];
  });
};
