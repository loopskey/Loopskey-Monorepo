import { Injectable, NotFoundException } from "@nestjs/common";
import { ContentSocialImageService } from "@contentMedia/services/content-social-image.service";
import { ContentSeoServiceBase } from "@contentMedia/services/content-seo.service-base";
import { AppLanguage, Prisma } from "@prisma/client";
import { publicContentChange } from "@utils/public-content-change.util";
import { PodcastMessageCode } from "@podcast/enums/message-code.enum";
import { ForbiddenException } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";

import type { SeoGuards, SeoRow, SeoStore } from "@utils/content-seo.util";
import type { SeoRowWithParent } from "@contentMedia/services/content-seo.service-base";
import type { SeoDefaultText } from "@utils/content-seo-settings.util";

const seoSelect = {
  id: true,
  locale: true,
  seoTitle: true,
  seoDescription: true,
  socialImageId: true,
  socialImageAlt: true,
  version: true,
  updatedAt: true,
} as const;

@Injectable()
export class PodcastSeoService extends ContentSeoServiceBase {
  protected readonly kind = "podcast";

  protected readonly entityType = "Podcast";

  protected readonly guards: SeoGuards = {
    notFound: () => new NotFoundException(PodcastMessageCode.PODCAST_NOT_FOUND),
    denied: () =>
      new ForbiddenException(PodcastMessageCode.PODCAST_ACCESS_DENIED),
  };

  protected readonly store: SeoStore<Prisma.TransactionClient>;

  constructor(
    private readonly prisma: PrismaService,
    images: ContentSocialImageService,
  ) {
    super(PodcastSeoService.name, images);
    this.store = {
      transaction: (work) => this.prisma.$transaction((tx) => work(tx)),
      findParent: (tx, parentId) =>
        tx.podcast.findUnique({
          where: { id: parentId },
          select: {
            id: true,
            providerId: true,
            deletedAt: true,
            excludeFromIndex: true,
          },
        }),
      findRow: (tx, parentId, locale) =>
        tx.podcastSeo.findUnique({
          where: { podcastId_locale: { podcastId: parentId, locale } },
          select: seoSelect,
        }),
      findImage: (tx, imageId) =>
        tx.contentSocialImage.findUnique({
          where: { id: imageId },
          select: { id: true, ownerId: true },
        }),
      create: (tx, parentId, locale, fields, actorId) =>
        tx.podcastSeo.create({
          data: {
            podcastId: parentId,
            locale,
            ...fields,
            updatedById: actorId,
          },
          select: seoSelect,
        }),
      update: async (tx, rowId, expectedVersion, fields, actorId) => {
        const { count } = await tx.podcastSeo.updateMany({
          where: { id: rowId, version: expectedVersion },
          data: { ...fields, updatedById: actorId, version: { increment: 1 } },
        });
        return count;
      },
      reload: (tx, rowId) =>
        tx.podcastSeo.findUniqueOrThrow({
          where: { id: rowId },
          select: seoSelect,
        }),
      setExclusion: async (tx, parentId, excluded) => {
        const { count } = await tx.podcast.updateMany({
          where: { id: parentId, excludeFromIndex: !excluded },
          data: { excludeFromIndex: excluded },
        });
        return count;
      },
      touchParent: async (tx, parentId) => {
        await tx.podcast.update({
          where: { id: parentId },
          data: publicContentChange(),
        });
      },
    };
  }

  protected async readSettings(tx: Prisma.TransactionClient, parentId: string) {
    const [rows, parent, translations] = await Promise.all([
      tx.podcastSeo.findMany({
        where: { podcastId: parentId },
        orderBy: { locale: "asc" },
        select: seoSelect,
      }),
      tx.podcast.findUniqueOrThrow({
        where: { id: parentId },
        select: { title: true, description: true },
      }),
      tx.podcastTranslation.findMany({
        where: { podcastId: parentId },
        select: { locale: true, title: true, description: true },
      }),
    ]);
    const textFor = (locale: AppLanguage): SeoDefaultText => {
      const translation = translations.find((row) => row.locale === locale);
      return {
        title: translation?.title ?? parent.title,
        description: translation?.description ?? parent.description,
      };
    };
    return {
      rows: rows as SeoRow[],
      defaults: {
        [AppLanguage.EN]: textFor(AppLanguage.EN),
        [AppLanguage.FR]: textFor(AppLanguage.FR),
      },
    };
  }

  protected async readRowsForLocale(
    parentIds: string[],
    locale: AppLanguage,
  ): Promise<SeoRowWithParent[]> {
    const rows = await this.prisma.podcastSeo.findMany({
      where: { podcastId: { in: parentIds }, locale },
      select: { ...seoSelect, podcastId: true },
    });
    return rows.map(({ podcastId: parentId, ...row }) => ({
      ...row,
      parentId,
    }));
  }
}
