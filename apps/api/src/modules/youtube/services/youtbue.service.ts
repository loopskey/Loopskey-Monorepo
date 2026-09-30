import { Prisma, Role, YouTubeChannelStatus } from "@prisma/client";
import { YouTubeChannelPaginationInput } from "@modules/youtube/dtos/youtube-channel-pagination.input";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { measureCatalogFacets } from "@utils/catalog-facet.util";
import { toEnumFacets } from "@utils/catalog-facet.util";
import { YouTubeChannelSortDirection } from "@youtube/enums/youtube.enum";
import { CreateYouTubeChannelInput } from "@youtube/dtos/create-youtube-channel.input";
import { UpdateYouTubeChannelInput } from "@youtube/dtos/update-youtube-channel.input";
import { YouTubeChannelFilterInput } from "@youtube/dtos/youtube-channel-filter.input";
import { YouTubeChannelSortInput } from "@youtube/dtos/youtube-channel-sort.input";
import { CreateYouTubeVideoInput } from "@youtube/dtos/create-youtube-video.input";
import { YouTubeChannelSortField } from "@youtube/enums/youtube.enum";
import { UpdateYouTubeVideoInput } from "@youtube/dtos/update-youtube-video.input";
import { TChannelCandidateRow } from "@youtube/types/youtube-service.types";
import { YouTubeRatingWriter } from "@youtube/public/youtube-engagement-api";
import { ForbiddenException } from "@nestjs/common";
import { YouTubeMessageCode } from "@youtube/enums/message-code.enum";
import { YouTubeRequester } from "@youtube/enums/youtube.enum";
import { YouTubeCategory } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { slugify } from "@utils/slug.util";

import type { RoadmapCandidateQuery } from "@youtube/public/youtube-engagement-api";

const WORD_SIMILARITY_THRESHOLD = 0.3;
const VALID_YOUTUBE_CATEGORIES = new Set<string>(
  Object.values(YouTubeCategory),
);

const CANDIDATE_CAP = 500;

const trimmedTerms = (terms: readonly string[]) => [
  ...new Set(terms.map((term) => term.trim()).filter(Boolean)),
];

const lowerTerms = (terms: readonly string[]) =>
  trimmedTerms(terms).map((term) => term.toLowerCase());

@Injectable()
export class YouTubeService {
  private readonly logger = new Logger(YouTubeService.name);

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Options for the public catalogue filter, under the same visibility
   * predicate as the public channel list.
   */
  findYouTubeChannelFilterFacets() {
    return measureCatalogFacets(
      this.logger,
      "youtube",
      async () => {
        const categories = await this.prismaService.youTubeChannel.groupBy({
          by: ["category"],
          where: {
            status: YouTubeChannelStatus.PUBLISHED,
            deletedAt: null,
          },
          _count: { _all: true },
        });
        return {
          categories: toEnumFacets(
            categories.map((row) => ({
              value: row.category,
              count: row._count._all,
            })),
          ),
        };
      },
      (facets) => facets.categories.length,
    );
  }

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

  async resolveForEngagement(channelId: string) {
    const channel = await this.prismaService.youTubeChannel.findFirst({
      where: { id: channelId, deletedAt: null },
      select: { id: true, title: true },
    });
    if (!channel)
      throw new NotFoundException(YouTubeMessageCode.YOUTUBE_CHANNEL_NOT_FOUND);
    return {
      ...channel,
      price: 0 as const,
      currency: "USD" as const,
      isFree: true as const,
    };
  }

