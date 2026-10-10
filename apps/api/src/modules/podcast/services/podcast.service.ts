import { publicContentChange } from "@utils/public-content-change.util";
import { PodcastCategory, PodcastStatus, Prisma, Role } from "@prisma/client";
import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { CreatePodcastEpisodeInput } from "@podcast/dtos/create-podcast-episode.input";
import { UpdatePodcastEpisodeInput } from "@podcast/dtos/update-podcast-episode.input";
import { PodcastPaginationInput } from "@podcast/dtos/podcast-pagination";
import { measureCatalogFacets } from "@utils/catalog-facet.util";
import { TPodcastCandidateRow } from "@podcast/types/podcast-service.types";
import { PodcastSortDirection } from "@podcast/enums/gql-names.enum";
import { PodcastRatingWriter } from "@podcast/public/podcast-engagement-api";
import { ForbiddenException } from "@nestjs/common";
import { CreatePodcastInput } from "@podcast/dtos/create-podcast.input";
import { UpdatePodcastInput } from "@podcast/dtos/update-podcast.input";
import { PodcastFilterInput } from "@podcast/dtos/podcast-filter.input";
import { PodcastMessageCode } from "@podcast/enums/message-code.enum";
import { PodcastSortInput } from "@podcast/dtos/podcast-sort.input";
import { PodcastRequester } from "@podcast/types/podcast-service.types";
import { PodcastSortField } from "@podcast/enums/gql-names.enum";
import { PrismaService } from "@prisma/prisma.service";
import { toEnumFacets } from "@utils/catalog-facet.util";
import { slugify } from "@utils/slug.util";
import {
  CATALOG_SEARCH_CANDIDATE_CAP,
  CATALOG_SEARCH_ORDER,
  catalogSearchWindow,
  catalogSortOrder,
  clampSearchCount,
  readCatalogPage,
  readPrismaWindowAfter,
  readSearchWindowAfter,
  withoutSearchColumns,
} from "@utils/catalog-pagination.util";

import type { RoadmapCandidateQuery } from "@podcast/public/podcast-engagement-api";

const WORD_SIMILARITY_THRESHOLD = 0.3;
const VALID_PODCAST_CATEGORIES = new Set<string>(
  Object.values(PodcastCategory),
);

const PODCAST_SEARCH_ORDER = Prisma.sql`"searchRank" DESC, "createdAt" DESC, "id" DESC`;

const trimmedTerms = (terms: readonly string[]) => [
  ...new Set(terms.map((term) => term.trim()).filter(Boolean)),
];

const lowerTerms = (terms: readonly string[]) =>
  trimmedTerms(terms).map((term) => term.toLowerCase());

@Injectable()
export class PodcastService {
  private readonly logger = new Logger(PodcastService.name);

  constructor(private readonly prismaService: PrismaService) {}

