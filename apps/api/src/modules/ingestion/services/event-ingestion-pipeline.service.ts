import { validateSync, type ValidationError } from "class-validator";
import { EVENT_CANONICAL_FIELDS } from "@ingestion/enums/event-ingestion.constant";
import { EVENT_PROTECTED_INPUT_FIELDS } from "@ingestion/enums/event-ingestion.constant";
import { EVENT_SCHEDULE_ITEM_LIMIT } from "@ingestion/enums/event-ingestion.constant";
import { CanonicalEventInput } from "@ingestion/dtos/canonical-event.input";
import { IngestionMessageCode } from "@ingestion/enums/message-code.enum";
import { sanitizeCourseText } from "@common/utils/course-normalizer.util";
import { Injectable } from "@nestjs/common";
import { createHash } from "node:crypto";
import {
  toBoolean,
  toDate,
  toInteger,
  toNumber,
  toText,
} from "@ingestion/utils/canonical-coerce.util";
import {
  normalizeEventCategory,
  normalizeEventDeliveryMode,
  normalizeEventType,
} from "@ingestion/utils/event-normalizer.util";

import type { EventScheduleCanonical } from "@ingestion/types/event-ingestion.types";
import type { PreparedEventItem } from "@ingestion/types/event-ingestion.types";

type EventCanonicalField = (typeof EVENT_CANONICAL_FIELDS)[number];
type EventFieldMap = Record<string, string>;
type MappedEvent = Partial<Record<EventCanonicalField, unknown>>;

const protectedFields = new Set<string>(EVENT_PROTECTED_INPUT_FIELDS);
const SCALAR_FIELDS = EVENT_CANONICAL_FIELDS.filter(
  (field) => field !== "scheduleItems",
);

const validationReason = (errors: ValidationError[]) => {
  const reasons = errors.flatMap((error) =>
    Object.values(error.constraints ?? {}).map(
      (constraint) => `${error.property}: ${constraint}`,
    ),
  );
  return reasons.join("; ") || "The canonical event item is invalid.";
};

@Injectable()
export class EventIngestionPipeline {
  prepare(
    rawItem: unknown,
    fieldMap: EventFieldMap,
    includeUnmappedValues: boolean,
  ): PreparedEventItem {
    if (!rawItem || typeof rawItem !== "object" || Array.isArray(rawItem))
      return this.rejected(
        null,
        {},
        null,
        [],
        undefined,
        "Each event item must be an object.",
      );

    const sourceItem = rawItem as Record<string, unknown>;
    const mappedSourceFields = Object.keys(fieldMap);
    const unmappedFields = Object.keys(sourceItem)
      .filter((field) => !mappedSourceFields.includes(field))
      .sort();
    const unmappedValues = includeUnmappedValues
      ? Object.fromEntries(
          unmappedFields.map((field) => [field, sourceItem[field]]),
        )
      : undefined;

    const mapped = this.map(sourceItem, fieldMap);
    const scalars = this.coerce(mapped);
    const sanitized = this.sanitize(scalars);
    const core = Object.assign(new CanonicalEventInput(), sanitized);
    const externalId =
      typeof core.externalId === "string" && core.externalId
        ? core.externalId
        : null;

    const scheduleOutcome = this.readSchedule(mapped);
    const canonicalHash = this.hash(sanitized, scheduleOutcome.value);

    const protectedField = Object.keys(sourceItem).find((field) =>
      protectedFields.has(field),
    );
    if (protectedField)
      return this.rejected(
        externalId,
        sanitized,
        scheduleOutcome.value,
        unmappedFields,
        unmappedValues,
        `${protectedField} is owned by the platform and cannot be supplied.`,
      );

    if (scheduleOutcome.outcome === "invalid")
      return this.rejected(
        externalId,
        sanitized,
        null,
        unmappedFields,
        unmappedValues,
        scheduleOutcome.reason,
      );

    const errors = validateSync(core, {
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: { target: false, value: false },
    });
    if (errors.length > 0)
      return this.rejected(
        externalId,
        sanitized,
        scheduleOutcome.value,
        unmappedFields,
        unmappedValues,
        validationReason(errors),
      );

    if (
      core.endDate &&
      new Date(core.endDate).getTime() < new Date(core.startDate).getTime()
    )
      return this.rejected(
        externalId,
        sanitized,
        scheduleOutcome.value,
        unmappedFields,
        unmappedValues,
        `${IngestionMessageCode.INGESTION_EVENT_DATE_RANGE_INVALID}: the event end date precedes its start date.`,
      );

    return {
      outcome: "accepted",
      canonical: { core, scheduleItems: scheduleOutcome.value },
      canonicalHash,
      externalId: core.externalId,
      unmappedFields,
      ...(unmappedValues ? { unmappedValues } : {}),
    };
  }

  private map(source: Record<string, unknown>, fieldMap: EventFieldMap) {
    const mapped: MappedEvent = {};
    for (const [sourceField, targetField] of Object.entries(fieldMap))
      if (Object.prototype.hasOwnProperty.call(source, sourceField))
        mapped[targetField as EventCanonicalField] = source[sourceField];
    return mapped;
  }

