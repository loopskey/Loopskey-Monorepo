import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { SetCourseTranslationPublicationInput } from "@course/dtos/set-course-translation-publication.input";
import { SetCourseSourceLanguageInput } from "@course/dtos/set-course-source-language.input";
import { SaveCourseTranslationInput } from "@course/dtos/save-course-translation.input";
import { AppLanguage, Prisma } from "@prisma/client";
import { publicContentChange } from "@utils/public-content-change.util";
import { presentContentText } from "@utils/content-text.util";
import { TLocalizableCourse } from "@course/types/course-translation";
import { NotFoundException } from "@nestjs/common";
import { CourseMessageCode } from "@course/enums/message-code.enum";
import { requestContext } from "@infrastructure/observability/request-context";
import { PrismaService } from "@prisma/prisma.service";
import {
  authorizeTranslationParent,
  listContentTranslations,
  localizeRecord,
  normalizeSourceLanguage,
  resolveVariants,
  saveContentTranslation,
  setContentTranslationPublication,
  sourceLanguageIsTranslated,
} from "@utils/content-translation.util";

import type { PublishedTranslation } from "@utils/content-translation.util";
import type { TranslationStore } from "@utils/content-translation.util";
import type { TranslationActor } from "@utils/content-translation.util";
import type { TranslationRow } from "@utils/content-translation.util";

const translationSelect = {
  id: true,
  locale: true,
  title: true,
  description: true,
  learnings: true,
  requirements: true,
  isPublished: true,
  publishedAt: true,
  version: true,
  updatedAt: true,
} as const;

@Injectable()
export class CourseTranslationService {
  private readonly logger = new Logger(CourseTranslationService.name);

  private readonly store: TranslationStore<Prisma.TransactionClient>;

  constructor(private readonly prisma: PrismaService) {
    this.store = {
      transaction: (work) => this.prisma.$transaction((tx) => work(tx)),
      lockParent: async (tx, courseId) => {
        await tx.$queryRaw`SELECT 1 FROM "Course" WHERE "id" = ${courseId} FOR UPDATE`;
      },
      findParent: (tx, courseId) =>
        tx.course.findUnique({
          where: { id: courseId },
          select: {
            id: true,
            providerId: true,
            deletedAt: true,
            sourceLanguage: true,
            learnings: true,
            requirements: true,
          },
        }),
      findTranslation: (tx, courseId, locale) =>
        tx.courseTranslation.findUnique({
          where: { courseId_locale: { courseId, locale } },
          select: translationSelect,
        }),
      create: (tx, courseId, locale, fields, actorId) =>
        tx.courseTranslation.create({
          data: {
            courseId,
            locale,
            title: fields.title,
            description: fields.description,
            learnings: fields.learnings ?? [],
            requirements: fields.requirements ?? [],
            updatedById: actorId,
          },
          select: translationSelect,
        }),
      update: async (tx, translationId, expectedVersion, data) => {
        const { count } = await tx.courseTranslation.updateMany({
          where: { id: translationId, version: expectedVersion },
          data: {
            ...(data.fields
              ? {
                  title: data.fields.title,
                  description: data.fields.description,
                  learnings: data.fields.learnings ?? [],
                  requirements: data.fields.requirements ?? [],
                }
              : {}),
            ...(data.isPublished === undefined
              ? {}
              : {
                  isPublished: data.isPublished,
                  publishedAt: data.publishedAt ?? null,
                }),
            updatedById: data.actorId,
            version: { increment: 1 },
          },
        });
        return count;
      },
      reload: (tx, translationId) =>
        tx.courseTranslation.findUniqueOrThrow({
          where: { id: translationId },
          select: translationSelect,
        }),
      touchParent: async (tx, courseId) => {
        await tx.course.update({
          where: { id: courseId },
          data: publicContentChange(),
        });
      },
    };
  }

  private readonly guards = {
    notFound: () => new NotFoundException(CourseMessageCode.COURSE_NOT_FOUND),
    denied: () =>
      new ForbiddenException(CourseMessageCode.COURSE_ACCESS_DENIED),
  };

  async list(courseId: string, actor: TranslationActor) {
    return listContentTranslations(
      this.store,
      this.guards,
      { actor, parentId: courseId },
      (tx, parentId) =>
        tx.courseTranslation.findMany({
          where: { courseId: parentId },
          orderBy: { locale: "asc" },
          select: translationSelect,
        }),
    );
  }

  async readLanguage(courseId: string, actor: TranslationActor) {
    return this.store.transaction(async (tx) => {
      await authorizeTranslationParent(
        this.store,
        tx,
        courseId,
        actor,
        this.guards,
      );
      return this.languageOf(tx, courseId);
    });
  }

