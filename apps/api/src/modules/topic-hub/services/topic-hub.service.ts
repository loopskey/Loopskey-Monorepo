import { Inject, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { AppLanguage, AuditAction, ContentUrlNamespace } from "@prisma/client";
import { BadRequestException, ConflictException } from "@nestjs/common";
import { Prisma, TopicHubStatus } from "@prisma/client";
import { ContentUrlMessageCode } from "@loopskey/api-contracts/error-codes";
import { isContentSlugClaimed } from "@utils/content-slug-claim.util";
import { normalizeContentSlug } from "@utils/content-slug.util";
import { TopicHubMessageCode } from "@loopskey/api-contracts/error-codes";
import { CONTENT_PUBLIC_API } from "@contentUrl/public/content-public-api";
import { TOPIC_HUB_LIMITS } from "@loopskey/api-contracts/validation";
import { requestContext } from "@infrastructure/observability/request-context";
import { PrismaService } from "@prisma/prisma.service";
import {
  assertSubstantiveTopicHubCopy,
  cleanTopicHubCategory,
  cleanTopicHubCopy,
  invalidTopicHubField,
  sectionsFromJson,
} from "@topicHub/utils/topic-hub-copy.util";

import type { SetTopicHubTranslationPublicationInput } from "@topicHub/dtos/set-topic-hub-translation-publication.input";
import type { SetTopicHubIndexExclusionInput } from "@topicHub/dtos/set-topic-hub-index-exclusion.input";
import type { SetTopicHubStatusInput } from "@topicHub/dtos/set-topic-hub-status.input";
import type { SaveTopicHubInput } from "@topicHub/dtos/save-topic-hub.input";
import type { PublicContentCard } from "@contentUrl/public/content-public-api";
import type { PublicContentKind } from "@contentUrl/public/content-public-api";
import type { ContentPublicApi } from "@contentUrl/public/content-public-api";
import type { TopicHubCopy } from "@topicHub/utils/topic-hub-copy.util";

export type TopicHubActor = { id: string };

const LIST_LIMIT = 100;

const notFound = () =>
  new NotFoundException({
    code: TopicHubMessageCode.NOT_FOUND,
    message: TopicHubMessageCode.NOT_FOUND,
  });

const versionConflict = () =>
  new ConflictException({
    code: TopicHubMessageCode.VERSION_CONFLICT,
    message: TopicHubMessageCode.VERSION_CONFLICT,
  });

const invalidState = () =>
  new ConflictException({
    code: TopicHubMessageCode.INVALID_STATE,
    message: TopicHubMessageCode.INVALID_STATE,
  });

const noEligibleLinks = () =>
  new BadRequestException({
    code: TopicHubMessageCode.NO_ELIGIBLE_LINKS,
    message: TopicHubMessageCode.NO_ELIGIBLE_LINKS,
  });

const slugTaken = () =>
  new ConflictException({
    code: ContentUrlMessageCode.SLUG_TAKEN,
    message: ContentUrlMessageCode.SLUG_TAKEN,
  });

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";

const keyOf = (kind: string, id: string) => `${kind}:${id}`;

type HubWithRelations = Prisma.TopicHubGetPayload<{
  include: { references: true; translations: true };
}>;

@Injectable()
export class TopicHubService {
  private readonly logger = new Logger(TopicHubService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(CONTENT_PUBLIC_API) private readonly content: ContentPublicApi,
  ) {}

  async list() {
    const hubs = await this.prisma.topicHub.findMany({
      where: { deletedAt: null },
      include: { references: true, translations: true },
      orderBy: { updatedAt: "desc" },
      take: LIST_LIMIT,
    });
    const eligible = await this.eligibleKeys(
      hubs.flatMap((hub) => hub.references),
    );
    return hubs.map((hub) => this.summary(hub, eligible));
  }

  async get(hubId: string) {
    const hub = await this.load(hubId);
    const refs = hub.references;
    const cards = await this.cardsOf(refs);
    const eligible = new Set(cards.map((card) => keyOf(card.kind, card.id)));
    return {
      ...this.summary(hub, eligible),
      introduction: hub.introduction,
      guidance: hub.guidance,
      sections: sectionsFromJson(hub.sections),
      category: hub.category,
      references: [...refs]
        .sort((left, right) => left.position - right.position)
        .map((ref) => {
          const card = cards.find(
            (candidate) =>
              keyOf(candidate.kind, candidate.id) ===
              keyOf(ref.kind, ref.targetId),
          );
          return {
            kind: ref.kind,
            contentId: ref.targetId,
            slug: card?.slug ?? null,
            title: card?.title ?? null,
            isEligible: Boolean(card),
          };
        }),
      translations: hub.translations.map((translation) => ({
        locale: translation.locale,
        title: translation.title,
        introduction: translation.introduction,
        guidance: translation.guidance,
        sections: sectionsFromJson(translation.sections),
        isPublished: translation.isPublished,
        version: translation.version,
      })),
    };
  }

  async save(actor: TopicHubActor, input: SaveTopicHubInput) {
    const copy = cleanTopicHubCopy(input);
    const hubId =
      input.locale === AppLanguage.FR
        ? await this.saveTranslation(actor, input, copy)
        : input.hubId
          ? await this.update(actor, input, copy)
          : await this.create(actor, input, copy);
    return this.get(hubId);
  }

  async setStatus(actor: TopicHubActor, input: SetTopicHubStatusInput) {
    const hub = await this.load(input.hubId);
    const publishing = input.status === TopicHubStatus.PUBLISHED;
    const allowedFrom: TopicHubStatus[] = publishing
      ? [TopicHubStatus.DRAFT, TopicHubStatus.WITHDRAWN]
      : [TopicHubStatus.PUBLISHED];
    if (!allowedFrom.includes(hub.status)) throw invalidState();

    if (publishing) {
      assertSubstantiveTopicHubCopy({
        title: hub.title,
        introduction: hub.introduction,
        guidance: hub.guidance,
        sections: sectionsFromJson(hub.sections),
      });
      const eligible = await this.eligibleKeys(hub.references);
      if (eligible.size === 0) throw noEligibleLinks();
    }

    const now = new Date();
    const { count } = await this.prisma.$transaction(async (tx) => {
      const result = await tx.topicHub.updateMany({
        where: {
          id: hub.id,
          version: input.expectedVersion,
          status: { in: allowedFrom },
          deletedAt: null,
        },
        data: publishing
          ? {
              status: TopicHubStatus.PUBLISHED,
              publishedAt: now,
              withdrawnAt: null,
              version: { increment: 1 },
              updatedById: actor.id,
              publicContentUpdatedAt: now,
            }
          : {
              status: TopicHubStatus.WITHDRAWN,
              withdrawnAt: now,
              version: { increment: 1 },
              updatedById: actor.id,
              publicContentUpdatedAt: now,
            },
      });
      if (result.count === 1)
        await tx.auditLog.create({
          data: {
            actorId: actor.id,
            action: AuditAction.TOPIC_HUB_STATUS_CHANGED,
            entityType: "TopicHub",
            entityId: hub.id,
            metadata: { from: hub.status, to: input.status },
          },
        });
      return result;
    });
    if (count !== 1) throw versionConflict();
    this.logger.log("Topic hub status changed", {
      hubId: hub.id,
      from: hub.status,
      to: input.status,
      actorId: actor.id,
      correlationId: requestContext.correlationId(),
    });
    return this.get(hub.id);
  }

  async setTranslationPublication(
    actor: TopicHubActor,
    input: SetTopicHubTranslationPublicationInput,
  ) {
    const translation = await this.prisma.topicHubTranslation.findUnique({
      where: { hubId_locale: { hubId: input.hubId, locale: input.locale } },
    });
    if (!translation) throw notFound();
    if (input.published)
      assertSubstantiveTopicHubCopy({
        title: translation.title,
        introduction: translation.introduction,
        guidance: translation.guidance,
        sections: sectionsFromJson(translation.sections),
      });

    const now = new Date();
    const changed = await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.topicHubTranslation.updateMany({
        where: {
          id: translation.id,
          version: input.expectedVersion,
        },
        data: {
          isPublished: input.published,
          publishedAt: input.published ? now : null,
          version: { increment: 1 },
          updatedById: actor.id,
        },
      });
      if (count !== 1) return false;
      await tx.topicHub.update({
        where: { id: input.hubId },
        data: { publicContentUpdatedAt: now },
      });
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          action: AuditAction.TOPIC_HUB_UPDATED,
          entityType: "TopicHub",
          entityId: input.hubId,
          metadata: { locale: input.locale, published: input.published },
        },
      });
      return true;
    });
    if (!changed) throw versionConflict();
    return this.get(input.hubId);
  }

  async setIndexExclusion(
    actor: TopicHubActor,
    input: SetTopicHubIndexExclusionInput,
  ) {
    const hub = await this.load(input.hubId);
    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.topicHub.updateMany({
        where: {
          id: hub.id,
          deletedAt: null,
          excludeFromIndex: !input.excluded,
        },
        data: {
          excludeFromIndex: input.excluded,
          publicContentUpdatedAt: new Date(),
        },
      });
      if (count === 1)
        await tx.auditLog.create({
          data: {
            actorId: actor.id,
            action: AuditAction.TOPIC_HUB_INDEX_EXCLUSION_CHANGED,
            entityType: "TopicHub",
            entityId: hub.id,
            metadata: { excludeFromIndex: input.excluded },
          },
        });
    });
    return this.get(hub.id);
  }

  private async create(
    actor: TopicHubActor,
    input: SaveTopicHubInput,
    copy: TopicHubCopy,
  ) {
    if (!input.slug) throw invalidTopicHubField("title");
    const slug = normalizeContentSlug(input.slug);
    if (
      await isContentSlugClaimed(this.prisma, ContentUrlNamespace.TOPIC, slug)
    )
      throw slugTaken();
    const references = this.cleanReferences(input.references);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const hub = await tx.topicHub.create({
          data: {
            slug,
            ...this.copyData(copy),
            category: cleanTopicHubCategory(input.category),
            createdById: actor.id,
            updatedById: actor.id,
            references: {
              create: references.map((ref, position) => ({
                kind: ref.kind,
                targetId: ref.contentId,
                position,
              })),
            },
          },
          select: { id: true },
        });
        await this.audit(tx, actor, hub.id, { created: true });
        return hub.id;
      });
    } catch (error) {
      if (isUniqueViolation(error)) throw slugTaken();
      throw error;
    }
  }

  private async update(
    actor: TopicHubActor,
    input: SaveTopicHubInput,
    copy: TopicHubCopy,
  ) {
    const hubId = input.hubId!;
    const hub = await this.prisma.topicHub.findFirst({
      where: { id: hubId, deletedAt: null },
      select: { status: true },
    });
    if (!hub) throw notFound();
    if (input.expectedVersion === undefined) throw versionConflict();
    if (hub.status === TopicHubStatus.PUBLISHED)
      assertSubstantiveTopicHubCopy(copy);
    const references = input.references
      ? this.cleanReferences(input.references)
      : null;

    await this.prisma.$transaction(async (tx) => {
      const { count } = await tx.topicHub.updateMany({
        where: {
          id: hubId,
          version: input.expectedVersion,
          status: hub.status,
          deletedAt: null,
        },
        data: {
          ...this.copyData(copy),
          ...(input.category !== undefined
            ? { category: cleanTopicHubCategory(input.category) }
            : {}),
          version: { increment: 1 },
          updatedById: actor.id,
          publicContentUpdatedAt: new Date(),
        },
      });
      if (count !== 1) throw versionConflict();
      if (references) {
        await tx.topicHubReference.deleteMany({ where: { hubId } });
        await tx.topicHubReference.createMany({
          data: references.map((ref, position) => ({
            hubId,
            kind: ref.kind,
            targetId: ref.contentId,
            position,
          })),
        });
      }
      await this.audit(tx, actor, hubId, {
        locale: input.locale,
        references: references?.length ?? null,
      });
    });
    return hubId;
  }

  private async saveTranslation(
    actor: TopicHubActor,
    input: SaveTopicHubInput,
    copy: TopicHubCopy,
  ) {
    if (!input.hubId) throw notFound();
    const hubId = input.hubId;
    const hub = await this.prisma.topicHub.findFirst({
      where: { id: hubId, deletedAt: null },
      select: { id: true },
    });
    if (!hub) throw notFound();
    const existing = await this.prisma.topicHubTranslation.findUnique({
      where: { hubId_locale: { hubId, locale: input.locale } },
      select: { id: true, isPublished: true },
    });
    if (existing?.isPublished) assertSubstantiveTopicHubCopy(copy);
    const data = this.copyData(copy);

    await this.prisma.$transaction(async (tx) => {
      if (!existing) {
        if (input.expectedVersion !== undefined) throw versionConflict();
        try {
          await tx.topicHubTranslation.create({
            data: {
              hubId,
              locale: input.locale,
              ...data,
              updatedById: actor.id,
            },
          });
        } catch (error) {
          if (isUniqueViolation(error)) throw versionConflict();
          throw error;
        }
      } else {
        if (input.expectedVersion === undefined) throw versionConflict();
        const { count } = await tx.topicHubTranslation.updateMany({
          where: { id: existing.id, version: input.expectedVersion },
          data: {
            ...data,
            version: { increment: 1 },
            updatedById: actor.id,
          },
        });
        if (count !== 1) throw versionConflict();
        if (existing.isPublished)
          await tx.topicHub.update({
            where: { id: hubId },
            data: { publicContentUpdatedAt: new Date() },
          });
      }
      await this.audit(tx, actor, hubId, { locale: input.locale });
    });
    return hubId;
  }

  private copyData(copy: TopicHubCopy) {
    return {
      title: copy.title,
      introduction: copy.introduction,
      guidance: copy.guidance,
      sections: copy.sections as unknown as Prisma.InputJsonValue,
    };
  }

  private cleanReferences(
    references: SaveTopicHubInput["references"] | undefined,
  ) {
    const seen = new Set<string>();
    const unique = (references ?? []).filter((ref) => {
      const key = keyOf(ref.kind, ref.contentId);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    if (unique.length > TOPIC_HUB_LIMITS.referencesMax)
      throw invalidTopicHubField("references");
    return unique;
  }

  private audit(
    tx: Prisma.TransactionClient,
    actor: TopicHubActor,
    hubId: string,
    metadata: Prisma.InputJsonObject,
  ) {
    return tx.auditLog.create({
      data: {
        actorId: actor.id,
        action: AuditAction.TOPIC_HUB_UPDATED,
        entityType: "TopicHub",
        entityId: hubId,
        metadata,
      },
    });
  }

  private async load(hubId: string): Promise<HubWithRelations> {
    const hub = await this.prisma.topicHub.findFirst({
      where: { id: hubId, deletedAt: null },
      include: { references: true, translations: true },
    });
    if (!hub) throw notFound();
    return hub;
  }

  private cardsOf(
    references: readonly { kind: ContentUrlNamespace; targetId: string }[],
  ): Promise<PublicContentCard[]> {
    return this.content.findPublished(
      references.map((ref) => ({
        kind: ref.kind as PublicContentKind,
        id: ref.targetId,
      })),
    );
  }

  private async eligibleKeys(
    references: readonly { kind: ContentUrlNamespace; targetId: string }[],
  ) {
    const cards = await this.cardsOf(references);
    return new Set(cards.map((card) => keyOf(card.kind, card.id)));
  }

  private summary(hub: HubWithRelations, eligible: ReadonlySet<string>) {
    const eligibleLinkCount = hub.references.filter((ref) =>
      eligible.has(keyOf(ref.kind, ref.targetId)),
    ).length;
    return {
      id: hub.id,
      slug: hub.slug,
      title: hub.title,
      status: hub.status,
      version: hub.version,
      linkCount: hub.references.length,
      eligibleLinkCount,
      needsReview:
        hub.status === TopicHubStatus.PUBLISHED && eligibleLinkCount === 0,
      excludeFromIndex: hub.excludeFromIndex,
      publishedAt: hub.publishedAt,
      updatedAt: hub.updatedAt,
    };
  }
}
