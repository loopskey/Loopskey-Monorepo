import { PromotionRequestStatus, PromotionType } from "@prisma/client";
import { EventRegistrationStatus, EventStatus } from "@prisma/client";
import { EventType, PDUCategory } from "@prisma/client";
import { registerEnumType } from "@nestjs/graphql";

export enum ProviderDashboardRange {
  LAST_7_DAYS = "LAST_7_DAYS",
  LAST_30_DAYS = "LAST_30_DAYS",
  LAST_90_DAYS = "LAST_90_DAYS",
  THIS_YEAR = "THIS_YEAR",
}

registerEnumType(ProviderDashboardRange, {
  name: "ProviderDashboardRange",
});

registerEnumType(EventStatus, {
  name: "EventStatus",
});

registerEnumType(EventType, {
  name: "EventType",
});

registerEnumType(EventRegistrationStatus, {
  name: "EventRegistrationStatus",
});

registerEnumType(PDUCategory, {
  name: "PDUCategory",
});

registerEnumType(PromotionType, {
  name: "PromotionType",
});

registerEnumType(PromotionRequestStatus, {
  name: "PromotionRequestStatus",
});
