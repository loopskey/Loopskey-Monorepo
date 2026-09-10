import { EventCategory, EventDeliveryMode, EventType } from "@prisma/client";

const key = (value?: string | null) =>
  value
    ?.trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_") ?? "";

export const normalizeEventType = (value?: string | null): EventType => {
  const normalized = key(value);
  if (!normalized) return EventType.OTHER;
  if (normalized in EventType) return normalized as EventType;
  const map: Record<string, EventType> = {
    CLASS: EventType.COURSE,
    LESSON: EventType.COURSE,
    WEBCAST: EventType.WEBINAR,
    ONLINE_SEMINAR: EventType.WEBINAR,
    BOOTCAMP: EventType.TRAINING,
    MASTERCLASS: EventType.WORKSHOP,
    HANDS_ON: EventType.WORKSHOP,
    SUMMIT: EventType.CONFERENCE,
    CONVENTION: EventType.CONFERENCE,
    MEETUP: EventType.NETWORKING,
    MIXER: EventType.NETWORKING,
  };
  return map[normalized] ?? EventType.OTHER;
};

export const normalizeEventDeliveryMode = (
  value?: string | null,
): EventDeliveryMode => {
  const normalized = key(value);
  if (!normalized) return EventDeliveryMode.IN_PERSON;
  if (normalized in EventDeliveryMode) return normalized as EventDeliveryMode;
  const map: Record<string, EventDeliveryMode> = {
    ONSITE: EventDeliveryMode.IN_PERSON,
    IN_PLACE: EventDeliveryMode.IN_PERSON,
    PHYSICAL: EventDeliveryMode.IN_PERSON,
    ONLINE: EventDeliveryMode.LIVE_ONLINE,
    VIRTUAL: EventDeliveryMode.LIVE_ONLINE,
    LIVE: EventDeliveryMode.LIVE_ONLINE,
    STREAM: EventDeliveryMode.LIVE_ONLINE,
    ON_DEMAND: EventDeliveryMode.RECORDED,
    REPLAY: EventDeliveryMode.RECORDED,
    MIXED: EventDeliveryMode.HYBRID,
    BLENDED: EventDeliveryMode.HYBRID,
  };
  return map[normalized] ?? EventDeliveryMode.IN_PERSON;
};

export const normalizeEventCategory = (
  value?: string | null,
): EventCategory => {
  const normalized = key(value);
  if (!normalized) return EventCategory.OTHER;
  if (normalized in EventCategory) return normalized as EventCategory;
  const map: Record<string, EventCategory> = {
    AI: EventCategory.TECHNOLOGY,
    DATA: EventCategory.TECHNOLOGY,
    TECH: EventCategory.TECHNOLOGY,
    SOFTWARE: EventCategory.TECHNOLOGY,
    PROGRAMMING: EventCategory.TECHNOLOGY,
    MANAGEMENT: EventCategory.BUSINESS,
    ENTREPRENEURSHIP: EventCategory.BUSINESS,
    ACCOUNTING: EventCategory.FINANCE,
    SALES: EventCategory.MARKETING,
    HR: EventCategory.LEADERSHIP,
    LAW: EventCategory.COMPLIANCE,
    MEDICAL: EventCategory.HEALTHCARE,
    NURSING: EventCategory.HEALTHCARE,
  };
  return map[normalized] ?? EventCategory.OTHER;
};
