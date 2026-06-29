import { ProviderDashboardPaginationInput } from "@provider/dtos/provider-pagination.input";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ProviderAttendeesFilterInput } from "@provider/dtos/provider-attendees-filter.input";
import { ProviderPromotionFilterInput } from "@provider/dtos/provider-promotion-filter.input";
import { SubmitPromotionRequestInput } from "@provider/dtos/submit-promotion-request.input";
import { UpdateProviderSettingsInput } from "@provider/dtos/update-provider-setting.input";
import { ProviderDashboardRangeInput } from "@provider/dtos/provider-range.input";
import { EventStatus, Prisma, Role } from "@prisma/client";
import { ProviderEventsFilterInput } from "@provider/dtos/provider-events-filter.input";
import { EventRegistrationStatus } from "@prisma/client";
import { PromotionRequestStatus } from "@prisma/client";
import { ProviderDashboardRange } from "@provider/enums/provider-register.enum";
import { BadRequestException } from "@nestjs/common";
import { ProviderMessageCode } from "@provider/enums/message-code.enum";
import { ForbiddenException } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { TUser } from "@common/types/user.types";

@Injectable()
export class ProviderService {
  constructor(private readonly prismaService: PrismaService) {}

  private assertProvider(user: TUser) {
    const allowedRoles: Role[] = [Role.PROVIDER, Role.ADMIN];

    if (!allowedRoles.includes(user.role))
      throw new ForbiddenException(
        ProviderMessageCode.PROVIDER_ACCESS_REQUIRED,
      );
  }

  private getRangeDates(range?: ProviderDashboardRange) {
    const now = new Date();
    const start = new Date(now);
    if (range === ProviderDashboardRange.LAST_7_DAYS) {
      start.setDate(now.getDate() - 7);
    } else if (range === ProviderDashboardRange.LAST_90_DAYS) {
      start.setDate(now.getDate() - 90);
    } else if (range === ProviderDashboardRange.THIS_YEAR) {
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
    } else {
      start.setDate(now.getDate() - 30);
    }
    return { start, end: now };
  }

  async providerSettings(user: TUser) {
    this.assertProvider(user);
    return this.prismaService.providerSettings.upsert({
      where: { providerId: user.id },
      create: { providerId: user.id },
      update: {},
    });
  }

  async updateProviderSettings(
    user: TUser,
    input: UpdateProviderSettingsInput,
  ) {
    this.assertProvider(user);
    return this.prismaService.providerSettings.upsert({
      where: { providerId: user.id },
      create: {
        providerId: user.id,
        ...input,
      },
      update: input,
    });
  }

  async overview(user: TUser, input?: ProviderDashboardRangeInput) {
    this.assertProvider(user);
    const { start, end } = this.getRangeDates(input?.range);
    const provider = await this.prismaService.user.findUnique({
      where: { id: user.id },
      select: { fullName: true, email: true },
    });
    const [
      totalEvents,
      published,
      draft,
      archived,
      cancelled,
      totalRegistrations,
      totalViewsAgg,
      upcomingSessions,
    ] = await Promise.all([
      this.prismaService.event.count({
        where: { providerId: user.id, deletedAt: null },
      }),
      this.prismaService.event.count({
        where: {
          providerId: user.id,
          status: EventStatus.PUBLISHED,
          deletedAt: null,
        },
      }),
      this.prismaService.event.count({
        where: {
          providerId: user.id,
          status: EventStatus.DRAFT,
          deletedAt: null,
        },
      }),
      this.prismaService.event.count({
        where: {
          providerId: user.id,
          status: EventStatus.ARCHIVED,
          deletedAt: null,
        },
      }),
      this.prismaService.event.count({
        where: {
          providerId: user.id,
          status: EventStatus.CANCELLED,
          deletedAt: null,
        },
      }),
      this.prismaService.eventRegistration.count({
        where: {
          event: { providerId: user.id },
          createdAt: { gte: start, lte: end },
        },
      }),
      this.prismaService.event.aggregate({
        where: { providerId: user.id, deletedAt: null },
        _sum: { views: true },
      }),
      this.prismaService.event.count({
        where: {
          providerId: user.id,
          deletedAt: null,
          startDate: { gte: new Date() },
          status: EventStatus.PUBLISHED,
        },
      }),
    ]);
    const totalViews = totalViewsAgg._sum.views ?? 0;
    return {
      providerName: provider?.fullName ?? provider?.email ?? null,
      totalEvents,
      totalRegistrations,
      totalViews,
      conversionRate:
        totalViews > 0
          ? Number(((totalRegistrations / totalViews) * 100).toFixed(2))
          : 0,
      statusBreakdown: {
        published,
        draft,
        archived,
        cancelled,
      },
      upcomingSessions,
    };
  }

