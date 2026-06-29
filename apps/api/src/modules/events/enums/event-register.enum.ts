import { EventCategory, EventStatus, EventType, Role } from "@prisma/client";
import { EventDeliveryMode, EventRegistrationStatus } from "@prisma/client";
import { registerEnumType } from "@nestjs/graphql";

export enum EventSortField {
  TITLE = "title",
  PRICE = "price",
  VIEWS = "views",
  ATTENDEES = "attendees",
  CREATED_AT = "createdAt",
  UPDATED_AT = "updatedAt",
  START_DATE = "startDate",
  AVERAGE_RATING = "averageRating",
}

export enum EventSortDirection {
  ASC = "asc",
  DESC = "desc",
}

export type EventRequester = {
  id: string;
  role: Role;
};

registerEnumType(EventType, { name: "EventType" });
registerEnumType(EventStatus, { name: "EventStatus" });
registerEnumType(EventCategory, { name: "EventCategory" });
registerEnumType(EventSortField, { name: "EventSortField" });
registerEnumType(EventDeliveryMode, { name: "EventDeliveryMode" });
registerEnumType(EventSortDirection, { name: "EventSortDirection" });
registerEnumType(EventRegistrationStatus, { name: "EventRegistrationStatus" });
