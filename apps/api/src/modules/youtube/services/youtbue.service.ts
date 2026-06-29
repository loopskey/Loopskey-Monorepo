import { Prisma, Role, YouTubeChannelStatus } from "@prisma/client";
import { YouTubeChannelPaginationInput } from "@modules/youtube/dtos/youtube-channel-pagination.input";
import { Injectable, NotFoundException } from "@nestjs/common";
import { YouTubeChannelSortDirection } from "@youtube/enums/youtube.enum";
import { CreateYouTubeChannelInput } from "@youtube/dtos/create-youtube-channel.input";
import { UpdateYouTubeChannelInput } from "@youtube/dtos/update-youtube-channel.input";
import { YouTubeChannelFilterInput } from "@youtube/dtos/youtube-channel-filter.input";
import { YouTubeChannelSortInput } from "@youtube/dtos/youtube-channel-sort.input";
import { CreateYouTubeVideoInput } from "@youtube/dtos/create-youtube-video.input";
import { YouTubeChannelSortField } from "@youtube/enums/youtube.enum";
import { UpdateYouTubeVideoInput } from "@youtube/dtos/update-youtube-video.input";
import { ForbiddenException } from "@nestjs/common";
import { YouTubeMessageCode } from "@youtube/enums/message-code.enum";
import { YouTubeRequester } from "@youtube/enums/youtube.enum";
import { PrismaService } from "@prisma/prisma.service";

@Injectable()
export class YouTubeService {
  constructor(private readonly prismaService: PrismaService) {}

  async createChannel(
    input: CreateYouTubeChannelInput,
    requester: YouTubeRequester,
  ) {
    this.ensureProviderOrAdmin(requester);
    const slug = await this.generateUniqueSlug(input.title);
    return this.prismaService.youTubeChannel.create({
      data: {
        slug,
        title: input.title.trim(),
        description: input.description?.trim(),
        provider: input.provider?.trim(),
        imageUrl: input.imageUrl,
        channelUrl: input.channelUrl,
        subscribers: input.subscribers ?? 0,
        category: input.category,
        status: input.status ?? YouTubeChannelStatus.DRAFT,
        isFeatured:
          requester.role === Role.ADMIN ? (input.isFeatured ?? false) : false,
        providerId: requester.role === Role.PROVIDER ? requester.id : null,
      },
    });
  }

  async updateChannel(
    input: UpdateYouTubeChannelInput,
    requester: YouTubeRequester,
  ) {
    const channel = await this.findExistingChannel(input.channelId);
    this.ensureChannelOwnerOrAdmin(channel.providerId, requester);
    return this.prismaService.youTubeChannel.update({
      where: { id: input.channelId },
      data: {
        title: input.title?.trim(),
        description: input.description?.trim(),
        provider: input.provider?.trim(),
        imageUrl: input.imageUrl,
        channelUrl: input.channelUrl,
        subscribers: input.subscribers,
        category: input.category,
        status: input.status,
        isFeatured:
          requester.role === Role.ADMIN ? input.isFeatured : undefined,
      },
    });
  }

  async publishChannel(channelId: string, requester: YouTubeRequester) {
    const channel = await this.findExistingChannel(channelId);
    this.ensureChannelOwnerOrAdmin(channel.providerId, requester);
    return this.prismaService.youTubeChannel.update({
      where: { id: channelId },
      data: { status: YouTubeChannelStatus.PUBLISHED },
    });
  }

  async archiveChannel(channelId: string, requester: YouTubeRequester) {
    const channel = await this.findExistingChannel(channelId);
    this.ensureChannelOwnerOrAdmin(channel.providerId, requester);
    return this.prismaService.youTubeChannel.update({
      where: { id: channelId },
      data: { status: YouTubeChannelStatus.ARCHIVED },
    });
  }

  async softDeleteChannel(channelId: string, requester: YouTubeRequester) {
    const channel = await this.findExistingChannel(channelId);
    this.ensureChannelOwnerOrAdmin(channel.providerId, requester);
    return this.prismaService.youTubeChannel.update({
      where: { id: channelId },
      data: { deletedAt: new Date() },
    });
  }

  async restoreChannel(channelId: string, requester: YouTubeRequester) {
    const channel = await this.prismaService.youTubeChannel.findUnique({
      where: { id: channelId },
    });
    if (!channel)
      throw new NotFoundException(YouTubeMessageCode.YOUTUBE_CHANNEL_NOT_FOUND);
    this.ensureChannelOwnerOrAdmin(channel.providerId, requester);
    return this.prismaService.youTubeChannel.update({
      where: { id: channelId },
      data: { deletedAt: null },
    });
  }

  async findChannelById(channelId: string) {
    const channel = await this.prismaService.youTubeChannel.findFirst({
      where: {
        id: channelId,
        deletedAt: null,
      },
    });
    if (!channel)
      throw new NotFoundException(YouTubeMessageCode.YOUTUBE_CHANNEL_NOT_FOUND);
    return channel;
  }

