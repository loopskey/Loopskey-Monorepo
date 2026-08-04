export const ORGANIZATION_REVIEW_API = Symbol("ORGANIZATION_REVIEW_API");

export type OrganizationReviewNotificationProjection = {
  readonly id: string;
  readonly status: string;
  readonly notificationStatus: string;
  readonly approvedUserId: string | null;
  readonly organizationName: string;
  readonly workEmail: string;
  readonly rejectReason: string | null;
};

export interface OrganizationReviewApi {
  overview(): Promise<Record<string, unknown>>;
  list(input: {
    status?: string;
    search?: string;
    sortDirection?: "asc" | "desc";
    cursor?: string;
    take?: number;
  }): Promise<Record<string, unknown>>;
  detail(requestId: string): Promise<Record<string, unknown>>;
  beginNotification(
    requestId: string,
    force: boolean,
  ): Promise<OrganizationReviewNotificationProjection>;
  markNotificationSent(requestId: string): Promise<void>;
  markNotificationFailed(requestId: string, failureCode: string): Promise<void>;
  approve(
    requestId: string,
    reviewerId: string,
    atomicContext: object,
  ): Promise<{
    readonly result: Record<string, unknown>;
    readonly workEmail: string;
    readonly organizationId: string;
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
