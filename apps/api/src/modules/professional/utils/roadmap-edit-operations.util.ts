import { COACH_EDIT_CHANGE_REJECTED_CODE } from "@professional/utils/roadmap-coach.util";
import { PROVIDER_DRAFT_FIELD_NAMES } from "@infrastructure/service-ai/service-ai.port";
import { SERVICE_AI_LIMITS } from "@infrastructure/service-ai/service-ai.port";

import type { RoadmapChangeOperation } from "@infrastructure/service-ai/service-ai.port";
import type { StepProgressByStep } from "@professional/utils/roadmap-edit-shape.util";
import type { EditableRoadmap } from "@professional/utils/roadmap-edit-shape.util";

export type OperationRejection =
  | "OVER_LIMIT"
  | "UNKNOWN_TARGET"
  | "PROTECTED_STEP"
  | "TARGET_REQUIRED"
  | "BLANK_INSTRUCTION"
  | "INSTRUCTION_TOO_LONG";

export type RejectedOperation = {
  operation: RoadmapChangeOperation;
  reason: OperationRejection;
};

export type OperationValidation = {
  rejected: RejectedOperation[];
  accepted: RoadmapChangeOperation[];
};

type Index = {
  roadmapId: string;
  phaseIds: ReadonlySet<string>;
  stepIds: ReadonlySet<string>;
  protectedStepIds: ReadonlySet<string>;
  protectedPhaseIds: ReadonlySet<string>;
};

const DRAFT_FIELDS: ReadonlySet<string> = new Set(PROVIDER_DRAFT_FIELD_NAMES);

const indexOf = (
  roadmap: EditableRoadmap,
  progress: StepProgressByStep,
): Index => {
  const protectedStepIds = new Set<string>();
  const protectedPhaseIds = new Set<string>();
  for (const phase of roadmap.phases)
    for (const step of phase.steps)
      if (progress.has(step.id)) {
        protectedStepIds.add(step.id);
        protectedPhaseIds.add(phase.id);
      }
  return {
    roadmapId: roadmap.id,
    phaseIds: new Set(roadmap.phases.map((phase) => phase.id)),
    stepIds: new Set(
      roadmap.phases.flatMap((phase) => phase.steps.map((step) => step.id)),
    ),
    protectedStepIds,
    protectedPhaseIds,
  };
};

const judge = (
  operation: RoadmapChangeOperation,
  index: Index,
): OperationRejection | null => {
  const instruction = operation.instruction.trim();
  if (!instruction) return "BLANK_INSTRUCTION";
  if (instruction.length > SERVICE_AI_LIMITS.changeInstructionMaxLength)
    return "INSTRUCTION_TOO_LONG";

  const target = operation.targetId;
  if (target && target.length > SERVICE_AI_LIMITS.changeTargetIdMaxLength)
    return "UNKNOWN_TARGET";

  switch (operation.operation) {
    case "MODIFY_ROADMAP":
    case "REBUILD_ROADMAP":
      return target === null || target === index.roadmapId
        ? null
        : "UNKNOWN_TARGET";
    case "UPDATE_DRAFT":
      return target === null || DRAFT_FIELDS.has(target)
        ? null
        : "UNKNOWN_TARGET";
    case "ADD_PHASE":
      return target === null || index.phaseIds.has(target)
        ? null
        : "UNKNOWN_TARGET";
    case "ADD_STEP":
      return target === null ||
        index.phaseIds.has(target) ||
        index.stepIds.has(target)
        ? null
        : "UNKNOWN_TARGET";
    case "MODIFY_PHASE":
      if (!target) return "TARGET_REQUIRED";
      return index.phaseIds.has(target) ? null : "UNKNOWN_TARGET";
    case "REMOVE_PHASE":
      if (!target) return "TARGET_REQUIRED";
      if (!index.phaseIds.has(target)) return "UNKNOWN_TARGET";
      return index.protectedPhaseIds.has(target) ? "PROTECTED_STEP" : null;
    case "MODIFY_STEP":
    case "REMOVE_STEP":
      if (!target) return "TARGET_REQUIRED";
      if (!index.stepIds.has(target)) return "UNKNOWN_TARGET";
      return index.protectedStepIds.has(target) ? "PROTECTED_STEP" : null;
  }
};

