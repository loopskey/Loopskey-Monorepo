import { EventDomainEventDispatcher } from "@events/application/events/event-domain-event.dispatcher";
import { EVENT_PUBLISHED_V1 } from "@events/domain/events/event-published-v1";
import { EventMessageCode } from "@events/enums/message-code.enum";
import { EventRegistrationConflict } from "@events/domain/errors/event-registration-conflict.error";
import { EventRepository } from "@events/infrastructure/persistence/event.repository";
import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { EventStatus, Role } from "@prisma/client";
import { EventService } from "./event.service";

describe("EventService", () => {
  const repository = {
    findActiveById: jest.fn(),
    findRegistration: jest.fn(),
    activateRegistration: jest.fn(),
    cancelRegistration: jest.fn(),
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

  it("reports a capacity conflict from persistence as the domain code", async () => {
    // Capacity is settled by the atomic claim in persistence, not by a read
    // here, so the service's job is to translate the refusal rather than to
    // predict it.
    repository.findActiveById.mockResolvedValue({
      id: "event-1",
      status: EventStatus.PUBLISHED,
      registrationEnabled: true,
      capacity: 10,
      attendees: 10,
    });
    repository.activateRegistration.mockRejectedValue(
      new EventRegistrationConflict("CAPACITY_REACHED"),
    );

    await expect(
      service.registerEvent("event-1", {
        id: "professional-1",
        role: Role.PROFESSIONAL,
      }),
    ).rejects.toMatchObject<Partial<BadRequestException>>({
      message: EventMessageCode.EVENT_CAPACITY_REACHED,
    });
  });

  it("refuses a second registration for a seat the user already holds", async () => {
    repository.findActiveById.mockResolvedValue({
      id: "event-1",
      status: EventStatus.PUBLISHED,
      registrationEnabled: true,
      capacity: 10,
      attendees: 2,
    });
    repository.activateRegistration.mockResolvedValue({
      registration: { id: "registration-1" },
      activated: false,
    });

    await expect(
      service.registerEvent("event-1", {
        id: "professional-1",
        role: Role.PROFESSIONAL,
      }),
    ).rejects.toMatchObject<Partial<BadRequestException>>({
      message: EventMessageCode.EVENT_ALREADY_REGISTERED,
    });
  });

  it("returns the winning registration when a concurrent request created it", async () => {
    repository.findActiveById.mockResolvedValue({
      id: "event-1",
      status: EventStatus.PUBLISHED,
      registrationEnabled: true,
      capacity: 10,
      attendees: 2,
    });
    repository.activateRegistration.mockRejectedValue(
      new EventRegistrationConflict("ALREADY_REGISTERED"),
    );
    repository.findRegistration.mockResolvedValue({ id: "registration-1" });

    await expect(
      service.enrollInEvent("event-1", { id: "professional-1" }),
    ).resolves.toMatchObject({ id: "registration-1" });
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

  it("routes enrollment through one Event-owned activation", async () => {
    // Creating and reviving a registration are the same act as far as capacity
    // is concerned, so the service asks for the act rather than choosing which
    // write to make from a read that may already be stale.
    repository.findActiveById.mockResolvedValue({
      id: "event-1",
      status: EventStatus.PUBLISHED,
      registrationEnabled: true,
      capacity: 10,
      attendees: 2,
    });
    repository.activateRegistration.mockResolvedValue({
      registration: { id: "registration-1" },
      activated: true,
    });

    await service.enrollInEvent("event-1", { id: "professional-1" });

    expect(repository.activateRegistration).toHaveBeenCalledWith(
      "event-1",
      "professional-1",
    );
  });

  it("reports a missing registration when cancellation finds nothing", async () => {
    repository.cancelRegistration.mockResolvedValue(null);

    await expect(
      service.cancelEventRegistration("event-1", { id: "professional-1" }),
    ).rejects.toMatchObject({
      message: EventMessageCode.EVENT_REGISTRATION_NOT_FOUND,
    });
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