  private coerce(mapped: Partial<Record<EventCanonicalField, unknown>>) {
    const price = toNumber(mapped.price);
    const statedIsFree = toBoolean(mapped.isFree);
    const isFree = statedIsFree ?? (!price || price <= 0);
    const timezone = toText(mapped.timezone);
    return {
      externalId: toText(mapped.externalId),
      canonicalUrl: toText(mapped.canonicalUrl),
      sourcePlatform: toText(mapped.sourcePlatform),
      title: toText(mapped.title),
      description: toText(mapped.description),
      speaker: toText(mapped.speaker),
      organizer: toText(mapped.organizer),
      imageCandidateUrl: toText(mapped.imageCandidateUrl),
      type: normalizeEventType(toText(mapped.type)),
      deliveryMode: normalizeEventDeliveryMode(toText(mapped.deliveryMode)),
      category: normalizeEventCategory(toText(mapped.category)),
      startDate: toDate(mapped.startDate),
      endDate: toDate(mapped.endDate),
      // A crawled event must state its own timezone; the model default is not a
      // substitute for one the crawl never supplied.
      timezone: timezone && timezone.trim() ? timezone.trim() : null,
      location: toText(mapped.location),
      onlineUrl: toText(mapped.onlineUrl),
      price: isFree ? null : price,
      currency: (toText(mapped.currency) ?? "USD").toUpperCase().slice(0, 3),
      isFree,
      pdu: toNumber(mapped.pdu),
      language: toText(mapped.language),
      topic: toText(mapped.topic),
      rawType: toText(mapped.rawType),
      rawDeliveryMode: toText(mapped.rawDeliveryMode),
      rawCategory: toText(mapped.rawCategory),
      lastUpdatedAt: toDate(mapped.lastUpdatedAt),
      crawledAt: toDate(mapped.crawledAt),
      updatedAt: toDate(mapped.updatedAt),
    };
  }

  private sanitize(coerced: Record<string, unknown>) {
    const sanitized: Record<string, unknown> = {};
    for (const field of SCALAR_FIELDS) {
      const value = coerced[field];
      sanitized[field] =
        typeof value === "string" ? sanitizeCourseText(value) || null : value;
    }
    return sanitized;
  }

  private readSchedule(
    mapped: Partial<Record<EventCanonicalField, unknown>>,
  ):
    | { outcome: "omitted" | "ok"; value: EventScheduleCanonical[] | null }
    | { outcome: "invalid"; value: null; reason: string } {
    if (!Object.prototype.hasOwnProperty.call(mapped, "scheduleItems"))
      return { outcome: "omitted", value: null };
    const raw = mapped.scheduleItems;
    if (raw === null || raw === undefined) return { outcome: "ok", value: [] };
    if (!Array.isArray(raw))
      return {
        outcome: "invalid",
        value: null,
        reason: "scheduleItems must be an array when supplied.",
      };
    if (raw.length > EVENT_SCHEDULE_ITEM_LIMIT)
      return {
        outcome: "invalid",
        value: null,
        reason: `An event may carry at most ${EVENT_SCHEDULE_ITEM_LIMIT} schedule items.`,
      };
    const items: EventScheduleCanonical[] = [];
    for (const entry of raw) {
      if (!entry || typeof entry !== "object" || Array.isArray(entry))
        return {
          outcome: "invalid",
          value: null,
          reason: "Each schedule item must be an object.",
        };
      const row = entry as Record<string, unknown>;
      const dayNumber = toInteger(row.dayNumber);
      const startTime = toDate(row.startTime);
      const endTime = toDate(row.endTime);
      const title = sanitizeCourseText(toText(row.title) ?? "");
      if (
        dayNumber === null ||
        dayNumber < 1 ||
        !startTime ||
        !endTime ||
        !title
      )
        return {
          outcome: "invalid",
          value: null,
          reason:
            "Each schedule item needs a day number, a start time, an end time and a title.",
        };
      if (new Date(endTime).getTime() < new Date(startTime).getTime())
        return {
          outcome: "invalid",
          value: null,
          reason: "A schedule item's end time precedes its start time.",
        };
      items.push({
        dayNumber,
        startTime,
        endTime,
        title,
        description: sanitizeCourseText(toText(row.description) ?? "") || null,
        speaker: sanitizeCourseText(toText(row.speaker) ?? "") || null,
      });
    }
    items.sort(
      (a, b) =>
        a.dayNumber - b.dayNumber ||
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    );
    return { outcome: "ok", value: items };
  }

  private hash(
    scalars: Record<string, unknown>,
    scheduleItems: EventScheduleCanonical[] | null,
  ) {
    const ordered = Object.fromEntries(
      SCALAR_FIELDS.map((field) => [field, scalars[field] ?? null]),
    );
    return createHash("sha256")
      .update(JSON.stringify({ ...ordered, scheduleItems }))
      .digest("hex");
  }

  private rejected(
    externalId: string | null,
    _scalars: Record<string, unknown>,
    scheduleItems: EventScheduleCanonical[] | null,
    unmappedFields: string[],
    unmappedValues: Record<string, unknown> | undefined,
    reason: string,
  ): PreparedEventItem {
    return {
      outcome: "rejected",
      externalId,
      canonicalHash: createHash("sha256")
        .update(JSON.stringify({ externalId, scheduleItems, reason }))
        .digest("hex"),
      reason,
      unmappedFields,
      ...(unmappedValues ? { unmappedValues } : {}),
    };
  }
}
