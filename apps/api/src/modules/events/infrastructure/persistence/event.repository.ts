import { EventRegistrationStatus, EventStatus, Prisma } from "@prisma/client";
import { EventRegistrationConflict } from "@events/domain/errors/event-registration-conflict.error";
import { EventPaginationInput } from "@events/dtos/event-pagination.input";
import { EventSortDirection } from "@events/enums/event-register.enum";
import { ATTENDING_STATUSES } from "@events/domain/policies/registration-attendance.policy";
import { EventRatingWriter } from "@events/public/events-api";
import { EventFilterInput } from "@events/dtos/event-filter.input";
import { VACATED_STATUSES } from "@events/domain/policies/registration-attendance.policy";
import { EventSortInput } from "@events/dtos/event-sort.input";
import { EventSortField } from "@events/enums/event-register.enum";
import { EventCategory } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";

import type { ProviderAttendeesQuery } from "@events/public/events-api";
import type { RoadmapCandidateQuery } from "@events/public/events-api";
import type { EventCatalogSearchRow } from "@events/types/event-service.types";
import type { ProviderEventsQuery } from "@events/public/events-api";

const isUniqueViolation = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError &&
  error.code === "P2002";

const WORD_SIMILARITY_THRESHOLD = 0.3;
const VALID_EVENT_CATEGORIES = new Set<string>(Object.values(EventCategory));
const CANDIDATE_CAP = 500;

const trimmedTerms = (terms: readonly string[]) => [
  ...new Set(terms.map((term) => term.trim()).filter(Boolean)),
];

const lowerTerms = (terms: readonly string[]) =>
  trimmedTerms(terms).map((term) => term.toLowerCase());

type EventCandidateRow = {
  id: string;
  pdu: number;
  title: string;
  isFree: boolean;
  category: string;
  startDate: Date;
  attendees: number;
  matchScore: number;
  description: string;
  ratingCount: number;
  topic: string | null;
  averageRating: number;
  specificTopic: string | null;
};

type RegistrationOutcome = {
  readonly activated: boolean;
  readonly registration: Prisma.EventRegistrationGetPayload<object>;
};

