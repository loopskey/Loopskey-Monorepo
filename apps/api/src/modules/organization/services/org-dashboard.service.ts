import { OrganizationReportTopMembersFilterInput } from "@org/dtos/org-report-top-members-filter.input";
import { AssignmentStatus, EventStatus, Role } from "@prisma/client";
import { OrganizationMemberStatus, Prisma } from "@prisma/client";
import { OrganizationDashboardMessageCode } from "@org/enums/org-dashboard-message-code.enum";
import { UpdateOrganizationSettingsInput } from "@org/dtos/update-org-settings.input";
import { ForbiddenException, Injectable } from "@nestjs/common";
import { OrganizationReportFilterInput } from "@org/dtos/org-report-filter.input";
import { OrganizationPaginationInput } from "@org/dtos/org-pagination.input";
import { TOrganizationDashboardUser } from "@org/types/org-dashboard-service.types";
import { EventCatalogFilterInput } from "@org/dtos/event-catalog-filter.input";
import { NotFoundException } from "@nestjs/common";
import { PrismaService } from "@prisma/prisma.service";

@Injectable()
export class OrgDashboardService {
  constructor(private readonly prismaService: PrismaService) {}

  private assertOrganization(user: TOrganizationDashboardUser) {
    if (user.role !== Role.ORGANIZATION && user.role !== Role.ADMIN)
      throw new ForbiddenException("Professional access required.");
  }

  private async getOrganization(user: TOrganizationDashboardUser) {
    this.assertOrganization(user);
    const organization = await this.prismaService.organization.findFirst({
      where:
        user.role === Role.ADMIN
          ? { deletedAt: null }
          : { ownerId: user.id, deletedAt: null },
      select: {
        id: true,
        ownerId: true,
        name: true,
      },
    });
    if (!organization)
      throw new NotFoundException(
        OrganizationDashboardMessageCode.ORGANIZATION_NOT_FOUND,
      );
    return organization;
  }

