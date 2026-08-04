import { EventDomainEventDispatcher } from "@events/application/events/event-domain-event.dispatcher";
import { EVENT_PUBLISHED_V1 } from "@events/domain/events/event-published-v1";
import { EventMessageCode } from "@events/enums/message-code.enum";
import { EventRepository } from "@events/infrastructure/persistence/event.repository";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { EventStatus, Role } from "@prisma/client";
import { EventService } from "./event.service";

describe("EventService", () => {
  const repository = {
    findActiveById: jest.fn(),
    findRegistration: jest.fn(),
    register: jest.fn(),
    reactivateRegistration: jest.fn(),
    update: jest.fn(),
  };
  const dispatcher = { publish: jest.fn() };
  let service: EventService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [
        EventService,
        { provide: EventRepository, useValue: repository },
        { provide: EventDomainEventDispatcher, useValue: dispatcher },
      ],
    }).compile();
    service = moduleRef.get(EventService);
  });

  it("rejects registration when capacity is exhausted", async () => {
    repository.findActiveById.mockResolvedValue({
      id: "event-1",
      status: EventStatus.PUBLISHED,
      registrationEnabled: true,
      capacity: 10,
      attendees: 10,
    });

    await expect(
      service.registerEvent("event-1", {
        id: "professional-1",
        role: Role.PROFESSIONAL,
      }),
    ).rejects.toMatchObject<Partial<BadRequestException>>({
      message: EventMessageCode.EVENT_CAPACITY_REACHED,
    });
    expect(repository.register).not.toHaveBeenCalled();
  });

  it("prevents one provider from publishing another provider's event", async () => {
    repository.findActiveById.mockResolvedValue({
      id: "event-1",
      providerId: "provider-1",
      status: EventStatus.DRAFT,
    });

    await expect(
      service.publishEvent("event-1", {
        id: "provider-2",
        role: Role.PROVIDER,
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("reactivates a cancelled enrollment through Event-owned persistence", async () => {
    repository.findActiveById.mockResolvedValue({
      id: "event-1",
      status: EventStatus.PUBLISHED,
      registrationEnabled: true,
      capacity: 10,
      attendees: 2,
    });
    repository.findRegistration.mockResolvedValue({
      id: "registration-1",
      status: "CANCELLED",
    });

    await service.enrollInEvent("event-1", { id: "professional-1" });

    expect(repository.reactivateRegistration).toHaveBeenCalledWith(
      "registration-1",
      "event-1",
    );
    expect(repository.register).not.toHaveBeenCalled();
  });

  it("publishes EventPublished.v1 after the state is committed", async () => {
    repository.findActiveById.mockResolvedValue({
      id: "event-1",
      providerId: "provider-1",
      status: EventStatus.DRAFT,
    });
    repository.update.mockResolvedValue({
      id: "event-1",
      providerId: "provider-1",
      status: EventStatus.PUBLISHED,
    });

    await service.publishEvent("event-1", {
      id: "provider-1",
      role: Role.PROVIDER,
    });

    expect(repository.update.mock.invocationCallOrder[0]).toBeLessThan(
      dispatcher.publish.mock.invocationCallOrder[0],
    );
    expect(dispatcher.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        eventName: EVENT_PUBLISHED_V1,
        schemaVersion: 1,
        eventId: "event-1",
        providerId: "provider-1",
      }),
    );
  });
});
