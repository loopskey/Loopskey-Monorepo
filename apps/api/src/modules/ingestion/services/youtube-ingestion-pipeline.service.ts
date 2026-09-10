import { validateSync, type ValidationError } from "class-validator";
import { YOUTUBE_CANONICAL_FIELDS } from "@ingestion/enums/youtube-ingestion.constant";
import { YOUTUBE_PROTECTED_INPUT_FIELDS } from "@ingestion/enums/youtube-ingestion.constant";
import { YOUTUBE_VIDEO_LIMIT } from "@ingestion/enums/youtube-ingestion.constant";
import { CanonicalYouTubeInput } from "@ingestion/dtos/canonical-youtube.input";
import { normalizeYouTubeCategory } from "@ingestion/utils/youtube-normalizer.util";
import { sanitizeCourseText } from "@common/utils/course-normalizer.util";
import { Injectable } from "@nestjs/common";
import { createHash } from "node:crypto";
import {
  toDate,
  toInteger,
  toText,
} from "@ingestion/utils/canonical-coerce.util";

import type { PreparedYouTubeItem } from "@ingestion/types/youtube-ingestion.types";
import type { YouTubeVideoCanonical } from "@ingestion/types/youtube-ingestion.types";

type YouTubeCanonicalField = (typeof YOUTUBE_CANONICAL_FIELDS)[number];
type YouTubeFieldMap = Record<string, string>;

const protectedFields = new Set<string>(YOUTUBE_PROTECTED_INPUT_FIELDS);
const SCALAR_FIELDS = YOUTUBE_CANONICAL_FIELDS.filter(
  (field) => field !== "videos",
);

const validationReason = (errors: ValidationError[]) => {
  const reasons = errors.flatMap((error) =>
    Object.values(error.constraints ?? {}).map(
      (constraint) => `${error.property}: ${constraint}`,
    ),
  );
  return reasons.join("; ") || "The canonical YouTube channel item is invalid.";
};

