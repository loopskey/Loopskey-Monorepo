import { EventPublishedHandler } from "@events/application/events/event-domain-event.dispatcher";
import { Injectable, Logger } from "@nestjs/common";
import { EventPublishedV1 } from "@events/domain/events/event-published-v1";

@Injectable()
export class EventPublishedLoggingHandler implements EventPublishedHandler {
  private readonly logger = new Logger(EventPublishedLoggingHandler.name);

  handle(event: EventPublishedV1): void {
    this.logger.log(
      `${event.eventName} eventId=${event.eventId} providerId=${event.providerId ?? "admin"} correlationId=${event.correlationId}`,
    );
  }
}
