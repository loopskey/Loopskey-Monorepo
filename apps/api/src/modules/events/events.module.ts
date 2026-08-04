import { EventPublishedLoggingHandler } from "@events/infrastructure/handlers/event-published-logging.handler";
import { EventDomainEventDispatcher } from "@events/application/events/event-domain-event.dispatcher";
import { EVENT_PUBLISHED_HANDLERS } from "@events/application/events/event-domain-event.dispatcher";
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
    EventResolver,
    EventService,
    EventRepository,
    EventsApiService,
    EventDomainEventDispatcher,
    EventPublishedLoggingHandler,
    {
      provide: EVENT_PUBLISHED_HANDLERS,
      useFactory: (handler: EventPublishedLoggingHandler) => [handler],
      inject: [EventPublishedLoggingHandler],
    },
    { provide: EVENTS_API, useExisting: EventsApiService },
  ],
  exports: [EVENTS_API],
})
export class EventModule {}
