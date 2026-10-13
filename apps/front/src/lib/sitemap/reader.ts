import { ProviderProfileUrlShardsDocument } from "@/lib/graphql/operations/discovery";
import { SITEMAP_PAGE_TAKE, SITEMAP_KINDS } from "./shards";
import { ProviderProfileUrlPageDocument } from "@/lib/graphql/operations/discovery";
import { SITEMAP_MAX_URLS_PER_SHARD } from "./shards";
import { TopicHubUrlShardsDocument } from "@/lib/graphql/operations/discovery";
import { TopicHubUrlPageDocument } from "@/lib/graphql/operations/discovery";
import { PublicUrlShardsDocument } from "@/lib/graphql/operations/discovery";
import { PublicUrlPageDocument } from "@/lib/graphql/operations/discovery";
import { UpstreamFailureError } from "@/lib/server/graphql-server";
import { executeServerGraphql } from "@/lib/server/graphql-server";
import { cache } from "react";

import type { PublicUrlShardsQuery } from "@/lib/graphql/operations/discovery";
import type { EditorialSitemapKind } from "./shards";
import type { PublicUrlPageQuery } from "@/lib/graphql/operations/discovery";
import type { ContentSitemapKind } from "./shards";
import type { SitemapKind } from "./shards";

export type PublicUrlShardSet = PublicUrlShardsQuery["publicUrlShards"][number];
export type PublicUrlShard = PublicUrlShardSet["shards"][number];
export type PublicUrlItem =
  PublicUrlPageQuery["publicUrlPage"]["items"][number];

const MAX_PAGE_REQUESTS_PER_SHARD =
  Math.ceil(SITEMAP_MAX_URLS_PER_SHARD / SITEMAP_PAGE_TAKE) + 1;

export const getPublicUrlShardSets = cache(
  async (): Promise<PublicUrlShardSet[]> => {
    const result = await executeServerGraphql({
      field: "publicUrlShards",
      operation: "PublicUrlShards",
      document: PublicUrlShardsDocument,
      variables: {},
    });
    if (result.kind !== "found") throw new UpstreamFailureError("schema");

    const sets = result.value as unknown as PublicUrlShardSet[];
    if (!Array.isArray(sets)) throw new UpstreamFailureError("schema");

    const answered = new Set(sets.map((set) => set.kind));
    const coversEveryKind = SITEMAP_KINDS.every((kind) =>
      answered.has(kind.contentType),
    );
    if (!coversEveryKind || answered.size !== sets.length)
      throw new UpstreamFailureError("schema");

    for (const set of sets)
      if (set.shardSize < 1 || set.shardSize > SITEMAP_MAX_URLS_PER_SHARD)
        throw new UpstreamFailureError("schema");

    return sets;
  },
);

export const findShardSet = (
  sets: readonly PublicUrlShardSet[],
  kind: ContentSitemapKind,
) => sets.find((set) => set.kind === kind.contentType);

export const readShardUrls = async (
  kind: ContentSitemapKind,
  shard: PublicUrlShard,
): Promise<{ items: PublicUrlItem[]; isComplete: boolean }> => {
  const items: PublicUrlItem[] = [];
  let after: string | null = null;

  for (let request = 0; request < MAX_PAGE_REQUESTS_PER_SHARD; request += 1) {
    const result = await executeServerGraphql({
      field: "publicUrlPage",
      operation: "PublicUrlPage",
      document: PublicUrlPageDocument,
      variables: {
        input: {
          after,
          kind: kind.contentType,
          take: SITEMAP_PAGE_TAKE,
          endCursor: shard.endCursor,
          startCursor: shard.startCursor,
        },
      },
    });
    if (result.kind !== "found") throw new UpstreamFailureError("schema");

    const page = result.value as unknown as PublicUrlPageQuery["publicUrlPage"];
    items.push(...page.items);

    if (items.length >= SITEMAP_MAX_URLS_PER_SHARD)
      return {
        items: items.slice(0, SITEMAP_MAX_URLS_PER_SHARD),
        isComplete: false,
      };
    if (!page.hasNextPage || !page.nextCursor)
      return { items, isComplete: true };
    after = page.nextCursor;
  }

  return { items, isComplete: false };
};

export type KindShardSet = {
  readonly isComplete: boolean;
  readonly shards: readonly PublicUrlShard[];
};

const EDITORIAL_SOURCES = {
  topic: {
    shardsField: "topicHubUrlShards",
    shardsOperation: "TopicHubUrlShards",
    shardsDocument: TopicHubUrlShardsDocument,
    pageField: "topicHubUrlPage",
    pageOperation: "TopicHubUrlPage",
    pageDocument: TopicHubUrlPageDocument,
  },
  provider: {
    shardsField: "providerProfileUrlShards",
    shardsOperation: "ProviderProfileUrlShards",
    shardsDocument: ProviderProfileUrlShardsDocument,
    pageField: "providerProfileUrlPage",
    pageOperation: "ProviderProfileUrlPage",
    pageDocument: ProviderProfileUrlPageDocument,
  },
} as const;

const readEditorialShardSet = cache(
  async (kind: EditorialSitemapKind["editorial"]): Promise<KindShardSet> => {
    const source = EDITORIAL_SOURCES[kind];
    const result = await executeServerGraphql({
      field: source.shardsField,
      operation: source.shardsOperation,
      document: source.shardsDocument,
      variables: {},
    });
    if (result.kind !== "found") throw new UpstreamFailureError("schema");

    const set = result.value as unknown as KindShardSet & {
      shardSize: number;
    };
    if (
      !Array.isArray(set.shards) ||
      set.shardSize < 1 ||
      set.shardSize > SITEMAP_MAX_URLS_PER_SHARD
    )
      throw new UpstreamFailureError("schema");
    return { isComplete: set.isComplete, shards: set.shards };
  },
);

export const getKindShardSet = async (
  kind: SitemapKind,
): Promise<KindShardSet | undefined> =>
  kind.source === "content"
    ? findShardSet(await getPublicUrlShardSets(), kind)
    : readEditorialShardSet(kind.editorial);

const readEditorialShardUrls = async (
  kind: EditorialSitemapKind,
  shard: PublicUrlShard,
): Promise<{ items: PublicUrlItem[]; isComplete: boolean }> => {
  const source = EDITORIAL_SOURCES[kind.editorial];
  const items: PublicUrlItem[] = [];
  let after: string | null = null;

  for (let request = 0; request < MAX_PAGE_REQUESTS_PER_SHARD; request += 1) {
    const result = await executeServerGraphql({
      field: source.pageField,
      operation: source.pageOperation,
      document: source.pageDocument,
      variables: {
        input: {
          after,
          take: SITEMAP_PAGE_TAKE,
          endCursor: shard.endCursor,
          startCursor: shard.startCursor,
        },
      },
    });
    if (result.kind !== "found") throw new UpstreamFailureError("schema");

    const page = result.value as unknown as {
      items: PublicUrlItem[];
      hasNextPage: boolean;
      nextCursor?: string | null;
    };
    items.push(...page.items);

    if (items.length >= SITEMAP_MAX_URLS_PER_SHARD)
      return {
        items: items.slice(0, SITEMAP_MAX_URLS_PER_SHARD),
        isComplete: false,
      };
    if (!page.hasNextPage || !page.nextCursor)
      return { items, isComplete: true };
    after = page.nextCursor;
  }

  return { items, isComplete: false };
};

export const readKindShardUrls = (kind: SitemapKind, shard: PublicUrlShard) =>
  kind.source === "content"
    ? readShardUrls(kind, shard)
    : readEditorialShardUrls(kind, shard);
