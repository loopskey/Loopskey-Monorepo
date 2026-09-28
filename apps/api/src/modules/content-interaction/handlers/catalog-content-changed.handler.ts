import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { WishlistContentService } from "@contentAction/services/wishlist-content.service";
import { OutboxHandlerRegistry } from "@infrastructure/outbox/outbox-handler.port";

import { type OutboxHandler } from "@infrastructure/outbox/outbox-handler.port";

@Injectable()
export class CatalogContentChangedHandler
  implements OutboxHandler, OnModuleInit
{
  private readonly logger = new Logger(CatalogContentChangedHandler.name);

  readonly eventName = "catalog.content.changed";
  readonly handlerName = "wishlist-search-document-refresh-v1";
  readonly lane = "realtime" as const;

  constructor(
    private readonly registry: OutboxHandlerRegistry,
    private readonly wishlistContentService: WishlistContentService,
  ) {}

  onModuleInit() {
    this.registry.register(this);
  }

  async handle() {
    await this.wishlistContentService.refreshWishlistSearchDocuments();
    this.logger.log("Refreshed the wishlist search document view.");
  }
}