  async overview(user: TOrganizationDashboardUser) {
    const org = await this.getOrganization(user);
    const settings = await this.prismaService.organizationSettings.findUnique({
      where: { organizationId: org.id },
      select: { minimumPdu: true },
    });
    const pduGoal = Number(settings?.minimumPdu ?? 60);
    const [
      totalMembers,
      activeMembers,
      activeAssignments,
      membersAgg,
      nonCompliantMembers,
      compliant,
      atRisk,
      critical,
      attentionRows,
      assignmentTopics,
    ] = await Promise.all([
      this.prismaService.organizationMember.count({
        where: { organizationId: org.id },
      }),
      this.prismaService.organizationMember.count({
        where: {
          organizationId: org.id,
          status: OrganizationMemberStatus.ACTIVE,
        },
      }),
      this.prismaService.organizationAssignment.count({
        where: {
          organizationId: org.id,
          status: AssignmentStatus.ACTIVE,
        },
      }),
      this.prismaService.organizationMember.aggregate({
        where: {
          organizationId: org.id,
          status: OrganizationMemberStatus.ACTIVE,
        },
        _avg: { compliance: true },
        _sum: { pdus: true },
      }),
      this.prismaService.organizationMember.count({
        where: {
          organizationId: org.id,
          status: OrganizationMemberStatus.ACTIVE,
          compliance: { lt: 70 },
        },
      }),
      this.prismaService.organizationMember.count({
        where: {
          organizationId: org.id,
          status: OrganizationMemberStatus.ACTIVE,
          compliance: { gte: 80 },
        },
      }),
      this.prismaService.organizationMember.count({
        where: {
          organizationId: org.id,
          status: OrganizationMemberStatus.ACTIVE,
          compliance: { gte: 50, lt: 80 },
        },
      }),
      this.prismaService.organizationMember.count({
        where: {
          organizationId: org.id,
          status: OrganizationMemberStatus.ACTIVE,
          compliance: { lt: 50 },
        },
      }),
      this.prismaService.organizationMember.findMany({
        where: {
          organizationId: org.id,
          status: OrganizationMemberStatus.ACTIVE,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              fullName: true,
              avatarUrl: true,
            },
          },
          department: {
            select: {
              title: true,
            },
          },
        },
        orderBy: [{ compliance: "asc" }, { pdus: "asc" }],
        take: 5,
      }),
      this.prismaService.organizationAssignment.findMany({
        where: {
          organizationId: org.id,
          createdAt: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
          },
        },
        include: {
          event: {
            select: {
              category: true,
              title: true,
            },
          },
          course: {
            select: {
              title: true,
            },
          },
          recipients: {
            select: {
              id: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
      }),
    ]);
    const totalPdus = Number(membersAgg._sum.pdus ?? 0);
    const averageCompliance = Number(membersAgg._avg.compliance ?? 0);
    const attentionMembers = attentionRows.map((member) => ({
      id: member.id,
      userId: member.userId,
      email: member.user.email,
      fullName: member.user.fullName,
      avatarUrl: member.user.avatarUrl,
      departmentTitle: member.department?.title ?? null,
      compliance: Number(member.compliance ?? 0),
      pdus: Number(member.pdus ?? 0),
      pduGoal,
      remainingPdus: Math.max(pduGoal - Number(member.pdus ?? 0), 0),
    }));
    const topicCounter = new Map<string, number>();
    for (const assignment of assignmentTopics) {
      const topic =
        assignment.event?.category ??
        assignment.event?.title ??
        assignment.course?.title ??
        "General Learning";
      const count = assignment.recipients.length || 1;
      topicCounter.set(topic, (topicCounter.get(topic) ?? 0) + count);
    }
    const totalTopicCount = Array.from(topicCounter.values()).reduce(
      (sum, value) => sum + value,
      0,
    );
    const trendingTopics = Array.from(topicCounter.entries())
      .map(([title, count]) => ({
        title,
        count,
        percentage: totalTopicCount > 0 ? (count / totalTopicCount) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    return {
      summary: {
        totalMembers,
        activeMembers,
        activeAssignments,
        nonCompliantMembers,
        averageCompliance,
        totalPdus,
        engagementRate:
          totalMembers > 0 ? Number((activeMembers / totalMembers) * 100) : 0,
      },
      complianceDistribution: {
        compliant,
        atRisk,
        nonCompliant: critical,
      },
      attentionMembers,
      trendingTopics,
    };
  }

  async settings(user: TOrganizationDashboardUser) {
    const org = await this.getOrganization(user);
    return this.prismaService.organizationSettings.upsert({
      where: { organizationId: org.id },
      create: { organizationId: org.id },
      update: {},
    });
  }

  async updateSettings(
    user: TOrganizationDashboardUser,
    input: UpdateOrganizationSettingsInput,
  ) {
    const org = await this.getOrganization(user);
    return this.prismaService.organizationSettings.upsert({
      where: { organizationId: org.id },
      create: {
        organizationId: org.id,
        ...input,
      },
      update: input,
    });
  }

  async eventCatalog(
    user: TOrganizationDashboardUser,
    filter?: EventCatalogFilterInput,
    pagination?: OrganizationPaginationInput,
  ) {
    await this.getOrganization(user);
    const take = pagination?.take ?? 12;
    const search = filter?.search?.trim();
    const where: Prisma.EventWhereInput = {
      deletedAt: null,
      status: EventStatus.PUBLISHED,
      registrationEnabled: true,
      ...(filter?.category ? { category: filter.category } : {}),
      ...(filter?.type ? { type: filter.type } : {}),
      ...(filter?.deliveryMode ? { deliveryMode: filter.deliveryMode } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { speaker: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const rows = await this.prismaService.event.findMany({
      where,
      take: take + 1,
      ...(pagination?.cursor
        ? { cursor: { id: pagination.cursor }, skip: 1 }
        : {}),
      orderBy: [{ startDate: "asc" }],
    });
    const items = rows.slice(0, take);
    return {
      items,
      totalCount: await this.prismaService.event.count({ where }),
      pageInfo: {
        hasNextPage: rows.length > take,
        nextCursor: rows.length > take ? items.at(-1)?.id : null,
      },
    };
  }

  private getReportDateRange(filter?: OrganizationReportFilterInput) {
    const now = new Date();
    if (filter?.range === "CUSTOM" && filter.startDate && filter.endDate)
      return {
        startDate: new Date(filter.startDate),
        endDate: new Date(filter.endDate),
      };
    if (filter?.range === "LAST_QUARTER") {
      const endDate = now;
      const startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 3);
      return { startDate, endDate };
    }
    const startDate = new Date(now.getFullYear(), 0, 1);
    const endDate = now;
    return { startDate, endDate };
  }

  async reports(
    user: TOrganizationDashboardUser,
    filter?: OrganizationReportFilterInput,
  ) {
    const org = await this.getOrganization(user);
    const { startDate, endDate } = this.getReportDateRange(filter);
    const memberWhere: Prisma.OrganizationMemberWhereInput = {
      organizationId: org.id,
      status: OrganizationMemberStatus.ACTIVE,
      ...(filter?.departmentId ? { departmentId: filter.departmentId } : {}),
      createdAt: {
        lte: endDate,
      },
    };
    const [membersAgg, settings, departments, members] = await Promise.all([
      this.prismaService.organizationMember.aggregate({
        where: memberWhere,
        _avg: { compliance: true, pdus: true },
        _sum: { pdus: true },
        _count: { id: true },
      }),
      this.prismaService.organizationSettings.findUnique({
        where: { organizationId: org.id },
        select: { minimumPdu: true },
      }),
      this.prismaService.organizationDepartment.findMany({
        where: {
          organizationId: org.id,
          ...(filter?.departmentId ? { id: filter.departmentId } : {}),
        },
        include: {
          members: {
            where: {
              status: OrganizationMemberStatus.ACTIVE,
            },
          },
        },
        orderBy: { title: "asc" },
      }),
      this.prismaService.organizationMember.findMany({
        where: memberWhere,
        select: {
          pdus: true,
          compliance: true,
          createdAt: true,
        },
        orderBy: { createdAt: "asc" },
      }),
    ]);
    const complianceTrend = this.buildComplianceTrend(
      members,
      startDate,
      endDate,
    );
    return {
      summary: {
        totalMembers: membersAgg._count.id,
        totalPdus: Number(membersAgg._sum.pdus ?? 0),
        averagePdus: Number(membersAgg._avg.pdus ?? 0),
        requiredHours: Number(settings?.minimumPdu ?? 0),
        averageCompliance: Number(membersAgg._avg.compliance ?? 0),
      },
      complianceTrend,
      departmentCompliance: departments.map((department) => {
        const activeMembers = department.members;
        const teamSize = activeMembers.length;
        const totalPdus = activeMembers.reduce(
          (sum, member) => sum + member.pdus,
          0,
        );
        const compliance =
          teamSize > 0
            ? activeMembers.reduce(
                (sum, member) => sum + member.compliance,
                0,
              ) / teamSize
            : 0;
        return {
          teamSize,
          totalPdus,
          compliance,
          departmentId: department.id,
          departmentTitle: department.title,
          averagePdus: teamSize > 0 ? totalPdus / teamSize : 0,
        };
      }),
    };
  }

  private buildComplianceTrend(
    members: { compliance: number; pdus: number; createdAt: Date }[],
    startDate: Date,
    endDate: Date,
  ) {
    const points: {
      label: string;
      date: string;
      compliance: number;
      pdus: number;
    }[] = [];
    const cursor = new Date(startDate);
    cursor.setDate(1);
    while (cursor <= endDate) {
      const month = cursor.getMonth();
      const year = cursor.getFullYear();
      const monthMembers = members.filter(
        (member) =>
          member.createdAt.getFullYear() === year &&
          member.createdAt.getMonth() === month,
      );
      const compliance =
        monthMembers.length > 0
          ? monthMembers.reduce((sum, member) => sum + member.compliance, 0) /
            monthMembers.length
          : 0;
      const pdus = monthMembers.reduce((sum, member) => sum + member.pdus, 0);
      points.push({
        label: cursor.toLocaleString("en-US", { month: "short" }),
        date: cursor.toISOString(),
        compliance,
        pdus,
      });

      cursor.setMonth(cursor.getMonth() + 1);
    }
    return points;
  }

  async reportTopMembers(
    user: TOrganizationDashboardUser,
    filter?: OrganizationReportTopMembersFilterInput,
    pagination?: OrganizationPaginationInput,
  ) {
    const org = await this.getOrganization(user);
    const take = pagination?.take ?? 10;
    const search = filter?.search?.trim();
    const where: Prisma.OrganizationMemberWhereInput = {
      organizationId: org.id,
      status: OrganizationMemberStatus.ACTIVE,
      ...(filter?.departmentId ? { departmentId: filter.departmentId } : {}),
      ...(search
        ? {
            OR: [
              { user: { fullName: { contains: search, mode: "insensitive" } } },
              { user: { email: { contains: search, mode: "insensitive" } } },
              { jobRole: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [rows, totalCount] = await Promise.all([
      this.prismaService.organizationMember.findMany({
        where,
        include: {
          user: true,
          department: true,
        },
        take: take + 1,
        ...(pagination?.cursor
          ? { cursor: { id: pagination.cursor }, skip: 1 }
          : {}),
        orderBy: [{ compliance: "desc" }, { pdus: "desc" }],
      }),
      this.prismaService.organizationMember.count({ where }),
    ]);
    const items = rows.slice(0, take).map((member) => ({
      id: member.id,
      pdus: member.pdus,
      userId: member.userId,
      email: member.user.email,
      compliance: member.compliance,
      fullName: member.user.fullName,
      completedLearning: member.completedLearning,
      departmentTitle: member.department?.title ?? null,
    }));
    return {
      items,
      totalCount,
      pageInfo: {
        hasNextPage: rows.length > take,
        nextCursor: rows.length > take ? items.at(-1)?.id : null,
      },
    };
  }
}
