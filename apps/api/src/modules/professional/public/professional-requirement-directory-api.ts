export const PROFESSIONAL_REQUIREMENT_DIRECTORY_API = Symbol(
  "PROFESSIONAL_REQUIREMENT_DIRECTORY_API",
);

export interface ProfessionalRequirementDirectoryApi {
  syncAssignedRequirements(
    userId: string,
    associationRequirementIds: string[],
  ): Promise<void>;
  hasRecordedActivity(
    associationRequirementId: string,
    atomicContext: object,
  ): Promise<boolean>;
  removeRequirementLinks(
    associationRequirementId: string,
    atomicContext: object,
  ): Promise<number>;
}
