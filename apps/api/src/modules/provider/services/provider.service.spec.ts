import { Role } from "@prisma/client";
import { ProviderService } from "./provider.service";

describe("ProviderService Events boundary", () => {
  const prisma = {};
  const eventsApi = {
    providerEvents: jest.fn(),
    providerAttendees: jest.fn(),
    assertProviderOwnsEvent: jest.fn(),
  };
  const identityApi = { display: jest.fn() };
  const service = new ProviderService(
    prisma as never,
    eventsApi as never,
    identityApi as never,
  );
  const provider = { id: "provider-1", role: Role.PROVIDER };

  beforeEach(() => jest.clearAllMocks());

  it("loads the provider events table through the Events public API", async () => {
    eventsApi.providerEvents.mockResolvedValue({ items: [] });

    await service.eventsTable(provider, undefined, { take: 10 });

    expect(eventsApi.providerEvents).toHaveBeenCalledWith({
      providerId: "provider-1",
      status: undefined,
      search: undefined,
      cursor: undefined,
      take: 10,
    });
  });

  it("loads attendees through the Events public API", async () => {
    eventsApi.providerAttendees.mockResolvedValue({ items: [] });

    await service.attendees(provider, { eventId: "event-1" }, undefined);

    expect(eventsApi.providerAttendees).toHaveBeenCalledWith(
      expect.objectContaining({
        providerId: "provider-1",
        eventId: "event-1",
        take: 20,
      }),
    );
  });
});
