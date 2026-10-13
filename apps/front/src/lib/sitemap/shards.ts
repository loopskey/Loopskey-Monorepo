import { ContentType } from "@/lib/graphql/base";

export const SITEMAP_INDEX_PATH = "/sitemap.xml";
export const SITEMAP_SHARD_BASE_PATH = "/sitemaps";
export const STATIC_SHARD_NAME = "static";
export const SITEMAP_MAX_URLS_PER_SHARD = 25_000;
export const SITEMAP_PAGE_TAKE = 2_500;
export const SITEMAP_MAX_AGE_SECONDS = 300;

export type ContentSitemapKind = {
  readonly source: "content";
  readonly contentType: ContentType;
  readonly shardName: string;
  readonly detailBasePath: string;
};

export type EditorialSitemapKind = {
  readonly source: "editorial";
  readonly editorial: "topic" | "provider";
  readonly shardName: string;
  readonly detailBasePath: string;
};

export type SitemapKind = ContentSitemapKind | EditorialSitemapKind;

export const kindLabel = (kind: SitemapKind) =>
  kind.source === "content" ? kind.contentType : kind.editorial;

export const SITEMAP_KINDS: readonly ContentSitemapKind[] = [
  {
    source: "content",
    contentType: ContentType.Course,
    shardName: "courses",
    detailBasePath: "/courses",
  },
  {
    source: "content",
    contentType: ContentType.Event,
    shardName: "events",
    detailBasePath: "/events",
  },
  {
    source: "content",
    contentType: ContentType.Podcast,
    shardName: "podcasts",
    detailBasePath: "/podcasts",
  },
  {
    source: "content",
    contentType: ContentType.Youtube,
    shardName: "youtube",
    detailBasePath: "/youtube",
  },
] as const;

export const EDITORIAL_SITEMAP_KINDS: readonly EditorialSitemapKind[] = [
  {
    source: "editorial",
    editorial: "topic",
    shardName: "topics",
    detailBasePath: "/topics",
  },
  {
    source: "editorial",
    editorial: "provider",
    shardName: "providers",
    detailBasePath: "/providers",
  },
] as const;

export const ALL_SITEMAP_KINDS: readonly SitemapKind[] = [
  ...SITEMAP_KINDS,
  ...EDITORIAL_SITEMAP_KINDS,
];

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

  const kind = ALL_SITEMAP_KINDS.find(
    (candidate) => candidate.shardName === name,
  );
  if (!kind) return null;

  return { type: "content", kind, index: Number(position) - 1 };
};
