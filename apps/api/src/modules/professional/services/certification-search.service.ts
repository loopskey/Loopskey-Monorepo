import { ForbiddenException, Injectable } from "@nestjs/common";
import { CertificationSearchInput } from "@professional/dtos/certification-search.input";
import { ProfessionalMessageCode } from "@professional/enums/message-code.enum";
import { CertificationScore } from "@professional/types/professional-service.types";
import { PrismaService } from "@prisma/prisma.service";
import { Prisma, Role } from "@prisma/client";
import { TUser } from "@common/types/user.types";

const SIMILARITY_THRESHOLD = 0.2;

@Injectable()
export class CertificationSearchService {
  constructor(private readonly prismaService: PrismaService) {}

  private assertProfessional(user: TUser) {
    if (user.role !== Role.PROFESSIONAL && user.role !== Role.ADMIN)
      throw new ForbiddenException(
        ProfessionalMessageCode.PROFESSIONAL_ACCESS_REQUIRED,
      );
  }

  async search(user: TUser, input: CertificationSearchInput) {
    this.assertProfessional(user);
    const term = input.query.trim();
    const limit = input.limit ?? 8;
    if (!term) return [];
    const likeTerm = `%${term}%`;
    const scored = await this.prismaService.$queryRaw<CertificationScore[]>(
      Prisma.sql`
        SELECT c."id",
          GREATEST(
            similarity(lower(c."name"), lower(${term})),
            similarity(lower(c."abbreviation"), lower(${term})),
            similarity(lower(c."organization"), lower(${term})),
            similarity(lower(COALESCE(c."organizationAbbr", '')), lower(${term})),
            similarity(lower(COALESCE(c."association", '')), lower(${term}))
          ) AS score
        FROM "Certification" c
        WHERE
          lower(c."name") % lower(${term})
          OR lower(c."abbreviation") % lower(${term})
          OR lower(c."organization") % lower(${term})
          OR lower(COALESCE(c."organizationAbbr", '')) % lower(${term})
          OR lower(COALESCE(c."association", '')) % lower(${term})
          OR c."name" ILIKE ${likeTerm}
          OR c."abbreviation" ILIKE ${likeTerm}
          OR c."organization" ILIKE ${likeTerm}
          OR c."organizationAbbr" ILIKE ${likeTerm}
          OR c."association" ILIKE ${likeTerm}
        ORDER BY
          (CASE WHEN lower(c."abbreviation") = lower(${term}) THEN 1 ELSE 0 END) DESC,
          score DESC,
          c."name" ASC
        LIMIT ${limit}
      `,
    );

    const ranked = scored.filter(
      (row, index) => row.score >= SIMILARITY_THRESHOLD || index < limit,
    );
    if (!ranked.length) return [];
    const orderById = new Map(ranked.map((row, index) => [row.id, index]));
    const certifications = await this.prismaService.certification.findMany({
      where: { id: { in: ranked.map((row) => row.id) } },
      include: { categories: { orderBy: { order: "asc" } } },
    });
    return certifications.sort(
      (a, b) => (orderById.get(a.id) ?? 0) - (orderById.get(b.id) ?? 0),
    );
  }

  async findById(user: TUser, certificationId: string) {
    this.assertProfessional(user);
    return this.prismaService.certification.findUnique({
      where: { id: certificationId },
      include: { categories: { orderBy: { order: "asc" } } },
    });
  }
}
