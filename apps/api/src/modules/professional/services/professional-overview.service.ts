import { type ProfessionalEngagementApi } from "@contentAction/public/professional-engagement-api";
import { type ProfessionalIdentityApi } from "@user/public/professional-identity-api";
import { PROFESSIONAL_ENGAGEMENT_API } from "@contentAction/public/professional-engagement-api";
import { type ProfessionalCatalogApi } from "@course/public/professional-catalog-api";
import { PROFESSIONAL_IDENTITY_API } from "@user/public/professional-identity-api";
import { PROFESSIONAL_CATALOG_API } from "@course/public/professional-catalog-api";
import { Inject, Injectable } from "@nestjs/common";
import { ForbiddenException } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { PDUStatus } from "@prisma/client";
import { TUser } from "@common/types/user.types";
import { Role } from "@prisma/client";

@Injectable()
export class ProfessionalOverviewService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(PROFESSIONAL_IDENTITY_API)
    private readonly identity: ProfessionalIdentityApi,
    @Inject(PROFESSIONAL_ENGAGEMENT_API)
    private readonly engagement: ProfessionalEngagementApi,
    @Inject(PROFESSIONAL_CATALOG_API)
    private readonly catalog: ProfessionalCatalogApi,
  ) {}

  private assertProfessional(user: TUser) {
    if (user.role !== Role.PROFESSIONAL && user.role !== Role.ADMIN)
      throw new ForbiddenException("Professional access required.");
  }

  async overview(user: TUser) {
    this.assertProfessional(user);
    const year = new Date().getFullYear();
    const yearStart = new Date(Date.UTC(year, 0, 1));
    const yearEnd = new Date(Date.UTC(year + 1, 0, 1));
    const [
      profile,
      activeCourses,
      completedCourses,
      totalPduAgg,
      certificatesEarned,
      upcomingEvents,
      yearlyTargets,
    ] = await Promise.all([
      this.identity.profile(user.id),
      this.engagement.courseCounts(user.id).then((counts) => counts.active),
      this.engagement.courseCounts(user.id).then((counts) => counts.completed),
      this.prismaService.pDUActivity.aggregate({
        where: {
          userId: user.id,
          status: PDUStatus.APPROVED,
          date: { gte: yearStart, lt: yearEnd },
        },
        _sum: { pdus: true },
      }),
      this.prismaService.certificate.count({
        where: { userId: user.id },
      }),
      this.catalog.upcomingRegistrationCount(user.id),
      this.prismaService.pDUTarget.aggregate({
        where: {
          userId: user.id,
          year,
        },
        _sum: { target: true },
      }),
    ]);
    const totalPdus = Number(totalPduAgg._sum.pdus ?? 0);
    const target = Number(yearlyTargets._sum.target ?? 0);
    return {
      totalPdus,
      activeCourses,
      upcomingEvents,
      completedCourses,
      certificatesEarned,
      professionalName: profile?.fullName ?? "Professional",
      yearlyPduGoalProgress:
        target > 0 ? Math.min((totalPdus / target) * 100, 100) : 0,
    };
  }
}
