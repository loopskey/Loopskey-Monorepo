import { EventRegistrationStatus, EventStatus, Prisma } from "@prisma/client";
import { EventPaginationInput } from "@events/dtos/event-pagination.input";
import { EventSortDirection } from "@events/enums/event-register.enum";
import { EventFilterInput } from "@events/dtos/event-filter.input";
import { EventSortInput } from "@events/dtos/event-sort.input";
import { EventSortField } from "@events/enums/event-register.enum";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

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
