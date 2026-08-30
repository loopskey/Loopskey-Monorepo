import { EventRegistrationStatus, EventStatus, Role } from "@prisma/client";
import { INestApplication } from "@nestjs/common";
import { EventService } from "@events/services/event.service";
import { PrismaService } from "@prisma/prisma.service";
import {
  bootApp,
  fulfilled,
  reasonMessages,
  rejected,
  runTogether,
  suiteScope,
} from "../setup/concurrency";

const ATTENDING = [
  EventRegistrationStatus.REGISTERED,
  EventRegistrationStatus.ATTENDED,
  EventRegistrationStatus.COMPLETED,
];

const scope = suiteScope("capacity");

/**
 * Event capacity under real overlap.
 *
 * These assertions are about the database, not the response: a suite that only
 * checked which promises rejected would pass against an implementation that
 * oversells the room and reports success to everyone. Every test here ends by
 * reading the counter and the registration rows back.
 */
describe("Event capacity (concurrency e2e)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let events: EventService;
  let providerId: string;
  let attendeeIds: string[] = [];

  const createEvent = async (capacity: number | null) =>
    prisma.event.create({
      data: {
        providerId,
        capacity,
        title: scope.eventTitle(`seats-${capacity ?? "open"}`),
        description: "Capacity race",
        type: "WORKSHOP",
        deliveryMode: "LIVE_ONLINE",
        category: "TECHNOLOGY",
        status: EventStatus.PUBLISHED,
        registrationEnabled: true,
        startDate: new Date("2030-01-01T10:00:00.000Z"),
        isFree: true,
        slug: scope.eventSlug("event"),
      },
    });

  const attendeeCount = async (eventId: string) =>
    (await prisma.event.findUniqueOrThrow({ where: { id: eventId } })).attendees;

  const attendingRows = (eventId: string) =>
    prisma.eventRegistration.count({
      where: { eventId, status: { in: ATTENDING } },
    });

  beforeAll(async () => {
    ({ app, prisma } = await bootApp());
    events = app.get(EventService);
    await scope.cleanup(prisma);
    const provider = await prisma.user.create({
      data: {
        email: scope.email("capacity-provider"),
        role: Role.PROVIDER,
        status: "ACTIVE",
      },
    });
    providerId = provider.id;
    attendeeIds = await Promise.all(
      Array.from({ length: 20 }, async (_, index) => {
        const user = await prisma.user.create({
          data: {
            email: scope.email(`capacity-attendee-${index}`),
            role: Role.PROFESSIONAL,
            status: "ACTIVE",
          },
        });
        return user.id;
      }),
    );
  }, 120_000);

  afterAll(async () => {
    if (prisma) await scope.cleanup(prisma);
    await app?.close();
  }, 60_000);

  it("admits exactly one registration for the last remaining seat", async () => {
    const event = await createEvent(1);

    const results = await runTogether(8, (index) =>
      events.registerEvent(event.id, {
        id: attendeeIds[index],
        role: Role.PROFESSIONAL,
      }),
    );

    expect(fulfilled(results)).toHaveLength(1);
    expect(await attendeeCount(event.id)).toBe(1);
    expect(await attendingRows(event.id)).toBe(1);
    for (const message of reasonMessages(results))
      expect(message).toBe("EVENT_CAPACITY_REACHED");
  }, 60_000);

  it("never lets the attendee count exceed a finite capacity", async () => {
    const event = await createEvent(5);

    const results = await runTogether(20, (index) =>
      events.registerEvent(event.id, {
        id: attendeeIds[index],
        role: Role.PROFESSIONAL,
      }),
    );

    expect(fulfilled(results)).toHaveLength(5);
    expect(await attendeeCount(event.id)).toBe(5);
    expect(await attendingRows(event.id)).toBe(5);
  }, 60_000);

  it("hands the last seat of a partly full event to one of two racers", async () => {
    const event = await createEvent(2);
    await events.registerEvent(event.id, {
      id: attendeeIds[0],
      role: Role.PROFESSIONAL,
    });

    const results = await runTogether(2, (index) =>
      events.registerEvent(event.id, {
        id: attendeeIds[index + 1],
        role: Role.PROFESSIONAL,
      }),
    );

    expect(fulfilled(results)).toHaveLength(1);
    expect(await attendeeCount(event.id)).toBe(2);
  }, 60_000);

  it("reports a capacity conflict as a domain error, not a database error", async () => {
    const event = await createEvent(1);
    await events.registerEvent(event.id, {
      id: attendeeIds[0],
      role: Role.PROFESSIONAL,
    });

    await expect(
      events.registerEvent(event.id, {
        id: attendeeIds[1],
        role: Role.PROFESSIONAL,
      }),
    ).rejects.toThrow("EVENT_CAPACITY_REACHED");
  }, 60_000);

  it("refuses a second registration from a user who already holds a seat", async () => {
    const event = await createEvent(null);

    const results = await runTogether(6, () =>
      events.registerEvent(event.id, {
        id: attendeeIds[0],
        role: Role.PROFESSIONAL,
      }),
    );

    expect(fulfilled(results)).toHaveLength(1);
    expect(rejected(results)).toHaveLength(5);
    for (const message of reasonMessages(results))
      expect(message).toBe("EVENT_ALREADY_REGISTERED");
    expect(await attendeeCount(event.id)).toBe(1);
    expect(await attendingRows(event.id)).toBe(1);
  }, 60_000);

  it("counts a repeated enrollment once, however many arrive at the same time", async () => {
    const event = await createEvent(null);

    const results = await runTogether(6, () =>
      events.enrollInEvent(event.id, { id: attendeeIds[1] }),
    );

    expect(rejected(results)).toHaveLength(0);
    expect(await attendeeCount(event.id)).toBe(1);
    expect(await attendingRows(event.id)).toBe(1);
  }, 60_000);

  it("decrements once for concurrent cancellations and never goes negative", async () => {
    const event = await createEvent(null);
    await events.enrollInEvent(event.id, { id: attendeeIds[2] });

    const results = await runTogether(6, () =>
      events.cancelEventRegistration(event.id, { id: attendeeIds[2] }),
    );

    expect(rejected(results)).toHaveLength(0);
    expect(await attendeeCount(event.id)).toBe(0);
    expect(await attendingRows(event.id)).toBe(0);
  }, 60_000);

  it("reactivates a cancelled registration exactly once", async () => {
    const event = await createEvent(null);
    await events.enrollInEvent(event.id, { id: attendeeIds[3] });
    await events.cancelEventRegistration(event.id, { id: attendeeIds[3] });
    expect(await attendeeCount(event.id)).toBe(0);

    const results = await runTogether(6, () =>
      events.enrollInEvent(event.id, { id: attendeeIds[3] }),
    );

    expect(rejected(results)).toHaveLength(0);
    expect(await attendeeCount(event.id)).toBe(1);
    expect(await attendingRows(event.id)).toBe(1);
    expect(
      await prisma.eventRegistration.count({ where: { eventId: event.id } }),
    ).toBe(1);
  }, 60_000);

  it("keeps a reactivation inside capacity", async () => {
    const event = await createEvent(1);
    await events.enrollInEvent(event.id, { id: attendeeIds[4] });
    await events.cancelEventRegistration(event.id, { id: attendeeIds[4] });
    await events.enrollInEvent(event.id, { id: attendeeIds[5] });

    await expect(
      events.enrollInEvent(event.id, { id: attendeeIds[4] }),
    ).rejects.toThrow("EVENT_CAPACITY_REACHED");
    expect(await attendeeCount(event.id)).toBe(1);
  }, 60_000);

  it("reports a missing registration rather than moving the counter", async () => {
    const event = await createEvent(null);

    await expect(
      events.cancelEventRegistration(event.id, { id: attendeeIds[6] }),
    ).rejects.toThrow("EVENT_REGISTRATION_NOT_FOUND");
    expect(await attendeeCount(event.id)).toBe(0);
  }, 60_000);
});
