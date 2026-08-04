import { Inject, Injectable, Logger } from "@nestjs/common";
import { EventPublishedV1 } from "@events/domain/events/event-published-v1";

export const EVENT_PUBLISHED_HANDLERS = Symbol("EVENT_PUBLISHED_HANDLERS");

export interface EventPublishedHandler {
  handle(event: EventPublishedV1): Promise<void> | void;
}

@Injectable()
export class EventDomainEventDispatcher {
  private readonly logger = new Logger(EventDomainEventDispatcher.name);

  constructor(
    @Inject(EVENT_PUBLISHED_HANDLERS)
    private readonly handlers: readonly EventPublishedHandler[],
  ) {}

  async publish(event: EventPublishedV1): Promise<void> {
    const results = await Promise.allSettled(
      this.handlers.map((handler) =>
        Promise.resolve().then(() => handler.handle(event)),
      ),
    );
    results.forEach((result) => {
      if (result.status === "rejected") {
        this.logger.error(
          `Best-effort handler failed for ${event.eventName}`,
          result.reason instanceof Error ? result.reason.stack : undefined,
        );
      }
    });
  }
}
