import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { ProfessionalSearchInput } from "@professional/dtos/professional-search.input";
import { CreatePduActivityInput } from "@professional/dtos/create-pdu-activity.input";
import { UpsertPduTargetInput } from "@professional/dtos/upsert-pdu-target.input";
import { ForbiddenException } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { Prisma, Role } from "@prisma/client";
import { Injectable } from "@nestjs/common";
import { PDUStatus } from "@prisma/client";
import { TUser } from "@common/types/user.types";

@Injectable()
export class ProfessionalPduService {
  constructor(private readonly prismaService: PrismaService) {}

  private assertProfessional(user: TUser) {
    if (user.role !== Role.PROFESSIONAL && user.role !== Role.ADMIN)
      throw new ForbiddenException("Professional access required.");
  }

  async pduReport(user: TUser, year = new Date().getFullYear()) {
    this.assertProfessional(user);
    const start = new Date(Date.UTC(year, 0, 1));
    const end = new Date(Date.UTC(year + 1, 0, 1));
    const [total, activities, targets, byCategoryRaw] = await Promise.all([
      this.prismaService.pDUActivity.aggregate({
        where: {
          userId: user.id,
          status: PDUStatus.APPROVED,
          date: { gte: start, lt: end },
        },
        _sum: { pdus: true },
      }),
      this.prismaService.pDUActivity.count({
        where: {
          userId: user.id,
          date: { gte: start, lt: end },
        },
      }),
      this.prismaService.pDUTarget.findMany({
        where: { userId: user.id, year },
        orderBy: { category: "asc" },
      }),
      this.prismaService.pDUActivity.groupBy({
        by: ["category"],
        where: {
          userId: user.id,
          status: PDUStatus.APPROVED,
          date: { gte: start, lt: end },
        },
        _sum: { pdus: true },
        orderBy: {
          category: "asc",
        },
      }),
    ]);
    const totalTarget = targets.reduce((sum, item) => sum + item.target, 0);
    const totalPdus = Number(total._sum.pdus ?? 0);
    return {
      year,
      totalPdus,
      activities,
      averagePerMonth: Number((totalPdus / 12).toFixed(2)),
      progressToGoal:
        totalTarget > 0
          ? Number(Math.min((totalPdus / totalTarget) * 100, 100).toFixed(2))
          : 0,
      targets: targets.map((item) => ({
        id: item.id,
        year: item.year,
        target: item.target,
        category: item.category,
      })),
      byCategory: byCategoryRaw.map((item) => ({
        category: item.category,
        pdus: Number(item._sum.pdus ?? 0),
      })),
    };
  }

  async pduActivities(
    user: TUser,
    filter?: ProfessionalSearchInput,
    pagination?: ProfessionalPaginationInput,
  ) {
    this.assertProfessional(user);
    const take = pagination?.take ?? 12;
    const search = filter?.search?.trim();
    const where: Prisma.PDUActivityWhereInput = {
      userId: user.id,
      ...(search
        ? {
            title: {
              contains: search,
              mode: "insensitive",
            },
          }
        : {}),
    };
    const rows = await this.prismaService.pDUActivity.findMany({
      where,
      take: take + 1,
      ...(pagination?.cursor
        ? { cursor: { id: pagination.cursor }, skip: 1 }
        : {}),
      orderBy: { date: "desc" },
    });
    const items = rows.slice(0, take);
    return {
      items,
      totalCount: await this.prismaService.pDUActivity.count({ where }),
      pageInfo: {
        hasNextPage: rows.length > take,
        nextCursor: rows.length > take ? items.at(-1)?.id : null,
      },
    };
  }

  async createPduActivity(user: TUser, input: CreatePduActivityInput) {
    this.assertProfessional(user);
    return this.prismaService.pDUActivity.create({
      data: {
        userId: user.id,
        ...input,
        date: new Date(input.date),
      },
    });
  }

  async upsertPduTarget(user: TUser, input: UpsertPduTargetInput) {
    this.assertProfessional(user);
    return this.prismaService.pDUTarget.upsert({
      where: {
        userId_year_category: {
          userId: user.id,
          year: input.year,
          category: input.category,
        },
      },
      create: {
        userId: user.id,
        year: input.year,
        category: input.category,
        target: input.target,
      },
      update: {
        target: input.target,
      },
    });
  }
}
