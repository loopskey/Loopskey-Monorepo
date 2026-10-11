import { ContentType } from "@/lib/graphql/base";

export const SITEMAP_INDEX_PATH = "/sitemap.xml";
export const SITEMAP_SHARD_BASE_PATH = "/sitemaps";
export const STATIC_SHARD_NAME = "static";
export const SITEMAP_MAX_URLS_PER_SHARD = 25_000;
export const SITEMAP_PAGE_TAKE = 2_500;
export const SITEMAP_MAX_AGE_SECONDS = 300;

export type SitemapKind = {
  readonly contentType: ContentType;
  readonly shardName: string;
  readonly detailBasePath: string;
};

export const SITEMAP_KINDS: readonly SitemapKind[] = [
  {
    contentType: ContentType.Course,
    shardName: "courses",
    detailBasePath: "/courses",
  },
  {
    contentType: ContentType.Event,
    shardName: "events",
    detailBasePath: "/events",
  },
  {
    contentType: ContentType.Podcast,
    shardName: "podcasts",
    detailBasePath: "/podcasts",
  },
  {
    contentType: ContentType.Youtube,
    shardName: "youtube",
    detailBasePath: "/youtube",
  },
] as const;

export type ShardSelector =
  | { readonly type: "static" }
  | {
      readonly type: "content";
      readonly kind: SitemapKind;
      readonly index: number;
    };

const SHARD_FILE_PATTERN = /^([a-z]+)(?:-([1-9]\d{0,5}))?\.xml$/;

export const shardPath = (name: string) =>
  `${SITEMAP_SHARD_BASE_PATH}/${name}.xml`;

export const contentShardName = (kind: SitemapKind, index: number) =>
  `${kind.shardName}-${index + 1}`;

export const parseShardFile = (file: string): ShardSelector | null => {
  const match = SHARD_FILE_PATTERN.exec(file);
  if (!match) return null;

  const [, name, position] = match;
  if (name === STATIC_SHARD_NAME) return position ? null : { type: "static" };
  if (!position) return null;

  const kind = SITEMAP_KINDS.find((candidate) => candidate.shardName === name);
  if (!kind) return null;

  return { type: "content", kind, index: Number(position) - 1 };
};