  async findChannelBySlug(slug: string) {
    const channel = await this.prismaService.youTubeChannel.findFirst({
      where: {
        slug,
        deletedAt: null,
      },
    });
    if (!channel)
      throw new NotFoundException(YouTubeMessageCode.YOUTUBE_CHANNEL_NOT_FOUND);
    return channel;
  }

  async findChannels(
    filter?: YouTubeChannelFilterInput,
    pagination?: YouTubeChannelPaginationInput,
    sort?: YouTubeChannelSortInput,
  ) {
    const search = filter?.search?.trim();
    if (search && search.length >= 2)
      return this.findChannelsWithTrgmSearch(filter, pagination);
    const take = Math.min(pagination?.take ?? 20, 100);
    const where = this.buildChannelWhere(filter);
    const orderBy = this.buildOrderBy(sort);
    const [items, totalCount] = await this.prismaService.$transaction([
      this.prismaService.youTubeChannel.findMany({
        where,
        take: take + 1,
        cursor: pagination?.cursor ? { id: pagination.cursor } : undefined,
        skip: pagination?.cursor ? 1 : 0,
        orderBy,
      }),
      this.prismaService.youTubeChannel.count({ where }),
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

  private async findChannelsWithTrgmSearch(
    filter?: YouTubeChannelFilterInput,
    pagination?: YouTubeChannelPaginationInput,
  ) {
    const take = Math.min(pagination?.take ?? 20, 100);
    const search = filter?.search?.trim() ?? "";
    const cursor = pagination?.cursor ?? null;
    const status = filter?.status ?? YouTubeChannelStatus.PUBLISHED;
    const rows = await this.prismaService.$queryRaw<
      Array<{
        id: string;
        slug: string;
        title: string;
        description: string | null;
        provider: string | null;
        imageUrl: string | null;
        channelUrl: string | null;
        subscribers: number;
        views: number;
        videoCount: number;
        category: string;
        status: string;
        isFeatured: boolean;
        providerId: string | null;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        searchRank: number;
        totalCount: bigint;
      }>
    >`
      WITH ranked_channels AS (
        SELECT
          yc.*,
          GREATEST(
            similarity(yc."title", ${search}),
            similarity(COALESCE(yc."provider", ''), ${search}),
            similarity(COALESCE(yc."description", ''), ${search})
          ) AS "searchRank"
        FROM "YouTubeChannel" yc
        WHERE yc."deletedAt" IS NULL
          AND yc."status" = ${status}::"YouTubeChannelStatus"
          AND (${filter?.category ?? null}::"YouTubeCategory" IS NULL OR yc."category" = ${filter?.category ?? null}::"YouTubeCategory")
          AND (${filter?.isFeatured ?? null}::boolean IS NULL OR yc."isFeatured" = ${filter?.isFeatured ?? null}::boolean)
          AND (${filter?.providerId ?? null}::text IS NULL OR yc."providerId" = ${filter?.providerId ?? null}::text)
          AND (
            yc."title" ILIKE '%' || ${search} || '%'
            OR COALESCE(yc."provider", '') ILIKE '%' || ${search} || '%'
            OR COALESCE(yc."description", '') ILIKE '%' || ${search} || '%'
            OR similarity(yc."title", ${search}) > 0.15
            OR similarity(COALESCE(yc."provider", ''), ${search}) > 0.15
            OR similarity(COALESCE(yc."description", ''), ${search}) > 0.10
          )
          AND (${cursor}::text IS NULL OR yc."id" > ${cursor}::text)
      )
      SELECT
        ranked_channels.*,
        COUNT(*) OVER() AS "totalCount"
      FROM ranked_channels
      ORDER BY "searchRank" DESC, "subscribers" DESC, "createdAt" DESC, "id" DESC
      LIMIT ${take + 1};
    `;
    const hasNextPage = rows.length > take;
    const slicedRows = hasNextPage ? rows.slice(0, take) : rows;
    return {
      items: slicedRows.map(({ searchRank, totalCount, ...channel }) => ({
        ...channel,
      })),
      totalCount: rows[0]?.totalCount ? Number(rows[0].totalCount) : 0,
      pageInfo: {
        hasNextPage,
        nextCursor: hasNextPage ? slicedRows[slicedRows.length - 1]?.id : null,
      },
    };
  }

  async findFeaturedChannels(take = 12) {
    return this.prismaService.youTubeChannel.findMany({
      where: {
        status: YouTubeChannelStatus.PUBLISHED,
        deletedAt: null,
        isFeatured: true,
      },
      take: Math.min(take, 50),
      orderBy: [
        { subscribers: "desc" },
        { views: "desc" },
        { createdAt: "desc" },
      ],
    });
  }

  async findMyProviderChannels(
    requester: YouTubeRequester,
    filter?: YouTubeChannelFilterInput,
    pagination?: YouTubeChannelPaginationInput,
    sort?: YouTubeChannelSortInput,
  ) {
    if (requester.role !== Role.PROVIDER && requester.role !== Role.ADMIN)
      throw new ForbiddenException(
        YouTubeMessageCode.YOUTUBE_CHANNEL_ACCESS_DENIED,
      );
    return this.findChannels(
      {
        ...filter,
        providerId:
          requester.role === Role.PROVIDER ? requester.id : filter?.providerId,
      },
      pagination,
      sort,
    );
  }

  async findVideos(channelId: string) {
    await this.findChannelById(channelId);
    return this.prismaService.youTubeVideo.findMany({
      where: {
        channelId,
      },
      orderBy: {
        publishedAt: "desc",
      },
    });
  }

  async createVideo(
    input: CreateYouTubeVideoInput,
    requester: YouTubeRequester,
  ) {
    const channel = await this.findExistingChannel(input.channelId);
    this.ensureChannelOwnerOrAdmin(channel.providerId, requester);
    return this.prismaService.$transaction(async (tx) => {
      const video = await tx.youTubeVideo.create({
        data: {
          channelId: input.channelId,
          title: input.title.trim(),
          description: input.description?.trim(),
          thumbnailUrl: input.thumbnailUrl,
          videoUrl: input.videoUrl,
          durationMinutes: input.durationMinutes,
          views: input.views ?? 0,
          likes: input.likes ?? 0,
          status: input.status,
          publishedAt: input.publishedAt ? new Date(input.publishedAt) : null,
        },
      });
      await tx.youTubeChannel.update({
        where: { id: input.channelId },
        data: {
          videoCount: { increment: 1 },
          views: { increment: input.views ?? 0 },
        },
      });
      return video;
    });
  }

  async updateVideo(
    input: UpdateYouTubeVideoInput,
    requester: YouTubeRequester,
  ) {
    const video = await this.prismaService.youTubeVideo.findUnique({
      where: { id: input.videoId },
      include: { channel: true },
    });
    if (!video)
      throw new NotFoundException(YouTubeMessageCode.YOUTUBE_VIDEO_NOT_FOUND);
    this.ensureChannelOwnerOrAdmin(video.channel.providerId, requester);
    return this.prismaService.youTubeVideo.update({
      where: { id: input.videoId },
      data: {
        title: input.title?.trim(),
        description: input.description?.trim(),
        thumbnailUrl: input.thumbnailUrl,
        videoUrl: input.videoUrl,
        durationMinutes: input.durationMinutes,
        views: input.views,
        likes: input.likes,
        status: input.status,
        publishedAt: input.publishedAt
          ? new Date(input.publishedAt)
          : undefined,
      },
    });
  }

  async deleteVideo(videoId: string, requester: YouTubeRequester) {
    const video = await this.prismaService.youTubeVideo.findUnique({
      where: { id: videoId },
      include: { channel: true },
    });
    if (!video)
      throw new NotFoundException(YouTubeMessageCode.YOUTUBE_VIDEO_NOT_FOUND);
    this.ensureChannelOwnerOrAdmin(video.channel.providerId, requester);
    return this.prismaService.$transaction(async (tx) => {
      const deleted = await tx.youTubeVideo.delete({
        where: { id: videoId },
      });
      await tx.youTubeChannel.update({
        where: { id: video.channelId },
        data: {
          videoCount: { decrement: 1 },
          views: { decrement: video.views },
        },
      });
      return deleted;
    });
  }

  private buildChannelWhere(
    filter?: YouTubeChannelFilterInput,
  ): Prisma.YouTubeChannelWhereInput {
    return {
      deletedAt: null,
      status: filter?.status ?? YouTubeChannelStatus.PUBLISHED,
      category: filter?.category,
      isFeatured: filter?.isFeatured,
      providerId: filter?.providerId,
    };
  }

  private buildOrderBy(
    sort?: YouTubeChannelSortInput,
  ): Prisma.YouTubeChannelOrderByWithRelationInput[] {
    const field = sort?.field ?? YouTubeChannelSortField.CREATED_AT;
    const direction = sort?.direction ?? YouTubeChannelSortDirection.DESC;
    return [
      { [field]: direction },
      { id: "desc" },
    ] as Prisma.YouTubeChannelOrderByWithRelationInput[];
  }

  private async findExistingChannel(channelId: string) {
    const channel = await this.prismaService.youTubeChannel.findFirst({
      where: {
        id: channelId,
        deletedAt: null,
      },
    });
    if (!channel)
      throw new NotFoundException(YouTubeMessageCode.YOUTUBE_CHANNEL_NOT_FOUND);
    return channel;
  }

  private ensureProviderOrAdmin(requester: YouTubeRequester) {
    if (requester.role !== Role.PROVIDER && requester.role !== Role.ADMIN)
      throw new ForbiddenException(
        YouTubeMessageCode.YOUTUBE_CHANNEL_ACCESS_DENIED,
      );
  }

  private ensureChannelOwnerOrAdmin(
    providerId: string | null,
    requester: YouTubeRequester,
  ) {
    if (requester.role === Role.ADMIN) return;
    if (requester.role !== Role.PROVIDER || providerId !== requester.id)
      throw new ForbiddenException(
        YouTubeMessageCode.YOUTUBE_CHANNEL_ACCESS_DENIED,
      );
  }

  private async generateUniqueSlug(title: string) {
    const baseSlug = this.slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (
      await this.prismaService.youTubeChannel.findUnique({ where: { slug } })
    ) {
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