  async analytics(user: TUser, input?: ProviderDashboardRangeInput) {
    this.assertProvider(user);
    const { start, end } = this.getRangeDates(input?.range);
    const events = await this.prismaService.event.findMany({
      where: {
        providerId: user.id,
        deletedAt: null,
      },
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
          select: {
            id: true,
            createdAt: true,
            status: true,
          },
        },
      },
    });
    let totalRevenue = 0;
    let totalRegistrations = 0;
    let totalViews = 0;
    let ratingSum = 0;
    let ratingCount = 0;
    const byDate = new Map<
      string,
      { registrations: number; revenue: number }
    >();
    const pduMap = new Map<string, number>();
    const typeMap = new Map<string, number>();
    const topPerformingEvents = events.map((event) => {
      const registrations = event.registrations.length;
      const price = Number(event.price ?? 0);
      const revenue = event.isFree ? 0 : registrations * price;
      totalRevenue += revenue;
      totalRegistrations += registrations;
      totalViews += event.views;
      if (event.averageRating > 0) {
        ratingSum += event.averageRating;
        ratingCount += 1;
      }
      typeMap.set(event.type, (typeMap.get(event.type) ?? 0) + 1);
      if (event.pduCategory) {
        pduMap.set(
          event.pduCategory,
          (pduMap.get(event.pduCategory) ?? 0) + registrations,
        );
      }
      for (const registration of event.registrations) {
        const key = registration.createdAt.toISOString().slice(0, 10);
        const current = byDate.get(key) ?? { registrations: 0, revenue: 0 };
        current.registrations += 1;
        current.revenue += event.isFree ? 0 : price;
        byDate.set(key, current);
      }
      return {
        eventId: event.id,
        title: event.title,
        registrations,
        views: event.views,
        revenue,
        conversionRate:
          event.views > 0
            ? Number(((registrations / event.views) * 100).toFixed(2))
            : 0,
      };
    });
    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      avgFeePerAttendee:
        totalRegistrations > 0
          ? Number((totalRevenue / totalRegistrations).toFixed(2))
          : 0,
      conversionRate:
        totalViews > 0
          ? Number(((totalRegistrations / totalViews) * 100).toFixed(2))
          : 0,
      avgRating:
        ratingCount > 0 ? Number((ratingSum / ratingCount).toFixed(2)) : 0,
      registrationsOverTime: Array.from(byDate.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, value]) => ({
          date,
          registrations: value.registrations,
          revenue: Number(value.revenue.toFixed(2)),
        })),
      pdusByCategory: Array.from(pduMap.entries()).map(([label, count]) => ({
        label,
        count,
        value: count,
      })),
      eventTypeBreakdown: Array.from(typeMap.entries()).map(
        ([label, count]) => ({
          label,
          count,
          value: count,
        }),
      ),
      topPerformingEvents: topPerformingEvents
        .sort((a, b) => b.registrations - a.registrations)
        .slice(0, 10),
    };
  }

  async attendees(
    user: TUser,
    filter?: ProviderAttendeesFilterInput,
    pagination?: ProviderDashboardPaginationInput,
  ) {
    this.assertProvider(user);
    const take = pagination?.take ?? 20;
    const where: Prisma.EventRegistrationWhereInput = {
      event: {
        providerId: user.id,
      },
      ...(filter?.eventId ? { eventId: filter.eventId } : {}),
      ...(filter?.status ? { status: filter.status } : {}),
      ...(filter?.search
        ? {
            OR: [
              {
                user: {
                  fullName: {
                    contains: filter.search,
                    mode: "insensitive",
                  },
                },
              },
              {
                user: {
                  email: {
                    contains: filter.search,
                    mode: "insensitive",
                  },
                },
              },
              {
                event: {
                  title: {
                    contains: filter.search,
                    mode: "insensitive",
                  },
                },
              },
            ],
          }
        : {}),
    };
    const baseWhere: Prisma.EventRegistrationWhereInput = {
      event: {
        providerId: user.id,
      },
    };
    const [rows, totalCount, totalRegistered, confirmed, attended] =
      await Promise.all([
        this.prismaService.eventRegistration.findMany({
          where,
          take: take + 1,
          ...(pagination?.cursor
            ? { cursor: { id: pagination.cursor }, skip: 1 }
            : {}),
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
            event: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        }),
        this.prismaService.eventRegistration.count({ where }),
        this.prismaService.eventRegistration.count({
          where: baseWhere,
        }),
        this.prismaService.eventRegistration.count({
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
        this.prismaService.eventRegistration.count({
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
        nextCursor: hasNextPage ? items.at(-1)?.id : null,
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

  async eventsTable(
    user: TUser,
    filter?: ProviderEventsFilterInput,
    pagination?: ProviderDashboardPaginationInput,
  ) {
    this.assertProvider(user);
    const take = pagination?.take ?? 20;
    const where: Prisma.EventWhereInput = {
      providerId: user.id,
      deletedAt: null,
      ...(filter?.status ? { status: filter.status } : {}),
      ...(filter?.search
        ? { title: { contains: filter.search, mode: "insensitive" } }
        : {}),
    };
    const [items, totalCount] = await Promise.all([
      this.prismaService.event.findMany({
        where,
        take: take + 1,
        ...(pagination?.cursor
          ? { cursor: { id: pagination.cursor }, skip: 1 }
          : {}),
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { registrations: true },
          },
        },
      }),
      this.prismaService.event.count({ where }),
    ]);
    const hasNextPage = items.length > take;
    const sliced = items.slice(0, take);
    return {
      totalCount,
      pageInfo: {
        hasNextPage,
        nextCursor: hasNextPage ? sliced[sliced.length - 1]?.id : null,
      },
      items: sliced.map((event) => ({
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

  async submitPromotionRequest(
    user: TUser,
    input: SubmitPromotionRequestInput,
  ) {
    this.assertProvider(user);
    const event = await this.prismaService.event.findFirst({
      where: {
        id: input.eventId,
        providerId: user.id,
        deletedAt: null,
      },
    });
    if (!event)
      throw new NotFoundException(ProviderMessageCode.EVENT_NOT_FOUND);
    const existing = await this.prismaService.eventPromotionRequest.findFirst({
      where: {
        providerId: user.id,
        eventId: input.eventId,
        status: {
          in: [PromotionRequestStatus.PENDING, PromotionRequestStatus.APPROVED],
        },
      },
    });

    if (existing)
      throw new BadRequestException(
        ProviderMessageCode.PROMOTION_ALREADY_REQUEST,
      );

    return this.prismaService.eventPromotionRequest.create({
      data: {
        providerId: user.id,
        eventId: input.eventId,
        promotionType: input.promotionType,
        budget:
          input.budget !== undefined
            ? new Prisma.Decimal(input.budget)
            : undefined,
        note: input.note?.trim() || undefined,
      },
      include: {
        event: { select: { title: true } },
      },
    });
  }

  async promotionRequests(
    user: TUser,
    filter?: ProviderPromotionFilterInput,
    pagination?: ProviderDashboardPaginationInput,
  ) {
    this.assertProvider(user);
    const take = pagination?.take ?? 20;
    const search = filter?.search?.trim();
    const where: Prisma.EventPromotionRequestWhereInput = {
      providerId: user.id,
      ...(filter?.eventId ? { eventId: filter.eventId } : {}),
      ...(filter?.status ? { status: filter.status } : {}),
      ...(filter?.promotionType ? { promotionType: filter.promotionType } : {}),
      ...(search
        ? {
            OR: [
              {
                note: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                event: {
                  title: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            ],
          }
        : {}),
    };
    const [items, totalCount] = await Promise.all([
      this.prismaService.eventPromotionRequest.findMany({
        where,
        take: take + 1,
        ...(pagination?.cursor
          ? { cursor: { id: pagination.cursor }, skip: 1 }
          : {}),
        orderBy: { createdAt: "desc" },
        include: {
          event: {
            select: {
              title: true,
            },
          },
        },
      }),
      this.prismaService.eventPromotionRequest.count({ where }),
    ]);
    const hasNextPage = items.length > take;
    const sliced = items.slice(0, take);
    return {
      totalCount,
      pageInfo: {
        hasNextPage,
        nextCursor: hasNextPage ? sliced[sliced.length - 1]?.id : null,
      },
      items: sliced.map((item) => ({
        id: item.id,
        note: item.note,
        status: item.status,
        eventId: item.eventId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        providerId: item.providerId,
        eventTitle: item.event.title,
        rejectReason: item.rejectReason,
        promotionType: item.promotionType,
        budget: item.budget ? Number(item.budget) : null,
      })),
    };
  }

  async analyticsCsv(user: TUser, input?: ProviderDashboardRangeInput) {
    const analytics = await this.analytics(user, input);
    const rows = [
      ["Metric", "Value"],
      ["Total Revenue", analytics.totalRevenue],
      ["Avg Fee Per Attendee", analytics.avgFeePerAttendee],
      ["Conversion Rate", analytics.conversionRate],
      ["Avg Rating", analytics.avgRating],
      [],
      ["Top Event", "Registrations", "Views", "Revenue", "Conversion Rate"],
      ...analytics.topPerformingEvents.map((event) => [
        event.title,
        event.registrations,
        event.views,
        event.revenue,
        event.conversionRate,
      ]),
    ];
    return {
      filename: `provider-analytics-${Date.now()}.csv`,
      mimeType: "text/csv",
      content: rows.map((row) => row.join(",")).join("\n"),
    };
  }
}
