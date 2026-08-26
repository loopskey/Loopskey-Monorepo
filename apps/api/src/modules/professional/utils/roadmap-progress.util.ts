import { RoadmapStepProgressStatus } from "@prisma/client";

export type StepProgressRecord = {
  stepId: string;
  status: string;
  completedAt: Date | null;
};

export type ProgressPhaseInput = {
  id: string;
  steps: { id: string }[];
};

export type DerivedStep = {
  id: string;
  status: RoadmapStepProgressStatus | null;
  completedAt: Date | null;
};

export type DerivedPhase = {
  id: string;
  progress: number;
  completed: boolean;
  stepsCount: number;
  completedSteps: number;
};

export type DerivedProgress = {
  progress: number;
  derived: boolean;
  totalSteps: number;
  completedSteps: number;
  phases: DerivedPhase[];
  steps: Map<string, DerivedStep>;
};

const clamp = (value: number) => Math.min(Math.max(Math.round(value), 0), 100);

const percent = (completed: number, total: number) =>
  total === 0 ? 0 : clamp((completed / total) * 100);

const legacyPhaseProgress = (
  overall: number,
  index: number,
  phaseCount: number,
) => {
  if (phaseCount === 0) return 0;
  const start = (index / phaseCount) * 100;
  const size = 100 / phaseCount;
  return clamp(((overall - start) / size) * 100);
};

export const deriveRoadmapProgress = (input: {
  phases: ProgressPhaseInput[];
  records: StepProgressRecord[];
  storedProgress: number;
}): DerivedProgress => {
  const byStep = new Map<string, StepProgressRecord>();
  for (const record of input.records) byStep.set(record.stepId, record);

  const steps = new Map<string, DerivedStep>();
  for (const phase of input.phases)
    for (const step of phase.steps) {
      const record = byStep.get(step.id);
      steps.set(step.id, {
        id: step.id,
        status: (record?.status as RoadmapStepProgressStatus) ?? null,
        completedAt: record?.completedAt ?? null,
      });
    }

  const totalSteps = input.phases.reduce(
    (sum, phase) => sum + phase.steps.length,
    0,
  );

  const isComplete = (stepId: string) =>
    steps.get(stepId)?.status === RoadmapStepProgressStatus.COMPLETED;

  const derived = input.records.length > 0 && totalSteps > 0;
  const completedSteps = input.phases.reduce(
    (sum, phase) =>
      sum + phase.steps.filter((step) => isComplete(step.id)).length,
    0,
  );

  const progress = derived
    ? percent(completedSteps, totalSteps)
    : clamp(input.storedProgress);

  const phases = input.phases.map((phase, index) => {
    const phaseCompleted = phase.steps.filter((step) =>
      isComplete(step.id),
    ).length;
    const phaseProgress = derived
      ? percent(phaseCompleted, phase.steps.length)
      : legacyPhaseProgress(progress, index, input.phases.length);
    return {
      id: phase.id,
      progress: phaseProgress,
      completed: phase.steps.length > 0 && phaseProgress >= 100,
      stepsCount: phase.steps.length,
      completedSteps: derived
        ? phaseCompleted
        : Math.round((phase.steps.length * phaseProgress) / 100),
    };
  });

  return {
    steps,
    phases,
    derived,
    progress,
    totalSteps,
    completedSteps: derived
      ? completedSteps
      : Math.round((totalSteps * progress) / 100),
  };
};

export const earnedCredits = (input: {
  steps: { id: string; contentId: string | null }[];
  progress: Map<string, DerivedStep>;
  creditsByContentId: Record<string, number>;
}): number => {
  let total = 0;
  for (const step of input.steps) {
    if (!step.contentId) continue;
    if (
      input.progress.get(step.id)?.status !==
      RoadmapStepProgressStatus.COMPLETED
    )
      continue;
    total += input.creditsByContentId[step.contentId] ?? 0;
  }
  return Math.round(total * 100) / 100;
};
