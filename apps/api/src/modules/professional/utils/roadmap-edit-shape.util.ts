import type { CurrentStepProgress } from "@infrastructure/service-ai/service-ai.port";
import type { PlatformContentType } from "@infrastructure/service-ai/service-ai.port";
import type { CurrentRoadmap } from "@infrastructure/service-ai/service-ai.port";

export type EditableStep = {
  id: string;
  order: number;
  title: string;
  credits: number | null;
  contentId: string | null;
  description: string | null;
  estimatedMinutes: number | null;
  contentType: PlatformContentType | null;
};

export type EditablePhase = {
  id: string;
  order: number;
  title: string;
  steps: EditableStep[];
  description: string | null;
  estimatedWeeks: number | null;
};

export type EditableRoadmap = {
  id: string;
  title: string;
  source: string | null;
  ownerId: string | null;
  phases: EditablePhase[];
  description: string | null;
};

export type StepProgressByStep = ReadonlyMap<string, CurrentStepProgress>;

const asText = (value: unknown): string | null =>
  typeof value === "string" && value.trim().length > 0 ? value : null;

const asNumber = (value: unknown): number | null =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const byOrder = <TItem extends { order: number }>(items: TItem[]) =>
  [...items].sort((left, right) => left.order - right.order);

const toStep = (row: Record<string, unknown>): EditableStep => ({
  id: String(row.id),
  order: asNumber(row.order) ?? 0,
  title: asText(row.title) ?? "",
  description: asText(row.description),
  contentId: asText(row.contentId),
  contentType: asText(row.contentType) as PlatformContentType | null,
  estimatedMinutes: asNumber(row.estimatedMinutes),
  credits: asNumber(row.credits),
});

const toPhase = (row: Record<string, unknown>): EditablePhase => ({
  id: String(row.id),
  order: asNumber(row.order) ?? 0,
  title: asText(row.title) ?? "",
  description: asText(row.description),
  estimatedWeeks: asNumber(row.estimatedWeeks),
  steps: byOrder(
    (Array.isArray(row.steps) ? row.steps : []).map((step) =>
      toStep(step as Record<string, unknown>),
    ),
  ),
});

export const toEditableRoadmap = (
  row: Record<string, unknown>,
): EditableRoadmap => ({
  id: String(row.id),
  ownerId: asText(row.ownerId),
  source: asText(row.source),
  title: asText(row.title) ?? "",
  description: asText(row.description),
  phases: byOrder(
    (Array.isArray(row.phases) ? row.phases : []).map((phase) =>
      toPhase(phase as Record<string, unknown>),
    ),
  ),
});

export const toCurrentRoadmap = (
  roadmap: EditableRoadmap,
  progress: StepProgressByStep,
): CurrentRoadmap => ({
  title: roadmap.title || null,
  description: roadmap.description,
  phases: roadmap.phases.map((phase) => ({
    phaseId: phase.id,
    title: phase.title,
    description: phase.description,
    estimatedWeeks: phase.estimatedWeeks ?? 1,
    steps: phase.steps.map((step) => ({
      stepId: step.id,
      title: step.title,
      description: step.description,
      contentId: step.contentId,
      contentType: step.contentType,
      estimatedMinutes: step.estimatedMinutes,
      credits: step.credits,
      progress: progress.get(step.id) ?? null,
    })),
  })),
});

export const contentKey = (
  contentType: string | null,
  contentId: string | null,
) => (contentType && contentId ? `${contentType}:${contentId}` : null);

export const allSteps = (roadmap: EditableRoadmap) =>
  roadmap.phases.flatMap((phase) => phase.steps);
