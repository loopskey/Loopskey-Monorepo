import { registerEnumType } from "@nestjs/graphql";

export enum RoadmapGenerationFailureCode {
  UNKNOWN = "UNKNOWN",
  NO_MATCHING_CONTENT = "NO_MATCHING_CONTENT",
  TEMPORARY_SERVICE_FAILURE = "TEMPORARY_SERVICE_FAILURE",
  INVALID_GENERATED_ROADMAP = "INVALID_GENERATED_ROADMAP",
}

export enum RoadmapGenerationRecoveryAction {
  RETRY = "RETRY",
  START_OVER = "START_OVER",
  REVIEW_BUDGET = "REVIEW_BUDGET",
  REVIEW_FORMATS = "REVIEW_FORMATS",
  REVIEW_SUBJECTS = "REVIEW_SUBJECTS",
}

registerEnumType(RoadmapGenerationFailureCode, {
  name: "RoadmapGenerationFailureCode",
});
registerEnumType(RoadmapGenerationRecoveryAction, {
  name: "RoadmapGenerationRecoveryAction",
});
