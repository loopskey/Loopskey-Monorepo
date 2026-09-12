export const LEARNING_ACTIVITY_CHANGED_EVENT =
  "professional.learning-activity.changed.v1";

export enum LearningActivityChangeKind {
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  DELETED = "DELETED",
  STATUS_CHANGED = "STATUS_CHANGED",
  EVIDENCE_ADDED = "EVIDENCE_ADDED",
  EVIDENCE_REMOVED = "EVIDENCE_REMOVED",
}

export type LearningActivityChangedPayload = {
  userId: string;
  revision: string;
  activityId: string;
  occurredAt: string;
  changeKind: LearningActivityChangeKind;
};
