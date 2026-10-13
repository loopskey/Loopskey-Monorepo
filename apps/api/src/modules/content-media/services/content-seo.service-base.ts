import { ConflictException, Logger } from "@nestjs/common";
import { ContentSocialImageService } from "@contentMedia/services/content-social-image.service";
import { setContentIndexExclusion } from "@utils/content-seo.util";
import { AppLanguage, Prisma } from "@prisma/client";
import { presentSeoSettings } from "@utils/content-seo-settings.util";
import { readContentSeo } from "@utils/content-seo.util";
import { requestContext } from "@infrastructure/observability/request-context";
import { saveContentSeo } from "@utils/content-seo.util";
import { effectiveSeo } from "@utils/content-seo.util";

import type { SetContentIndexExclusionInput } from "@common/types/content-seo.types";
import type { SeoGuards, SeoRow, SeoStore } from "@utils/content-seo.util";
import type { EffectiveSeo, SeoActor } from "@utils/content-seo.util";
import type { SaveContentSeoInput } from "@common/types/content-seo.types";
import type { SeoDefaultText } from "@utils/content-seo-settings.util";

export type SeoRowWithParent = SeoRow & { parentId: string };

export abstract class ContentSeoServiceBase {
  protected readonly logger: Logger;

  protected abstract readonly kind: string;

  protected abstract readonly entityType: string;

  protected abstract readonly store: SeoStore<Prisma.TransactionClient>;

  protected abstract readonly guards: SeoGuards;

  protected abstract readSettings(
    tx: Prisma.TransactionClient,
    parentId: string,
  ): Promise<{
    rows: SeoRow[];
    defaults: Record<AppLanguage, SeoDefaultText>;
  }>;

  protected abstract readRowsForLocale(
    parentIds: string[],
    locale: AppLanguage,
  ): Promise<SeoRowWithParent[]>;

  protected constructor(
    loggerName: string,
    protected readonly images: ContentSocialImageService,
  ) {
    this.logger = new Logger(loggerName);
  }

  async get(parentId: string, actor: SeoActor) {
    const { parent, read } = await readContentSeo(
      this.store,
      this.guards,
      { actor, parentId },
      (tx, id) => this.readSettings(tx, id),
    );
    return presentSeoSettings(
      parent.excludeFromIndex,
      read.rows,
      read.defaults,
    );
  }

  async save(input: SaveContentSeoInput, actor: SeoActor) {
    try {
      const outcome = await saveContentSeo(
        this.store,
        this.guards,
        this.entityType,
        {
          actor,
          parentId: input.contentId,
          locale: input.locale,
          expectedVersion: input.expectedVersion,
          patch: {
            seoTitle: input.seoTitle,
            seoDescription: input.seoDescription,
            socialImageId: input.socialImageId,
            socialImageAlt: input.socialImageAlt,
          },
        },
      );
      await this.images.retireAll([outcome.replacedImageId]);
      this.logger.log("Content SEO changed", {
        kind: this.kind,
        actorId: actor.id,
        contentId: input.contentId,
        locale: input.locale,
        fields: outcome.changed,
        version: outcome.row.version,
        correlationId: requestContext.correlationId(),
      });
    } catch (error) {
      if (error instanceof ConflictException)
        this.logger.warn("Content SEO version conflict", {
          kind: this.kind,
          actorId: actor.id,
          contentId: input.contentId,
          locale: input.locale,
          correlationId: requestContext.correlationId(),
        });
      throw error;
    }
    return this.get(input.contentId, actor);
  }

  async setIndexExclusion(
    input: SetContentIndexExclusionInput,
    actor: SeoActor,
  ) {
    const outcome = await setContentIndexExclusion(
      this.store,
      this.guards,
      this.entityType,
      { actor, parentId: input.contentId, excluded: input.excluded },
    );
    if (outcome.changed)
      this.logger.log("Content index exclusion changed", {
        kind: this.kind,
        actorId: actor.id,
        contentId: input.contentId,
        excludeFromIndex: outcome.excludeFromIndex,
        correlationId: requestContext.correlationId(),
      });
    return this.get(input.contentId, actor);
  }

  async withEffectiveSeo<TRecord extends { id: string }>(
    record: TRecord,
    locale: AppLanguage | null | undefined,
  ): Promise<TRecord & EffectiveSeo> {
    if (!locale) return { ...record, ...effectiveSeo(null) };
    const [row] = await this.readRowsForLocale([record.id], locale);
    return { ...record, ...effectiveSeo(row) };
  }
}
