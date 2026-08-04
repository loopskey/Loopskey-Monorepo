import {
  EVENT_PUBLISHED_HANDLERS,
  EventDomainEventDispatcher,
  type EventPublishedHandler,
} from "./event-domain-event.dispatcher";
import {
  EVENT_PUBLISHED_V1,
  type EventPublishedV1,
} from "@events/domain/events/event-published-v1";
import { Test } from "@nestjs/testing";
import { Logger } from "@nestjs/common";

describe("EventDomainEventDispatcher", () => {
  it("delivers EventPublished.v1 to every handler", async () => {
    const handler: EventPublishedHandler = { handle: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        EventDomainEventDispatcher,
        { provide: EVENT_PUBLISHED_HANDLERS, useValue: [handler] },
      ],
    }).compile();

    const event: EventPublishedV1 = {
      eventName: EVENT_PUBLISHED_V1,
      schemaVersion: 1 as const,
      eventId: "event-1",
      providerId: "provider-1",
      occurredAt: "2026-08-03T00:00:00.000Z",
      correlationId: "correlation-1",
    };
    await moduleRef.get(EventDomainEventDispatcher).publish(event);

    expect(handler.handle).toHaveBeenCalledWith(event);
  });

  it("makes handler failure explicit without failing committed publication", async () => {
    jest.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
    const failed: EventPublishedHandler = {
      handle: jest.fn(() => {
        throw new Error("handler failed");
      }),
    };
    const successful: EventPublishedHandler = { handle: jest.fn() };
    const moduleRef = await Test.createTestingModule({
      providers: [
        EventDomainEventDispatcher,
        {
          provide: EVENT_PUBLISHED_HANDLERS,
          useValue: [failed, successful],
        },
      ],
    }).compile();

    await expect(
      moduleRef.get(EventDomainEventDispatcher).publish({
        eventName: EVENT_PUBLISHED_V1,
        schemaVersion: 1,
        eventId: "event-1",
        providerId: null,
        occurredAt: "2026-08-03T00:00:00.000Z",
        correlationId: "correlation-1",
      }),
    ).resolves.toBeUndefined();
    expect(successful.handle).toHaveBeenCalledTimes(1);
  });
});
