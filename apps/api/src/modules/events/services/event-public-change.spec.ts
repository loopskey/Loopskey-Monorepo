import { EventStatus, Role } from "@prisma/client";

import { EventDomainEventDispatcher } from "@events/application/events/event-domain-event.dispatcher";
import { EventRepository } from "@events/infrastructure/persistence/event.repository";
import { PrismaService } from "@prisma/prisma.service";
import { EventService } from "./event.service";
import { EventViewSignalLimiter } from "./event-view-signal.limiter";

const PROVIDER = { id: "provider-1", role: Role.PROVIDER };
const EXISTING = {
  id: "event-1",
  providerId: PROVIDER.id,
  status: EventStatus.DRAFT,
};

const setup = () => {
  const prisma = {
    event: {
      findFirst: jest.fn().mockResolvedValue(EXISTING),
      findUnique: jest.fn().mockResolvedValue(EXISTING),
      update: jest.fn().mockResolvedValue(EXISTING),
      updateMany: jest.fn().mockResolvedValue({ count: 1 }),
    },
    eventRegistration: { count: jest.fn().mockResolvedValue(3) },
  };
  const repository = new EventRepository(prisma as unknown as PrismaService);
  const service = new EventService(
    repository,
    { publish: jest.fn() } as unknown as EventDomainEventDispatcher,
    new EventViewSignalLimiter(),
  );
  return { prisma, service };
};

const stampedAt = (prisma: ReturnType<typeof setup>["prisma"]) => {
  const [call] = prisma.event.update.mock.calls;
  return (call[0] as { data: { publicContentUpdatedAt?: Date } }).data
    .publicContentUpdatedAt;
};

describe("EventService public content change timestamp", () => {
  it.each([
    "publishEvent",
    "archiveEvent",
    "cancelEvent",
    "softDeleteEvent",
    "restoreEvent",
  ] as const)("moves the timestamp on %s", async (method) => {
    const { service, prisma } = setup();

    await service[method]("event-1", PROVIDER);

    expect(stampedAt(prisma)).toBeInstanceOf(Date);
  });

  it("moves the timestamp when public content is edited", async () => {
    const { service, prisma } = setup();

    await service.updateEvent(
      { eventId: "event-1", title: "Renamed" },
      PROVIDER,
    );

    expect(stampedAt(prisma)).toBeInstanceOf(Date);
  });

  it("leaves the timestamp alone when a view is counted", async () => {
    const { prisma } = setup();
    const repository = new EventRepository(prisma as unknown as PrismaService);

    await repository.incrementPublishedViews("event-1");

    expect(prisma.event.updateMany).toHaveBeenCalledWith({
      where: { id: "event-1", status: EventStatus.PUBLISHED, deletedAt: null },
      data: { views: { increment: 1 } },
    });
    expect(prisma.event.update).not.toHaveBeenCalled();
  });

  it.each([
    [
      "a rating recomputation",
      (repository: EventRepository) =>
        repository.updateRating("event-1", 4.5, 10),
    ],
    [
      "an attendee reconciliation",
      (repository: EventRepository) =>
        repository.reconcileAttendeeCount("event-1"),
    ],
  ])("leaves the timestamp alone on %s", async (_name, act) => {
    const { prisma } = setup();
    const repository = new EventRepository(prisma as unknown as PrismaService);

    await act(repository);

    expect(stampedAt(prisma)).toBeUndefined();
  });
});
