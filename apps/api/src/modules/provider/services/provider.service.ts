import { ProviderDashboardPaginationInput } from "@provider/dtos/provider-pagination.input";
import { Injectable, NotFoundException } from "@nestjs/common";
import { ProviderAttendeesFilterInput } from "@provider/dtos/provider-attendees-filter.input";
import { ProviderPromotionFilterInput } from "@provider/dtos/provider-promotion-filter.input";
import { SubmitPromotionRequestInput } from "@provider/dtos/submit-promotion-request.input";
import { UpdateProviderSettingsInput } from "@provider/dtos/update-provider-setting.input";
import { ProviderDashboardRangeInput } from "@provider/dtos/provider-range.input";
import { ProviderEventsFilterInput } from "@provider/dtos/provider-events-filter.input";
import { type IdentityProfileApi } from "@user/public/identity-profile-api";
import { PromotionRequestStatus } from "@prisma/client";
import { ProviderDashboardRange } from "@provider/enums/provider-register.enum";
import { IDENTITY_PROFILE_API } from "@user/public/identity-profile-api";
import { BadRequestException } from "@nestjs/common";
import { ProviderMessageCode } from "@provider/enums/message-code.enum";
import { ForbiddenException } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { Prisma, Role } from "@prisma/client";
import { EVENTS_API } from "@events/public/events-api.token";
import { EventsApi } from "@events/public/events-api";
import { Inject } from "@nestjs/common";
import { TUser } from "@common/types/user.types";

@Injectable()
export class ProviderService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(EVENTS_API) private readonly eventsApi: EventsApi,
    @Inject(IDENTITY_PROFILE_API)
    private readonly identityApi: IdentityProfileApi,
  ) {}

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
    const provider = await this.identityApi.display(user.id);
    const metrics = await this.eventsApi.providerOverview(user.id, start, end);
    const { totalEvents, totalRegistrations, totalViews, upcomingSessions } =
      metrics;
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
        published: metrics.published,
        draft: metrics.draft,
        archived: metrics.archived,
        cancelled: metrics.cancelled,
      },
      upcomingSessions,
    };
  }

  async analytics(user: TUser, input?: ProviderDashboardRangeInput) {
    this.assertProvider(user);
    const { start, end } = this.getRangeDates(input?.range);
    const events = await this.eventsApi.providerAnalyticsEvents(
      user.id,
      start,
      end,
    );
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
    return this.eventsApi.providerAttendees({
      providerId: user.id,
      eventId: filter?.eventId,
      status: filter?.status,
      search: filter?.search,
      cursor: pagination?.cursor,
      take: pagination?.take ?? 20,
    });
  }

  async eventsTable(
    user: TUser,
    filter?: ProviderEventsFilterInput,
    pagination?: ProviderDashboardPaginationInput,
  ) {
    this.assertProvider(user);
    return this.eventsApi.providerEvents({
      providerId: user.id,
      status: filter?.status,
      search: filter?.search,
      cursor: pagination?.cursor,
      take: pagination?.take ?? 20,
    });
  }

  async submitPromotionRequest(
    user: TUser,
    input: SubmitPromotionRequestInput,
  ) {
    this.assertProvider(user);
    try {
      await this.eventsApi.assertProviderOwnsEvent(user.id, input.eventId);
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(ProviderMessageCode.EVENT_NOT_FOUND);
      throw error;
    }
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
