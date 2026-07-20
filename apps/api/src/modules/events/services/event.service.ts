import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { Injectable, NotFoundException } from "@nestjs/common";
import { EventStatus, Prisma, Role } from "@prisma/client";
import { EventRegistrationStatus } from "@prisma/client";
import { EventPaginationInput } from "@events/dtos/event-pagination.input";
import { EventSortDirection } from "@events/enums/event-register.enum";
import { CreateEventInput } from "@events/dtos/create-event.input";
import { UpdateEventInput } from "@events/dtos/update-event.input";
import { EventFilterInput } from "@events/dtos/event-filter.input";
import { EventMessageCode } from "@events/enums/message-code.enum";
import { EventRequester } from "@events/enums/event-register.enum";
import { EventSortField } from "@events/enums/event-register.enum";
import { EventSortInput } from "@events/dtos/event-sort.input";
import { PrismaService } from "@prisma/prisma.service";

@Injectable()
export class EventService {
  constructor(private readonly prismaService: PrismaService) {}

  async createEvent(input: CreateEventInput, requester: EventRequester) {
    this.ensureProviderOrAdmin(requester);
    const slug = await this.generateUniqueSlug(input.title);
    const isFree = input.isFree ?? (!input.price || input.price <= 0);
    return this.prismaService.event.create({
      data: {
        slug,
        isFree,
        type: input.type,
        pdu: input.pdu ?? 0,
        imageUrl: input.imageUrl,
        language: input.language,
        category: input.category,
        capacity: input.capacity,
        title: input.title.trim(),
        onlineUrl: input.onlineUrl,
        pduCategory: input.pduCategory,
        speaker: input.speaker?.trim(),
        location: input.location?.trim(),
        deliveryMode: input.deliveryMode,
        currency: input.currency ?? "USD",
        timezone: input.timezone ?? "UTC",
        specificTopic: input.specificTopic,
        organizer: input.organizer?.trim(),
        startDate: new Date(input.startDate),
        description: input.description.trim(),
        status: input.status ?? EventStatus.DRAFT,
        earlyBirdDiscount: input.earlyBirdDiscount,
        promotionVideoUrl: input.promotionVideoUrl,
        registrationEnabled: input.registrationEnabled ?? true,
        endDate: input.endDate ? new Date(input.endDate) : null,
        price: isFree ? null : new Prisma.Decimal(input.price ?? 0),
        providerId: requester.role === Role.PROVIDER ? requester.id : null,
      },
    });
  }

  async updateEvent(input: UpdateEventInput, requester: EventRequester) {
    const event = await this.findExistingEvent(input.eventId);
    this.ensureEventOwnerOrAdmin(event.providerId, requester);
    const isFree =
      typeof input.isFree === "boolean"
        ? input.isFree
        : input.price !== undefined
          ? input.price <= 0
          : undefined;
    return this.prismaService.event.update({
      where: { id: input.eventId },
      data: {
        isFree,
        pdu: input.pdu,
        type: input.type,
        status: input.status,
        category: input.category,
        capacity: input.capacity,
        imageUrl: input.imageUrl,
        language: input.language,
        timezone: input.timezone,
        currency: input.currency,
        title: input.title?.trim(),
        onlineUrl: input.onlineUrl,
        pduCategory: input.pduCategory,
        speaker: input.speaker?.trim(),
        location: input.location?.trim(),
        deliveryMode: input.deliveryMode,
        organizer: input.organizer?.trim(),
        specificTopic: input.specificTopic,
        description: input.description?.trim(),
        promotionVideoUrl: input.promotionVideoUrl,
        earlyBirdDiscount: input.earlyBirdDiscount,
        registrationEnabled: input.registrationEnabled,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        price:
          isFree === true
            ? null
            : input.price !== undefined
              ? new Prisma.Decimal(input.price)
              : undefined,
      },
    });
  }

  async findEvents(
    filter?: EventFilterInput,
    pagination?: EventPaginationInput,
    sort?: EventSortInput,
  ) {
    const search = filter?.search?.trim();
    if (search && search.length >= 2)
      return this.findEventsWithTrgmSearch(filter, pagination, sort);
    const take = Math.min(pagination?.take ?? 20, 100);
    const where = this.buildEventWhere(filter);
    const orderBy = this.buildOrderBy(sort);
    const [items, totalCount] = await this.prismaService.$transaction([
      this.prismaService.event.findMany({
        where,
        take: take + 1,
        cursor: pagination?.cursor ? { id: pagination.cursor } : undefined,
        skip: pagination?.cursor ? 1 : 0,
        orderBy,
      }),
      this.prismaService.event.count({ where }),
    ]);
    const hasNextPage = items.length > take;
    const slicedItems = hasNextPage ? items.slice(0, take) : items;
    const nextCursor = hasNextPage
      ? slicedItems[slicedItems.length - 1]?.id
      : null;
    return {
      items: slicedItems,
      totalCount,
      pageInfo: {
        hasNextPage,
        nextCursor,
      },
    };
  }

