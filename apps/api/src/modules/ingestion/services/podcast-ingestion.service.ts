import { IngestionContentKind, PodcastStatus, Prisma } from "@prisma/client";
import { PODCAST_CANONICAL_FIELDS } from "@ingestion/enums/podcast-ingestion.constant";
import { validateCanonicalFieldMap } from "@ingestion/utils/canonical-field-map.util";
import { AbstractKindIngestionService } from "@ingestion/services/abstract-kind-ingestion.service";
import { PodcastIngestionPipeline } from "@ingestion/services/podcast-ingestion-pipeline.service";
import { IngestionMessageCode } from "@ingestion/enums/message-code.enum";
import { requestContext } from "@infrastructure/observability/request-context";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

import type { AcceptedKindItem } from "@ingestion/types/kind-ingestion.types";
import type { CatalogWriteResult } from "@ingestion/services/abstract-kind-ingestion.service";
import type { PodcastCanonical } from "@ingestion/types/podcast-ingestion.types";
import type { PreparedKindItem } from "@ingestion/types/kind-ingestion.types";
import type { TIngestionSourceContext } from "@ingestion/types/ingestion.types";

type LockedEpisode = { episodeNumber: number };

@Injectable()
export class PodcastIngestionService extends AbstractKindIngestionService<PodcastCanonical> {
  readonly kind = IngestionContentKind.PODCAST;

  constructor(
    prisma: PrismaService,
    outbox: OutboxService,
    private readonly pipeline: PodcastIngestionPipeline,
  ) {
    super(prisma, outbox);
  }

  resolveFieldMap(rawFieldMap: unknown): Record<string, string> {
    return validateCanonicalFieldMap(
      rawFieldMap ?? {},
      PODCAST_CANONICAL_FIELDS,
      "podcast",
    );
  }

  prepare(
    rawItem: unknown,
    fieldMap: Record<string, string>,
    includeUnmappedValues: boolean,
  ): PreparedKindItem<PodcastCanonical> {
    return this.pipeline.prepare(rawItem, fieldMap, includeUnmappedValues);
  }

  protected coreLinks(prepared: AcceptedKindItem<PodcastCanonical>) {
    return {
      canonicalUrl: prepared.canonical.core.canonicalUrl,
      imageCandidateUrl: prepared.canonical.core.imageCandidateUrl ?? null,
    };
  }

  protected async catalogExists(externalRef: string): Promise<boolean> {
    const row = await this.prisma.podcast.findUnique({
      where: { externalRef },
      select: { id: true },
    });
    return row !== null;
  }

  protected async writeCatalog(
    tx: Prisma.TransactionClient,
    source: TIngestionSourceContext,
    prepared: AcceptedKindItem<PodcastCanonical>,
    slugAttempt: number,
  ): Promise<CatalogWriteResult> {
    const { core, episodes, skippedEpisodeCount } = prepared.canonical;
    if (skippedEpisodeCount > 0)
      this.logger.warn("Skipped podcast episodes with no episode number.", {
        correlationId: requestContext.correlationId(),
        code: IngestionMessageCode.INGESTION_EPISODE_NUMBER_REQUIRED,
        sourceId: source.sourceId,
        externalId: prepared.externalId,
        skippedEpisodeCount,
      });
    const externalRef = this.externalRef(source, prepared.externalId);
    const existing = await tx.podcast.findUnique({
      where: { externalRef },
      select: { id: true },
    });

    const data = {
      title: core.title,
      description: core.description,
      host: core.host,
      category: core.category,
      status: this.publishedStatus(source) as PodcastStatus,
      durationMinutes: core.durationMinutes ?? null,
      deletedAt: null,
    };

    const podcast = existing
      ? await tx.podcast.update({
          where: { id: existing.id },
          data,
          select: { id: true },
        })
      : await tx.podcast.create({
          data: {
            ...data,
            externalRef,
            slug: this.slugCandidate(source, prepared.externalId, slugAttempt),
          },
          select: { id: true },
        });

    if (episodes !== null) {
      // Lock the podcast's episode rows in ascending number order on every
      // path, so two crawls of one podcast cannot deadlock.
      await tx.$queryRaw<LockedEpisode[]>`
        SELECT "episodeNumber" FROM "PodcastEpisode"
        WHERE "podcastId" = ${podcast.id}
        ORDER BY "episodeNumber"
        FOR UPDATE
      `;
      const incomingNumbers = episodes.map((episode) => episode.episodeNumber);
      await tx.podcastEpisode.deleteMany({
        where: {
          podcastId: podcast.id,
          episodeNumber: {
            notIn: incomingNumbers.length ? incomingNumbers : [-1],
          },
        },
      });
      for (const episode of episodes)
        await tx.podcastEpisode.upsert({
          where: {
            podcastId_episodeNumber: {
              podcastId: podcast.id,
              episodeNumber: episode.episodeNumber,
            },
          },
          create: {
            podcastId: podcast.id,
            episodeNumber: episode.episodeNumber,
            title: episode.title,
            description: episode.description,
            audioUrl: episode.audioUrl,
            durationMinutes: episode.durationMinutes,
            publishedAt: episode.publishedAt
              ? new Date(episode.publishedAt)
              : null,
          },
          update: {
            title: episode.title,
            description: episode.description,
            audioUrl: episode.audioUrl,
            durationMinutes: episode.durationMinutes,
            publishedAt: episode.publishedAt
              ? new Date(episode.publishedAt)
              : null,
          },
        });
    }

    // `episodeCount` is always the number of stored rows, never the crawler's.
    const episodeCount = await tx.podcastEpisode.count({
      where: { podcastId: podcast.id },
    });
    await tx.podcast.update({
      where: { id: podcast.id },
      data: { episodeCount },
    });

    return {
      catalogId: podcast.id,
      changeState: existing ? "updated" : "created",
    };
  }
}
