import type { CanonicalEventInput } from "@ingestion/dtos/canonical-event.input";
import type { PreparedKindItem } from "@ingestion/types/kind-ingestion.types";

export type EventScheduleCanonical = {
  dayNumber: number;
  startTime: string;
  endTime: string;
  title: string;
  description: string | null;
  speaker: string | null;
};

/**
 * `scheduleItems` is `null` when the crawl omitted the field (leave the
 * event's schedule as it is) and an array — possibly empty — when the crawl
 * supplied one (replace the schedule with exactly these rows).
 */
export type EventCanonical = {
  core: CanonicalEventInput;
  scheduleItems: EventScheduleCanonical[] | null;
};

export type PreparedEventItem = PreparedKindItem<EventCanonical>;
