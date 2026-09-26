import { Injectable, Logger } from "@nestjs/common";

export type OutboxLane = "realtime" | "bulk";

export type OutboxEventContext = {
  readonly id: string;
  readonly eventName: string;
  readonly attemptCount: number;
  readonly idempotencyKey: string;
  readonly correlationId: string | null;
  readonly renewLease: () => Promise<void>;
};

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
  readonly lane: OutboxLane;
  readonly eventName: string;
  readonly handlerName: string;
  handle(payload: unknown, event: OutboxEventContext): Promise<void>;
  abandon?(payload: unknown, event: OutboxEventContext): Promise<void>;
}

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
      lane: handler.lane,
    });
  }
  resolve(eventName: string): OutboxHandler | null {
    return this.byEventName.get(eventName) ?? null;
  }

  eventNamesForLane(lane: OutboxLane): string[] {
    return [...this.byEventName.values()]
      .filter((handler) => handler.lane === lane)
      .map((handler) => handler.eventName);
  }
}
