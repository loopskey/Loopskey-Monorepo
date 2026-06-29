import { Injectable, NotFoundException } from "@nestjs/common";
import { PodcastStatus, Prisma, Role } from "@prisma/client";
import { CreatePodcastEpisodeInput } from "@podcast/dtos/create-podcast-episode.input";
import { UpdatePodcastEpisodeInput } from "@podcast/dtos/update-podcast-episode.input";
import { PodcastPaginationInput } from "@podcast/dtos/podcast-pagination";
import { ForbiddenException } from "@nestjs/common";
import { CreatePodcastInput } from "@podcast/dtos/create-podcast.input";
import { UpdatePodcastInput } from "@podcast/dtos/update-podcast.input";
import { PodcastFilterInput } from "@podcast/dtos/podcast-filter.input";
import { PodcastMessageCode } from "@podcast/enums/message-code.enum";
import { PodcastSortInput } from "@podcast/dtos/podcast-sort.input";
import { PodcastRequester } from "@podcast/types/podcast-service.types";
import { PrismaService } from "@prisma/prisma.service";
import {
  PodcastSortDirection,
  PodcastSortField,
} from "../enums/gql-names.enum";

@Injectable()
export class PodcastService {
  constructor(private readonly prismaService: PrismaService) {}

  async createPodcast(input: CreatePodcastInput, requester: PodcastRequester) {
    this.ensureProviderOrAdmin(requester);
    const slug = await this.generateUniqueSlug(input.title);
    return this.prismaService.podcast.create({
      data: {
        slug,
        title: input.title.trim(),
        host: input.host.trim(),
        imageUrl: input.imageUrl,
        description: input.description.trim(),
        category: input.category,
        status: input.status ?? PodcastStatus.DRAFT,
        durationMinutes: input.durationMinutes,
        isFeatured:
          requester.role === Role.ADMIN ? (input.isFeatured ?? false) : false,
        rating: input.rating ?? 0,
        providerId: requester.role === Role.PROVIDER ? requester.id : null,
      },
    });
  }

  async updatePodcast(input: UpdatePodcastInput, requester: PodcastRequester) {
    const podcast = await this.findExistingPodcast(input.podcastId);
    this.ensurePodcastOwnerOrAdmin(podcast.providerId, requester);
    return this.prismaService.podcast.update({
      where: { id: input.podcastId },
      data: {
        title: input.title?.trim(),
        host: input.host?.trim(),
        imageUrl: input.imageUrl,
        description: input.description?.trim(),
        category: input.category,
        status: input.status,
        durationMinutes: input.durationMinutes,
        isFeatured:
          requester.role === Role.ADMIN ? input.isFeatured : undefined,
        rating: input.rating,
      },
    });
  }

  async publishPodcast(podcastId: string, requester: PodcastRequester) {
    const podcast = await this.findExistingPodcast(podcastId);
    this.ensurePodcastOwnerOrAdmin(podcast.providerId, requester);
    return this.prismaService.podcast.update({
      where: { id: podcastId },
      data: { status: PodcastStatus.PUBLISHED },
    });
  }

  async archivePodcast(podcastId: string, requester: PodcastRequester) {
    const podcast = await this.findExistingPodcast(podcastId);
    this.ensurePodcastOwnerOrAdmin(podcast.providerId, requester);
    return this.prismaService.podcast.update({
      where: { id: podcastId },
      data: { status: PodcastStatus.ARCHIVED },
    });
  }

  async softDeletePodcast(podcastId: string, requester: PodcastRequester) {
    const podcast = await this.findExistingPodcast(podcastId);
    this.ensurePodcastOwnerOrAdmin(podcast.providerId, requester);
    return this.prismaService.podcast.update({
      where: { id: podcastId },
      data: { deletedAt: new Date() },
    });
  }

  async restorePodcast(podcastId: string, requester: PodcastRequester) {
    const podcast = await this.prismaService.podcast.findUnique({
      where: { id: podcastId },
    });
    if (!podcast)
      throw new NotFoundException(PodcastMessageCode.PODCAST_NOT_FOUND);
    this.ensurePodcastOwnerOrAdmin(podcast.providerId, requester);
    return this.prismaService.podcast.update({
      where: { id: podcastId },
      data: { deletedAt: null },
    });
  }

  async findPodcastById(podcastId: string) {
    const podcast = await this.prismaService.podcast.findFirst({
      where: {
        id: podcastId,
        deletedAt: null,
      },
    });
    if (!podcast)
      throw new NotFoundException(PodcastMessageCode.PODCAST_NOT_FOUND);
    return podcast;
  }

  async findPodcastBySlug(slug: string) {
    const podcast = await this.prismaService.podcast.findFirst({
      where: {
        slug,
        deletedAt: null,
      },
    });
    if (!podcast)
      throw new NotFoundException(PodcastMessageCode.PODCAST_NOT_FOUND);
    return podcast;
  }

