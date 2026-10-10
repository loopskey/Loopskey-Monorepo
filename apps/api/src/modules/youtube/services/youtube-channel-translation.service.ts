import { SetYouTubeChannelTranslationPublicationInput } from "@youtube/dtos/set-youtube-channel-translation-publication.input";
import { ForbiddenException, Injectable, Logger } from "@nestjs/common";
import { SaveYouTubeChannelTranslationInput } from "@youtube/dtos/save-youtube-channel-translation.input";
import { setContentTranslationPublication } from "@utils/content-translation.util";
import { listContentTranslations } from "@utils/content-translation.util";
import { saveContentTranslation } from "@utils/content-translation.util";
import { publicContentChange } from "@utils/public-content-change.util";
import { AppLanguage, Prisma } from "@prisma/client";
import { YouTubeMessageCode } from "@youtube/enums/message-code.enum";
import { LocalizableChannel } from "@youtube/types/youtube-service.types";
import { NotFoundException } from "@nestjs/common";
import { requestContext } from "@infrastructure/observability/request-context";
import { localizeRecord } from "@utils/content-translation.util";
import { PrismaService } from "@prisma/prisma.service";

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
export class YouTubeChannelTranslationService {
  private readonly logger = new Logger(YouTubeChannelTranslationService.name);

  private readonly store: TranslationStore<Prisma.TransactionClient>;

  constructor(private readonly prisma: PrismaService) {
    this.store = {
      transaction: (work) => this.prisma.$transaction((tx) => work(tx)),
      findParent: (tx, channelId) =>
        tx.youTubeChannel.findUnique({
          where: { id: channelId },
          select: {
            id: true,
            providerId: true,
            deletedAt: true,
          },
        }),
      findTranslation: (tx, channelId, locale) =>
        tx.youTubeChannelTranslation.findUnique({
          where: { channelId_locale: { channelId, locale } },
          select: translationSelect,
        }),
      create: (tx, channelId, locale, fields, actorId) =>
        tx.youTubeChannelTranslation.create({
          data: {
            channelId,
            locale,
            title: fields.title,
            description: fields.description,
            updatedById: actorId,
          },
          select: translationSelect,
        }),
      update: async (tx, translationId, expectedVersion, data) => {
        const { count } = await tx.youTubeChannelTranslation.updateMany({
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
        tx.youTubeChannelTranslation.findUniqueOrThrow({
          where: { id: translationId },
          select: translationSelect,
        }),
      touchParent: async (tx, channelId) => {
        await tx.youTubeChannel.update({
          where: { id: channelId },
          data: publicContentChange(),
        });
      },
    };
  }

  private readonly guards = {
    notFound: () =>
      new NotFoundException(YouTubeMessageCode.YOUTUBE_CHANNEL_NOT_FOUND),
    denied: () =>
      new ForbiddenException(YouTubeMessageCode.YOUTUBE_CHANNEL_ACCESS_DENIED),
  };

  async list(channelId: string, actor: TranslationActor) {
    return listContentTranslations(
      this.store,
      this.guards,
      { actor, parentId: channelId },
      (tx, parentId) =>
        tx.youTubeChannelTranslation.findMany({
          where: { channelId: parentId },
          orderBy: { locale: "asc" },
          select: translationSelect,
        }),
    );
  }

  async save(
    input: SaveYouTubeChannelTranslationInput,
    actor: TranslationActor,
  ) {
    const row = await saveContentTranslation(this.store, this.guards, {
      actor,
      parentId: input.channelId,
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
    input: SetYouTubeChannelTranslationPublicationInput,
    actor: TranslationActor,
  ) {
    const row = await setContentTranslationPublication(
      this.store,
      this.guards,
      {
        actor,
        parentId: input.channelId,
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

  async localizeOne<TChannel extends LocalizableChannel>(
    channel: TChannel,
    locale: AppLanguage | null | undefined,
  ) {
    if (!locale) return channel;
    const published = await this.readPublished([channel.id]);
    const presentation = localizeRecord(
      channel,
      published.get(channel.id) ?? [],
      locale,
    );
    return {
      ...presentation.record,
      contentLanguage: presentation.contentLanguage,
      availableLocales: presentation.availableLocales,
    };
  }

  async localizeMany<TChannel extends LocalizableChannel>(
    channels: TChannel[],
    locale: AppLanguage | null | undefined,
  ) {
    if (!locale || channels.length === 0) return channels;
    const ids = channels.map((channel) => channel.id);
    const [published, sources] = await Promise.all([
      this.readPublished(ids),
      this.prisma.youTubeChannel.findMany({
        where: { id: { in: ids } },
        select: { id: true, sourceLanguage: true },
      }),
    ]);
    const sourceById = new Map(
      sources.map((source) => [source.id, source.sourceLanguage]),
    );
    return channels.map((channel) => {
      const presentation = localizeRecord(
        { ...channel, sourceLanguage: sourceById.get(channel.id) ?? null },
        published.get(channel.id) ?? [],
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

  private async readPublished(channelIds: string[]) {
    const rows = await this.prisma.youTubeChannelTranslation.findMany({
      where: { channelId: { in: channelIds }, isPublished: true },
      select: {
        channelId: true,
        locale: true,
        title: true,
        description: true,
      },
    });
    const byChannel = new Map<string, PublishedTranslation[]>();
    for (const { channelId, ...translation } of rows)
      byChannel.set(channelId, [
        ...(byChannel.get(channelId) ?? []),
        translation,
      ]);
    return byChannel;
  }

  private logOutcome(action: string, locale: AppLanguage, row: TranslationRow) {
    this.logger.log("YouTubeChannel translation changed", {
      action,
      locale,
      kind: "channel",
      isPublished: row.isPublished,
      version: row.version,
      correlationId: requestContext.correlationId(),
    });
  }
}
