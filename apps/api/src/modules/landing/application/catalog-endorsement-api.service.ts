import { CourseStatus, PodcastStatus } from "@prisma/client";
import { ContentType, EventStatus } from "@prisma/client";
import { CatalogEndorsementApi } from "@landing/public/catalog-endorsement-api";
import { CatalogItemProjection } from "@landing/public/catalog-endorsement-api";
import { CatalogSearchQuery } from "@landing/public/catalog-endorsement-api";
import { YouTubeVideoStatus } from "@prisma/client";
import { CatalogReference } from "@landing/public/catalog-endorsement-api";
import { PrismaService } from "@prisma/prisma.service";
import { BadRequestException, Injectable } from "@nestjs/common";
import { createHash } from "node:crypto";
import { Prisma } from "@prisma/client";
import { CatalogSearchPage } from "@landing/public/catalog-endorsement-api";
import {
  readCatalogPage,
  readSearchWindowAfter,
} from "@utils/catalog-pagination.util";
import {
  endorsementCatalogCandidates,
  endorsementBrowseAnchor,
  endorsementBrowseCandidates,
  EndorsementBrowseAnchor,
  ENDORSEMENT_SEARCH_ORDER,
} from "@landing/utils/catalog-endorsement-search.util";

const SEARCH_TAKE_MAX = 50;

type CatalogSearchRow = Omit<CatalogItemProjection, "isAvailable"> & {
  id: string;
  searchRank: number;
  rowPosition?: bigint;
  recency: Date;
};

@Injectable()
export class CatalogEndorsementApiService implements CatalogEndorsementApi {
  constructor(private readonly prisma: PrismaService) {}

  async searchCatalog(query: CatalogSearchQuery): Promise<CatalogSearchPage> {
    const search = query.search?.trim() ?? "";
    if (search.length === 1)
      throw new BadRequestException(
        "Search must contain at least two characters.",
      );
    const candidates = endorsementCatalogCandidates(search, query.contentType);
    const readWindow = async (
      anchorId: string | null,
      limit: number,
      direction: "after" | "through",
    ) => {
      if (!search) {
        const anchorQuery = anchorId ? endorsementBrowseAnchor(anchorId) : null;
        const [anchor] = anchorQuery
          ? await this.prisma.$queryRaw<EndorsementBrowseAnchor[]>(anchorQuery)
          : [];
        if (anchorId && !anchor) return [];
        const windowSize =
          direction === "after" && anchor ? limit + 1 : limit;
        const candidates = endorsementBrowseCandidates(
          query.contentType,
          anchor ?? null,
          windowSize,
          direction,
        );
        const order =
          direction === "after"
            ? ENDORSEMENT_SEARCH_ORDER
            : Prisma.sql`"recency" ASC, "contentType" DESC, "contentId" ASC`;
        const rows = await this.prisma.$queryRaw<
          CatalogSearchRow[]
        >`WITH candidates AS (${candidates}) SELECT * FROM candidates ORDER BY ${order} LIMIT ${windowSize}`;
        return direction === "after" ? rows : rows.reverse();
      }
      const bounds =
        direction === "after"
          ? Prisma.sql`ranked."rowPosition" >= anchor."position" AND ranked."rowPosition" <= anchor."position" + ${limit}::int`
          : Prisma.sql`ranked."rowPosition" > anchor."position" - ${limit}::int AND ranked."rowPosition" <= anchor."position"`;
      return this.prisma.$queryRaw<CatalogSearchRow[]>`
        WITH candidates AS (${candidates}), ranked AS (
          SELECT candidates.*, ROW_NUMBER() OVER (ORDER BY ${ENDORSEMENT_SEARCH_ORDER}) AS "rowPosition" FROM candidates
        ), anchor AS (
          SELECT COALESCE((SELECT "rowPosition" FROM ranked WHERE "id" = ${anchorId}::text),
            CASE WHEN ${anchorId}::text IS NULL THEN 0 END) AS "position"
        ) SELECT ranked.* FROM ranked CROSS JOIN anchor WHERE ${bounds} ORDER BY ranked."rowPosition"
      `;
    };
    const page = await readCatalogPage({
      kind: "endorsement",
      order: createHash("sha256")
        .update(JSON.stringify([search, query.contentType ?? null]))
        .digest("hex"),
      take: Math.min(Math.max(query.take, 1), SEARCH_TAKE_MAX),
      cursor: query.cursor,
      count: async () => {
        const [row] = await this.prisma.$queryRaw<
          { count: bigint }[]
        >`WITH candidates AS (${candidates}) SELECT COUNT(*) AS count FROM candidates`;
        return Number(row?.count ?? 0);
      },
      readAfter: async (anchorId, limit) =>
        readSearchWindowAfter(
          await readWindow(anchorId, limit, "after"),
          anchorId,
        ),
      readThrough: (anchorId, limit) => readWindow(anchorId, limit, "through"),
    });
    return {
      ...page,
      items: page.items.map(
        ({
          id: _id,
          searchRank: _rank,
          rowPosition: _position,
          recency: _recency,
          ...item
        }) => ({ ...item, isAvailable: true }),
      ),
    };
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
        slug: true,
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
      slug: row.slug,
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
        slug: true,
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
      slug: row.slug,
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
        slug: true,
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
      slug: row.slug,
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
        channel: { select: { title: true, slug: true } },
      },
    });

    return rows.map((row) => ({
      contentType: ContentType.YOUTUBE as string,
      contentId: row.id,
      title: row.title,
      slug: row.channel?.slug ?? null,
      imageUrl: row.thumbnailUrl,
      provider: row.channel?.title ?? null,
      isAvailable: row.status === YouTubeVideoStatus.PUBLISHED,
    }));
  }
}
