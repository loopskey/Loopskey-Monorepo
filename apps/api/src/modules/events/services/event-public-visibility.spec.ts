import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { EventStatus, Role } from "@prisma/client";

import { EventMessageCode } from "@events/enums/message-code.enum";
import { EventDomainEventDispatcher } from "@events/application/events/event-domain-event.dispatcher";
import { EventRepository } from "@events/infrastructure/persistence/event.repository";
import { PrismaService } from "@prisma/prisma.service";
import { EventService } from "./event.service";

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
    },
    $queryRaw: jest.fn().mockResolvedValue([]),
    $transaction: jest.fn((operations: Promise<unknown>[]) =>
      Promise.all(operations),
    ),
  };
  const repository = new EventRepository(prisma as unknown as PrismaService);
  const service = new EventService(repository, {
    publish: jest.fn(),
  } as unknown as EventDomainEventDispatcher);
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
