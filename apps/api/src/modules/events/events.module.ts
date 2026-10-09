import { EventPublishedLoggingHandler } from "@events/infrastructure/handlers/event-published-logging.handler";
import { EventDomainEventDispatcher } from "@events/application/events/event-domain-event.dispatcher";
import { EVENT_PUBLISHED_HANDLERS } from "@events/application/events/event-domain-event.dispatcher";
import { EVENT_CATALOG_SEARCH_API } from "@events/public/catalog-search-api";
import { CatalogSearchApiService } from "@events/application/catalog-search-api.service";
import { EventViewSignalLimiter } from "@events/services/event-view-signal.limiter";
import { EventsApiService } from "@events/application/events-api.service";
import { EventRepository } from "@events/infrastructure/persistence/event.repository";
import { EventResolver } from "@events/resolvers/event.resolver";
import { PrismaModule } from "@prisma/prisma.module";
import { EventService } from "@events/services/event.service";
import { EVENTS_API } from "@events/public/events-api.token";
import { Module } from "@nestjs/common";

import "@events/enums/event-register.enum";

@Module({
  imports: [PrismaModule],
  providers: [
    EventService,
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
  exports: [EVENTS_API, EVENT_CATALOG_SEARCH_API],
})
export class EventModule {}