  findPodcastFilterFacets() {
    return measureCatalogFacets(
      this.logger,
      "podcast",
      async () => {
        const categories = await this.prismaService.podcast.groupBy({
          by: ["category"],
          where: { status: PodcastStatus.PUBLISHED, deletedAt: null },
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
        ...publicContentChange(),
      },
    });
  }

  async publishPodcast(podcastId: string, requester: PodcastRequester) {
    const podcast = await this.findExistingPodcast(podcastId);
    this.ensurePodcastOwnerOrAdmin(podcast.providerId, requester);
    return this.prismaService.podcast.update({
      where: { id: podcastId },
      data: { status: PodcastStatus.PUBLISHED, ...publicContentChange() },
    });
  }

  async archivePodcast(podcastId: string, requester: PodcastRequester) {
    const podcast = await this.findExistingPodcast(podcastId);
    this.ensurePodcastOwnerOrAdmin(podcast.providerId, requester);
    return this.prismaService.podcast.update({
      where: { id: podcastId },
      data: { status: PodcastStatus.ARCHIVED, ...publicContentChange() },
    });
  }

  async softDeletePodcast(podcastId: string, requester: PodcastRequester) {
    const podcast = await this.findExistingPodcast(podcastId);
    this.ensurePodcastOwnerOrAdmin(podcast.providerId, requester);
    return this.prismaService.podcast.update({
      where: { id: podcastId },
      data: { deletedAt: new Date(), ...publicContentChange() },
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
      data: { deletedAt: null, ...publicContentChange() },
    });
  }

  async findPodcastById(podcastId: string) {
    const podcast = await this.prismaService.podcast.findFirst({
      where: {
        id: podcastId,
        status: PodcastStatus.PUBLISHED,
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
        status: PodcastStatus.PUBLISHED,
        deletedAt: null,
      },
    });
    if (!podcast)
      throw new NotFoundException(PodcastMessageCode.PODCAST_NOT_FOUND);
    return podcast;
  }

  async resolveForEngagement(podcastId: string) {
    const podcast = await this.prismaService.podcast.findFirst({
      where: { id: podcastId, deletedAt: null },
      select: { id: true, title: true },
    });
    if (!podcast)
      throw new NotFoundException(PodcastMessageCode.PODCAST_NOT_FOUND);
    return {
      ...podcast,
      price: 0 as const,
      currency: "USD" as const,
      isFree: true as const,
    };
  }

  async updateEngagementRating(
    podcastId: string,
    average: number,
    count: number,
    writer: PodcastRatingWriter = this.prismaService,
  ) {
    await writer.podcast.update({
      where: { id: podcastId },
      data: { rating: average, ratingCount: count },
    });
  }

  async findPodcasts(
    filter?: PodcastFilterInput,
    pagination?: PodcastPaginationInput,
    sort?: PodcastSortInput,
  ) {
    this.assertPublicStatus(filter?.status);
    return this.queryPodcasts(filter, pagination, sort);
  }

  private assertPublicStatus(status?: PodcastStatus) {
    if (status && status !== PodcastStatus.PUBLISHED)
      throw new ForbiddenException(PodcastMessageCode.PODCAST_ACCESS_DENIED);
  }

  private async queryPodcasts(
    filter?: PodcastFilterInput,
    pagination?: PodcastPaginationInput,
    sort?: PodcastSortInput,
  ) {
    const search = filter?.search?.trim();
    if (search && search.length >= 2)
      return this.findPodcastsWithTrgmSearch(filter, pagination);
    const where = this.buildPodcastWhere(filter);
    const orderBy = this.buildOrderBy(sort);
    return readCatalogPage({
      kind: "podcast",
      order: catalogSortOrder(
        sort?.field ?? PodcastSortField.CREATED_AT,
        sort?.direction ?? PodcastSortDirection.DESC,
      ),
      take: pagination?.take,
      cursor: pagination?.cursor,
      count: () => this.prismaService.podcast.count({ where }),
      readAfter: (anchorId, limit) =>
        readPrismaWindowAfter(
          anchorId,
          async (id) =>
            (await this.prismaService.podcast.findFirst({
              where: { AND: [where, { id }] },
              select: { id: true },
            })) !== null,
          (position) =>
            this.prismaService.podcast.findMany({
              where,
              orderBy,
              take: limit,
              ...position,
            }),
        ),
      readThrough: (anchorId, limit) =>
        this.prismaService.podcast.findMany({
          where,
          orderBy,
          cursor: { id: anchorId },
          take: -limit,
        }),
    });
  }

  private async findPodcastsWithTrgmSearch(
    filter?: PodcastFilterInput,
    pagination?: PodcastPaginationInput,
  ) {
    const search = filter?.search?.trim() ?? "";
    const status = filter?.status ?? PodcastStatus.PUBLISHED;
    const category = filter?.category ?? null;
    const isFeatured = filter?.isFeatured ?? null;
    const providerId = filter?.providerId ?? null;

    type PodcastSearchRow = {
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
      rowPosition: bigint;
    };

    const readWindow = async (
      anchorId: string | null,
      limit: number,
      direction: "after" | "through",
    ) => {
      const rows = await this.prismaService.$queryRaw<PodcastSearchRow[]>`
        WITH exact_matches AS (
          SELECT
            p."id", p."slug", p."title", p."host", p."imageUrl",
            p."description", p."category", p."status", p."rating",
            p."ratingCount", p."listeners", p."durationMinutes",
            p."episodeCount", p."isFeatured", p."providerId", p."createdAt",
            p."updatedAt", p."deletedAt",
            (CASE
              WHEN p."title" ILIKE '%' || ${search} || '%' THEN 3
              WHEN p."host" ILIKE '%' || ${search} || '%' THEN 2
              ELSE 1
            END)::float AS "searchRank"
          FROM "Podcast" p
          WHERE p."deletedAt" IS NULL
            AND p."status" = ${status}::"PodcastStatus"
            AND (${category}::"PodcastCategory" IS NULL OR p."category" = ${category}::"PodcastCategory")
            AND (${isFeatured}::boolean IS NULL OR p."isFeatured" = ${isFeatured}::boolean)
            AND (${providerId}::text IS NULL OR p."providerId" = ${providerId}::text)
            AND (
              p."title" ILIKE '%' || ${search} || '%'
              OR p."host" ILIKE '%' || ${search} || '%'
              OR p."description" ILIKE '%' || ${search} || '%'
            )
          ORDER BY "searchRank" DESC, p."createdAt" DESC, p."id" DESC
          LIMIT ${CATALOG_SEARCH_CANDIDATE_CAP}
        ),
        fuzzy_matches AS (
          SELECT
            p."id", p."slug", p."title", p."host", p."imageUrl",
            p."description", p."category", p."status", p."rating",
            p."ratingCount", p."listeners", p."durationMinutes",
            p."episodeCount", p."isFeatured", p."providerId", p."createdAt",
            p."updatedAt", p."deletedAt",
            LEAST(
              GREATEST(
                similarity(p."title", ${search}),
                similarity(p."host", ${search})
              ),
              0.99
            ) AS "searchRank"
          FROM "Podcast" p
          WHERE p."deletedAt" IS NULL
            AND p."status" = ${status}::"PodcastStatus"
            AND (${category}::"PodcastCategory" IS NULL OR p."category" = ${category}::"PodcastCategory")
            AND (${isFeatured}::boolean IS NULL OR p."isFeatured" = ${isFeatured}::boolean)
            AND (${providerId}::text IS NULL OR p."providerId" = ${providerId}::text)
            AND p."id" NOT IN (SELECT "id" FROM exact_matches)
            AND (p."title" % ${search} OR p."host" % ${search})
          ORDER BY "searchRank" DESC, p."createdAt" DESC, p."id" DESC
          LIMIT GREATEST(${CATALOG_SEARCH_CANDIDATE_CAP} - (SELECT COUNT(*)::int FROM exact_matches), 0)
        ),
        ${catalogSearchWindow(PODCAST_SEARCH_ORDER, anchorId, limit, direction)}
      `;
      return rows.map(withoutSearchColumns);
    };

    return readCatalogPage({
      kind: "podcast",
      order: CATALOG_SEARCH_ORDER,
      take: pagination?.take,
      cursor: pagination?.cursor,
      count: async () => {
        const countRows = await this.prismaService.$queryRaw<
          Array<{ count: bigint }>
        >`
          SELECT COUNT(*)::bigint AS count
          FROM "Podcast" p
          WHERE p."deletedAt" IS NULL
            AND p."status" = ${status}::"PodcastStatus"
            AND (${category}::"PodcastCategory" IS NULL OR p."category" = ${category}::"PodcastCategory")
            AND (${isFeatured}::boolean IS NULL OR p."isFeatured" = ${isFeatured}::boolean)
            AND (${providerId}::text IS NULL OR p."providerId" = ${providerId}::text)
            AND (
              p."title" ILIKE '%' || ${search} || '%'
              OR p."host" ILIKE '%' || ${search} || '%'
              OR p."description" ILIKE '%' || ${search} || '%'
              OR p."title" % ${search}
              OR p."host" % ${search}
            )
        `;
        return clampSearchCount(countRows[0]?.count);
      },
      readAfter: async (anchorId, limit) =>
        readSearchWindowAfter(
          await readWindow(anchorId, limit, "after"),
          anchorId,
        ),
      readThrough: (anchorId, limit) => readWindow(anchorId, limit, "through"),
    });
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
    return this.queryPodcasts(
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
          ...publicContentChange(),
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
    return this.prismaService.$transaction(async (tx) => {
      const updated = await tx.podcastEpisode.update({
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
      await tx.podcast.update({
        where: { id: episode.podcastId },
        data: publicContentChange(),
      });
      return updated;
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
          ...publicContentChange(),
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
    const baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await this.prismaService.podcast.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    return slug;
  }

  roadmapCandidates(query: RoadmapCandidateQuery) {
    const subjects = trimmedTerms(query.subjects);
    switch (query.tier) {
      case "EXACT":
        return this.exactTierPodcasts(subjects, query.take);
      case "SIMILAR":
        return this.similarTierPodcasts(
          lowerTerms([...query.subjects, ...query.keywords]),
          query.take,
        );
      case "RELATED":
        return this.relatedTierPodcasts(query.groupKeys, query.take);
      case "BROAD":
        return this.broadTierPodcasts(query.take);
    }
  }

  private exactTierPodcasts(subjects: readonly string[], take: number) {
    return this.prismaService.$queryRaw<TPodcastCandidateRow[]>`
      SELECT
        p."id", p."title", p."rating", p."category", p."listeners",
        p."description", p."ratingCount", p."isFeatured", p."durationMinutes",
        1.0::float AS "matchScore"
      FROM "Podcast" p
      WHERE p."deletedAt" IS NULL
        AND p."status" = ${PodcastStatus.PUBLISHED}::"PodcastStatus"
        AND (
          ${subjects.length === 0}
          OR ${Prisma.join(
            subjects.flatMap((subject) => [
              Prisma.sql`p."title" ILIKE ${"%" + subject + "%"}`,
              Prisma.sql`p."description" ILIKE ${"%" + subject + "%"}`,
              Prisma.sql`roadmap_enum_text(p."category") ILIKE ${"%" + subject + "%"}`,
            ]),
            " OR ",
          )}
        )
      ORDER BY p."isFeatured" DESC, p."rating" DESC, p."listeners" DESC, p."id" ASC
      LIMIT ${take};
    `;
  }

  private async similarTierPodcasts(terms: readonly string[], take: number) {
    if (terms.length === 0) return this.exactTierPodcasts([], take);
    return this.prismaService.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('pg_trgm.word_similarity_threshold', ${String(WORD_SIMILARITY_THRESHOLD)}, true)`;
      return tx.$queryRaw<TPodcastCandidateRow[]>`
        SELECT
          p."id", p."title", p."rating", p."category", p."listeners",
          p."description", p."ratingCount", p."isFeatured", p."durationMinutes",
          GREATEST(${Prisma.join(
            terms.map(
              (term) =>
                Prisma.sql`word_similarity(${term}, lower(p."title" || ' ' || roadmap_enum_text(p."category")))`,
            ),
            ", ",
          )}) AS "matchScore"
        FROM "Podcast" p
        WHERE p."deletedAt" IS NULL
          AND p."status" = ${PodcastStatus.PUBLISHED}::"PodcastStatus"
          AND (${Prisma.join(
            terms.map(
              (term) =>
                Prisma.sql`lower(p."title" || ' ' || roadmap_enum_text(p."category")) %> ${term}`,
            ),
            " OR ",
          )})
        ORDER BY "matchScore" DESC, p."isFeatured" DESC, p."rating" DESC, p."listeners" DESC, p."id" ASC
        LIMIT ${take};
      `;
    });
  }

  private relatedTierPodcasts(groupKeys: readonly string[], take: number) {
    const categories = groupKeys.filter((key) =>
      VALID_PODCAST_CATEGORIES.has(key),
    );
    if (categories.length === 0) return Promise.resolve([]);
    return this.prismaService.$queryRaw<TPodcastCandidateRow[]>`
      SELECT
        p."id", p."title", p."rating", p."category", p."listeners",
        p."description", p."ratingCount", p."isFeatured", p."durationMinutes",
        0.4::float AS "matchScore"
      FROM "Podcast" p
      WHERE p."deletedAt" IS NULL
        AND p."status" = ${PodcastStatus.PUBLISHED}::"PodcastStatus"
        AND p."category" = ANY(${categories}::"PodcastCategory"[])
      ORDER BY p."isFeatured" DESC, p."rating" DESC, p."listeners" DESC, p."id" ASC
      LIMIT ${take};
    `;
  }

  private broadTierPodcasts(take: number) {
    return this.prismaService.$queryRaw<TPodcastCandidateRow[]>`
      SELECT
        p."id", p."title", p."rating", p."category", p."listeners",
        p."description", p."ratingCount", p."isFeatured", p."durationMinutes",
        0.2::float AS "matchScore"
      FROM "Podcast" p
      WHERE p."deletedAt" IS NULL
        AND p."status" = ${PodcastStatus.PUBLISHED}::"PodcastStatus"
      ORDER BY p."isFeatured" DESC, p."rating" DESC, p."listeners" DESC, p."id" ASC
      LIMIT ${take};
    `;
  }
}
