import { Injectable, NotFoundException } from "@nestjs/common";
import { ContentSocialImageService } from "@contentMedia/services/content-social-image.service";
import { ContentSeoServiceBase } from "@contentMedia/services/content-seo.service-base";
import { AppLanguage, Prisma } from "@prisma/client";
import { publicContentChange } from "@utils/public-content-change.util";
import { ForbiddenException } from "@nestjs/common";
import { CourseMessageCode } from "@course/enums/message-code.enum";
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
export class CourseSeoService extends ContentSeoServiceBase {
  protected readonly kind = "course";

  protected readonly entityType = "Course";

  protected readonly guards: SeoGuards = {
    notFound: () => new NotFoundException(CourseMessageCode.COURSE_NOT_FOUND),
    denied: () =>
      new ForbiddenException(CourseMessageCode.COURSE_ACCESS_DENIED),
  };

  protected readonly store: SeoStore<Prisma.TransactionClient>;

  constructor(
    private readonly prisma: PrismaService,
    images: ContentSocialImageService,
  ) {
    super(CourseSeoService.name, images);
    this.store = {
      transaction: (work) => this.prisma.$transaction((tx) => work(tx)),
      findParent: (tx, parentId) =>
        tx.course.findUnique({
          where: { id: parentId },
          select: {
            id: true,
            providerId: true,
            deletedAt: true,
            excludeFromIndex: true,
          },
        }),
      findRow: (tx, parentId, locale) =>
        tx.courseSeo.findUnique({
          where: { courseId_locale: { courseId: parentId, locale } },
          select: seoSelect,
        }),
      findImage: (tx, imageId) =>
        tx.contentSocialImage.findUnique({
          where: { id: imageId },
          select: { id: true, ownerId: true },
        }),
      create: (tx, parentId, locale, fields, actorId) =>
        tx.courseSeo.create({
          data: { courseId: parentId, locale, ...fields, updatedById: actorId },
          select: seoSelect,
        }),
      update: async (tx, rowId, expectedVersion, fields, actorId) => {
        const { count } = await tx.courseSeo.updateMany({
          where: { id: rowId, version: expectedVersion },
          data: { ...fields, updatedById: actorId, version: { increment: 1 } },
        });
        return count;
      },
      reload: (tx, rowId) =>
        tx.courseSeo.findUniqueOrThrow({
          where: { id: rowId },
          select: seoSelect,
        }),
      setExclusion: async (tx, parentId, excluded) => {
        const { count } = await tx.course.updateMany({
          where: { id: parentId, excludeFromIndex: !excluded },
          data: { excludeFromIndex: excluded },
        });
        return count;
      },
      touchParent: async (tx, parentId) => {
        await tx.course.update({
          where: { id: parentId },
          data: publicContentChange(),
        });
      },
    };
  }

  protected async readSettings(tx: Prisma.TransactionClient, parentId: string) {
    const [rows, parent, translations] = await Promise.all([
      tx.courseSeo.findMany({
        where: { courseId: parentId },
        orderBy: { locale: "asc" },
        select: seoSelect,
      }),
      tx.course.findUniqueOrThrow({
        where: { id: parentId },
        select: { title: true, description: true },
      }),
      tx.courseTranslation.findMany({
        where: { courseId: parentId },
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
    const rows = await this.prisma.courseSeo.findMany({
      where: { courseId: { in: parentIds }, locale },
      select: { ...seoSelect, courseId: true },
    });
    return rows.map(({ courseId: parentId, ...row }) => ({ ...row, parentId }));
  }
}
