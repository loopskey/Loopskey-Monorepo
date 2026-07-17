import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { ProfessionalPduActivityFilterInput } from "@professional/dtos/professional-pdu-activity-filter.input";
import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { ContentType, Prisma, Role } from "@prisma/client";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { CreatePduActivityInput } from "@professional/dtos/create-pdu-activity.input";
import { UpdatePduActivityInput } from "@professional/dtos/update-pdu-activity.input";
import { UpsertPduTargetInput } from "@professional/dtos/upsert-pdu-target.input";
import { Injectable, Logger } from "@nestjs/common";
import { getPduUploadDir } from "@professional/enums/pdu-file.constant";
import { PrismaService } from "@prisma/prisma.service";
import { PDUStatus } from "@prisma/client";
import { unlink } from "fs/promises";
import { TUser } from "@common/types/user.types";
import { join } from "path";

const MONTHS_PER_YEAR = 12;

const COUNTED_STATUS: Prisma.EnumPDUStatusFilter = { not: PDUStatus.REJECTED };

@Injectable()
export class ProfessionalPduService {
  private readonly logger = new Logger(ProfessionalPduService.name);

  constructor(private readonly prismaService: PrismaService) {}

  private assertProfessional(user: TUser) {
    if (user.role !== Role.PROFESSIONAL && user.role !== Role.ADMIN)
      throw new ForbiddenException(
        ProfessionalMessageCode.PROFESSIONAL_ACCESS_REQUIRED,
      );
  }

  private yearWindow(year: number) {
    return {
      start: new Date(Date.UTC(year, 0, 1)),
      end: new Date(Date.UTC(year + 1, 0, 1)),
    };
  }

  private async findOwnedActivity(user: TUser, activityId: string) {
    const activity = await this.prismaService.pDUActivity.findFirst({
      where: { id: activityId, userId: user.id },
      include: { evidenceFiles: { orderBy: { createdAt: "asc" } } },
    });
    if (!activity)
      throw new NotFoundException(
        ProfessionalMessageCode.PDU_ACTIVITY_NOT_FOUND,
      );
    return activity;
  }

  async pduReport(user: TUser, year = new Date().getFullYear()) {
    this.assertProfessional(user);
    const { start, end } = this.yearWindow(year);
    const [total, activities, targets, byCategoryRaw, countedRows] =
      await Promise.all([
        this.prismaService.pDUActivity.aggregate({
          where: {
            userId: user.id,
            status: COUNTED_STATUS,
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
            status: COUNTED_STATUS,
            date: { gte: start, lt: end },
          },
          _sum: { pdus: true },
          orderBy: {
            category: "asc",
          },
        }),
        this.prismaService.pDUActivity.findMany({
          where: {
            userId: user.id,
            status: COUNTED_STATUS,
            date: { gte: start, lt: end },
          },
          select: { date: true, pdus: true },
        }),
      ]);
    const totalTarget = targets.reduce((sum, item) => sum + item.target, 0);
    const totalPdus = Number(total._sum.pdus ?? 0);

    const monthlyTotals = new Array<number>(MONTHS_PER_YEAR).fill(0);
    for (const row of countedRows)
      monthlyTotals[row.date.getUTCMonth()] += row.pdus;

    return {
      year,
      totalPdus,
      activities,
      averagePerMonth: Number((totalPdus / MONTHS_PER_YEAR).toFixed(2)),
      progressToGoal:
        totalTarget > 0
          ? Number(((totalPdus / totalTarget) * 100).toFixed(2))
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
      byMonth: monthlyTotals.map((pdus, index) => ({
        month: index + 1,
        pdus: Number(pdus.toFixed(2)),
      })),
    };
  }

