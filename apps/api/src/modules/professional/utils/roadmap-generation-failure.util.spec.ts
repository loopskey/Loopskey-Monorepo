import { RoadmapAiMessageCode } from "@infrastructure/service-ai/service-ai.port";
import { RoadmapGenerationViolation } from "@professional/utils/roadmap-generation-verify.util";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { RoadmapGenerationFailureCode } from "@professional/enums/roadmap-generation-failure.enum";

import { mapGenerationFailure } from "./roadmap-generation-failure.util";

describe("mapGenerationFailure", () => {
  it("returns null when there is no failure to map", () => {
    expect(mapGenerationFailure(null)).toBeNull();
  });

  it("maps NO_CANDIDATES to the public no-content category", () => {
    expect(mapGenerationFailure("NO_CANDIDATES")?.code).toBe(
      RoadmapGenerationFailureCode.NO_MATCHING_CONTENT,
    );
  });

  it.each([
    RoadmapAiMessageCode.ROADMAP_AI_FAILED,
    RoadmapAiMessageCode.ROADMAP_AI_UNAVAILABLE,
    RoadmapAiMessageCode.ROADMAP_AI_REFUSED,
  ])("maps provider failure %s to a temporary-service category", (reason) => {
    expect(mapGenerationFailure(reason)?.code).toBe(
      RoadmapGenerationFailureCode.TEMPORARY_SERVICE_FAILURE,
    );
  });

  it.each([
    RoadmapGenerationViolation.EMPTY_PLAN,
    RoadmapGenerationViolation.DUPLICATE_CONTENT,
    RoadmapGenerationViolation.PAID_UNDER_FREE_ONLY,
    RoadmapGenerationViolation.PHASE_DURATION_MISMATCH,
  ])("maps verifier violation %s to an invalid-roadmap category", (reason) => {
    expect(mapGenerationFailure(reason)?.code).toBe(
      RoadmapGenerationFailureCode.INVALID_GENERATED_ROADMAP,
    );
  });

  it("falls back to UNKNOWN for an unrecognized reason", () => {
    expect(mapGenerationFailure("something-new")?.code).toBe(
      RoadmapGenerationFailureCode.UNKNOWN,
    );
    expect(
      mapGenerationFailure(ProfessionalMessageCode.ROADMAP_GENERATION_FAILED)
        ?.code,
    ).toBe(RoadmapGenerationFailureCode.UNKNOWN);
  });

  it.each(
    Object.values(RoadmapGenerationViolation).filter(
      (violation) =>
        violation !== RoadmapGenerationViolation.PROTECTED_CONTENT_DROPPED &&
        violation !==
          RoadmapGenerationViolation.PROTECTED_STEP_WITHOUT_IDENTITY,
    ),
  )("reports the %s violation as an invalid generated roadmap", (violation) => {
    expect(mapGenerationFailure(violation)?.code).toBe(
      RoadmapGenerationFailureCode.INVALID_GENERATED_ROADMAP,
    );
  });

  it("reports dropped learner progress as a retryable preservation failure", () => {
    expect(
      mapGenerationFailure(
        RoadmapGenerationViolation.PROTECTED_CONTENT_DROPPED,
      ),
    ).toEqual({
      code: RoadmapGenerationFailureCode.PROGRESS_NOT_PRESERVED,
      recoveryActions: ["RETRY"],
    });
  });

  it("reports progress that cannot be matched safely as one with no retry", () => {
    expect(
      mapGenerationFailure(
        RoadmapGenerationViolation.PROTECTED_STEP_WITHOUT_IDENTITY,
      ),
    ).toEqual({
      code: RoadmapGenerationFailureCode.PROGRESS_CANNOT_BE_PRESERVED,
      recoveryActions: [],
    });
  });

  it("never leaks the raw reason into the mapped result", () => {
    const result = mapGenerationFailure("internal-provider-stack-trace-ish");
    expect(JSON.stringify(result)).not.toContain(
      "internal-provider-stack-trace-ish",
    );
  });
});
