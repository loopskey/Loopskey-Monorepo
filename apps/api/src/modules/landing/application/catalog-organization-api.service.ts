import type {
  CatalogOrganizationApi,
  OrganizationEventCatalogQuery,
} from "@landing/public/catalog-organization-api";
import { Injectable, NotFoundException } from "@nestjs/common";
import {
  EventCategory,
  EventDeliveryMode,
  EventStatus,
  EventType,
  Prisma,
} from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";

@Injectable()
export class CatalogOrganizationApiService implements CatalogOrganizationApi {
  constructor(private readonly prisma: PrismaService) {}

  async assertAssignmentTarget(command: {
    readonly courseId?: string;
    readonly eventId?: string;
  }): Promise<void> {
    if (command.eventId) {
      const event = await this.prisma.event.findFirst({
        where: { id: command.eventId },
        select: { id: true },
      });
      if (!event) throw new NotFoundException("EVENT_NOT_FOUND");
    }
    if (command.courseId) {
      const course = await this.prisma.course.findFirst({
        where: { id: command.courseId },
        select: { id: true },
      });
      if (!course) throw new NotFoundException("COURSE_NOT_FOUND");
    }
  }

  async eventCatalog(query: OrganizationEventCatalogQuery) {
    const take = Math.min(Math.max(query.take, 1), 100);
    const where: Prisma.EventWhereInput = {
      deletedAt: null,
      status: EventStatus.PUBLISHED,
      registrationEnabled: true,
      category: query.category as EventCategory | undefined,
      type: query.type as EventType | undefined,
      deliveryMode: query.deliveryMode as EventDeliveryMode | undefined,
      OR: query.search
        ? [
            { title: { contains: query.search, mode: "insensitive" } },
            { description: { contains: query.search, mode: "insensitive" } },
            { speaker: { contains: query.search, mode: "insensitive" } },
          ]
        : undefined,
    };
    const [rows, totalCount] = await this.prisma.$transaction([
      this.prisma.event.findMany({
        where,
        take: take + 1,
        cursor: query.cursor ? { id: query.cursor } : undefined,
        skip: query.cursor ? 1 : 0,
        orderBy: [{ startDate: "asc" }],
      }),
      this.prisma.event.count({ where }),
    ]);
    const hasNextPage = rows.length > take;
    const items = rows.slice(0, take);
    return {
      items,
      totalCount,
      pageInfo: {
        hasNextPage,
        nextCursor: hasNextPage ? (items.at(-1)?.id ?? null) : null,
      },
    };
  }
}
