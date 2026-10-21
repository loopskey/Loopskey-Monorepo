export const PROFESSIONAL_REQUIREMENT_DIRECTORY_API = Symbol(
  "PROFESSIONAL_REQUIREMENT_DIRECTORY_API",
);

export type ContentRecipientsCommand = {
  userIds: string[];
  learningContentId: string;
  requirementId: string | null;
};

export type MemberContentItem = {
  learningContentId: string;
  requirementId: string | null;
};

export type MemberContentCommand = {
  userId: string;
  items: MemberContentItem[];
  scopeContentIds: string[];
};

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
  replaceContentRecipients(
    command: ContentRecipientsCommand,
    atomicContext: object,
  ): Promise<void>;
  replaceMemberContent(
    command: MemberContentCommand,
    atomicContext: object,
  ): Promise<void>;
  removeContentLinks(
    learningContentId: string,
    atomicContext: object,
  ): Promise<number>;
  reassignContentRequirement(
    learningContentId: string,
    requirementId: string | null,
    atomicContext: object,
  ): Promise<boolean>;
}
