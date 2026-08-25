import { Injectable, Logger } from "@nestjs/common";

export type OutboxEventContext = {
  readonly id: string;
  readonly eventName: string;
  readonly attemptCount: number;
  readonly correlationId: string | null;
};

/**
 * Thrown by a handler that wants the event retried, but no sooner than a wait it
 * names. Ordinary failures get the processor's exponential backoff; this exists
 * for the case where an external service told us exactly how long to wait, and
 * retrying earlier would only convert our own load into more rejections.
 */
export class OutboxDeferral extends Error {
  constructor(
    readonly seconds: number,
    message: string,
  ) {
    super(message);
    this.name = "OutboxDeferral";
  }
}

export interface OutboxHandler {
  /** The event this handler consumes. One handler per event name. */
  readonly eventName: string;
  /**
   * Identifies this handler in the delivery table. Carries a version suffix so
   * a later handler can reprocess events an earlier one already saw.
   */
  readonly handlerName: string;
  handle(payload: unknown, event: OutboxEventContext): Promise<void>;
  /**
   * Called once, after the processor has given up on the event for good. It is
   * the handler's chance to leave the domain in a state a user can act on
   * rather than one that merely stopped moving.
   */
  abandon?(payload: unknown, event: OutboxEventContext): Promise<void>;
}

/**
 * Where handlers announce themselves.
 *
 * The processor used to name its handlers in an if/else, which meant only
 * modules the processor could import were allowed to have one. Registration
 * inverts that: a domain module owns its handler and hands it over at boot, so
 * the processor stays a scheduler and never learns what a roadmap is.
 */
@Injectable()
export class OutboxHandlerRegistry {
  private readonly logger = new Logger(OutboxHandlerRegistry.name);
  private readonly byEventName = new Map<string, OutboxHandler>();

  register(handler: OutboxHandler) {
    const existing = this.byEventName.get(handler.eventName);
    if (existing && existing !== handler)
      throw new Error(
        `Two handlers claim ${handler.eventName}: ${existing.handlerName} and ${handler.handlerName}.`,
      );
    this.byEventName.set(handler.eventName, handler);
    this.logger.log("Outbox handler registered", {
      eventName: handler.eventName,
      handlerName: handler.handlerName,
    });
  }
  resolve(eventName: string): OutboxHandler | null {
    return this.byEventName.get(eventName) ?? null;
  }
}