  async setSourceLanguage(
    input: SetCourseSourceLanguageInput,
    actor: TranslationActor,
  ) {
    const language = await this.store.transaction(async (tx) => {
      await authorizeTranslationParent(
        this.store,
        tx,
        input.courseId,
        actor,
        this.guards,
        true,
      );
      const { count } = await tx.course.updateMany({
        where: {
          id: input.courseId,
          translations: {
            none: { locale: input.sourceLanguage, isPublished: true },
          },
        },
        data: {
          sourceLanguage: input.sourceLanguage.toLowerCase(),
          ...publicContentChange(),
        },
      });
      if (count !== 1) throw sourceLanguageIsTranslated();
      return this.languageOf(tx, input.courseId);
    });
    this.logger.log("Course source language declared", {
      kind: "course",
      sourceLanguage: language.sourceLanguage,
      availableLocales: language.availableLocales,
      correlationId: requestContext.correlationId(),
    });
    return language;
  }

  private async languageOf(
    tx: Prisma.TransactionClient,
    courseId: string,
  ): Promise<{
    courseId: string;
    sourceLanguage: AppLanguage | null;
    publishedLocales: AppLanguage[];
    availableLocales: AppLanguage[];
  }> {
    const [course, published] = await Promise.all([
      tx.course.findUniqueOrThrow({
        where: { id: courseId },
        select: { sourceLanguage: true },
      }),
      tx.courseTranslation.findMany({
        where: { courseId, isPublished: true },
        select: { locale: true },
        orderBy: { locale: "asc" },
      }),
    ]);
    const publishedLocales = published.map((row) => row.locale);
    const variants = resolveVariants({
      sourceLanguage: course.sourceLanguage,
      published: publishedLocales,
    });
    return {
      courseId,
      sourceLanguage: normalizeSourceLanguage(course.sourceLanguage),
      publishedLocales,
      availableLocales: [
        ...(variants.english ? [AppLanguage.EN] : []),
        ...(variants.french ? [AppLanguage.FR] : []),
      ],
    };
  }

  async save(input: SaveCourseTranslationInput, actor: TranslationActor) {
    const row = await saveContentTranslation(this.store, this.guards, {
      actor,
      parentId: input.courseId,
      locale: input.locale,
      expectedVersion: input.expectedVersion,
      fields: {
        title: input.title,
        description: input.description,
        learnings: input.learnings,
        requirements: input.requirements,
      },
    });
    this.logOutcome("save", input.locale, row);
    return row;
  }

  async setPublication(
    input: SetCourseTranslationPublicationInput,
    actor: TranslationActor,
  ) {
    const row = await setContentTranslationPublication(
      this.store,
      this.guards,
      {
        actor,
        parentId: input.courseId,
        locale: input.locale,
        published: input.published,
        expectedVersion: input.expectedVersion,
      },
    );
    this.logOutcome(
      input.published ? "publish" : "unpublish",
      input.locale,
      row,
    );
    return row;
  }

  async localizeOne<TCourse extends TLocalizableCourse>(
    course: TCourse,
    locale: AppLanguage | null | undefined,
  ) {
    if (!locale) return presentContentText(course);
    const published = await this.readPublished([course.id]);
    const presentation = localizeRecord(
      course,
      published.get(course.id) ?? [],
      locale,
    );
    return {
      ...presentation.record,
      contentLanguage: presentation.contentLanguage,
      availableLocales: presentation.availableLocales,
    };
  }

  async localizeMany<TCourse extends TLocalizableCourse>(
    courses: TCourse[],
    locale: AppLanguage | null | undefined,
  ) {
    if (courses.length === 0) return courses;
    if (!locale) return courses.map(presentContentText);
    const ids = courses.map((course) => course.id);
    const [published, sources] = await Promise.all([
      this.readPublished(ids),
      this.prisma.course.findMany({
        where: { id: { in: ids } },
        select: { id: true, sourceLanguage: true },
      }),
    ]);
    const sourceById = new Map(
      sources.map((source) => [source.id, source.sourceLanguage]),
    );
    return courses.map((course) => {
      const presentation = localizeRecord(
        { ...course, sourceLanguage: sourceById.get(course.id) ?? null },
        published.get(course.id) ?? [],
        locale,
      );
      const { sourceLanguage: _sourceLanguage, ...record } =
        presentation.record;
      return {
        ...record,
        contentLanguage: presentation.contentLanguage,
        availableLocales: presentation.availableLocales,
      };
    });
  }

  private async readPublished(courseIds: string[]) {
    const rows = await this.prisma.courseTranslation.findMany({
      where: { courseId: { in: courseIds }, isPublished: true },
      select: {
        courseId: true,
        locale: true,
        title: true,
        description: true,
        learnings: true,
        requirements: true,
      },
    });
    const byCourse = new Map<string, PublishedTranslation[]>();
    for (const { courseId, ...translation } of rows)
      byCourse.set(courseId, [...(byCourse.get(courseId) ?? []), translation]);
    return byCourse;
  }

  private logOutcome(action: string, locale: AppLanguage, row: TranslationRow) {
    this.logger.log("Course translation changed", {
      action,
      locale,
      kind: "course",
      isPublished: row.isPublished,
      version: row.version,
      correlationId: requestContext.correlationId(),
    });
  }
}
