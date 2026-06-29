import { PaymentStatus, Prisma, Role } from "@prisma/client";
import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { ProfessionalSearchInput } from "@professional/dtos/professional-search.input";
import { ForbiddenException } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { TUser } from "@common/types/user.types";

@Injectable()
export class ProfessionalPaymentsService {
  constructor(private readonly prismaService: PrismaService) {}

  private assertProfessional(user: TUser) {
    if (user.role !== Role.PROFESSIONAL && user.role !== Role.ADMIN)
      throw new ForbiddenException("Professional access required.");
  }

  async payments(
    user: TUser,
    filter?: ProfessionalSearchInput,
    pagination?: ProfessionalPaginationInput,
  ) {
    this.assertProfessional(user);
    const take = pagination?.take ?? 12;
    const search = filter?.search?.trim();
    const where: Prisma.PaymentWhereInput = {
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
    const rows = await this.prismaService.payment.findMany({
      where,
      take: take + 1,
      ...(pagination?.cursor
        ? { cursor: { id: pagination.cursor }, skip: 1 }
        : {}),
      orderBy: { createdAt: "desc" },
    });
    const items = rows.slice(0, take);
    const overview = await this.prismaService.payment.aggregate({
      where: {
        userId: user.id,
        status: PaymentStatus.PAID,
      },
      _sum: { amount: true },
      _count: { id: true },
    });
    return {
      items,
      totalCount: await this.prismaService.payment.count({ where }),
      totalSpent: Number(overview._sum.amount ?? 0),
      totalTransactions: overview._count.id,
      pageInfo: {
        hasNextPage: rows.length > take,
        nextCursor: rows.length > take ? items.at(-1)?.id : null,
      },
    };
  }
}
