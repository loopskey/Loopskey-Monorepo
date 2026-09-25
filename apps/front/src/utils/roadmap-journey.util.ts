import { RoadmapStepProgressStatus } from "@/lib/graphql/base";

type TJourneyStep = {
  id: string;
  title: string;
  status?: RoadmapStepProgressStatus | null;
  completedAt?: string | null;
};

type TJourneyPhase = {
  id: string;
  completed: boolean;
  steps: TJourneyStep[];
};

export type TNextStep = { phaseId: string; stepId: string; title: string };

export const findCurrentPhaseId = <P extends TJourneyPhase>(
  phases: P[],
): string | null => {
  const current = phases.find((phase) => !phase.completed) ?? phases.at(-1);
  return current?.id ?? null;
};

export const findNextStep = (phases: TJourneyPhase[]): TNextStep | null => {
  for (const phase of phases) {
    const step = phase.steps.find(
      (candidate) =>
        candidate.status !== RoadmapStepProgressStatus.Completed,
    );
    if (step) return { phaseId: phase.id, stepId: step.id, title: step.title };
  }
  return null;
};

const MS_PER_DAY = 86_400_000;

export const daysUntil = (target: Date, now = new Date()) => {
  const startOfTarget = Date.UTC(
    target.getUTCFullYear(),
    target.getUTCMonth(),
    target.getUTCDate(),
  );
  const startOfToday = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  return Math.round((startOfTarget - startOfToday) / MS_PER_DAY);
};

const dayKey = (date: Date) =>
  Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

export const completionsThisWeek = (
  phases: TJourneyPhase[],
  now = new Date(),
): number => {
  const weekAgo = now.getTime() - 7 * MS_PER_DAY;
  let count = 0;
  for (const phase of phases)
    for (const step of phase.steps)
      if (step.completedAt && new Date(step.completedAt).getTime() >= weekAgo)
        count += 1;
  return count;
};

export const dayStreak = (
  phases: TJourneyPhase[],
  now = new Date(),
): number => {
  const days = new Set<number>();
  for (const phase of phases)
    for (const step of phase.steps)
      if (step.completedAt) days.add(dayKey(new Date(step.completedAt)));
  if (days.size === 0) return 0;

  const today = dayKey(now);
  const yesterday = today - MS_PER_DAY;
  let cursor = days.has(today) ? today : days.has(yesterday) ? yesterday : null;
  if (cursor === null) return 0;

  let streak = 0;
  while (days.has(cursor)) {
    streak += 1;
    cursor -= MS_PER_DAY;
  }
  return streak;
};