  async findEventById(eventId: string) {
    const event = await this.prismaService.event.findFirst({
      where: {
        id: eventId,
        deletedAt: null,
      },
      include: {
        scheduleItems: {
          orderBy: [{ dayNumber: "asc" }, { startTime: "asc" }],
        },
      },
    });
    if (!event) throw new NotFoundException(EventMessageCode.EVENT_NOT_FOUND);
    await this.prismaService.event.update({
      where: { id: event.id },
      data: { views: { increment: 1 } },
    });
    return event;
  }

  async findEventBySlug(slug: string) {
    const event = await this.prismaService.event.findFirst({
      where: {
        slug,
        deletedAt: null,
      },
      include: {
        scheduleItems: {
          orderBy: [{ dayNumber: "asc" }, { startTime: "asc" }],
        },
      },
    });
    if (!event) throw new NotFoundException(EventMessageCode.EVENT_NOT_FOUND);
    await this.prismaService.event.update({
      where: { id: event.id },
      data: { views: { increment: 1 } },
    });
    return event;
  }

  async findUpcomingEvents(take = 12) {
    return this.prismaService.event.findMany({
      where: {
        status: EventStatus.PUBLISHED,
        deletedAt: null,
        startDate: {
          gte: new Date(),
        },
      },
      take: Math.min(take, 50),
      orderBy: {
        startDate: "asc",
      },
    });
  }

  async findFeaturedEvents(take = 12) {
    return this.prismaService.event.findMany({
      where: {
        status: EventStatus.PUBLISHED,
        deletedAt: null,
      },
      take: Math.min(take, 50),
      orderBy: [
        { averageRating: "desc" },
        { attendees: "desc" },
        { views: "desc" },
      ],
    });
  }

  async findMyProviderEvents(
    requester: EventRequester,
    filter?: EventFilterInput,
    pagination?: EventPaginationInput,
    sort?: EventSortInput,
  ) {
    if (requester.role !== Role.PROVIDER && requester.role !== Role.ADMIN)
      throw new ForbiddenException(EventMessageCode.EVENT_ACCESS_DENIED);
    return this.findEvents(
      {
        ...filter,
        providerId:
          requester.role === Role.PROVIDER ? requester.id : filter?.providerId,
      },
      pagination,
      sort,
    );
  }