  async updateEngagementRating(
    channelId: string,
    average: number,
    count: number,
    writer: YouTubeRatingWriter = this.prismaService,
  ) {
    await writer.youTubeChannel.update({
      where: { id: channelId },
      data: { rating: average, ratingCount: count },
    });
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
    const category = filter?.category ?? null;
    const isFeatured = filter?.isFeatured ?? null;
    const providerId = filter?.providerId ?? null;

    type ChannelSearchRow = {
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
    };

    // Bounded exact-first + fuzzy-fallback shape (same architecture as the
    // landing catalogue search / CourseService#findCoursesWithTrgmSearch).
    // The prior shape also used `similarity(col, term) > threshold` as a raw
    // function-call comparison in the fuzzy branch, which gin_trgm_ops
    // cannot accelerate at all (only `%`, `<->`, `<%>`, and ILIKE are
    // index-eligible) — replaced here with the `%` operator, which is.
    const rowsPromise = this.prismaService.$queryRaw<ChannelSearchRow[]>`
      WITH exact_matches AS (
        SELECT
          yc."id", yc."slug", yc."title", yc."description", yc."provider",
          yc."imageUrl", yc."channelUrl", yc."subscribers", yc."views",
          yc."videoCount", yc."category", yc."status", yc."isFeatured",
          yc."providerId", yc."createdAt", yc."updatedAt", yc."deletedAt",
          (CASE
            WHEN yc."title" ILIKE '%' || ${search} || '%' THEN 3
            WHEN yc."provider" ILIKE '%' || ${search} || '%' THEN 2
            ELSE 1
          END)::float AS "searchRank"
        FROM "YouTubeChannel" yc
        WHERE yc."deletedAt" IS NULL
          AND yc."status" = ${status}::"YouTubeChannelStatus"
          AND (${category}::"YouTubeCategory" IS NULL OR yc."category" = ${category}::"YouTubeCategory")
          AND (${isFeatured}::boolean IS NULL OR yc."isFeatured" = ${isFeatured}::boolean)
          AND (${providerId}::text IS NULL OR yc."providerId" = ${providerId}::text)
          AND (${cursor}::text IS NULL OR yc."id" > ${cursor}::text)
          AND (
            yc."title" ILIKE '%' || ${search} || '%'
            OR yc."provider" ILIKE '%' || ${search} || '%'
            OR yc."description" ILIKE '%' || ${search} || '%'
          )
        ORDER BY "searchRank" DESC, yc."subscribers" DESC, yc."createdAt" DESC, yc."id" DESC
        LIMIT ${CANDIDATE_CAP}
      ),
      fuzzy_matches AS (
        SELECT
          yc."id", yc."slug", yc."title", yc."description", yc."provider",
          yc."imageUrl", yc."channelUrl", yc."subscribers", yc."views",
          yc."videoCount", yc."category", yc."status", yc."isFeatured",
          yc."providerId", yc."createdAt", yc."updatedAt", yc."deletedAt",
          LEAST(
            GREATEST(
              similarity(yc."title", ${search}),
              similarity(yc."provider", ${search})
            ),
            0.99
          ) AS "searchRank"
        FROM "YouTubeChannel" yc
        WHERE yc."deletedAt" IS NULL
          AND yc."status" = ${status}::"YouTubeChannelStatus"
          AND (${category}::"YouTubeCategory" IS NULL OR yc."category" = ${category}::"YouTubeCategory")
          AND (${isFeatured}::boolean IS NULL OR yc."isFeatured" = ${isFeatured}::boolean)
          AND (${providerId}::text IS NULL OR yc."providerId" = ${providerId}::text)
          AND (${cursor}::text IS NULL OR yc."id" > ${cursor}::text)
          AND yc."id" NOT IN (SELECT "id" FROM exact_matches)
          AND (
            yc."title" % ${search}
            OR yc."provider" % ${search}
          )
        ORDER BY "searchRank" DESC, yc."subscribers" DESC, yc."createdAt" DESC, yc."id" DESC
        LIMIT GREATEST(${CANDIDATE_CAP} - (SELECT COUNT(*)::int FROM exact_matches), 0)
      )
      SELECT * FROM exact_matches
      UNION ALL
      SELECT * FROM fuzzy_matches
      ORDER BY "searchRank" DESC, "subscribers" DESC, "createdAt" DESC, "id" DESC
      LIMIT ${take + 1};
    `;

    const countPromise = this.prismaService.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM "YouTubeChannel" yc
      WHERE yc."deletedAt" IS NULL
        AND yc."status" = ${status}::"YouTubeChannelStatus"
        AND (${category}::"YouTubeCategory" IS NULL OR yc."category" = ${category}::"YouTubeCategory")
        AND (${isFeatured}::boolean IS NULL OR yc."isFeatured" = ${isFeatured}::boolean)
        AND (${providerId}::text IS NULL OR yc."providerId" = ${providerId}::text)
        AND (${cursor}::text IS NULL OR yc."id" > ${cursor}::text)
        AND (
          yc."title" ILIKE '%' || ${search} || '%'
          OR yc."provider" ILIKE '%' || ${search} || '%'
          OR yc."description" ILIKE '%' || ${search} || '%'
          OR yc."title" % ${search}
          OR yc."provider" % ${search}
        )
    `;

    const [rows, countRows] = await this.prismaService.$transaction([
      rowsPromise,
      countPromise,
    ]);
    const hasNextPage = rows.length > take;
    const slicedRows = hasNextPage ? rows.slice(0, take) : rows;
    return {
      items: slicedRows.map(({ searchRank: _searchRank, ...channel }) => ({
        ...channel,
      })),
      totalCount: Number(countRows[0]?.count ?? 0n),
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
    const baseSlug = slugify(title);
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

  roadmapCandidates(query: RoadmapCandidateQuery) {
    const subjects = trimmedTerms(query.subjects);
    switch (query.tier) {
      case "EXACT":
        return this.exactTierChannels(subjects, query.take);
      case "SIMILAR":
        return this.similarTierChannels(
          lowerTerms([...query.subjects, ...query.keywords]),
          query.take,
        );
      case "RELATED":
        return this.relatedTierChannels(query.groupKeys, query.take);
      case "BROAD":
        return this.broadTierChannels(query.take);
    }
  }

  private exactTierChannels(subjects: readonly string[], take: number) {
    return this.prismaService.$queryRaw<TChannelCandidateRow[]>`
      SELECT
        y."id", y."title", y."rating", y."category", y."isFeatured",
        y."subscribers", y."description", y."ratingCount",
        1.0::float AS "matchScore"
      FROM "YouTubeChannel" y
      WHERE y."deletedAt" IS NULL
        AND y."status" = ${YouTubeChannelStatus.PUBLISHED}::"YouTubeChannelStatus"
        AND (
          ${subjects.length === 0}
          OR ${Prisma.join(
            subjects.flatMap((subject) => [
              Prisma.sql`y."title" ILIKE ${"%" + subject + "%"}`,
              Prisma.sql`y."description" ILIKE ${"%" + subject + "%"}`,
              Prisma.sql`roadmap_enum_text(y."category") ILIKE ${"%" + subject + "%"}`,
            ]),
            " OR ",
          )}
        )
      ORDER BY y."isFeatured" DESC, y."rating" DESC, y."subscribers" DESC, y."id" ASC
      LIMIT ${take};
    `;
  }

  private async similarTierChannels(terms: readonly string[], take: number) {
    if (terms.length === 0) return this.exactTierChannels([], take);
    return this.prismaService.$transaction(async (tx) => {
      await tx.$executeRaw`SET LOCAL pg_trgm.word_similarity_threshold = ${WORD_SIMILARITY_THRESHOLD}`;
      return tx.$queryRaw<TChannelCandidateRow[]>`
        SELECT
          y."id", y."title", y."rating", y."category", y."isFeatured",
          y."subscribers", y."description", y."ratingCount",
          GREATEST(${Prisma.join(
            terms.map(
              (term) =>
                Prisma.sql`word_similarity(${term}, lower(y."title" || ' ' || roadmap_enum_text(y."category")))`,
            ),
            ", ",
          )}) AS "matchScore"
        FROM "YouTubeChannel" y
        WHERE y."deletedAt" IS NULL
          AND y."status" = ${YouTubeChannelStatus.PUBLISHED}::"YouTubeChannelStatus"
          AND (${Prisma.join(
            terms.map(
              (term) =>
                Prisma.sql`lower(y."title" || ' ' || roadmap_enum_text(y."category")) %> ${term}`,
            ),
            " OR ",
          )})
        ORDER BY "matchScore" DESC, y."isFeatured" DESC, y."rating" DESC, y."subscribers" DESC, y."id" ASC
        LIMIT ${take};
      `;
    });
  }

  private relatedTierChannels(groupKeys: readonly string[], take: number) {
    const categories = groupKeys.filter((key) =>
      VALID_YOUTUBE_CATEGORIES.has(key),
    );
    if (categories.length === 0) return Promise.resolve([]);
    return this.prismaService.$queryRaw<TChannelCandidateRow[]>`
      SELECT
        y."id", y."title", y."rating", y."category", y."isFeatured",
        y."subscribers", y."description", y."ratingCount",
        0.4::float AS "matchScore"
      FROM "YouTubeChannel" y
      WHERE y."deletedAt" IS NULL
        AND y."status" = ${YouTubeChannelStatus.PUBLISHED}::"YouTubeChannelStatus"
        AND y."category" = ANY(${categories}::"YouTubeCategory"[])
      ORDER BY y."isFeatured" DESC, y."rating" DESC, y."subscribers" DESC, y."id" ASC
      LIMIT ${take};
    `;
  }

  private broadTierChannels(take: number) {
    return this.prismaService.$queryRaw<TChannelCandidateRow[]>`
      SELECT
        y."id", y."title", y."rating", y."category", y."isFeatured",
        y."subscribers", y."description", y."ratingCount",
        0.2::float AS "matchScore"
      FROM "YouTubeChannel" y
      WHERE y."deletedAt" IS NULL
        AND y."status" = ${YouTubeChannelStatus.PUBLISHED}::"YouTubeChannelStatus"
      ORDER BY y."isFeatured" DESC, y."rating" DESC, y."subscribers" DESC, y."id" ASC
      LIMIT ${take};
    `;
  }
}
