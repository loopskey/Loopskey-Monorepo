import { CourseStatus, EventStatus, PodcastStatus } from "@prisma/client";
import { YouTubeChannelStatus } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

import type {
  ContentPublicApi,
  PublicContentCard,
  PublicContentKind,
  PublicContentRef,
} from "@contentUrl/public/content-public-api";

const SUMMARY_MAX_LENGTH = 220;

const cardSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  imageUrl: true,
  category: true,
} as const;

type Row = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  category: string;
};

const summaryOf = (description: string | null) => {
  const text = description?.replace(/\s+/g, " ").trim();
  if (!text) return null;
  if (text.length <= SUMMARY_MAX_LENGTH) return text;
  return `${text.slice(0, SUMMARY_MAX_LENGTH - 1).trimEnd()}…`;
};

const toCard = (kind: PublicContentKind, row: Row): PublicContentCard => ({
  kind,
  id: row.id,
  slug: row.slug,
  title: row.title,
  summary: summaryOf(row.description),
  imageUrl: row.imageUrl,
  category: row.category,
});

const idsOf = (refs: readonly PublicContentRef[], kind: PublicContentKind) =>
  refs.filter((ref) => ref.kind === kind).map((ref) => ref.id);

@Injectable()
export class ContentPublicApiService implements ContentPublicApi {
  constructor(private readonly prisma: PrismaService) {}

  async findPublished(refs: readonly PublicContentRef[]) {
    if (refs.length === 0) return [];
    const byKey = new Map<string, PublicContentCard>();
    for (const card of await this.readByIds(refs))
      byKey.set(`${card.kind}:${card.id}`, card);
    return refs.flatMap((ref) => {
      const card = byKey.get(`${ref.kind}:${ref.id}`);
      return card ? [card] : [];
    });
  }

  async findPublishedProviderId(ref: PublicContentRef) {
    const where = { id: ref.id, deletedAt: null };
    const select = { providerId: true } as const;
    const row = await {
      COURSE: () =>
        this.prisma.course.findFirst({
          where: { ...where, status: CourseStatus.PUBLISHED },
          select,
        }),
      EVENT: () =>
        this.prisma.event.findFirst({
          where: { ...where, status: EventStatus.PUBLISHED },
          select,
        }),
      PODCAST: () =>
        this.prisma.podcast.findFirst({
          where: { ...where, status: PodcastStatus.PUBLISHED },
          select,
        }),
      YOUTUBE: () =>
        this.prisma.youTubeChannel.findFirst({
          where: { ...where, status: YouTubeChannelStatus.PUBLISHED },
          select,
        }),
    }[ref.kind]();
    return row?.providerId ?? null;
  }

  async findPublishedByProvider(providerId: string, take: number) {
    const order = { publicContentUpdatedAt: "desc" } as const;
    const select = { ...cardSelect, publicContentUpdatedAt: true };
    const [courses, events, podcasts, channels] = await Promise.all([
      this.prisma.course.findMany({
        where: { providerId, status: CourseStatus.PUBLISHED, deletedAt: null },
        select,
        orderBy: order,
        take,
      }),
      this.prisma.event.findMany({
        where: { providerId, status: EventStatus.PUBLISHED, deletedAt: null },
        select,
        orderBy: order,
        take,
      }),
      this.prisma.podcast.findMany({
        where: { providerId, status: PodcastStatus.PUBLISHED, deletedAt: null },
        select,
        orderBy: order,
        take,
      }),
      this.prisma.youTubeChannel.findMany({
        where: {
          providerId,
          status: YouTubeChannelStatus.PUBLISHED,
          deletedAt: null,
        },
        select,
        orderBy: order,
        take,
      }),
    ]);
    return [
      ...courses.map((row) => ({ kind: "COURSE" as const, row })),
      ...events.map((row) => ({ kind: "EVENT" as const, row })),
      ...podcasts.map((row) => ({ kind: "PODCAST" as const, row })),
      ...channels.map((row) => ({ kind: "YOUTUBE" as const, row })),
    ]
      .sort(
        (left, right) =>
          right.row.publicContentUpdatedAt.getTime() -
          left.row.publicContentUpdatedAt.getTime(),
      )
      .slice(0, take)
      .map(({ kind, row }) => toCard(kind, row));
  }

  private async readByIds(refs: readonly PublicContentRef[]) {
    const [courses, events, podcasts, channels] = await Promise.all([
      this.readKind(refs, "COURSE", (ids) =>
        this.prisma.course.findMany({
          where: {
            id: { in: ids },
            status: CourseStatus.PUBLISHED,
            deletedAt: null,
          },
          select: cardSelect,
        }),
      ),
      this.readKind(refs, "EVENT", (ids) =>
        this.prisma.event.findMany({
          where: {
            id: { in: ids },
            status: EventStatus.PUBLISHED,
            deletedAt: null,
          },
          select: cardSelect,
        }),
      ),
      this.readKind(refs, "PODCAST", (ids) =>
        this.prisma.podcast.findMany({
          where: {
            id: { in: ids },
            status: PodcastStatus.PUBLISHED,
            deletedAt: null,
          },
          select: cardSelect,
        }),
      ),
      this.readKind(refs, "YOUTUBE", (ids) =>
        this.prisma.youTubeChannel.findMany({
          where: {
            id: { in: ids },
            status: YouTubeChannelStatus.PUBLISHED,
            deletedAt: null,
          },
          select: cardSelect,
        }),
      ),
    ]);
    return [...courses, ...events, ...podcasts, ...channels];
  }

  private async readKind(
    refs: readonly PublicContentRef[],
    kind: PublicContentKind,
    read: (ids: string[]) => Promise<Row[]>,
  ) {
    const ids = idsOf(refs, kind);
    if (ids.length === 0) return [];
    return (await read(ids)).map((row) => toCard(kind, row));
  }
}
