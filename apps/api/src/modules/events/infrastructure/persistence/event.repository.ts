import { EventRegistrationStatus, EventStatus, Prisma } from "@prisma/client";
import { EventPaginationInput } from "@events/dtos/event-pagination.input";
import { EventSortDirection } from "@events/enums/event-register.enum";
import { EventFilterInput } from "@events/dtos/event-filter.input";
import { EventSortInput } from "@events/dtos/event-sort.input";
import { EventSortField } from "@events/enums/event-register.enum";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

import type { ProviderAttendeesQuery } from "@events/public/events-api";
import type { RoadmapCandidateQuery } from "@events/public/events-api";
import type { ProviderEventsQuery } from "@events/public/events-api";

@Injectable()
export class EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.EventUncheckedCreateInput) {
    return this.prisma.event.create({ data });
  }

  update(eventId: string, data: Prisma.EventUpdateInput) {
    return this.prisma.event.update({ where: { id: eventId }, data });
  }

  findActiveById(eventId: string) {
    return this.prisma.event.findFirst({
      where: { id: eventId, deletedAt: null },
    });
  }

  findById(eventId: string) {
    return this.prisma.event.findUnique({ where: { id: eventId } });
  }

  findActiveByIdWithSchedule(eventId: string) {
    return this.prisma.event.findFirst({
      where: { id: eventId, deletedAt: null },
      include: {
        scheduleItems: {
          orderBy: [{ dayNumber: "asc" }, { startTime: "asc" }],
        },
      },
    });
  }

  findActiveBySlugWithSchedule(slug: string) {
    return this.prisma.event.findFirst({
      where: { slug, deletedAt: null },
      include: {
        scheduleItems: {
          orderBy: [{ dayNumber: "asc" }, { startTime: "asc" }],
        },
      },
    });
  }

  incrementViews(eventId: string) {
    return this.update(eventId, { views: { increment: 1 } });
  }

  findUpcoming(take: number) {
    return this.prisma.event.findMany({
      where: {
        status: EventStatus.PUBLISHED,
        deletedAt: null,
        startDate: { gte: new Date() },
      },
      take: Math.min(take, 50),
      orderBy: { startDate: "asc" },
    });
  }

  findFeatured(take: number) {
    return this.prisma.event.findMany({
      where: { status: EventStatus.PUBLISHED, deletedAt: null },
      take: Math.min(take, 50),
      orderBy: [
        { averageRating: "desc" },
        { attendees: "desc" },
        { views: "desc" },
      ],
    });
  }

  async findPage(
    filter?: EventFilterInput,
    pagination?: EventPaginationInput,
    sort?: EventSortInput,
  ) {
    const take = Math.min(pagination?.take ?? 20, 100);
    const where = this.buildWhere(filter);
    const [items, totalCount] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        where,
        take: take + 1,
        cursor: pagination?.cursor ? { id: pagination.cursor } : undefined,
        skip: pagination?.cursor ? 1 : 0,
        orderBy: this.buildOrderBy(sort),
      }),
      this.prisma.event.count({ where }),
    ]);
    const hasNextPage = items.length > take;
    const slicedItems = hasNextPage ? items.slice(0, take) : items;
    return {
      items: slicedItems,
      totalCount,
      pageInfo: {
        hasNextPage,
        nextCursor: hasNextPage
          ? slicedItems[slicedItems.length - 1]?.id
          : null,
      },
    };
  }

  async search(filter?: EventFilterInput, pagination?: EventPaginationInput) {
    const take = Math.min(pagination?.take ?? 20, 100);
    const search = filter?.search?.trim() ?? "";
    const cursor = pagination?.cursor ?? null;
    const status = filter?.status ?? EventStatus.PUBLISHED;
    const fromDate = filter?.fromDate ? new Date(filter.fromDate) : null;
    const toDate = filter?.toDate ? new Date(filter.toDate) : null;
    const rows = await this.prisma.$queryRaw<Array<EventSearchRow>>`
      WITH ranked_events AS (
        SELECT
          e.*,
          GREATEST(
            similarity(e."title", ${search}),
            similarity(COALESCE(e."speaker", ''), ${search}),
            similarity(COALESCE(e."organizer", ''), ${search}),
            similarity(e."description", ${search}),
            similarity(COALESCE(e."location", ''), ${search})
          ) AS "searchRank"
        FROM "Event" e
        WHERE e."deletedAt" IS NULL
          AND e."status" = ${status}::"EventStatus"
          AND (${filter?.type ?? null}::"EventType" IS NULL OR e."type" = ${filter?.type ?? null}::"EventType")
          AND (${filter?.deliveryMode ?? null}::"EventDeliveryMode" IS NULL OR e."deliveryMode" = ${filter?.deliveryMode ?? null}::"EventDeliveryMode")
          AND (${filter?.category ?? null}::"EventCategory" IS NULL OR e."category" = ${filter?.category ?? null}::"EventCategory")
          AND (${filter?.isFree ?? null}::boolean IS NULL OR e."isFree" = ${filter?.isFree ?? null}::boolean)
          AND (${filter?.providerId ?? null}::text IS NULL OR e."providerId" = ${filter?.providerId ?? null}::text)
          AND (${fromDate}::timestamp IS NULL OR e."startDate" >= ${fromDate}::timestamp)
          AND (${toDate}::timestamp IS NULL OR e."startDate" <= ${toDate}::timestamp)
          AND (
            e."title" ILIKE '%' || ${search} || '%'
            OR COALESCE(e."speaker", '') ILIKE '%' || ${search} || '%'
            OR COALESCE(e."organizer", '') ILIKE '%' || ${search} || '%'
            OR e."description" ILIKE '%' || ${search} || '%'
            OR COALESCE(e."location", '') ILIKE '%' || ${search} || '%'
            OR e."title" % ${search}
            OR COALESCE(e."speaker", '') % ${search}
            OR COALESCE(e."organizer", '') % ${search}
            OR e."description" % ${search}
            OR COALESCE(e."location", '') % ${search}
          )
          AND (${cursor}::text IS NULL OR e."id" > ${cursor}::text)
      )
      SELECT ranked_events.*, COUNT(*) OVER() AS "totalCount"
      FROM ranked_events
      ORDER BY "searchRank" DESC, "startDate" ASC, "id" DESC
      LIMIT ${take + 1};
    `;
    const hasNextPage = rows.length > take;
    const slicedRows = hasNextPage ? rows.slice(0, take) : rows;
    return {
      items: slicedRows.map(
        ({ searchRank: _rank, totalCount: _total, ...event }) => ({
          ...event,
          price: event.price ? Number(event.price) : null,
        }),
      ),
      totalCount: rows[0]?.totalCount ? Number(rows[0].totalCount) : 0,
      pageInfo: {
        hasNextPage,
        nextCursor: hasNextPage ? slicedRows[slicedRows.length - 1]?.id : null,
      },
    };
  }

  findRegistration(eventId: string, userId: string) {
    return this.prisma.eventRegistration.findUnique({
      where: { eventId_userId: { eventId, userId } },
    });
  }

  register(eventId: string, userId: string) {
    return this.prisma.$transaction(async (tx) => {
      const registration = await tx.eventRegistration.create({
        data: {
          eventId,
          userId,
          status: EventRegistrationStatus.REGISTERED,
        },
      });
      await tx.event.update({
        where: { id: eventId },
        data: { attendees: { increment: 1 } },
      });
      return registration;
    });
  }

  cancelRegistration(registrationId: string, eventId: string) {
    return this.prisma.$transaction(async (tx) => {
      const registration = await tx.eventRegistration.update({
        where: { id: registrationId },
        data: { status: EventRegistrationStatus.CANCELLED },
      });
      await tx.event.update({
        where: { id: eventId },
        data: { attendees: { decrement: 1 } },
      });
      return registration;
    });
  }

  reactivateRegistration(registrationId: string, eventId: string) {
    return this.prisma.$transaction(async (tx) => {
      const registration = await tx.eventRegistration.update({
        where: { id: registrationId },
        data: { status: EventRegistrationStatus.REGISTERED },
      });
      await tx.event.update({
        where: { id: eventId },
        data: { attendees: { increment: 1 } },
      });
      return registration;
    });
  }

  registrationsForUser(userId: string) {
    return this.prisma.eventRegistration.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }

  findActiveOwnedByProvider(eventId: string, providerId: string) {
    return this.prisma.event.findFirst({
      where: { id: eventId, providerId, deletedAt: null },
      select: { id: true },
    });
  }

  async providerOverview(providerId: string, start: Date, end: Date) {
    const [
      totalEvents,
      published,
      draft,
      archived,
      cancelled,
      totalRegistrations,
      views,
      upcomingSessions,
    ] = await Promise.all([
      this.prisma.event.count({ where: { providerId, deletedAt: null } }),
      this.prisma.event.count({
        where: { providerId, status: EventStatus.PUBLISHED, deletedAt: null },
      }),
      this.prisma.event.count({
        where: { providerId, status: EventStatus.DRAFT, deletedAt: null },
      }),
      this.prisma.event.count({
        where: { providerId, status: EventStatus.ARCHIVED, deletedAt: null },
      }),
      this.prisma.event.count({
        where: { providerId, status: EventStatus.CANCELLED, deletedAt: null },
      }),
      this.prisma.eventRegistration.count({
        where: { event: { providerId }, createdAt: { gte: start, lte: end } },
      }),
      this.prisma.event.aggregate({
        where: { providerId, deletedAt: null },
        _sum: { views: true },
      }),
      this.prisma.event.count({
        where: {
          providerId,
          deletedAt: null,
          startDate: { gte: new Date() },
          status: EventStatus.PUBLISHED,
        },
      }),
    ]);
    return {
      totalEvents,
      totalRegistrations,
      totalViews: views._sum.views ?? 0,
      published,
      draft,
      archived,
      cancelled,
      upcomingSessions,
    };
  }

  async providerAnalyticsEvents(providerId: string, start: Date, end: Date) {
    const events = await this.prisma.event.findMany({
      where: { providerId, deletedAt: null },
      select: {
        id: true,
        title: true,
        price: true,
        isFree: true,
        views: true,
        type: true,
        pduCategory: true,
        averageRating: true,
        registrations: {
          where: {
            createdAt: { gte: start, lte: end },
            status: {
              in: [
                EventRegistrationStatus.REGISTERED,
                EventRegistrationStatus.ATTENDED,
                EventRegistrationStatus.COMPLETED,
              ],
            },
          },
          select: { id: true, createdAt: true, status: true },
        },
      },
    });
    return events.map((event) => ({
      ...event,
      type: String(event.type),
      pduCategory: event.pduCategory ? String(event.pduCategory) : null,
      price: Number(event.price ?? 0),
      registrations: event.registrations.map((registration) => ({
        ...registration,
        status: String(registration.status),
      })),
    }));
  }

  async providerAttendees(query: ProviderAttendeesQuery) {
    const take = Math.min(Math.max(query.take, 1), 100);
    const status = query.status as EventRegistrationStatus | undefined;
    const baseWhere: Prisma.EventRegistrationWhereInput = {
      event: { providerId: query.providerId },
    };
    const where: Prisma.EventRegistrationWhereInput = {
      ...baseWhere,
      eventId: query.eventId,
      status,
      OR: query.search
        ? [
            {
              user: {
                fullName: { contains: query.search, mode: "insensitive" },
              },
            },
            {
              user: { email: { contains: query.search, mode: "insensitive" } },
            },
            {
              event: { title: { contains: query.search, mode: "insensitive" } },
            },
          ]
        : undefined,
    };
    const [rows, totalCount, totalRegistered, confirmed, attended] =
      await Promise.all([
        this.prisma.eventRegistration.findMany({
          where,
          take: take + 1,
          cursor: query.cursor ? { id: query.cursor } : undefined,
          skip: query.cursor ? 1 : 0,
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, fullName: true, email: true } },
            event: { select: { id: true, title: true } },
          },
        }),
        this.prisma.eventRegistration.count({ where }),
        this.prisma.eventRegistration.count({ where: baseWhere }),
        this.prisma.eventRegistration.count({
          where: {
            ...baseWhere,
            status: {
              in: [
                EventRegistrationStatus.REGISTERED,
                EventRegistrationStatus.ATTENDED,
                EventRegistrationStatus.COMPLETED,
              ],
            },
          },
        }),
        this.prisma.eventRegistration.count({
          where: {
            ...baseWhere,
            status: {
              in: [
                EventRegistrationStatus.ATTENDED,
                EventRegistrationStatus.COMPLETED,
              ],
            },
          },
        }),
      ]);
    const hasNextPage = rows.length > take;
    const items = rows.slice(0, take);
    return {
      totalCount,
      stats: {
        totalRegistered,
        confirmed,
        attended,
        attendanceRate:
          confirmed > 0 ? Number(((attended / confirmed) * 100).toFixed(2)) : 0,
      },
      pageInfo: {
        hasNextPage,
        nextCursor: hasNextPage ? (items.at(-1)?.id ?? null) : null,
      },
      items: items.map((item) => ({
        userId: item.userId,
        status: item.status,
        eventId: item.eventId,
        registrationId: item.id,
        attendedAt: item.attendedAt,
        completedAt: item.completedAt,
        email: item.user?.email ?? null,
        registrationDate: item.createdAt,
        name: item.user?.fullName ?? null,
        eventTitle: item.event?.title ?? "",
      })),
    };
  }

  async providerEvents(query: ProviderEventsQuery) {
    const take = Math.min(Math.max(query.take, 1), 100);
    const where: Prisma.EventWhereInput = {
      providerId: query.providerId,
      deletedAt: null,
      status: query.status as EventStatus | undefined,
      title: query.search
        ? { contains: query.search, mode: "insensitive" }
        : undefined,
    };
    const [rows, totalCount] = await Promise.all([
      this.prisma.event.findMany({
        where,
        take: take + 1,
        cursor: query.cursor ? { id: query.cursor } : undefined,
        skip: query.cursor ? 1 : 0,
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { registrations: true } } },
      }),
      this.prisma.event.count({ where }),
    ]);
    const hasNextPage = rows.length > take;
    const items = rows.slice(0, take);
    return {
      totalCount,
      pageInfo: {
        hasNextPage,
        nextCursor: hasNextPage ? (items.at(-1)?.id ?? null) : null,
      },
      items: items.map((event) => ({
        id: event.id,
        title: event.title,
        startDate: event.startDate,
        status: event.status,
        registrants: event._count.registrations,
        views: event.views,
        pdu: event.pdu,
      })),
    };
  }

  async slugExists(slug: string): Promise<boolean> {
    return Boolean(await this.prisma.event.findUnique({ where: { slug } }));
  }

  private buildWhere(filter?: EventFilterInput): Prisma.EventWhereInput {
    const search = filter?.search?.trim();
    return {
      deletedAt: null,
      status: filter?.status ?? EventStatus.PUBLISHED,
      type: filter?.type,
      deliveryMode: filter?.deliveryMode,
      category: filter?.category,
      isFree: filter?.isFree,
      providerId: filter?.providerId,
      startDate: {
        gte: filter?.fromDate ? new Date(filter.fromDate) : undefined,
        lte: filter?.toDate ? new Date(filter.toDate) : undefined,
      },
      OR: search
        ? [
            { title: { contains: search, mode: "insensitive" } },
            { speaker: { contains: search, mode: "insensitive" } },
            { organizer: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { location: { contains: search, mode: "insensitive" } },
          ]
        : undefined,
    };
  }

  private buildOrderBy(
    sort?: EventSortInput,
  ): Prisma.EventOrderByWithRelationInput[] {
    const field = sort?.field ?? EventSortField.START_DATE;
    const direction = sort?.direction ?? EventSortDirection.ASC;
    return [
      { [field]: direction },
      { id: "desc" },
    ] as Prisma.EventOrderByWithRelationInput[];
  }

  async findCreditsByIds(eventIds: readonly string[]) {
    if (eventIds.length === 0) return [];
    return this.prisma.event.findMany({
      where: { id: { in: [...eventIds] }, deletedAt: null },
      select: { id: true, pdu: true },
    });
  }

  findRoadmapCandidates(query: RoadmapCandidateQuery) {
    const subjects = query.subjects.filter((subject) => subject.trim());
    return this.prisma.event.findMany({
      where: {
        deletedAt: null,
        status: EventStatus.PUBLISHED,
        startDate: { gte: new Date() },
        ...(query.freeOnly ? { isFree: true } : {}),
        ...(subjects.length
          ? {
              OR: subjects.flatMap((subject) => [
                { title: { contains: subject, mode: "insensitive" as const } },
                {
                  description: {
                    contains: subject,
                    mode: "insensitive" as const,
                  },
                },
                { topic: { contains: subject, mode: "insensitive" as const } },
              ]),
            }
          : {}),
      },
      select: {
        id: true,
        pdu: true,
        title: true,
        topic: true,
        isFree: true,
        category: true,
        startDate: true,
        attendees: true,
        description: true,
        ratingCount: true,
        specificTopic: true,
        averageRating: true,
      },
      orderBy: [
        { pdu: "desc" },
        { averageRating: "desc" },
        { attendees: "desc" },
        { id: "asc" },
      ],
      take: query.take,
    });
  }
}

type EventSearchRow = {
  id: string;
  slug: string;
  title: string;
  type: string;
  deliveryMode: string;
  category: string;
  status: string;
  imageUrl: string | null;
  speaker: string | null;
  organizer: string | null;
  description: string;
  startDate: Date;
  endDate: Date | null;
  timezone: string;
  location: string | null;
  onlineUrl: string | null;
  price: Prisma.Decimal | null;
  currency: string;
  isFree: boolean;
  pdu: number;
  capacity: number | null;
  attendees: number;
  views: number;
  rating: number;
  averageRating: number;
  ratingCount: number;
  registrationEnabled: boolean;
  providerId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  searchRank: number;
  totalCount: bigint;
};