@Injectable()
export class EventRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.EventUncheckedCreateInput) {
    return this.prisma.event.create({ data });
  }

  update(eventId: string, data: Prisma.EventUpdateInput) {
    return this.prisma.event.update({ where: { id: eventId }, data });
  }

  async updateRating(
    eventId: string,
    average: number,
    count: number,
    writer: EventRatingWriter = this.prisma,
  ) {
    await writer.event.update({
      where: { id: eventId },
      data: { averageRating: average, rating: average, ratingCount: count },
    });
  }

  findActiveById(eventId: string) {
    return this.prisma.event.findFirst({
      where: { id: eventId, deletedAt: null },
    });
  }

  findById(eventId: string) {
    return this.prisma.event.findUnique({ where: { id: eventId } });
  }

  findPublishedByIdWithSchedule(eventId: string) {
    return this.prisma.event.findFirst({
      where: { id: eventId, status: EventStatus.PUBLISHED, deletedAt: null },
      include: {
        scheduleItems: {
          orderBy: [{ dayNumber: "asc" }, { startTime: "asc" }],
        },
      },
    });
  }

  findPublishedBySlugWithSchedule(slug: string) {
    return this.prisma.event.findFirst({
      where: { slug, status: EventStatus.PUBLISHED, deletedAt: null },
      include: {
        scheduleItems: {
          orderBy: [{ dayNumber: "asc" }, { startTime: "asc" }],
        },
      },
    });
  }

  async incrementPublishedViews(eventId: string) {
    const { count } = await this.prisma.event.updateMany({
      where: { id: eventId, status: EventStatus.PUBLISHED, deletedAt: null },
      data: { views: { increment: 1 } },
    });
    return count === 1;
  }

  async groupPublicFacets() {
    const where = { status: EventStatus.PUBLISHED, deletedAt: null };
    const [categories, types] = await Promise.all([
      this.prisma.event.groupBy({
        by: ["category"],
        where,
        _count: { _all: true },
      }),
      this.prisma.event.groupBy({
        by: ["type"],
        where,
        _count: { _all: true },
      }),
    ]);
    return { categories, types };
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
    const type = filter?.type ?? null;
    const deliveryMode = filter?.deliveryMode ?? null;
    const category = filter?.category ?? null;
    const isFree = filter?.isFree ?? null;
    const providerId = filter?.providerId ?? null;

    const EVENT_COLUMNS = `
      e."id", e."slug", e."title", e."type", e."deliveryMode",
      e."category", e."status", e."imageUrl", e."speaker", e."organizer",
      e."description", e."startDate", e."endDate", e."timezone",
      e."location", e."onlineUrl", e."price", e."currency", e."isFree",
      e."pdu", e."capacity", e."attendees", e."views", e."rating",
      e."averageRating", e."ratingCount", e."registrationEnabled",
      e."providerId", e."createdAt", e."updatedAt", e."deletedAt"`;

    const rowsPromise = this.prisma.$queryRaw<Array<EventSearchRow>>`
      WITH exact_matches AS (
        SELECT ${Prisma.raw(EVENT_COLUMNS)},
          (CASE
            WHEN e."title" ILIKE '%' || ${search} || '%' THEN 3
            WHEN e."speaker" ILIKE '%' || ${search} || '%' THEN 2
            WHEN e."organizer" ILIKE '%' || ${search} || '%' THEN 2
            WHEN e."location" ILIKE '%' || ${search} || '%' THEN 2
            ELSE 1
          END)::float AS "searchRank"
        FROM "Event" e
        WHERE e."deletedAt" IS NULL
          AND e."status" = ${status}::"EventStatus"
          AND (${type}::"EventType" IS NULL OR e."type" = ${type}::"EventType")
          AND (${deliveryMode}::"EventDeliveryMode" IS NULL OR e."deliveryMode" = ${deliveryMode}::"EventDeliveryMode")
          AND (${category}::"EventCategory" IS NULL OR e."category" = ${category}::"EventCategory")
          AND (${isFree}::boolean IS NULL OR e."isFree" = ${isFree}::boolean)
          AND (${providerId}::text IS NULL OR e."providerId" = ${providerId}::text)
          AND (${fromDate}::timestamp IS NULL OR e."startDate" >= ${fromDate}::timestamp)
          AND (${toDate}::timestamp IS NULL OR e."startDate" <= ${toDate}::timestamp)
          AND (${cursor}::text IS NULL OR e."id" > ${cursor}::text)
          AND (
            e."title" ILIKE '%' || ${search} || '%'
            OR e."speaker" ILIKE '%' || ${search} || '%'
            OR e."organizer" ILIKE '%' || ${search} || '%'
            OR e."location" ILIKE '%' || ${search} || '%'
            OR e."description" ILIKE '%' || ${search} || '%'
          )
        ORDER BY "searchRank" DESC, e."startDate" ASC, e."id" DESC
        LIMIT ${CANDIDATE_CAP}
      ),
      fuzzy_matches AS (
        SELECT ${Prisma.raw(EVENT_COLUMNS)},
          LEAST(
            GREATEST(
              similarity(e."title", ${search}),
              similarity(e."speaker", ${search}),
              similarity(e."organizer", ${search}),
              similarity(e."location", ${search})
            ),
            0.99
          ) AS "searchRank"
        FROM "Event" e
        WHERE e."deletedAt" IS NULL
          AND e."status" = ${status}::"EventStatus"
          AND (${type}::"EventType" IS NULL OR e."type" = ${type}::"EventType")
          AND (${deliveryMode}::"EventDeliveryMode" IS NULL OR e."deliveryMode" = ${deliveryMode}::"EventDeliveryMode")
          AND (${category}::"EventCategory" IS NULL OR e."category" = ${category}::"EventCategory")
          AND (${isFree}::boolean IS NULL OR e."isFree" = ${isFree}::boolean)
          AND (${providerId}::text IS NULL OR e."providerId" = ${providerId}::text)
          AND (${fromDate}::timestamp IS NULL OR e."startDate" >= ${fromDate}::timestamp)
          AND (${toDate}::timestamp IS NULL OR e."startDate" <= ${toDate}::timestamp)
          AND (${cursor}::text IS NULL OR e."id" > ${cursor}::text)
          AND e."id" NOT IN (SELECT "id" FROM exact_matches)
          AND (
            e."title" % ${search}
            OR e."speaker" % ${search}
            OR e."organizer" % ${search}
            OR e."location" % ${search}
          )
        ORDER BY "searchRank" DESC, e."startDate" ASC, e."id" DESC
        LIMIT GREATEST(${CANDIDATE_CAP} - (SELECT COUNT(*)::int FROM exact_matches), 0)
      )
      SELECT * FROM exact_matches
      UNION ALL
      SELECT * FROM fuzzy_matches
      ORDER BY "searchRank" DESC, "startDate" ASC, "id" DESC
      LIMIT ${take + 1};
    `;

    const countPromise = this.prisma.$queryRaw<Array<{ count: bigint }>>`
      SELECT COUNT(*)::bigint AS count
      FROM "Event" e
      WHERE e."deletedAt" IS NULL
        AND e."status" = ${status}::"EventStatus"
        AND (${type}::"EventType" IS NULL OR e."type" = ${type}::"EventType")
        AND (${deliveryMode}::"EventDeliveryMode" IS NULL OR e."deliveryMode" = ${deliveryMode}::"EventDeliveryMode")
        AND (${category}::"EventCategory" IS NULL OR e."category" = ${category}::"EventCategory")
        AND (${isFree}::boolean IS NULL OR e."isFree" = ${isFree}::boolean)
        AND (${providerId}::text IS NULL OR e."providerId" = ${providerId}::text)
        AND (${fromDate}::timestamp IS NULL OR e."startDate" >= ${fromDate}::timestamp)
        AND (${toDate}::timestamp IS NULL OR e."startDate" <= ${toDate}::timestamp)
        AND (${cursor}::text IS NULL OR e."id" > ${cursor}::text)
        AND (
          e."title" ILIKE '%' || ${search} || '%'
          OR e."speaker" ILIKE '%' || ${search} || '%'
          OR e."organizer" ILIKE '%' || ${search} || '%'
          OR e."location" ILIKE '%' || ${search} || '%'
          OR e."description" ILIKE '%' || ${search} || '%'
          OR e."title" % ${search}
          OR e."speaker" % ${search}
          OR e."organizer" % ${search}
          OR e."location" % ${search}
        )
    `;

    const [rows, countRows] = await this.prisma.$transaction([
      rowsPromise,
      countPromise,
    ]);
    const hasNextPage = rows.length > take;
    const slicedRows = hasNextPage ? rows.slice(0, take) : rows;
    return {
      items: slicedRows.map(({ searchRank: _rank, ...event }) => ({
        ...event,
        price: event.price ? Number(event.price) : null,
      })),
      totalCount: Number(countRows[0]?.count ?? 0n),
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

  activateRegistration(
    eventId: string,
    userId: string,
  ): Promise<RegistrationOutcome> {
    return this.prisma.$transaction(async (tx) => {
      const revived = await tx.eventRegistration.updateMany({
        where: { eventId, userId, status: { in: [...VACATED_STATUSES] } },
        data: { status: EventRegistrationStatus.REGISTERED },
      });
      if (revived.count === 0) {
        const attending = await tx.eventRegistration.findUnique({
          where: { eventId_userId: { eventId, userId } },
        });
        if (attending) return { registration: attending, activated: false };
        await tx.eventRegistration
          .create({
            data: {
              eventId,
              userId,
              status: EventRegistrationStatus.REGISTERED,
            },
          })
          .catch((error: unknown) => {
            throw isUniqueViolation(error)
              ? new EventRegistrationConflict("ALREADY_REGISTERED")
              : error;
          });
      }
      await this.claimSeat(tx, eventId);
      return {
        registration: await tx.eventRegistration.findUniqueOrThrow({
          where: { eventId_userId: { eventId, userId } },
        }),
        activated: true,
      };
    });
  }

  cancelRegistration(
    eventId: string,
    userId: string,
  ): Promise<RegistrationOutcome | null> {
    return this.prisma.$transaction(async (tx) => {
      const released = await tx.eventRegistration.updateMany({
        where: { eventId, userId, status: { in: [...ATTENDING_STATUSES] } },
        data: { status: EventRegistrationStatus.CANCELLED },
      });
      const registration = await tx.eventRegistration.findUnique({
        where: { eventId_userId: { eventId, userId } },
      });
      if (!registration) return null;
      if (released.count === 0) return { registration, activated: false };
      await tx.$executeRaw`
        UPDATE "Event"
        SET "attendees" = GREATEST("attendees" - 1, 0)
        WHERE "id" = ${eventId}`;
      return { registration, activated: true };
    });
  }

  private async claimSeat(tx: Prisma.TransactionClient, eventId: string) {
    const claimed = await tx.$executeRaw`
      UPDATE "Event"
      SET "attendees" = "attendees" + 1
      WHERE "id" = ${eventId}
        AND "deletedAt" IS NULL
        AND "status" = 'PUBLISHED'::"EventStatus"
        AND "registrationEnabled" = true
        AND ("capacity" IS NULL OR "attendees" < "capacity")`;
    if (claimed === 1) return;
    const event = await tx.event.findUnique({
      where: { id: eventId },
      select: { status: true, registrationEnabled: true, deletedAt: true },
    });
    throw new EventRegistrationConflict(
      event &&
      event.deletedAt === null &&
      event.status === EventStatus.PUBLISHED &&
      event.registrationEnabled
        ? "CAPACITY_REACHED"
        : "REGISTRATION_CLOSED",
    );
  }

  async reconcileAttendeeCount(eventId: string) {
    const attending = await this.prisma.eventRegistration.count({
      where: { eventId, status: { in: [...ATTENDING_STATUSES] } },
    });
    await this.prisma.event.update({
      where: { id: eventId },
      data: { attendees: attending },
    });
    return attending;
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
    const subjects = trimmedTerms(query.subjects);
    const freeOnly = query.freeOnly;
    switch (query.tier) {
      case "EXACT":
        return this.exactTierEvents(subjects, freeOnly, query.take);
      case "SIMILAR":
        return this.similarTierEvents(
          lowerTerms([...query.subjects, ...query.keywords]),
          freeOnly,
          query.take,
        );
      case "RELATED":
        return this.relatedTierEvents(query.groupKeys, freeOnly, query.take);
      case "BROAD":
        return this.broadTierEvents(freeOnly, query.take);
    }
  }

  private exactTierEvents(
    subjects: readonly string[],
    freeOnly: boolean,
    take: number,
  ) {
    return this.prisma.$queryRaw<EventCandidateRow[]>`
      SELECT
        e."id", e."pdu", e."title", e."topic", e."isFree", e."category",
        e."startDate", e."attendees", e."description", e."ratingCount",
        e."specificTopic", e."averageRating", 1.0::float AS "matchScore"
      FROM "Event" e
      WHERE e."deletedAt" IS NULL
        AND e."status" = ${EventStatus.PUBLISHED}::"EventStatus"
        AND e."startDate" >= ${new Date()}
        AND (${freeOnly} = false OR e."isFree" = true)
        AND (
          ${subjects.length === 0}
          OR ${Prisma.join(
            subjects.flatMap((subject) => [
              Prisma.sql`e."title" ILIKE ${"%" + subject + "%"}`,
              Prisma.sql`e."description" ILIKE ${"%" + subject + "%"}`,
              Prisma.sql`e."topic" ILIKE ${"%" + subject + "%"}`,
              Prisma.sql`roadmap_enum_text(e."category") ILIKE ${"%" + subject + "%"}`,
            ]),
            " OR ",
          )}
        )
      ORDER BY e."pdu" DESC, e."averageRating" DESC, e."attendees" DESC, e."id" ASC
      LIMIT ${take};
    `;
  }

  private async similarTierEvents(
    terms: readonly string[],
    freeOnly: boolean,
    take: number,
  ) {
    if (terms.length === 0) return this.exactTierEvents([], freeOnly, take);
    return this.prisma.$transaction(async (tx) => {
      await tx.$executeRaw`SELECT set_config('pg_trgm.word_similarity_threshold', ${String(WORD_SIMILARITY_THRESHOLD)}, true)`;
      return tx.$queryRaw<EventCandidateRow[]>`
        SELECT
          e."id", e."pdu", e."title", e."topic", e."isFree", e."category",
          e."startDate", e."attendees", e."description", e."ratingCount",
          e."specificTopic", e."averageRating",
          GREATEST(${Prisma.join(
            terms.map(
              (term) =>
                Prisma.sql`word_similarity(${term}, lower(e."title" || ' ' || roadmap_enum_text(e."category")))`,
            ),
            ", ",
          )}) AS "matchScore"
        FROM "Event" e
        WHERE e."deletedAt" IS NULL
          AND e."status" = ${EventStatus.PUBLISHED}::"EventStatus"
          AND e."startDate" >= ${new Date()}
          AND (${freeOnly} = false OR e."isFree" = true)
          AND (${Prisma.join(
            terms.map(
              (term) =>
                Prisma.sql`lower(e."title" || ' ' || roadmap_enum_text(e."category")) %> ${term}`,
            ),
            " OR ",
          )})
        ORDER BY "matchScore" DESC, e."pdu" DESC, e."averageRating" DESC, e."attendees" DESC, e."id" ASC
        LIMIT ${take};
      `;
    });
  }

  private relatedTierEvents(
    groupKeys: readonly string[],
    freeOnly: boolean,
    take: number,
  ) {
    const categories = groupKeys.filter((key) =>
      VALID_EVENT_CATEGORIES.has(key),
    );
    if (categories.length === 0) return Promise.resolve([]);
    return this.prisma.$queryRaw<EventCandidateRow[]>`
      SELECT
        e."id", e."pdu", e."title", e."topic", e."isFree", e."category",
        e."startDate", e."attendees", e."description", e."ratingCount",
        e."specificTopic", e."averageRating", 0.4::float AS "matchScore"
      FROM "Event" e
      WHERE e."deletedAt" IS NULL
        AND e."status" = ${EventStatus.PUBLISHED}::"EventStatus"
        AND e."startDate" >= ${new Date()}
        AND (${freeOnly} = false OR e."isFree" = true)
        AND e."category" = ANY(${categories}::"EventCategory"[])
      ORDER BY e."pdu" DESC, e."averageRating" DESC, e."attendees" DESC, e."id" ASC
      LIMIT ${take};
    `;
  }

  private broadTierEvents(freeOnly: boolean, take: number) {
    return this.prisma.$queryRaw<EventCandidateRow[]>`
      SELECT
        e."id", e."pdu", e."title", e."topic", e."isFree", e."category",
        e."startDate", e."attendees", e."description", e."ratingCount",
        e."specificTopic", e."averageRating", 0.2::float AS "matchScore"
      FROM "Event" e
      WHERE e."deletedAt" IS NULL
        AND e."status" = ${EventStatus.PUBLISHED}::"EventStatus"
        AND e."startDate" >= ${new Date()}
        AND (${freeOnly} = false OR e."isFree" = true)
      ORDER BY e."pdu" DESC, e."averageRating" DESC, e."attendees" DESC, e."id" ASC
      LIMIT ${take};
    `;
  }

  async searchCatalog(query: {
    search: string;
    take: number;
    category: string | null;
  }): Promise<EventCatalogSearchRow[]> {
    const category = VALID_EVENT_CATEGORIES.has(query.category ?? "")
      ? (query.category as EventCategory)
      : null;

    return this.prisma.$queryRaw<EventCatalogSearchRow[]>`
      WITH exact_matches AS (
        SELECT
          e."id", e."slug", e."title", e."imageUrl",
          e."category"::text AS category, e."averageRating" AS rating,
          e."startDate", e."createdAt",
          CASE
            WHEN e."title" ILIKE '%' || ${query.search} || '%' THEN 3
            WHEN e."speaker" ILIKE '%' || ${query.search} || '%' THEN 2
            WHEN e."organizer" ILIKE '%' || ${query.search} || '%' THEN 2
            WHEN e."location" ILIKE '%' || ${query.search} || '%' THEN 2
            ELSE 1
          END AS band
        FROM "Event" e
        WHERE e."deletedAt" IS NULL
          AND e."status" = 'PUBLISHED'::"EventStatus"
          AND (${category}::"EventCategory" IS NULL OR e."category" = ${category}::"EventCategory")
          AND (
            e."title" ILIKE '%' || ${query.search} || '%'
            OR e."speaker" ILIKE '%' || ${query.search} || '%'
            OR e."organizer" ILIKE '%' || ${query.search} || '%'
            OR e."location" ILIKE '%' || ${query.search} || '%'
            OR e."description" ILIKE '%' || ${query.search} || '%'
          )
        ORDER BY band DESC, e."createdAt" DESC, e."id" ASC
        LIMIT ${query.take}
      ),
      fuzzy_matches AS (
        SELECT
          e."id", e."slug", e."title", e."imageUrl",
          e."category"::text AS category, e."averageRating" AS rating,
          e."startDate", e."createdAt",
          GREATEST(
            similarity(e."title", ${query.search}),
            similarity(e."speaker", ${query.search}),
            similarity(e."organizer", ${query.search}),
            similarity(e."location", ${query.search})
          ) AS "fuzzyScore"
        FROM "Event" e
        WHERE e."deletedAt" IS NULL
          AND e."status" = 'PUBLISHED'::"EventStatus"
          AND (${category}::"EventCategory" IS NULL OR e."category" = ${category}::"EventCategory")
          AND e."id" NOT IN (SELECT "id" FROM exact_matches)
          AND (
            e."title" % ${query.search}
            OR e."speaker" % ${query.search}
            OR e."organizer" % ${query.search}
            OR e."location" % ${query.search}
          )
        ORDER BY "fuzzyScore" DESC, e."createdAt" DESC, e."id" ASC
        LIMIT GREATEST(${query.take} - (SELECT COUNT(*)::int FROM exact_matches), 0)
      )
      SELECT
        "id", "slug", "title", "imageUrl", category, "rating",
        "startDate", "createdAt", band::float AS score
      FROM exact_matches
      UNION ALL
      SELECT
        "id", "slug", "title", "imageUrl", category, "rating",
        "startDate", "createdAt", LEAST("fuzzyScore", 0.99)::float AS score
      FROM fuzzy_matches;
    `;
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
};
