import { ForbiddenException, Injectable } from "@nestjs/common";
import { ContentSocialImageService } from "@contentMedia/services/content-social-image.service";
import { ContentSeoServiceBase } from "@contentMedia/services/content-seo.service-base";
import { AppLanguage, Prisma } from "@prisma/client";
import { NotFoundException } from "@nestjs/common";
import { EventMessageCode } from "@events/enums/message-code.enum";
import { EventRepository } from "@events/infrastructure/persistence/event.repository";

import type { SeoGuards, SeoStore } from "@utils/content-seo.util";
import type { SeoRowWithParent } from "@contentMedia/services/content-seo.service-base";

@Injectable()
export class EventSeoService extends ContentSeoServiceBase {
  protected readonly kind = "event";

  protected readonly entityType = "Event";

  protected readonly guards: SeoGuards = {
    notFound: () => new NotFoundException(EventMessageCode.EVENT_NOT_FOUND),
    denied: () => new ForbiddenException(EventMessageCode.EVENT_ACCESS_DENIED),
  };

  protected readonly store: SeoStore<Prisma.TransactionClient>;

  constructor(
    private readonly repository: EventRepository,
    images: ContentSocialImageService,
  ) {
    super(EventSeoService.name, images);
    this.store = repository.seoStore();
  }

  protected readSettings(tx: Prisma.TransactionClient, parentId: string) {
    return this.repository.readSeoSettings(tx, parentId);
  }

  protected readRowsForLocale(
    parentIds: string[],
    locale: AppLanguage,
  ): Promise<SeoRowWithParent[]> {
    return this.repository.findSeoRowsForLocale(parentIds, locale);
  }
}
