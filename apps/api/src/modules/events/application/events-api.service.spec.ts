import { EventsApiService } from "./events-api.service";
import { EventService } from "@events/services/event.service";
import { Test } from "@nestjs/testing";

describe("EventsApiService", () => {
  const eventService = {
    enrollInEvent: jest.fn(),
    cancelEventRegistration: jest.fn(),
    resolveForEngagement: jest.fn(),
    updateEngagementRating: jest.fn(),
    providerOverview: jest.fn(),
    providerAnalyticsEvents: jest.fn(),
    providerAttendees: jest.fn(),
    providerEvents: jest.fn(),
    assertProviderOwnsEvent: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it("routes registration through the Event-owned use case", async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        EventsApiService,
        { provide: EventService, useValue: eventService },
      ],
    }).compile();
    eventService.enrollInEvent.mockResolvedValue({ id: "registration-1" });

    await moduleRef.get(EventsApiService).enrollInEvent({
      eventId: "event-1",
      userId: "user-1",
    });

    expect(eventService.enrollInEvent).toHaveBeenCalledWith("event-1", {
      id: "user-1",
    });
  });

  it("delegates engagement reads and rating writes to Events", async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        EventsApiService,
        { provide: EventService, useValue: eventService },
      ],
    }).compile();
    eventService.resolveForEngagement.mockResolvedValue({ id: "event-1" });
    const service = moduleRef.get(EventsApiService);

    await service.resolveEvent("event-1");
    await service.updateEventRating("event-1", 4.25, 4);

    expect(eventService.resolveForEngagement).toHaveBeenCalledWith("event-1");
    expect(eventService.updateEngagementRating).toHaveBeenCalledWith(
      "event-1",
      4.25,
      4,
    );
  });

  it("delegates provider projections to Event-owned queries", async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        EventsApiService,
        { provide: EventService, useValue: eventService },
      ],
    }).compile();
    const service = moduleRef.get(EventsApiService);
    const query = { providerId: "provider-1", take: 20 };

    await service.providerEvents(query);
    await service.providerAttendees(query);
    await service.assertProviderOwnsEvent("provider-1", "event-1");

    expect(eventService.providerEvents).toHaveBeenCalledWith(query);
    expect(eventService.providerAttendees).toHaveBeenCalledWith(query);
    expect(eventService.assertProviderOwnsEvent).toHaveBeenCalledWith(
      "provider-1",
      "event-1",
    );
  });
});
