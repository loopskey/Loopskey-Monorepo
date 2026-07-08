import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { ProfessionalCalendarEventsFilterInput } from "@professional/dtos/professional-calendar-filter.input";
import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { CreateCalendarEventInput } from "@professional/dtos/create-calendar-event.input";
import { TCalculateCalendar } from "@professional/types/professional-service.types";
import { PrismaService } from "@prisma/prisma.service";
import { Prisma, Role } from "@prisma/client";
import { Injectable } from "@nestjs/common";
import { TUser } from "@common/types/user.types";

@Injectable()
export class ProfessionalCalendarService {
  constructor(private readonly prismaService: PrismaService) {}

  private assertProfessional(user: TUser) {
    if (user.role !== Role.PROFESSIONAL) {
      throw new ForbiddenException(
        "Only professional users can access this resource.",
      );
    }
  }

  private calculateCalendarMeta(event?: TCalculateCalendar) {
    if (!event) {
      return {
        isUpcoming: false,
        isLive: false,
        isPast: false,
        durationMinutes: 0,
        startsInMinutes: null,
      };
    }
    const now = new Date();
    const startDate = new Date(event.startDate);
    const endDate = event.endDate ? new Date(event.endDate) : startDate;
    const isUpcoming = startDate.getTime() > now.getTime();
    const isLive =
      startDate.getTime() <= now.getTime() &&
      endDate.getTime() >= now.getTime();
    const isPast = endDate.getTime() < now.getTime();
    const durationMinutes = Math.max(
      Math.round((endDate.getTime() - startDate.getTime()) / 60000),
      0,
    );
    const startsInMinutes = isUpcoming
      ? Math.round((startDate.getTime() - now.getTime()) / 60000)
      : null;
    return {
      isLive,
      isPast,
      isUpcoming,
      durationMinutes,
      startsInMinutes,
    };
  }

  async calendarEvents(
    user: TUser,
    filter?: ProfessionalCalendarEventsFilterInput,
    pagination?: ProfessionalPaginationInput,
  ) {
    this.assertProfessional(user);
    const take = pagination?.take ?? 12;
    const search = filter?.search?.trim();
    const eventWhere: Prisma.EventWhereInput = {
      deletedAt: null,
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { location: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(filter?.deliveryMode
        ? {
            deliveryMode: filter.deliveryMode,
          }
        : {}),
      ...(filter?.from || filter?.to
        ? {
            startDate: {
              ...(filter.from ? { gte: filter.from } : {}),
              ...(filter.to ? { lte: filter.to } : {}),
            },
          }
        : {}),
    };
    const where: Prisma.EventRegistrationWhereInput = {
      userId: user.id,
      ...(filter?.status ? { status: filter.status } : {}),
      event: eventWhere,
    };
    const rows = await this.prismaService.eventRegistration.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            pdu: true,
            slug: true,
            type: true,
            title: true,
            endDate: true,
            location: true,
            timezone: true,
            startDate: true,
            onlineUrl: true,
            deliveryMode: true,
          },
        },
      },
      take: take + 1,
      ...(pagination?.cursor
        ? {
            cursor: { id: pagination.cursor },
            skip: 1,
          }
        : {}),
      orderBy: {
        event: {
          startDate: "asc",
        },
      },
    });
    const items = rows.slice(0, take);
    const totalCount = await this.prismaService.eventRegistration.count({
      where,
    });
    return {
      totalCount,
      items: items.map((item) => {
        const meta = this.calculateCalendarMeta(item.event);
        return {
          ...item,
          ...meta,
        };
      }),
      pageInfo: {
        hasNextPage: rows.length > take,
        nextCursor: rows.length > take ? items.at(-1)?.id : null,
      },
    };
  }

  async myCalendarEntries(user: TUser) {
    this.assertProfessional(user);
    const rows = await this.prismaService.calendarEvent.findMany({
      where: { userId: user.id },
      orderBy: { startDate: "asc" },
    });
    return rows.map((row) => {
      const meta = this.calculateCalendarMeta(row);
      return {
        ...row,
        isPast: meta.isPast,
        isLive: meta.isLive,
        isUpcoming: meta.isUpcoming,
        startsInMinutes: meta.startsInMinutes,
        durationMinutes: row.durationMinutes ?? meta.durationMinutes,
      };
    });
  }

  async createCalendarEvent(user: TUser, input: CreateCalendarEventInput) {
    this.assertProfessional(user);
    const row = await this.prismaService.calendarEvent.create({
      data: {
        userId: user.id,
        title: input.title,
        type: input.type,
        startDate: new Date(input.startDate),
        endDate: input.endDate ? new Date(input.endDate) : null,
        durationMinutes: input.durationMinutes ?? null,
        notes: input.notes ?? null,
        contentId: input.contentId ?? null,
        contentType: input.contentType ?? null,
      },
    });
    const meta = this.calculateCalendarMeta(row);
    return {
      ...row,
      isPast: meta.isPast,
      isLive: meta.isLive,
      isUpcoming: meta.isUpcoming,
      startsInMinutes: meta.startsInMinutes,
      durationMinutes: row.durationMinutes ?? meta.durationMinutes,
    };
  }

  async deleteCalendarEvent(user: TUser, id: string) {
    this.assertProfessional(user);
    const existing = await this.prismaService.calendarEvent.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) throw new NotFoundException("Calendar event not found.");
    await this.prismaService.calendarEvent.delete({ where: { id } });
    return { id };
  }
}
