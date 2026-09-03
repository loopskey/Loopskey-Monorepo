export const LEARNING_ACTIVITY_RECORDED_EVENT =
  "professional.learning-activity.recorded.v1";

export type LearningActivityRecordedPayload = {
  activityId: string;
  userId: string;
};
