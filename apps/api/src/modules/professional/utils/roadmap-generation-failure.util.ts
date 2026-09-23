import { RoadmapGenerationRecoveryAction } from "@professional/enums/roadmap-generation-failure.enum";
import { RoadmapGenerationFailureCode } from "@professional/enums/roadmap-generation-failure.enum";
import { RoadmapGenerationViolation } from "@professional/utils/roadmap-generation-verify.util";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { RoadmapAiMessageCode } from "@infrastructure/service-ai/service-ai.port";

export const NO_CANDIDATES_REASON = "NO_CANDIDATES";

export type RoadmapGenerationFailureView = {
  code: RoadmapGenerationFailureCode;
  recoveryActions: RoadmapGenerationRecoveryAction[];
};

const REASON_TO_CODE: Record<string, RoadmapGenerationFailureCode> = {
  [NO_CANDIDATES_REASON]: RoadmapGenerationFailureCode.NO_MATCHING_CONTENT,
  [RoadmapAiMessageCode.ROADMAP_AI_FAILED]:
    RoadmapGenerationFailureCode.TEMPORARY_SERVICE_FAILURE,
  [RoadmapAiMessageCode.ROADMAP_AI_UNAVAILABLE]:
    RoadmapGenerationFailureCode.TEMPORARY_SERVICE_FAILURE,
  [RoadmapAiMessageCode.ROADMAP_AI_REFUSED]:
    RoadmapGenerationFailureCode.TEMPORARY_SERVICE_FAILURE,
  [ProfessionalMessageCode.ROADMAP_GENERATION_FAILED]:
    RoadmapGenerationFailureCode.UNKNOWN,
  [RoadmapGenerationViolation.EMPTY_PLAN]:
    RoadmapGenerationFailureCode.INVALID_GENERATED_ROADMAP,
  [RoadmapGenerationViolation.DUPLICATE_CONTENT]:
    RoadmapGenerationFailureCode.INVALID_GENERATED_ROADMAP,
  [RoadmapGenerationViolation.PAID_UNDER_FREE_ONLY]:
    RoadmapGenerationFailureCode.INVALID_GENERATED_ROADMAP,
  [RoadmapGenerationViolation.PHASE_DURATION_MISMATCH]:
    RoadmapGenerationFailureCode.INVALID_GENERATED_ROADMAP,
};

const CODE_TO_RECOVERY: Record<
  RoadmapGenerationFailureCode,
  RoadmapGenerationRecoveryAction[]
> = {
  [RoadmapGenerationFailureCode.NO_MATCHING_CONTENT]: [
    RoadmapGenerationRecoveryAction.REVIEW_SUBJECTS,
    RoadmapGenerationRecoveryAction.REVIEW_FORMATS,
    RoadmapGenerationRecoveryAction.REVIEW_BUDGET,
  ],
  [RoadmapGenerationFailureCode.TEMPORARY_SERVICE_FAILURE]: [
    RoadmapGenerationRecoveryAction.RETRY,
    RoadmapGenerationRecoveryAction.START_OVER,
  ],
  [RoadmapGenerationFailureCode.INVALID_GENERATED_ROADMAP]: [
    RoadmapGenerationRecoveryAction.RETRY,
    RoadmapGenerationRecoveryAction.START_OVER,
  ],
  [RoadmapGenerationFailureCode.UNKNOWN]: [
    RoadmapGenerationRecoveryAction.RETRY,
    RoadmapGenerationRecoveryAction.START_OVER,
  ],
};

export const mapGenerationFailure = (
  reason: string | null,
): RoadmapGenerationFailureView | null => {
  if (!reason) return null;
  const code = REASON_TO_CODE[reason] ?? RoadmapGenerationFailureCode.UNKNOWN;
  return { code, recoveryActions: CODE_TO_RECOVERY[code] };
};
