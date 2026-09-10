import {
  IngestionContentKind,
  Prisma,
  YouTubeChannelStatus,
} from "@prisma/client";
import { YOUTUBE_CANONICAL_FIELDS } from "@ingestion/enums/youtube-ingestion.constant";
import { validateCanonicalFieldMap } from "@ingestion/utils/canonical-field-map.util";
import { AbstractKindIngestionService } from "@ingestion/services/abstract-kind-ingestion.service";
import { YouTubeIngestionPipeline } from "@ingestion/services/youtube-ingestion-pipeline.service";
import { OutboxService } from "@infrastructure/outbox/outbox.service";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

import type { AcceptedKindItem } from "@ingestion/types/kind-ingestion.types";
import type { CatalogWriteResult } from "@ingestion/services/abstract-kind-ingestion.service";
import type { PreparedKindItem } from "@ingestion/types/kind-ingestion.types";
import type { TIngestionSourceContext } from "@ingestion/types/ingestion.types";
import type { YouTubeCanonical } from "@ingestion/types/youtube-ingestion.types";

type LockedVideo = { externalRef: string };

@Injectable()
export class YouTubeIngestionService extends AbstractKindIngestionService<YouTubeCanonical> {
  readonly kind = IngestionContentKind.YOUTUBE;

  constructor(
    prisma: PrismaService,
    outbox: OutboxService,
    private readonly pipeline: YouTubeIngestionPipeline,
  ) {
    super(prisma, outbox);
  }

  resolveFieldMap(rawFieldMap: unknown): Record<string, string> {
    return validateCanonicalFieldMap(
      rawFieldMap ?? {},
      YOUTUBE_CANONICAL_FIELDS,
      "youtube",
    );
  }

  prepare(
    rawItem: unknown,
    fieldMap: Record<string, string>,
    includeUnmappedValues: boolean,
  ): PreparedKindItem<YouTubeCanonical> {
    return this.pipeline.prepare(rawItem, fieldMap, includeUnmappedValues);
  }

  protected coreLinks(prepared: AcceptedKindItem<YouTubeCanonical>) {
    return {
      canonicalUrl: prepared.canonical.core.canonicalUrl,
      imageCandidateUrl: prepared.canonical.core.imageCandidateUrl ?? null,
    };
  }

  protected async catalogExists(externalRef: string): Promise<boolean> {
    const row = await this.prisma.youTubeChannel.findUnique({
      where: { externalRef },
      select: { id: true },
    });
    return row !== null;
  }

  protected async writeCatalog(
    tx: Prisma.TransactionClient,
    source: TIngestionSourceContext,
    prepared: AcceptedKindItem<YouTubeCanonical>,
    slugAttempt: number,
  ): Promise<CatalogWriteResult> {
    const { core, videos } = prepared.canonical;
    const externalRef = this.externalRef(source, prepared.externalId);
    const existing = await tx.youTubeChannel.findUnique({
      where: { externalRef },
      select: { id: true },
    });

    const data = {
      title: core.title,
      description: core.description ?? null,
      channelUrl: core.channelUrl,
      category: core.category,
      status: this.publishedStatus(source) as YouTubeChannelStatus,
      // For a channel these are the source's own public figures, not platform
      // state, so a crawl may set them.
      subscribers: core.subscribers ?? 0,
      views: core.views ?? 0,
      videoCount: core.videoCount ?? 0,
      deletedAt: null,
    };

    const channel = existing
      ? await tx.youTubeChannel.update({
          where: { id: existing.id },
          data,
          select: { id: true },
        })
      : await tx.youTubeChannel.create({
          data: {
            ...data,
            externalRef,
            slug: this.slugCandidate(source, prepared.externalId, slugAttempt),
          },
          select: { id: true },
        });

    if (videos !== null && videos.length > 0) {
      // Lock the channel's existing video rows in a stable order first, so two
      // crawls of one channel cannot deadlock.
      await tx.$queryRaw<LockedVideo[]>`
        SELECT "externalRef" FROM "YouTubeVideo"
        WHERE "channelId" = ${channel.id}
        ORDER BY "externalRef"
        FOR UPDATE
      `;
      for (const video of videos) {
        const videoRef = `${externalRef}:${video.externalId}`;
        const videoData = {
          title: video.title,
          description: video.description,
          videoUrl: video.videoUrl,
          durationMinutes: video.durationMinutes,
          views: video.views ?? 0,
          likes: video.likes ?? 0,
          publishedAt: video.publishedAt ? new Date(video.publishedAt) : null,
        };
        await tx.youTubeVideo.upsert({
          where: { externalRef: videoRef },
          create: {
            ...videoData,
            channelId: channel.id,
            externalRef: videoRef,
          },
          update: videoData,
        });
      }
    }

    return {
      catalogId: channel.id,
      changeState: existing ? "updated" : "created",
    };
  }
}
