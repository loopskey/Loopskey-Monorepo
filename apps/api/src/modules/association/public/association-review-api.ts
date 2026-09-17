export const ASSOCIATION_REVIEW_API = Symbol("ASSOCIATION_REVIEW_API");

export interface AssociationReviewApi {
  approve(
    requestId: string,
    reviewerId: string,
    atomicContext: object,
  ): Promise<{
    readonly result: Record<string, unknown>;
    readonly workEmail: string;
    readonly associationId: string;
    readonly approvedUserId: string;
    readonly linkedExistingUser: boolean;
  }>;
  reject(
    requestId: string,
    reviewerId: string,
    reason: string,
    atomicContext: object,
  ): Promise<{ readonly result: Record<string, unknown> }>;
}
