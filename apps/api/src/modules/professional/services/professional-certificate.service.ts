import { ProfessionalPaginationInput } from "@professional/dtos/professional-pagination.input";
import { ProfessionalSearchInput } from "@professional/dtos/professional-search.input";
import { ForbiddenException } from "@nestjs/common";
import { CertificateStatus } from "@prisma/client";
import { PrismaService } from "@prisma/prisma.service";
import { Prisma, Role } from "@prisma/client";
import { Injectable } from "@nestjs/common";
import { TUser } from "@common/types/user.types";

@Injectable()
export class ProfessionalCertificatesService {
  constructor(private readonly prismaService: PrismaService) {}

  private assertProfessional(user: TUser) {
    if (user.role !== Role.PROFESSIONAL && user.role !== Role.ADMIN)
      throw new ForbiddenException("Professional access required.");
  }

  async certificates(
    user: TUser,
    filter?: ProfessionalSearchInput,
    pagination?: ProfessionalPaginationInput,
  ) {
    this.assertProfessional(user);
    const take = pagination?.take ?? 12;
    const search = filter?.search?.trim();
    const where: Prisma.CertificateWhereInput = {
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

    const rows = await this.prismaService.certificate.findMany({
      where,
      take: take + 1,
      ...(pagination?.cursor
        ? { cursor: { id: pagination.cursor }, skip: 1 }
        : {}),
      orderBy: { issuedAt: "desc" },
    });
    const items = rows.slice(0, take);
    const [total, active, totalPdus] = await Promise.all([
      this.prismaService.certificate.count({ where: { userId: user.id } }),
      this.prismaService.certificate.count({
        where: { userId: user.id, status: CertificateStatus.ACTIVE },
      }),
      this.prismaService.certificate.aggregate({
        where: { userId: user.id },
        _sum: { pduEarned: true },
      }),
    ]);
    return {
      items,
      totalCount: await this.prismaService.certificate.count({ where }),
      totalCertificates: total,
      activeCertificates: active,
      totalPdusEarned: Number(totalPdus._sum.pduEarned ?? 0),
      pageInfo: {
        hasNextPage: rows.length > take,
        nextCursor: rows.length > take ? items.at(-1)?.id : null,
      },
    };
  }
}
