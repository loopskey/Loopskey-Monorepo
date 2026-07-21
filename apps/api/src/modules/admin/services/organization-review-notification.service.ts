import { Injectable } from "@nestjs/common";

export type OrganizationReviewNotificationIntent = {
  deliveryStatus: "PENDING";
  recipient: string;
  requestId: string;
  type: "ORGANIZATION_REQUEST_APPROVED" | "ORGANIZATION_REQUEST_REJECTED";
};

@Injectable()
export class OrganizationReviewNotificationService {
  prepareIntent(
    input: Omit<OrganizationReviewNotificationIntent, "deliveryStatus">,
  ): OrganizationReviewNotificationIntent {
    return {
      ...input,
      deliveryStatus: "PENDING",
    };
  }
}
