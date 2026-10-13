import { EventPublishedLoggingHandler } from "@events/infrastructure/handlers/event-published-logging.handler";
import { EventDomainEventDispatcher } from "@events/application/events/event-domain-event.dispatcher";
import { EventPublicUrlApiService } from "@events/application/public-url-api.service";
import { EVENT_PUBLISHED_HANDLERS } from "@events/application/events/event-domain-event.dispatcher";
import { EVENT_CATALOG_SEARCH_API } from "@events/public/catalog-search-api";
import { EventTranslationResolver } from "@events/resolvers/event-translation.resolver";
import { CatalogSearchApiService } from "@events/application/catalog-search-api.service";
import { EventTranslationService } from "@events/services/event-translation.service";
import { EventViewSignalLimiter } from "@events/services/event-view-signal.limiter";
import { EVENT_PUBLIC_URL_API } from "@events/public/public-url-api";
import { EventsApiService } from "@events/application/events-api.service";
import { EventRepository } from "@events/infrastructure/persistence/event.repository";
import { EventResolver } from "@events/resolvers/event.resolver";
import { PrismaModule } from "@prisma/prisma.module";
import { EventService } from "@events/services/event.service";
import { EVENTS_API } from "@events/public/events-api.token";
import { Module } from "@nestjs/common";

import { ContentMediaModule } from "@contentMedia/content-media.module";
import { EventSeoResolver } from "@events/resolvers/event-seo.resolver";
import { EventSeoService } from "@events/services/event-seo.service";

import "@events/enums/event-register.enum";

@Module({
  imports: [PrismaModule, ContentMediaModule],
  providers: [
    EventPublicUrlApiService,
    { provide: EVENT_PUBLIC_URL_API, useExisting: EventPublicUrlApiService },
    EventService,
    EventTranslationService,
    EventTranslationResolver,
    EventSeoService,
    EventSeoResolver,
    EventResolver,
    EventRepository,
    EventsApiService,
    EventViewSignalLimiter,
    EventDomainEventDispatcher,
    EventPublishedLoggingHandler,
    {
      provide: EVENT_PUBLISHED_HANDLERS,
      useFactory: (handler: EventPublishedLoggingHandler) => [handler],
      inject: [EventPublishedLoggingHandler],
    },
    { provide: EVENTS_API, useExisting: EventsApiService },
    CatalogSearchApiService,
    { provide: EVENT_CATALOG_SEARCH_API, useExisting: CatalogSearchApiService },
  ],
  exports: [EVENTS_API, EVENT_CATALOG_SEARCH_API, EVENT_PUBLIC_URL_API],
})
export class EventModule {}