  async findPodcasts(
    filter?: PodcastFilterInput,
    pagination?: PodcastPaginationInput,
    sort?: PodcastSortInput,
  ) {
    const search = filter?.search?.trim();
    if (search && search.length >= 2)
      return this.findPodcastsWithTrgmSearch(filter, pagination);
    const take = Math.min(pagination?.take ?? 20, 100);
    const where = this.buildPodcastWhere(filter);
    const orderBy = this.buildOrderBy(sort);
    const [items, totalCount] = await this.prismaService.$transaction([
      this.prismaService.podcast.findMany({
        where,
        take: take + 1,
        cursor: pagination?.cursor ? { id: pagination.cursor } : undefined,
        skip: pagination?.cursor ? 1 : 0,
        orderBy,
      }),
      this.prismaService.podcast.count({ where }),
    ]);
    const hasNextPage = items.length > take;
    const slicedItems = hasNextPage ? items.slice(0, take) : items;
    const nextCursor = hasNextPage
      ? slicedItems[slicedItems.length - 1]?.id
      : null;
    return {
      items: slicedItems,
      totalCount,
      pageInfo: {
        hasNextPage,
        nextCursor,
      },
    };
  }

  private async findPodcastsWithTrgmSearch(
    filter?: PodcastFilterInput,
    pagination?: PodcastPaginationInput,
  ) {
    const take = Math.min(pagination?.take ?? 20, 100);
    const search = filter?.search?.trim() ?? "";
    const cursor = pagination?.cursor ?? null;
    const status = filter?.status ?? PodcastStatus.PUBLISHED;
    const rows = await this.prismaService.$queryRaw<
      Array<{
        id: string;
        slug: string;
        title: string;
        host: string;
        imageUrl: string | null;
        description: string;
        category: string;
        status: string;
        rating: number;
        ratingCount: number;
        listeners: number;
        durationMinutes: number | null;
        episodeCount: number;
        isFeatured: boolean;
        providerId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        searchRank: number;
        totalCount: bigint;
      }>
    >`
      WITH ranked_podcasts AS (
        SELECT
          p.*,
          GREATEST(
            similarity(p."title", ${search}),
            similarity(p."host", ${search}),
            similarity(p."description", ${search})
          ) AS "searchRank"
        FROM "Podcast" p
        WHERE p."deletedAt" IS NULL
          AND p."status" = ${status}::"PodcastStatus"
          AND (${filter?.category ?? null}::"PodcastCategory" IS NULL OR p."category" = ${filter?.category ?? null}::"PodcastCategory")
          AND (${filter?.isFeatured ?? null}::boolean IS NULL OR p."isFeatured" = ${filter?.isFeatured ?? null}::boolean)
          AND (${filter?.providerId ?? null}::text IS NULL OR p."providerId" = ${filter?.providerId ?? null}::text)
          AND (
            p."title" ILIKE '%' || ${search} || '%'
            OR p."host" ILIKE '%' || ${search} || '%'
            OR p."description" ILIKE '%' || ${search} || '%'
            OR similarity(p."title", ${search}) > 0.15
            OR similarity(p."host", ${search}) > 0.15
            OR similarity(p."description", ${search}) > 0.10
          )
          AND (${cursor}::text IS NULL OR p."id" > ${cursor}::text)
      )
      SELECT
        ranked_podcasts.*,
        COUNT(*) OVER() AS "totalCount"
      FROM ranked_podcasts
      ORDER BY "searchRank" DESC, "createdAt" DESC, "id" DESC
      LIMIT ${take + 1};
    `;

    const hasNextPage = rows.length > take;
    const slicedRows = hasNextPage ? rows.slice(0, take) : rows;
    return {
      items: slicedRows.map(({ searchRank, totalCount, ...podcast }) => ({
        ...podcast,
      })),
      totalCount: rows[0]?.totalCount ? Number(rows[0].totalCount) : 0,
      pageInfo: {
        hasNextPage,
        nextCursor: hasNextPage ? slicedRows[slicedRows.length - 1]?.id : null,
      },
    };
  }

  async findFeaturedPodcasts(take = 12) {
    return this.prismaService.podcast.findMany({
      where: {
        status: PodcastStatus.PUBLISHED,
        deletedAt: null,
        isFeatured: true,
      },
      take: Math.min(take, 50),
      orderBy: [
        { rating: "desc" },
        { listeners: "desc" },
        { createdAt: "desc" },
      ],
    });
  }

  async findMyProviderPodcasts(
    requester: PodcastRequester,
    filter?: PodcastFilterInput,
    pagination?: PodcastPaginationInput,
    sort?: PodcastSortInput,
  ) {
    if (requester.role !== Role.PROVIDER && requester.role !== Role.ADMIN)
      throw new ForbiddenException(PodcastMessageCode.PODCAST_ACCESS_DENIED);
    return this.findPodcasts(
      {
        ...filter,
        providerId:
          requester.role === Role.PROVIDER ? requester.id : filter?.providerId,
      },
      pagination,
      sort,
    );
  }

