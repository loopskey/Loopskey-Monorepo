import { COURSE_PUBLIC_URL_API } from "@course/public/public-url-api";
import { EVENT_PUBLIC_URL_API } from "@events/public/public-url-api";
import { PODCAST_PUBLIC_URL_API } from "@podcast/public/public-url-api";
import { YOUTUBE_PUBLIC_URL_API } from "@youtube/public/public-url-api";
import { PublicUrlShardSetEntity } from "@discovery/entities/public-url-shard.entity";
import { PublicUrlPageInput } from "@discovery/dtos/public-url-page.input";
import { requestContext } from "@infrastructure/observability/request-context";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { NotFoundException } from "@nestjs/common";
import { ContentType } from "@prisma/client";

import type { PublicUrlApi } from "@utils/public-url-enumeration.util";

const SLOW_ENUMERATION_THRESHOLD_MS = Number(
  process.env.PUBLIC_URL_SLOW_QUERY_MS ?? 500,
);

@Injectable()
export class PublicUrlIndexService {
  private readonly logger = new Logger(PublicUrlIndexService.name);
  private readonly sources: ReadonlyMap<ContentType, PublicUrlApi>;

  constructor(
    @Inject(COURSE_PUBLIC_URL_API) courseUrls: PublicUrlApi,
    @Inject(EVENT_PUBLIC_URL_API) eventUrls: PublicUrlApi,
    @Inject(PODCAST_PUBLIC_URL_API) podcastUrls: PublicUrlApi,
    @Inject(YOUTUBE_PUBLIC_URL_API) youtubeUrls: PublicUrlApi,
  ) {
    this.sources = new Map(
      [courseUrls, eventUrls, podcastUrls, youtubeUrls].map((source) => [
        source.kind,
        source,
      ]),
    );
  }

  async readShardSets(): Promise<PublicUrlShardSetEntity[]> {
    const startedAt = Date.now();
    const sets = await Promise.all(
      [...this.sources.values()].map(async (source) => {
        const { shardSize, shards, truncated } = await source.readShards();
        if (truncated)
          this.logger.warn("Public URL shard cap reached", {
            kind: source.kind,
            shardCount: shards.length,
            correlationId: requestContext.correlationId(),
          });
        return {
          kind: source.kind,
          shardSize,
          isComplete: !truncated,
          shards,
        };
      }),
    );
    this.logEnumeration("shards", startedAt, {
      shardCount: sets.reduce((total, set) => total + set.shards.length, 0),
      urlCount: sets.reduce(
        (total, set) =>
          total + set.shards.reduce((sum, shard) => sum + shard.urlCount, 0),
        0,
      ),
    });
    return sets;
  }

  async readPage(input: PublicUrlPageInput) {
    const source = this.sources.get(input.kind);
    if (!source) throw new NotFoundException();
    const startedAt = Date.now();
    const page = await source.readPage(input);
    this.logEnumeration("page", startedAt, {
      kind: input.kind,
      urlCount: page.items.length,
      hasNextPage: page.hasNextPage,
    });
    return page;
  }

  private logEnumeration(
    operation: "shards" | "page",
    startedAt: number,
    context: Record<string, unknown>,
  ) {
    const durationMs = Date.now() - startedAt;
    const entry = {
      operation,
      durationMs,
      ...context,
      correlationId: requestContext.correlationId(),
    };
    if (durationMs > SLOW_ENUMERATION_THRESHOLD_MS)
      this.logger.warn("Public URL enumeration exceeded threshold", entry);
    else this.logger.log("Public URL enumeration", entry);
  }
}