  private buildActivityWhere(
    user: TUser,
    filter?: ProfessionalPduActivityFilterInput,
  ): Prisma.PDUActivityWhereInput {
    const search = filter?.search?.trim();
    const dateFrom = filter?.dateFrom ? new Date(filter.dateFrom) : undefined;
    const dateTo = filter?.dateTo ? new Date(filter.dateTo) : undefined;

    return {
      userId: user.id,
      ...(filter?.activityType ? { source: filter.activityType } : {}),
      ...(filter?.creditType ? { creditType: filter.creditType } : {}),
      ...(filter?.category ? { category: filter.category } : {}),
      ...(filter?.completionStatus
        ? { completionStatus: filter.completionStatus }
        : {}),
      ...(filter?.reportingYear ? { reportingYear: filter.reportingYear } : {}),
      ...(dateFrom || dateTo
        ? {
            date: {
              ...(dateFrom ? { gte: dateFrom } : {}),
              ...(dateTo ? { lte: dateTo } : {}),
            },
          }
        : {}),
      ...(filter?.hasCertificate === undefined
        ? {}
        : filter.hasCertificate
          ? { evidenceFiles: { some: {} } }
          : { evidenceFiles: { none: {} } }),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" as const } },
              {
                description: { contains: search, mode: "insensitive" as const },
              },
              {
                providerOrganizer: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                issuingOrganization: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                evidenceNote: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                relatedCertification: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                subCategory: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
              {
                learningOutcome: {
                  contains: search,
                  mode: "insensitive" as const,
                },
              },
            ],
          }
        : {}),
    };
  }

  async pduActivities(
    user: TUser,
    filter?: ProfessionalPduActivityFilterInput,
    pagination?: ProfessionalPaginationInput,
  ) {
    this.assertProfessional(user);
    const take = pagination?.take ?? 12;
    const where = this.buildActivityWhere(user, filter);
    const rows = await this.prismaService.pDUActivity.findMany({
      where,
      take: take + 1,
      ...(pagination?.cursor
        ? { cursor: { id: pagination.cursor }, skip: 1 }
        : {}),
      orderBy: { date: "desc" },
      include: { evidenceFiles: { orderBy: { createdAt: "asc" } } },
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

  async pduActivity(user: TUser, activityId: string) {
    this.assertProfessional(user);
    return this.findOwnedActivity(user, activityId);
  }

  async contentCompletion(
    user: TUser,
    contentType: ContentType,
    contentId: string,
  ) {
    this.assertProfessional(user);
    return this.prismaService.pDUActivity.findFirst({
      where: { userId: user.id, contentType, contentId },
      include: { evidenceFiles: { orderBy: { createdAt: "asc" } } },
    });
  }

  async createPduActivity(user: TUser, input: CreatePduActivityInput) {
    this.assertProfessional(user);
    const { date, contentId, contentType, ...rest } = input;

    if (contentId && contentType) {
      const existing = await this.prismaService.pDUActivity.findFirst({
        where: { userId: user.id, contentType, contentId },
        select: { id: true },
      });
      if (existing)
        return this.prismaService.pDUActivity.update({
          where: { id: existing.id },
          data: { ...rest, contentId, contentType, date: new Date(date) },
          include: { evidenceFiles: { orderBy: { createdAt: "asc" } } },
        });
    }

    return this.prismaService.pDUActivity.create({
      data: {
        userId: user.id,
        ...rest,
        contentId,
        contentType,
        date: new Date(date),
      },
      include: { evidenceFiles: true },
    });
  }

  async updatePduActivity(user: TUser, input: UpdatePduActivityInput) {
    this.assertProfessional(user);
    const { activityId, date, ...rest } = input;
    await this.findOwnedActivity(user, activityId);
    return this.prismaService.pDUActivity.update({
      where: { id: activityId },
      data: {
        ...rest,
        ...(date ? { date: new Date(date) } : {}),
      },
      include: { evidenceFiles: { orderBy: { createdAt: "asc" } } },
    });
  }

  async deletePduActivity(user: TUser, activityId: string) {
    this.assertProfessional(user);
    const activity = await this.findOwnedActivity(user, activityId);
    // The DB cascade removes the file rows; the blobs on disk are ours to clean up.
    await this.prismaService.pDUActivity.delete({ where: { id: activityId } });
    await this.removeEvidenceBlobs(
      activity.evidenceFiles.map((file) => file.storageKey),
    );
    return { id: activityId };
  }

  async removeEvidenceBlobs(storageKeys: string[]) {
    const uploadDir = getPduUploadDir();
    await Promise.all(
      storageKeys.map(async (storageKey) => {
        try {
          await unlink(join(uploadDir, storageKey));
        } catch (error) {
          this.logger.warn(
            `Failed to remove evidence blob ${storageKey}: ${String(error)}`,
          );
        }
      }),
    );
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
