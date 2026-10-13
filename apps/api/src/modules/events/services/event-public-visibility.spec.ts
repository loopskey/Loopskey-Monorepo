import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { EventStatus, Role } from "@prisma/client";

import { EventMessageCode } from "@events/enums/message-code.enum";
import { EventDomainEventDispatcher } from "@events/application/events/event-domain-event.dispatcher";
import { EventRepository } from "@events/infrastructure/persistence/event.repository";
import { PrismaService } from "@prisma/prisma.service";
import { EventService } from "./event.service";
import { EventViewSignalLimiter } from "./event-view-signal.limiter";

const NON_PUBLIC_STATUSES = [
  EventStatus.DRAFT,
  EventStatus.ARCHIVED,
  EventStatus.CANCELLED,
];
const PUBLIC_VISIBILITY = { status: EventStatus.PUBLISHED, deletedAt: null };

const setupRepository = () => {
  const prisma = {
    event: {
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      update: jest.fn(),
      updateMany: jest.fn(),
    },
    $queryRaw: jest.fn().mockResolvedValue([]),
    $transaction: jest.fn((operations: Promise<unknown>[]) =>
      Promise.all(operations),
    ),
  };
  const repository = new EventRepository(prisma as unknown as PrismaService);
  const service = new EventService(
    repository,
    { publish: jest.fn() } as unknown as EventDomainEventDispatcher,
    new EventViewSignalLimiter(),
  );
  return { prisma, service };
};

describe("EventService public visibility", () => {
  describe.each([
    ["findEventById", "id"],
    ["findEventBySlug", "slug"],
  ] as const)("%s", (method, field) => {
    it("filters on published, non-deleted events", async () => {
      const { service, prisma } = setupRepository();

      await expect(service[method]("event-1")).rejects.toBeInstanceOf(
        NotFoundException,
      );

      expect(prisma.event.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { [field]: "event-1", ...PUBLIC_VISIBILITY },
        }),
      );
    });

    it("answers a hidden event exactly like an unknown one, without counting a view", async () => {
      const { service, prisma } = setupRepository();

      const failure = await service[method]("missing").catch(
        (error: unknown) => error,
      );

      expect(failure).toBeInstanceOf(NotFoundException);
      expect((failure as NotFoundException).message).toBe(
        EventMessageCode.EVENT_NOT_FOUND,
      );
      expect(prisma.event.update).not.toHaveBeenCalled();
    });
  });

  describe.each(["findEventById", "findEventBySlug"] as const)(
    "%s on a published event",
    (method) => {
      it("returns the event without writing anything", async () => {
        const { service, prisma } = setupRepository();
        prisma.event.findFirst.mockResolvedValue({ id: "event-1" });

        await expect(service[method]("event-1")).resolves.toEqual({
          id: "event-1",
        });

        expect(prisma.event.update).not.toHaveBeenCalled();
        expect(prisma.event.updateMany).not.toHaveBeenCalled();
      });
    },
  );

  describe("recordEventView", () => {
    it("counts a view of a published event once per viewer window", async () => {
      const { service, prisma } = setupRepository();
      prisma.event.updateMany.mockResolvedValue({ count: 1 });

      await expect(
        service.recordEventView("event-1", "viewer-1"),
      ).resolves.toBe(true);
      await expect(
        service.recordEventView("event-1", "viewer-1"),
      ).resolves.toBe(false);

      expect(prisma.event.updateMany).toHaveBeenCalledTimes(1);
      expect(prisma.event.updateMany).toHaveBeenCalledWith({
        where: { id: "event-1", ...PUBLIC_VISIBILITY },
        data: { views: { increment: 1 } },
      });
    });

    it("counts nothing for a hidden or unknown event", async () => {
      const { service, prisma } = setupRepository();
      prisma.event.updateMany.mockResolvedValue({ count: 0 });

      await expect(service.recordEventView("hidden", "viewer-1")).resolves.toBe(
        false,
      );
    });

    it("counts the same event separately for different viewers", async () => {
      const { service, prisma } = setupRepository();
      prisma.event.updateMany.mockResolvedValue({ count: 1 });

      await service.recordEventView("event-1", "viewer-1");
      await service.recordEventView("event-1", "viewer-2");

      expect(prisma.event.updateMany).toHaveBeenCalledTimes(2);
    });
  });

  describe("findEvents", () => {
    it.each(NON_PUBLIC_STATUSES)(
      "rejects an explicit %s status",
      async (status) => {
        const { service, prisma } = setupRepository();

        expect(() => service.findEvents({ status })).toThrow(
          ForbiddenException,
        );
        expect(() => service.findEvents({ status, search: "design" })).toThrow(
          ForbiddenException,
        );

        expect(prisma.event.findMany).not.toHaveBeenCalled();
        expect(prisma.$queryRaw).not.toHaveBeenCalled();
      },
    );

    it.each([undefined, EventStatus.PUBLISHED])(
      "lists published events when the status is %s",
      async (status) => {
        const { service, prisma } = setupRepository();

        await service.findEvents({ status });

        expect(prisma.event.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining(PUBLIC_VISIBILITY),
          }),
        );
      },
    );

    it("searches only published events", async () => {
      const { service, prisma } = setupRepository();

      await service.findEvents({ search: "design" });

      const [, ...values] = prisma.$queryRaw.mock.calls[0] as unknown[];
      expect(values).toContain(EventStatus.PUBLISHED);
      for (const status of NON_PUBLIC_STATUSES)
        expect(values).not.toContain(status);
    });
  });

  describe("featured and upcoming events", () => {
    it.each(["findFeaturedEvents", "findUpcomingEvents"] as const)(
      "%s returns only published, non-deleted events",
      async (method) => {
        const { service, prisma } = setupRepository();

        await service[method]();

        expect(prisma.event.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining(PUBLIC_VISIBILITY),
          }),
        );
      },
    );
  });

  describe("findMyProviderEvents", () => {
    it.each(NON_PUBLIC_STATUSES)(
      "lets the owning provider list their %s events",
      async (status) => {
        const { service, prisma } = setupRepository();

        await service.findMyProviderEvents(
          { id: "provider-1", role: Role.PROVIDER },
          { status, providerId: "provider-2" },
        );

        expect(prisma.event.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              status,
              providerId: "provider-1",
              deletedAt: null,
            }),
          }),
        );
      },
    );

    it("lets an admin list any provider's drafts", async () => {
      const { service, prisma } = setupRepository();

      await service.findMyProviderEvents(
        { id: "admin-1", role: Role.ADMIN },
        { status: EventStatus.DRAFT, providerId: "provider-2" },
      );

      expect(prisma.event.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: EventStatus.DRAFT,
            providerId: "provider-2",
          }),
        }),
      );
    });

    it.each([Role.PROFESSIONAL, Role.ORGANIZATION])(
      "refuses the %s role",
      (role) => {
        const { service, prisma } = setupRepository();

        expect(() =>
          service.findMyProviderEvents(
            { id: "user-1", role },
            { status: EventStatus.DRAFT },
          ),
        ).toThrow(ForbiddenException);

        expect(prisma.event.findMany).not.toHaveBeenCalled();
      },
    );
  });
});