  async registerEvent(eventId: string, requester: EventRequester) {
    const event = await this.findExistingEvent(eventId);
    if (event.status !== EventStatus.PUBLISHED)
      throw new BadRequestException(EventMessageCode.EVENT_NOT_FOUND);
    if (!event.registrationEnabled)
      throw new BadRequestException(
        EventMessageCode.EVENT_REGISTRATION_DISABLED,
      );
    if (event.capacity && event.attendees >= event.capacity)
      throw new BadRequestException(EventMessageCode.EVENT_CAPACITY_REACHED);
    const existing = await this.prismaService.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: requester.id,
        },
      },
    });
    if (existing)
      throw new BadRequestException(EventMessageCode.EVENT_ALREADY_REGISTERED);
    return this.prismaService.$transaction(async (tx) => {
      const registration = await tx.eventRegistration.create({
        data: {
          eventId,
          userId: requester.id,
          status: EventRegistrationStatus.REGISTERED,
        },
      });
      await tx.event.update({
        where: { id: eventId },
        data: {
          attendees: { increment: 1 },
        },
      });
      return registration;
    });
  }

  async cancelEventRegistration(eventId: string, requester: EventRequester) {
    const registration = await this.prismaService.eventRegistration.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: requester.id,
        },
      },
    });
    if (!registration)
      throw new NotFoundException(
        EventMessageCode.EVENT_REGISTRATION_NOT_FOUND,
      );
    return this.prismaService.$transaction(async (tx) => {
      const updated = await tx.eventRegistration.update({
        where: { id: registration.id },
        data: {
          status: EventRegistrationStatus.CANCELLED,
        },
      });
      await tx.event.update({
        where: { id: eventId },
        data: {
          attendees: { decrement: 1 },
        },
      });
      return updated;
    });
  }

  async myRegisteredEvents(requester: EventRequester) {
    return this.prismaService.eventRegistration.findMany({
      where: {
        userId: requester.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async publishEvent(eventId: string, requester: EventRequester) {
    const event = await this.findExistingEvent(eventId);
    this.ensureEventOwnerOrAdmin(event.providerId, requester);
    return this.prismaService.event.update({
      where: { id: eventId },
      data: { status: EventStatus.PUBLISHED },
    });
  }

  async archiveEvent(eventId: string, requester: EventRequester) {
    const event = await this.findExistingEvent(eventId);
    this.ensureEventOwnerOrAdmin(event.providerId, requester);
    return this.prismaService.event.update({
      where: { id: eventId },
      data: { status: EventStatus.ARCHIVED },
    });
  }

  async cancelEvent(eventId: string, requester: EventRequester) {
    const event = await this.findExistingEvent(eventId);
    this.ensureEventOwnerOrAdmin(event.providerId, requester);
    return this.prismaService.event.update({
      where: { id: eventId },
      data: { status: EventStatus.CANCELLED },
    });
  }

  async softDeleteEvent(eventId: string, requester: EventRequester) {
    const event = await this.findExistingEvent(eventId);
    this.ensureEventOwnerOrAdmin(event.providerId, requester);
    return this.prismaService.event.update({
      where: { id: eventId },
      data: { deletedAt: new Date() },
    });
  }

  async restoreEvent(eventId: string, requester: EventRequester) {
    const event = await this.prismaService.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException(EventMessageCode.EVENT_NOT_FOUND);
    this.ensureEventOwnerOrAdmin(event.providerId, requester);
    return this.prismaService.event.update({
      where: { id: eventId },
      data: { deletedAt: null },
    });
  }

  private async findEventsWithTrgmSearch(
    filter?: EventFilterInput,
    pagination?: EventPaginationInput,
    _sort?: EventSortInput,
  ) {
    const take = Math.min(pagination?.take ?? 20, 100);
    const search = filter?.search?.trim() ?? "";
    const cursor = pagination?.cursor ?? null;
    const status = filter?.status ?? EventStatus.PUBLISHED;
    const fromDate = filter?.fromDate ? new Date(filter.fromDate) : null;
    const toDate = filter?.toDate ? new Date(filter.toDate) : null;
    const rows = await this.prismaService.$queryRaw<
      Array<{
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
      }>
    >`
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
    SELECT
      ranked_events.*,
      COUNT(*) OVER() AS "totalCount"
    FROM ranked_events
    ORDER BY "searchRank" DESC, "startDate" ASC, "id" DESC
    LIMIT ${take + 1};
  `;
    const hasNextPage = rows.length > take;
    const slicedRows = hasNextPage ? rows.slice(0, take) : rows;
    return {
      items: slicedRows.map(({ searchRank, totalCount, ...event }) => ({
        ...event,
        price: event.price ? Number(event.price) : null,
      })),
      totalCount: rows[0]?.totalCount ? Number(rows[0].totalCount) : 0,
      pageInfo: {
        hasNextPage,
        nextCursor: hasNextPage ? slicedRows[slicedRows.length - 1]?.id : null,
      },
    };
  }

  private buildEventWhere(filter?: EventFilterInput): Prisma.EventWhereInput {
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

  private async findExistingEvent(eventId: string) {
    const event = await this.prismaService.event.findFirst({
      where: {
        id: eventId,
        deletedAt: null,
      },
    });
    if (!event) throw new NotFoundException(EventMessageCode.EVENT_NOT_FOUND);
    return event;
  }

  private ensureProviderOrAdmin(requester: EventRequester) {
    if (requester.role !== Role.PROVIDER && requester.role !== Role.ADMIN)
      throw new ForbiddenException(EventMessageCode.EVENT_ACCESS_DENIED);
  }

  private ensureEventOwnerOrAdmin(
    providerId: string | null,
    requester: EventRequester,
  ) {
    if (requester.role === Role.ADMIN) return;
    if (requester.role !== Role.PROVIDER || providerId !== requester.id)
      throw new ForbiddenException(EventMessageCode.EVENT_ACCESS_DENIED);
  }

  private async generateUniqueSlug(title: string) {
    const baseSlug = this.slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await this.prismaService.event.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    return slug;
  }

  private slugify(value: string) {
    return value
      .toLowerCase()
      .trim()
      .replace(/['"]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
