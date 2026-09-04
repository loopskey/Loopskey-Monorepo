import { CourseStatus, PodcastStatus } from "@prisma/client";
import { ContentType, EventStatus } from "@prisma/client";
import { CatalogEndorsementApi } from "@landing/public/catalog-endorsement-api";
import { CatalogItemProjection } from "@landing/public/catalog-endorsement-api";
import { CatalogSearchQuery } from "@landing/public/catalog-endorsement-api";
import { YouTubeVideoStatus } from "@prisma/client";
import { CatalogReference } from "@landing/public/catalog-endorsement-api";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

const SEARCH_TAKE_MAX = 50;

const contains = (search?: string | null) =>
  search?.trim()
    ? { title: { contains: search.trim(), mode: "insensitive" as const } }
    : {};

@Injectable()
export class CatalogEndorsementApiService implements CatalogEndorsementApi {
  constructor(private readonly prisma: PrismaService) {}

  async searchCatalog(
    query: CatalogSearchQuery,
  ): Promise<CatalogItemProjection[]> {
    const take = Math.min(Math.max(query.take, 1), SEARCH_TAKE_MAX);
    const wanted = query.contentType
      ? [query.contentType as ContentType]
      : [
          ContentType.COURSE,
          ContentType.EVENT,
          ContentType.PODCAST,
          ContentType.YOUTUBE,
        ];

    const results = await Promise.all(
      wanted.map((contentType) => this.searchOne(contentType, query, take)),
    );

    return results.flat().slice(0, take);
  }

  private searchOne(
    contentType: ContentType,
    query: CatalogSearchQuery,
    take: number,
  ): Promise<CatalogItemProjection[]> {
    const where = contains(query.search);

    if (contentType === ContentType.COURSE)
      return this.prisma.course
        .findMany({
          where: { ...where, deletedAt: null, status: CourseStatus.PUBLISHED },
          select: {
            id: true,
            title: true,
            imageUrl: true,
            provider: { select: { fullName: true } },
          },
          orderBy: { title: "asc" },
          take,
        })
        .then((rows) =>
          rows.map((row) => ({
            contentType,
            contentId: row.id,
            title: row.title,
            imageUrl: row.imageUrl,
            provider: row.provider?.fullName ?? null,
            isAvailable: true,
          })),
        );

    if (contentType === ContentType.EVENT)
      return this.prisma.event
        .findMany({
          where: { ...where, deletedAt: null, status: EventStatus.PUBLISHED },
          select: {
            id: true,
            title: true,
            imageUrl: true,
            organizer: true,
            speaker: true,
          },
          orderBy: { startDate: "asc" },
          take,
        })
        .then((rows) =>
          rows.map((row) => ({
            contentType,
            contentId: row.id,
            title: row.title,
            imageUrl: row.imageUrl,
            provider: row.organizer ?? row.speaker,
            isAvailable: true,
          })),
        );

    if (contentType === ContentType.PODCAST)
      return this.prisma.podcast
        .findMany({
          where: { ...where, deletedAt: null, status: PodcastStatus.PUBLISHED },
          select: {
            id: true,
            title: true,
            imageUrl: true,
            provider: { select: { fullName: true } },
          },
          orderBy: { title: "asc" },
          take,
        })
        .then((rows) =>
          rows.map((row) => ({
            contentType,
            contentId: row.id,
            title: row.title,
            imageUrl: row.imageUrl,
            provider: row.provider?.fullName ?? null,
            isAvailable: true,
          })),
        );

    return this.prisma.youTubeVideo
      .findMany({
        where: { ...where, status: YouTubeVideoStatus.PUBLISHED },
        select: {
          id: true,
          title: true,
          thumbnailUrl: true,
          channel: { select: { title: true } },
        },
        orderBy: { title: "asc" },
        take,
      })
      .then((rows) =>
        rows.map((row) => ({
          contentType,
          contentId: row.id,
          title: row.title,
          imageUrl: row.thumbnailUrl,
          provider: row.channel?.title ?? null,
          isAvailable: true,
        })),
      );
  }

  async resolveCatalogItems(
    references: readonly CatalogReference[],
  ): Promise<CatalogItemProjection[]> {
    if (!references.length) return [];

    const idsFor = (contentType: ContentType) => [
      ...new Set(
        references
          .filter((reference) => reference.contentType === contentType)
          .map((reference) => reference.contentId),
      ),
    ];

    const [courses, events, podcasts, videos] = await Promise.all([
      this.resolveCourses(idsFor(ContentType.COURSE)),
      this.resolveEvents(idsFor(ContentType.EVENT)),
      this.resolvePodcasts(idsFor(ContentType.PODCAST)),
      this.resolveVideos(idsFor(ContentType.YOUTUBE)),
    ]);

    return [...courses, ...events, ...podcasts, ...videos];
  }

  private async resolveCourses(ids: string[]) {
    if (!ids.length) return [];

    const rows = await this.prisma.course.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        title: true,
        status: true,
        imageUrl: true,
        deletedAt: true,
        provider: { select: { fullName: true } },
      },
    });

    return rows.map((row) => ({
      contentType: ContentType.COURSE as string,
      contentId: row.id,
      title: row.title,
      imageUrl: row.imageUrl,
      provider: row.provider?.fullName ?? null,
      isAvailable: !row.deletedAt && row.status === CourseStatus.PUBLISHED,
    }));
  }

  private async resolveEvents(ids: string[]) {
    if (!ids.length) return [];

    const rows = await this.prisma.event.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        title: true,
        status: true,
        imageUrl: true,
        speaker: true,
        organizer: true,
        deletedAt: true,
      },
    });

    return rows.map((row) => ({
      contentType: ContentType.EVENT as string,
      contentId: row.id,
      title: row.title,
      imageUrl: row.imageUrl,
      provider: row.organizer ?? row.speaker,
      isAvailable: !row.deletedAt && row.status === EventStatus.PUBLISHED,
    }));
  }

  private async resolvePodcasts(ids: string[]) {
    if (!ids.length) return [];

    const rows = await this.prisma.podcast.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        title: true,
        status: true,
        imageUrl: true,
        deletedAt: true,
        provider: { select: { fullName: true } },
      },
    });

    return rows.map((row) => ({
      contentType: ContentType.PODCAST as string,
      contentId: row.id,
      title: row.title,
      imageUrl: row.imageUrl,
      provider: row.provider?.fullName ?? null,
      isAvailable: !row.deletedAt && row.status === PodcastStatus.PUBLISHED,
    }));
  }

  private async resolveVideos(ids: string[]) {
    if (!ids.length) return [];

    const rows = await this.prisma.youTubeVideo.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        title: true,
        status: true,
        thumbnailUrl: true,
        channel: { select: { title: true } },
      },
    });

    return rows.map((row) => ({
      contentType: ContentType.YOUTUBE as string,
      contentId: row.id,
      title: row.title,
      imageUrl: row.thumbnailUrl,
      provider: row.channel?.title ?? null,
      isAvailable: row.status === YouTubeVideoStatus.PUBLISHED,
    }));
  }
}
