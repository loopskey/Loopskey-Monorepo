import { EventRegistrationStatus } from "@prisma/client";
import { ContentEnrollmentStatus } from "@prisma/client";
import { ContentType, PDUStatus } from "@prisma/client";
import { ForbiddenException } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { TUser } from "@common/types/user.types";
import { Role } from "@prisma/client";

@Injectable()
export class ProfessionalOverviewService {
  constructor(private readonly prismaService: PrismaService) {}

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
      this.prismaService.user.findUnique({
        where: { id: user.id },
        select: { fullName: true },
      }),
      this.prismaService.contentEnrollment.count({
        where: {
          userId: user.id,
          contentType: ContentType.COURSE,
          status: ContentEnrollmentStatus.ACTIVE,
        },
      }),
      this.prismaService.contentEnrollment.count({
        where: {
          userId: user.id,
          contentType: ContentType.COURSE,
          status: ContentEnrollmentStatus.COMPLETED,
        },
      }),
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
      this.prismaService.eventRegistration.count({
        where: {
          userId: user.id,
          status: EventRegistrationStatus.REGISTERED,
          event: {
            startDate: { gte: new Date() },
            deletedAt: null,
          },
        },
      }),
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