  async findPodcastEpisodes(podcastId: string) {
    await this.findPodcastById(podcastId);
    return this.prismaService.podcastEpisode.findMany({
      where: { podcastId },
      orderBy: { episodeNumber: "asc" },
    });
  }

  async createPodcastEpisode(
    input: CreatePodcastEpisodeInput,
    requester: PodcastRequester,
  ) {
    const podcast = await this.findExistingPodcast(input.podcastId);
    this.ensurePodcastOwnerOrAdmin(podcast.providerId, requester);
    return this.prismaService.$transaction(async (tx) => {
      const episode = await tx.podcastEpisode.create({
        data: {
          podcastId: input.podcastId,
          title: input.title.trim(),
          description: input.description?.trim(),
          audioUrl: input.audioUrl,
          durationMinutes: input.durationMinutes,
          episodeNumber: input.episodeNumber,
          publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
        },
      });
      await tx.podcast.update({
        where: { id: input.podcastId },
        data: {
          episodeCount: { increment: 1 },
          durationMinutes: input.durationMinutes
            ? { increment: input.durationMinutes }
            : undefined,
        },
      });
      return episode;
    });
  }

  async updatePodcastEpisode(
    input: UpdatePodcastEpisodeInput,
    requester: PodcastRequester,
  ) {
    const episode = await this.prismaService.podcastEpisode.findUnique({
      where: { id: input.episodeId },
      include: { podcast: true },
    });
    if (!episode)
      throw new NotFoundException(PodcastMessageCode.PODCAST_EPISODE_NOT_FOUND);
    this.ensurePodcastOwnerOrAdmin(episode.podcast.providerId, requester);
    return this.prismaService.podcastEpisode.update({
      where: { id: input.episodeId },
      data: {
        title: input.title?.trim(),
        description: input.description?.trim(),
        audioUrl: input.audioUrl,
        durationMinutes: input.durationMinutes,
        episodeNumber: input.episodeNumber,
        publishedAt: input.publishedAt
          ? new Date(input.publishedAt)
          : undefined,
      },
    });
  }

  async deletePodcastEpisode(episodeId: string, requester: PodcastRequester) {
    const episode = await this.prismaService.podcastEpisode.findUnique({
      where: { id: episodeId },
      include: { podcast: true },
    });
    if (!episode)
      throw new NotFoundException(PodcastMessageCode.PODCAST_EPISODE_NOT_FOUND);
    this.ensurePodcastOwnerOrAdmin(episode.podcast.providerId, requester);
    return this.prismaService.$transaction(async (tx) => {
      const deleted = await tx.podcastEpisode.delete({
        where: { id: episodeId },
      });
      await tx.podcast.update({
        where: { id: episode.podcastId },
        data: {
          episodeCount: { decrement: 1 },
          durationMinutes: episode.durationMinutes
            ? { decrement: episode.durationMinutes }
            : undefined,
        },
      });
      return deleted;
    });
  }

  private buildPodcastWhere(
    filter?: PodcastFilterInput,
  ): Prisma.PodcastWhereInput {
    return {
      deletedAt: null,
      status: filter?.status ?? PodcastStatus.PUBLISHED,
      category: filter?.category,
      isFeatured: filter?.isFeatured,
      providerId: filter?.providerId,
    };
  }

  private buildOrderBy(
    sort?: PodcastSortInput,
  ): Prisma.PodcastOrderByWithRelationInput[] {
    const field = sort?.field ?? PodcastSortField.CREATED_AT;
    const direction = sort?.direction ?? PodcastSortDirection.DESC;
    return [
      { [field]: direction },
      { id: "desc" },
    ] as Prisma.PodcastOrderByWithRelationInput[];
  }

  private async findExistingPodcast(podcastId: string) {
    const podcast = await this.prismaService.podcast.findFirst({
      where: {
        id: podcastId,
        deletedAt: null,
      },
    });
    if (!podcast)
      throw new NotFoundException(PodcastMessageCode.PODCAST_NOT_FOUND);
    return podcast;
  }

  private ensureProviderOrAdmin(requester: PodcastRequester) {
    if (requester.role !== Role.PROVIDER && requester.role !== Role.ADMIN)
      throw new ForbiddenException(PodcastMessageCode.PODCAST_ACCESS_DENIED);
  }

  private ensurePodcastOwnerOrAdmin(
    providerId: string | null,
    requester: PodcastRequester,
  ) {
    if (requester.role === Role.ADMIN) return;
    if (requester.role !== Role.PROVIDER || providerId !== requester.id)
      throw new ForbiddenException(PodcastMessageCode.PODCAST_ACCESS_DENIED);
  }

  private async generateUniqueSlug(title: string) {
    const baseSlug = this.slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await this.prismaService.podcast.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    return slug;
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
