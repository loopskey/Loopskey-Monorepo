import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { AppLanguage, TopicHubStatus } from "@prisma/client";
import { ContentUrlNamespace } from "@prisma/client";
import { TopicHubMessageCode } from "@loopskey/api-contracts/error-codes";
import { CONTENT_PUBLIC_API } from "@contentUrl/public/content-public-api";
import { sectionsFromJson } from "@topicHub/utils/topic-hub-copy.util";
import { requestContext } from "@infrastructure/observability/request-context";
import { PrismaService } from "@prisma/prisma.service";
import { snippetOf } from "@topicHub/utils/topic-hub-copy.util";

import type { PublicContentKind } from "@contentUrl/public/content-public-api";
import type { ContentPublicApi } from "@contentUrl/public/content-public-api";

const LIST_MAX = 24;
const CONTENT_HUBS_MAX = 3;
const SUMMARY_INTRODUCTION_LENGTH = 200;

const publishedTranslation = (locale: AppLanguage) => ({
  where: { locale, isPublished: true },
});

const visibleIn = (locale: AppLanguage) =>
  locale === AppLanguage.EN
    ? {}
    : { translations: { some: { locale, isPublished: true } } };

@Injectable()
export class TopicHubPublicService {
  private readonly logger = new Logger(TopicHubPublicService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CONTENT_PUBLIC_API) private readonly content: ContentPublicApi,
  ) {}

  async bySlug(slug: string, requested?: AppLanguage | null) {
    const locale = requested ?? AppLanguage.EN;
    const hub = await this.prisma.topicHub.findFirst({
      where: { slug, status: TopicHubStatus.PUBLISHED, deletedAt: null },
      include: {
        references: { orderBy: { position: "asc" } },
        translations: { where: { isPublished: true } },
      },
    });
    if (!hub || !hub.publishedAt)
      throw new NotFoundException({
        code: TopicHubMessageCode.NOT_FOUND,
        message: TopicHubMessageCode.NOT_FOUND,
      });

    const translation = hub.translations.find(
      (candidate) => candidate.locale === locale,
    );
    const copy = translation ?? hub;
    const items = await this.content.findPublished(
      hub.references.map((ref) => ({
        kind: ref.kind as PublicContentKind,
        id: ref.targetId,
      })),
    );
    if (items.length === 0)
      this.logger.warn("Topic hub has no eligible links", {
        hubId: hub.id,
        referenceCount: hub.references.length,
        correlationId: requestContext.correlationId(),
      });

    return {
      slug: hub.slug,
      title: copy.title,
      introduction: copy.introduction,
      guidance: copy.guidance,
      sections: sectionsFromJson(copy.sections),
      category: hub.category,
      items: items.map((card) => ({
        kind: card.kind as ContentUrlNamespace,
        slug: card.slug,
        title: card.title,
        summary: card.summary,
        imageUrl: card.imageUrl,
        category: card.category,
      })),
      availableLocales: [
        AppLanguage.EN,
        ...hub.translations
          .filter((candidate) => candidate.locale === AppLanguage.FR)
          .map((candidate) => candidate.locale),
      ],
      contentLanguage: translation ? translation.locale : AppLanguage.EN,
      excludeFromIndex: hub.excludeFromIndex,
      publishedAt: hub.publishedAt,
      updatedAt: hub.publicContentUpdatedAt,
    };
  }

  async list(requested?: AppLanguage | null, take?: number | null) {
    const locale = requested ?? AppLanguage.EN;
    const hubs = await this.prisma.topicHub.findMany({
      where: {
        status: TopicHubStatus.PUBLISHED,
        deletedAt: null,
        ...visibleIn(locale),
      },
      include: { translations: publishedTranslation(locale) },
      orderBy: [{ publishedAt: "desc" }, { id: "asc" }],
      take: Math.min(Math.max(take ?? 6, 1), LIST_MAX),
    });
    return hubs.map((hub) => this.toSummary(hub));
  }

  async forContent(
    kind: ContentUrlNamespace,
    contentId: string,
    requested?: AppLanguage | null,
  ) {
    const locale = requested ?? AppLanguage.EN;
    const references = await this.prisma.topicHubReference.findMany({
      where: {
        kind,
        targetId: contentId,
        hub: {
          status: TopicHubStatus.PUBLISHED,
          deletedAt: null,
          ...visibleIn(locale),
        },
      },
      include: {
        hub: { include: { translations: publishedTranslation(locale) } },
      },
      orderBy: { hub: { publishedAt: "desc" } },
      take: CONTENT_HUBS_MAX,
    });
    return references.map((reference) => this.toSummary(reference.hub));
  }

  private toSummary(hub: {
    slug: string;
    title: string;
    introduction: string;
    translations: { title: string; introduction: string }[];
  }) {
    const copy = hub.translations[0] ?? hub;
    return {
      slug: hub.slug,
      title: copy.title,
      introduction: snippetOf(copy.introduction, SUMMARY_INTRODUCTION_LENGTH),
    };
  }
}
