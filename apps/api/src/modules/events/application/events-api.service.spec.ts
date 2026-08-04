import { EventsApiService } from "./events-api.service";
import { EventService } from "@events/services/event.service";
import { Test } from "@nestjs/testing";

describe("EventsApiService", () => {
  const eventService = {
    enrollInEvent: jest.fn(),
    cancelEventRegistration: jest.fn(),
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
});
