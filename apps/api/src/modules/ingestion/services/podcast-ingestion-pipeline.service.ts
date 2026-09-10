import { validateSync, type ValidationError } from "class-validator";
import { PODCAST_CANONICAL_FIELDS } from "@ingestion/enums/podcast-ingestion.constant";
import { PODCAST_PROTECTED_INPUT_FIELDS } from "@ingestion/enums/podcast-ingestion.constant";
import { PODCAST_EPISODE_LIMIT } from "@ingestion/enums/podcast-ingestion.constant";
import { CanonicalPodcastInput } from "@ingestion/dtos/canonical-podcast.input";
import { normalizePodcastCategory } from "@ingestion/utils/podcast-normalizer.util";
import { sanitizeCourseText } from "@common/utils/course-normalizer.util";
import { Injectable } from "@nestjs/common";
import { createHash } from "node:crypto";
import {
  toDate,
  toInteger,
  toText,
} from "@ingestion/utils/canonical-coerce.util";

import type { PodcastEpisodeCanonical } from "@ingestion/types/podcast-ingestion.types";
import type { PreparedPodcastItem } from "@ingestion/types/podcast-ingestion.types";

type PodcastCanonicalField = (typeof PODCAST_CANONICAL_FIELDS)[number];
type PodcastFieldMap = Record<string, string>;

const protectedFields = new Set<string>(PODCAST_PROTECTED_INPUT_FIELDS);
const SCALAR_FIELDS = PODCAST_CANONICAL_FIELDS.filter(
  (field) => field !== "episodes",
);

const validationReason = (errors: ValidationError[]) => {
  const reasons = errors.flatMap((error) =>
    Object.values(error.constraints ?? {}).map(
      (constraint) => `${error.property}: ${constraint}`,
    ),
  );
  return reasons.join("; ") || "The canonical podcast item is invalid.";
};

@Injectable()
export class PodcastIngestionPipeline {
  prepare(
    rawItem: unknown,
    fieldMap: PodcastFieldMap,
    includeUnmappedValues: boolean,
  ): PreparedPodcastItem {
    if (!rawItem || typeof rawItem !== "object" || Array.isArray(rawItem))
      return this.rejected(
        null,
        [],
        undefined,
        "Each podcast item must be an object.",
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
    const core = Object.assign(new CanonicalPodcastInput(), scalars);
    const externalId =
      typeof core.externalId === "string" && core.externalId
        ? core.externalId
        : null;

    const episodeOutcome = this.readEpisodes(mapped);
    const canonicalHash = this.hash(scalars, episodeOutcome);

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

    if (episodeOutcome.outcome === "invalid")
      return this.rejected(
        externalId,
        unmappedFields,
        unmappedValues,
        episodeOutcome.reason,
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

    const skipped = episodeOutcome.skipped;
    return {
      outcome: "accepted",
      canonical: {
        core,
        episodes: episodeOutcome.value,
        skippedEpisodeCount: skipped,
      },
      canonicalHash,
      externalId: core.externalId,
      unmappedFields:
        skipped > 0 ? [...unmappedFields, "episodes"].sort() : unmappedFields,
      ...(unmappedValues ? { unmappedValues } : {}),
    };
  }

  private map(source: Record<string, unknown>, fieldMap: PodcastFieldMap) {
    const mapped: Partial<Record<PodcastCanonicalField, unknown>> = {};
    for (const [sourceField, targetField] of Object.entries(fieldMap))
      if (Object.prototype.hasOwnProperty.call(source, sourceField))
        mapped[targetField as PodcastCanonicalField] = source[sourceField];
    return mapped;
  }

  private coerce(mapped: Partial<Record<PodcastCanonicalField, unknown>>) {
    return {
      externalId: toText(mapped.externalId),
      canonicalUrl: toText(mapped.canonicalUrl),
      sourcePlatform: toText(mapped.sourcePlatform),
      title: toText(mapped.title),
      description: toText(mapped.description),
      host: toText(mapped.host),
      imageCandidateUrl: toText(mapped.imageCandidateUrl),
      category: normalizePodcastCategory(toText(mapped.category)),
      durationMinutes: toInteger(mapped.durationMinutes),
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

  private readEpisodes(
    mapped: Partial<Record<PodcastCanonicalField, unknown>>,
  ):
    | {
        outcome: "omitted" | "ok";
        value: PodcastEpisodeCanonical[] | null;
        skipped: number;
      }
    | { outcome: "invalid"; value: null; skipped: 0; reason: string } {
    if (!Object.prototype.hasOwnProperty.call(mapped, "episodes"))
      return { outcome: "omitted", value: null, skipped: 0 };
    const raw = mapped.episodes;
    if (raw === null || raw === undefined)
      return { outcome: "ok", value: [], skipped: 0 };
    if (!Array.isArray(raw))
      return {
        outcome: "invalid",
        value: null,
        skipped: 0,
        reason: "episodes must be an array when supplied.",
      };
    if (raw.length > PODCAST_EPISODE_LIMIT)
      return {
        outcome: "invalid",
        value: null,
        skipped: 0,
        reason: `A podcast may carry at most ${PODCAST_EPISODE_LIMIT} episodes.`,
      };

    const byNumber = new Map<number, PodcastEpisodeCanonical>();
    let skipped = 0;
    for (const entry of raw) {
      if (!entry || typeof entry !== "object" || Array.isArray(entry))
        return {
          outcome: "invalid",
          value: null,
          skipped: 0,
          reason: "Each episode must be an object.",
        };
      const row = entry as Record<string, unknown>;
      const episodeNumber = toInteger(row.episodeNumber);
      const title = sanitizeCourseText(toText(row.title) ?? "");
      // An episode missing its number is rejected individually; the podcast and
      // its numbered episodes still land.
      if (episodeNumber === null || episodeNumber < 1 || !title) {
        skipped += 1;
        continue;
      }
      const duration = toInteger(row.durationMinutes);
      byNumber.set(episodeNumber, {
        episodeNumber,
        title,
        description: sanitizeCourseText(toText(row.description) ?? "") || null,
        audioUrl: toText(row.audioUrl),
        durationMinutes: duration !== null && duration >= 0 ? duration : null,
        publishedAt: toDate(row.publishedAt),
      });
    }
    const value = [...byNumber.values()].sort(
      (a, b) => a.episodeNumber - b.episodeNumber,
    );
    return { outcome: "ok", value, skipped };
  }

  private hash(
    scalars: Record<string, unknown>,
    episodeOutcome: { value: PodcastEpisodeCanonical[] | null },
  ) {
    const ordered = Object.fromEntries(
      SCALAR_FIELDS.map((field) => [field, scalars[field] ?? null]),
    );
    return createHash("sha256")
      .update(JSON.stringify({ ...ordered, episodes: episodeOutcome.value }))
      .digest("hex");
  }

  private rejected(
    externalId: string | null,
    unmappedFields: string[],
    unmappedValues: Record<string, unknown> | undefined,
    reason: string,
  ): PreparedPodcastItem {
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