@Injectable()
export class YouTubeIngestionPipeline {
  prepare(
    rawItem: unknown,
    fieldMap: YouTubeFieldMap,
    includeUnmappedValues: boolean,
  ): PreparedYouTubeItem {
    if (!rawItem || typeof rawItem !== "object" || Array.isArray(rawItem))
      return this.rejected(
        null,
        [],
        undefined,
        "Each channel item must be an object.",
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
    const scalars = this.sanitize(this.coerce(mapped));
    const core = Object.assign(new CanonicalYouTubeInput(), scalars);
    const externalId =
      typeof core.externalId === "string" && core.externalId
        ? core.externalId
        : null;

    const videoOutcome = this.readVideos(mapped);
    const canonicalHash = this.hash(scalars, videoOutcome.value);

    const protectedField = Object.keys(sourceItem).find((field) =>
      protectedFields.has(field),
    );
    if (protectedField)
      return this.rejected(
        externalId,
        unmappedFields,
        unmappedValues,
        `${protectedField} is owned by the platform and cannot be supplied.`,
      );

    if (videoOutcome.outcome === "invalid")
      return this.rejected(
        externalId,
        unmappedFields,
        unmappedValues,
        videoOutcome.reason,
      );

    const errors = validateSync(core, {
      whitelist: true,
      forbidNonWhitelisted: true,
      validationError: { target: false, value: false },
    });
    if (errors.length > 0)
      return this.rejected(
        externalId,
        unmappedFields,
        unmappedValues,
        validationReason(errors),
      );

    return {
      outcome: "accepted",
      canonical: { core, videos: videoOutcome.value },
      canonicalHash,
      externalId: core.externalId,
      unmappedFields,
      ...(unmappedValues ? { unmappedValues } : {}),
    };
  }

  private map(source: Record<string, unknown>, fieldMap: YouTubeFieldMap) {
    const mapped: Partial<Record<YouTubeCanonicalField, unknown>> = {};
    for (const [sourceField, targetField] of Object.entries(fieldMap))
      if (Object.prototype.hasOwnProperty.call(source, sourceField))
        mapped[targetField as YouTubeCanonicalField] = source[sourceField];
    return mapped;
  }

  private coerce(mapped: Partial<Record<YouTubeCanonicalField, unknown>>) {
    const nonNegative = (value: unknown) => {
      const parsed = toInteger(value);
      return parsed !== null && parsed >= 0 ? parsed : null;
    };
    return {
      externalId: toText(mapped.externalId),
      canonicalUrl: toText(mapped.canonicalUrl),
      sourcePlatform: toText(mapped.sourcePlatform),
      title: toText(mapped.title),
      description: toText(mapped.description),
      imageCandidateUrl: toText(mapped.imageCandidateUrl),
      channelUrl: toText(mapped.channelUrl),
      category: normalizeYouTubeCategory(toText(mapped.category)),
      subscribers: nonNegative(mapped.subscribers),
      views: nonNegative(mapped.views),
      videoCount: nonNegative(mapped.videoCount),
      language: toText(mapped.language),
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

  private readVideos(
    mapped: Partial<Record<YouTubeCanonicalField, unknown>>,
  ):
    | { outcome: "omitted" | "ok"; value: YouTubeVideoCanonical[] | null }
    | { outcome: "invalid"; value: null; reason: string } {
    if (!Object.prototype.hasOwnProperty.call(mapped, "videos"))
      return { outcome: "omitted", value: null };
    const raw = mapped.videos;
    if (raw === null || raw === undefined) return { outcome: "ok", value: [] };
    if (!Array.isArray(raw))
      return {
        outcome: "invalid",
        value: null,
        reason: "videos must be an array when supplied.",
      };
    if (raw.length > YOUTUBE_VIDEO_LIMIT)
      return {
        outcome: "invalid",
        value: null,
        reason: `A channel may carry at most ${YOUTUBE_VIDEO_LIMIT} videos.`,
      };

    const byId = new Map<string, YouTubeVideoCanonical>();
    for (const entry of raw) {
      if (!entry || typeof entry !== "object" || Array.isArray(entry))
        return {
          outcome: "invalid",
          value: null,
          reason: "Each video must be an object.",
        };
      const row = entry as Record<string, unknown>;
      const videoId = toText(row.externalId)?.trim();
      const title = sanitizeCourseText(toText(row.title) ?? "");
      if (!videoId || !title)
        return {
          outcome: "invalid",
          value: null,
          reason: "Each video needs an external id and a title.",
        };
      const duration = toInteger(row.durationMinutes);
      const views = toInteger(row.views);
      const likes = toInteger(row.likes);
      byId.set(videoId, {
        externalId: videoId,
        title,
        description: sanitizeCourseText(toText(row.description) ?? "") || null,
        videoUrl: toText(row.videoUrl),
        durationMinutes: duration !== null && duration >= 0 ? duration : null,
        views: views !== null && views >= 0 ? views : null,
        likes: likes !== null && likes >= 0 ? likes : null,
        publishedAt: toDate(row.publishedAt),
      });
    }
    return {
      outcome: "ok",
      value: [...byId.values()].sort((a, b) =>
        a.externalId.localeCompare(b.externalId),
      ),
    };
  }

  private hash(
    scalars: Record<string, unknown>,
    videos: YouTubeVideoCanonical[] | null,
  ) {
    const ordered = Object.fromEntries(
      SCALAR_FIELDS.map((field) => [field, scalars[field] ?? null]),
    );
    return createHash("sha256")
      .update(JSON.stringify({ ...ordered, videos }))
      .digest("hex");
  }

  private rejected(
    externalId: string | null,
    unmappedFields: string[],
    unmappedValues: Record<string, unknown> | undefined,
    reason: string,
  ): PreparedYouTubeItem {
    return {
      outcome: "rejected",
      externalId,
      canonicalHash: createHash("sha256")
        .update(JSON.stringify({ externalId, reason }))
        .digest("hex"),
      reason,
      unmappedFields,
      ...(unmappedValues ? { unmappedValues } : {}),
    };
  }
}