export const validateChangeOperations = (
  operations: readonly RoadmapChangeOperation[],
  roadmap: EditableRoadmap,
  progress: StepProgressByStep,
): OperationValidation => {
  const index = indexOf(roadmap, progress);
  const accepted: RoadmapChangeOperation[] = [];
  const rejected: RejectedOperation[] = [];
  const seen = new Set<string>();

  for (const operation of operations) {
    const reason = judge(operation, index);
    if (reason) {
      rejected.push({ operation, reason });
      continue;
    }
    const identity = [
      operation.operation,
      operation.targetId ?? "",
      operation.instruction.trim(),
    ].join("\u0000");
    if (seen.has(identity)) continue;
    seen.add(identity);
    if (accepted.length >= SERVICE_AI_LIMITS.changeOperationsMaxItems) {
      rejected.push({ operation, reason: "OVER_LIMIT" });
      continue;
    }
    accepted.push({
      operation: operation.operation,
      targetId: operation.targetId,
      instruction: operation.instruction.trim(),
    });
  }

  return { accepted, rejected };
};

export const parseStoredOperations = (
  value: unknown,
): RoadmapChangeOperation[] =>
  Array.isArray(value)
    ? value.flatMap((entry): RoadmapChangeOperation[] => {
        if (typeof entry !== "object" || entry === null) return [];
        const record = entry as Record<string, unknown>;
        if (
          typeof record.operation !== "string" ||
          typeof record.instruction !== "string"
        )
          return [];
        return [
          {
            operation: record.operation as RoadmapChangeOperation["operation"],
            targetId:
              typeof record.targetId === "string" ? record.targetId : null,
            instruction: record.instruction,
          },
        ];
      })
    : [];

export type RejectionKind =
  | "STEP_COMPLETED_REMOVE"
  | "STEP_COMPLETED_CHANGE"
  | "STEP_STARTED_REMOVE"
  | "STEP_STARTED_CHANGE"
  | "PHASE_PROTECTED_REMOVE"
  | "UNMATCHED"
  | "OVER_LIMIT";

const MAX_REJECTION_MESSAGES = 5;
const MAX_REJECTION_LABEL_LENGTH = 200;

const rejectionOf = (
  { operation, reason }: RejectedOperation,
  roadmap: EditableRoadmap,
  progress: StepProgressByStep,
): { kind: RejectionKind; label: string | null } => {
  if (reason === "OVER_LIMIT") return { kind: "OVER_LIMIT", label: null };
  if (reason !== "PROTECTED_STEP") return { kind: "UNMATCHED", label: null };
  if (operation.operation === "REMOVE_PHASE") {
    const phase = roadmap.phases.find((item) => item.id === operation.targetId);
    return { kind: "PHASE_PROTECTED_REMOVE", label: phase?.title ?? null };
  }
  const step = roadmap.phases
    .flatMap((phase) => phase.steps)
    .find((item) => item.id === operation.targetId);
  const isCompleted =
    !!operation.targetId && progress.get(operation.targetId) === "COMPLETED";
  const isRemoval = operation.operation === "REMOVE_STEP";
  const kind: RejectionKind = isCompleted
    ? isRemoval
      ? "STEP_COMPLETED_REMOVE"
      : "STEP_COMPLETED_CHANGE"
    : isRemoval
      ? "STEP_STARTED_REMOVE"
      : "STEP_STARTED_CHANGE";
  return { kind, label: step?.title ?? null };
};

export const rejectionMessages = (
  rejected: readonly RejectedOperation[],
  roadmap: EditableRoadmap,
  progress: StepProgressByStep,
): string[] => {
  const messages: string[] = [];
  for (const entry of rejected) {
    const { kind, label } = rejectionOf(entry, roadmap, progress);
    const clipped = label?.trim().slice(0, MAX_REJECTION_LABEL_LENGTH) || null;
    const message = [COACH_EDIT_CHANGE_REJECTED_CODE, kind, clipped]
      .filter((part): part is string => part !== null)
      .join(":");
    if (!messages.includes(message)) messages.push(message);
    if (messages.length === MAX_REJECTION_MESSAGES) break;
  }
  return messages;
};
