import { CourseStatus, EventStatus, PodcastStatus } from "@prisma/client";
import { ContentUrlNamespace, Prisma } from "@prisma/client";
import { YouTubeChannelStatus } from "@prisma/client";
import { publicContentChange } from "@utils/public-content-change.util";

export type ContentUrlRecord = {
  id: string;
  slug: string;
  deletedAt: Date | null;
  providerId: string | null;
};

export type ContentUrlKind = {
  entityType: string;
  find(
    client: Prisma.TransactionClient,
    id: string,
  ): Promise<ContentUrlRecord | null>;
  rename(
    tx: Prisma.TransactionClient,
    id: string,
    from: string,
    to: string,
  ): Promise<number>;
  findPublishedSlug(
    client: Prisma.TransactionClient,
    id: string,
  ): Promise<string | null>;
};

const recordSelect = {
  id: true,
  slug: true,
  providerId: true,
  deletedAt: true,
} as const;

const publishedSlugSelect = { slug: true } as const;

const renamed = (id: string, from: string, to: string) => ({
  where: { id, slug: from, deletedAt: null },
  data: { slug: to, ...publicContentChange() },
});

export const CONTENT_URL_KINDS: Record<ContentUrlNamespace, ContentUrlKind> = {
  [ContentUrlNamespace.COURSE]: {
    entityType: "Course",
    find: (client, id) =>
      client.course.findUnique({ where: { id }, select: recordSelect }),
    rename: async (tx, id, from, to) =>
      (await tx.course.updateMany(renamed(id, from, to))).count,
    findPublishedSlug: async (client, id) =>
      (
        await client.course.findFirst({
          where: { id, status: CourseStatus.PUBLISHED, deletedAt: null },
          select: publishedSlugSelect,
        })
      )?.slug ?? null,
  },
  [ContentUrlNamespace.EVENT]: {
    entityType: "Event",
    find: (client, id) =>
      client.event.findUnique({ where: { id }, select: recordSelect }),
    rename: async (tx, id, from, to) =>
      (await tx.event.updateMany(renamed(id, from, to))).count,
    findPublishedSlug: async (client, id) =>
      (
        await client.event.findFirst({
          where: { id, status: EventStatus.PUBLISHED, deletedAt: null },
          select: publishedSlugSelect,
        })
      )?.slug ?? null,
  },
  [ContentUrlNamespace.PODCAST]: {
    entityType: "Podcast",
    find: (client, id) =>
      client.podcast.findUnique({ where: { id }, select: recordSelect }),
    rename: async (tx, id, from, to) =>
      (await tx.podcast.updateMany(renamed(id, from, to))).count,
    findPublishedSlug: async (client, id) =>
      (
        await client.podcast.findFirst({
          where: { id, status: PodcastStatus.PUBLISHED, deletedAt: null },
          select: publishedSlugSelect,
        })
      )?.slug ?? null,
  },
  [ContentUrlNamespace.YOUTUBE]: {
    entityType: "YouTubeChannel",
    find: (client, id) =>
      client.youTubeChannel.findUnique({ where: { id }, select: recordSelect }),
    rename: async (tx, id, from, to) =>
      (await tx.youTubeChannel.updateMany(renamed(id, from, to))).count,
    findPublishedSlug: async (client, id) =>
      (
        await client.youTubeChannel.findFirst({
          where: {
            id,
            status: YouTubeChannelStatus.PUBLISHED,
            deletedAt: null,
          },
          select: publishedSlugSelect,
        })
      )?.slug ?? null,
  },
};
