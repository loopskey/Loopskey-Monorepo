import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { SetPodcastTranslationPublicationInput } from "@podcast/dtos/set-podcast-translation-publication.input";
import { SavePodcastTranslationInput } from "@podcast/dtos/save-podcast-translation.input";
import { AppLanguage, Prisma } from "@prisma/client";
import { publicContentChange } from "@utils/public-content-change.util";
import { PodcastMessageCode } from "@podcast/enums/message-code.enum";
import { LocalizablePodcast } from "@podcast/types/podcast-service.types";
import { NotFoundException } from "@nestjs/common";
import { requestContext } from "@infrastructure/observability/request-context";
import { PrismaService } from "@prisma/prisma.service";
import {
  listContentTranslations,
  localizeRecord,
  saveContentTranslation,
  setContentTranslationPublication,
} from "@utils/content-translation.util";

import type {
  PublishedTranslation,
  TranslationActor,
  TranslationRow,
  TranslationStore,
} from "@utils/content-translation.util";

const translationSelect = {
  id: true,
  locale: true,
  title: true,
  description: true,
  isPublished: true,
  publishedAt: true,
  version: true,
  updatedAt: true,
} as const;

@Injectable()
export class PodcastTranslationService {
  private readonly logger = new Logger(PodcastTranslationService.name);

  private readonly store: TranslationStore<Prisma.TransactionClient>;

  constructor(private readonly prisma: PrismaService) {
    this.store = {
      transaction: (work) => this.prisma.$transaction((tx) => work(tx)),
      findParent: (tx, podcastId) =>
        tx.podcast.findUnique({
          where: { id: podcastId },
          select: {
            id: true,
            providerId: true,
            deletedAt: true,
          },
        }),
      findTranslation: (tx, podcastId, locale) =>
        tx.podcastTranslation.findUnique({
          where: { podcastId_locale: { podcastId, locale } },
          select: translationSelect,
        }),
      create: (tx, podcastId, locale, fields, actorId) =>
        tx.podcastTranslation.create({
          data: {
            podcastId,
            locale,
            title: fields.title,
            description: fields.description,
            updatedById: actorId,
          },
          select: translationSelect,
        }),
      update: async (tx, translationId, expectedVersion, data) => {
        const { count } = await tx.podcastTranslation.updateMany({
          where: { id: translationId, version: expectedVersion },
          data: {
            ...(data.fields
              ? {
                  title: data.fields.title,
                  description: data.fields.description,
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
        tx.podcastTranslation.findUniqueOrThrow({
          where: { id: translationId },
          select: translationSelect,
        }),
      touchParent: async (tx, podcastId) => {
        await tx.podcast.update({
          where: { id: podcastId },
          data: publicContentChange(),
        });
      },
    };
  }

  private readonly guards = {
    notFound: () => new NotFoundException(PodcastMessageCode.PODCAST_NOT_FOUND),
    denied: () =>
      new ForbiddenException(PodcastMessageCode.PODCAST_ACCESS_DENIED),
  };

  async list(podcastId: string, actor: TranslationActor) {
    return listContentTranslations(
      this.store,
      this.guards,
      { actor, parentId: podcastId },
      (tx, parentId) =>
        tx.podcastTranslation.findMany({
          where: { podcastId: parentId },
          orderBy: { locale: "asc" },
          select: translationSelect,
        }),
    );
  }

  async save(input: SavePodcastTranslationInput, actor: TranslationActor) {
    const row = await saveContentTranslation(this.store, this.guards, {
      actor,
      parentId: input.podcastId,
      locale: input.locale,
      expectedVersion: input.expectedVersion,
      fields: {
        title: input.title,
        description: input.description,
      },
    });
    this.logOutcome("save", input.locale, row);
    return row;
  }

  async setPublication(
    input: SetPodcastTranslationPublicationInput,
    actor: TranslationActor,
  ) {
    const row = await setContentTranslationPublication(
      this.store,
      this.guards,
      {
        actor,
        parentId: input.podcastId,
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

  async localizeOne<TPodcast extends LocalizablePodcast>(
    podcast: TPodcast,
    locale: AppLanguage | null | undefined,
  ) {
    if (!locale) return podcast;
    const published = await this.readPublished([podcast.id]);
    const presentation = localizeRecord(
      podcast,
      published.get(podcast.id) ?? [],
      locale,
    );
    return {
      ...presentation.record,
      contentLanguage: presentation.contentLanguage,
      availableLocales: presentation.availableLocales,
    };
  }

  async localizeMany<TPodcast extends LocalizablePodcast>(
    podcasts: TPodcast[],
    locale: AppLanguage | null | undefined,
  ) {
    if (!locale || podcasts.length === 0) return podcasts;
    const ids = podcasts.map((podcast) => podcast.id);
    const [published, sources] = await Promise.all([
      this.readPublished(ids),
      this.prisma.podcast.findMany({
        where: { id: { in: ids } },
        select: { id: true, sourceLanguage: true },
      }),
    ]);
    const sourceById = new Map(
      sources.map((source) => [source.id, source.sourceLanguage]),
    );
    return podcasts.map((podcast) => {
      const presentation = localizeRecord(
        { ...podcast, sourceLanguage: sourceById.get(podcast.id) ?? null },
        published.get(podcast.id) ?? [],
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

  private async readPublished(podcastIds: string[]) {
    const rows = await this.prisma.podcastTranslation.findMany({
      where: { podcastId: { in: podcastIds }, isPublished: true },
      select: {
        podcastId: true,
        locale: true,
        title: true,
        description: true,
      },
    });
    const byPodcast = new Map<string, PublishedTranslation[]>();
    for (const { podcastId, ...translation } of rows)
      byPodcast.set(podcastId, [
        ...(byPodcast.get(podcastId) ?? []),
        translation,
      ]);
    return byPodcast;
  }

  private logOutcome(action: string, locale: AppLanguage, row: TranslationRow) {
    this.logger.log("Podcast translation changed", {
      action,
      locale,
      kind: "podcast",
      isPublished: row.isPublished,
      version: row.version,
      correlationId: requestContext.correlationId(),
    });
  }
}
